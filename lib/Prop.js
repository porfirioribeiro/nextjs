/**
 * @author Porfirio
 */

/**
 * You should not call this constructor by yourself!
 * @classDescription This is prop class
 * @constructor
 */
Next.Property=function (thisObject, getter, setter, general){
    this.thisObject = thisObject;
    this.getter = getter;
    this.setter = setter;
	this.general=general || false;
};

Next.Property.checkAnimOptions=function(ob, options, onStep){
    if (ob.animator) {
        ob.animator.stop();
    }
	ob.from=(options.from)?options.from:ob.get();
	if (Object.isNull(options.to)){
		throw Error("Please specify where 'to' go!");
	}else{
		ob.to=options.to;
	}		
	if (Function.is(onStep)){
		if (options.onStep){
			options.userOnStep=options.onStep;
		}	
		options.onStep=function(v){
			var V=ob.onStep(v);
			onStep.apply(ob,[V,v]);
			if(options.userOnStep){
				options.userOnStep.apply(ob,[V,v]);
			}
			
		};	
	}	
};
Next.Property.prototype.getter = null;
Next.Property.prototype.setter = null;
Next.Property.prototype.general = null;
Next.Property.prototype.thisObject = null;
Next.Property.prototype.animator = null;
/**
 * Get the value of this Next.Property
 */
Next.Property.prototype.get = function(){
    if (!Function.is(this.getter)) {
        throw Error("This Property dont have a getter function!");
    }// TODO toFloat
	if (this.general){
		return this.getter.apply(this.thisObject,[this]).toFloat();
	}
    return this.getter.call(this.thisObject).toFloat();
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
    if (Number.is(delay)) {
        var __prop = this;
        setTimeout(function(){
            __prop.setter.call(__prop.thisObject, value);
        }, delay);
    }
    else {
		if (this.general) {
			this.setter.apply(this.thisObject, [this,value]);		
		}else{
			this.setter.apply(this.thisObject, [value]);
		}
    }
};
/**
 * Animate this Next.Property<br>
 * options is some of this options:<br>
 * <p><i>[optional]</i><b>from</b>  : Start value, if not specified, the current value is used</p>
 * <p><i>[required]</i><b>to</b>: End&nbsp; value, it will throw an error if you don't specify one</p>
 * <p><i>[optional]</i><b>duration</b>  : Time that animation will take for animate &quot;from&quot; &quot;to&quot;, by default is 1000</p>
 * @param {Object} options The options for animate
 * @return {Next.Animation}
 */
Next.Property.prototype.animate = function(options){
	Next.Property.checkAnimOptions(this,options,function(v){
		this.set(v);
	});
    this.animator = new Next.Animation( options);
	if (this.from>this.to){
		this.animator.reverse();
	}else{
		this.animator.play();
	}
    return this.animator;//just for test
};
Next.Property.prototype.onStep=function(v){
	var V;
	if (this.to>this.from){
		V=(v*(this.to-this.from))+this.from;
	}else{
		V=(v*(this.from-this.to))+this.to;
	}		
	return V;
};
Next.Property.prototype.isAnimating = function(){
	return (this.animator && this.animator.isAnimating);
};
Next.Property.prototype.stopAnim = function(){
	(this.animator && this.animator.stop());
};

Next.Number=function(thisObject,getter,setter,general){
	var prop=new Next.Property(thisObject,getter,setter,general);
	return prop;
};

Next.Object=function(thisObject,getter,setter,general,ob){
	var prop=new Next.Property(thisObject,getter,setter,general);
	prop.obForUse=ob;
	prop.onStep=Next.Object.onStep;
	return prop;
};
Next.Object.onStep=function(v){
	var V={};
	for (var i=0;i<this.obForUse.length;i++){
		var o=this.obForUse[i];
		if (this.to[o]){
			if (this.to[o]>this.from[o]){
				V[o]=(v*(this.to[o]-this.from[o]))+this.from[o];
			}else{
				V[o]=(v*(this.from[o]-this.to[o]))+this.to[o];
			}			
		}
			
	}
	return V;
};







