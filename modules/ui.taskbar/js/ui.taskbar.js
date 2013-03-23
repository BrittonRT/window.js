// Abstraction v.1.0 (c) 2008-2011 Britton Reeder-Thompson //
//                  UI Object Definition                   //

// Global shortcuts
var $window = $(window),
	$document = $(document);
UI.Taskbar = function(selector) {
	var taskbar = this;             // assign a jquery safe pointer to the 'this' object
	taskbar.taskbar = true;
	taskbar.selector = selector;
	taskbar.$ =
	taskbar.jQuery = $(taskbar.selector);
	taskbar.members = new Array();  // pointers for all the child window objects
	
	// Logic
	if (!taskbar.$.hasClass("ui-taskbar")) taskbar.$.addClass("ui-taskbar");
	//tbar.refresh();
	return taskbar;
}
UI.Taskbar.prototype.refresh = function() {
	var taskbar = this;
	taskbar.$.empty();
	for (var i in taskbar.members) {
		var newTab = document.createElement("span");
		newTab.setAttribute("class", i);
		newTab.innerHTML = taskbar.members[i].title;
		taskbar.members[i].taskbarTab = newTab;
		taskbar.members[i].$taskbarTab = $(newTab);
		taskbar.members[i].$taskbarTab.data('win', taskbar.members[i]);
		taskbar.$.get(0).appendChild(newTab);
		$(newTab).hover( function() {
			var curmember = taskbar.members[$(this).attr("class").split(' ')[0]];
			curmember.$.addClass("ui-window-highlight");
		}, function() {
			var curmember = taskbar.members[$(this).attr("class").split(' ')[0]];
			curmember.$.removeClass("ui-window-highlight");
		});
		$(newTab).click( function() {
			var curmember = taskbar.members[$(this).attr("class").split(' ')[0]];
			if (curmember.isClosed) {
				curmember.open();
				curmember.focus();
			} else if (curmember === ui.activeWindow || curmember.isMinimized)
				curmember.minToggle();
			else
				curmember.focus();
		});
	}
}
UI.Taskbar.prototype.isMember = function(win) {
	var taskbar = this;
}
UI.Taskbar.prototype.addMember = function(win) {
	var taskbar = this;
	taskbar.members.push(win);  // add new member to end of the members array
	taskbar.refresh();
} 
UI.Taskbar.prototype.removeMember = function(win) {
	var taskbar = this;
	for (var i=0; i<taskbar.members.length; i++)
	{
		if (taskbar.members[i] == win)
		{
			taskbar.members.splice(i, 1);
			taskbar.refresh();
		}
	}
}