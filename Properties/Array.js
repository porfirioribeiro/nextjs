/**
 * @copyright 2008 Porfirio Ribeiro
 * @license LGPL
 * @projectDescription This aims to fix the Array issues
 * @version 1
 * @author Porfirio
 */
/**
 * Transforms any iterable to a array!
 * @alias $A
 * @param {Object} iterable
 * @return {Array}
 */
Array.Ext = function(iterable){
    if (iterable instanceof Array) {
        return iterable;
    }
    else 
        if (iterable.toArray) {
            return iterable.toArray();
        }
        else {
            if (typeof(iterable) == "string") {
                return iterable.split(" ");
            }
            else {
                if (iterable.length) {
					alert(iterable.length);
					/*var res=[];
					for (var i=0;iterable.length;i++){
						res[i]=iterable[i];
					}
					return res;*/
                }
            }
        }
    return [];
};
/**
 * Internal
 * @param {Object} A
 * @param {Array} Ap
 * @param {Object} $A
 * @param {Function} Fp
 */
(function(A, Ap, $A, Fp){
    //Array
    //http://developer.mozilla.org/en/docs/Core_JavaScript_1.5_Reference:Objects:Array:indexOf
    if (!Ap.indexOf) {
        Ap.indexOf = function(searchElement, fromIndex){
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
    if (!Ap.lastIndexOf) {
        Ap.lastIndexOf = function(searchElement, fromIndex){
            var len = this.length;
            fromIndex = Number(arguments[1]);
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
    if (!Ap.every) {
        Ap.every = function(callback, thisObject){
            var len = this.length;
            if (typeof callback != "function") {
                throw new TypeError();
            }
            for (var i = 0; i < len; i++) {
                if (i in this && !callback.call(thisObject, this[i], i, this)) {
                    return false;
                }
            }
            return true;
        };
    }
    //http://developer.mozilla.org/en/docs/Core_JavaScript_1.5_Reference:Objects:Array:filter
    if (!Ap.filter) {
        Ap.filter = function(callback, thisObject){
            if (typeof callback != "function") {
                throw new TypeError();
            }
            var res = [];
            for (var i = 0; i < this.length; i++) {
                if (i in this) {
                    var val = this[i]; // in case callback mutates this
                    if (callback.call(thisObject, val, i, this)) {
                        res.push(val);
                    }
                }
            }
            return res;
        };
    }
    //http://developer.mozilla.org/en/docs/Core_JavaScript_1.5_Reference:Objects:Array:forEach
    if (!Ap.forEach) {
        Ap.forEach = function(callback, thisObject){
            var len = this.length;
            if (typeof callback != "function") {
                throw new TypeError();
            }
            for (var i = 0; i < len; i++) {
                if (i in this) {
                    callback.call(thisObject, this[i], i, this);
                }
            }
        };
    }
    //http://developer.mozilla.org/en/docs/Core_JavaScript_1.5_Reference:Objects:Array:map
    if (!Ap.map) {
        Ap.map = function(callback, thisObject){
            var len = this.length;
            if (typeof callback != "function") {
                throw new TypeError();
            }
            var res = [];
            for (var i = 0; i < this.length; i++) {
                if (i in this) {
                    res[i] = callback.call(thisObject, this[i], i, this);
                }
            }
            return res;
        };
    }
    //http://developer.mozilla.org/en/docs/Core_JavaScript_1.5_Reference:Objects:Array:some
    if (!Ap.some) {
        Ap.some = function(callback, thisObject){
            var len = this.length;
            if (typeof callback != "function") {
                throw new TypeError();
            }
            for (var i = 0; i < len; i++) {
                if (i in this &&
                callback.call(thisObject, this[i], i, this)) {
                    return true;
                }
            }
            return false;
        };
    }
    //http://developer.mozilla.org/en/docs/Core_JavaScript_1.5_Reference:Objects:Array:reduce
    if (!Ap.reduce) {
        Ap.reduce = function(callback, initialValue){
            var len = this.length;
            if (typeof callback != "function") {
                throw new TypeError();
            }
            // no value to return if no initial value and an empty array
            if (len === 0 && arguments.length == 1) {
                throw new TypeError();
            }
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
                    if (++i >= len) {
                        throw new TypeError();
                    }
                }
                while (true);
                            }
            
            for (; i < len; i++) {
                if (i in this) {
                    rv = callback.call(null, rv, this[i], i, this);
                }
            }
            return rv;
        };
    }
    //http://developer.mozilla.org/en/docs/Core_JavaScript_1.5_Reference:Objects:Array:reduceRight
    if (!Ap.reduceRight) {
        Ap.reduceRight = function(callback, initialValue){
            var len = this.length;
            if (typeof callback != "function") {
                throw new TypeError();
            }
            // no value to return if no initial value, empty array
            if (len === 0 && arguments.length == 1) {
                throw new TypeError();
            }
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
                    if (--i < 0) {
                        throw new TypeError();
                    }
                }
                while (true);
                            }
            
            for (; i >= 0; i--) {
                if (i in this) {
                    rv = callback.call(null, rv, this[i], i, this);
                }
            }
            return rv;
        };
    }
    if (!Ap.invoke) {
        /**
         * Calls a function on all elements of the Array
         * @alias Array.prototype.invoke
         * @param {String} functionName the name of the function to call on all elements
         * @param {Array} [args] Optional arguments to pass
         */
        Ap.invoke = function(functionName, args){
			var result=[];
            this.forEach(function(element, index, array){
                var func = element[functionName];
                if (typeof(func) == "function") {
                    result.push(func.apply(element, args));
                }
            });
			return result;
        };
    }
	if (!Ap.include){
		/**
		 * Checks if this array has this some element that is equals to the passed one
		 * @param {Object} object
		 */
		Ap.include=function(object){
			return this.indexOf(object) != -1;
		};
	}	
    
    if (!Ap.max) {
        Ap.max = function(callback, thisObject){
            var result=null;
            this.forEach(function(value, index, array){
                if (typeof callback == "function") {
                    value = callback.call(thisObject, value, index, array);
                }
                if (result === null || value >= result) {
                    result = value;
                }
            });
			return result;
        };
    }
    if (!Ap.min) {
        Ap.min = function(callback, thisObject){
            var result=null;
            this.forEach(function(value, index, array){
                if (typeof callback == "function") {
                    value = callback.call(thisObject, value, index, array);
                }
                if (result === null || value <= result) {
                    result = value;
                }
            });
			return result;
        };
    }
	if (!Ap.partition){
		Ap.partition=function(callback, thisObject ){
            if (typeof callback != "function") {
                callback =function(r){return r;};
            }
			var result=[[],[]];
		    this.forEach(function(value, index, array){
		        result[(!!callback.call(thisObject, value, index, array) ? 0 : 1)].push(value);
		    });
		    return result;			
		};
	}
	if (!Ap.getProperty){
		Ap.getProperty=function(name){
		    var results = [];
		    this.forEach(function(object, index, array) {
		      results.push(object[name]);
		    });
		    return results;			
		};
	}
	if (!Ap.setProperty){
		Ap.setProperty=function(name, value){
		    this.forEach(function(object, index, array) {
		      object[name]=value;
		    });		
		};
	}
    if (!Ap.grep) {
		/**
		 * Use RegExp to filter an array
		 * @param {RegExp, String} filter
		 * @param {Function} [callback]
		 * @param {Object} [thisObject]
		 */
        Ap.grep = function(filter, callback, thisObject){
            var len = this.length;
            if (typeof callback != "function") {
                callback =function(r){return r;};
            }
			var results=[];
			filter=(typeof(filter)=="string")?new RegExp(filter):filter;
			
            for (var i = 0; i < len; i++) {
				if (filter.match(this[i])){
					results.push(callback.call(thisObject, this[i], i, this));
				}
            }
			return results;
        };
    }
	
    /**
     * Adds an array of elements to the end of an array and returns the new length.
     * This method changes the length of the array.
     * @alias Array.prototype.pushArray
     * @param {Array} arr
     * @return {Number}
     */
    Ap.pushArray = function(arr){
        return this.push.apply(this, $A(arr));
    };
	var __unshift=Ap.unshift;
	Ap.unshift=function(element1, elementN){    //>    IE Fix    <
		return __unshift.apply(this,arguments) | this.length;
	};
    
    //Array.Ext
    /**
     * Joins two or more arrays and returns the result.
     * @alias Array.Ext.concat
     * @param {Array, Object} arr1
     * @param {Array} [arr2]
     * @param {Array} [arr3]
     * @return {Array, Object}
     */
    $A.concat = function(arr1, arr2, arr3){
        return Ap.concat.apply(arr1, Ap.slice.apply(arguments, [1, arguments.length]));
    };
    /**
     * Puts all the elements of an array into a string.
     * The elements are separated by a specified delimiter
     * @alias Array.Ext.join
     * @param {Array, Object} array
     * @param {String} separator
     * @return {String}
     */
    $A.join = function(array, separator){
        return Ap.join.call(array, separator);
    };
    /**
     * Removes and returns the last element of an array
     * @alias Array.Ext.pop
     * @param {Array, Object} array
     * @return {Object}
     */
    $A.pop = function(array){
        return Ap.pop.call(array);
    };
    /**
     * Adds one or more elements to the end of an array and returns the new length.
     * This method changes the length of the array
     * @alias Array.Ext.push
     * @param {Array, Object} array
     * @param {Object} [element1]
     * @param {Object} [elementN]
     * @return {Number}
     */
    $A.push = function(array, element1, elementN){
        return Ap.push.apply(array, Ap.slice.apply(arguments, [1, arguments.length]));
    };
    /**
     * Adds an array of elements to the end of an array and returns the new length.
     * This method changes the length of the array.
     * @alias Array.Ext.pushArray
     * @param {Array, Object} array The Array or Object[] to affect
     * @param {Array, Object} otherArray The Array or Object[] to join into this one
     * @return {Number}
     */
    $A.pushArray = function(array, otherArray){
        return Ap.push.apply(array, $A(otherArray));
    };
    /**
     * Reverses the order of the elements in an array
     * @alias Array.Ext.reverse
     * @param {Array, Object} array
     * @return {Array, Object}
     */
    $A.reverse = function(array){
        return Ap.reverse.call(array);
    };
    /**
     * Removes and returns the first element of an array
     * @alias Array.Ext.shift
     * @param {Array, Object} array
     * @return {Object}
     */
    $A.shift = function(array){
        return Ap.shift.call(array);
    };
    /**
     * Returns selected elements from an existing array
     * @alias Array.Ext.slice
     * @param {Array, Object} array
     * @param {Number} [start] default: 0
     * @param {Number} [end] default: the length of the array
     * @return {Array, Object}
     */
    $A.slice = function(array, start, end){
        return (end !== undefined) ? Ap.slice.call(array, start, end) : ((start !== undefined) ? Ap.slice.call(array, start) : (Ap.slice.call(array)));
    };
	/**
	 * Sorts the elements of an array
	 * @alias Array.Ext.sort
	 * @param {Array, Object} array
	 * @param {Function} [sortby]
	 * @return {Array, Object}
	 */
	$A.sort=function(array, sortby){
		return (sortby)?Ap.sort.call(array, sortby):Ap.sort.call(array);
	};
	//$A.toSource ignored by now
	/**
	 * Converts an array to a string and returns the result
	 * @alias Array.Ext.toString
	 * @param {Array, Object} array
	 * @return {String}
	 */
	$A.toString=function(array){
		return Ap.toString.call(array);	
	};
	/**
	 * Adds one or more elements to the beginning of an array and returns the new length
	 * @alias Array.Ext.unshift
	 * @param {Array, Object} array
	 * @param {Object} element1
	 * @param {Object} elementN
	 * @return {Number}
	 */
	$A.unshift=function(array, element1, elementN){
		return Ap.unshift.apply(array, Ap.slice.apply(arguments, [1, arguments.length]));
	};
	
	
    //Function
    if (!Fp.bind) {
        /**
         * Bind this function to an object, optional parameters can be specified.
         * @alias Function.prototype.bind
         * @param {Object} thisObject
         * @param {Object} [arg1]
         * @param {Object} [arg2]
         */
        Fp.bind = function(thisObject, arg1, arg2){
            var args = $A(arguments), object = args.shift(), _method = this;
            alert(object);
            return function(){
                return _method.apply(thisObject, args.concat($A(arguments)));
            };
        };
    }
    
    RegExp.prototype.match = RegExp.prototype.test;
})(Array, Array.prototype, Array.Ext, Function.prototype);



$A = Array.Ext;

var a = [];


