var List = Backbone.Collection.extend({
  model: Item,
  comparator: function(item){
    return [item.get('level'), item.get('order')];
  }
});
