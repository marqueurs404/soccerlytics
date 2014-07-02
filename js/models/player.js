var Player = Backbone.Model.extend({
  // urlRoot: function() {
  // 	return '/soccerlytics/server/api/player/' + this.get("playerID"); 
  // },
  urlRoot: function() {
    return 'http://choo.cloudapp.net/api/player/' + this.get("playerID"); 
  },
  idAttribute: "playerID",
  defaults: {
  	 playerName: "Dummy", 
  	 jerseyNo: 0, 
  	 position: "Dummy", 
  	 teamID: 0
  },
  select: function() {
         this.selected = true;
         // this.trigger('selected'); // you can use another event name here, ie. change
    },
  deselect: function() {
         this.selected = false;
         // this.trigger('deselected');
    }
});
 
var PlayerCollection = Backbone.Collection.extend({
  initialize: function (models, options) {
    this.teamID = options.teamID;
  },
  // url: function() {
  //   return '/soccerlytics/server/api/player/from/' + this.teamID; 
  // },
  url: function() {
    return 'http://choo.cloudapp.net/api/player/from/' + this.teamID; 
  },
  model: Player,
  parse: function(resp) {
    for (var key in resp) {
      var obj = resp[key];
      this.push(obj);
    }
    return this.models;
  }
});