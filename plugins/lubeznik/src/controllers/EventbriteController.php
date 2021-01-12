<?php
/**
 * Lubeznik plugin for Craft CMS 3.x
 *
 * Firebelly plugin for Lubeznik
 *
 * @link      https://firebellydesign.com/
 * @copyright Copyright (c) 2020 Firebelly
 */

namespace firebelly\lubeznik\controllers;

use firebelly\lubeznik\Lubeznik;
use Craft;
use craft\web\Controller;

/**
 * Eventbrite Controller
 *
 * Generally speaking, controllers are the middlemen between the front end of
 * the CP/website and your plugin’s services. They contain action methods which
 * handle individual tasks.
 *
 * A common pattern used throughout Craft involves a controller action gathering
 * post data, saving it on a model, passing the model off to a service, and then
 * responding to the request appropriately depending on the service method’s response.
 *
 * Action methods begin with the prefix “action”, followed by a description of what
 * the method does (for example, actionSaveIngredient()).
 *
 * https://craftcms.com/docs/plugins/controllers
 *
 * @author    Firebelly
 * @package   Lubeznik
 * @since     1.0.0
 */
class EventbriteController extends Controller
{

    // Protected Properties
    // =========================================================================

    /**
     * @var    bool|array Allows anonymous access to this controller's actions.
     *         The actions must be in 'kebab-case'
     * @access protected
     */
    protected $allowAnonymous = ['index', 'import-events'];

    // Public Methods
    // =========================================================================

    /**
     * Handle a request going to our plugin's index action URL,
     * e.g.: actions/lubeznik/eventbrite
     *
     * @return mixed
     */
    public function actionIndex()
    {
        $result = 'Welcome to the EventbriteController actionIndex() method';

        return $result;
    }

    /**
     * Handle a request going to our plugin's actionDoSomething URL,
     * e.g.: actions/lubeznik/eventbrite/do-something
     *
     * @return mixed
     */
    public function actionImportEvents()
    {
        try {
            $referrer = Craft::$app->getRequest()->get('referrer');
            $importMode = Craft::$app->getRequest()->get('import-mode') ?? 'basic';
            $importResult = Lubeznik::$plugin->eventbriteImport->importEvents($importMode);
            // Update all market projectIds fields checking for removed/added projects
            // Lubeznik::$plugin->projects->updateMarketProjects();
            $response = [
                'status'  => 1,
                'log'     => $importResult->log,
                'summary' => $importResult->summary,
                'message' => 'Success! '.$importResult->summary,
            ];
        } catch (\Exception $e) {
            $response = [
                'status'  => 0,
                'message' => 'Error! '.$e->getMessage()
            ];
        }
        if (!empty($referrer)) {
            Craft::$app->getSession()->setNotice($response['message']);
            return $this->redirect(urldecode($referrer));
        } else {
            return json_encode($response);
        }
    }
}
