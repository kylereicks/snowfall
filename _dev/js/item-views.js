var ItemView = Backbone.View.extend({
  tagName: 'li',
  template: null,
  className: 'postbox',

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
