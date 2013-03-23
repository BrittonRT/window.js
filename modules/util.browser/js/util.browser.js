// Abstraction v.1.0 (c) 2008-2011 Britton Reeder-Thompson //
//                   Util IE Definition                    //

// Global shortcuts
var $window = $(window),
	$document = $(document);
Util.browser = new (function() {
	if (ie)
		this.app = 'ie';
		this.version = (ie === true) ? 'unknown version' : ie;
		delete window.ie;
	}
	return this.app;
}.prototype.isIE = function() {
	return (this.app == 'ie');
});