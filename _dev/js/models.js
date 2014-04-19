var Item = Backbone.Model.extend({
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
