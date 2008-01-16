/**
 * @author Porfirio
 */


$break = {};
Next.Enumerable = function(object,self){
	if (typeof(object) == "function"  && !self){
		object=object.prototype;
	}else if (typeof(object)=="object"){
	}else{
		throw TypeError();
	}
	object.isEnumerable=true;
	return Next.extendObj(object,Next.Enumerable.prototype);
};
/**
 * Tests whether all elements in the enumerable pass the test implemented by the provided function.
 * @param {Function} callBack
 * @param {Object} [thisObject]
 */
Next.Enumerable.prototype.forEach = function(callBack, thisObject){
    try {
        this.iterate(callBack, thisObject);
    } 
    catch (e) {
        if (e != $break) {
            throw e;
        }
    }
};
/**
 * Returns true if every element in an array meets the
 * specified criteria.
 * @param {Function} callback
 * @param {Object} thisObject
 * @return {Boolean}
 */
Next.Enumerable.prototype.every = function(callback, thisObject){
    var result = true;
    this.forEach(function(value, key, enumerable){
        if (callback.call(thisObject, value, key, enumerable) === false) {
            result = false;
        }
    }, this);
    return result;
};
/**
 * Returns true if some element in the array passes the
 * test implemented by the provided function.
 * @param {Function} callback
 * @param {Object} thisObject
 * @return {Boolean}
 */
Next.Enumerable.prototype.some = function(callback, thisObject){
    var result = false;
    this.forEach(function(value, key, enumerable){
        if (callback.call(thisObject, value, key, enumerable) === true) {
            result = true;
        }
    }, this);
    return result;
};
/**
 * Creates a new array with all elements that meet the
 * specified criteria.
 * @param {Function} callback
 * @param {Object} thisObject
 * @return {Array}
 */
Next.Enumerable.prototype.filter = function(callback, thisObject){
    var result = [];
    this.forEach(function(value, key, enumerable){
        if (callback.call(thisObject, value, key, enumerable) === true) {
            result.push(value);
        }
    }, this);
    return result;
};
/**
 * Creates a new array with the results of calling a
 * provided function on every element in this array.
 * @param {Function} callback
 * @param {Object} thisObject
 * @return {Array}
 */
Next.Enumerable.prototype.map = function(callback, thisObject){
    var result = [];
    this.forEach(function(value, key, enumerable){
        result.push(callback.call(thisObject, value, key, enumerable));
    }, this);
    return result;
};


Next.Enumerable.prototype.grep = function(filter, callback, thisObject){
    callback = callback ? callback : function(v){
        return v;
    };
    var results = [];
    filter = new RegExp(filter);
    
    this.forEach(function(value, key, enumerable){
        if (filter.match(value)) {
            results.push(iterator.call(thisObject, value, key, enumerable));
        }
        
    });
    return results;
};

/**
 * Creates a new Range
 * @extends {Next.Enumerable}
 * @param {Object} start
 * @param {Object} end
 */
Next.Range=function(start, end){
	if (Number.is(start) && Number.is(end)){
		this.start=start;
		this.end=end;
	}else if (Number.is(start) && !Number.is(end)){
		this.end=start;
	}				
};
Next.Range.Extends(Next.Enumerable);
Next.Range.prototype.start=0;
Next.Range.prototype.end=-1;
/**
 * This is a private function 
 * @param {Function} callback
 * @param {Object} thisObject
 */
Next.Range.prototype.iterate=function(callback, thisObject){
	for (var key=this.start; key<=this.end; key++){
		callback.call(thisObject,key,key,this);
	}
};

/**
 * Creates a new Range
 * @param {Object} start
 * @param {Object} end
 * @return {Range}
 */

function $R(start, end){
	return new Next.Range(start, end);
}

//Array Enumerable extensions
if (!Array.prototype.forEach) {
    Array.prototype.iterate = function(callBack, thisObject){
        thisObject = (thisObject) ? thisObject : window;
        for (var key = 0, length = this.length; key < length; key++) {
            callBack.call(thisObject, this[key], key, this);
        }
    };
    Array.prototype.forEach = Next.Enumerable.prototype.forEach;
}
else {
    Array.prototype.iterate = Array.prototype.forEach;
    Array.prototype.forEach = Next.Enumerable.prototype.forEach;
}
if (!Array.prototype.every) {
    Array.prototype.every = Next.Enumerable.prototype.every;
}
if (!Array.prototype.some) {
    Array.prototype.some = Next.Enumerable.prototype.some;
}
if (!Array.prototype.filter) {
    Array.prototype.filter = Next.Enumerable.prototype.filter;
}
if (!Array.prototype.map) {
    Array.prototype.map = Next.Enumerable.prototype.map;
}
Array.prototype.grep = Next.Enumerable.prototype.grep;
Array.prototype.empty=function(){
	return this.length===0;
};
