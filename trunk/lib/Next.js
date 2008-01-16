/**
 * @author Porfirio
 */

var Next=function(){};


/**
 * Get element by id
 * @param {Object} element
 * @param {HTMLElement} [parent]
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
}