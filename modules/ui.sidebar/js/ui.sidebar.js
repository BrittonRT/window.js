// Abstraction v.1.0 (c) 2008-2011 Britton Reeder-Thompson //
//                  UI Object Definition                   //

// Global shortcuts
var $window = $(window),
	$document = $(document);
UI.prototype.Sidebar = function(options) {
	// variable declaration
	var sidebar = this,
		defaultOptions = {
			side: 'left',
			parent: document.body,
			width: 250
		}
	this.links = [];
	this.loaded = false;
	// Logic
	if (typeof options == 'object')
		this.options(options);
}
UI.Sidebar.prototype.check = function(window) {
	var sidebar = this;
	// Logic
	if (this.side == 'left' && window.$.offset().left) {
		
	}
}
UI.Sidebar.prototype.linkWindow = function(window) {
	var sidebar = this;
	// Logic
	this.links[this.links.length] = window;
}
UI.Sidebar.prototype.options = function(options) {
	var sidebar = this;
	// Logic
	switch (options.side) {
		case 'left':
			this.side = 'left';
			break;
		case 'right':
			this.side = 'right';
			break;
		default:
			return false;
	}
	this.parent = options.parent;
	this.width = options.width;
	this.loaded = true;
}