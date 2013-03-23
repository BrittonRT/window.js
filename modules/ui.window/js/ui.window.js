// Abstraction v.1.0 (c) 2008-2011 Britton Reeder-Thompson //
//                  UI Object Definition                   //

// Global shortcuts
var $window = $(window),
	$document = $(document);
UI.activeWindow;
UI.getWindow = function(element) {
	var l = UI.windows.length;
	if (l)
		while (--l)
			if (UI.windows[l].target === element)
				return UI.windows[l];
	return false;
};
UI.globalZ = 1000;  // this is the current focus level z-index value
UI.leftbar = [];
UI.maximizedWindows = [];
UI.minimizedWindows = []; // NOT ADDED YET
UI.rightbar = [];
UI.windows = [];
if (Hashtable)
	UI.windowsHash = new Hashtable();
$.extend(UI.classes, {
	resize: {
		s:  UI.prefix+'-window-resize-s',
		n:  UI.prefix+'-window-resize-n',
		e:  UI.prefix+'-window-resize-e',
		w:  UI.prefix+'-window-resize-w',
		se: UI.prefix+'-window-resize-se',
		sw: UI.prefix+'-window-resize-sw',
		ne: UI.prefix+'-window-resize-ne',
		nw: UI.prefix+'-window-resize-nw',
		handle: UI.prefix+'-window-resize-handle'
	},
	window: {
		active: UI.prefix+'-window-active',
		close: UI.prefix+'-close-window',
		handle: UI.prefix+"-window-handle",
		handleExtend: UI.prefix+"-window-handle-extend",
		maximize: UI.prefix+'-maximize-window',
		maximized: UI.prefix+'-window-maximized',
		minimize: UI.prefix+'-minimize-window',
		minimized: UI.prefix+'-window-minimized',
		target: UI.prefix+"-window",
		title: UI.prefix+"-window-title"
	}
});
UI.Window = function(options) {
	var win = this,
		defaults = {
			title: 'New window',
			left: 0,
			top: 0,
			width: 500,
			height: 400,
			attachedWidth: 300
		};
	win.window = true;
	win.activeOptions = {};
	win.draggableOptions = {};
	win.resizableOptions = {};
	win.droppableOptions = {};
	win.mouse = [];
	win.getMousePosition;
	win.icon;
	win.handle;				  // The window's draggable handle.
	win.isDragging = false;   // Boolean which tells us if the window is being dragged
	win.isResizing = false;   // ... is being resized
	win.isMinimized = false;  // ... is minimized
	win.isMaximized = false;  // ... is maximized
	win.isAttached = false;   // ... is attached to the sidebar
	win.isClosed = true;
	win.isOpen = false;
	win.attachedTo;
	win.original = {};		  // Stores information about the selector object before it was modified into a window
	win.status = "idle";
	win.dragTimer;
	win.ready = false;
	win.dockable = true;
	win.border = {
		left:   0,
		right:  0,
		top:    0,
		bottom: 0
	}
	win.margin = {
		left:   0,
		right:  0,
		top:    0,
		bottom: 0
	}
	win.padding = {
		left:   0,
		right:  0,
		top:    0,
		bottom: 0
	}
	
	UI.globalZ++;
	win
		.options((typeof options == 'object' && typeof options !== null) ? $.extend(defaults, options) : defaults)
		.focus()
		.open();
}
UI.Window.prototype.addResizeHandles = function() {
	var win = this;
	win.removeResizeHandles();
	win.$resizeHandle = $("<div/>")
		.addClass(UI.classes.resize.se+" "+UI.classes.resize.handle)
		.bind("mousedown.resize", function(e) { win.startResize.call(win, e); win.focus(); return false; })
		.appendTo(win.$);
	win.$
		.bind('mousedown.focus', function() {
			win.focus();
		})
		.find(UI.classes.resize.se)
			.mousedown( function() {
				$(this).css({
					width: '10000px',
					height: '10000px',
					bottom: '-4992px',
					right: '-4992px'
				});
			})
			.mouseup( function() {
				$(this).css({
					width: '15px',
					height: '15px',
					bottom: '0px',
					right: '0px'
				});
			})
		.end().find(UI.classes.resize.e)
			.mousedown( function() {
				$(this).css({
					width: '10000px',
					height: '10000px',
					top: '-4992px',
					right: '-4992px'
				});	
			})
			.mouseup( function() {
				$(this).css({
					width: '15px',
					height: '15px',
					top: '0px',
					right: '0px'
				});
			})
		.end().find(UI.classes.resize.s+", "+UI.classes.resize.sw)
			.mousedown( function() {
				$(this).css({
					width: '10000px',
					height: '10000px',
					bottom: '-4992px',
					left: '-4992px'
				});
			})
			.mouseup( function() {
				$(this).css({
					width: '15px',
					height: '15px',
					bottom: '0px',
					left: '0px'
				});
			});
	return win;
}
UI.Window.prototype.addShadows = function() {  //  Adds shadow images to any element
	var win = this,
		$target = win.$,
		boxRight = win.border.right,
		boxBottom = win.border.bottom,
		html = '<img class="'+UI.classes.shadow+'" src="modules/ui/images/shadow_bottom_405x9.png" width="100%" height="9" style="position: absolute; bottom: -' + (9 + boxBottom) + 'px; right: -' + boxRight + 'px;"></img><img class="'+UI.classes.shadow+'" src="modules/ui/images/shadow_right_9x405.png" height="100%" width="9" style="position: absolute; bottom: -' + boxBottom + 'px; right: -' + (9 + boxRight) + 'px;"></img><img class="'+UI.classes.shadow+'" src="modules/ui/images/shadow_corner_9x9.png" height="9" width="9" style="position: absolute; bottom: -' + (9 + boxBottom) + 'px; right: -' + (9 + boxRight) + 'px;"></img>';
	$target.find('.'+UI.classes.shadow).remove();
	$target.append(html);
	return $target.find('.'+UI.classes.shadow);
}
UI.Window.prototype.checkBounds = function(e) {
	var win = this;
	win.parentWidth = win.$parent.width();
	win.parentHeight = win.$parent.height();
	var offset = win.$parent.offset();
	win.parentLeftBound = offset.left;
	win.parentRightBound = offset.left+win.parentWidth;
	win.parentTopBound = offset.top;
	win.parentBottomBound = offset.bottom;
	win.getBoxData();
	var newLeft = win.left(),
		newRight = parseInt(newLeft)+parseInt(win.width());
	if (newLeft <= win.parentLeftBound) {
		if (!win.isAttached) {
			win.$.css({
				width: win.attachedWidth,
				height: win.parentHeight-(win.border.top+win.border.bottom)-(win.padding.top+win.padding.bottom)-(win.margin.top+win.margin.bottom)
			})
			.addClass('ui-leftbar-attached');
			win.left(win.parentLeftBound);
			win.top(win.parentTopBound);
			win.isAttached = true;
			if (win.$shadows) {
				win.$shadows.remove();
				win.$shadows = null;
			}
			UI.leftbar[UI.leftbar.length] = win;
			var l = UI.maximizedWindows.length;
			while (l--)
				UI.maximizedWindows[l].maximize(false);
		}
	} else if (newRight >= win.parentRightBound-(win.border.left+win.border.right)-(win.padding.left+win.padding.right)-(win.margin.left+win.margin.right)) {
		//if (!win.isAttached) {
			win.$.css({
				width: win.attachedWidth,
				height: win.parentHeight-(win.border.top+win.border.bottom)-(win.padding.top+win.padding.bottom)-(win.margin.top+win.margin.bottom)
			})
			.addClass('ui-rightbar-attached');
			win.left(win.parentRightBound-win.attachedWidth-(win.border.left+win.border.right)-(win.padding.left+win.padding.right)-(win.margin.left+win.margin.right));
			win.top(win.parentTopBound);
			win.isAttached = true;
			if (win.$shadows) {
				win.$shadows.remove();
				win.$shadows = null;
			}
			UI.rightbar[UI.rightbar.length] = win;
			var l = UI.maximizedWindows.length;
			while (l--)
				UI.maximizedWindows[l].maximize(false);
		//}
	} else if (win.dockable && newTop < win.parentTopBound)
		if (!win.isAttached)
			win.maximize(false);
}
UI.Window.prototype.createWindow = function(parent) {
	var win = this,
		target = document.createElement('div');
	parent = parent || document.body;
	$(parent).append(target);
	return target;
}
UI.Window.prototype.setTarget = function(target) {
	var win = this,
		position;
	win.target = target;
	win.$ = $(win.target);
	win.$parent = win.$.parent();
	win.parent = win.$parent.get(0);
	win.$.data("ui.window", win);
	if (!win.$.hasClass(UI.classes.window.target))
		win.$.addClass(UI.classes.window.target);
	win.getBoxData();
	win.$shadows = win.addShadows();  // This is an external method, so you have to pass in the selector
	win.addHandle();
	win.addResizeHandles();
	position = win.$.css('position');
	win.position('absolute');
	if (!UI.getWindow(win.target))	
		UI.windows[UI.windows.length] = win; // append it to the global windows array
	window.onresize = function() {
		win.checkBounds();
	}
}
UI.Window.prototype.options = function(options) {  // Set the options for the window
	var win = this;
	if (!options)
		return win.activeOptions;
	if (typeof options != 'object') {
		if (Util.error)
			Util.error.throw('UI.Window.options', 'Options must be a JSON object.');
		return win;
	}
	if (options.target)
		win.setTarget(options.target);
	if (!win.ready) {
		win.ready = true;
		if (!options.target)
			win.setTarget(win.createWindow(options.parent));
		win.originalStyles = win.target.styles;
	}
	if (options.title != undefined)
		win.setTitle(options.title);
	if (options.content != undefined)
		win.$.html(options.content);
	if (options.width != undefined)
		win.width(options.width);
	if (options.height != undefined)
		win.height(options.height);
	if (options.left != undefined)
		win.left(options.left);
	if (options.top != undefined)
		win.top(options.top);
	if (options.attachedWidth != undefined)
		win.attachedWidth = options.attachedWidth;
	if (options.position != win.position())
		win.position(options.position);
	if (options.taskbar != undefined)
		win.addToTaskbar(options.taskbar);
	if (options.maximized != undefined) {
		if (options.maximized)
			win.maximize(!win.ready);
		else
			win.unmaximize(!win.ready);
	}
	if (options.minimized != undefined) {
		if (options.minimized)
			win.minimize(!win.ready);
		else
			win.unminimize(!win.ready);
	}
	if (options.containment != undefined)
		win.containment = options.containment;
	$.extend(win.activeOptions, options);	// the window's active options are overidden with the passed in options
	return win;
}
UI.Window.prototype.position = function(position) {
	var win = this;
	if (position != undefined) {
		win.$.css({
			position: position
		});
		win._position = win.$.css('position');
		return win;
	} else
		return win._position;
}
UI.Window.prototype.startDrag = function(e) {
	var win = this,
		e = e || window.event,
		mouseLeft = 0,
		mouseTop = 0,
		offset;
	if (e.pageX || e.pageY) {
		mouseLeft = e.pageX;
		mouseTop = e.pageY;
		win.getMousePosition = UI.input.pageMousePosition;
	} else if (e.clientX || e.clientY) {
		mouseLeft = e.clientX + document.body.scrollLeft + document.documentElement.scrollLeft;
		mouseTop = e.clientY + document.body.scrollTop + document.documentElement.scrollTop;
		win.getMousePosition = UI.input.clientMousePosition;
	}
	offset = win.$parent.offset();
	win.parentLeftBound = offset.left;
	win.parentRightBound = offset.left+win.parentWidth;
	win.parentTopBound = offset.top;
	win.parentBottomBound = offset.bottom;
	if (win.isMaximized)
		win.top(win.parentTopBound);
	win.mouse[0] = mouseLeft-win.left();
	win.mouse[1] = mouseTop-win.top();
	win.getBoxData();
	win.disableSelection();
	win.getMousePosition(e);
	win.parentWidth = win.$parent.width();
	win.parentHeight = win.$parent.height();
	$document.bind("mousemove.handle", function(e) { win.drag.call(win, e); });
	//$window.bind("mousemove.handle", win.getMousePosition);
	//win.dragTimer = setInterval(function(e) { win.drag.call(win, e); }, 33);
	if (typeof win.activeOptions.dragstart == 'function')
		win.activeOptions.dragstart.call(win);
}
UI.Window.prototype.drag = function(e) {
	var win = this,
		e = e || window.event,
		newLeft, newTop;
	win.getMousePosition(e);
	//$(document.body).append(mouse[0]+" "+mouse[1]+" ||| ");
	newLeft = UI.input.mouse[0]-win.mouse[0];
	newRight = parseInt(newLeft)+parseInt(win._width);
	newTop = UI.input.mouse[1]-win.mouse[1];
	if (win.dockable && newLeft <= win.parentLeftBound) {
		if (!win.isAttached) {
			win.$.css({
				width: win.attachedWidth,
				height: win.parentHeight-(win.border.top+win.border.bottom)-(win.padding.top+win.padding.bottom)-(win.margin.top+win.margin.bottom)
			})
			.addClass('ui-leftbar-attached');
			win.left(win.parentLeftBound);
			win.top(win.parentTopBound);
			win.isAttached = true;
			win.$shadows.remove();
			win.$shadows = null;
			UI.leftbar[UI.leftbar.length] = win;
		}
	} else if (win.dockable && newRight >= win.parentRightBound-(win.border.left+win.border.right)-(win.padding.left+win.padding.right)-(win.margin.left+win.margin.right)) {
		if (!win.isAttached) {
			win.$.css({
				width: win.attachedWidth,
				height: win.parentHeight-(win.border.top+win.border.bottom)-(win.padding.top+win.padding.bottom)-(win.margin.top+win.margin.bottom)
			})
			.addClass('ui-rightbar-attached');
			win.left(win.parentRightBound-win.attachedWidth-(win.border.left+win.border.right)-(win.padding.left+win.padding.right)-(win.margin.left+win.margin.right));
			win.top(win.parentTopBound);
			win.isAttached = true;
			win.$shadows.remove();
			win.$shadows = null;
			UI.rightbar[UI.rightbar.length] = win;
		}
	} else if (win.dockable && newTop < win.parentTopBound) {
		if (!win.isAttached) {
		/*
			win.$.css({
				width: win.attachedWidth-(win.border.left+win.border.right)-(win.padding.left+win.padding.right)-(win.margin.left+win.margin.right),
				height: win.parentHeight-(win.border.top+win.border.bottom)-(win.padding.top+win.padding.bottom)-(win.margin.top+win.margin.bottom),
				top: win.leftbar
				left:
			})
			.addClass('ui-window-maximized');
			win.top(win.parentTopBound);
			win.isAttached = true;
			win.$shadows.remove();
			win.$shadows = null;
			*/
			win.maximize(false);
		}
	} else {
		if (win.isMaximized)
			win.unmaximize(false);
		if (win.isAttached) {
			win.isAttached = false;
			win.$.removeClass('ui-leftbar-attached ui-rightbar-attached');
			var l = UI.leftbar.length;
			while (l--)
				if (UI.leftbar[l] === win)
					UI.leftbar.splice(l, 1);
			var l = UI.rightbar.length;
			while (l--)
				if (UI.rightbar[l] === win)
					UI.rightbar.splice(l, 1);
			var l = UI.maximizedWindows.length;
			while (l--)
				UI.maximizedWindows[l].maximize(false);
		}
		win.left(newLeft);
		win.top(newTop);
		win.width(win._width);
		win.height(win._height);
		if (!win.$shadows)
			win.$shadows = win.addShadows();
	}
}
UI.Window.prototype.stopDrag = function(e) {
	var win = this,
		e = e || window.event;
	if (win.isAttached) {
		var l = UI.maximizedWindows.length;
		while (l--)
			UI.maximizedWindows[l].maximize(false);
	}
	win.enableSelection();
	$document.unbind("mousemove.handle");
	//clearTimeout(win.dragTimer);
	if (typeof win.activeOptions.dragstop == 'function')
		win.activeOptions.dragstop;
}
UI.Window.prototype.startResize = function(e) {
	var win = this,
		e = e || window.event,
		mouseLeft = 0,
		mouseTop = 0;
		
	if (e.pageX || e.pageY) {
		mouseLeft = e.pageX;
		mouseTop = e.pageY;
		win.getMousePosition = pageMousePosition;
	} else if (e.clientX || e.clientY) {
		mouseLeft = e.clientX + document.body.scrollLeft + document.documentElement.scrollLeft;
		mouseTop = e.clientY + document.body.scrollTop + document.documentElement.scrollTop;
		win.getMousePosition = clientMousePosition;
	}
	win.mouse[0] = mouseLeft;
	win.mouse[1] = mouseTop;
	
	//disableSelection(win);
	win.getMousePosition(e);
	$document.bind("mousemove.resize", function(e) { win.resize.call(win, e); });
	//$window.bind("mousemove.handle", win.getMousePosition);
	//win.dragTimer = setInterval(function(e) { win.drag.call(win, e); }, 33);
	if (typeof win.activeOptions.resizestart == 'function')
		win.activeOptions.resizestart.call(win);
}
UI.Window.prototype.resize = function(e) {
	var win = this,
		e = e || window.event;
	win.getMousePosition(e);
	win.width(parseInt(win.width())+(UI.input.mouse[0]-win.mouse[0]));
	win.height(parseInt(win.height())+(UI.input.mouse[1]-win.mouse[1]));
	win.mouse[0] = UI.input.mouse[0];
	win.mouse[1] = UI.input.mouse[1];
}
UI.Window.prototype.stopResize = function(e) {
	var win = this,
		e = e || window.event;
	//enableSelection(win);
	$document.unbind("mousemove.resize");
	//clearTimeout(win.dragTimer);
	if (typeof win.activeOptions.resizestop == 'function')
		win.activeOptions.resizestop.call(win);
}


UI.Window.prototype.removeResizeHandles = function() {
	this.$
		.unbind("mousedown", this.focus)
		.draggable("destroy")
		.resizable("destroy");
}

UI.Window.prototype.addHandle = function() {
	var win = this;
	win.removeHandle();
	var extend = document.createElement('div');
		extend.setAttribute("class", UI.classes.window.handleExtend);
		extend.setAttribute("style", "position: absolute; z-index: 10001;");  // this is an invisible div used for tracking the mouse smoothly during drag
	var minimize = document.createElement('span');
		minimize.setAttribute("class", UI.classes.window.minimize);
		minimize.setAttribute("style", "z-index: 10002;");  // Buttons appear above the handle-extender
		minimize.appendChild(document.createTextNode("-"));
		$(minimize)
			.bind("mousedown", function(e) {
				e = window.event || e;    // window.event is for IE
				if (e.stopPropagation)
					e.stopPropagation();  // Standards complient browsers
				else
					e.cancelBubble=true;  // IE
			})
			.bind("click", function() { win.minToggle(); });
	var maximize = document.createElement('span');
		maximize.setAttribute("class", UI.classes.window.maximize);
		maximize.setAttribute("style", "z-index: 10002;");  // Buttons appear above the handle-extender
		maximize.appendChild(document.createTextNode("o"));
		$(maximize)
			.bind("mousedown", function(e) {
				e = window.event || e;    // window.event is for IE
				if (e.stopPropagation)
					e.stopPropagation();  // Standards complient browsers
				else
					e.cancelBubble=true;  // IE
			})
			.bind("click", function() { win.maxToggle(); });
	var close = document.createElement('span');
		close.setAttribute("class", UI.classes.window.close);
		close.setAttribute("style", "z-index: 10002;");
		close.appendChild(document.createTextNode("x"));
		$(close)
			.bind("mousedown", function(e) {
				e = window.event || e;    // window.event is for IE
				if (e.stopPropagation)
					e.stopPropagation();  // Standards complient browsers
				else
					e.cancelBubble=true;  // IE
			})
			.bind("click", function() { win.close(); });
	win.title = document.createElement('span');
	win.title.setAttribute("class", UI.classes.window.title);
	win.$title = $(win.title);
	win.handle = document.createElement('div');
	win.$handle = $(win.handle);
	win.handle.setAttribute("class", UI.classes.window.handle);
	win.handle.setAttribute("style", "z-index: 10001;");  // high z-index to make sure the handle is always on top of the window's content
	win.handle.appendChild(win.title);
	win.handle.appendChild(extend);
	if (win.activeOptions.menu != false && win.activeOptions.menu != undefined) {		// Display 'menu' button only if ...
		win.menu = win.activeOptions['menu'];
		win.$.append(win.menu.fragment);
		win.$menu = win.$.find(".ui-menu").last();
		var menu = document.createElement('span');
			menu.setAttribute("class", "open-menu");
			menu.setAttribute("style", "z-index: 10002;");  // Buttons appear above the handle-extender
			menu.appendChild(document.createTextNode("O"));
			$(menu)
				.bind("mousedown", function(e) {
					e = window.event || e;    // window.event is for IE
					if (e.stopPropagation)
						e.stopPropagation();  // Standards complient browsers
					else
						e.cancelBubble=true;  // IE
				})
				.bind("click", function() { win.activeOptions['openmenu'].call(win); });
		win.$handle.prepend(menu);
	}
	if (win.activeOptions['close'] != false)		// Display 'close' button only if the 'close' option is not set to false
		win.handle.appendChild(close);
	if (win.activeOptions['maximize'] != false)		// Display 'minimize' button only if ...
		win.handle.appendChild(maximize);
	if (win.activeOptions['minimize'] != false)		// Display 'minimize' button only if ...
		win.handle.appendChild(minimize);
	win.$handle
		.bind("mousedown.handle", function(e) {
			// Cover all the iframes on the page with div's to prevent them from stealing mouse focus
			var iframes = document.getElementsByTagName("iframe"),
				$frame,
				i = iframes.length,
				iframeCover;
			while (i--) {
				$frame = $(iframes[i]);
				iframeCover = $("<div/>")
					.css({
						position: 'absolute',
						width: $frame.width(),
						height: $frame.height(),
						left: $frame.position().left,
						top: $frame.position().top,
						marginLeft: $frame.css('margin-left'),
						marginTop: $frame.css('margin-top')
					})
					.addClass("ui-window-iframeCover")
					.appendTo($frame.parent());
			}
			win.startDrag.call(win, e);
			win.focus();
			return false;
		})
		.appendTo(win.target);  // Append to the window
}
UI.Window.prototype.removeHandle = function() {
	var win = this;
	if (win.$handle)
		win.$handle.empty().remove();
}
UI.Window.prototype.getBoxData = function() {
	var win = this;
	win.border = {
		left:   parseInt(Util.getStyle(win.target, 'border-left-width')),
		right:  parseInt(Util.getStyle(win.target, 'border-right-width')),
		top:    parseInt(Util.getStyle(win.target, 'border-top-width')),
		bottom: parseInt(Util.getStyle(win.target, 'border-bottom-width'))
	}
	win.margin = {
		left:   parseInt(Util.getStyle(win.target, 'margin-left')),
		right:  parseInt(Util.getStyle(win.target, 'margin-right')),
		top:    parseInt(Util.getStyle(win.target, 'margin-top')),
		bottom: parseInt(Util.getStyle(win.target, 'margin-bottom'))
	}
	win.padding = {
		left:   parseInt(Util.getStyle(win.target, 'padding-left')),
		right:  parseInt(Util.getStyle(win.target, 'padding-right')),
		top:    parseInt(Util.getStyle(win.target, 'padding-top')),
		bottom: parseInt(Util.getStyle(win.target, 'padding-bottom'))
	}
}
UI.Window.prototype.openMenu = function() {
	
}
UI.Window.prototype.setTitle = function(title) {
	var win = this;
	win.title = title;
	win.activeOptions.title = title;
	if (win.taskbar != undefined)
		win.taskbar.refresh();
	if (win.handle != undefined)
		win.$title.html(title);
}
UI.Window.prototype.attachTo = function(sortable, newOptions) {
	if (newOptions == undefined) newOptions = {};
	this.$.appendTo(sortable);
	this.options(newOptions);
	this.sizeSortableWindows();
}
UI.Window.prototype.minToggle = function() {
	if (this.isMinimized)
		this.unminimize();
	else
		this.minimize();
}
UI.Window.prototype.minimize = function(animate) {
	var win = this;
	if (animate == undefined || animate) {
		this.$.animate({
			width: 0,
			height: 0,
			top: (this.taskbar == undefined) ? $window.height() : $(this.taskbar.selector).offset().top,
			left: (this.taskbar == undefined) ? 0 : $(this.taskbar.selector).offset().left,
			opacity: 0
		}, 'fast', function() {
			if (typeof win.activeOptions.minimize == 'function')
				win.activeOptions.minimize.call(win);
		}).addClass(UI.classes.window.minimized);
	} else {
		this.$.css({
			width: 0,
			height: 0,
			top: (this.taskbar == undefined) ? $window.height() : $(this.taskbar.selector).offset().top,
			left: (this.taskbar == undefined) ? 0 : $(this.taskbar.selector).offset().left,
			opacity: 0
		}).addClass(UI.classes.window.minimized);
	}
	if (win.isAttached) {
		win.isAttached = false;
		var l = UI.leftbar.length;
		while (l--)
			if (UI.leftbar[l] === win)
				UI.leftbar.splice(l, 1);
		var l = UI.rightbar.length;
		while (l--)
			if (UI.rightbar[l] === win)
				UI.rightbar.splice(l, 1);
		var l = UI.maximizedWindows.length;
		while (l--)
			UI.maximizedWindows[l].maximize(true);
	}
	this.isMinimized = true;
	this.activeOptions.minimized = true;
}
UI.Window.prototype.unminimize = function(animate) {
	var win = this;
	if (win.isMaximized) {
		var l = UI.leftbar.length,
			leftbar = 0,
			rightbar = 0;
		while (l--) {
			var newWidth = UI.leftbar[l].$.outerWidth();
			if (newWidth > leftbar && UI.leftbar[l].$.css('display') != 'none')
				leftbar = newWidth;
			//alert(leftbar+" "+window.leftbar[l].file);
		}
		l = UI.rightbar.length;
		while (l--) {
			var newWidth = UI.rightbar[l].$.outerWidth();
			if (newWidth > rightbar && UI.rightbar[l].$.css('display') != 'none')
				rightbar = newWidth;
		}
		win.$.animate({
			width: win.$.parent().width()-leftbar-rightbar-2,
			height: win.$.parent().height()-51,
			top: 0,
			left: leftbar,
			opacity: 1
		}, 'fast', function() {
			win.checkBounds();
			if (typeof win.activeOptions.unminimize == 'function')
				win.activeOptions.unminimize.call(win);
		}).removeClass(UI.classes.window.minimized);
	} else
		$(win.target).animate({
			width: win._width,
			height: win._height,
			top: win._top,
			left: win._left,
			opacity: 1
		}, 'fast', function() {
			win.checkBounds();
			if (typeof win.activeOptions.unminimize == 'function')
				win.activeOptions.unminimize.call(win);
		}).removeClass(UI.classes.window.minimized);
	this.isMinimized = false;
	this.activeOptions.minimized = false;
	this.focus();
}
UI.Window.prototype.maxToggle = function() {
	if (this.isMaximized)
		this.unmaximize();
	else
		this.maximize();
}
UI.Window.prototype.maximize = function(animate) {
	var win = this;
	if (win.isAttached) {
		//$(win.selector).animate(
		//{
		//	height: 0,
		//	minHeight: 0
		//}).addClass("win-ui-minimized");    ADD BEHEVIOR FOR MINIMIZING ALL OTHER WINDOWS IN THE SIDEBAR
	} else {
		var leftbar = 0,
			rightbar = 0,
			newWidth,
			newHeight;
		if (!win.isMaximized)
			UI.maximizedWindows[UI.maximizedWindows.length] = win;
		var l = UI.leftbar.length;
		while (l--) {
			newWidth = UI.leftbar[l].$.outerWidth();
			if (newWidth > leftbar && UI.leftbar[l].$.css('display') != 'none' && UI.leftbar[l].isAttached)
				leftbar = newWidth;
		}
		var l = UI.rightbar.length;
		while (l--) {
			newWidth = UI.rightbar[l].$.outerWidth();
			if (newWidth > rightbar && UI.rightbar[l].$.css('display') != 'none' && UI.rightbar[l].isAttached)
				rightbar = newWidth;
		}
		if (animate == undefined || animate)
			win.$.animate({
				width: win.$.parent().width()-leftbar-rightbar-(win.border.left+win.border.right)-(win.padding.left+win.padding.right)-(win.margin.left+win.margin.right),
				height: win.$.parent().height()-(win.border.top+win.border.bottom)-(win.padding.top+win.padding.bottom)-(win.margin.top+win.margin.bottom),
				top: 0,
				left: leftbar
			}, 'fast', function() {
				if (typeof win.activeOptions.maximize == 'function')
					win.activeOptions.maximize.call(win);
			});
		else
			win.$.css({
				width: win.$.parent().width()-leftbar-rightbar-(win.border.left+win.border.right)-(win.padding.left+win.padding.right)-(win.margin.left+win.margin.right),
				height: win.$.parent().height()-(win.border.top+win.border.bottom)-(win.padding.top+win.padding.bottom)-(win.margin.top+win.margin.bottom),
				top: 0,
				left: leftbar
			});
		win.$.addClass(UI.classes.window.maximized);
		if (win.$shadows) {
			win.$shadows.remove();
			win.$shadows = null;
		}
		win.isMaximized = true;
		win.activeOptions.maximized = true;
	}
}
UI.Window.prototype.unmaximize = function(animate) {
	var win = this,
		l = UI.maximizedWindows.length;
	if (win.isAttached) {
		//$(win.selector).animate(
		//{
		//	height: height,
		//	minHeight: 15
		//}).removeClass("win-ui-minimized");
	} else {
		if (animate == undefined || animate)
			win.$.animate({
				width: win._width,
				height: win._height,
				top: win._top,
				left: win._left
			}, 'fast', function() {
				if (typeof win.activeOptions.unmaximize == 'function')
					win.activeOptions.unmaximize.call(win);
			}).removeClass(UI.classes.window.maximized);
		else {
			win.$.css({
				width: win._width,
				height: win._height,
				top: win._top,
				left: win._left
			}).removeClass(UI.classes.window.maximized);
			if (typeof win.activeOptions.unmaximize == 'function')
				win.activeOptions.unmaximize.call(win);
		}
		while (l--)
			if (UI.maximizedWindows[l] === win)
				UI.maximizedWindows.splice(l, 1);
	}
	win.isMaximized = false;
	win.activeOptions.maximized = false;
	win.addShadows();
}
	
// Method to add the window to a taskbar
UI.Window.prototype.addToTaskbar = function(taskbar) {
	var win = this;
	if (win.taskbar !== taskbar) {
		taskbar.addMember(this);
		win.taskbar = taskbar;
	}
	return win;
}
UI.Window.prototype.close = function() {
	var win = this;
	win.isClosed = true;
	win.isOpen = false;
	if (typeof win.activeOptions.close == 'function')
		win.activeOptions.close();
	else
		win.$.fadeOut('fast');
};
UI.Window.prototype.open = function() {
	var win = this;
	win.isClosed = false;
	win.isOpen = true;
	win.$.fadeIn('fast');
}
UI.Window.prototype.focus = function() {  // Brings window z-index to the top
	var win = this;
	if (UI.activeWindow !== win) {
		UI.activeWindow = win;
		$('.'+UI.classes.window.target).removeClass(UI.classes.window.active);
		win.$.addClass(UI.classes.window.active);
		if (win.taskbar) {
			$('.'+UI.classes.taskbar).removeClass(UI.classes.window.active);
			if (win.$taskbarTab)
				win.$taskbarTab.addClass(UI.classes.window.active);
			if (typeof win.activeOptions.focus == 'function')
				win.activeOptions.focus.call(win);
		}
	}
	return win;
}
UI.Window.prototype.disableSelection = function() {
	var win = this;
	if (typeof document.body.onselectstart != "undefined") // IE
		document.body.onselectstart = function() { return false; }
	else if (typeof document.body.style.MozUserSelect != "undefined") { // Firefox
		//var i = window.windows.length;
		//while (--i) {
		//	window.windows[i].$.get(0).style.MozUserSelect = "none";
		//	window.windows[i].handle.style.MozUserSelect = "none";
		//}
			//alert(window.windows[i].state);
		//document.body.style.MozUserSelect = "none";
		win.$handle.find(".handle-extend").css({
			width: '2000px',
			height: '2000px',
			bottom: '-992px',
			right: '-992px'
		});
	} else // Opera, Chrome, Safari
		document.body.onmousedown = function() { return false; }
	document.body.style.cursor = "default";
}
UI.Window.prototype.enableSelection = function() {
	var win = this;
	win.$handle.find('.'+UI.classes.window.handleExtend).css({
		width: '0px',
		height: '0px',
		bottom: '0px',
		right: '0px'
	});
}
UI.Window.prototype.disable = function() {
	
}
UI.Window.prototype.destroy = function() {
	if (this.taskbar != undefined) this.taskbar.removeMember(this);
	var i = ui.windows.length;
	while (i--)
		if (ui.windows[i] === this) {
			ui.windows.splice(i, 1);
		}
	var l = ui.leftbar.length;
	while (l--)
		if (ui.leftbar[l] === this)
			ui.leftbar.splice(l, 1);
	var l = ui.rightbar.length;
	while (l--)
		if (ui.rightbar[l] === this)
			ui.rightbar.splice(l, 1);
	var i = ui.maximizedWindows.length;
	while (i--)
		if (ui.maximizedWindows[i] === this) {
			ui.maximizedWindows.splice(i, 1);
		}
		//alert(": "+window.windows.length);
	if (ui.activeWindow === this)
		ui.activeWindow = undefined;
	this.activeOptions = {};
	this.$
		.fadeOut('fast', function() {
			$(this).unbind().empty().remove();
		});
}
UI.Window.prototype.width = function(size) {  // If size is passed in it sets the size of the window, otherwise it returns the current size
	var win = this;
	if (size == undefined)
		return win._width;
	win._width = size;
	if (!win.isAttached)
		win.$.width(win._width);
	return win;
}
UI.Window.prototype.height = function(size) {
	var win = this;
	if (size == undefined)
		return win._height;
	win._height = size;
	win.$.height(win._height);
	return win;
}
UI.Window.prototype.left = function(size) {
	var win = this;
	if (size == undefined)
		return win._left;
	win._left = size;
	win.$.css({
		right: '',
		left: win._left+'px'
	});
	return win;
}
UI.Window.prototype.top = function(size) {
	var win = this;
	if (size == undefined)
		return win._top;
	win._top = size;
	win.$.css({
		bottom: '',
		top: win._top+'px'
	});
	return win;
}