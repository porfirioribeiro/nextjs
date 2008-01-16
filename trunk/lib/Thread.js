/**
 * @author Porfirio
 */

/**
 * Creates a thread, optionaly you can specify the function to run
 * @param {Object} [options]
 * @param {Function} [runFn]
 */
Next.Thread = function(options,runFn){
    if (Function.is(options)) {
        this.run = options;
    }else if (Function.is(runFn)) {
        this.run = runFn;
		if (Object.is(options)){
			Next.extendObj(this,options);
		}
    }
};
Next.Thread.prototype._interval = null;
Next.Thread.prototype.interval = 0;
Next.Thread.prototype.periodical = false;
Next.Thread.prototype.timesExecuted=0;
Next.Thread.prototype.timesToExecute=-1;
Next.Thread.prototype.isWorking=false;
Next.Thread.prototype.isPaused=false;
/**
 * Starts the Thread<br>
 * #start(); Starts the Thread now<br>
 * #start(10); Starts the Thread in 10 milseconds<br>
 * #start(10,true); Executes the Thread all 10 mileseconds until you #stop(); it
 * @param {Number} [interval] The milliseconds to wait to execute it, default=0 Execute now
 * @param {Boolean} [periodical] If true the Thread will be executed repeat with the interval
 * @param {Number} [timesToExecute] times to execute the periodical
 */
Next.Thread.prototype.start = function(interval, periodical, timesToExecute){
	this.stop();//just for dont have multiple instances
	if (Number.is(interval)){
		this.interval=interval;
	}
	if (Boolean.is(periodical)){
		this.periodical=periodical;
	}
	if (Number.is(timesToExecute)){
		this.timesToExecute=timesToExecute;
	}
    this.timesExecuted=0;
	this.isWorking=true;
	this.isPaused=false;
    var _thread = this;
    this.callback = function(){
		if (_thread.timesExecuted==_thread.timesToExecute){
			_thread.stop();
			return;
		}
		_thread.timesExecuted++;
        _thread.run();
    };
    this._interval = (this.periodical) ? setInterval(this.callback, this.interval) : setTimeout(this.callback, this.interval);
};
/**
 * Stop the Thread
 */
Next.Thread.prototype.stop = function(){
	this.isWorking=false;
    if (this.periodical) {
        clearInterval(this._interval);
    }
    else {
        clearTimeout(this._interval);
    }
};
/**
 * Pauses or unpauses the thread ( only for periodical threads )<br>
 * If you want to specify if you want to pause or unpause instehead of toggle set it on paramater<br>
 * It starts the thread if its not running <br>
 * pause(); //Toggles from pause to unpaused
 * pause(1); //Pause the thread
 * pause(0); //Unpause the thread
 * @param {Boolean} [pause]
 */
Next.Thread.prototype.pause=function(pause){
	if (!this.periodical){
		return;
	}
	this.isPaused=(this.isPaused)?false:true;
	if (Boolean.is(pause)){
		this.isPaused=pause;
	}		
	if (this.isWorking){
		if (this.isPaused){
			clearInterval(this._interval);
		}else{
			this._interval=setInterval(this.callback, this.interval);
		}		
	}else{
		this.start();
	}
};
/**
 * This is the function to be runed
 * This function is abstract, it doesnt do nothing, and will be overiten
 */
Next.Thread.prototype.run = function(){
};