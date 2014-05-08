<?php
if(!class_exists('Snowfall_Admin')){
  class Snowfall_Admin{

    public static function remove_tinymce(){
      global $_wp_post_type_features;
      foreach($_wp_post_type_features as $post_type => $settings){
        if(in_array($post_type, array('post'))){
          remove_post_type_support($post_type, 'editor');
        }
      }
    }

    public static function register_scripts(){
      wp_register_script('google-maps-api', 'https://maps.googleapis.com/maps/api/js?key=AIzaSyDXY8vH-GMJZCciFB6dOweDmKH-RwX7iCM&sensor=false', array(), SNOWFALL_VERSION, true);
      wp_register_script('tinymce', includes_url() .  'js/tinymce/tinymce.min.js', array(), false, true);
      wp_register_script('tinymce-plugins', includes_url() .  'js/tinymce/plugins/compat3x/plugin.min.js', array('tinymce'), false, true);
      wp_register_script('snowfall-editor', SNOWFALL_URL .  'js/snowfall-editor.min.js', array('jquery', 'backbone', 'underscore', 'jquery-ui-sortable', 'google-maps-api', 'wp-color-picker', 'word-count', 'editor', 'quicktags', 'wplink', 'wp-fullscreen', 'media-upload', 'tinymce', 'tinymce-plugins'), SNOWFALL_VERSION, true);
      wp_localize_script('snowfall-editor', 'snowfallTinyMCESettings', apply_filters('snowfall_tinyMCE_settings', self::editor_settings()));
    }

    public static function register_styles(){
      wp_register_style('snowfall-editor', SNOWFALL_URL .  '/css/snowfall-editor.css', array('wp-color-picker', 'dashicons', 'editor-buttons', 'buttons', 'mediaelement', 'wp-mediaelement', 'media-views', 'imgareaselect', 'thickbox'), SNOWFALL_VERSION, 'all');
      wp_enqueue_style('snowfall-editor');
    }

    private static function content_css_list(){
      $suffix = defined('SCRIPT_DEBUG') && SCRIPT_DEBUG ? '' : '.min';
      $version = 'ver=' . $GLOBALS['wp_version'];
      $dashicons = includes_url('css/dashicons' . $suffix . '.css?' . $version);
      $mediaelement = includes_url('js/mediaelement/mediaelementplayer.min.css?' . $version);
      $wpmediaelement = includes_url('js/mediaelement/wp-mediaelement.css?' . $version);

      $mce_css = array(
        $dashicons,
        $mediaelement,
        $wpmediaelement,
        includes_url('js/tinymce') . '/skins/wordpress/wp-content.css?' . $version
      );

      if(!empty($GLOBALS['editor_styles']) && is_array($GLOBALS['editor_styles'])){
        $editor_styles = $GLOBALS['editor_styles'];

        $editor_styles = array_unique(array_filter($editor_styles));
        $style_uri = get_stylesheet_directory_uri();
        $style_dir = get_stylesheet_directory();

        // Support externally referenced styles (like, say, fonts).
        foreach($editor_styles as $key => $file){
          if(preg_match( '~^(https?:)?//~', $file)){
            $mce_css[] = esc_url_raw($file);
            unset($editor_styles[$key]);
          }
        }

        // Look in a parent theme first, that way child theme CSS overrides.
        if(is_child_theme()){
          $template_uri = get_template_directory_uri();
          $template_dir = get_template_directory();

          foreach($editor_styles as $key => $file){
            if($file && file_exists("$template_dir/$file"))
              $mce_css[] = "$template_uri/$file";
          }
        }

        foreach($editor_styles as $file){
          if($file && file_exists("$style_dir/$file")){
            $mce_css[] = "$style_uri/$file";
          }
        }
      }

      return trim(apply_filters('mce_css', implode(',', $mce_css)), ' ,');
    }

    private static function editor_settings(){
      return apply_filters('tiny_mce_before_init', array(
        'theme' => 'modern',
        'skin' => 'lightgray',
        'language' => 'en',
        'resize' => 'vertical',
        'formats' => array(
          'alignleft' => array(
            array(
              'selector' => 'p,h1,h2,h3,h4,h5,h6,td,th,div,ul,ol,li',
              'styles' => array(
                'textAlign' => 'left'
              )
            ),
            array(
              'selector' => 'img,table,dl.wp-caption',
              'classes' => 'alignleft'
            )
          ),
          'aligncenter' => array(
            array(
              'selector' => 'p,h1,h2,h3,h4,h5,h6,td,th,div,ul,ol,li',
              'styles' => array(
                'textAlign' => 'center'
              )
            ),
            array(
              'selector' => 'img,table,dl.wp-caption',
              'classes' => 'aligncenter'
            )
          ),
          'alignright' => array(
            array(
              'selector' => 'p,h1,h2,h3,h4,h5,h6,td,th,div,ul,ol,li',
              'styles' => array(
                'textAlign' => 'right'
              )
            ),
            array(
              'selector' => 'img,table,dl.wp-caption',
              'classes' => 'alignright'
            )
          ),
          'strikethrough' => array(
            'inline' => 'del'
          )
        ),
        'relative_urls' => false,
        'remove_script_host' => false,
        'convert_urls' => false,
        'browser_spellcheck' => true,
        'fix_list_elements' => true,
        'entities' => '38,amp,60,lt,62,gt',
        'entity_encoding' => 'raw',
        'menubar' => false,
        'keep_styles' => false,
        'paste_remove_styles' => true,
        'preview_styles' => 'font-family font-size font-weight font-style text-decoration text-transform',
        'wpeditimage_disable_captions' => false,
        'plugins' => trim(apply_filters('mce_external_plugins', implode(',', array(
          'charmap',
          'hr',
          'media',
          'paste',
          'tabfocus',
          'textcolor',
          'fullscreen',
          'wordpress',
          'wpeditimage',
          'wpgallery',
          'wplink',
          'wpdialogs',
          'wpview'
        ))), ' ,'),
        'wpautop' => true,
        'indent' => false,
        'toolbar1' => trim(apply_filters('mce_buttons_1', implode(',', array(
          'bold',
          'italic',
          'strikethrough',
          'bullist',
          'numlist',
          'blockquote',
          'hr',
          'alignleft',
          'aligncenter',
          'alignright',
          'link',
          'unlink',
          'wp_more',
          'spellchecker',
          'fullscreen',
          'wp_adv'
        ))), ' ,'),
        'toolbar2' => trim(apply_filters('mce_buttons_2', implode(',', array(
          'formatselect',
          'underline',
          'alignjustify',
          'forecolor',
          'pastetext',
          'removeformat',
          'charmap',
          'outdent',
          'indent',
          'undo',
          'redo',
          'wp_help'
        ))), ' ,'),
        'toolbar3' => trim(apply_filters('mce_buttons_3', implode(',', array())), ' ,'),
        'toolbar4' => trim(apply_filters('mce_buttons_4', implode(',', array())), ' ,'),
        'tabfocus_elements' => ':prev,:next',
        'elements' => 'none',
        'content_css' => self::content_css_list(),
        'selector' => null,
        'body_class' => null,
        'setup' => null
      ));
    }
  }
}
