//fieldElement which is used to render a field element such as goal box
(function() {

//args: name, type, resource, x, y, width, height, label, textColor, bgStroke, 
//bgStrokeThickness, bgColor, textRotation, textRegX, textRegY, fitText
var FieldElement = function(args) {
  this.initialize(args);
}
var p = FieldElement.prototype = new createjs.Container(); // inherit from Container

// fieldElement attributes
// p.name;
// p.label;
// p.background;
// p.textObj;
// p.bgColor;
// p.bgStroke;
// p.bgStrokeThickness;
// p.x;
// p.y;
// p.width;
// p.height;

p.Container_initialize = p.initialize;
p.initialize = function(args) {
	this.Container_initialize();

	this.x = args.x;
	this.y = args.y;
	this.width = args.width;
	this.height = args.height;

	this.name = args.name; // field element name

	if (args.textColor) { 
		 if( args.textColor.indexOf("#") > -1) args.textColor = colourNameToHex(args.textColor); 
	}
	else args.textColor = colourNameToHex("white"); //default white color

	this.textObj = new createjs.Text(args.label, "20px Helvetica", args.textColor).set({name: "text"});
	this.textObj.textBaseline = "middle";
	this.textObj.textAlign = "center";
	this.textObj.x = this.width/2;
	this.textObj.y = this.height/2;
	this.textObj.rotation = args.textRotation || 0;
	this.textObj.regX = args.textRegX || 0;
	this.textObj.regY = args.textRegY || 0;
	
	if (args.bgColor) { 
		if (args.bgColor.indexOf("#") > -1) this.bgColor = args.bgColor;
		else this.bgColor = colourNameToHex(args.bgColor); 
	}
	// this.bgStroke = args.bgStroke || "black"; // auto assume black outline if no outline specified
	this.bgStroke = args.bgStroke;
	this.bgStrokeThickness = args.bgStrokeThickness;

	if (args.type && args.type == "bitmap") { //if element is bitmap

		this.background = new createjs.Bitmap(args.resource).set({
			x: -(args.resource.width/2),
			y: -(args.resource.height/2)
		});

	} else { //if element is shape

		this.background = new createjs.Shape().set({name: "background"});
		if (this.bgColor) this.background.graphics.beginFill(this.bgColor);
		if (this.bgStrokeThickness) this.background.graphics.setStrokeStyle(this.bgStrokeThickness);
		if (this.bgStroke) this.background.graphics.beginStroke(this.bgStroke);
		// this.background.graphics.beginStroke(this.bgStroke);

		if (args.type && args.type == "circle") { //if element is circle shape
			this.background.graphics.drawCircle(0,0, args.radius);
		} else { //default as element rectangle shape
			if (args.fitText == true)
			{
				this.fitText = true;
				this.width = this.textObj.getMeasuredWidth() + 15;
				this.height = this.textObj.getMeasuredHeight() + 15;
				this.textObj.x = 0;
				this.textObj.y = this.height/2;
				this.background.graphics.drawRect(-this.width/2, 0, this.width, this.height);
			} else {
				this.fitText = false;
				this.background.graphics.drawRect(0, 0, this.width, this.height);
			}
		}

	}
	this.addChild(this.background, this.textObj);

	if (args.visible == false) { //make element invisible
		this.visible = false;
	}

	this.mouseChildren = false;
}

p.changeText = function (label, textColor) {

	if (textColor) { // if color specified, change text color
		textColor = colourNameToHex(textColor); 
		this.textObj.color = textColor;
	}

	// set new text
	this.textObj.text = label;

	if (this.fitText == true) { //if fitText, x and y differs
		this.bounds = this.textObj.getBounds();
		this.width = this.bounds.width + 15;
		this.height = this.bounds.height + 15;
		this.textObj.x = 0;

		// clear previous background shape
		this.background.graphics.clear();

		// draw new background shape
		if (this.bgColor) this.background.graphics.beginFill(this.bgColor);
		if (this.bgStrokeThickness) this.background.graphics.setStrokeStyle(this.bgStrokeThickness);
		this.background.graphics.beginStroke(this.bgStroke);
		this.background.graphics.drawRect(-this.width/2, 0, this.width, this.height); 
	}

	if (this.visible != true) this.visible = true; //show visibility if it isn't visible
}

//Create glow effect for the field element!
p.glow = function(color) {
	if (!color) color = this.bgColor.replace("#","0x") || "0xFFFFFF"; //GlowFilter quirk, need to replace # with 0x
	//create.jsGlowFilter( [color=0xFF0000],[alpha=1],[blurX=0],[blurY=0],[strength=1],[quality=1],[inner=false],[knockout=false] )
	var glowFilter = new createjs.GlowFilter(color, 1, 50, 50, 1, 1, false, false);
	this.filters = [glowFilter];
	var bounds = glowFilter.getBounds();
	this.cache(-50+bounds.x, -50+bounds.y, 100+bounds.width, 100+bounds.height);
}

//Remove glow effect from field element!
p.unglow = function() {
	this.filters = [];
	this.updateCache();
}

window.FieldElement = FieldElement;
})();