<?php
if(!class_exists('Snowfall')){
  class Snowfall{

    public static function get_instance(){
      static $instance;

      if(null === $instance){
        $instance = new self();
      }

      return $instance;
    }

    private function __clone(){
      return null;
    }

    private function __wakeup(){
      return null;
    }

    public static function deactivate(){
      self::clear_options();
    }

    private static function clear_options(){
      global $wpdb;
      $options = $wpdb->get_col('SELECT option_name FROM ' . $wpdb->options . ' WHERE option_name LIKE \'%snowfall%\'');
      foreach($options as $option){
        delete_option($option);
      }
    }

    public static function clear_transients(){
      global $wpdb;
      $transients = $wpdb->get_col('SELECT option_name FROM ' . $wpdb->options . ' WHERE option_name LIKE \'%_snowfall%\'');
      foreach($transients as $transient){
        delete_option($transient);
      }
    }

    private function __construct(){
      require_once(SNOWFALL_PATH . 'inc/class-snowfall-admin.php');
      require_once(SNOWFALL_PATH . 'inc/class-view-snowfall-admin.php');
      require_once(SNOWFALL_PATH . 'inc/class-view-snowfall.php');

      add_action('init', array($this, 'add_update_hook'));

      add_action('init', array('Snowfall_Admin', 'remove_tinymce'));
      add_action('admin_enqueue_scripts', array('Snowfall_Admin', 'register_scripts'));
      add_action('admin_enqueue_scripts', array('Snowfall_Admin', 'register_styles'));
      add_action('edit_form_after_title', array('View_Snowfall_Admin', 'editor_setup'));

      add_filter('the_content', array('View_Snowfall', 'process_content'), 1);
    }

    public function add_update_hook(){
      if(get_option('snowfall_version') !== SNOWFALL_VERSION){
        do_action('snowfall_updated');
        update_option('snowfall_update_timestamp', time());
        update_option('snowfall_version', SNOWFALL_VERSION);
      }
    }

  }
}
