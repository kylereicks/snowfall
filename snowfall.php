<?php
/*
Plugin Name: Snowfall
Plugin URI: http://github.com/kylereicks/snowfall
Description: A WordPress plugin for long-form multi-media posts.
Author: Kyle Reicks
Version: 0.0.0
Author URI: http://github.com/kylereicks/
*/

define('SNOWFALL_PATH', plugin_dir_path(__FILE__));
define('SNOWFALL_URL', plugins_url('/', __FILE__));
define('SNOWFALL_VERSION', '0.0.0');

require_once(SNOWFALL_PATH . 'inc/class-snowfall.php');

register_deactivation_hook(__FILE__, array('Snowfall', 'deactivate'));

add_action('plugins_loaded', array('Snowfall', 'get_instance'));
