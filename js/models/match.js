var Match = Backbone.Model.extend({
  // urlRoot: function() {
  // 	return '/soccerlytics/server/api/match/' + this.get("matchID"); 
  // },
  urlRoot: function() {
    return 'http://choo.cloudapp.net/api/match/' + this.get("matchID"); 
  },
  idAttribute: "matchID",
  defaults: {
  	 "team1": 0, 
  	 "team2": 0,
  	 "matchTime": 0
  }
});
 
var MatchCollection = Backbone.Collection.extend({
  // url: '/soccerlytics/server/api/match/',
  url: 'http://choo.cloudapp.net/api/match/',
  model: Match
});