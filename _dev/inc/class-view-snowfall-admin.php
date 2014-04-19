<?php
if(!class_exists('View_Snowfall_Admin')){
  class View_Snowfall_Admin{

    public static function editor_setup(){
      global $post;

      if('post' !== $post->post_type){
        return false;
      }

      $field_types = array(
        'button-add',
        'object-object',
        'object-array',
        'object-image',
        'object-string',
        'object-color',
        'object-map',
        'object-tinymce',
        'object-section',
        'object-aside',
        'object-video',
        'object-audio',
        'object-gallery',
        'object-tweet',
        'object-html',
        'gallery-image'
      );
      foreach($field_types as $template_name){
        self::include_backbone_template($template_name);
      }
      echo '<div id="snowfall-editor"></div>';
      echo '<textarea name="content" id="content">' . $post->post_content . '</textarea>';
      wp_enqueue_script('snowfall-editor');
    }

    private static function include_backbone_template($template_name){
      echo '<script type="text/template" id="' . $template_name . '">';
        include(SNOWFALL_PATH . 'templates/backbone/' . $template_name . '.php');
      echo '</script>';
    }
  }
}
