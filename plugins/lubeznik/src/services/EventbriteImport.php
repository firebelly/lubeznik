<?php
/**
 * Lubeznik plugin for Craft CMS 3.x
 *
 * Firebelly plugin for Lubeznik
 *
 * @link      https://firebellydesign.com/
 * @copyright Copyright (c) 2020 Firebelly
 */

namespace firebelly\lubeznik\services;

use firebelly\lubeznik\Lubeznik;
use firebelly\lubeznik\base\SectionImport;

use Craft;
use craft\base\Component;
use craft\elements\Entry;
use craft\elements\Asset;
use craft\elements\Category;
use craft\records\EntryType;
use craft\mail\Message;
// use verbb\supertable\SuperTable;
use yii\db\Expression;

use jamiehollern\eventbrite\Eventbrite; // see https://github.com/jamiehollern/eventbrite

/**
 * EventbriteImport Service
 *
 * All of your plugin’s business logic should go in services, including saving data,
 * retrieving data, etc. They provide APIs that your controllers, template variables,
 * and other plugins can interact with.
 *
 * https://craftcms.com/docs/plugins/services
 *
 * @author    Firebelly
 * @package   Lubeznik
 * @since     1.0.0
 */
class EventbriteImport extends Component
{
    private $log = '';
    private $summary = [];
    private $categoriesCache = [];
    private $importMode = 'basic';
    private $eventbriteAPI;
    private $eventsImport;

    /**
     * Returns log records for /admin/lubeznik/logs template
     * @return [array] active records
     */
    // public function getLubenikLogs()
    // {
    //     $logs = LubeznikLog::find()->orderBy('dateCreated DESC')->all();
    //     return $logs;
    // }

    /**
     * Import Events
     *
     * Lubeznik::$plugin->eventbriteImport->importEvents()
     */
    public function importEvents($importMode)
    {
        $this->eventbriteAPI = new Eventbrite(getenv('EVENTBRITE_OAUTH_TOKEN'));
        $this->eventsImport = new SectionImport('Events');
        $this->importMode = $importMode;
        $this->eventsImport->setImportMode($this->importMode);
        $timeStart = microtime(true);

        try {

            // Get org info (shows ID)
            // var_dump($this->eventbriteAPI->get('users/me/organizations')); exit;

            // Get all user events
            $events = $this->eventbriteAPI->get(sprintf('organizations/%d/events', getenv('EVENTBRITE_ORGANIZATION_ID')));
            // var_dump($events); exit;
            // add ['expand' => 'format'] for:
            // 'format' =>
            //     'name' => string 'Seminar or Talk' (length=15)
            //     'short_name' => string 'Seminar' (length=7)

            $this->summary[] = 'Eventbrite API: '.count($events['body']['events']).' total events found';

            // Process events, adding new events
            $this->processEvents($events['body']['events']);

            // Loop through the rest of the pages (if any)
            while ($events['body']['pagination']['has_more_items']) {
                try {
                    $events = $this->eventbriteAPI->get(sprintf('organizations/%d/events', getenv('EVENTBRITE_ORGANIZATION_ID')), ['continuation' => $events['body']['pagination']['continuation']]);
                    $this->summary[] = 'Eventbrite API: processing page '.(++$page).' of '.$events['body']['pagination']['page_count'];
                    $this->processEvents($events['body']['events']);
                } catch ( Exception $e ) {
                    $this->bomb('<li>Error fetching paginated events: '.$e->getMessage().'</li>');
                }
            }

        } catch ( Exception $e ) {
            $this->bomb('<li>Error fetching events: '.$e->getMessage().'</li>');
        }

        list($log, $summary) = $this->eventsImport->finish();
        $this->log .= $log;
        $this->summary = array_merge($summary, $this->summary);

        $execTime = sprintf('%.2f', (microtime(true) - $timeStart));

        return (object) [
            'log'      => $this->log,
            'summary'  => implode(', ', $this->summary),
            'execTime' => $execTime,
        ];
    }

    /**
     * Process a batch of Eventbrite API events
     */
    private function processEvents($events)
    {
        foreach ($events as $event ) {

            // If event status is not "started" or "live" or "completed"
            // if (!in_array($event['status'], ['started', 'live', 'completed'])) {
            //     $this->summary[] = 'Event status is '.$event['status'].' so skipping: '.$event['name']['text'];
            //     $this->eventsImport->skipped++;
            //     continue;
            // }

            $entry = Entry::find()->section('events')->status(null)->eventbriteId($event['id'])->one();

            $fields = [];
            if (!$entry) {
                $entry = $this->makeNewEntry('events');
                $entry->title = $event['name']['text'];
                $actionVerb = 'added';
            } else {
                // Existing entry
                $actionVerb = 'updated';
                // Update title if refreshing import mode
                if ($this->importMode == 'refresh') {
                    $entry->title = $event['name']['text'];
                }
            }

            // Get Event Type
            // Todo: find more robust way to determine if "class" or "event"
            $eventTypeIds = [];
            $eventType = preg_match('/(workshop|class)/i', $event['name']['text']) ? 'class' : 'event';
            if ($category = $this->getCategory('eventType', $eventType)) {
                $eventTypeIds[] = $category->id;
            }

            // Todo: figure out how to identify audience
            // audience (category audience)
            // Todo: figure out how to identify multisession?

            // Special actions if adding new entry, or we're doing a refresh
            if ($actionVerb == 'added' || ($this->importMode == 'refresh')) {
                $fields = array_merge([
                    'body'          => $this->formatText($event['summary']),
                    'time'          => date('g:i a', strtotime($event['start']['local'])), // "Time" is a human-edited format e.g. "11:00 AM via Google Classroom"
                    'eventbriteId'  => $event['id'],
                    'eventbriteUrl' => $event['url'],
                    'eventType'     => $eventTypeIds,
                ], $fields);
            }

            $fields = array_merge([
                'dateStart' => date('Y-m-d H:i:s', strtotime($event['start']['local'])),
                'dateEnd'   => date('Y-m-d H:i:s', strtotime($event['end']['local'])),
                'online'    => $event['online_event'],
            ], $fields);

            $entry->setFieldValues($fields);

            // Set to disabled if status=draft
            $entry->enabled = ($event['status'] !== 'draft');

            if(Craft::$app->getElements()->saveElement($entry)) {
                $this->eventsImport->saved($entry, $actionVerb);
            } else {
                $this->bomb('<li>Save error: '.print_r($entry->getErrors(), true).'</li>');
            }
        }
    }

    /**
     * Init a new Entry with type attributes
     * @param  string $entryType Slug of entry type
     * @return object             New Entry object
     */
    private function makeNewEntry(string $entryType)
    {
        $entryType = EntryType::find()->where(['handle' => $entryType])->one();
        $entry = new Entry();
        $entry->sectionId = $entryType->getAttribute('sectionId');
        $entry->typeId = $entryType->getAttribute('id');
        $entry->authorId = 1;
        return $entry;
    }

    /**
     * Strip out crappy inline styles, unneeded classes, empty span/divs left behind, and images
     * @param $text
     * @return string
     */
    private function formatText($text)
    {
        if (strip_tags($text) == $text) {
            $text = preg_replace('/ style="(.*?)"/i', '', $text);
            $text = preg_replace('/ class="(.*?)"/i', '', $text);
            $text = preg_replace('~<[\/]?(div|span)>~i', '', $text);
            $text = preg_replace('~<p>\s+</p>~i', '', $text);
            $text = preg_replace('~<p>&nbsp;</p>~i', '', $text);
            $text = preg_replace('~<br( /)?>~i', "\n", $text);
        }
        return $text;
    }

    /**
     * Error was triggered, email dev and log warning
     * @param  string $message info about the error
     */
    private function bomb(string $message)
    {
        Craft::warning($message);
        if (!Craft::$app->getConfig()->general->devMode) {
            $this->sendMail($message, 'Lubeznik error', 'nate@firebellydesign.com');
        }
        throw new \Exception($message);
    }

    /**
     * Send an email
     * @param string $message
     * @param string $subject
     * @param string $toEmail
     * @return bool
     */
    private function sendMail(string $message, string $subject, string $toEmail): bool
    {
        $settings = Craft::$app->getSystemSettings()->getSettings('email');
        $message = new Message();
        $message->setFrom([$settings['fromEmail'] => $settings['fromName']]);
        $message->setTo($toEmail);
        $message->setSubject($subject);
        $message->setHtmlBody($message);
        return Craft::$app->getMailer()->send($message);
    }

    /**
     * Find Asset by filename
     * @param  string $filename   Name of file
     * @return array              Craft image asset ID
     */
    private function getAssetIDByFilename($filename)
    {
        if (empty($filename)) {
            return [];
        }
        $filename = basename(trim($filename));
        # $filename = preg_replace('/(tif|jpg|psd)$/i','jpg', $filename);
        $image = Asset::find()->where([
            'filename' => $filename,
        ])->one();
        return $image ? [$image->id] : [];
    }

    /**
     * Get category of entry
     * @param string   $categoryGroupHandle category group handle
     * @param string   $categoryTitle        category title
     */
    private function getCategory(string $categoryGroupHandle, string $categoryTitle)
    {
        if (empty($categoryTitle) || empty($categoryGroupHandle)) return;
        // Populate category cache array for category handle if not set
        if (empty($this->categoriesCache[$categoryGroupHandle])) {
            $this->categoriesCache[$categoryGroupHandle] = [];
        }
        // Check if category is cached
        if (!empty($this->categoriesCache[$categoryGroupHandle][$categoryTitle])) {
            return $this->categoriesCache[$categoryGroupHandle][$categoryTitle];
        }
        $categoryGroup = Craft::$app->getCategories()->getGroupByHandle($categoryGroupHandle);
        $category = Category::find()->where([
            'title' => $categoryTitle,
            'groupId' => $categoryGroup->id,
        ])->one();
        // Cache category for subsequent lookups
        $this->categoriesCache[$categoryGroupHandle][$categoryTitle] = $category;
        return $category;
    }


}
