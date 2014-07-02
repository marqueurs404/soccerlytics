var Team = Backbone.Model.extend({
  // urlRoot: function() {
  // 	return '/soccerlytics/server/api/team/' + this.get("teamID"); 
  // },
  idAttribute: "teamID",
  defaults: { 
  	 "teamName": "Dummy"
  }
});
 
var TeamCollection = Backbone.Collection.extend({
  // url: '/soccerlytics/server/api/team/',
  url: 'http://choo.cloudapp.net/api/team/',
  model: Team,  
  parse: function(resp) {
  	for (var key in resp) {
  		var obj = resp[key];
  		this.push(obj);
   	}
  	return this.models;
  }
});