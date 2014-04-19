;(function(window, document, $, Backbone, _, undefined){
  'use strict';var Item = Backbone.Model.extend({
  defaults: {
    itemId: '',
    type: 'aside',
    parentId: '0',
    parentType: 'object',
    level: 0,
    order: 0,
    key: '',
    value: ''
  },

  initialize: function(){
    if(!this.get('itemId')){
      this.set({itemId: this.cid});
    }else{
      this.cid = this.get('itemId');
    }
  }
});

var List = Backbone.Collection.extend({
  model: Item,
  comparator: function(item){
    return [item.get('level'), item.get('order')];
  }
});

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

var ItemView = Backbone.View.extend({
  tagName: 'li',
  template: null,

  events: {
    'click span.delete': 'remove',
    'change input': 'updateModel',
    'change textarea': 'updateModel',
    'click button.add-from-url': 'addFromUrl',
    'click button.select-image': 'selectMedia',
    'click button.select-gallery': 'selectMedia',
    'click button.select-video': 'selectMedia',
    'click button.select-audio': 'selectMedia'
  },

  initialize: function(){
    _.bindAll(this, 'render', 'unrender', 'removeTree', 'remove', 'updateModel', 'addFromUrl', 'selectMedia', 'updateOrder');

    $(this.el).attr('id', this.model.get('itemId'));
    this.template = _.template($('#' + this.model.get('parentType') + '-' + this.model.get('type')).html());

    this.model.bind('remove', this.unrender);
    this.model.bind('updateModel', this.updateModel);
  },

  render: function(){
    this.$el.html(this.template(this.model.toJSON()));
    utilities.sortable(this);
    return this;
  },

  unrender: function(){
    $(this.el).remove();
  },

  updateOrder: function(){
    _(this.model.collection.models).each(function(model){
      model.set({order: $('li#' + model.get('itemId')).index()});
    }, this);
  },

  removeTree: function(model){
    _(model.collection.where({parentId: model.get('itemId')})).each(function(item){
      this.removeTree(item);
    }, this);
    model.destroy();
  },

  remove: function(){
    this.removeTree(this.model);
  },

  addFromUrl: function(e){
    e.preventDefault();
    e.stopPropagation();

    var self = this;

    self.model.set({value: null});
    self.$el.find('.image-preview').attr('src', 'http://placehold.it/100x100');
    self.$el.find('.audio-preview, .video-preview').html('');
    self.$el.find('.value').removeAttr('disabled');
  },

  selectMedia: function(e){
    e.preventDefault();
    e.stopPropagation();

    if(mediaModal){
      mediaModal.detach();
    }

    var self = this,
    itemType = self.model.get('type'),
    modalStates = [],
    mediaModal = null;

    self.$el.find('.value').val('');
    self.$el.find('.value').attr('disabled', 'disabled');

    switch(itemType){
      case 'image':
        modalStates.push(
          new wp.media.controller.Library({
            title: 'Images',
            library: wp.media.query({
              type: 'image'
            })
          }));
        break;
      case 'gallery':
        modalStates.push(
          new wp.media.controller.Library({
            title: 'Images',
            multiple: 'add',
            library: wp.media.query({
              type: 'image'
            })
          }));
        break;
      case 'video':
        modalStates.push(
          new wp.media.controller.Library({
            title: 'Videos',
            library: wp.media.query({
              type: 'video'
            })
          }));
        break;
      case 'audio':
        modalStates.push(
          new wp.media.controller.Library({
            title: 'Audio',
            library: wp.media.query(_.defaults({
              type: 'audio'
            }, this.library))
          })
        );
        break;
    }

    mediaModal = wp.media({
      states: modalStates
    });

    mediaModal.on('select', function(){
      var selection = mediaModal.state().get('selection'),
      output = [],
      childItem = null,
      i = 0,
      imax = 0;
      selection.each(function(attachment){
        delete attachment.attributes.compat;
        delete attachment.attributes.editLink;
        delete attachment.attributes.nonces;
        output.push(attachment.attributes);
      });
      if('gallery' === itemType){
        for(i = 0, imax = output.length; i < imax; i++){
          childItem = new Item({
            type: 'image',
            parentId: self.model.get('itemId'),
            parentType: 'gallery',
            level: self.model.get('level') + 1,
            value: [output[i]]
          });
          self.model.collection.add(childItem);
        }
      }else if('image' === itemType){
        self.model.set({value: output});
        console.log(output);
        self.$el.find('.image-preview').attr('src', output[0].sizes.thumbnail.url);
      }else{
        self.model.set({value: output});
        self.$el.find('.audio-preview, .video-preview').html(output[0].filename);
      }
    });

    mediaModal.open();
  },

  updateModel: function(e){
    switch(this.model.get('type')){
      case 'section':
        this.model.set({key: this.$el.find('.key').val()});
        break;
      case 'html':
        this.model.set({value: this.$el.find('.value').val()});
        break;
      case 'image':
      case 'video':
      case 'audio':
        if('disabled' !== this.$el.find('.value').attr('disabled')){
          this.model.set({value: this.$el.find('.value').val()});
        }
        break;
    }
  }
});

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

var listView = new ListView();

}(this, document, jQuery, Backbone, _));