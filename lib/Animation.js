/**
 * @author Porfirio
 */

/**
 *
 * @param {Prop} thisObject
 * @param {Object} options
 */
Next.Animation = function(options){
    var self = this;
    if (!Object.is(options)) {
        throw Error("The first parameter of animate function must be an object");
    }
	this.duration=Number.is(options.duration)?options.duration:1000;
	this.interval=Number.is(options.interval)?options.interval:20;
	this.interval=Number.is(options.interval)?options.interval:20;
	this.onStep=Function.is(options.onStep)?options.onStep:function(){};
	this.onComplete=Function.is(options.onComplete)?options.onComplete:function(){};
	this.transition=Function.is(options.transition)?options.transition:Next.tx.linear;
	this.toggleIn=Boolean.is(options.toggleIn)?options.toggleIn:false;
	this.target = 0;
	this.state = 0;
	this.isAnimating=false;
	if (this.toggleIn){
		this.duration=this.duration/2;
		this._onComplete=this.onComplete;
		this.haveToggledIn=false;
		this.onComplete=function(){
			if (!this.haveToggledIn){
				this.isTogglingIn=false;
				this.toggle();
				this.isTogglingIn=true;
				this.haveToggledIn=true;
			}else{
				this.isTogglingIn=false;
				this.haveToggledIn=false;
				this._onComplete();
			}
		};
	}
};
Next.Animation.prototype = {
	onTimerEvent: function(){
		var now = new Date().getTime();
		var timePassed = now - this.lastTime;
		this.lastTime = now;
		var movement = (timePassed / this.duration) * (this.state < this.target ? 1 : -1);
		if (Math.abs(movement) >= Math.abs(this.state - this.target)) {
			this.state = this.target;
		}
		else {
			this.state += movement;
		}
		this.propage();
		if (this.target == this.state) {
			this.stop();
			this.onComplete.call(this);
		}
	},
	propage:function(){
		var v = this.transition(this.state);
		this.onStep.apply(this, [v]);		
	},
	seekFromTo: function(from, to){
		if (this.toggleIn) {
			if (this.isTogglingIn){
				return;
			}
			this.isTogglingIn=true;
		}
		this.isAnimating=true;
		var _this = this;
		this.target = Math.max(0, Math.min(1, to));
		this.state = Math.max(0, Math.min(1, from));
		this.lastTime = new Date().getTime();
		if (!this.intervalId) {
			this.intervalId = window.setInterval(function(){
	            _this.onTimerEvent();
	        }, this.interval);
		}
	},
	seekTo: function(to) {
		this.seekFromTo(this.state, to);
	},
	jumpTo: function(to) {
		this.target = this.state = Math.max(0, Math.min(1, to));
		this.propagate();
	},
	toggle: function() {
		this.seekTo(1 - this.target);
	},
	play: function() {this.seekFromTo(0, 1);},
	reverse: function() {this.seekFromTo(1, 0);},	
	stop: function(){
	    if (this.intervalId) {
			window.clearInterval(this.intervalId);
			this.intervalId = null;
			this.isAnimating=false;		
	    }
	}	
};
Next.tx={
	easeInOut: function(pos){
		return ((-Math.cos(pos*Math.PI)/2) + 0.5);
	},
	linear: function(n){
		return n;
	},

	quadIn: function(n){
		return Math.pow(n, 2);
	},

	quadOut: function(n){
		return n * (n-2) * -1;
	},

	quadInOut: function(n){
		n=n*2;
		if(n<1){ return Math.pow(n, 2) / 2; }
		return -1 * ((--n)*(n-2) - 1) / 2;
	},

	cubicIn: function(n){
		return Math.pow(n, 3);
	},

	cubicOut: function(n){
		return Math.pow(n-1, 3) + 1;
	},

	cubicInOut: function(n){
		n=n*2;
		if(n<1){ return Math.pow(n, 3) / 2; }
		n-=2;
		return (Math.pow(n, 3) + 2) / 2;
	},

	quartIn: function(n){
		return Math.pow(n, 4);
	},

	quartOut: function(n){
		return -1 * (Math.pow(n-1, 4) - 1);
	},

	quartInOut: function(n){
		n=n*2;
		if(n<1){ return Math.pow(n, 4) / 2; }
		n-=2;
		return -1/2 * (Math.pow(n, 4) - 2);
	},

	quintIn: function(n){
		return Math.pow(n, 5);
	},

	quintOut: function(n){
		return Math.pow(n-1, 5) + 1;
	},

	quintInOut: function(n){
		n=n*2;
		if(n<1){ return Math.pow(n, 5) / 2; };
		n-=2;
		return (Math.pow(n, 5) + 2) / 2;
	},

	sineIn: function(n){
		return -1 * Math.cos(n * (Math.PI/2)) + 1;
	},

	sineOut: function(n){
		return Math.sin(n * (Math.PI/2));
	},

	sineInOut: function(n){
		return -1 * (Math.cos(Math.PI*n) - 1) / 2;
	},

	expoIn: function(n){
		return (n==0) ? 0 : Math.pow(2, 10 * (n - 1));
	},

	expoOut: function(n){
		return (n==1) ? 1 : (-1 * Math.pow(2, -10 * n) + 1);
	},

	expoInOut: function(n){
		if(n==0){ return 0; }
		if(n==1){ return 1; }
		n = n*2;
		if(n<1){ return Math.pow(2, 10 * (n-1)) / 2; }
		--n;
		return (-1 * Math.pow(2, -10 * n) + 2) / 2;
	},

	circIn: function(n){
		return -1 * (Math.sqrt(1 - Math.pow(n, 2)) - 1);
	},

	circOut: function(n){
		n = n-1;
		return Math.sqrt(1 - Math.pow(n, 2));
	},

	circInOut: function(n){
		n = n*2;
		if(n<1){ return -1/2 * (Math.sqrt(1 - Math.pow(n, 2)) - 1); }
		n-=2;
		return 1/2 * (Math.sqrt(1 - Math.pow(n, 2)) + 1);
	},

	backIn: function(n){
		var s = 1.70158;
		return Math.pow(n, 2) * ((s+1)*n - s);
	},

	backOut: function(n){
		n = n - 1;
		var s = 1.70158;
		return Math.pow(n, 2) * ((s + 1) * n + s) + 1;
	},

	backInOut: function(n){
		var s = 1.70158 * 1.525;
		n = n*2;
		if(n < 1){ return (Math.pow(n, 2)*((s+1)*n - s))/2; }
		n-=2;
		return (Math.pow(n, 2)*((s+1)*n + s) + 2)/2;
	},

	elasticIn: function(n){
		if(n==0){ return 0; }
		if(n==1){ return 1; }
		var p = 0.3;
		var s = p/4;
		n = n - 1;
		return -1 * Math.pow(2,10*n) * Math.sin((n-s)*(2*Math.PI)/p);
	},

	elasticOut: function(n){
		// summary: An easing function that elasticly snaps around the target value, near the end of the Animation
		if(n==0) return 0;
		if(n==1) return 1;
		var p = 0.3;
		var s = p/4;
		return Math.pow(2,-10*n) * Math.sin((n-s)*(2*Math.PI)/p) + 1;
	},

	elasticInOut: function(n){
		// summary: An easing function that elasticly snaps around the value, near the beginning and end of the Animation		
		if(n==0) return 0;
		n = n*2;
		if(n==2) return 1;
		var p = 0.3*1.5;
		var s = p/4;
		if(n<1){
			n-=1;
			return -0.5*(Math.pow(2,10*n) * Math.sin((n-s)*(2*Math.PI)/p));
		}
		n-=1;
		return 0.5*(Math.pow(2,-10*n) * Math.sin((n-s)*(2*Math.PI)/p)) + 1;
	},

	bounceIn: function(n){
		// summary: An easing function that "bounces" near the beginning of an Animation
		return (1 - Next.tx.bounceOut(1-n)); // Decimal
	},

	bounceOut: function(n){
		// summary: An easing function that "bounces" near the end of an Animation
		var s=7.5625;
		var p=2.75;
		var l; 
		if(n < (1 / p)){
			l = s*Math.pow(n, 2);
		}else if(n < (2 / p)){
			n -= (1.5 / p);
			l = s * Math.pow(n, 2) + 0.75;
		}else if(n < (2.5 / p)){
			n -= (2.25 / p);
			l = s * Math.pow(n, 2) + 0.9375;
		}else{
			n -= (2.625 / p);
			l = s * Math.pow(n, 2) + 0.984375;
		}
		return l;
	},

	bounceInOut: function(n){
		// summary: An easing function that "bounces" at the beginning and end of the Animation
		if(n<0.5){ return Next.tx.bounceIn(n*2) / 2; }
		return (Next.tx.bounceOut(n*2-1) / 2) + 0.5; // Decimal
	}	
};