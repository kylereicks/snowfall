var utilities = {
  sortable: function(view){
    view.$el.children('ul, ol').sortable({
      update: function(e, ui){
        view.updateOrder();
      },
      stop: function(e, ui){
        view.$el.find('textarea').each(function(){
          var $textarea = $(this);
          if($textarea.hasClass('wp-editor-area')){
            tinyMCE.execCommand('mceAddEditor', true, $textarea.attr('id'));
          }
        });
      },
      start: function(e, ui){
        view.$el.find('textarea').each(function(){
          var $textarea = $(this),
          editorContent = '';
          if($textarea.hasClass('wp-editor-area')){
            editorContent = tinyMCE.activeEditor.getContent();
            tinyMCE.execCommand('mceRemoveEditor', false, $textarea.attr('id'));
            $textarea.val(editorContent);
          }
        });
      },
      handle: '.sort-handle'
    });
  }
};
