/**
 * @author Porfirio
 */

/**
 * Create a color
 * Usage:<br>
 * new Next.Color(r,g,b);<br>
 * new Next.Color([r,g,b]);<br>
 * new Next.Color({R:r,G:g,B:b});<br>
 * new Next.Color("RGB(r,g,b)");<br>
 * new Next.Color("#FFFFFF");<br>
 * @param {Object} arg0
 * @param {Object} arg1
 * @param {Object} arg2
 */
Next.Color=function(arg0,arg1,arg2){
	if (Number.is(arg0) && arg0>0 && arg0<255 && 
		Number.is(arg1) && arg1>0 && arg1<255 &&
		Number.is(arg2) && arg2>0 && arg2<255){		
		this.fromRGB(arg0,arg1,arg2);
		this.invalid=false;
	}else if (arg0 instanceof Next.Color){
		this.R=arg0.R;
		this.G=arg0.G;
		this.B=arg0.B;
		this.invalid=false;
	}else if (String.is(arg0)){
		if (arg0.match(/^#\w\w\w\w\w\w$/)) {
			this.fromHex(arg0);
		} else if ((mm=arg0.match(Next.Color.RGBMatchRE))!==null) {
			this.fromRGB(mm[1].toInt(),mm[2].toInt(),mm[3].toInt());
		} else if (String.is(Next.Color[arg0])){
			arg0=new Next.Color(Next.Color[arg0]);
			this.R=arg0.R;
			this.G=arg0.G;
			this.B=arg0.B;
			this.invalid=false;
		}
	}else if (Array.is(arg0)){
		this.fromArray(arg0);
	}else if (Object.is(arg0)){
		if (Object.is(arg0) &&
		   (Number.is(arg0.r) || Number.is(arg0.R)) &&
		   (Number.is(arg0.g) || Number.is(arg0.G)) &&
		   (Number.is(arg0.b) || Number.is(arg0.B))){
			this.fromObject(arg0);
		}		
	}
};
Next.Color.RGBMatchRE=/^RGB\(\s*(\d\d?\d?)\s*,\s*(\d\d?\d?)\s*,\s*(\d\d?\d?)\s*\)$/i;
/**
 * Check if rgb params specified are numbers and bwtwen 0 - 255
 * @param {Number} r
 * @param {Number} g
 * @param {Number} b
 * @return {Boolean}
 */
Next.Color.isRGBValid=function(r,g,b){
	return (Number.is(r) && r>=0 && r<=255) && (Number.is(g) && g>=0 && g<=255) && (Number.is(b) && b>=0 && b<=255);
};

/**
 * Check if the specified color is valid @link {Next.Color} and return it, or null if its not valid 
 * @see Next#Color
 * @param {Object} c
 * @return {Next.Color}
 */
Next.Color.check=function(c){
	if (!(c instanceof Next.Color)){
		c=new Next.Color(c);
	}
	return (c.invalid)?null:c;
};
Next.Color.prototype.invalid=true;
Next.Color.prototype.cssRGB="";
Next.Color.prototype.cssHex="";
Next.Color.prototype.R=0;
Next.Color.prototype.G=0;
Next.Color.prototype.B=0;
/**
 * Recreates the Color object using new r,g,b values
 * @param {Number} r
 * @param {Number} g
 * @param {Number} b
 * @return {Next.Color}
 */
Next.Color.prototype.fromRGB=function(r,g,b){
	if (Next.Color.isRGBValid(r,g,b)){
		this.R=r;
		this.G=g;
		this.B=b;
		this.invalid=false;		
	}
	return this;
};
/**
 * Recreates the Color object using the values on one array [r,g,b]
 * @param {Array} arr
 * @return {Next.Color}
 */
Next.Color.prototype.fromArray=function(arr){
	if (Array.is(arr) && arr.length==3 && Next.Color.isRGBValid(arr[0],arr[1],arr[2])){
		this.R=arr[0];
		this.G=arr[1];
		this.B=arr[2];
		this.invalid=false;
	}	
	return this;
};
/**
 * Recreates the Color object withthe values of an object with {R:r,G:g,B:b}
 * @param {Object} obj
 * @return {Next.Color}
 */
Next.Color.prototype.fromObject=function(obj){
	if (Object.is(obj) && (Next.Color.isRGBValid(obj.r, obj.g, obj.b) || Next.Color.isRGBValid(obj.R, obj.G, obj.B))){
		this.R=obj.r || obj.R;
		this.G=obj.g || obj.G;
		this.B=obj.b || obj.B;
		this.invalid=false;
	}	
	return this;
};
Next.Color.prototype._GiveDec=function(Hex){
	if(Hex == "A")     {return 10;}
	else if(Hex == "B"){return 11;}
	else if(Hex == "C"){return 12;}
	else if(Hex == "D"){return 13;}
	else if(Hex == "E"){return 14;}
	else if(Hex == "F"){return 15;}
	else               {return Hex*1;}
};
Next.Color.prototype._GiveHex=function(Dec){
	if(Dec == 10)	  {return "A";}
	else if(Dec == 11){return "B";}
	else if(Dec == 12){return "C";}
	else if(Dec == 13){return "D";}
	else if(Dec == 14){return "E";}
	else if(Dec == 15){return "F";}
	else              {return "" + Dec;}
};
/**
 * Recreates the Color object using a hex value
 * @param {Object} hex
 * @return {Next.Color}
 */
Next.Color.prototype.fromHex=function(hex){
	if (String.is(hex) && hex.startsWith("#")){
		hex=hex.replace(/#/,"").toUpperCase();
		this.R = (this._GiveDec(hex.substring(0, 1)) * 16) + this._GiveDec(hex.substring(1, 2));
		this.G = (this._GiveDec(hex.substring(2, 3)) * 16) + this._GiveDec(hex.substring(3, 4));
		this.B = (this._GiveDec(hex.substring(4, 5)) * 16) + this._GiveDec(hex.substring(5, 6));
		this.invalid=false;
	}
	return this;
};

/**
 * Returns the Hex value of the color
 * @return {String}
 */
Next.Color.prototype.toHex=function(){
	return "#" + this._GiveHex(Math.floor(this.R / 16)) +
				 this._GiveHex(this.R % 16) +
				 this._GiveHex(Math.floor(this.G / 16)) +
				 this._GiveHex(this.G % 16) + 
				 this._GiveHex(Math.floor(this.B / 16)) + 
				 this._GiveHex(this.B % 16);
};
/**
 * Returns an Array with the [r,g,b] values
 * @return {Array}
 */
Next.Color.prototype.toArray=function(){
	return [this.R,this.G,this.B];
};
/**
 * Returns an object on form of {R:r,G:g,B:b}
 * @return {Object}
 */
Next.Color.prototype.toObject=function(){
	return {R: this.R,G: this.G,B: this.B};
};
/**
 * Returns a String on form of RGB(r,g,b)
 * @return {Object}
 */
Next.Color.prototype.toRGB=function(){
	return "RGB("+this.R+","+this.G+","+this.B+")";
};
/**
 * String of the color as hex
 * @alias {Next.Color.prototype.toHex}
 * @return {String}
 */
Next.Color.prototype.toString=function(){
	return this.toHex();
};
Next.Color.AliceBlue="#F0F8FF";Next.Color.AntiqueWhite="#FAEBD7 ";Next.Color.Aqua="#00FFFF";Next.Color.Aquamarine="#7FFFD4";Next.Color.Azure="#F0FFFF";Next.Color.Beige="#F5F5DC";Next.Color.Bisque="#FFE4C4";Next.Color.Black="#000000";Next.Color.BlanchedAlmond="#FFEBCD";Next.Color.Blue="#0000FF";Next.Color.BlueViolet="#8A2BE2";Next.Color.Brown="#A52A2A";Next.Color.BurlyWood="#DEB887";Next.Color.CadetBlue="#5F9EA0";Next.Color.Chartreuse="#7FFF00";Next.Color.Chocolate="#D2691E";Next.Color.Coral="#FF7F50";Next.Color.CornflowerBlue="#6495ED";Next.Color.Cornsilk="#FFF8DC";Next.Color.Crimson="#DC143C";Next.Color.Cyan="#00FFFF";Next.Color.DarkBlue="#00008B";Next.Color.DarkCyan="#008B8B";Next.Color.DarkGoldenRod="#B8860B";Next.Color.DarkGray="#A9A9A9";Next.Color.DarkGrey="#A9A9A9";Next.Color.DarkGreen="#006400";Next.Color.DarkKhaki="#BDB76B";Next.Color.DarkMagenta="#8B008B";Next.Color.DarkOliveGreen="#556B2F";Next.Color.Darkorange="#FF8C00";Next.Color.DarkOrchid="#9932CC";Next.Color.DarkRed="#8B0000";Next.Color.DarkSalmon="#E9967A";Next.Color.DarkSeaGreen="#8FBC8F";Next.Color.DarkSlateBlue="#483D8B";Next.Color.DarkSlateGray="#2F4F4F";Next.Color.DarkSlateGrey="#2F4F4F";Next.Color.DarkTurquoise="#00CED1";Next.Color.DarkViolet="#9400D3";Next.Color.DeepPink="#FF1493";Next.Color.DeepSkyBlue="#00BFFF";Next.Color.DimGray="#696969";Next.Color.DimGrey="#696969";Next.Color.DodgerBlue="#1E90FF";Next.Color.FireBrick="#B22222";Next.Color.FloralWhite="#FFFAF0";Next.Color.ForestGreen="#228B22";Next.Color.Fuchsia="#FF00FF";Next.Color.Gainsboro="#DCDCDC";Next.Color.GhostWhite="#F8F8FF";Next.Color.Gold="#FFD700";Next.Color.GoldenRod="#DAA520";Next.Color.Gray="#808080";Next.Color.Grey="#808080";Next.Color.Green="#008000";Next.Color.GreenYellow="#ADFF2F";Next.Color.HoneyDew="#F0FFF0";Next.Color.HotPink="#FF69B4";Next.Color.IndianRed="#CD5C5C";Next.Color.Indigo="#4B0082";Next.Color.Ivory="#FFFFF0";Next.Color.Khaki="#F0E68C";Next.Color.Lavender="#E6E6FA";Next.Color.LavenderBlush="#FFF0F5";Next.Color.LawnGreen="#7CFC00";Next.Color.LemonChiffon="#FFFACD";Next.Color.LightBlue="#ADD8E6";Next.Color.LightCoral="#F08080";Next.Color.LightCyan="#E0FFFF";Next.Color.LightGoldenRodYellow="#FAFAD2";Next.Color.LightGray="#D3D3D3";Next.Color.LightGrey="#D3D3D3";Next.Color.LightGreen="#90EE90";Next.Color.LightPink="#FFB6C1";Next.Color.LightSalmon="#FFA07A";Next.Color.LightSeaGreen="#20B2AA";Next.Color.LightSkyBlue="#87CEFA";Next.Color.LightSlateGray="#778899";Next.Color.LightSlateGrey="#778899";Next.Color.LightSteelBlue="#B0C4DE";Next.Color.LightYellow="#FFFFE0";Next.Color.Lime="#00FF00";Next.Color.LimeGreen="#32CD32";Next.Color.Linen="#FAF0E6";Next.Color.Magenta="#FF00FF";Next.Color.Maroon="#800000";Next.Color.MediumAquaMarine="#66CDAA";Next.Color.MediumBlue="#0000CD";Next.Color.MediumOrchid="#BA55D3";Next.Color.MediumPurple="#9370D8";Next.Color.MediumSeaGreen="#3CB371";Next.Color.MediumSlateBlue="#7B68EE";Next.Color.MediumSpringGreen="#00FA9A";Next.Color.MediumTurquoise="#48D1CC";Next.Color.MediumVioletRed="#C71585";Next.Color.MidnightBlue="#191970";Next.Color.MintCream="#F5FFFA";Next.Color.MistyRose="#FFE4E1";Next.Color.Moccasin="#FFE4B5";Next.Color.NavajoWhite="#FFDEAD";Next.Color.Navy="#000080";Next.Color.OldLace="#FDF5E6";Next.Color.Olive="#808000";Next.Color.OliveDrab="#6B8E23";Next.Color.Orange="#FFA500";Next.Color.OrangeRed="#FF4500";Next.Color.Orchid="#DA70D6";Next.Color.PaleGoldenRod="#EEE8AA";Next.Color.PaleGreen="#98FB98";Next.Color.PaleTurquoise="#AFEEEE";Next.Color.PaleVioletRed="#D87093";Next.Color.PapayaWhip="#FFEFD5";Next.Color.PeachPuff="#FFDAB9";Next.Color.Peru="#CD853F";Next.Color.Pink="#FFC0CB";Next.Color.Plum="#DDA0DD";Next.Color.PowderBlue="#B0E0E6";Next.Color.Purple="#800080";Next.Color.Red="#FF0000";Next.Color.RosyBrown="#BC8F8F";Next.Color.RoyalBlue="#4169E1";Next.Color.SaddleBrown="#8B4513";Next.Color.Salmon="#FA8072";Next.Color.SandyBrown="#F4A460";Next.Color.SeaGreen="#2E8B57";Next.Color.SeaShell="#FFF5EE";Next.Color.Sienna="#A0522D";Next.Color.Silver="#C0C0C0";Next.Color.SkyBlue="#87CEEB";Next.Color.SlateBlue="#6A5ACD";Next.Color.SlateGray="#708090";Next.Color.SlateGrey="#708090";Next.Color.Snow="#FFFAFA";Next.Color.SpringGreen="#00FF7F";Next.Color.SteelBlue="#4682B4";Next.Color.Tan="#D2B48C";Next.Color.Teal="#008080";Next.Color.Thistle="#D8BFD8";Next.Color.Tomato="#FF6347";Next.Color.Turquoise="#40E0D0";Next.Color.Violet="#EE82EE";Next.Color.Wheat="#F5DEB3";Next.Color.White="#FFFFFF";Next.Color.WhiteSmoke="#F5F5F5";Next.Color.Yellow="#FFFF00";Next.Color.YellowGreen="#9ACD32";
