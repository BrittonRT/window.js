// Abstraction v.1.0 (c) 2008-2011 Britton Reeder-Thompson //
//                  UI Object Definition                   //

// Global shortcuts
var $window = $(window),
	$document = $(document);
// Menu object is used to generate efficient, css styleable menus from json
UI.prototype.Menu = function(json) {
	// Local variable declaration
	var menu = this;
	
	// Member variable declaration
	//menu.json = json;
	menu.$ = 
	menu.jquery = $(menu.fragment);
	menu.json = json;
	
	// Logic
	menu.set(json);	
}
// Call this method to set or change the menu structure/content
UI.Menu.prototype.set = function(json) {
	var menu = this,
		root = $("<div/>")
			.addClass("ui-menu");
	
	// Logic
	menu.fragment = document.createDocumentFragment();
	menu.fragment.appendChild(root.get(0));
	menu.parse(json, root.get(0));
	menu.$ = 
	menu.jquery = root;
}
UI.Menu.prototype.parse = function(json, parent) {
	var menu = this,
		submenu;
		
	// Logic
	for (var i in json) {
		if (typeof json[i] == 'string')
			$(parent).append(json[i]);
		else {
			menu[i] = $("<div/>")
				.addClass(json[i].classes ? json[i].classes+" "+i : i)
				.html((typeof json[i].content == 'function') ? json[i].content() : json[i].content)
				.appendTo(parent)
				.get(0);
			if (json[i].styles) {
				$(menu[i]).attr("style", json[i].styles);
			}	
			if (typeof json[i].click == 'function') {
				$(menu[i]).click(json[i].click);
			}
			if (typeof json[i].mouseover == 'function') {
				$(menu[i]).mouseover(json[i].mouseover);
			}
			if (typeof json[i].mouseout == 'function') {
				$(menu[i]).mouseout(json[i].mouseout);
			}
			//output[output.length] = (typeof json[i].content == 'function') ? json[i].content() : json[i].content;
			if (json[i].children != undefined) {
				submenu = $("<div/>")
					.addClass('ui-submenu')
					.appendTo(menu[i]);
				menu.parse(json[i].children, submenu);
			}
		}
	}
	return menu;  // Return all new meny references created
}
// Cleanly unbind all events associated with this menu and then destroy it
UI.Menu.prototype.destroy = function() {
	var menu = this;
	$(menu.fragment).unbind().empty().remove();
	menu.fragment = null;
	menu.json = null;
}
return Menu;
})();