<?php
/**
 * Lubeznik plugin for Craft CMS 3.x
 *
 * Firebelly plugin for Lubeznik — console commands
 *
 * @link      https://www.firebellydesign.com/
 * @copyright Copyright (c) 2018 Firebelly Design
 */

namespace firebelly\lubeznik\console\controllers;

use firebelly\lubeznik\Lubeznik;

use Craft;
use yii\console\Controller;
use yii\helpers\Console;

/**
 * Eventbrite Import
 *
 * The first line of this class docblock is displayed as the description
 * of the Console Command in ./craft help
 *
 * Craft can be invoked via commandline console by using the `./craft` command
 * from the project root.
 *
 * Console Commands are just controllers that are invoked to handle console
 * actions. The segment routing is plugin-name/controller-name/action-name
 *
 * The actionIndex() method is what is executed if no sub-commands are supplied, e.g.:
 *
 * ./craft lubeznik/eventbrite
 *
 * Actions must be in 'kebab-case' so actionDoSomething() maps to 'do-something',
 * and would be invoked via:
 *
 * ./craft lubeznik/eventbrite/do-something
 *
 * @author    Firebelly Design
 * @package   Lubeznik
 * @since     1.0.0
 */
class EventbriteController extends Controller
{
    // Public Methods
    // =========================================================================

    /**
     * Run Eventbrite Importer
     * ./craft lubeznik/eventbrite/import
     *
     * @return mixed
     */
    public function actionImport()
    {
        try {
            echo "Running Eventbrite importer...\n";
            $importResult = Lubeznik::$plugin->eventbriteImport->importEvents('basic');
            echo $importResult->summary . ' (' . $importResult->execTime . " seconds)\n";
        } catch (\Exception $e) {
            echo 'Error: '.$e->getMessage() . "\n";
        }

        // Run indexing queue
        echo "Running queue to index all resaved entries...\n";
        Craft::$app->getQueue()->run();
        return "Done!\n";
    }
}
