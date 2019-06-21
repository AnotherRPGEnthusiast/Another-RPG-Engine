/* Configuration settings. See the SugarCube documentation for more options and info. */

if (window.hasOwnProperty("storyFormat")) {
	// Running inside Twine application
	setup.Path = "C:/whatever"; // Set an absolute path for media files; this is useful if you're testing the story in Twine
} else {
	// Running in a browser
	setup.Path = "";
	// Config.saves.autoload = true; // Automatically loads autosave on startup
}
/*
setup.SoundPath = setup.Path + "sound/";
setup.ImagePath = setup.Path + "images/";
*/

Config.macros.maxLoopIterations = 100;
/* RPGs have a high chance of producing infinite loop errors, so lowering this from the default 1000 is helpful when testing. You probably will never need to exceed 100 iterations, but if you do you can increase this. */

// Config.saves.autosave = true;
/* This generates an autosave on every passage. This is recommended to prevent your player from losing progress. */

Config.saves.isAllowed = function () {
	return !State.variables.inbattle;
};
/* This will disallow saving in battle. This is probably a good idea, but make sure you keep track of your inbattle variable so you don't accidentally prevent people from saving in the main story. */

Config.passages.descriptions = true;
/* Saves will display passage titles instead of passage excerpts. This is probably a good idea for RPGs, but you can change it if necessary. */

Config.saves.version = "";
/* Records a version number for saves. Update this when you update your version. This is helpful for updating saves from older versions. */

Config.saves.onLoad = function (save) {
	switch (save.version){
			/* You would make a case for older version numbers, and adjust variables as necessary. If you've made variable changes since that would cause conflicts with the save, you can update them here. */
			/* Remember that you must access Twine variables through "State.variables", and you can execute TwineScript through $(wiki).('text') */
		default:
			/* all is (hopefully) well, do nothing */
	}
};

var V = variables; /* for convenience */

window.target = function target () {return State.variables.target[0];};
window.subject = function subject () {return State.variables.subject[0];};
window.action = function action () {return State.variables.action;};

Map.prototype.inc = function (key,amt) {
	this.set(key,this.get(key)+amt);
	return;
}