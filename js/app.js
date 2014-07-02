// main script for the Soccerlytics application

Backbone.emulateJSON = true; // send data to server in JSON format

// possible states game can exist in
var menu	  = 1,	  // at start of app
	recording = 2,    // when a recording starts
	end       = 3,    // when game ends
    stats     = 4;    // when checking statistics
// current screen state
var screenState = menu;
// current recording mode
var recordingMode = "paused";

var team1Color = {name: "Blue", hexCode: "#0E2FD4", outlineColor: "Black", textColor: "White"},
    team2Color = {name: "Red", hexCode: "#DB0909", outlineColor: "Black", textColor: "White"};
    
var team1ID = null,
    team2ID = null;

var teamColorOptions = [{name: "Blue", hexCode: "#0E2FD4", outlineColor: "Black", textColor: "White"},
                        {name: "Red", hexCode: "#DB0909", outlineColor: "Black", textColor: "White"},
                        {name: "Black", hexCode: "#000000", outlineColor: "White", textColor: "White"},
                        {name: "White", hexCode: "#FFFFFF", outlineColor: "Black", textColor: "Black"},
                        {name: "Yellow", hexCode: "#FFFF00", outlineColor: "Black", textColor: "Black"},
                        {name: "Orange", hexCode: "#FF8C00", outlineColor: "Black", textColor: "White"},
                        {name: "Green", hexCode: "#006400", outlineColor: "Black", textColor: "White"},
                        {name: "Brown", hexCode: "#8B4513", outlineColor: "Black", textColor: "White"},
                        {name: "Pink", hexCode: "#FF1493", outlineColor: "White", textColor: "White"},
                        {name: "Grey", hexCode: "#696969", outlineColor: "Black", textColor: "White"},
                        {name: "Cyan", hexCode: "#40E0D0", outlineColor: "White", textColor: "Black"}];

var allTeams;

var FPS = 60;

var stage;
var view;
var preload;

$(document).ready(function() {
	preload = new createjs.LoadQueue(true);
	stage = new createjs.Stage("fieldCanvas"); //create stage for canvas!

	handleMenu();
    // testEndView();
});

// handles menu state
function handleMenu() {
    allTeams = new TeamCollection();
    allTeams.fetch({
        success: function(teams) {
            console.log("MENU");
            view = new MenuView({stage: stage, teams: teams});
            view.render();
        },
        error: function() {
            console.log("Error in contacting server.");  
        },
        wait: true
    });
}

// test record state 
function testRecordGame() {
	var bluePlayers = new PlayerCollection();
	var redPlayers = new PlayerCollection();
	view = new RecordView({stage: stage, bluePlayers: bluePlayers, redPlayers: redPlayers, isDummy: true});
	view.render();
}

function testEndView() {
    var match = new Match({ team1: 1, team2: 3});
    var playerMatches = new PlayerMatchCollection({ playerID: 5, matchID: 5});
    view = new EndView({stage: stage, match: match, playerMatches: playerMatches});
    view.render();
}

//convert color name to hex code
function colourNameToHex(colour)
{
    var colours = {"aliceblue":"#f0f8ff","antiquewhite":"#faebd7","aqua":"#00ffff","aquamarine":"#7fffd4","azure":"#f0ffff",
    "beige":"#f5f5dc","bisque":"#ffe4c4","black":"#000000","blanchedalmond":"#ffebcd","blue":"#0000ff","blueviolet":"#8a2be2","brown":"#a52a2a","burlywood":"#deb887",
    "cadetblue":"#5f9ea0","chartreuse":"#7fff00","chocolate":"#d2691e","coral":"#ff7f50","cornflowerblue":"#6495ed","cornsilk":"#fff8dc","crimson":"#dc143c","cyan":"#00ffff",
    "darkblue":"#00008b","darkcyan":"#008b8b","darkgoldenrod":"#b8860b","darkgray":"#a9a9a9","darkgreen":"#006400","darkkhaki":"#bdb76b","darkmagenta":"#8b008b","darkolivegreen":"#556b2f",
    "darkorange":"#ff8c00","darkorchid":"#9932cc","darkred":"#8b0000","darksalmon":"#e9967a","darkseagreen":"#8fbc8f","darkslateblue":"#483d8b","darkslategray":"#2f4f4f","darkturquoise":"#00ced1",
    "darkviolet":"#9400d3","deeppink":"#ff1493","deepskyblue":"#00bfff","dimgray":"#696969","dodgerblue":"#1e90ff",
    "firebrick":"#b22222","floralwhite":"#fffaf0","forestgreen":"#228b22","fuchsia":"#ff00ff",
    "gainsboro":"#dcdcdc","ghostwhite":"#f8f8ff","gold":"#ffd700","goldenrod":"#daa520","gray":"#808080","green":"#008000","greenyellow":"#adff2f",
    "honeydew":"#f0fff0","hotpink":"#ff69b4",
    "indianred ":"#cd5c5c","indigo":"#4b0082","ivory":"#fffff0","khaki":"#f0e68c",
    "lavender":"#e6e6fa","lavenderblush":"#fff0f5","lawngreen":"#7cfc00","lemonchiffon":"#fffacd","lightblue":"#add8e6","lightcoral":"#f08080","lightcyan":"#e0ffff","lightgoldenrodyellow":"#fafad2",
    "lightgrey":"#d3d3d3","lightgreen":"#90ee90","lightpink":"#ffb6c1","lightsalmon":"#ffa07a","lightseagreen":"#20b2aa","lightskyblue":"#87cefa","lightslategray":"#778899","lightsteelblue":"#b0c4de",
    "lightyellow":"#ffffe0","lime":"#00ff00","limegreen":"#32cd32","linen":"#faf0e6",
    "magenta":"#ff00ff","maroon":"#800000","mediumaquamarine":"#66cdaa","mediumblue":"#0000cd","mediumorchid":"#ba55d3","mediumpurple":"#9370d8","mediumseagreen":"#3cb371","mediumslateblue":"#7b68ee",
    "mediumspringgreen":"#00fa9a","mediumturquoise":"#48d1cc","mediumvioletred":"#c71585","midnightblue":"#191970","mintcream":"#f5fffa","mistyrose":"#ffe4e1","moccasin":"#ffe4b5",
    "navajowhite":"#ffdead","navy":"#000080",
    "oldlace":"#fdf5e6","olive":"#808000","olivedrab":"#6b8e23","orange":"#ffa500","orangered":"#ff4500","orchid":"#da70d6",
    "palegoldenrod":"#eee8aa","palegreen":"#98fb98","paleturquoise":"#afeeee","palevioletred":"#d87093","papayawhip":"#ffefd5","peachpuff":"#ffdab9","peru":"#cd853f","pink":"#ffc0cb","plum":"#dda0dd","powderblue":"#b0e0e6","purple":"#800080",
    "red":"#ff0000","rosybrown":"#bc8f8f","royalblue":"#4169e1",
    "saddlebrown":"#8b4513","salmon":"#fa8072","sandybrown":"#f4a460","seagreen":"#2e8b57","seashell":"#fff5ee","sienna":"#a0522d","silver":"#c0c0c0","skyblue":"#87ceeb","slateblue":"#6a5acd","slategray":"#708090","snow":"#fffafa","springgreen":"#00ff7f","steelblue":"#4682b4",
    "tan":"#d2b48c","teal":"#008080","thistle":"#d8bfd8","tomato":"#ff6347","turquoise":"#40e0d0",
    "violet":"#ee82ee",
    "wheat":"#f5deb3","white":"#ffffff","whitesmoke":"#f5f5f5",
    "yellow":"#ffff00","yellowgreen":"#9acd32"};

    if (typeof colours[colour.toLowerCase()] != 'undefined')
        return colours[colour.toLowerCase()];

    return false;
}

// convert milliseconds to mm:ss format
function msToTime(ms) {
    if (ms <= 0) {
      return "00:00";
    }

    var seconds = Math.floor((ms / 1000) % 60).toString(),
        minutes = Math.floor((ms / (60 * 1000))).toString();

    if (seconds.length === 1) {
      seconds = '0' + seconds;
    }
    if (minutes.length === 1) {
      minutes = '0' + minutes;
    }
    return minutes + ":" + seconds;
  }