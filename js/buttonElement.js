(function() {

var Button = function(label, color, textColor, x, y, width, height, fontSize) {
  this.initialize(label, color, textColor, x, y, width, height, fontSize);
}
var p = Button.prototype = new createjs.Container(); // inherit from Container

p.label;
p.background;
p.count = 0;

p.Container_initialize = p.initialize;
p.initialize = function(label, color, textColor, x, y, width, height, fontSize) {
	this.Container_initialize();
	
	this.x = x;
	this.y = y;

	this.label = label;
	if (!color) { color = "#CCC"; }
	
	var fontSize = fontSize || 28;

	var text = new createjs.Text(label, "Bold " + fontSize + "px Helvetica", textColor);
	text.textBaseline = "middle";
	text.textAlign = "center";
	
	this.width = width;
	this.height = height;
	
	this.background = new createjs.Shape();
	this.background.graphics.beginFill(color).drawRoundRect(0,0,this.width,this.height,10);
	
	text.x = width/2;
	text.y = height/2;
	
	this.addChild(this.background,text); 
	this.on("rollover", this.handleRollOver);
	this.on("rollout", this.handleRollOut);

	this.cursor = "pointer";

	this.mouseChildren = false;
} 

p.handleRollOver = function (event) {    
	event.target.alpha = 0.5;
	stage.update();
} 

p.handleRollOut = function (event) {
	event.target.alpha = 1;
	stage.update();
}

window.Button = Button;
}());