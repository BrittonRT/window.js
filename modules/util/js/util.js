// Abstraction v.1.0 (c) 2008-2011 Britton Reeder-Thompson //
//                  UI Object Definition                   //

	// Global shortcuts
var $window = $(window),
	$document = $(document),
Util = new (function(callback) {
	var Util = this;
	Util.isElement = function(obj) {
		try {
			return obj instanceof HTMLElement;
		} catch(e) {
			return (typeof obj==="object") && (obj.nodeType===1) && (typeof obj.style === "object") && (typeof obj.ownerDocument ==="object");
		}
	}
	Util.getStyle = function(el, styleProp) {
		if (el.currentStyle)
			var y = el.currentStyle[styleProp];
		else if (window.getComputedStyle)
			var y = document.defaultView.getComputedStyle(el, null).getPropertyValue(styleProp);
		return y;
	}
	Util.event = function(e) {
		e = window.event || e;
		e.target = e.target || e.srcElement;
		e.offsetX = e.offsetX || e.layerX;
		e.offsetY = e.offsetY || e.layerY;
		e.relatedTarget = e.relatedTarget ||
			e.type == 'mouseover' ? e.fromElement : e.toElement;
		if (target.nodeType === 3)
			target = target.parentNode; //Safari bug
		if (!e.which && ((e.charCode || e.charCode === 0) ? e.charCode: e.keyCode))
			e.which = e.charCode || e.keyCode;
		return e;
	}
	Util.alert = function(msg) {
		var s = '';
		if (typeof msg == 'object' && !Util.isElement(msg))
			for (var p in msg)
				s += p+': '+msg[p]+'\n';
		else
			s = msg;
		alert(s);
	}
});