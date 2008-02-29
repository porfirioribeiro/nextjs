/**
 * @author Porfirio
 */
//-START-firebug/firebug.js-

if (!("console" in window) || !("firebug" in console)) {
(function()
{
    window.console =
    {
        log: function()
        {
            logFormatted(arguments, "");
        },

        debug: function()
        {
            logFormatted(arguments, "debug");
        },

        info: function()
        {
            logFormatted(arguments, "info");
        },

        warn: function()
        {
            logFormatted(arguments, "warning");
        },

        error: function()
        {
            logFormatted(arguments, "error");
        },

        assert: function(truth, message)
        {
            if (!truth)
            {
                var args = [];
                for (var i = 1; i < arguments.length; ++i)
                    args.push(arguments[i]);

                logFormatted(args.length ? args : ["Assertion Failure"], "error");
                throw message ? message : "Assertion Failure";
            }
        },

        dir: function(object)
        {
            var html = [];

            var pairs = [];
            for (var name in object)
            {
                try
                {
                    pairs.push([name, object[name]]);
                }
                catch (exc)
                {
                }
            }

            pairs.sort(function(a, b) { return a[0] < b[0] ? -1 : 1; });

            html.push('<table>');
            for (var i = 0; i < pairs.length; ++i)
            {
                var name = pairs[i][0], value = pairs[i][1];

                html.push('<tr>',
                '<td class="propertyNameCell"><span class="propertyName">',
                    escapeHTML(name), '</span></td>', '<td><span class="propertyValue">');
                appendObject(value, html);
                html.push('</span></td></tr>');
            }
            html.push('</table>');

            logRow(html, "dir");
        },

        dirxml: function(node)
        {
            var html = [];

            appendNode(node, html);
            logRow(html, "dirxml");
        },

        group: function()
        {
            logRow(arguments, "group", pushGroup);
        },

        groupEnd: function()
        {
            logRow(arguments, "", popGroup);
        },

        time: function(name)
        {
            timeMap[name] = (new Date()).getTime();
        },

        timeEnd: function(name)
        {
            if (name in timeMap)
            {
                var delta = (new Date()).getTime() - timeMap[name];
                logFormatted([name+ ":", delta+"ms"]);
                delete timeMap[name];
            }
        },

        count: function()
        {
            this.warn(["count() not supported."]);
        },

        trace: function()
        {
            this.warn(["trace() not supported."]);
        },

        profile: function()
        {
            this.warn(["profile() not supported."]);
        },

        profileEnd: function()
        {
        },

        clear: function()
        {
            consoleBody.innerHTML = "";
        },

        open: function()
        {
            toggleConsole(true);
        },

        close: function()
        {
            if (frameVisible)
                toggleConsole();
        },

        evaled_lines: [],
        evaled_lines_pointer: 0
    };

    // ********************************************************************************************

    var consoleFrame = null;
    var consoleBody = null;
    var commandLine = null;

    var frameVisible = false;
    var messageQueue = [];
    var groupStack = [];
    var timeMap = {};

    var clPrefix = ">>> ";

    var isFirefox = navigator.userAgent.indexOf("Firefox") != -1;
    var isIE = navigator.userAgent.indexOf("MSIE") != -1;
    var isOpera = navigator.userAgent.indexOf("Opera") != -1;
    var isSafari = navigator.userAgent.indexOf("AppleWebKit") != -1;

    // ********************************************************************************************

    function toggleConsole(forceOpen)
    {
        frameVisible = forceOpen || !frameVisible;
        if (consoleFrame)
            consoleFrame.style.visibility = frameVisible ? "visible" : "hidden";
        else
            waitForBody();
    }

    function focusCommandLine()
    {
        toggleConsole(true);
        if (commandLine)
            commandLine.focus();
    }

    function waitForBody()
    {
        if (document.body)
            createFrame();
        else
            setTimeout(waitForBody, 200);
    }

    function createFrame()
    {
        if (consoleFrame)
            return;

        window.onFirebugReady = function(doc)
        {
            window.onFirebugReady = null;

            var toolbar = doc.getElementById("toolbar");
            toolbar.onmousedown = onSplitterMouseDown;

            commandLine = doc.getElementById("commandLine");
            addEvent(commandLine, "keydown", onCommandLineKeyDown);

            addEvent(doc, isIE || isSafari ? "keydown" : "keypress", onKeyDown);

            consoleBody = doc.getElementById("log");
            layout();
            flush();
        }

        var baseURL = getFirebugURL();

        consoleFrame = document.createElement("iframe");
        consoleFrame.setAttribute("src", "lib/firebug/firebug.html");
        consoleFrame.setAttribute("frameBorder", "0");
        consoleFrame.style.visibility = (frameVisible ? "visible" : "hidden");
        consoleFrame.style.zIndex = "2147483647";
        consoleFrame.style.position = "fixed";
        consoleFrame.style.width = "100%";
        consoleFrame.style.left = "0";
        consoleFrame.style.bottom = "0";
        consoleFrame.style.height = "200px";
        document.body.appendChild(consoleFrame);
    }

    function getFirebugURL()
    {
        var scripts = document.getElementsByTagName("script");
        for (var i = 0; i < scripts.length; ++i)
        {
            if (scripts[i].src.indexOf("firebug.js") != -1)
            {
                var lastSlash = scripts[i].src.lastIndexOf("/");
                return scripts[i].src.substr(0, lastSlash);
            }
        }
    }

    function evalCommandLine()
    {
        var text = commandLine.value;
        commandLine.value = "";

        console.evaled_lines[console.evaled_lines.length] = text;
        console.evaled_lines_pointer = console.evaled_lines.length;

        logRow([clPrefix, text], "command");

        var value;
        try
        {
            value = eval(text);
			console.log(value);
        }
        catch (exc)
        {
			console.error(exc);
        }

        
    }

    function layout()
    {
        var toolbar = consoleBody.ownerDocument.getElementById("toolbar");
        var height = consoleFrame.offsetHeight - (toolbar.offsetHeight + commandLine.offsetHeight);
        consoleBody.style.top = toolbar.offsetHeight + "px";
        consoleBody.style.height = height + "px";

        commandLine.style.top = (consoleFrame.offsetHeight - commandLine.offsetHeight) + "px";
    }

    function logRow(message, className, handler)
    {
        if (consoleBody)
            writeMessage(message, className, handler);
        else
        {
            messageQueue.push([message, className, handler]);
            waitForBody();
        }
    }

    function flush()
    {
        var queue = messageQueue;
        messageQueue = [];

        for (var i = 0; i < queue.length; ++i)
            writeMessage(queue[i][0], queue[i][1], queue[i][2]);
    }

    function writeMessage(message, className, handler)
    {
        var isScrolledToBottom =
            consoleBody.scrollTop + consoleBody.offsetHeight >= consoleBody.scrollHeight;

        if (!handler)
            handler = writeRow;

        handler(message, className);

        if (isScrolledToBottom)
            consoleBody.scrollTop = consoleBody.scrollHeight - consoleBody.offsetHeight;
    }

    function appendRow(row)
    {
        var container = groupStack.length ? groupStack[groupStack.length-1] : consoleBody;
        container.appendChild(row);
    }

    function writeRow(message, className)
    {
        var row = consoleBody.ownerDocument.createElement("div");
        row.className = "logRow" + (className ? " logRow-"+className : "");
        row.innerHTML = message.join("");
        appendRow(row);
    }

    function pushGroup(message, className)
    {
        logFormatted(message, className);

        var groupRow = consoleBody.ownerDocument.createElement("div");
        groupRow.className = "logGroup";
        var groupRowBox = consoleBody.ownerDocument.createElement("div");
        groupRowBox.className = "logGroupBox";
        groupRow.appendChild(groupRowBox);
        appendRow(groupRowBox);
        groupStack.push(groupRowBox);
    }

    function popGroup()
    {
        groupStack.pop();
    }

    // ********************************************************************************************

    function logFormatted(objects, className)
    {
        var html = [];

        var format = objects[0];
        var objIndex = 0;

        if (typeof(format) != "string")
        {
            format = "";
            objIndex = -1;
        }

        var parts = parseFormat(format);
        for (var i = 0; i < parts.length; ++i)
        {
            var part = parts[i];
            if (part && typeof(part) == "object")
            {
                var object = objects[++objIndex];
                part.appender(object, html);
            }
            else
                appendText(part, html);
        }

        for (var i = objIndex+1; i < objects.length; ++i)
        {
            appendText(" ", html);

            var object = objects[i];
            if (typeof(object) == "string")
                appendText(object, html);
            else
                appendObject(object, html);
        }

        logRow(html, className);
    }

    function parseFormat(format)
    {
        var parts = [];

        var reg = /((^%|[^\\]%)(\d+)?(\.)([a-zA-Z]))|((^%|[^\\]%)([a-zA-Z]))/;
        var appenderMap = {s: appendText, d: appendInteger, i: appendInteger, f: appendFloat};

        for (var m = reg.exec(format); m; m = reg.exec(format))
        {
            var type = m[8] ? m[8] : m[5];
            var appender = type in appenderMap ? appenderMap[type] : appendObject;
            var precision = m[3] ? parseInt(m[3]) : (m[4] == "." ? -1 : 0);

            parts.push(format.substr(0, m[0][0] == "%" ? m.index : m.index+1));
            parts.push({appender: appender, precision: precision});

            format = format.substr(m.index+m[0].length);
        }

        parts.push(format);

        return parts;
    }

    function escapeHTML(value)
    {
        function replaceChars(ch)
        {
            switch (ch)
            {
                case "<":
                    return "&lt;";
                case ">":
                    return "&gt;";
                case "&":
                    return "&amp;";
                case "'":
                    return "&#39;";
                case '"':
                    return "&quot;";
            }
            return "?";
        };
        return String(value).replace(/[<>&"']/g, replaceChars);
    }

    function objectToString(object)
    {
        try
        {
            return object+"";
        }
        catch (exc)
        {
            return null;
        }
    }

    // ********************************************************************************************

    function appendText(object, html)
    {
        html.push(escapeHTML(objectToString(object)));
    }

    function appendNull(object, html)
    {
        html.push('<span class="objectBox-null">', escapeHTML(objectToString(object)), '</span>');
    }

    function appendString(object, html)
    {
        html.push('<span class="objectBox-string">&quot;', escapeHTML(objectToString(object)),
            '&quot;</span>');
    }

    function appendInteger(object, html)
    {
        html.push('<span class="objectBox-number">', escapeHTML(objectToString(object)), '</span>');
    }

    function appendFloat(object, html)
    {
        html.push('<span class="objectBox-number">', escapeHTML(objectToString(object)), '</span>');
    }

    function appendFunction(object, html)
    {
        var reName = /function ?(.*?)\(/;
        var m = reName.exec(objectToString(object));
        var name = m ? m[1] : "function";
        html.push('<span class="objectBox-function">', escapeHTML(name), '()</span>');
    }

    function appendObject(object, html)
    {
        try
        {
            if (object == undefined)
                appendNull("undefined", html);
            else if (object == null)
                appendNull("null", html);
            else if (typeof object == "string")
                appendString(object, html);
            else if (typeof object == "number")
                appendInteger(object, html);
            else if (typeof object == "function")
                appendFunction(object, html);
            else if (object.nodeType == 1)
                appendSelector(object, html);
            else if (typeof object == "object")
                appendObjectFormatted(object, html);
            else
                appendText(object, html);
        }
        catch (exc)
        {
        }
    }

    function appendObjectFormatted(object, html)
    {
        var text = objectToString(object);
        var reObject = /\[object (.*?)\]/;

        var m = reObject.exec(text);
        html.push('<span class="objectBox-object">', m ? m[1] : text, '</span>')
    }

    function appendSelector(object, html)
    {
        html.push('<span class="objectBox-selector">');

        html.push('<span class="selectorTag">', escapeHTML(object.nodeName.toLowerCase()), '</span>');
        if (object.id)
            html.push('<span class="selectorId">#', escapeHTML(object.id), '</span>');
        if (object.className)
            html.push('<span class="selectorClass">.', escapeHTML(object.className), '</span>');

        html.push('</span>');
    }

    function appendNode(node, html)
    {
        if (node.nodeType == 1)
        {
            html.push(
                '<div class="objectBox-element">',
                    '&lt;<span class="nodeTag">', node.nodeName.toLowerCase(), '</span>');

            for (var i = 0; i < node.attributes.length; ++i)
            {
                var attr = node.attributes[i];
                if (!attr.specified)
                    continue;

                html.push('&nbsp;<span class="nodeName">', attr.nodeName.toLowerCase(),
                    '</span>=&quot;<span class="nodeValue">', escapeHTML(attr.nodeValue),
                    '</span>&quot;')
            }

            if (node.firstChild)
            {
                html.push('&gt;</div><div class="nodeChildren">');

                for (var child = node.firstChild; child; child = child.nextSibling)
                    appendNode(child, html);

                html.push('</div><div class="objectBox-element">&lt;/<span class="nodeTag">',
                    node.nodeName.toLowerCase(), '&gt;</span></div>');
            }
            else
                html.push('/&gt;</div>');
        }
        else if (node.nodeType == 3)
        {
            html.push('<div class="nodeText">', escapeHTML(node.nodeValue),
                '</div>');
        }
    }

    // ********************************************************************************************

    function addEvent(object, name, handler)
    {
        if (document.all)
            object.attachEvent("on"+name, handler);
        else
            object.addEventListener(name, handler, false);
    }

    function removeEvent(object, name, handler)
    {
        if (document.all)
            object.detachEvent("on"+name, handler);
        else
            object.removeEventListener(name, handler, false);
    }

    function cancelEvent(event)
    {
        if (document.all)
            event.cancelBubble = true;
        else{
			event.stopPropagation();
			event.preventDefault();
		}
            
    }

    function onError(msg, href, lineNo)
    {
        var html = [];

        var lastSlash = href.lastIndexOf("/");
        var fileName = lastSlash == -1 ? href : href.substr(lastSlash+1);

        html.push(
            '<span class="errorMessage">', msg, '</span>',
            '<div class="objectBox-sourceLink">', fileName, ' (line ', lineNo, ')</div>'
        );

        logRow(html, "error");
    };

    function onKeyDown(event)
    {
        if (event.keyCode == 123)
            toggleConsole();
        else if ((event.keyCode == 108 || event.keyCode == 76) && event.shiftKey
                 && (event.metaKey || event.ctrlKey))
            focusCommandLine();
        else if (event.keyCode == 38) {
            if (console.evaled_lines_pointer > 0) {
                console.evaled_lines_pointer--;
                commandLine.value = console.evaled_lines[console.evaled_lines_pointer];
            }		
        }
        else if (event.keyCode == 40) {
            if (console.evaled_lines_pointer < console.evaled_lines.length - 1) {
                console.evaled_lines_pointer++;
                commandLine.value = console.evaled_lines[console.evaled_lines_pointer];
            }	
        }

        else
            return;

        cancelEvent(event);
		return false;
    }

    function onSplitterMouseDown(event)
    {
        if (isSafari || isOpera)
            return;

        addEvent(document, "mousemove", onSplitterMouseMove);
        addEvent(document, "mouseup", onSplitterMouseUp);

        for (var i = 0; i < frames.length; ++i)
        {
            addEvent(frames[i].document, "mousemove", onSplitterMouseMove);
            addEvent(frames[i].document, "mouseup", onSplitterMouseUp);
        }
    }

    function onSplitterMouseMove(event)
    {
        var win = document.all
            ? event.srcElement.ownerDocument.parentWindow
            : event.target.ownerDocument.defaultView;

        var clientY = event.clientY;
        if (win != win.parent)
            clientY += win.frameElement ? win.frameElement.offsetTop : 0;

        var height = consoleFrame.offsetTop + consoleFrame.clientHeight;
        var y = height - clientY;

        consoleFrame.style.height = y + "px";
        layout();
    }

    function onSplitterMouseUp(event)
    {
        removeEvent(document, "mousemove", onSplitterMouseMove);
        removeEvent(document, "mouseup", onSplitterMouseUp);

        for (var i = 0; i < frames.length; ++i)
        {
            removeEvent(frames[i].document, "mousemove", onSplitterMouseMove);
            removeEvent(frames[i].document, "mouseup", onSplitterMouseUp);
        }
    }

    function onCommandLineKeyDown(event)
    {
        if (event.keyCode == 13)
            evalCommandLine();
        else if (event.keyCode == 27)
            commandLine.value = "";
    }

    window.onerror = onError;
    addEvent(document, isIE || isSafari ? "keydown" : "keypress", onKeyDown);

    if (document.documentElement.getAttribute("debug") == "true")
        toggleConsole(true);
})();
}
//-END-firebug/firebug.js-
//-START-Next.js-
/**
 * @author Porfirio
 * @license GPL
 * @namespace Next
 */
/**
 * Default Namespace
 * @classDescription Next!
 * @type {Next}
 */
var Next=function(){};


/**
 * Get element by id
 * @param {Object} element
 * @param {HTMLElement} [parent]
 * @alias {Next.byId}
 * @return {HTMLElement}
 */
Next.byId=function(element,parent){
	if (!parent){
		parent=document;
	}
	if (String.is(element)){
		element=parent.getElementById(element);
	}
	return HTMLElement.extend(element);
};
//Get DOM elements based on the given CSS Selector - V 1.00.A Beta
//http://www.openjs.com/scripts/dom/css_selector/
/**
 * 
 * @param {String} all_selectors
 * @param {HTMLElement} parent
 * @return {Array}
 */
Next.getElementsBySelector=function(all_selectors,parent){
    var selected = [];
	parent=(parent)?parent:document;
    if (!document.getElementsByTagName) {
        return selected;
    }
    all_selectors = all_selectors.replace(/\s*([^\w])\s*/g, "$1");//Remove the 'beutification' spaces
    var selectors = all_selectors.split(",");
    var getElements = function(context, tag){
        if (!tag) {
            tag = '*';
        }
        var found = [];
        for (var a = 0; a < context.length; a++) {
            var con = context[a];
            var eles;
            if (tag == '*') {
                eles = con.all ? con.all : con.getElementsByTagName("*");
            }
            else {
                eles = con.getElementsByTagName(tag);
            }
            for (var b = 0, leng = eles.length; b < leng; b++) {
                found.push(eles[b]);
            }
        }
        return found;
    };    
    for (var i = 0; i < selectors.length; i++) {
        selector = selectors[i];
        var context = [parent];
        var inheriters = selector.split(" ");       
        for (var j = 0; j < inheriters.length; j++) {
            element = inheriters[j];
            //This part is to make sure that it is not part of a CSS3 Selector
            var left_bracket = element.indexOf("[");
            var right_bracket = element.indexOf("]");
            var pos = element.indexOf("#");//ID
            if (pos + 1 && !(pos > left_bracket && pos < right_bracket)) {
                var parts = element.split("#");
                var tag = parts[0];
                var id = parts[1];
                var ele = parent.getElementById(id);
                if (!ele || (tag && ele.nodeName.toLowerCase() != tag)) { //Specified element not found
                    continue;
                }
                context = [ele];
                continue;
            }           
            pos = element.indexOf(".");//Class
            if (pos + 1 && !(pos > left_bracket && pos < right_bracket)) {
                parts = element.split('.');
                tag = parts[0];
                var class_name = parts[1];
                
                var found = getElements(context, tag);
                context = [];
                for (var l = 0; l < found.length; l++) {
                    fnd = found[l];
                    if (fnd.className && fnd.className.match(new RegExp('(^|\s)' + class_name + '(\s|$)'))) {
                        context.push(fnd);
                    }
                }
                continue;
            }
            if (element.indexOf('[') + 1) {
                if (element.match(/^(\w*)\[(\w+)([=~\|\^\$\*]?)=?['"]?([^\]'"]*)['"]?\]$/)) {
                    tag = RegExp.$1;
                    attr = RegExp.$2;
                    var operator = RegExp.$3;
                    var value = RegExp.$4;
                }
                found = getElements(context, tag);
                context = [];
                for (l = 0; l < found.length; l++) {
                    fnd = found[l];
                    if (operator == '=' && fnd.getAttribute(attr) != value) {
                        continue;
                    }
                    if (operator == '~' && !fnd.getAttribute(attr).match(new RegExp('(^|\\s)' + value + '(\\s|$)'))) {
                        continue;
                    }
                    if (operator == '|' && !fnd.getAttribute(attr).match(new RegExp('^' + value + '-?'))) {
                        continue;
                    }
                    if (operator == '^' && fnd.getAttribute(attr).indexOf(value) !== 0) {
                        continue;
                    }
                    if (operator == '$' && fnd.getAttribute(attr).lastIndexOf(value) != (fnd.getAttribute(attr).length - value.length)) {
                        continue;
                    }
                    if (operator == '*' && !(fnd.getAttribute(attr).indexOf(value) + 1)) {
                        continue;
                    }
                    else 
                        if (!fnd.getAttribute(attr)) {
                            continue;
                        }
                    context.push(fnd);
                }
                
                continue;
            }           
            found = getElements(context, element);
            context = found;
        }
		selected=selected.concat(context.map(HTMLElement.extend));
    }
	
    return ElementList.extend(selected);
};

Next.extendObj = function(dst, src){
    for (i in src) {
        dst[i] = src[i];
    }
    return dst;
};

Next.nlMethods=[];



/**
 * @alias {Next.getElementsById}
 */
var $=Next.byId;
/**
 * @alias {Next.getElementsBySelector}
 */
var $$=Next.getElementsBySelector;
/**
 * Transforms any iterable to an array
 * @param {Object} it
 * @return {Array}
 */
function $A(it) {
  	if (!it){return [];}
	var result=[];
	for (var i=0;i<it.length;i++){
		result.push(it[i]);
	}
	return result;
}//-END-Next.js-
//-START-Protos.js-
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
 * Escape the string to be used on RegExp
 * @return {String}
 */
String.prototype.escape = function(){
    if (!arguments.callee.sRE) {
        var specials = ['/', '.', '*', '+', '?', '|', '(', ')', '[', ']', '{', '}', '\\'];
        arguments.callee.sRE = new RegExp('(\\' + specials.join('|\\') + ')', 'g');
    }
    return this.replace(arguments.callee.sRE, '\\$1');
};
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
//-END-Protos.js-
//-START-Color.js-
/**
 * @author Porfirio
 */

/**
 * Create a color
 * Usage:<br>
 * new Next.Color(r,g,b);<br>
 * new Next.Color([r,g,b]);<br>
 * new Next.Color({R:r,G:g,B:b});<br>
 * new Next.Color("RGB(r,g,b)");<br>
 * new Next.Color("#FFFFFF");<br>
 * @param {Object} arg0
 * @param {Object} arg1
 * @param {Object} arg2
 */
Next.Color=function(arg0,arg1,arg2){
	if (Number.is(arg0) && arg0>0 && arg0<255 && 
		Number.is(arg1) && arg1>0 && arg1<255 &&
		Number.is(arg2) && arg2>0 && arg2<255){		
		this.fromRGB(arg0,arg1,arg2);
		this.invalid=false;
	}else if (arg0 instanceof Next.Color){
		this.R=arg0.R;
		this.G=arg0.G;
		this.B=arg0.B;
		this.invalid=false;
	}else if (String.is(arg0)){
		if (arg0.match(/^#\w\w\w\w\w\w$/)) {
			this.fromHex(arg0);
		} else if ((mm=arg0.match(Next.Color.RGBMatchRE))!==null) {
			this.fromRGB(mm[1].toInt(),mm[2].toInt(),mm[3].toInt());
		} else if (String.is(Next.Color[arg0])){
			arg0=new Next.Color(Next.Color[arg0]);
			this.R=arg0.R;
			this.G=arg0.G;
			this.B=arg0.B;
			this.invalid=false;
		}
	}else if (Array.is(arg0)){
		this.fromArray(arg0);
	}else if (Object.is(arg0)){
		if (Object.is(arg0) &&
		   (Number.is(arg0.r) || Number.is(arg0.R)) &&
		   (Number.is(arg0.g) || Number.is(arg0.G)) &&
		   (Number.is(arg0.b) || Number.is(arg0.B))){
			this.fromObject(arg0);
		}		
	}
};
Next.Color.RGBMatchRE=/^RGB\(\s*(\d\d?\d?)\s*,\s*(\d\d?\d?)\s*,\s*(\d\d?\d?)\s*\)$/i;
/**
 * Check if rgb params specified are numbers and bwtwen 0 - 255
 * @param {Number} r
 * @param {Number} g
 * @param {Number} b
 * @return {Boolean}
 */
Next.Color.isRGBValid=function(r,g,b){
	return (Number.is(r) && r>=0 && r<=255) && (Number.is(g) && g>=0 && g<=255) && (Number.is(b) && b>=0 && b<=255);
};

/**
 * Check if the specified color is valid @link {Next.Color} and return it, or null if its not valid 
 * @see Next#Color
 * @param {Object} c
 * @return {Next.Color}
 */
Next.Color.check=function(c){
	if (!(c instanceof Next.Color)){
		c=new Next.Color(c);
	}
	return (c.invalid)?null:c;
};
Next.Color.prototype.invalid=true;
Next.Color.prototype.cssRGB="";
Next.Color.prototype.cssHex="";
Next.Color.prototype.R=0;
Next.Color.prototype.G=0;
Next.Color.prototype.B=0;
/**
 * Recreates the Color object using new r,g,b values
 * @param {Number} r
 * @param {Number} g
 * @param {Number} b
 * @return {Next.Color}
 */
Next.Color.prototype.fromRGB=function(r,g,b){
	if (Next.Color.isRGBValid(r,g,b)){
		this.R=r;
		this.G=g;
		this.B=b;
		this.invalid=false;		
	}
	return this;
};
/**
 * Recreates the Color object using the values on one array [r,g,b]
 * @param {Array} arr
 * @return {Next.Color}
 */
Next.Color.prototype.fromArray=function(arr){
	if (Array.is(arr) && arr.length==3 && Next.Color.isRGBValid(arr[0],arr[1],arr[2])){
		this.R=arr[0];
		this.G=arr[1];
		this.B=arr[2];
		this.invalid=false;
	}	
	return this;
};
/**
 * Recreates the Color object withthe values of an object with {R:r,G:g,B:b}
 * @param {Object} obj
 * @return {Next.Color}
 */
Next.Color.prototype.fromObject=function(obj){
	if (Object.is(obj) && (Next.Color.isRGBValid(obj.r, obj.g, obj.b) || Next.Color.isRGBValid(obj.R, obj.G, obj.B))){
		this.R=obj.r || obj.R;
		this.G=obj.g || obj.G;
		this.B=obj.b || obj.B;
		this.invalid=false;
	}	
	return this;
};
Next.Color.prototype._GiveDec=function(Hex){
	if(Hex == "A")     {return 10;}
	else if(Hex == "B"){return 11;}
	else if(Hex == "C"){return 12;}
	else if(Hex == "D"){return 13;}
	else if(Hex == "E"){return 14;}
	else if(Hex == "F"){return 15;}
	else               {return Hex*1;}
};
Next.Color.prototype._GiveHex=function(Dec){
	if(Dec == 10)	  {return "A";}
	else if(Dec == 11){return "B";}
	else if(Dec == 12){return "C";}
	else if(Dec == 13){return "D";}
	else if(Dec == 14){return "E";}
	else if(Dec == 15){return "F";}
	else              {return "" + Dec;}
};
/**
 * Recreates the Color object using a hex value
 * @param {Object} hex
 * @return {Next.Color}
 */
Next.Color.prototype.fromHex=function(hex){
	if (String.is(hex) && hex.startsWith("#")){
		hex=hex.replace(/#/,"").toUpperCase();
		this.R = (this._GiveDec(hex.substring(0, 1)) * 16) + this._GiveDec(hex.substring(1, 2));
		this.G = (this._GiveDec(hex.substring(2, 3)) * 16) + this._GiveDec(hex.substring(3, 4));
		this.B = (this._GiveDec(hex.substring(4, 5)) * 16) + this._GiveDec(hex.substring(5, 6));
		this.invalid=false;
	}
	return this;
};

/**
 * Returns the Hex value of the color
 * @return {String}
 */
Next.Color.prototype.toHex=function(){
	return "#" + this._GiveHex(Math.floor(this.R / 16)) +
				 this._GiveHex(this.R % 16) +
				 this._GiveHex(Math.floor(this.G / 16)) +
				 this._GiveHex(this.G % 16) + 
				 this._GiveHex(Math.floor(this.B / 16)) + 
				 this._GiveHex(this.B % 16);
};
/**
 * Returns an Array with the [r,g,b] values
 * @return {Array}
 */
Next.Color.prototype.toArray=function(){
	return [this.R,this.G,this.B];
};
/**
 * Returns an object on form of {R:r,G:g,B:b}
 * @return {Object}
 */
Next.Color.prototype.toObject=function(){
	return {R: this.R,G: this.G,B: this.B};
};
/**
 * Returns a String on form of RGB(r,g,b)
 * @return {Object}
 */
Next.Color.prototype.toRGB=function(){
	return "RGB("+this.R+","+this.G+","+this.B+")";
};
/**
 * String of the color as hex
 * @alias {Next.Color.prototype.toHex}
 * @return {String}
 */
Next.Color.prototype.toString=function(){
	return this.toHex();
};
Next.Color.AliceBlue="#F0F8FF";Next.Color.AntiqueWhite="#FAEBD7 ";Next.Color.Aqua="#00FFFF";Next.Color.Aquamarine="#7FFFD4";Next.Color.Azure="#F0FFFF";Next.Color.Beige="#F5F5DC";Next.Color.Bisque="#FFE4C4";Next.Color.Black="#000000";Next.Color.BlanchedAlmond="#FFEBCD";Next.Color.Blue="#0000FF";Next.Color.BlueViolet="#8A2BE2";Next.Color.Brown="#A52A2A";Next.Color.BurlyWood="#DEB887";Next.Color.CadetBlue="#5F9EA0";Next.Color.Chartreuse="#7FFF00";Next.Color.Chocolate="#D2691E";Next.Color.Coral="#FF7F50";Next.Color.CornflowerBlue="#6495ED";Next.Color.Cornsilk="#FFF8DC";Next.Color.Crimson="#DC143C";Next.Color.Cyan="#00FFFF";Next.Color.DarkBlue="#00008B";Next.Color.DarkCyan="#008B8B";Next.Color.DarkGoldenRod="#B8860B";Next.Color.DarkGray="#A9A9A9";Next.Color.DarkGrey="#A9A9A9";Next.Color.DarkGreen="#006400";Next.Color.DarkKhaki="#BDB76B";Next.Color.DarkMagenta="#8B008B";Next.Color.DarkOliveGreen="#556B2F";Next.Color.Darkorange="#FF8C00";Next.Color.DarkOrchid="#9932CC";Next.Color.DarkRed="#8B0000";Next.Color.DarkSalmon="#E9967A";Next.Color.DarkSeaGreen="#8FBC8F";Next.Color.DarkSlateBlue="#483D8B";Next.Color.DarkSlateGray="#2F4F4F";Next.Color.DarkSlateGrey="#2F4F4F";Next.Color.DarkTurquoise="#00CED1";Next.Color.DarkViolet="#9400D3";Next.Color.DeepPink="#FF1493";Next.Color.DeepSkyBlue="#00BFFF";Next.Color.DimGray="#696969";Next.Color.DimGrey="#696969";Next.Color.DodgerBlue="#1E90FF";Next.Color.FireBrick="#B22222";Next.Color.FloralWhite="#FFFAF0";Next.Color.ForestGreen="#228B22";Next.Color.Fuchsia="#FF00FF";Next.Color.Gainsboro="#DCDCDC";Next.Color.GhostWhite="#F8F8FF";Next.Color.Gold="#FFD700";Next.Color.GoldenRod="#DAA520";Next.Color.Gray="#808080";Next.Color.Grey="#808080";Next.Color.Green="#008000";Next.Color.GreenYellow="#ADFF2F";Next.Color.HoneyDew="#F0FFF0";Next.Color.HotPink="#FF69B4";Next.Color.IndianRed="#CD5C5C";Next.Color.Indigo="#4B0082";Next.Color.Ivory="#FFFFF0";Next.Color.Khaki="#F0E68C";Next.Color.Lavender="#E6E6FA";Next.Color.LavenderBlush="#FFF0F5";Next.Color.LawnGreen="#7CFC00";Next.Color.LemonChiffon="#FFFACD";Next.Color.LightBlue="#ADD8E6";Next.Color.LightCoral="#F08080";Next.Color.LightCyan="#E0FFFF";Next.Color.LightGoldenRodYellow="#FAFAD2";Next.Color.LightGray="#D3D3D3";Next.Color.LightGrey="#D3D3D3";Next.Color.LightGreen="#90EE90";Next.Color.LightPink="#FFB6C1";Next.Color.LightSalmon="#FFA07A";Next.Color.LightSeaGreen="#20B2AA";Next.Color.LightSkyBlue="#87CEFA";Next.Color.LightSlateGray="#778899";Next.Color.LightSlateGrey="#778899";Next.Color.LightSteelBlue="#B0C4DE";Next.Color.LightYellow="#FFFFE0";Next.Color.Lime="#00FF00";Next.Color.LimeGreen="#32CD32";Next.Color.Linen="#FAF0E6";Next.Color.Magenta="#FF00FF";Next.Color.Maroon="#800000";Next.Color.MediumAquaMarine="#66CDAA";Next.Color.MediumBlue="#0000CD";Next.Color.MediumOrchid="#BA55D3";Next.Color.MediumPurple="#9370D8";Next.Color.MediumSeaGreen="#3CB371";Next.Color.MediumSlateBlue="#7B68EE";Next.Color.MediumSpringGreen="#00FA9A";Next.Color.MediumTurquoise="#48D1CC";Next.Color.MediumVioletRed="#C71585";Next.Color.MidnightBlue="#191970";Next.Color.MintCream="#F5FFFA";Next.Color.MistyRose="#FFE4E1";Next.Color.Moccasin="#FFE4B5";Next.Color.NavajoWhite="#FFDEAD";Next.Color.Navy="#000080";Next.Color.OldLace="#FDF5E6";Next.Color.Olive="#808000";Next.Color.OliveDrab="#6B8E23";Next.Color.Orange="#FFA500";Next.Color.OrangeRed="#FF4500";Next.Color.Orchid="#DA70D6";Next.Color.PaleGoldenRod="#EEE8AA";Next.Color.PaleGreen="#98FB98";Next.Color.PaleTurquoise="#AFEEEE";Next.Color.PaleVioletRed="#D87093";Next.Color.PapayaWhip="#FFEFD5";Next.Color.PeachPuff="#FFDAB9";Next.Color.Peru="#CD853F";Next.Color.Pink="#FFC0CB";Next.Color.Plum="#DDA0DD";Next.Color.PowderBlue="#B0E0E6";Next.Color.Purple="#800080";Next.Color.Red="#FF0000";Next.Color.RosyBrown="#BC8F8F";Next.Color.RoyalBlue="#4169E1";Next.Color.SaddleBrown="#8B4513";Next.Color.Salmon="#FA8072";Next.Color.SandyBrown="#F4A460";Next.Color.SeaGreen="#2E8B57";Next.Color.SeaShell="#FFF5EE";Next.Color.Sienna="#A0522D";Next.Color.Silver="#C0C0C0";Next.Color.SkyBlue="#87CEEB";Next.Color.SlateBlue="#6A5ACD";Next.Color.SlateGray="#708090";Next.Color.SlateGrey="#708090";Next.Color.Snow="#FFFAFA";Next.Color.SpringGreen="#00FF7F";Next.Color.SteelBlue="#4682B4";Next.Color.Tan="#D2B48C";Next.Color.Teal="#008080";Next.Color.Thistle="#D8BFD8";Next.Color.Tomato="#FF6347";Next.Color.Turquoise="#40E0D0";Next.Color.Violet="#EE82EE";Next.Color.Wheat="#F5DEB3";Next.Color.White="#FFFFFF";Next.Color.WhiteSmoke="#F5F5F5";Next.Color.Yellow="#FFFF00";Next.Color.YellowGreen="#9ACD32";
//-END-Color.js-
//-START-Thread.js-
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
};//-END-Thread.js-
//-START-Enumerable.js-
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
//-END-Enumerable.js-
//-START-Eventable.js-
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
//-END-Eventable.js-
//-START-Element.js-
/**
 * @author Porfirio
 */
//Check if we have HTMLElement

Next.browserExtensions=true; 
if (!window.HTMLElement ){
    window.HTMLElement = function(){};//Empty function
    Next.browserExtensions=false; 
}
/**
 * This array contain all properies to be applied to elements
 * @type {Array}
 */
HTMLElement.props=[];
/**
 * 
 * @param {HTMLElement} element
 * @return {HTMLElement}
 */
HTMLElement.extend=function(element){
	if (element && !element.__extended){	
		if (!Next.browserExtensions){
          for (var i in HTMLElement.prototype){
              element[i]=HTMLElement.prototype[i];  
           }
		}	
		HTMLElement.props.forEach(function(prop){
			if (Object.is(prop)) {
				if (!prop.name) {
					//throw new Error("You must specify a name");
					return;//ignore
				}
				if (!Function.is(prop.type)) {
					prop.type = Next.Number;
				}
				this[prop.name] = prop.type(this, prop.getter, prop.setter);
			}
		}, element);	
	}    	
	return element;
};
HTMLElement.prototype._extended=true; 
HTMLElement.prototype.isElement=true;

/**
 * Get child elements by selector text 
 * @param {Object} selector
 * @return {Array}
 */
HTMLElement.prototype.getBySelector=function(selector){
	return Next.getElementsBySelector(selector,this);
};
/**
 * Check if the element is visible
 * @return {Boolean}
 */
HTMLElement.prototype.visible=function(){
	return this.style.display!="none" && this.style.display!==null;
};
/**
 * Hide the element
 * @return {HTMLElement}
 */
HTMLElement.prototype.hide=function(){
	this.style.display="none";
	return this;
};
Next.nlMethods.push("hide");
/**
 * Show the element
 * @return {HTMLElement}
 */
HTMLElement.prototype.show=function(){
	this.style.display="";
	return this;
};
Next.nlMethods.push("show");
/**
 * Toggle visible or hidden on element 
 * @return {HTMLElement}
 */
HTMLElement.prototype.toggle=function(){
	this[this.visible()?"hide":"show"]();
	return this;
};
Next.nlMethods.push("toggle");
/**
 * Remove the element itself
 * @return {HTMLElement}
 */
HTMLElement.prototype.remove=function(){
    this.parentNode.removeChild(this);
	return this;
};
Next.nlMethods.push("remove");

HTMLElement.prototype.getText=function(){
	return (this.innerHTML)?this.innerHTML.strip():this.value;
};
HTMLElement.prototype.setText=function(text){
	if (this.value===undefined){
		this.innerHTML=text;
	}else{
		this.value=text;
	}
};
/**
 * Get the dimensions of the element as a object width,height
 */
HTMLElement.prototype.getDimensions = function(){
    var width=this.getStyle("width");
	var height=this.getStyle("height");
	if (this.visible()) {
        return {
            width: this.offsetWidth,
            height: this.offsetHeight
        };
    }
    var _orig = {
        visibility: this.style.visibility,
        display: this.style.display
    };
    
    this.style.visibility = 'hidden';
    this.style.display = 'block';
    
    var result = {
        width: this.offsetWidth,
        height: this.offsetHeight
    };
    
    this.style.display = _orig.display;
    this.style.visibility = _orig.visibility;
    return result;
};
/**
 * Get the position of the element as a object x,y
 */
HTMLElement.prototype.getPosition = function(){
	var visible=this.visible();
	if (!visible){
	    var _orig = {
	        visibility: this.style.visibility,
	        display: this.style.display
	    };
	    
	    this.style.visibility = 'hidden';
	    this.style.display = 'block';		
	}
    var obj = this;
    var curleft = 0;
    var curtop = 0;
    if (obj.offsetParent) {
        curleft = obj.offsetLeft;
        curtop = obj.offsetTop;
        while ((obj = obj.offsetParent)) {
            curleft += obj.offsetLeft;
            curtop += obj.offsetTop;
        }
    }
	if (!visible){
	    this.style.display = _orig.display;
	    this.style.visibility = _orig.visibility;		
	}
    return {
        x: curleft,
        y: curtop
    };
};
/**
 * Get the bounds of the element as a object x,y,width,height
 */
HTMLElement.prototype.getBounds=function(){
	return Next.extendObj(this.getPosition(),this.getDimensions());
};

HTMLElement.prototype.getWidth=function(){
    var width=this.getStyle("width");
	if (width!="auto"){
		return width.toFloat();
	}
	if (this.visible()) {
        return this.offsetWidth;
    }
    var _orig = {
        visibility: this.style.visibility,
        display: this.style.display
    };
    this.style.visibility = 'hidden';
    this.style.display = 'block';
    var result = this.offsetWidth;
    this.style.display = _orig.display;
    this.style.visibility = _orig.visibility;
    return result;
};
HTMLElement.prototype.getHeight=function(){
    var height=this.getStyle("height");
	if (height!="auto"){
		return height.toFloat();
	}
	if (this.visible()) {
        return this.offsetHeight;
    }
    var _orig = {
        visibility: this.style.visibility,
        display: this.style.display
    };
    this.style.visibility = 'hidden';
    this.style.display = 'block';
    var result = this.offsetHeight;
    this.style.display = _orig.display;
    this.style.visibility = _orig.visibility;
    return result;
};
/**
 * Get Element Opacity
 * @return {Number}
 */
HTMLElement.prototype.getOpacity=function(){
	return this.getStyle("opacity");
};
/**
 * Set's the opacity of the element
 * @param {Object} opacity
 * @return {HTMLElement}
 */
HTMLElement.prototype.setOpacity=function(opacity){
	opacity=(opacity<0)?0:((opacity>1)?1:opacity);
	this.style.opacity=opacity;
	if (this.filters){		
		if (!this.currentStyle.hasLayout) {
			this.style.zoom = 1;
		}
		try{
			this.filters.item("Alpha").opacity=opacity*100;		
		}catch(e){
			this.style.filter="Alpha(opacity= "+opacity*100+" );";
		}		
	}
};
Next.nlMethods.push("setOpacity");
/**
 * Get the value of the style
 * Based on http://berniecode.com/writing/animator.html
 * @param {String} style
 */
HTMLElement.prototype.getStyle=function(property, def){
	def=(def===undefined)?"":def;
	if (property=="float" || property=="cssFloat" || property=="propertyFloat"){
		property=(this.style.styleFloat)?"styleFloat":"cssFloat";
	}
	if (property=="opacity" && this.filters){
		try{
			return this.filters.item("Alpha").opacity/100;
		}catch(e){
			return 1;
		}		
	}
	var style;
	if(document.defaultView && document.defaultView.getComputedStyle){
		style = document.defaultView.getComputedStyle(this, "").getPropertyValue(property);
		if (style) {
			return style;
		}
	}
	property = property.camelize();
	if(this.currentStyle){
		style = this.currentStyle[property];
	}
	return style || this.style[property];
};  
/**
 * Set the style of the element
 * @param {String|Object} style
 * @return {HTMLElement}
 */
HTMLElement.prototype.setStyle=function(style){
	if (String.is(style)){
		this.style.cssText+=";"+style;
		if (style.contains("opacity:")){
			this.setOpacity(style.match(/opacity:\s*(\d?\.?\d*)/)[1]);
		}
	}else if (Object.is(style)){
		for (i in style){
			if (i == "float" || i == "cssFloat" || i == "styleFloat") {
				this.style.cssFloat=style[i];
				this.style.styleFloat=style[i];
			}else if (i=="opacity"){
				this.setOpacity(style[i]);
			}else{
				this.style[i]=style[i];
			}
		}
	}
	return this;
};
Next.nlMethods.push("setStyle");

HTMLElement.prototype.animate=function(){
	
};


//ElementList
ElementList=function(){};

ElementList.extend=function(list){
	Next.extendObj(list,ElementList.prototype);
	Next.nlMethods.forEach(function(value,key,enumerable){
		list[value]=function(){
			for (var i=0;i<list.length;i++){
				this[i][value].apply(this[i],arguments);
			}
		};
	});	   	
	return list;	
};
ElementList.prototype.makeLol=function(){
	this.forEach(function(el){
		el.innerHTML="lol";
	});
};
//-END-Element.js-
//-START-Animation.js-
/**
 * @author Porfirio
 * @license GPL
 * @namespace Next
 */

/**
 *
 * @param {Prop} thisObject
 * @param {Object} options
 * @constructor
 * @type {Next.Animation}
 * @alias {Next.Animation}
 */
Next.Animation = function(options){
    var self = this;
    if (!Object.is(options)) {
        throw Error("The first parameter of animate function must be an object");
    }
	this.duration=Number.is(options.duration)?options.duration:1000;
	this.interval=Number.is(options.interval)?options.interval:20;
	this.delay=Number.is(options.delay)?options.delay:0;
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

/**
 * Private function
 */
Next.Animation.prototype.onTimerEvent = function(){
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
};
Next.Animation.prototype.propage = function(){
    var v = this.transition(this.state);
    this.onStep.apply(this, [v]);
};
/**
 * Seek from one value to other between 0 and 1, optional specify a delay for seek later
 * @param {Number} from
 * @param {Number} to
 * @param {Number} [delay]
 */
Next.Animation.prototype.seekFromTo = function(from, to, delay){
    if (Number.is(delay) && delay > 0) {
        this.seekFromTo.bindLater(delay, this, from, to);
        return this;
    }
    if (this.toggleIn) {
        if (this.isTogglingIn) {
            return;
        }
        this.isTogglingIn = true;
    }
    this.isAnimating = true;
    var _this = this;
    this.target = Math.max(0, Math.min(1, to));
    this.state = Math.max(0, Math.min(1, from));
    this.lastTime = new Date().getTime();
    if (!this.intervalId) {
        this.intervalId = window.setInterval(function(){
            _this.onTimerEvent();
        }, this.interval);
    }
    return this;//chain....
};

Next.Animation.prototype.seekTo = function(to, delay){
    return this.seekFromTo(this.state, to, delay);
};
Next.Animation.prototype.jumpTo = function(to, delay){
    if (Number.is(delay) && delay > 0) {
        this.jumpTo.bindLater(delay, this, to);
        return this;
    }
    this.target = this.state = Math.max(0, Math.min(1, to));
    this.propagate();
    return this;
};
Next.Animation.prototype.toggle = function(delay){
    return this.seekTo(1 - this.target, delay);
};
Next.Animation.prototype.play = function(delay){
    return this.seekFromTo(0, 1, delay);
};
Next.Animation.prototype.reverse = function(delay){
    return this.seekFromTo(1, 0, delay);
};
Next.Animation.prototype.stop = function(delay){
    if (Number.is(delay) && delay > 0) {
        this.stop.bindLater(delay, this);
        return this;
    }
    if (this.intervalId) {
        window.clearInterval(this.intervalId);
        this.intervalId = null;
        this.isAnimating = false;
    }
    return this;
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
};//-END-Animation.js-
//-START-Property.js-
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

Next.AnimatedProperty=function(thisObject, getter, setter){
	Next.Property.apply(this,arguments);
};
Next.AnimatedProperty.Extends(Next.Property);
Next.AnimatedProperty.prototype.animator = null;
/**
 * Create a animator and return it
 * @param {Object} options The options for animate
 * @return {Next.Animation}
 */
Next.AnimatedProperty.prototype.getAnimation = function(options){
    if (this.animator) {
        this.animator.stop();
    }
	
	if (Object.isNull(options.to)){
		throw Error("Please specify where 'to' go!");
	}else{
		this.to=options.to;
		if (this.type.is(this.to)){
			this.to=this.to.get();
		}
	}	
	if (Object.isNull(options.from)){
		this.from=this.get();
	}else{
		this.from=options.from;
		if (this.type.is(this.from)){
			this.from=this.from.get();
		}
	}	
	console.log("From: "+this.from+" - To: "+this.to);
	if (options.onStep){
		options.userOnStep=options.onStep;
	}	
	var self=this;
	options.onStep=function(v){
		var V=self.onStep(v);
		self.set(V,v);
		if(options.userOnStep){
			options.userOnStep.apply(self,[V,v]);
		}
		
	};	
    this.animator = new Next.Animation( options);
    return this.animator;
};
Next.AnimatedProperty.prototype.animate=function(options){
	return this.getAnimation(options).play();
};
Next.AnimatedProperty.prototype.animateTo = function(to, options ){
	options=(options || {});
	options.to=to;
	return this.animate(options);
};
Next.AnimatedProperty.prototype.animateFromTo = function(from, to, options ){
	options=(options || {});
	options.from=from;
	options.to=to;
	return this.animate(options);
};
Next.Property.prototype.onStep=function(v){
	var V;
	if (this.to>this.from){
		V=(v*(this.to-this.from))+this.from;
	}else{
		v=1-v;
		V=(v*(this.from-this.to))+this.to;
	}		
	return V;
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
Next.Float.Extends(Next.AnimatedProperty);
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









//-END-Property.js-
