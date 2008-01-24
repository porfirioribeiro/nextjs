/**
 * @author Porfirio
 */

/**
 * You should not call this constructor by yourself!
 * @classDescription This is prop class
 * @constructor
 */
Next.Property=function (thisObject, getter, setter){
    this.thisObject = thisObject;
    this.getter = getter;
    this.setter = setter;
};
Next.Property.prototype.type=Next.Property;
Next.Property.prototype.typeOfCheck=Object.isDef;
Next.Property.prototype.getter = null;
Next.Property.prototype.setter = null;
Next.Property.prototype.thisObject = null;
/**
 * Get the value of this Next.Property
 */
Next.Property.prototype.get = function(){
    if (!Function.is(this.getter)) {
        throw Error("This Property dont have a getter function!");
    }
    return this.getter.call(this.thisObject);
};
/**
 * Set's the value of this prop, optionaly do it after a delay
 * @param {Object} value
 * @param {Number} [delay] Time to wait bfore set the value in milliseconds
 */
Next.Property.prototype.set = function(value, delay){
    if (!Function.is(this.setter)) {
        throw new Error("This Property dont have a setter function!");
    }
	if (this.type.is(value)){
		value=value.get();
	}		
	if (!this.typeOfCheck(value)){
		throw new Error("The value you specified can not be applyed this property");	
	}	
    if (Number.is(delay)) {
        var __prop = this;
        setTimeout(function(){
            __prop.setter.call(__prop.thisObject, value);
        }, delay);
    }
    else {
		this.setter.apply(this.thisObject, [value]);
    }
};
/**
 * Boolean Property
 * @param {Object} thisObject
 * @param {Object} getter
 * @param {Object} setter
 * @extends {Next.Property}
 */
Next.Bool=function(thisObject, getter, setter){
	Next.Property.apply(this,arguments);
};
Next.Bool.Extends(Next.Property);
Next.Bool.prototype.type=Next.Bool;
Next.Bool.prototype.typeOfCheck=Boolean.is;
Next.Bool.prototype.is=Next.Bool.prototype.get;
Next.Bool.prototype.toggle=function(){
	this.set(-1);
};
Next.Bool.prototype.set=function(v){
	if (this.type.is(v)){
		v=v.get();
	}		
	var t=(v==-1)?(!this.is()):(!!v || v==1 ||false);
	this.$.sup.set.call(this,t);
};

/**
 * String Property
 * @param {Object} thisObject
 * @param {Object} getter
 * @param {Object} setter
 * @extends {Next.Property}
 */
Next.String=function(thisObject, getter, setter){
	Next.Property.apply(this,arguments);
};
Next.String.Extends(Next.Property);
Next.String.prototype.type=Next.String;
Next.String.prototype.typeOfCheck=String.is;
Next.String.prototype.toString=Next.String.prototype.get;
Next.String.prototype.concat=function(str){
	this.set(this.get()+""+str);
};
/**
 * Float  Property
 * @param {Object} thisObject
 * @param {Object} getter
 * @param {Object} setter
 * @extends {Next.Property}
 */
Next.Float=function(thisObject, getter, setter){
	Next.Property.apply(this,arguments);
};
Next.Float.Extends(Next.Property);
Next.Float.prototype.type=Next.Float;
Next.Float.prototype.typeOfCheck=Number.is;


Next.Number=function(thisObject,getter,setter,general){
	var prop=new Next.Property(thisObject,getter,setter,general);
	prop._get=prop.get;

	prop.get=function(){
		return prop._get().toFloat();
	};
	return prop;
};









