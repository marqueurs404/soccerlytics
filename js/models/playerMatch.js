var PlayerMatch = Backbone.Model.extend({
  // urlRoot: function() {
  //   return '/soccerlytics/server/api/playermatch/' + this.get("playerID") + '/' + this.get("matchID"); 
  // },
  urlRoot: function() {
    return 'http://choo.cloudapp.net/api/playermatch/' + this.get("playerID") + '/' + this.get("matchID"); 
  },
  idAttribute : '_id',
  defaults: {
  	 "playerID": 0,
     "matchID": 0,
     "tackles": 0,
     "interceptions": 0,
     "leftOut": 0,
     "rightOut": 0,
     "middleOut": 0,
     "leftIn": 0,
     "rightIn": 0,
     "middleIn": 0,
     "leftGoal": 0,
     "rightGoal": 0,
     "middleGoal": 0,
     "saves": 0,
     "yellowCard": 0,
     "redCard": 0,
     "fouls": 0,
     "passes": 0,
     "passFail": 0,
     "receives": 0,
     "posessionTime": 0
  }
});
 
var PlayerMatchCollection = Backbone.Collection.extend({
  model: PlayerMatch
  
});