/* Configuration settings. See the SugarCube documentation for more options and info. */

if (window.hasOwnProperty("storyFormat")) {
	// Running inside Twine application
	setup.Path = "C:/whatever"; // Set an absolute path for media files; this is useful if you're testing the story in Twine
} else {
	// Running in a browser
	setup.Path = "";
	// Config.saves.autoload = true; // Automatically loads autosave on startup
}

setup.SoundPath = setup.Path + "sound/";
setup.ImagePath = setup.Path + "images/";

Config.macros.maxLoopIterations = 100;
/* RPGs have a high chance of producing infinite loop errors, so lowering this from the default 1000 is helpful when testing. You probably will never need to exceed 100 iterations, but if you do you can increase this. */

Config.history.maxStates = 1;
// This eliminates Twine's history feature, which prevents people from accessing previous moments (and cuts down on save file size). Given the complexity of an RPG and the fact that many parts of the engine move the player through multiple passages at once, this is probably what you want; but if you do want people to interact with the history, you can change this.

// Config.saves.autosave = true;
/* This generates an autosave on every passage. This is recommended to prevent your player from losing progress. */

Config.saves.isAllowed = function () {
	return !State.variables.inbattle;
};
// This will disallow saving in battle. This is probably a good idea, but make sure you keep track of your inbattle variable so you don't accidentally prevent people from saving in the main story.

setup.version = "3.07.1-alpha";

Config.saves.version = 0;
// Records a version number for saves. Update this when you update your version. This is helpful for updating saves from older versions.
// NOTE: This is separate from the game version. Only update this when you need a new case for onLoad.

Config.saves.onLoad = function (save) {
	switch (save.version){
			// You would make a case for older version numbers, and adjust variables as necessary. If you've made variable changes since that would cause conflicts with the save, you can update them here.
		case 0:
			/*
			save.version++;
			save.state.history.forEach(function (moment) {
				//Access story variables through moment.variables
			});
			*/
		default:
			// all is (hopefully) well, do nothing
	}
};
