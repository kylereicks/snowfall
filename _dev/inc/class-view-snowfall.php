<?php
if(!class_exists('View_Snowfall')){
  class View_Snowfall{

    public static function process_content($content){
      $collection = json_decode($content);
      $output = '';
      if(empty($collection)){
        return $content;
      }

      foreach($collection as $model){
        if(0 === $model->level){
          switch($model->type){
          case 'section':
            $output .= self::section_view($model);
            break;
          case 'aside':
            $output .= self::aside_view($model);
            break;
          case 'gallery':
            $output .= self::gallery_view($model, $collection);
            break;
          case 'video':
            $output .= self::video_view($model);
            break;
          case 'audio':
            $output .= self::audio_view($model);
            break;
          case 'image':
            $output .= self::image_view($model);
            break;
          default:
            $output .= $model->value;
            break;
          }
        }
      }

      return $output;
    }

    private static function section_view($model){
      $output = '<section>';

      $output .= '<h1>' . $model->key . '</h1>';
      $output .= $model->value;

      $output .= '</section>';
      return $output;
    }

    private static function aside_view($model){
      $output = '<aside>';

      $output .= $model->value;

      $output .= '</aside>';
      return $output;
    }

    private static function gallery_view($model, $collection){
      $output = '<aside>';

      $gallery = '[gallery ids="';
      foreach($collection as $item){
        if($item->parentId === $model->itemId){
          $gallery .= $item->value[0]->id . ',';
        }
      }
      $gallery = trim($gallery, ',') . '"]';

      $output .= $gallery . '</aside>';
      return $output;
    }

    private static function video_view($model){
      $output = '<aside>';

      if(is_array($model->value)){
        $video = '[video src="' . $model->value[0]->url . '"]';
      }else{
        $video = '[video src="' . $model->value . '"]';
      }

      $output .= $video . '</aside>';
      return $output;
    }

    private static function audio_view($model){
      $output = '<aside>';

      if(is_array($model->value)){
        $audio = '[audio src="' . $model->value[0]->url . '"]';
      }else{
        $audio = '[audio src="' . $model->value . '"]';
      }

      $output .= $audio . '</aside>';
      return $output;
    }

    private static function image_view($model){
      $output = '<aside>';

      if(is_array($model->value)){
        $image = '<img src="' . $model->value[0]->sizes->large->url . '" />';
      }else{
        $image = '<img src="' . $model->value . '" />';
      }

      $output .= $image . '</aside>';
      return $output;
    }

  }
}
