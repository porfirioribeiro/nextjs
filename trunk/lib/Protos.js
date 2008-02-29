/**
 * @author Porfirio
 */

/**
 * <b>!!Attention!!<br> This function is applied to class functions not methods </b><br>
 * Extends this from other class<br>
 * must be called right after constructor<br>
 * function A(){}<br>
 * A.prototype.name="A";<br>
 * A.prototype.test=function(){<br>
 *      alert(this.name);<br>
 * };<br>
 * function B(){}<br>
 * B.Extends(A);<br>
 * B.prototype.name="B";<br><br>
 * var a= new A(), b= new B();<br>
 * a.test();//alerts "A"<br>
 * b.test();//alerts "B"
 * @param baseClass {Function}
 */
Function.prototype.Extends=function(baseClass){
    function Inheritance(){}
    Inheritance.prototype = baseClass.prototype;
    this.prototype = new Inheritance();
    this.prototype.constructor = this;
    if (baseClass.base) {
        baseClass.prototype.base = baseClass.base;
    }
	this.parentClass=baseClass;
    this.base = baseClass.prototype;
	this.prototype.$={
		sup:baseClass.prototype,
		construct:function(klass,arg){
			if (klass instanceof Array){
				arg=klass;
				klass=this.self.parentClass;
			}else if (klass===undefined){
				arg=[];
				klass=this.self.parentClass;
			}
			klass.prototype.constructor.apply(this.self.prototype,arg);
		},
		call:function(fn){
			var arg=Array.prototype.slice.apply(arguments,[1,arguments.length]);
			this.sup[fn].apply(this.self.prototype,arg);
		}
	};
	this.prototype.$.self=this;
};
/**
 * <b>!!Attention!!<br> This function is applied to class functions not methods </b><br>
 * Implements an Object into this class prototype (Class.prototype)<br>
 * If toStatic is true, it will implement to the class (Class)<br>
 * function A(){}<br>
 * A.Implements({
 *    foo:"bar"
 * });
 * A.Implements({
 *    foo:"bar"
 * },true);
 * alert((new A()).foo);//bar
 * alert(A.foo);//bar
 * @param {Object} object
 * @param {Boolean} toStatic
 */
Function.prototype.Implements = function(object, toStatic){
    var destination = (toStatic === true) ? this.prototype : this;
    for (var property in object) {
        destination[property] = object[property];
    }
};
Function.isInstanceOf=function(object,klass){
	do{
		if (object instanceof klass){
			return true;
		}
		klass=klass.parentClass;
	}while(klass);
	return false;
};
Function.is_a=Function.isInstanceOf;

Function.prototype.is = function(object){
    return object instanceof this;
};
Function.prototype.bind=function(object){
    if (arguments.length < 2 && arguments[0] === undefined) {
		return this;
	}
    var __method = this, args = Array.prototype.slice.apply(arguments,[0,arguments.length]);
	object = args.shift();
    return function() {
      return __method.apply(object, args.concat(Array.prototype.slice.apply(arguments,[0,arguments.length])));
    };	
};
Function.prototype.bindLater = function(ms,object){
	var args=Array.prototype.slice.apply(arguments,[1,arguments.length]);
	return this.bind.apply(this,args).delay(ms);
};
/**
 * Returns a new thread with this function as #run function
 * @return {$.Thread} The new Thread
 */
Function.prototype.toThread=function(){
	return new Next.Thread(this);
};

Function.prototype.delay=function(ms){
	var t=this.toThread();
	t.start(ms);
	return t;
};

Function.prototype.execPeriod=function(ms){
	var thread=this.toThread();
	thread.start(ms,true);
	return thread;
};


Function.is = function(object){
    return typeof(object) == "function";
};

String.is = function(object){
    return typeof(object) == "string" || object instanceof this;
};

Number.is = function(object){
    return typeof(object) == "number" || object instanceof Number;
};

Boolean.is = function(object){
    return typeof(object) == "boolean" || object instanceof Boolean;
};

Object.isDef = function(object){
    return !(object === undefined || typeof(object) == "undefined");
};
Object.isNull = function(object){
    return !Object.isDef(object) || object === null;
};
Object.isDefined = Object.isDef;


/**
 * Check the string againts the passed string, optional case insensitive
 * @param {String} text
 * @param {Boolean} [i] case insencitive, default to false
 * @return {Boolean}
 */
String.prototype.equals = function(text, i){
    if (i) {
        return this.toLowerCase() == text.toLowerCase();
    }
    else {
        return this == text;
    }
};
/**
 * Check if the string contains other string
 * @param {String} what
 * @return {Boolean}
 */
String.prototype.contains = function(text){
    return this.indexOf(text) > -1;
};
/**
 * Check if the string starts with the other string
 * @param {String} text
 * @return {Boolean}
 */
String.prototype.startsWith = function(text){
    return this.indexOf(text) === 0;
};
/**
 * Check if the string ends with the other string
 * @param {String} text
 * @return {Boolean}
 */
String.prototype.endsWith = function(text){
    return this.indexOf(text) == (this.length - text.length);
};
/**
 * check if the string is empty
 * @return {Boolean}
 */
String.prototype.empty = function(){
    return this.equals("");
};
/**
 * check if the string is blank
 * @return {Boolean}
 */
String.prototype.blank = function(){
    return (/^\s*$/.test(this));
};
/**
 * Check if the string is uppercased
 * @return {Boolean}
 */
String.prototype.isUpperCase = function(){
    return this.toUpperCase() == this;
};
/**
 * Check if the string is lowercased
 * @return {Boolean}
 */
String.prototype.isLowerCase = function(){
    return this.toLowerCase() == this;
};
/**
 * Make the first letter uppercase
 */
String.prototype.capitalize = function(){
    return this.charAt(0).toUpperCase() + this.substring(1).toLowerCase();
};
/**
 * Converts a css style to its Javascript name eg.: border-left-color to borderLeftColor
 */
String.prototype.camelize = function(){
    var arr = this.split("-");
    for (i = 1; i < arr.length; i++) {
        arr[i] = arr[i].capitalize();
    }
    return arr.join("");
};

String.prototype.uncamelize = function(){
    var arr = this.split("");
    for (var i = 0; i < arr.length; i++) {
        if (arr[i].isUpperCase()) {
            arr[i] = "-" + arr[i].toLowerCase();
        }
    }
    return arr.join("");
};

String.prototype.strip = function(){
	return this.replace(/^\s+/, '').replace(/\s+$/, '');
};


/**
 * Escape the string to be used on RegExp
 * @return {String}
 */
String.prototype.escapeRE = function(){
    if (!arguments.callee.sRE) {
        var specials = ['/', '.', '*', '+', '?', '|', '(', ')', '[', ']', '{', '}', '\\'];
        arguments.callee.sRE = new RegExp('(\\' + specials.join('|\\') + ')', 'g');
    }
    return this.replace(arguments.callee.sRE, '\\$1');
};
/**
 * Convets this string to an Regular Expression
 * @param {Object} [e] optional parameters to pass to re
 * @return {RegExp} the new created RegExp
 */
String.prototype.re=function(e){
	return new RegExp(this.replace(/^\/(.*)\/$/,"$1"),e);
};
/**
 * Creates or checks the namespace on this string<br>
 * "next.gfx".ns().circle=function(){...}; <br><b>or</b><br>
 * "next.gfx".ns({<br>
 * 		rect:function(){...}<br>
 * });<br>
 * @param {String Object} [separator] if its a String, its used as separator, else if it is an object, its used as object, if its not a sctring the separator will be "."
 * @param {Object} [object] Optional object to use on last part
 */
String.prototype.ns=function(separator, object){
	if (!String.is(separator)){
		object=separator;
		separator=".";
	}
	if (this.empty()){
		throw new Error("String#ns - \nThe string is empty");
	}
	if (!("^(\\w|\\$|"+separator.escapeRE()+")*$").re().test(this)){
		throw new Error("String#ns - \nInvalid characters on this String: "+ this + "\nSeparator: " + separator);
	}
	if (!Object.is(object)){
		object={};
	}
	var scope=window;
	this.split(separator).forEach(function(v,i,a){
		if (!Object.is(scope[v])){
			scope[v]=((i+1)==a.length)?object:{};
		}else{
			if ((i+1)==a.length){
				Next.extendObj(scope[v],object);
			}
		}
		scope=scope[v];
	});
	return scope;
};

String.prototype.toInt=function(){
	return parseInt(this,0);
};
Number.prototype.toInt=function(){
	return this;
};
String.prototype.toFloat=function(){
	return parseFloat(this);
};
Number.prototype.toFloat=function(){
	return (this+"").toFloat();
};


//Array
/**
 * Returns the first index number at which the specified
 * element can be found in the array. Returns -1 if the
 * element is not present.
 * @param {Object} searchElement
 * @param {Number} fromIndex
 */
if (!Array.prototype.indexOf) {
    Array.prototype.indexOf = function(searchElement, fromIndex){
        fromIndex = (fromIndex) ? fromIndex : 0;
        for (var i = fromIndex; i < this.length; i++) {
            if (this[i] == searchElement) {
                return i;
            }
        }
        return -1;
    };
}
/**
 * Searches an array backwards starting from
 * fromIndex and returns the last index number at
 * which the specified element can be found in the
 * array. Returns -1 if the element is not present.
 * @param {Object} searchElement
 * @param {Number} fromIndex
 */
if (!Array.prototype.lastIndexOf) {
    Array.prototype.lastIndexOf = function(searchElement, fromIndex){
        fromIndex = isNaN(fromIndex) ? this.length : (fromIndex < 0 ? this.length + fromIndex : fromIndex) + 1;
        var result = this.slice(0, fromIndex).reverse().indexOf(searchElement);
        return (result == -1) ? result : fromIndex - result - 1;
    };
}

Array.prototype.size = function(){
    return this.length;
};
