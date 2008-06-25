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
var prop={
	Number:{
		type:Number,
		is:function(ob){
			return typeof(ob)=="number";
		},
		add:function(v){
			this.set(this.get()+v);
		}
	},
	Array:{
		type:Array,
		is:function(ob){
			return ob instanceof Array;
		},
		add:function(v){
			var arr=this.get();
			var ret=[];
			for (var i=0;i<arr.length;i++){
				ret[i]=arr[i]+v;
			}
			this.set(ret);
		}
	},
	Object:{
		type:Object,
		is:function(ob){
			return ob instanceof Object;
		},
		add:function(v){
			var o=this.get();
			var r={};
			for (var i in o){
				r[i]=o[i]+v[i];
			}
			this.set(r);
		}
	}
};
/**
 * Property class for do 
 * @classDescription Property class
 * @constructor
 * @param {Object} object
 * @param {Object} options
 */
prop.Property=function(object, options){
	this.object=object;
	this.options=options || {};
	this.type=options.type || prop.Number;
	this.listeners=[];
};
prop.Property.init=function(object, props){
	if (typeof(object)!="object" || !(props && props.length)){
		throw new Error("Wrong parameters!!");
	}
	for (var i=0;i<props.length;i++){
		object[props[i]]=new prop.Property(object, object[props[i]]);
		
	}
};
prop.Property.prototype.object=null;
prop.Property.prototype.options={};
prop.Property.prototype.type=prop.Number;
prop.Property.prototype.listeners=[];
prop.Property.prototype.listen=function(fn){
	return this.listeners.push(fn)-1;
};
prop.Property.prototype.stopListen=function(fn){
	var i=this.listeners.indexOf(fn);
	if (i>-1){
		this.listeners.splice(i,1);
	}
};
prop.Property.prototype.get=function(){
	if (this.options.get){
		value=this.options.get.call(this.object);
		if (!this.type.is(value)){
			throw Error("Malformed getter function, returned wrong datatype. Expected: "+this.type);
		}		
		return value;
	}
	throw Error("Write only property!");
};
prop.Property.prototype.set=function(value){
	if (value instanceof prop.Property){
		if (value.type==this.type){
			value=value.get();
		}else{
			throw Error("Passing Property of the wrong type! Expected: "+this.type);
		}
	}
	if (!this.type.is(value)){
		throw Error("Invalid datatype! Expected: "+this.type);
	}
	if (this.options.set){
		var oldV=this.get();
		this.options.set.call(this.object, value);
		for (var i=0;i<this.listeners.length;i++){
			this.listeners[i](oldV,value);
		}
		return;
	}
	throw Error("Read only property!");
};
prop.Property.prototype.add=function(value){
	this.type.add.call(this,value);
};
prop.Property.prototype.__bindedTo=null;
prop.Property.prototype.__bindCallback=null;
/**
 * Bind this property to other
 * @param {prop.Property} property
 * @param {Function} offset
 */
prop.Property.prototype.bind=function(property, offset){
	if (typeof(this.__bindCallback)=="function" && typeof(this.__bindedTo)=="object"){
		this.unbind();
	}
	var self=this;
	this.__bindedTo=property;
	this.__bindCallback=function(o,n){
		var v=(typeof(offset)=="function")?offset.call(self,n):n;
		self.set(v);
	};
	property.listen(this.__bindCallback);
	this.__bindCallback(null,property.get());
};
/**
 * Unbind from this proerty
 */
prop.Property.prototype.unbind=function(){
	this.__bindedTo.stopListen(this.__bindCallback);
	this.__bindCallback=null;
	this.__bindedTo=null;
};
