
/**
 * @author Porfirio
 */
//http://developer.mozilla.org/en/docs/Core_JavaScript_1.5_Reference:Objects:Array:indexOf
if (!Array.prototype.indexOf) {
    Array.prototype.indexOf = function(searchElement, fromIndex){
        var len = this.length;
        fromIndex = fromIndex || 0;
        fromIndex = (fromIndex < 0) ? Math.ceil(fromIndex) : Math.floor(fromIndex);
        if (fromIndex < 0) {
            fromIndex += len;
        }
        for (; fromIndex < len; fromIndex++) {
            if (fromIndex in this && this[fromIndex] === searchElement) {
                return fromIndex;
            }
        }
        return -1;
    };
}
//http://developer.mozilla.org/en/docs/Core_JavaScript_1.5_Reference:Objects:Array:lastIndexOf
if (!Array.prototype.lastIndexOf) {
    Array.prototype.lastIndexOf = function(searchElement, fromIndex){
        var len = this.length;
        var fromIndex = Number(arguments[1]);
        if (isNaN(fromIndex)) {
            fromIndex = len - 1;
        }
        else {
            fromIndex = (fromIndex < 0) ? Math.ceil(fromIndex) : Math.floor(fromIndex);
            if (fromIndex < 0) {
                fromIndex += len;
            }
            else {
                if (fromIndex >= len) {
                    fromIndex = len - 1;
                }
            }
        }
        for (; fromIndex > -1; fromIndex--) {
            if (fromIndex in this && this[fromIndex] === searchElement) {
                return fromIndex;
            }
        }
        return -1;
    };
}
//http://developer.mozilla.org/en/docs/Core_JavaScript_1.5_Reference:Objects:Array:every
if (!Array.prototype.every) {
    Array.prototype.every = function(callback, thisObject){
        var len = this.length;
        if (typeof callback != "function") 
            throw new TypeError();
        for (var i = 0; i < len; i++) {
            if (i in this &&
            !callback.call(thisObject, this[i], i, this)) 
                return false;
        }
        return true;
    };
}
//http://developer.mozilla.org/en/docs/Core_JavaScript_1.5_Reference:Objects:Array:filter
if (!Array.prototype.filter) {
    Array.prototype.filter = function(callback, thisObject){
        if (typeof callback != "function") {
            throw new TypeError();
        }
        var res = [];
        for (var i = 0; i < this.length; i++) {
            if (i in this) {
                var val = this[i]; // in case callback mutates this
                if (callback.call(thisObject, val, i, this)) 
                    res.push(val);
            }
        }
        return res;
    };
}
//http://developer.mozilla.org/en/docs/Core_JavaScript_1.5_Reference:Objects:Array:forEach
if (!Array.prototype.forEach) {
    Array.prototype.forEach = function(callback, thisObject){
        var len = this.length;
        if (typeof callback != "function") 
            throw new TypeError();
        for (var i = 0; i < len; i++) {
            if (i in this) 
                callback.call(thisObject, this[i], i, this);
        }
    };
}
//http://developer.mozilla.org/en/docs/Core_JavaScript_1.5_Reference:Objects:Array:map
if (!Array.prototype.map) {
    Array.prototype.map = function(callback, thisObject){
        var len = this.length;
        if (typeof callback != "function") {
            throw new TypeError();
        }
        var res = new Array(this.length);
        for (var i = 0; i < this.length; i++) {
            if (i in this) 
                res[i] = callback.call(thisObject, this[i], i, this);
        }
        return res;
    };
}
//http://developer.mozilla.org/en/docs/Core_JavaScript_1.5_Reference:Objects:Array:some
if (!Array.prototype.some) {
    Array.prototype.some = function(callback, thisObject){
        var len = this.length;
        if (typeof callback != "function") 
            throw new TypeError();
        
        for (var i = 0; i < len; i++) {
            if (i in this &&
            callback.call(thisObject, this[i], i, this)) 
                return true;
        }
        
        return false;
    };
}
//http://developer.mozilla.org/en/docs/Core_JavaScript_1.5_Reference:Objects:Array:reduce
if (!Array.prototype.reduce) {
    Array.prototype.reduce = function(callback, initialValue){
        var len = this.length;
        if (typeof callback != "function") 
            throw new TypeError();
        
        // no value to return if no initial value and an empty array
        if (len == 0 && arguments.length == 1) 
            throw new TypeError();
        
        var i = 0;
        if (arguments.length >= 2) {
            var rv = arguments[1];
        }
        else {
            do {
                if (i in this) {
                    rv = this[i++];
                    break;
                }
                
                // if array contains no values, no initial value to return
                if (++i >= len) 
                    throw new TypeError();
            }
            while (true);
                    }
        
        for (; i < len; i++) {
            if (i in this) 
                rv = callback.call(null, rv, this[i], i, this);
        }
        
        return rv;
    };
}
//http://developer.mozilla.org/en/docs/Core_JavaScript_1.5_Reference:Objects:Array:reduceRight
if (!Array.prototype.reduceRight) {
    Array.prototype.reduceRight = function(callback, initialValue){
        var len = this.length;
        if (typeof callback != "function") 
            throw new TypeError();
        
        // no value to return if no initial value, empty array
        if (len == 0 && arguments.length == 1) 
            throw new TypeError();
        
        var i = len - 1;
        if (arguments.length >= 2) {
            var rv = arguments[1];
        }
        else {
            do {
                if (i in this) {
                    rv = this[i--];
                    break;
                }
                
                // if array contains no values, no initial value to return
                if (--i < 0) 
                    throw new TypeError();
            }
            while (true);
                    }
        
        for (; i >= 0; i--) {
            if (i in this) 
                rv = callback.call(null, rv, this[i], i, this);
        }
        
        return rv;
    };
}
Array.prototype.pushArray=function(arr){
	this.push.apply(this, this.slice.call(arr));
}
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
String.prototype.strip = function(){
    return this.replace(/^\s+/, '').replace(/\s+$/, '');
};
/**
 * 
 * @param {String} selector
 * @param {Object} [context]
 * @extends {Array}
 */
function nQuery(selector, context){
    if (!(this instanceof nQuery)) {
        return new nQuery(selector, context);
    }
	this.init(selector, context);
}

nQuery.prototype = {
    length: 0,
	init:function(selector, context){
		
	},
    toArray: function(){
        return Array.prototype.slice.apply(this, [0, this.length])
    },
    toString: function(){
        return "nQuery( " + this.toArray().toString() + " )";
    }
};


/**
 * 
 * @param {Object} iterable
 * @extends {Array}
 */
nQuery.Array = function(iterable){
    if (iterable.toArray) {
        return iterable.toArray();
    }
    else 
        if (typeof(iterable) == "string") {
            return iterable.split(" ");
        }
        else 
            if (iterable.length) {
                return Array.prototype.slice.apply(iterable, [0, iterable.length]);
            }
    //
};


nQuery._setup=function($,$$,$A){
	function _arrayExtras(elem){
	    var fn = function(){
	        return Array.prototype[elem].apply(this, arguments);
	    }
	    nQuery.prototype[elem] = fn;
	    fn = function(it){
	        return Array.prototype[elem].apply(it, Array.prototype.slice.apply(arguments, [1, arguments.length]));
	    }
	    nQuery.Array[elem] = fn;
	}
	$A("pop push reverse shift sort splice unshift concat join slice indexOf lastIndexOf forEach every some reduce reduceRight pushArray").forEach(_arrayExtras);	
	
}
nQuery._setup(nQuery, nQuery.Element, nQuery.Array)

nQuery.Array.filter = function(it, callback, thisObject){
    if (typeof callback != "function") {
        throw new TypeError();
    }
    var ret = new nQuery();
    var len = it.length;
    for (var i = 0, ii = 0; i < len; i++) {
        var _i = i - ii;
        var res = callback.call(thisObject, it[_i], _i, it);
        //alert(i+"\n"+ii+"\n"+_i+"\n"+it.length+"\n"+res);
        if (!res) {
            it.splice(_i, 1);
            //ret.push(it[i]);
            ii++;
        }
    }
    return it;
};
nQuery.Array.map = function(it, callback, thisObject){
    if (typeof callback != "function") {
        throw new TypeError();
    }
    for (var i = 0; i < it.length; i++) {
        nQuery.Array.splice(it, i, 1, callback.call(thisObject, it[i], i, it));
    }
    return it;
};
nQuery.prototype.filter = function(callback, thisObject){
    return nQuery.Array.filter(this, callback, thisObject);
}
nQuery.registerMethod = function(fn){
    if (!nQuery.prototype[fn]) {
        nQuery.prototype[fn] = function(){
            for (var i = 0; i < this.length; i++) {
                var nel = this[i];
                var result = nel[fn].apply(nel, arguments);
                if (typeof(result) != "undefined") {
                    return result;
                }
            }
        }
    }
    
};
nQuery.registerMethods = function(){
    for (var i in nQuery.Element) {
        if (!nQuery.prototype[i]) {
            nQuery.prototype[i] = function(){
            
            }
        }
    }
};
nQuery.Element = function(el){
    if (!(this instanceof nQuery.Element)) {
        return new nQuery.Element(el);
    }
    if (typeof(el) == "string") {
        el = document.getElementById(el);
    }
    this.el = el;
};
nQuery.Element.prototype.html = function(html){
    if (typeof(html) == "undefined") {
        return this.el.innerHTML;
    }
    this.el.innerHTML = html;
}
nQuery.Element.prototype.toString = function(){
    return this.html().strip();
}
nQuery.registerMethod("html");



