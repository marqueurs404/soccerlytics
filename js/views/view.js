var MenuView = Backbone.View.extend({
  initialize: function (args) {
    screenState = menu; //variable to indicate state of screen

     // easeljs stage passed as argument.
    this.stage = args.stage;
    this.stage.enableDOMEvents(true);

    // enableMouseOver is necessary to enable mouseover event http://www.createjs.com/Docs/EaselJS/classes/DisplayObject.html#event_mouseover
    this.stage.enableMouseOver(10);
    
    this.stage.mouseMoveOutside = true; // keep tracking the mouse even when it leaves the canvas

    createjs.Touch.enable(this.stage); //allow multi-touch enabled devices to work too!

    this.teams = args.teams; //all soccer teams

    this.team1 = args.team1; //previous team 1, only available after a game is recorded.
    this.team2 = args.team2; //previous team 2, only available after a game is recorded.
    this.team1AllPlayers = args.team1AllPlayers; //previous match players, only available after a game is recorded.
    this.team2AllPlayers = args.team2AllPlayers; //previous match players, only available after a game is recorded.
    this.playerMatches = args.playerMatches; //all playerMatches of previous recording, only available after a game is recorded.
    this.match = args.match;  //previous match recording, only available after a game is recorded.

    //container to hold elements on starting menu page
    this.startPageContainer = new createjs.Container();
    this.stage.addChild(this.startPageContainer);
    //container to hold elements on Record Game menu page 1
    this.recordingPage1Container = new createjs.Container();
    //container to hold elements on Check Stats menu page 1
    this.statsPage1Container = new createjs.Container();
  }, //--initialize--

  render: function () {
    //render menu pages
    this.renderStartPage();
    this.renderRecordingPage1();
    this.renderStatsPage1();

    this.stage.update();

    createjs.Ticker.on("tick", this.stage);
    createjs.Ticker.setFPS(FPS);
  }, //--render--

  renderStartPage: function() {
    var baseView = this;

    //green background!
    var background = new createjs.Shape();
    background.graphics.beginFill("green").drawRect(0,0,1024,768);
    this.stage.addChild(background);

    this.stage.setChildIndex(background, 0);

    //Menu title at top of screen
    var menuTitle = new createjs.Text("Soccer Analytics", "Bold 100px Helvetica", "#FFF");
    menuTitle.x = 512 - menuTitle.getMeasuredWidth()/2;
    menuTitle.y = 50;
    this.startPageContainer.addChild(menuTitle);

    //Record Game button
    var recordBtn = new Button("Record Game","#0FF", "#000", 362, 244, 300, 150);
    recordBtn.on("pressup", function(event) {
      baseView.stage.removeChild(baseView.startPageContainer); // remove start page elements 
      baseView.stage.addChild(baseView.recordingPage1Container); // add Record Game menu page 1 elements
      baseView.stage.update();

      //show team selectors
      $("#team1SelectorDiv").show();
      $("#team2SelectorDiv").show();
    });
    this.startPageContainer.addChild(recordBtn);

    //Last Match's Stats button
    var statsBtn = new Button("Last Game's Stats","#FF0", "#000", 362, 484, 300, 150);
    statsBtn.on("pressup", function(event) {
      baseView.stage.removeChild(baseView.startPageContainer); // remove start page elements 
      baseView.stage.addChild(baseView.statsPage1Container); // add Check Stats menu page 1 elements
      baseView.stage.update();
    });
    this.startPageContainer.addChild(statsBtn);
  }, //--renderStartPage--

  renderRecordingPage1: function () {
    var baseView = this;

    //menu title
    var menuTitle = new createjs.Text("Select teams", "Bold 50px Helvetica", "#FFF");
    menuTitle.x = 512 - menuTitle.getMeasuredWidth()/2;
    menuTitle.y = 20;
    baseView.recordingPage1Container.addChild(menuTitle);

    //counts number of selected players
    var team1PlayerCount = 0,
        team2PlayerCount = 0;

    //team 1 sidebar text
    var team1Text = new createjs.Text("Team 1:", "24px Helvetica", "#FFF");
    team1Text.x = 750;
    team1Text.y = 120;
    baseView.recordingPage1Container.addChild(team1Text);
    var team1PlayerCountText = new createjs.Text(team1PlayerCount + "/11 Players", "24px Helvetica", "#FFF");
    team1PlayerCountText.x = 750;
    team1PlayerCountText.y = 155;
    baseView.recordingPage1Container.addChild(team1PlayerCountText);

    //create container holding all colors
    this.colorsContainer = new createjs.Container();
    var i = 0, j = 0;
    teamColorOptions.forEach(function(colorObj) {
      j = Math.floor(i / 4);

      var colorBox = new createjs.Shape();
      colorBox.colorObj = colorObj;
      colorBox.graphics.setStrokeStyle(1).beginStroke("#FFF").beginFill(colorObj.hexCode);
      colorBox.graphics.drawRect((i % 4) * 70, j * 70, 60, 60);
      colorBox.cursor = "pointer";

      baseView.colorsContainer.addChild(colorBox);
      i++;
    });
    
    //function that handles picking of a team color
    function pickColor(event) {
      if (!baseView.stage.getChildByName("promptContainer")) {
        var teamColorPicker = event.target;

        var x = 710,
            y = 120,
            width = 300,
            height = 50 + (j + 1) * 70;

        var promptContainer = new createjs.Container().set({name: "promptContainer", x: x, y: y});
        
        var promptShape = new createjs.Shape();
        promptShape.graphics.beginFill("#000").setStrokeStyle(3).beginStroke("#FFF").drawRect(0,0, width, height);
        promptContainer.addChild(promptShape);
        
        var promptText = new createjs.Text("Pick team color:", "24px Helvetica", "#FFF");
        promptText.x = 15;
        promptText.y = 10;
        promptContainer.addChild(promptText);

        baseView.colorsContainer.x = 15;
        baseView.colorsContainer.y = 45;

        baseView.colorsContainer.children.forEach(function(colorBox) {
          colorBox.removeAllEventListeners("pressup"); // remove previous colorBox listeners for pressup

          colorBox.on("pressup", function(event) {
            //clear previous graphics and change team's color picker to new color
            teamColorPicker.graphics.c().setStrokeStyle(1).beginStroke("#FFF").beginFill(event.target.colorObj.hexCode);

            // set global variables, draw out the rectangle at correct positions for different teams
            if (teamColorPicker.name == "team1Color") {
              team1Color = event.target.colorObj;
              teamColorPicker.graphics.drawRect(800, 200, 60, 60);
            }
            else {
              team2Color = event.target.colorObj;
              teamColorPicker.graphics.drawRect(800, 360, 60, 60);
            }

            //remove prompt container
            baseView.stage.removeChild(baseView.stage.getChildByName("promptContainer"));
          });
        });

        promptContainer.addChild(baseView.colorsContainer);
        baseView.stage.addChild(promptContainer);
      }
    } 

    //team 1 sidebar color picker
    var team1ColorBox = new createjs.Shape().set({name: "team1Color"});
    team1ColorBox.graphics.setStrokeStyle(1).beginStroke("#FFF").beginFill(team1Color.hexCode)
      .drawRect(800, 200, 60, 60);
    team1ColorBox.cursor = "pointer";
    team1ColorBox.on("pressup", pickColor);
    baseView.recordingPage1Container.addChild(team1ColorBox);

    //team 2 sidebar text
    var team2Text = new createjs.Text("Team 2:", "24px Helvetica", "#FFF");
    team2Text.x = 750;
    team2Text.y = 280;
    baseView.recordingPage1Container.addChild(team2Text);
    var team2PlayerCountText = new createjs.Text(team2PlayerCount + "/11 Players", "24px Helvetica", "#FFF");
    team2PlayerCountText.x = 750;
    team2PlayerCountText.y = 315;
    baseView.recordingPage1Container.addChild(team2PlayerCountText);

    //team 2 sidebar color picker
    var team2ColorBox = new createjs.Shape().set({name: "team2Color"});
    team2ColorBox.graphics.setStrokeStyle(1).beginStroke("#FFF").beginFill(team2Color.hexCode)
      .drawRect(800, 360, 60, 60);
    team2ColorBox.cursor = "pointer";
    team2ColorBox.on("pressup", pickColor);
    baseView.recordingPage1Container.addChild(team2ColorBox);

    //set team and player selector positions
    $("#team1SelectorDiv").css({top: 100, left: 20});
    $("#team2SelectorDiv").css({top: 100, left: 375});
    $("#team1PlayerSelector").css({top: 155, left: 20, width: 330});
    $("#team2PlayerSelector").css({top: 155, left: 375, width: 330});

    //populate team selectors
    var teamHtml = '';
    this.teams.forEach(function(team) {
      teamHtml += "<option value=" + team.get('teamID') + ">" + team.get('teamName') + "</option>";
    })
    $("#team1Selector").html('<option value="" selected="selected">Team 1</option>' + teamHtml);
    $("#team2Selector").html('<option value="" selected="selected">Team 2</option>' + teamHtml);


    //team 1 and 2 playerCollections
    var team1Players = [];
    var team2Players = [];

    //localised team1ID and team2ID variables
    this.team1ID = null;
    this.team2ID = null;

    //handle change event for team selectors - !!! Check for same team !!!
    function teamSelectorChangeHandler(event) {
      var target = $(event.target);
      if (target.attr("id") ==  "team1Selector") {
        if (target.val() != "") { //check if value is not empty, meaning a team is selected
          //Show loading text
          var msg = new createjs.Text("Loading...", "24px Helvetica", "#FFF").set({name: "msg"});
          msg.x = 188;
          msg.y = 175;
          baseView.recordingPage1Container.addChild(msg);
          baseView.stage.update();

          baseView.stage.enableDOMEvents(false);

          baseView.team1ID = target.val();
          team1Players = new PlayerCollection([], { teamID: baseView.team1ID});
          team1Players.fetch({ //fetch players of this team from database
            success: function(collection) {
                baseView.recordingPage1Container.removeChild(msg); //remove loading text
                baseView.stage.enableDOMEvents(true);

                //add players to selectors
                var count = 0;
                var playerHtml = '<div class="ui-block-a"><div class="button-wrap"><fieldset data-role="controlgroup" data-iconpos="right">';
                collection.forEach(function(player) {
                  count ++;
                  playerHtml += '<label for="'+ player.get('playerID') + '">'+ player.get('playerName') + ' (' + player.get('jerseyNo') + ')</label><input type="checkbox" class="team1Players" name="'+ player.get('playerName') +'" id="'+ player.get('playerID') + '"/>';
                  if (count == 8) {
                    playerHtml += '</fieldset></div></div><div class="ui-block-b"><fieldset data-role="controlgroup" data-iconpos="right">';
                  }
                });
                playerHtml += '</fieldset></div>';
                $("#team1PlayerSelector").html(playerHtml);

                //show team 1 player selectors
                $("#team1PlayerSelector").trigger ("create");
                
                //set team count
                team1PlayerCount = collection.length;
                team1PlayerCountText.text = team1PlayerCount + "/11 Players";

                // check all players
                $("#team1PlayerSelector input").attr('checked', true);
                $("#team1PlayerSelector input").checkboxradio("refresh");

                // attach change event handler for inputs
                $("#team1PlayerSelector input").on("change.custom", playerSelectorChangeHandler);
                
                $("#team1PlayerSelector").show();         
            },
            error: function() {
                console.log("Error in contacting server.");  
            }
          }); 
        } else { //value is empty
          //reset count
          team1PlayerCount = 0;
          team1PlayerCountText.text = team1PlayerCount + "/11 Players";
          baseView.team1ID = null;
          $("#team1PlayerSelector").hide();
        }
      } else {
        if (target.val() != "") { //check if value is not empty, meaning a team is selected
          //Show loading text
          var msg = new createjs.Text("Loading...", "24px Helvetica", "#FFF").set({name: "msg"});
          msg.x = 450;
          msg.y = 175;
          baseView.recordingPage1Container.addChild(msg);
          baseView.stage.update();

          baseView.stage.enableDOMEvents(false); // prevent any event interactions

          baseView.team2ID = target.val();
          team2Players = new PlayerCollection([], { teamID: baseView.team2ID});
          team2Players.fetch({ //fetch players of this team from database
            success: function(collection) {
                baseView.recordingPage1Container.removeChild(msg); //remove loading text
                baseView.stage.enableDOMEvents(true);

                //add players to selectors
                var count = 0;
                var playerHtml = '<div class="ui-block-a"><div class="button-wrap"><fieldset data-role="controlgroup" data-iconpos="right">';
                collection.forEach(function(player) {
                  count ++;
                  playerHtml += '<label for="'+ player.get('playerID') + '">'+ player.get('playerName') + ' (' + player.get('jerseyNo') + ')</label><input type="checkbox" class="team2Players" name="'+ player.get('playerName') +'" id="'+ player.get('playerID') + '"/>';
                  if (count == 8) {
                    playerHtml += '</fieldset></div></div><div class="ui-block-b"><fieldset data-role="controlgroup" data-iconpos="right">';
                  }
                });
                playerHtml += '</fieldset></div>';
                $("#team2PlayerSelector").html(playerHtml);

                //show team 2 player selectors
                $("#team2PlayerSelector").trigger ("create");
                
                //set team count
                team2PlayerCount = collection.length;
                team2PlayerCountText.text = team2PlayerCount + "/11 Players";

                // check all players
                $("#team2PlayerSelector input").attr('checked', true);
                $("#team2PlayerSelector input").checkboxradio("refresh");

                // attach change event handler for inputs
                $("#team2PlayerSelector input").on("change.custom",playerSelectorChangeHandler);

                $("#team2PlayerSelector").show();
            },
            error: function() {
                console.log("Error in contacting server.");  
            }
          });
        } else { //value is empty
          //reset count
          team2PlayerCount = 0;
          team2PlayerCountText.text = team2PlayerCount + "/11 Players";
          baseView.team2ID = null;
          $("#team2PlayerSelector").hide();
        } 
      }
      // Check error if team 1 and 2 are same teams
      if (baseView.team1ID != null && baseView.team2ID != null && baseView.team1ID == baseView.team2ID) {
        //Show error msg!
        var teamErrorText = new createjs.Text("Please choose \ndifferent teams!", "24px Helvetica", "#FFF").set({name: "teamErrorText"});
        teamErrorText.x = 1200;
        teamErrorText.y = 450;
        baseView.recordingPage1Container.addChild(teamErrorText);
        createjs.Tween.get(teamErrorText).to({x: 750}, 100, createjs.Ease.linear);
      } else { //remove error msg if team 1 and 2 are now different
        var teamErrorText = baseView.recordingPage1Container.getChildByName("teamErrorText");
        if (teamErrorText) {
          baseView.recordingPage1Container.removeChild(teamErrorText);
          baseView.stage.update();
        }
      }
    }

    //attach change event handler for team selectors
    $("#team1Selector").on("change.custom",teamSelectorChangeHandler);
    $("#team2Selector").on("change.custom", teamSelectorChangeHandler);

    function playerSelectorChangeHandler(event) {
      var target = $(event.target);
      // console.log(target.context.outerHTML);
      // console.log(target.is(':checked'));
      // console.log(target.hasClass("team1Players"));
      // console.log(team1PlayerCount + "/" + team2PlayerCount);
      if (target.is(':checked')) { 
        if (target.hasClass("team1Players")) { //+1 to sidebar's team 1 player count
          team1PlayerCount++;
          team1PlayerCountText.text = team1PlayerCount + "/11 Players";
        } else { //+1 to sidebar's team 2 player count
          team2PlayerCount++;
          team2PlayerCountText.text = team2PlayerCount + "/11 Players";
        }
      } else { 
        if (target.hasClass("team1Players")) { //-1 to sidebar's team 1 player count
          team1PlayerCount--;
          team1PlayerCountText.text = team1PlayerCount + "/11 Players";
        } else { //-1 to sidebar's team 2 player count
          team2PlayerCount--;
          team2PlayerCountText.text = team2PlayerCount + "/11 Players";
        }
      }
      // console.log(team1PlayerCount + "/" + team2PlayerCount);
      baseView.stage.update();
    }

    //back button
    var backBtn = new Button("Back","#FFF", "#000", 20, 20, 100, 50);
    backBtn.on("pressup", function(event) {
      baseView.stage.removeChild(baseView.recordingPage1Container); // remove Record Game menu page 1 elements
      baseView.stage.addChild(baseView.startPageContainer); // add start page elements
      baseView.stage.update();

      //reset all selectors, counts, etc.
      $("#team1Selector").val('').change();
      $("#team2Selector").val('').change();
      team1PlayerCount = 0;
      team2PlayerCount = 0;
      team1PlayerCountText.text = team1PlayerCount + "/11 Players";
      team2PlayerCountText.text = team2PlayerCount + "/11 Players";

      //remove error texts if they are present
      var teamErrorText = baseView.recordingPage1Container.getChildByName("teamErrorText");
      if (teamErrorText) baseView.recordingPage1Container.removeChild(teamErrorText);
      var playerErrorText = baseView.recordingPage1Container.getChildByName("playerErrorText");
      if (playerErrorText) baseView.recordingPage1Container.removeChild(playerErrorText);

      //hide team and player selectors
      $("#team1SelectorDiv").hide();
      $("#team2SelectorDiv").hide();
      $("#team1PlayerSelector").hide();
      $("#team2PlayerSelector").hide();
    });
    baseView.recordingPage1Container.addChild(backBtn);

    var continueBtn = new Button("Continue","#33FF00", "#000", 742, 644, 250, 100);
    continueBtn.on("pressup", function(event) {
      if (baseView.team1ID != null && baseView.team2ID != null) { // if teams 1 and 2 are selected 
        if (baseView.team1ID != baseView.team2ID) { // if team 1 and 2 are diff
          if (team1PlayerCount == 11 && team2PlayerCount == 11) { //if correct no. of players chosen for each team

            //set global teamIDs with localised teamIDs
            team1ID = baseView.team1ID;
            team2ID = baseView.team2ID;

            //get backbone models of the teams 
            var team1 = baseView.teams.get(team1ID);
            var team2 = baseView.teams.get(team2ID);

            //set team 1 players 'selected' attribute 
            var playerCheckboxes = $("#team1PlayerSelector input");
            for (var i = 0, count = playerCheckboxes.length; i < count; i++) {
              var inputEl = playerCheckboxes[i];
              var player = team1Players.get(inputEl.id);
              if (inputEl.checked) player.select();
              else player.deselect();
            }

            //set red players 'selected' attribute  
            var playerCheckboxes = $("#team2PlayerSelector input");
            for (var i = 0, count = playerCheckboxes.length; i < count; i++) {
              var inputEl = playerCheckboxes[i];
              var player = team2Players.get(inputEl.id);
              if (inputEl.checked) player.select();
              else player.deselect();
            }

            //reset all selectors, counts, etc.
            $("#team1Selector").val('').change();
            $("#team2Selector").val('').change();
            team1PlayerCount = 0;
            team2PlayerCount = 0;
            team1PlayerCountText.text = team1PlayerCount + "/11 Players";
            team2PlayerCountText.text = team2PlayerCount + "/11 Players";

            //remove error texts if they are present
            var teamErrorText = baseView.recordingPage1Container.getChildByName("teamErrorText");
            if (teamErrorText) baseView.recordingPage1Container.removeChild(teamErrorText);
            var playerErrorText = baseView.recordingPage1Container.getChildByName("playerErrorText");
            if (playerErrorText) baseView.recordingPage1Container.removeChild(playerErrorText);

            //remove team and player change listeners
            $("#team1Selector").off('change.custom');
            $("#team2Selector").off('change.custom');
            $("#team1PlayerSelector input").off('change.custom');
            $("#team2PlayerSelector input").off('change.custom');
            //hide team and player selectors
            $("#team1SelectorDiv").hide();
            $("#team2SelectorDiv").hide();
            $("#team1PlayerSelector").hide();
            $("#team2PlayerSelector").hide();

            //clear canvas and stage
            stage.autoClear = true; // This must be true to clear the stage.
            stage.enableDOMEvents(false);
            stage.removeAllEventListeners();
            stage.removeAllChildren();
            stage.clear();

            //completely unbind the view
            baseView.undelegateEvents();
            baseView.$el.removeData().unbind();
            
            //remove view from DOM
            baseView.remove();
            Backbone.View.prototype.remove.call(baseView);

            //create new RecordView
            view = new RecordView({stage: stage, team1: team1, team2: team2, team1Players: team1Players, team2Players: team2Players, isDummy: false});

          } else { //if no. of players are incorrent, show error message
            var playerErrorText = baseView.recordingPage1Container.getChildByName("playerErrorText");
            if (!playerErrorText) {
              playerErrorText = new createjs.Text("Please select the right \nno. of players for both teams!", "24px Helvetica", "#FFF").set({name: "playerErrorText"});
              playerErrorText.x = 1200;
              playerErrorText.y = 550;
              baseView.recordingPage1Container.addChild(playerErrorText);
              createjs.Tween.get(playerErrorText).to({x: 700}, 100, createjs.Ease.linear);
            } else {
              createjs.Tween.get(playerErrorText).to({x: 650, alpha: 0.5, scaleX: 1.2, scaleY: 1.2}, 200)
                .call(function() {
                  createjs.Tween.get(playerErrorText).to({x: 700, alpha: 1, scaleX: 1, scaleY: 1}, 200)
                });
            }
            stage.update();
          }
        } else { // team 1 and 2 are same!
          var teamErrorText = baseView.recordingPage1Container.getChildByName("teamErrorText");
          if (teamErrorText) {
            teamErrorText.text = "Please choose\ndifferent teams!";
            createjs.Tween.get(teamErrorText).to({x: 700, alpha: 0.5, scaleX: 1.2, scaleY: 1.2}, 200)
              .call(function() {
                createjs.Tween.get(teamErrorText).to({x: 750, alpha: 1, scaleX: 1, scaleY: 1}, 200)
              });
          }
        }
      } else {
        var teamErrorText = baseView.recordingPage1Container.getChildByName("teamErrorText");
        if (teamErrorText) {
          teamErrorText.text = "Please choose\nyour teams!";
          createjs.Tween.get(teamErrorText).to({x: 700, alpha: 0.5, scaleX: 1.2, scaleY: 1.2}, 200)
              .call(function() {
                createjs.Tween.get(teamErrorText).to({x: 750, alpha: 1, scaleX: 1, scaleY: 1}, 200)
              });
        } else {
          var teamErrorText = new createjs.Text("Please choose\nyour teams!", "24px Helvetica", "#FFF").set({name: "teamErrorText"});
          teamErrorText.x = 1200;
          teamErrorText.y = 450;
          baseView.recordingPage1Container.addChild(teamErrorText);
          createjs.Tween.get(teamErrorText).to({x: 750}, 100, createjs.Ease.linear);
        }
      }
    });
    baseView.recordingPage1Container.addChild(continueBtn);
  }, //--renderRecordingPage1--

  renderStatsPage1: function () {
    var baseView = this;

    var backBtn = new Button("Back","#FFF", "#000", 20, 20, 100, 50);
    backBtn.on("pressup", function(event) {
      baseView.stage.removeChild(baseView.statsPage1Container); // remove Check Stats menu page 1 elements
      baseView.stage.addChild(baseView.startPageContainer); // add start page elements
      baseView.stage.update();
    });
    baseView.statsPage1Container.addChild(backBtn);

    var menuTitle = new createjs.Text("Last Game's stats", "Bold 50px Helvetica", "#FFF");
    menuTitle.x = 512 - menuTitle.getMeasuredWidth()/2;
    menuTitle.y = 20;
    baseView.statsPage1Container.addChild(menuTitle);

    if (this.match && this.playerMatches && this.team1AllPlayers && this.team2AllPlayers) {
      var matchText = new createjs.Text("Match ID: " + this.match.get("matchID"), "16px Helvetica", "#FFF").set({
        x: 50, y: 85
      });
      matchText.cache(0,0, matchText.getMeasuredWidth(), matchText.getMeasuredHeight());
      baseView.statsPage1Container.addChild(matchText);

      var matchTimeText = new createjs.Text("Match Time: " + msToTime(this.match.get("matchTime")), "16px Helvetica", "#FFF").set({
        x: 250, y: 85
      });
      matchTimeText.cache(0,0, matchTimeText.getMeasuredWidth(), matchTimeText.getMeasuredHeight());
      baseView.statsPage1Container.addChild(matchTimeText);

      var y = 120,
          x = 30;

      //draw up headers
      var headers = ["Player","T", "I", "LO", "RO", "MO", "LI", "RI", "MI", "LG", "RG", "MG", "S", "YC", "RC", "F", "P", "PF", "R", "PT"];

      for (var i = 0, count = headers.length; i < count; i++) {
        var text = new createjs.Text(headers[i], "16px Helvetica", "#FFF");
        if (i == 0) { text.x = x; }
        else { text.x = x + 57 + i * 47; }
        text.y = y;

        text.cache(0,0,text.getMeasuredWidth(), text.getMeasuredHeight() + 5);
        baseView.statsPage1Container.addChild(text);
      };

      //draw up playerMatches stats
      var attributes = ["playerName","tackles", "interceptions", "leftOut", "rightOut", "middleOut", "leftIn", "rightIn", "middleIn", "leftGoal", "rightGoal", "middleGoal", "saves", "yellowCard", "redCard", "fouls","passes", "passFail", "receives", "posessionTime"];
      var j = 0;

      function drawPMatchRow(player) {
        if (player.hasPlayed == true) {
          var pMatch = baseView.playerMatches.where({ playerID: player.get("playerID") })[0];

          for (var i = 0, count = attributes.length; i < count; i++) {
            var textLabel = "";

            if (attributes[i] == "posessionTime") {
              textLabel = Math.round(pMatch.attributes[attributes[i]] / 1000);
            } else if (attributes[i] == "playerName") {
              //initials of name and jersey no.
              textLabel = player.get("playerName").match(/\b(\w)/g).join('. ') + '.';
              textLabel += " (" + player.get("jerseyNo") + ")"; 
            } else {
              textLabel = pMatch.attributes[attributes[i]];
            }
            
            if (j % 2 == 0) var color = "#FFF";
            else var color = "#FFCF79";

            var text = new createjs.Text(textLabel, "16px Helvetica", color);
            if (i == 0) text.x = x;
            else text.x = x + 57 + i * 47;
            text.y = y + 30 + j * 25;

            text.cache(0, 0, text.getMeasuredWidth(), text.getMeasuredHeight() + 5);
            baseView.statsPage1Container.addChild(text);
          };

          j++;
        }
      }

      //team header text
      var text = new createjs.Text("Team: " + this.team1.get("teamName"), "Bold 16px Helvetica", "#FFF");
      text.x = x;
      text.y = y + 30 + j * 25;
      y += 30
      baseView.statsPage1Container.addChild(text);
      text.cache(0, 0, text.getMeasuredWidth(), text.getMeasuredHeight() + 10);

      this.team1AllPlayers.forEach(drawPMatchRow);
      
      //team header text
      var text = new createjs.Text("Team: " + this.team2.get("teamName"), "Bold 16px Helvetica", "#FFF");
      text.x = x;
      text.y = y + 35 + j * 25;
      y += 30;
      baseView.statsPage1Container.addChild(text);
      text.cache(0, 0, text.getMeasuredWidth(), text.getMeasuredHeight() + 10);

      this.team2AllPlayers.forEach(drawPMatchRow);

    } else {
      var msg = new createjs.Text("No games recorded yet", "50px Helvetica", "#FFF");
      msg.x = 512 - msg.getMeasuredWidth()/2;
      msg.y = 384 - msg.getMeasuredHeight()/2;
      baseView.statsPage1Container.addChild(msg);
    }

  } //--renderStatsPage1--
});

var RecordView = Backbone.View.extend({
  initialize: function(args) {
    var baseView = this;

    screenState = recording; //variable to indicate state of screen

    // easeljs stage passed as argument.
    this.stage = args.stage;
    this.stage.enableDOMEvents(true);

    // enableMouseOver is necessary to enable mouseover event http://www.createjs.com/Docs/EaselJS/classes/DisplayObject.html#event_mouseover
    this.stage.enableMouseOver(15);

    this.isDummy = args.isDummy; //check whether initializing dummy field

    //show loading message
    var loadContainer = new createjs.Container().set({ name: "loadContainer"});

    var shadedOverlay = new createjs.Shape();
    shadedOverlay.graphics.beginFill("#000").drawRect(0,0,1024,768);
    loadContainer.addChild(shadedOverlay);

    var msg = new createjs.Text("Loading...", "50px Helvetica", "#FFF").set({ name: "msg"});
    msg.x = 512 - msg.getMeasuredWidth()/2;
    msg.y = 320;
    loadContainer.addChild(msg);

    this.stage.addChild(loadContainer);

    // a player container to hold all the players
    this.playerContainer = new createjs.Container();
    this.stage.addChild(this.playerContainer);

    // a container to hold interactive field elements
    this.fieldElementsContainer = new createjs.Container();
    this.stage.addChild(this.fieldElementsContainer);

    //container to hold static elements
    this.staticElementsContainer = new createjs.Container(); 
    this.stage.addChild(this.staticElementsContainer);

    // backbone models of teams 1 and 2
    this.team1 = args.team1;
    this.team2 = args.team2;

    // team 1 and 2 players and their subs
    this.team1Players = new PlayerCollection([], { teamID: team1ID});
    this.team2Players = new PlayerCollection([], { teamID: team2ID});
    this.team1Subs = new PlayerCollection([], { teamID: team1ID});
    this.team2Subs = new PlayerCollection([], { teamID: team2ID});

    // subs picking containers
    this.team1SubsContainer = new createjs.Container();
    this.team2SubsContainer = new createjs.Container();

    args.team1Players.forEach(function(player) {
      if (player.selected == true) { 
        player.hasPlayed = true; //property that shows player has played in game 
        baseView.team1Players.add(player);
      } else {
        player.hasPlayed = false;
        baseView.team1Subs.add(player);
      }
    });

    args.team2Players.forEach(function(player) {
      if (player.selected == true) { 
        player.hasPlayed = true; //property that shows player has played in game 
        baseView.team2Players.add(player);
      } else {
        player.hasPlayed = false;
        baseView.team2Subs.add(player);
      }
    });

    this.renderSubContainers();

    //create and save a new Match and on success, create playerMatches for all selected players
    this.playerMatches = new PlayerMatchCollection();
    this.match = new Match({team1: team1ID, team2: team2ID});

    this.match.save(null, {
      success: function (model) {
          console.log("Match of ID " + model.get("matchID") + " created and saved to database.");

          var count = 0;

          //function that handles creation and saving of player matches
          function createPlayerMatches(player) {
            var pMatch = new PlayerMatch({ playerID: player.get("playerID"), matchID: model.get("matchID") });
            pMatch.save(null, {
              success: function(model) {
                count++;
                baseView.playerMatches.add(pMatch);
                // console.log(count + ". PlayerMatch for player ID " + model.get("playerID") + " created and saved to database.");
                if (count == 22) {
                  baseView.stage.removeChild(loadContainer);
                  baseView.render();
                }
              },
              error: function(model, resp) {
                console.log(resp);
              },
              wait: true
            })
          }

          //create playerMatches for all selected players
          baseView.team1Players.each(createPlayerMatches);
          baseView.team2Players.each(createPlayerMatches);
      },
      error: function() {
          console.log("Error in contacting server.");  
      },
      wait: true
    });

    this.fieldSettings = {
      scale: 1,
      height: 768,
      width: 1024,
      topBound: 100,
      bottomBound: 768 - 100, 
      leftBound: 140,
      midBound: 512,
      rightBound: 1024 - 140
    };

    this.team1PlayerPositions = [
      // forwards/strikers
      {position: "lForward", x: 438, y: 329},
      {position: "rForward", x: 438, y: 439},
      // midfielders
      {position: "lMidFielder", x: 364, y: 219},
      {position: "clMidFielder", x: 364, y: 329},
      {position: "crMidFielder", x: 364, y: 439},
      {position: "rMidFielder", x: 364, y: 549},
      // defenders/backs
      {position: "lBack", x: 290, y: 219},
      {position: "clBack", x: 290, y: 329},
      {position: "crBack", x: 290, y: 439},
      {position: "rBack", x: 290, y: 549},   
      // goalkeeper
      {position: "goalkeeper", x: 200, y: 384}    
    ];

    this.team2PlayerPositions = [
      //forwards
      {position: "rForward", x: 586, y: 329},
      {position: "lForward", x: 586, y: 439},
      //midfielders
      {position: "rMidFielder", x: 660, y: 219},
      {position: "crMidFielder", x: 660, y: 329},
      {position: "clMidFielder", x: 660, y: 439},
      {position: "lMidFielder", x: 660, y: 549},
      //defenders
      {position: "rBack", x: 734, y: 219},
      {position: "crBack", x: 734, y: 329},
      {position: "clBack", x: 734, y: 439},
      {position: "lBack", x: 734, y: 549},   
      //goalkeeper
      {position: "goalkeeper", x: 824, y: 384}    
    ];

    this.ballLocation; // the element the ball is with
    this.currentlySelectedPlayer; // the one being dragged
    this.elementUnderSelectedPlayer; //the element under currently selected player

  }, //--initialize--

  render: function() {
    this.renderField();
   
    // stage.update is needed to render the display to the canvas.
    // if we don't call this nothing will be seen.
    this.stage.update();

    // The Ticker provides a centralized tick at a set interval.
    // we set the fps for a smoother animation.
    createjs.Ticker.on("tick", this.stage);
    createjs.Ticker.setFPS(FPS);
  }, //--render--

  //render field
  renderField: function() {
    preload.on("complete", handleComplete, null, true); //attach one-off listener
    preload.loadManifest([
      {id: "field", src:"assets/grass-texture-1024x768.jpg"}, 
      //{id: "soccerBall", src: "assets/soccer-ball-35x34.png"}, 
      {id: "soccerBall", src: "assets/soccer-ball-20x20.png"}, 
      {id: "playImg", src: "assets/play-arrow.png"}, 
      {id: "pauseImg", src: "assets/pause-img.png"}
    ]);

    var baseView = this;

    function handleComplete (event) {
      //once field image is loaded, create a bitmap, add it to stage and update stage
      var fieldBitmap = new createjs.Bitmap(preload.getResult("field")).set({name: "grass"});
      fieldBitmap.cache(0,0,1024,768,1);
      baseView.stage.addChild(fieldBitmap); 
      
      //rendering players
      if (baseView.isDummy == true) { //DUMMY!
        baseView.populateDummyField(); 
      } 
      else {
        //for now, players are randomly positions disregarding the positions they play, this is because
        //sample data is too inconsistent, will probably need to do validation to fixed values, e.g.
        // Goalkeeper, Defender(lDefender?,rDefender?), Midfielder (lMidfielder?,rMidfielder?), Striker(Wing?, Forward?)
        var i = 0, j = 0;
        //for each player in team1Players, render it.
        baseView.team1Players.each(function(player) {
          if (player.selected == true) {
            var pos = this.team1PlayerPositions[i]; 
            baseView.renderPlayer(pos.x , pos.y, player, pos.position , team1Color);
            i++;
          }
        }, baseView);
        // for each player in team2Players, render it.
        baseView.team2Players.each(function(player) {
          if (player.selected == true) {
            var pos = this.team2PlayerPositions[j];
            baseView.renderPlayer(pos.x , pos.y, player, pos.position, team2Color);
            j++;
          }
        }, baseView);
      }

      //then render all the field elements
      baseView.renderFieldElements();

      // move field elements to the top
      baseView.stage.setChildIndex(baseView.fieldElementsContainer, baseView.stage.getNumChildren() - 1);
      // move static elements above field elements
      baseView.stage.setChildIndex(baseView.staticElementsContainer, baseView.stage.getNumChildren() - 1);
      // move the players above static elements
      baseView.stage.setChildIndex(baseView.playerContainer, baseView.stage.getNumChildren() - 1); 
      // move the ball to the very TOP!
      baseView.stage.setChildIndex(baseView.stage.getChildByName('soccerBallEle'), baseView.stage.getNumChildren() - 1); 
    }
  }, //--renderField--
  
  //render field elements
  renderFieldElements: function() {
    console.log("RENDERING FIELD ELEMENTS");
    var baseView = this;  //get reference to view


    // drawing field outlines
    var divider = new FieldElement({'x': 512, 'y': 100, 'width': 0, 'height': 568, 'bgStroke': "white",'bgColor': "white", 'bgStrokeThickness':"6"});
    var fieldOutline = new FieldElement({'x': 143, 'y': 103, 'width': 738, 'height': 562, 'bgStroke': "white", 'bgStrokeThickness': "6"});
    divider.cache(-3,0,6,568, 1);
    fieldOutline.cache(-3,-3,744,568,1);
    this.stage.addChild(divider);
    this.stage.addChild(fieldOutline);

    // draw goal dividers
    var goalDivider1 = new createjs.Shape().set({name: "goalDivider1"});
    goalDivider1.graphics.setStrokeStyle(1).beginStroke("black").moveTo(70, 341).lineTo(140, 341).endStroke();
    var goalDivider2 = new createjs.Shape().set({name: "goalDivider2"});
    goalDivider2.graphics.setStrokeStyle(1).beginStroke("black").moveTo(70, 426).lineTo(140, 426).endStroke();
    var goalDivider3 = new createjs.Shape().set({name: "goalDivider3"});
    goalDivider3.graphics.setStrokeStyle(1).beginStroke("black").moveTo(884, 341).lineTo(954, 341).endStroke();
    var goalDivider4 = new createjs.Shape().set({name: "goalDivider4"});
    goalDivider4.graphics.setStrokeStyle(1).beginStroke("black").moveTo(884, 426).lineTo(954, 426).endStroke();
    this.staticElementsContainer.addChild(goalDivider1);
    this.staticElementsContainer.addChild(goalDivider2);
    this.staticElementsContainer.addChild(goalDivider3);
    this.staticElementsContainer.addChild(goalDivider4);

    // adding message box, make it invisible
    var msgBox = new FieldElement({'name': 'msgBox', 'x': 512, 'y': 110, 'fitText': true, 'textColor': "white", 'bgColor': "black", 'bgStroke': "white", 'bgStrokeThickness': "2", 'visible': false});
    this.stage.addChild(msgBox); 
    msgBox.changeText("Position your players.");

    //drawing left out boxes
    var lRightOutBox = new FieldElement({'name': 'lRightOutBox', 'x': 0, 'y': 50,'width': 140,'height': 206, 'label': "Right Out", 'textColor': "white", 'bgColor': "orangered",'textRotation': -90});
    var lOverOutBox = new FieldElement({'name': 'lOverOutBox', 'x': 0, 'y': 256,'width': 70,'height': 256, 'label': "Over Out", 'textColor': "white", 'bgColor': "orangered",'textRotation': -90});
    var lLeftOutBox = new FieldElement({'name': 'lLeftOutBox', 'x': 0, 'y': 512,'width': 140,'height': 256, 'label': "Left Out", 'textColor': "white", 'bgColor': "orangered",'textRotation': -90});
    this.fieldElementsContainer.addChild(lRightOutBox);
    this.fieldElementsContainer.addChild(lOverOutBox);
    this.fieldElementsContainer.addChild(lLeftOutBox);

    //drawing right out boxes
    var rLeftOutBox = new FieldElement({'name': 'rLeftOutBox', 'x': 884, 'y': 50,'width': 140,'height': 206, 'label': "Left Out", 'textColor': "white", 'bgColor': "orangered",'textRotation': 90});
    var rOverOutBox = new FieldElement({'name': 'rOverOutBox', 'x': 954, 'y': 256,'width': 70,'height': 256, 'label': "Over Out", 'textColor': "white", 'bgColor': "orangered",'textRotation': 90});
    var rRightOutBox = new FieldElement({'name': 'rRightOutBox', 'x': 884, 'y': 512,'width': 140,'height': 206, 'label': "Right Out", 'textColor': "white", 'bgColor': "orangered",'textRotation': 90});
    this.fieldElementsContainer.addChild(rLeftOutBox);
    this.fieldElementsContainer.addChild(rOverOutBox);
    this.fieldElementsContainer.addChild(rRightOutBox);

    // drawing tackles box and interceptions box
    var tacklesBox = new FieldElement({'name': 'tacklesBox', 'x': 140, 'y': 0, 'width': 372, 'height': 100, 'label': "Tackles", 'textColor': "white", 'bgColor': "teal"});
    var interceptionsBox = new FieldElement({'name': 'interceptionsBox', 'x': 512, 'y': 0, 'width': 372, 'height': 100, 'label': "Interceptions", 'textColor': "white", 'bgColor': "green"});
    this.fieldElementsContainer.addChild(tacklesBox);
    this.fieldElementsContainer.addChild(interceptionsBox);

    // drawing red card box, foul box, and yellow card box
    var redCardBox = new FieldElement({'name': 'redCardBox', 'x': 140, 'y': 668, 'width': 188, 'height': 100, 'label': "Red Card", 'textColor': "white", 'bgColor': "red"});
    var foulBox = new FieldElement({'name': 'foulBox', 'x': 328, 'y': 668, 'width': 368, 'height': 100, 'label': "Foul", 'textColor': "white", 'bgColor': "gray"});
    var yellowCardBox = new FieldElement({'name': 'yellowCardBox', 'x': 696, 'y': 668, 'width': 188, 'height': 100, 'label': "Yellow Card", 'textColor': "black", 'bgColor': "yellow"});
    this.fieldElementsContainer.addChild(redCardBox);
    this.fieldElementsContainer.addChild(foulBox);
    this.fieldElementsContainer.addChild(yellowCardBox);

    // drawing timer box
    var timerBox = new FieldElement({'name': 'timerBox', 'x': 0, 'y': 0, 'width': 140, 'height': 50, 'label': "Start Game", 'textColor': "white", 'bgColor': "lightpink"});
    timerBox.cursor = "pointer";
    // add timerBox pressup listener
    timerBox.on("pressup", function(event) {
      //first time pressing
      if (timerBox.getChildByName("text").regX != 15) { 
        timerBox.getChildByName("text").regX = 15;
        msgBox.changeText("Game has started!");
      }

      if (recordingMode == "paused") { //paused mode -> playing mode
        outBox.cursor = "pointer"; //change cursor for outBox to pointer

        var pauseBitmap = new createjs.Bitmap(preload.getResult("pauseImg")).set({x: 90, y: 14});
        event.target.removeChildAt(2); //hackish but oh well
        event.target.addChild(pauseBitmap);

        baseView.playerContainer.children.forEach(function(playerEle) {
          //get original position where player is mouse downed
          playerEle.ox = playerEle.x;
          playerEle.oy = playerEle.y;
        });

        recordingMode = "playing"; // change mode

        if (baseView.matchTime <= 0) {
          timer.start();
        } else {
          timer.pause(); //toggle, paused -> running
        }
      } else { //playing mode -> paused mode
        outBox.cursor = null; //change cursor for outBox to normal

        var playBitmap = new createjs.Bitmap(preload.getResult("playImg")).set({x: 90, y: 14});
        event.target.removeChildAt(2); //hackish but oh well
        event.target.addChild(playBitmap);

        recordingMode = "paused"; // change mode

        timer.pause(); //toggle, running -> paused
      }
    });
    
    //create a Tock timer!
    this.matchTime = 0;
    var timer = new Tock({
      interval: 1000,
      callback: function(){
        baseView.matchTime = timer.lap();
        timerBox.textObj.text = timer.msToTime(baseView.matchTime);
      }
    });

    this.stage.addChild(timerBox);

    // drawing half-time/end box
    var halfTimeEndBox = new FieldElement({'name': 'halfTimeEndBox', 'x': 884, 'y': 0, 'width': 140, 'height': 50, 'label': "Half Time", 'textColor': "white", 'bgColor': "lightblue"});
    halfTimeEndBox.cursor = "pointer";
    halfTimeEndBox.on("pressup", function(event) {
      console.log("Half-Time");

      //trigger pressup event on timerBox to pause if mode is playing
      if (recordingMode == "playing") baseView.stage.getChildByName("timerBox").dispatchEvent("pressup");

      //switches the sides of the teams in the field
      function switchSideHandler() {
        msgBox.changeText("Sides have been switched! Position your players.");

        //swap colors
        var tempColor = team1Color;
        team1Color = team2Color;
        team2Color = tempColor;
        //swap id
        var tempID = team1ID;
        team1ID = team2ID;
        team2ID = tempID;

        //mirror-swap player elements' positions in field
        baseView.playerContainer.children.forEach(function(player) {
          //formula: x = x + 2 * distance between x and midpoint 
          if (player.x < 512) player.x += 2 * (512 - player.x);
          //formula: x = x - 2 * distance between x and midpoint
          else player.x -= 2 * (player.x - 512);
        });
      }
      baseView.prompt("Switch team sides?", switchSideHandler);


      //change msg box text
      msgBox.changeText("Half-time! Ball reset to center of field.");

      //change halfTimeEndBox text to "End"
      event.target.changeText("End");

      //if ball was with a player, unglow player
      if (baseView.ballLocation instanceof PlayerElement) {
        baseView.ballLocation.unglow();
      }

      //if not in mid circle already, then move ball back to it
      if (baseView.ballLocation != startBallCircle) {
        baseView.ballLocation = startBallCircle;
        createjs.Tween.get(soccerBallEle).to({x: startBallCircle.x, y: startBallCircle.y}, 150, createjs.Ease.linear);
      }

      //remove this event listener - for half-time
      event.remove();
      //add a new event listener - for end
      event.target.on("mousedown", function(event) {
        var match = baseView.match;
        var playerMatches = baseView.playerMatches;
        var team1 = baseView.team1;
        var team2 = baseView.team2;
        baseView.team1Players.add(baseView.team1Subs.models);
        baseView.team2Players.add(baseView.team2Subs.models);
        var team1AllPlayers = baseView.team1Players;
        var team2AllPlayers = baseView.team2Players;
        match.set({matchTime: baseView.matchTime});

        preload.removeAll();

        //clear canvas and stage
        stage.autoClear = true; // This must be true to clear the stage.
        stage.enableDOMEvents(false);
        stage.removeAllEventListeners();
        stage.removeAllChildren();
        stage.clear();

        //completely unbind the view
        baseView.undelegateEvents();
        baseView.$el.removeData().unbind();
        
        //remove view from DOM
        baseView.remove();
        Backbone.View.prototype.remove.call(baseView);

        //create new EndView
        view = new EndView({stage: stage, match: match, playerMatches: playerMatches, team1: team1, team2: team2, team1AllPlayers: team1AllPlayers, team2AllPlayers: team2AllPlayers});
        view.render();
      });
    });
    this.stage.addChild(halfTimeEndBox);

    // drawing out box
    var outBox = new FieldElement({'name': 'outBox', 'x': 884, 'y': 718, 'width': 140, 'height': 50, 'label': "Out", 'textColor': "white", 'bgColor': "black"});
    outBox.on("pressup", function(event) {
      //logic to handle outs
      if (recordingMode == "playing" && event.target.disabled != true) {
        console.log("OUT");
        event.target.disabled = true;

        //change msg box text
        msgBox.changeText("Ball out! Choose player who gets the ball.");

        //if ball was with a player, unglow player
        if (baseView.ballLocation instanceof PlayerElement) {
          baseView.ballLocation.unglow();
        }

        //move ball to outBox
        baseView.ballLocation = event.target; 
        var soccerBallEle = view.stage.getChildByName('soccerBallEle'); //get reference to soccerball
        createjs.Tween.get(soccerBallEle, {override: true}).to({x: event.target.x + event.target.width/2, y: event.target.y + event.target.height/2}, 150, createjs.Ease.linear).wait(50)
        .call(
          function() {
            //make all players glow and attach a one-off listener to all players
            view.playerContainer.children.forEach(function(player) {
              player.glow("0xFFFFFF"); 

              player.on("pressup", function(event) {
                //inefficient..
                view.playerContainer.children.forEach(function(player) { 
                  player.removeAllEventListeners("pressup"); 
                  player.on("pressup", player.PressUpFn);
                });

                //set ball location to event target and tween the ball to target
                view.ballLocation = event.target;
                var soccerBallEle = view.stage.getChildByName('soccerBallEle'); //get reference to soccerball
                createjs.Tween.get(soccerBallEle, {override:true}).to({x: event.target.x + 15, y: event.target.y + 15}, 150, createjs.Ease.linear);
                
                //change msg box text
                msgBox.changeText(event.target.teamColor + " No. " + event.target.label + " received the ball!");

                view.playerContainer.children.forEach(function(player) { 
                  player.disabled = false; //enable all players
                  player.cursor = "pointer";
                  player.unglow(); //unglow all players
                });

                //glow new player with the ball
                event.target.glow();
                outBox.disabled = false;
              } ,null ,true);
            }); //end of forEach
        }); //end of Tween
      } //end of if this.mode == "playing"
    }); //end of on
    this.stage.addChild(outBox);

    // drawing left goal boxes
    var lRightGoalBox = new FieldElement({'name': 'lRightGoalBox', 'x': 70, 'y': 256, 'width': 70, 'height': 85, 'bgColor': "azure"});
    var lMidGoalBox = new FieldElement({'name': 'lMidGoalBox', 'x': 70, 'y': 341, 'width': 70, 'height': 85, 'label': "Goal", 'textColor': "black", 'bgColor': "azure", 'textRotation': -90});
    var lLeftGoalBox = new FieldElement({'name': 'lLeftGoalBox', 'x': 70, 'y': 426, 'width': 70, 'height': 85, 'bgColor': "azure"});
    this.fieldElementsContainer.addChild(lRightGoalBox);
    this.fieldElementsContainer.addChild(lMidGoalBox);
    this.fieldElementsContainer.addChild(lLeftGoalBox);

    // drawing right goal boxes
    var rLeftGoalBox = new FieldElement({'name': 'rLeftGoalBox', 'x': 884, 'y': 256, 'width': 70, 'height': 85, 'bgColor': "azure"});
    var rMidGoalBox = new FieldElement({'name': 'rMidGoalBox', 'x': 884, 'y': 341, 'width': 70, 'height': 85, 'label': "Goal", 'textColor': "black", 'bgColor': "azure", 'textRotation': 90});
    var rRightGoalBox = new FieldElement({'name': 'rRightGoalBox', 'x': 884, 'y': 426, 'width': 70, 'height': 85, 'bgColor': "azure"});
    this.fieldElementsContainer.addChild(rLeftGoalBox);
    this.fieldElementsContainer.addChild(rMidGoalBox);
    this.fieldElementsContainer.addChild(rRightGoalBox);

    // drawing starting center ball circle
    var startBallCircle = new FieldElement({'name': 'startBallCircle', 'type': "circle",'x': 512, 'y': 384, 'radius': 50, 'bgStroke': "white", 'bgStrokeThickness':"6"});
    //setting hit area of center ball circle to be wider
    var hit = new createjs.Shape();
    hit.graphics.beginFill("#000").drawCircle(0, 0 ,53);
    startBallCircle.hitArea = hit;

    this.fieldElementsContainer.addChild(startBallCircle);

    // drawing soccer ball
    var soccerBallImg = preload.getResult("soccerBall");
    var soccerBallEle = new FieldElement({'name': 'soccerBallEle', 'type': "bitmap",'resource': soccerBallImg ,'x': 512, 'y': 384});
    this.stage.addChild(soccerBallEle); // we want this to be in a separate layer than other field elements so it can be above the player elements 

    this.ballLocation = startBallCircle; // ball starts in center of field

    this.fieldEleCount = view.fieldElementsContainer.children.length;
  }, //--renderFieldElements--

  //render a player
  renderPlayer: function(x, y, player, position, colorObj) {
    // var that = this;
    var baseView = this;  //get reference to view

    // build the player element
    var playerEle = new PlayerElement(x, y, player, position, colorObj);

    this.playerContainer.addChild(playerEle);

    return playerEle;
  }, //--renderPlayer--

  //remove a player from field
  removePlayer: function(playerEle) {
    // remove selected player from field
    playerEle.visible = false;

    this.playerContainer.removeChild(playerEle);

  }, //--removePlayer--

  renderSubContainers: function() {
    var baseView = this;

    //reset containers
    baseView.team1SubsContainer = new createjs.Container();
    baseView.team2SubsContainer = new createjs.Container();

    var i = 0;

    if (baseView.team1Subs.length > 0) {
      baseView.team1Subs.each(function(sub) {
        var subBtn = new Button(sub.get('playerName') + ' (' + sub.get('jerseyNo') + ")", "white", "black", 10, i * 60, 250, 50, 24);
        subBtn.subPlayer = sub;
        baseView.team1SubsContainer.addChild(subBtn);
        i++;
      });
    }

    i = 0;

    if (baseView.team2Subs.length > 0) {
      baseView.team2Subs.each(function(sub) {
        var subBtn = new Button(sub.get('playerName') + ' (' + sub.get('jerseyNo') + ")", "white", "black", 10, i * 60, 250, 50, 24);
        subBtn.subPlayer = sub;
        baseView.team2SubsContainer.addChild(subBtn);
        i++;
      });
    }

  }, //--renderSubContainers--

  // populates field with dummy players - may be useful for making a tutorial
  populateDummyField: function() {
    var baseView = this;

    //function that creates a dummy player
    function createDummyPlayer (x, y, color) {
      var dummyP = new Player({jerseyNo: Math.floor((Math.random() * 42) + 1)});
      var dummyPEl = new PlayerElement(x, y, dummyP, color);
      baseView.playerContainer.addChild(dummyPEl);
      return dummyPEl;
    }

    //team 1
    for (var i = 0, count = this.team1PlayerPositions.length; i < count; i++) {
      var currPos = this.team1PlayerPositions[i];
      createDummyPlayer(currPos.x, currPos.y, team1Color);
    };

    //team 2
    for (var i = 0, count = this.team2PlayerPositions.length; i < count; i++) {
      var currPos = this.team2PlayerPositions[i];
      createDummyPlayer(currPos.x, currPos.y, team2Color);
    };
  }, //--populateDummyField--

  //display prompt
  //pass in message to show in prompt and function to call if prompt is replied with yes
  prompt: function(msg, fn) {
    var baseView = this;

    var promptContainer = new createjs.Container().set({ name: "promptContainer"});

    var x       = 250,
        y       = 250,
        width   = 524,
        height  = 300;

    var promptShape = new createjs.Shape();
    promptShape.graphics.beginFill("#000").setStrokeStyle(3).beginStroke("#FFF").drawRect(x,y,width,height);
    promptContainer.addChild(promptShape);

    var promptText = new createjs.Text(msg, "50px Helvetica", "#FFF");
    promptText.x = (x + width + x)/2 - promptText.getMeasuredWidth()/2;
    promptText.y = y + 50;
    promptContainer.addChild(promptText);

    var yesBtn = new Button("Yes", "#FFF", "#000", x + 50, y + height - 80 - 35, 150, 80);
    yesBtn.on("pressup", function() {
      baseView.stage.removeChild(promptContainer);
      baseView.stage.update(); 
      fn(); //call function
    });
    promptContainer.addChild(yesBtn);

    var noBtn = new Button("No", "#FFF", "#000", x + width - 150 - 50, y + height - 80 - 35, 150, 80);
    noBtn.on("pressup", function(){
      baseView.stage.removeChild(promptContainer);
      baseView.stage.update();
    });
    promptContainer.addChild(noBtn);

    baseView.stage.addChild(promptContainer);
  } //--prompt--
});

var EndView = Backbone.View.extend({
  initialize: function (args) {
    screenState = end; //variable to indicate state of screen

     // easeljs stage passed as argument.
    this.stage = args.stage;
    this.stage.enableDOMEvents(true);

    this.match = args.match;
    this.playerMatches = args.playerMatches;
    this.team1 = args.team1;
    this.team2 = args.team2;
    this.team1AllPlayers = args.team1AllPlayers;
    this.team2AllPlayers = args.team2AllPlayers;


    //container to hold elements on ending menu page
    this.endPageContainer = new createjs.Container();
    this.stage.addChild(this.endPageContainer);
    //container to hold elements on stats page
    this.statsPage1Container = new createjs.Container();

  }, //--initialize--

  render: function () {
    //render pages
    this.renderEndPage();
    this.renderStatsPage1();

    this.stage.update();

    createjs.Ticker.on("tick", this.stage);
    createjs.Ticker.setFPS(FPS);
  }, //--render--

  renderEndPage: function () {
    var baseView = this;

    //green background!
    var background = new createjs.Shape();
    background.graphics.beginFill("green").drawRect(0,0,1024,768);
    this.stage.addChild(background);

    this.stage.setChildIndex(background, 0);

    //Menu title at top of screen
    var menuTitle = new createjs.Text("Recording Ended!", "Bold 75px Helvetica", "#FFF");
    menuTitle.x = 512 - menuTitle.getMeasuredWidth()/2;
    menuTitle.y = 50;
    this.endPageContainer.addChild(menuTitle);

    function switchToMenu () {
      //switch over to menu view
      var playerMatches = baseView.playerMatches;
      var match = baseView.match;
      var team1 = baseView.team1;
      var team2 = baseView.team2;
      var team1AllPlayers = baseView.team1AllPlayers;
      var team2AllPlayers = baseView.team2AllPlayers;

      //clear canvas and stage
      stage.autoClear = true; // This must be true to clear the stage.
      stage.enableDOMEvents(false);
      stage.removeAllEventListeners();
      stage.removeAllChildren();
      stage.clear();

      //completely unbind the view
      baseView.undelegateEvents();
      baseView.$el.removeData().unbind();
      
      //remove view from DOM
      baseView.remove();
      Backbone.View.prototype.remove.call(baseView);

      view = new MenuView({stage: stage, teams: allTeams, team1: team1, team2: team2, team1AllPlayers: team1AllPlayers, team2AllPlayers: team2AllPlayers, playerMatches: playerMatches, match: match});
      view.render();
    }

    var count = 0;
    //OK button
    var saveBtn = new Button("Save","#FFF", "#000", 162, 294, 300, 150);
    saveBtn.on("pressup", function(event) {
      var promptContainer = new createjs.Container().set({ name: "promptContainer"});

      var shadedOverlay = new createjs.Shape();
      shadedOverlay.graphics.beginFill("#000").drawRect(0,0,1024,768);
      promptContainer.addChild(shadedOverlay);

      var msg = new createjs.Text("Please wait...", "50px Helvetica", "#FFF").set({ name: "msg"});
      msg.x = 512 - msg.getMeasuredWidth()/2;
      msg.y = 320;
      promptContainer.addChild(msg);

      baseView.endPageContainer.addChild(promptContainer);

      baseView.stage.enableDOMEvents(false);

      baseView.stage.update();
      console.log(baseView.playerMatches);
      baseView.match.save(null, {
        success: function (model, resp) { //match save success!
          baseView.playerMatches.each(function(pMatch) { //try and save playerMatches now
            pMatch.save(null, {
              type: 'put',
              success: function (model, resp) { //playerMatches save success!
                count++;
                if (count == baseView.playerMatches.length) {

                  baseView.endPageContainer.getChildByName("promptContainer").getChildByName("msg").text = "Save success!";
                  
                  this.stage.enableDOMEvents(true);

                  baseView.stage.on("pressup", switchToMenu, null, true);

                  baseView.stage.update();
                }
              },
              error: function (model, resp) {
                console.log("Cannot save playermatch:");
                console.log(model);
                console.log(resp);
              }
            }); // end of save
          }); // end of each function
        }, // end of success
        error: function (model, resp) {
          console.log("Cannot save match");
          console.log(model);
        }
      }); //end of save
    }); // end of on
    this.endPageContainer.addChild(saveBtn);

    //cancel button
    var cancelBtn = new Button("Do not save","#FFF", "#000", 562, 294, 300, 150);
    cancelBtn.on("pressup", function(event) {
      if (!promptContainer) {
        //If no prompt, create prompt
        var promptContainer = new createjs.Container();

        var shadedOverlay = new createjs.Shape();
        shadedOverlay.graphics.beginFill("#000").drawRect(0,0,1024,768);
        promptContainer.addChild(shadedOverlay);

        var confirmText = new createjs.Text("Are you sure?", "50px Helvetica", "#FFF");
        confirmText.x = 512 - confirmText.getMeasuredWidth()/2;
        confirmText.y = 150;
        promptContainer.addChild(confirmText);

        var yesBtn = new Button("Yes", "#FFF", "#000", 212, 254, 250, 130);
        yesBtn.on("pressup", switchToMenu);
        promptContainer.addChild(yesBtn);

        var noBtn = new Button("No", "#FFF", "#000", 562, 254, 250, 130);
        noBtn.on("pressup", function(){
          baseView.stage.removeChild(promptContainer);
          baseView.stage.update();
        });
        promptContainer.addChild(noBtn);
      }

      //show prompt
      baseView.stage.addChild(promptContainer);

      baseView.stage.update();
    });
    this.endPageContainer.addChild(cancelBtn);

    //Check recorded statss button
    var statsBtn = new Button("Check recorded stats","#FF0", "#000", 362, 484, 300, 150);
    statsBtn.on("pressup", function(event) {
      baseView.stage.removeChild(baseView.endPageContainer); // remove start page elements 
      baseView.stage.addChild(baseView.statsPage1Container); // add Check Stats menu page 1 elements
      baseView.stage.update();
    });
    this.endPageContainer.addChild(statsBtn);

  }, //----renderEndPage----

  renderStatsPage1: function () {
    var baseView = this;

    var backBtn = new Button("Back","#FFF", "#000", 20, 20, 100, 50);
    backBtn.on("pressup", function(event) {
      baseView.stage.removeChild(baseView.statsPage1Container); // remove Check Stats menu page 1 elements
      baseView.stage.addChild(baseView.endPageContainer); // add end page elements
      baseView.stage.update();
    });
    baseView.statsPage1Container.addChild(backBtn);

    var menuTitle = new createjs.Text("Last Game's stats", "Bold 50px Helvetica", "#FFF");
    menuTitle.x = 512 - menuTitle.getMeasuredWidth()/2;
    menuTitle.y = 20;
    baseView.statsPage1Container.addChild(menuTitle);

    if (this.match && this.playerMatches && this.team1AllPlayers && this.team2AllPlayers) {
      var matchText = new createjs.Text("Match ID: " + this.match.get("matchID"), "16px Helvetica", "#FFF").set({
        x: 50, y: 85
      });
      matchText.cache(0,0, matchText.getMeasuredWidth(), matchText.getMeasuredHeight());
      baseView.statsPage1Container.addChild(matchText);

      var matchTimeText = new createjs.Text("Match Time: " + msToTime(this.match.get("matchTime")), "16px Helvetica", "#FFF").set({
        x: 250, y: 85
      });
      matchTimeText.cache(0,0, matchTimeText.getMeasuredWidth(), matchTimeText.getMeasuredHeight());
      baseView.statsPage1Container.addChild(matchTimeText);

      var y = 120,
          x = 30;

      //draw up headers
      var headers = ["Player","T", "I", "LO", "RO", "MO", "LI", "RI", "MI", "LG", "RG", "MG", "S", "YC", "RC", "F", "P", "PF", "R", "PT"];

      for (var i = 0, count = headers.length; i < count; i++) {
        var text = new createjs.Text(headers[i], "16px Helvetica", "#FFF");
        if (i == 0) { text.x = x; }
        else { text.x = x + 57 + i * 47; }
        text.y = y;

        text.cache(0,0,text.getMeasuredWidth(), text.getMeasuredHeight() + 5);
        baseView.statsPage1Container.addChild(text);
      };

      //draw up playerMatches stats
      var attributes = ["playerName","tackles", "interceptions", "leftOut", "rightOut", "middleOut", "leftIn", "rightIn", "middleIn", "leftGoal", "rightGoal", "middleGoal", "saves", "yellowCard", "redCard", "fouls","passes", "passFail", "receives", "posessionTime"];
      var j = 0;

      function drawPMatchRow(player) {
        if (player.hasPlayed == true) {
          var pMatch = baseView.playerMatches.where({ playerID: player.get("playerID") })[0];

          for (var i = 0, count = attributes.length; i < count; i++) {
            var textLabel = "";

            if (attributes[i] == "posessionTime") {
              textLabel = Math.round(pMatch.attributes[attributes[i]] / 1000);
            } else if (attributes[i] == "playerName") {
              //initials of name and jersey no.
              textLabel = player.get("playerName").match(/\b(\w)/g).join('. ') + '.';
              textLabel += " (" + player.get("jerseyNo") + ")"; 
            } else {
              textLabel = pMatch.attributes[attributes[i]];
            }
            
            if (j % 2 == 0) var color = "#FFF";
            else var color = "#FFCF79";

            var text = new createjs.Text(textLabel, "16px Helvetica", color);
            if (i == 0) text.x = x;
            else text.x = x + 57 + i * 47;
            text.y = y + 30 + j * 25;

            text.cache(0, 0, text.getMeasuredWidth(), text.getMeasuredHeight() + 5);
            baseView.statsPage1Container.addChild(text);
          };

          j++;
        }
      }

      //team header text
      var text = new createjs.Text("Team: " + this.team1.get("teamName"), "Bold 16px Helvetica", "#FFF");
      text.x = x;
      text.y = y + 30 + j * 25;
      y += 30
      baseView.statsPage1Container.addChild(text);
      text.cache(0, 0, text.getMeasuredWidth(), text.getMeasuredHeight() + 10);

      this.team1AllPlayers.forEach(drawPMatchRow);
      
      //team header text
      var text = new createjs.Text("Team: " + this.team2.get("teamName"), "Bold 16px Helvetica", "#FFF");
      text.x = x;
      text.y = y + 35 + j * 25;
      y += 30;
      baseView.statsPage1Container.addChild(text);
      text.cache(0, 0, text.getMeasuredWidth(), text.getMeasuredHeight() + 10);

      this.team2AllPlayers.forEach(drawPMatchRow);

    } else {
      var msg = new createjs.Text("No games recorded yet", "50px Helvetica", "#FFF");
      msg.x = 512 - msg.getMeasuredWidth()/2;
      msg.y = 384 - msg.getMeasuredHeight()/2;
      baseView.statsPage1Container.addChild(msg);
    }
  } //--renderStatsPage1--
});