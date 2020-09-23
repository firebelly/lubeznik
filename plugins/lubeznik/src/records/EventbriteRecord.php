<?php
/**
 * Lubeznik plugin for Craft CMS 3.x
 *
 * Firebelly plugin for Lubeznik
 *
 * @link      https://firebellydesign.com/
 * @copyright Copyright (c) 2020 Firebelly
 */

namespace firebelly\aei\records;

use firebelly\lubeznik\Lubeznik;

use Craft;
use craft\db\ActiveRecord;

/**
 * EventbriteLog Record
 *
 * ActiveRecord is the base class for classes representing relational data in terms of objects.
 * http://www.yiiframework.com/doc-2.0/guide-db-active-record.html
 *
 * @author    Firebelly Design
 * @package   AEI
 * @since     1.0.0
 */
class EventbriteLog extends ActiveRecord
{
     /**
     * @return string the table name
     */
    public static function tableName()
    {
        return '{{%lubeznik_eventbrite_log}}';
    }
}
