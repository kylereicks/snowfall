var ListView = Backbone.View.extend({
  el: $('#snowfall-editor'),

  events: {
    'click button.add-item': 'addItem'
  },

  initialize: function(){
    _.bindAll(this, 'render', 'addItem', 'appendItem', 'updateContent', 'updateOrder');

    var self = this;

    if($('#content').val()){
      this.collection = new List(JSON.parse($('#content').val()));
    }else{
      this.collection = new List();
    }
    this.collection.bind('add', this.appendItem);
    this.collection.bind('change reset add remove', this.updateContent);

    this.render();

    utilities.sortable(this);
  },

  render: function(){
    var self = this,
    buttons = [
      'section',
      'aside',
      'image',
      'video',
      'audio',
      'gallery',
      'html'
    ];
    $(this.el).append("<ul></ul>");
    $(this.el).append(this.getButtonsHtml(buttons));
    _(this.collection.models).each(function(item){
      self.appendItem(item);
    }, this);
  },

  getButtonsHtml: function(buttonsArray){
    var html = '',
    buttonsTemplate = _.template($('#button-add').html());
    _(buttonsArray).each(function(buttonName){
      html += buttonsTemplate({item: buttonName});
    });
    return html ? '<span class="plus-icon"></span>' + html : html;
  },

  addItem: function(e){
    e.preventDefault();
    var parentModel = 'LI' === e.target.parentElement.tagName ? this.collection.findWhere({itemId: e.target.parentElement.id}) : false,
    item = new Item({
      type: e.target.className.match(/item-([^\s]+)/)[1],
      parentId: parentModel ? parentModel.get('itemId') : '0',
      parentType: parentModel ? parentModel.get('type') : 'object',
      level: parentModel ? parentModel.get('level') + 1 : 0,
    });
    this.collection.add(item);
  },

  appendItem: function(item){
    var itemView = new ItemView({
      model: item
    }),
    map = null,
    marker = null,
    initialLatLng = null,
    editorSettings = null;
    if('0' !== item.get('parentId')){
      $('#' + item.get('parentId') + '>ul, #' + item.get('parentId') + '>ol').append(itemView.render().el);
    }else{
      this.$el.children('ul').append(itemView.render().el);
    }
    item.set({order: itemView.$el.index()});

    if(itemView.$el.find('textarea').hasClass('wp-editor-area')){
      if(typeof tinymce !== 'undefined'){
        editorSettings = _.clone(window.snowfallTinyMCESettings);
        editorSettings.selector = '#' + item.get('itemId') + '-tinymce';
        editorSettings.body_class = item.get('itemId') + '-tinymce';
        editorSettings.setup = function(editor){
          editor.on('change', function(e){
            item.set({value: editor.getContent()});
          });
        };
        try{
          tinyMCE.init(editorSettings);
          if(!window.wpActiveEditor){
            window.wpActiveEditor = item.get('itemId') + '-tinymce';
          }
        }catch(e){}
      }
      if(typeof quicktags !== 'undefined'){
        try{
          quicktags({
            id: item.get('itemId') + '-tinymce',
            buttons: 'strong,em,link,block,del,ins,img,ul,ol,li,code,more,close'
          });
          if(!window.wpActiveEditor){
            window.wpActiveEditor = item.get('itemId') + '-tinymce';
          }
        }catch(e){}
      }
      if(typeof jQuery !== 'undefined'){
        jQuery('.wp-editor-wrap').on('click.wp-editor', function(){
          if(this.id){
            window.wpActiveEditor = this.id.slice(3, -5);
          }
        });
      }
    }
  },

  updateOrder: function(){
    _(this.collection.models).each(function(model){
      model.set({order: $('li#' + model.get('itemId')).index()});
    }, this);
  },

  updateContent: function(e){
    this.collection.sort();
    $('#content').val(JSON.stringify(this.collection));
  }
});
