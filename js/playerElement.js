//playerElement which is used to render a player
(function() {

var PlayerElement = function(x, y, player, position, color) {
  this.initialize(x, y, player, position, color);
}
var p = PlayerElement.prototype = new createjs.Container(); // inherit from Container

// playerElement attributes
// p.label;
// p.player;
// p.textObj;
// p.background;
// p.bounds;
// p.color;
// p.position;

p.Container_initialize = p.initialize;
p.initialize = function(x, y, player, position, colorObj) {
	this.Container_initialize();

	//set x and y position of this playerElement obj
	this.x = x;
	this.y = y;

	this.player = player;
	this.name = this.player.get("playerID"); // get unique playerID for playerElement id
	this.teamID = this.player.get("teamID"); // get teamID of player 
	this.label = this.player.get("jerseyNo"); // get jerseyNo to label the playerElement
	this.position = position; // represents which position player is playing as, e.g. "Goalkeeper"

	// get colorObj, actual hex code color and color name 
	this.colorObj = colorObj;
	this.color = colorObj.hexCode;
	this.teamColor = colorObj.name;

	// create text label for playerElement
	var text = new createjs.Text(this.label, "28px Helvetica", colorObj.textColor).set({name: "text"});
	text.textBaseline = "middle";
	text.textAlign = "center";
	text.x = 0;
	text.y = 0;
	
	var radius = text.getMeasuredHeight();

	// create circle for playerElement 
	this.background = new createjs.Shape().set({name: "background"});
	this.background.graphics.beginStroke(colorObj.outlineColor).beginFill(this.color).drawCircle(0,0,radius);
	
	this.addChild(this.background, text, this.soccerBallBitmap);

	this.on("pressmove", this.handleDrag);
	this.MouseDownFn = this.on("mousedown", this.handleMouseDown, this);
	this.PressUpFn = this.on("pressup", this.handlePressUp, this); 

	this.bounds = this.getBounds(); //get bounds of player

	this.cursor = "pointer";

	// if true - each child(text/circle) will be indepently enabled for the events, 
	// we don't want that, we want them to interact as a whole container.
	this.mouseChildren = false;
} 

//----event listeners-----

// handle mouse down for player element
// if recordingMode == "paused", white glow effect added on to player element
// if recordingMode == "playing", original position is saved
p.handleMouseDown = function (event) {
	if (event.target.disabled === true) { return; }

	view.currentlySelectedPlayer = event.target; // set currently selected player 

	//Create white glow effect for the mouse downed player!
	if (view.ballLocation != event.target) {
		var color = "0xFFFFFF"; //white
		event.target.glow(color);
	} 

	if (recordingMode == "playing") {
		//get original position of mouse click
		event.target.rawX = event.stageX;
		event.target.rawY = event.stageY;
	}
}

// handle press up for player element
// white glow effect added on mouse down will be removed from player element
// if recordingMode == "playing", team-colored glow effect added on to player element,
// ball flies to the player, and player element will return to its original position after dragging.
p.handlePressUp = function (event) {
	if (event.target.disabled === true) { return; }

	//Remove white glowing effect
	if (view.ballLocation != event.target) {
		event.target.unglow();
	}

	if (recordingMode == "playing") { //only when mode is playing
		var ballLocationBeforeAnyAction = view.ballLocation;

		if (view.timeOfThisAction) view.timeOfLastAction = view.timeOfThisAction;

		view.timeOfThisAction = view.matchTime;

		var msgBox = view.stage.getChildByName('msgBox'); //get reference to message box

		//return player to position where player was initially mouse downed on.
		var soccerBallEle = view.stage.getChildByName('soccerBallEle');
		if (view.ballLocation == event.target && !createjs.Tween.hasActiveTweens(soccerBallEle)) { 
			//get the friggin ball to move back to player after drag
			createjs.Tween.get(soccerBallEle).to({x: event.target.ox + 15, y: event.target.oy + 15}, 150, createjs.Ease.linear);
		}
		createjs.Tween.get(event.target).to({x: event.target.ox, y: event.target.oy}, 150, createjs.Ease.linear);

		//If user mousedown and release at same position (a full click)
		//look for ball passes or field element interactions!
		if (event.target.rawX == event.stageX && event.target.rawY == event.stageY) {
			//if ball was with a player previously
			if (view.ballLocation instanceof PlayerElement) {
				// if previous player passed ball to same team and selected player is not ball holder
				if (view.ballLocation.teamID == event.target.teamID && view.ballLocation != event.target) { 
					var pMatchPrevious = view.playerMatches.where({playerID: view.ballLocation.name})[0]; //get previous player's player match
					// console.log("Previous Player:" + JSON.stringify(pMatchPrevious));
					view.ballLocation.unglow(); //remove glow from previous ball holder

					var pMatch = view.playerMatches.where({playerID: event.target.name})[0]; //get this player's player match
					// console.log("Current Player:" + JSON.stringify(pMatch));

					pMatchPrevious.set({passes: pMatchPrevious.get("passes") + 1}); // +1 to passes for previous player

					pMatch.set({receives: pMatch.get("receives") + 1}); // +1 to receives for current player

					view.playerMatches.set([pMatch, pMatchPrevious], {remove: false}); // update collection

					// change message box text
					msgBox.changeText(view.ballLocation.teamColor + " No. " + view.ballLocation.label 
						+ " passed a ball to " + event.target.teamColor + " No. " + event.target.label + "!");

					view.ballLocation = event.target; //set ball holder as current player

					//get soccerBall from field and place it beside the player
					var soccerBallEle = view.stage.getChildByName('soccerBallEle');
					createjs.Tween.get(soccerBallEle)
						.to({x: event.target.ox +15 , y: event.target.oy + 15}, 150, createjs.Ease.linear)
						.call(function() {
							//Create team-colored glow effect for the player with ball!
							event.target.glow();
						});
				} 
			} 
			else {
				msgBox.changeText(event.target.teamColor + " No. " + event.target.label + " received the ball!");

				view.ballLocation = event.target; //set ball holder as current player

				//get soccerBall from field and place it beside the player
				var soccerBallEle = view.stage.getChildByName('soccerBallEle');
				createjs.Tween.get(soccerBallEle)
					.to({x: event.target.ox +15 , y: event.target.oy + 15}, 150, createjs.Ease.linear)
					.call(function() {
						//Create team-colored glow effect for the player with ball!
						event.target.glow();
					});
			}
		} else { // else when user mousedown and release at different position (player was dragged)

			var fieldEle = view.elementUnderSelectedPlayer; //get reference to field element under selected player
			var playerEle = view.currentlySelectedPlayer; //get reference to currently selected player
			var pMatch = view.playerMatches.where({playerID: playerEle.name})[0]; //get this player's player match
			var soccerBallEle = view.stage.getChildByName('soccerBallEle'); //get reference to soccerball
			// console.log(pMatch);

			//function which sends ball back to center of field and set ballLocation to center
			function ballToCenter() {
				playerEle.unglow();

				var startBallCircle = view.fieldElementsContainer.getChildByName("startBallCircle");
				//ball goes to center of field
				view.ballLocation = startBallCircle;
      			return createjs.Tween.get(soccerBallEle).to({x: startBallCircle.x, y: startBallCircle.y}, 150, createjs.Ease.linear);
      		}

      		//function which sends ball to opposite side's goalkeeper
      		function ballToOppGoalkeeper(playerEle) {
      			playerEle.unglow();
      			var goalkeeper;

				if (playerEle.teamID == team1ID) {
					//get team 2 goal keeper
					view.playerContainer.children.forEach(function(player) {
						if (player.position == "goalkeeper" && player.teamID == team2ID) goalkeeper = player;
					});
				} else {
					//get team 1 goal keeper
					view.playerContainer.children.forEach(function(player) {
						if (player.position == "goalkeeper" && player.teamID == team1ID) goalkeeper = player;
					});
				}

				//ball goes to appropriate goal keeper
				view.ballLocation = goalkeeper;
				view.ballLocation.glow();
      			createjs.Tween.get(soccerBallEle, {override:true}).to({x: view.ballLocation.x + 15, y: view.ballLocation.y + 15}, 150, createjs.Ease.linear);
      		}

      		//function which handles option after a goal is attempted
      		function goalChooseNextOption(playerEle, pMatch, leftOrRightOrMid) {
      			view.ballLocation = null; // no one possesses the ball at this moment where goal is being decided

      			view.playerContainer.children.forEach(function(player) { 
      				player.disabled = true; //disable all players
      				player.cursor = null;
      			});

      			var startBallCircle = view.fieldElementsContainer.getChildByName("startBallCircle");

      			startBallCircle.glow("0xFFFFFF");

      			// attach a one-off listener to startBallCircle
      			startBallCircle.on("pressup", function(event) {
					view.playerContainer.children.forEach(function(player) { 
						player.disabled = false; //enable all players
      					player.cursor = "pointer";

						//remove this temporary pressup fn from opponent players and attach original pressup fn
						if (playerEle.teamID != player.teamID) {
							player.removeAllEventListeners("pressup"); 
							player.on("pressup", player.PressUpFn);
							player.unglow();
						}
					});     				

      				msgBox.changeText(playerEle.teamColor + " No. " + playerEle.label + " SCORED a goal!");
      				
      				//update appropriate goal attribute
      				if (leftOrRightOrMid == "left") pMatch.set({"leftGoal": pMatch.get("leftGoal") + 1});
      				else if (leftOrRightOrMid == "right") pMatch.set({"rightGoal": pMatch.get("rightGoal") + 1});
      				else pMatch.set({"middleGoal": pMatch.get("middleGoal") + 1});

      				event.target.unglow();
      				ballToCenter(); 
      			}, null, true);

      			function saveBallListener(teamID) {
      				view.playerContainer.children.forEach(function(player) {
      					if (player.teamID == teamID) {
      						player.glow("0xFFFFFF"); 
      						player.cursor = "pointer";

	      					player.on("pressup", function(event) {
	      						playerEle.unglow();
      							startBallCircle.removeAllEventListeners("pressup");

	      						//get playerMatch of the player who saved the ball
								var pMatchSaver = view.playerMatches.where({playerID: event.target.name})[0];

								pMatchSaver.set({"saves": pMatchSaver.get("saves") + 1});

	      						//set ball location to event target and tween the ball to target
	      						view.ballLocation = event.target;
	      						var soccerBallEle = view.stage.getChildByName('soccerBallEle'); //get reference to soccerball
	      						createjs.Tween.get(soccerBallEle, {override:true}).to({x: event.target.x + 15, y: event.target.y + 15}, 150, createjs.Ease.linear);
	      						
	      						//change msg box text
	      						msgBox.changeText(event.target.teamColor + " No. " + event.target.label + " saved the ball!");

	      						view.playerContainer.children.forEach(function(player) {
	      							//remove this temporary pressup fn from opponent players and attach original pressup fn
	      							player.removeAllEventListeners("pressup"); 
	      							player.on("pressup", player.PressUpFn);

	      							player.disabled = false; //enable all players
	      							if (player.cursor == null) player.cursor = "pointer"; 
	      							if (player.teamID == teamID) player.unglow(); //unglow glowing players
	      						});

	      						//glow new player with the ball
	      						startBallCircle.unglow();
	      						event.target.glow();
	      					} ,null ,true);
      					}
	      			});
      			}

      			//attach one-off saveBallListener to opponent team players
      			// if player who attempted goal is from team 1, only team 2 players can save the ball
      			// else if player from team 2, only team 1 players can save the ball
      			if (playerEle.teamID == team1ID) {
					saveBallListener(team2ID);
      			} else {
					saveBallListener(team1ID);
      			}
      		}

      		//function which handles option after a penalty(redCard, foul, yellowCard)
      		function penaltyChooseNextOption() {
      			view.playerContainer.children.forEach(function(player) { 
      				player.disabled = true; //disable all players
      				player.cursor = null;
      			});

      			function playerGetBallListener(teamID) {
      				view.playerContainer.children.forEach(function(player) {
      					if (player.teamID == teamID) {
      						player.glow("0xFFFFFF"); 
      						player.cursor = "pointer";

	      					player.on("pressup", function(event) {
	      						//set ball location to event target and tween the ball to target
	      						view.ballLocation = event.target;
	      						var soccerBallEle = view.stage.getChildByName('soccerBallEle'); //get reference to soccerball
	      						createjs.Tween.get(soccerBallEle, {override:true}).to({x: event.target.x + 15, y: event.target.y + 15}, 150, createjs.Ease.linear);
	      						
	      						//change msg box text
	      						msgBox.changeText(event.target.teamColor + " No. " + event.target.label + " received the ball!");

	      						view.playerContainer.children.forEach(function(player) {
	      							//remove this temporary pressup fn from opponent players and attach original pressup fn 
	      							player.removeAllEventListeners("pressup"); 
	      							player.on("pressup", player.PressUpFn);

	      							player.disabled = false; //enable all players
	      							if (player.cursor == null) player.cursor = "pointer"; 
	      							if (player.teamID == teamID) player.unglow(); //unglow glowing players
	      						});

	      						//glow new player with the ball
	      						event.target.glow();
	      					} ,null ,true);
      					}
	      			});
      			}

      			// attach a one-off playerGetBallListener: 
      			// if player who got penalty is from team 1, only team 2 players can receive the ball
      			// else if player from team 2, only team 1 players can receive the ball
      			if (playerEle.teamID == team1ID) {
	      			playerGetBallListener(team2ID);
      			} else {
      				playerGetBallListener(team1ID);
      			}
      		}

      		//function which handles substitute player option
      		function replacePlayerWithSub(playerEle) {
      			var subsCont;

      			if (playerEle.teamID == team1ID) subsCont = view.team1SubsContainer;
				else subsCont = view.team2SubsContainer;

      			var x = 362,
				    y = 120,
				    width = 300,
				    height = 70 + subsCont.getNumChildren() * 70;

      			var subsPromptContainer = new createjs.Container().set({name: "subsPromptContainer", x: x, y: y});
      
			    var promptShape = new createjs.Shape();
			    promptShape.graphics.beginFill("#000").setStrokeStyle(3).beginStroke("#FFF").drawRect(0,0, width, height);
			    subsPromptContainer.addChild(promptShape);
			      
			    var promptText = new createjs.Text("Pick substitute:", "24px Helvetica", "#FFF");
			    promptText.x = 15;
			    promptText.y = 10;
			    subsPromptContainer.addChild(promptText);

				if (subsCont.getNumChildren() > 0) { //there are subs available
					
					subsCont.children.forEach(function(subBtn) {	
						subBtn.on("pressup", function(event) {
					        if (playerEle.teamID == team1ID) {
					        	view.team1Subs.remove(event.target.subPlayer);      //remove from team1Subs Backbone collection
					        	view.team1Players.add(event.target.subPlayer);		//add to team1Players Backbone collection
					        } else {
					        	view.team2Subs.remove(event.target.subPlayer);      //remove from team1Subs Backbone collection
					        	view.team2Players.add(event.target.subPlayer); 		//add to team2Players Backbone collection
					        }

					        event.target.subPlayer.hasPlayed = true; //property to indicate player has played in match

					        view.renderSubContainers();

					        //create new playerMatch for sub
					        var pMatch = new PlayerMatch({ playerID: event.target.subPlayer.get("playerID"), matchID: view.match.get("matchID")});
            				pMatch.save(); //note: if it ever encounters a save error, recording will bug up.
            				view.playerMatches.add(pMatch);

					        //render sub to field, disabled
					        var subEle = view.renderPlayer(playerEle.x , playerEle.y, event.target.subPlayer, playerEle.position , playerEle.colorObj);
					        subEle.disabled = true;
					        subEle.cursor = null;
					        subEle.ox = subEle.x;
					        subEle.oy = subEle.y;
					        
					        console.log(subEle);
					        //remove prompt
					        view.stage.removeChild(subsPromptContainer);
					    });
					});

					subsCont.x = 15;
					subsCont.y = 50;

					subsPromptContainer.addChild(subsCont);
				} else { //no subs left to sub player
					var msg = new createjs.Text("No subs left", "24px Helvetica", "#FFF");
					msg.x = 15;
					msg.y = 50;
					subsPromptContainer.addChild(msg); 
				}

			    view.stage.addChild(subsPromptContainer);
      		}

			/* FieldEle-PlayerEle interactions are done here, as well as appropriate playerMatch stats tracking */
			if (fieldEle != null) { // if there is an element under selected player

				if (((fieldEle.name == "rRightGoalBox" || fieldEle.name == "rLeftGoalBox" || fieldEle.name == "rMidGoalBox")
					&& playerEle.teamID == team2ID) || 
					((fieldEle.name == "lLeftGoalBox" || fieldEle.name == "lRightGoalBox" || fieldEle.name == "lMidGoalBox")
					&& playerEle.teamID == team1ID))
				{
					function ownGoalHandler() {
						msgBox.changeText(playerEle.teamColor + " No. " + playerEle.label + " blundered and own-goaled!");

						//add to own goal, but as of now, no stats are available for own goals.

						ballToCenter();
					}
					view.prompt("Are you sure?", ownGoalHandler);
				
				} else if (fieldEle.name == "rRightOutBox" && playerEle.teamID == team1ID ||
					fieldEle.name == "lRightOutBox" && playerEle.teamID == team2ID) 
				{
					// +1 to rightOut of currently selected player
					pMatch.set({"rightOut": pMatch.get("rightOut") + 1});

					ballToOppGoalkeeper(playerEle);

					msgBox.changeText(playerEle.teamColor + " No. " + playerEle.label + " shot a right out!");

				} else if (fieldEle.name == "rLeftOutBox" && playerEle.teamID == team1ID ||
						   fieldEle.name == "lLeftOutBox" && playerEle.teamID == team2ID)
				{
					// +1 to leftOut of currently selected player
					pMatch.set({"leftOut": pMatch.get("leftOut") + 1});

					ballToOppGoalkeeper(playerEle);

					msgBox.changeText(playerEle.teamColor + " No. " + playerEle.label + " shot a left out!");
					
				} else if (fieldEle.name == "rOverOutBox" && playerEle.teamID == team1ID ||
						   fieldEle.name == "lOverOutBox" && playerEle.teamID == team2ID)
				{
					// +1 to middleOut of currently selected player
					pMatch.set({"middleOut": pMatch.get("middleOut") + 1});

					ballToOppGoalkeeper(playerEle);

					msgBox.changeText(playerEle.teamColor + " No. " + playerEle.label + " shot an over out!");
					
				} else if (fieldEle.name == "rLeftGoalBox" && playerEle.teamID == team1ID ||
						   fieldEle.name == "lLeftGoalBox" && playerEle.teamID == team2ID)
				{
					// +1 to leftIn
					pMatch.set({"leftIn": pMatch.get("leftIn") + 1});

					msgBox.changeText(playerEle.teamColor + " No. " + playerEle.label + " attempts a left goal!\nWas it blocked?");

					goalChooseNextOption(playerEle, pMatch, "left");

				} else if (fieldEle.name == "rRightGoalBox" && playerEle.teamID == team1ID ||
						   fieldEle.name == "lRightGoalBox" && playerEle.teamID == team2ID)
				{
					// +1 to rightIn
					pMatch.set({"rightIn": pMatch.get("rightIn") + 1});

					msgBox.changeText(playerEle.teamColor + " No. " + playerEle.label + " attempts a right goal!\nWas it blocked?");

					goalChooseNextOption(playerEle, pMatch, "right");
					
				} else if (fieldEle.name == "rMidGoalBox" && playerEle.teamID == team1ID ||
						   fieldEle.name == "lMidGoalBox" && playerEle.teamID == team2ID)
				{
					// +1 to middleIn
					pMatch.set({"middleIn": pMatch.get("middleIn") + 1});

					msgBox.changeText(playerEle.teamColor + " No. " + playerEle.label + " attempts a center goal!\nWas it blocked?");

					goalChooseNextOption(playerEle, pMatch, "middle");
					
				} else if (fieldEle.name == "tacklesBox")
				{
					view.ballLocation.unglow(); //remove glow from previous ball holder

					// +1 to tackles of currently selected player/new ball holder
					pMatch.set({"tackles": pMatch.get("tackles") + 1});

					// +1 to receives of currently selected player/new ball holder
					pMatch.set({"receives": pMatch.get("receives") + 1});

					//get soccerBall from field and place it beside the player, and make player glow
					var soccerBallEle = view.stage.getChildByName('soccerBallEle');
					createjs.Tween.get(soccerBallEle)
						.wait(150)
						.to({x: playerEle.ox + 15 , y: playerEle.oy + 15}, 150, createjs.Ease.linear)
						.call(function() {
							playerEle.glow();
						});

					// change message box text
					msgBox.changeText(playerEle.teamColor + " No. " + playerEle.label + " tackled " + 
						view.ballLocation.teamColor + " No. " + view.ballLocation.label + "!");

					view.ballLocation = playerEle;

				} else if (fieldEle.name == "interceptionsBox")
				{
					view.ballLocation.unglow(); //remove glow from previous ball holder
					
					//get playerMatch of previous ball holder
					var pMatchPrevious = view.playerMatches.where({playerID: view.ballLocation.name})[0];

					// +1 to previous ball holder's passFail
					pMatchPrevious.set({"passFail": pMatchPrevious.get("passFail") + 1});

					view.playerMatches.set([pMatchPrevious], {remove: false}); // update collection

					// +1 to interceptions of currently selected player/new ball holder
					pMatch.set({"interceptions": pMatch.get("interceptions") + 1});

					// +1 to receives of currently selected player/new ball holder
					pMatch.set({"receives": pMatch.get("receives") + 1});

					//get soccerBall from field and place it beside the player, and make player glow
					var soccerBallEle = view.stage.getChildByName('soccerBallEle');
					createjs.Tween.get(soccerBallEle)
						.wait(150)
						.to({x: playerEle.ox +15 , y: playerEle.oy + 15}, 150, createjs.Ease.linear)
						.call(function() {
							playerEle.glow();
						});

					// change message box text
					msgBox.changeText(playerEle.teamColor + " No. " + playerEle.label + " intercepted " + 
						view.ballLocation.teamColor + " No. " + view.ballLocation.label + "!");

					view.ballLocation = playerEle;

				} else if (fieldEle.name == "redCardBox")
				{
					function redCardHandler() {
						// +1 to redCard
						pMatch.set({"redCard": pMatch.get("redCard") + 1});

						//remove player
						view.removePlayer(playerEle);

						// change message box text
						msgBox.changeText("Red card! " + playerEle.teamColor + " No. " + playerEle.label + " disqualified! " +
							"Choose player who gets the ball.");

						//prompt choose substitute
						replacePlayerWithSub(playerEle);

						//unglow ball holder
						if (view.ballLocation instanceof PlayerElement) view.ballLocation.unglow();

						// ball set to redCardBox
						view.ballLocation = fieldEle;
						// ball goes to redCardBox
						createjs.Tween.get(soccerBallEle).to({x: fieldEle.x + fieldEle.width/2 , y: fieldEle.y + fieldEle.height/2 }, 150, createjs.Ease.linear)
							.call(function() {
								penaltyChooseNextOption();
							});

					}

					view.prompt("Are you sure?", redCardHandler);

				} else if (fieldEle.name == "foulBox")
				{
					// +1 to fouls
					pMatch.set({"fouls": pMatch.get("fouls") + 1});

					// change message box text
					msgBox.changeText(playerEle.teamColor + " No. " + playerEle.label + " foul! " + 
						"Choose player who gets the ball.");

					if (view.ballLocation instanceof PlayerElement) view.ballLocation.unglow();

					// ball set to foulBox
					view.ballLocation = fieldEle;
					// ball goes to foulBox
					createjs.Tween.get(soccerBallEle).to({x: fieldEle.x + fieldEle.width/2 , y: fieldEle.y + fieldEle.height/2 }, 150, createjs.Ease.linear)
						.call(function() {
							penaltyChooseNextOption();
						});

				} else if (fieldEle.name == "yellowCardBox")
				{
					function yellowCardHandler() {
						// +1 to yellowCard
						pMatch.set({"yellowCard": pMatch.get("yellowCard") + 1});

						if (pMatch.get("yellowCard") == 2) {
							//remove player
							view.removePlayer(playerEle);

							// change message box text
							msgBox.changeText(playerEle.teamColor + " No. " + playerEle.label + " got 2 yellow cards! DISQUALIFIED.\n" + 
								"Choose player who gets the ball");

							//prompt choose substitute;
							replacePlayerWithSub(playerEle);
						} else {
							// change message box text
							msgBox.changeText("Yellow card for " + playerEle.teamColor + " No. " + playerEle.label + "! " +
								"Choose player who gets the ball.");
						}

						//unglow ball holder
						if (view.ballLocation instanceof PlayerElement) view.ballLocation.unglow();

						// ball set to yellowCardBox
						view.ballLocation = fieldEle;
						// ball goes to yellowCardBox
						createjs.Tween.get(soccerBallEle).to({x: fieldEle.x + fieldEle.width/2 , y: fieldEle.y + fieldEle.height/2 }, 150, createjs.Ease.linear)
							.call(function() {
								penaltyChooseNextOption();
							});
					}

					view.prompt("Are you sure?", yellowCardHandler);
				}

				view.playerMatches.set([pMatch], {remove: false}); // update collection

				if (fieldEle.background.alpha != 1) fieldEle.background.alpha = 1; // remove fade from fieldElement

				view.elementUnderSelectedPlayer = null; //unset current element under selected player
			}	
		} //end of else

		//if ball was previously with player and right now ball is not with the player, update player's possession time
		if (ballLocationBeforeAnyAction instanceof PlayerElement && !_.isEqual(ballLocationBeforeAnyAction, view.ballLocation)) {
			var pMatchPrevious = view.playerMatches.where({playerID: ballLocationBeforeAnyAction.name})[0]; //get previous player's player match
			
			if (view.timeOfLastAction) {
				var timeToAdd = view.timeOfThisAction - view.timeOfLastAction; 
			} else {
				var timeToAdd = view.timeOfThisAction;
			}

			pMatchPrevious.set({posessionTime: pMatchPrevious.get("posessionTime") + timeToAdd});
			// console.log(JSON.stringify(pMatchPrevious));
		}

		view.currentlySelectedPlayer = null; // unset currently selected player
	} // End of if recordingMode == "playing" 
} // End of handlePressup

// handle pressmove for player element
// if recordingMode == "paused", player element can be dragged to any new position and remain there 
// if recordingMode == "playing", player element will return to its original position after dragging
p.handleDrag = function (event) {
	if (event.target.disabled === true) { return; }

	//drag the player
	if (recordingMode == "paused") {	//bound player within inner field when in paused mode
		var widthOffset = event.target.bounds.width,
			heightOffset = event.target.bounds.height;
		var rb = view.fieldSettings.rightBound,
			lb = view.fieldSettings.leftBound,
			bb = view.fieldSettings.bottomBound,
			tb = view.fieldSettings.topBound,
			mb = view.fieldSettings.midBound;
		if (this.teamID == team1ID) //team 1
			event.target.x = Math.min(mb - widthOffset, Math.max(lb + widthOffset, event.stageX));
		else
			event.target.x = Math.min(rb - widthOffset, Math.max(mb + widthOffset, event.stageX));
	 	event.target.y = Math.min(bb - heightOffset, Math.max(tb + heightOffset + 40, event.stageY));
	} else { // allow player to be dragged anywhere without any bounds when in playing mode
	 	event.target.x = event.stageX;
		event.target.y = event.stageY;
	}

	if (view.ballLocation == event.target) { //get the friggin ball to move along
		var soccerBallEle = view.stage.getChildByName('soccerBallEle');
		soccerBallEle.x = event.target.x + 15;
		soccerBallEle.y = event.target.y + 15;
	}

	// handle fading of field element when a player is dragged into it.
	if (recordingMode == "playing") {

		// handler for when a field element collides with playerElement - centre of playerElement(x: 0, y: 0) to be exact
		function handleFieldPlayerCollision (element) {
				//allow any player to interact with redCardBox, foulBox & yellowCardBox
			if ((element.name == "redCardBox" || element.name == "foulBox" || element.name == "yellowCardBox") ||
				//allow a team 2 player that holds the ball to only interact with left boxes and own side's goal boxes 
				((element.name == "lRightOutBox" || element.name == "lOverOutBox" || element.name == "lLeftOutBox" || 
	    	  	 element.name == "lRightGoalBox" || element.name == "lMidGoalBox" || element.name == "lLeftGoalBox" || 
	    	  	 element.name == "rRightGoalBox" || element.name == "rMidGoalBox" || element.name == "rLeftGoalBox") && 
				 (view.currentlySelectedPlayer.teamID == team2ID && view.ballLocation == view.currentlySelectedPlayer)) ||
				//allow a team 1 player that holds the ball to only interact with right boxes and own side's goal boxes
				((element.name == "rRightOutBox" || element.name == "rOverOutBox" || element.name == "rLeftOutBox" || 
	    	  	 element.name == "rRightGoalBox" || element.name == "rMidGoalBox" || element.name == "rLeftGoalBox" || 
	    	  	 element.name == "lRightGoalBox" || element.name == "lMidGoalBox" || element.name == "lLeftGoalBox") &&
				 (view.currentlySelectedPlayer.teamID == team1ID && view.ballLocation == view.currentlySelectedPlayer)) ||
				//allow only opposing team to tackle/intercept
				((element.name == "tacklesBox" || element.name == "interceptionsBox") && 
				 (view.ballLocation instanceof PlayerElement && view.ballLocation.teamID != view.currentlySelectedPlayer.teamID))
			   ) 
	    	{
    			// Hit testing! Check if player collided with field element box, then fade it, else unfade it.
		        var pt = view.currentlySelectedPlayer.background.localToLocal(0,0, element.background);
		        if (element.background.hitTest(pt.x, pt.y)) {
		        	if (element.isFaded != true) {
		        		element.background.alpha = 0.5;
		            }
		            // assign element as under the selected player, as the previous if statements already check
		            // for valid interaction, this means if element does not glow, it is not assigned as under 
		            // the player (interaction is not allowed between player and the element)
		            tempEle = element; 
		          	element.isFaded = true;
		        } else {
		        	if (element.background.alpha != 1) element.background.alpha = 1;
		        	element.isFaded = false;
		        }
		    }

		    if (i == view.fieldElementsContainer.children.length - 1) view.elementUnderSelectedPlayer = tempEle;
	    }

	    var tempEle = null;
	    var i = 0;

	    //loop through all fieldElement to check collision with selected playerElement
	    view.fieldElementsContainer.children.forEach(function(fieldEle) {
	    	if (fieldEle.name != "startBallCircle") {
	    		i++; 
	    		handleFieldPlayerCollision(fieldEle);
	    	}
	    });
	}
}

//Create glow effect for the player element!
p.glow = function(color) {
	if (!color) color = this.color.replace("#","0x"); //GlowFilter quirk, need to replace # with 0x
	//create.jsGlowFilter( [color=0xFF0000],[alpha=1],[blurX=0],[blurY=0],[strength=1],[quality=1],[inner=false],[knockout=false] )
	var glowFilter = new createjs.GlowFilter(color, 1, 50, 50, 1, 1, false, false);
	this.filters = [glowFilter];
	var bounds = glowFilter.getBounds();
	this.cache(-50+bounds.x, -50+bounds.y, 100+bounds.width, 100+bounds.height);
}

//Remove glow effect from player element!
p.unglow = function() {
	this.filters = [];
	this.updateCache();
}

window.PlayerElement = PlayerElement;
})();