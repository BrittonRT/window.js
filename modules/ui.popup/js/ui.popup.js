// Abstraction v.1.0 (c) 2008-2011 Britton Reeder-Thompson //
//                  UI Object Definition                   //

// Global shortcuts
var $window = $(window),
	$document = $(document);
// UI.Popup object prototype
UI.prototype.Popup = function(newOptions) {
	var popup = this,
		popupOptions = {
			parent: document.body,
			id: "popup-id-"+ui.windows.length,
			title: "Alert",
			position: "average"
		},
		windowOptions = {};
	if (typeof newOptions == "string") 
		newOptions = { content: newOptions };
	else if (typeof newOptions != 'object')
		return false;
	$.extend(popupOptions, newOptions);
	windowOptions = {
		selector: "#" + popupOptions.id,
		title: popupOptions.title,
		content: popupOptions.content,
		minimize: false,
		maximize: false,
		close: function() {
			popup.$.fadeOut('fast', function() {
				$(this).empty().remove();
			});
		},
		menu: false
	};
	
	// Logic
	$(popupOptions.parent).append("<div id=\"" + popupOptions.id + "\" class=\"popup window abs-ui\"></div>");
	popup.options(windowOptions);
	popup.$.css({
		minWidth: 20,
		minHeight: 20,
		zIndex: 9000,
		display: 'none'
	});
	var popupWidth = popup.$.width(),
		popupHeight = popup.$.height();
	switch (popupOptions.position) {	
		case "mouse":
			var lPos = ui.input.mouse.x()-$(".left-wrapper").width() + "px";  // Decouple this later
			var tPos = ui.input.mouse.y() + "px";
			break;		
		case "center":
			var lPos = ($window.width() / 2-popupWidth / 2);
			var tPos = ($window.height() / 2-popupWidth / 2);
			break;		
		case "average":
			var clPos = ($window.width() / 2-popupWidth / 2);
			var ctPos = ($window.height() / 2-popupWidth / 2);
			var lPos = ui.input.mouse.x()-$(".left-wrapper").width(); 
			var tPos = ui.input.mouse.y();
			lPos = (lPos + clPos) / 2;
			tPos = (tPos + ctPos) / 2;
			break;	
	}
	popup.left(lPos);
	popup.top(tPos);
	popup.width(popupWidth);
	popup.height(popupHeight);
	popup.open();
}
UI.Popup.extends(UI.Window);