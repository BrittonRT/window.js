// Abstraction v.1.0 (c) 2008-2011 Britton Reeder-Thompson //
//                  UI Object Definition                   //

	// Global shortcuts
var $window = $(window),
	$document = $(document),
UI = new (function(callback) {
	var UI = this;
	UI.prefix = 'ui';
	UI.classes = {
		shadow: UI.prefix+'-shadow'
	}
});
