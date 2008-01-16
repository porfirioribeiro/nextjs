/**
 * @author Porfirio
 */

//This class is just on start!!
Next.Eventable = function(){};

Next.Eventable.prototype.eventObject={};

Next.Eventable.prototype.fireEvent=function(event){
	var self;
	var args=$A(arguments);
	args.shift();
	if (Array.is(this.eventObject[event])) {
		this.eventObject[event].forEach(function(ev){
			ev.apply(self,args);
		});
	}
	if (Function.is(this[event])){
		this[event].apply(this,args);
	}
};

Next.Eventable.prototype.observeEvent=function(event,callback){
	if (!Array.is(this.eventObject[event])){
		this.eventObject[event]=[];
	}
	this.eventObject[event].push(callback);
	return callback;
};

Next.Eventable.prototype.unObserveEvent=function(event, callback){
	// TODO
};
