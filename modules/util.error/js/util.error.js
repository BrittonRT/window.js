// Abstraction v.1.0 (c) 2008-2011 Britton Reeder-Thompson //
//                   Util IE Definition                    //

// Global shortcuts
var $window = $(window),
	$document = $(document);
Util.error = new (function() {
	var error = this;
	error.console = (function() {
		if (!console)
			console = {
				log: function(msg) {
					Util.alert(msg);
				}
			}
		return console;
	})();
	error.throw = function() {
		handleArguments = [
			function() {
				error.console.log('Error: Unknown error!');
			},
			function() {
				error.console.log('Error: '+arguments[0]);
			},
			function() {
				error.console.log(arguments[0]+': '+arguments[1]);
			}
		]
		
	}
})