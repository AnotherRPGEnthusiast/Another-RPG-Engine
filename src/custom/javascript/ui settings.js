Setting.addHeader("Settings", "These settings will reset if you clear your browser cookies and/or website data.<br>Click anywhere on the switch or text to toggle.");

/* Monitor for when the Settings dialog is opened. */
$(document).on(':dialogopening', function (ev) {
    setTimeout(function () {
        if (V().inbattle && $(ev.target).hasClass('settings')) {
            $('#settings-reset').hide();
			$('#setting-body-difficulty').hide();
        }
    }, Engine.minDomActionDelay);
});

var settingFunctions = {
  confirmToggle: function () {
		if (settings.showconfirm) {
			setup.SHOW_CONFIRM = true;
		} else {
			setup.SHOW_CONFIRM = false;
		}
	},
	turnToggle: function () {
		if (settings.autoend) {
			setup.AUTO_ENDTURN = true;
		} else {
			setup.AUTO_ENDTURN = false;
		}
	},
	actionsToggle: function () {
		if (settings.compressedActions) {
			setup.COMPRESSED_ACTIONS = true;
		} else {
			setup.COMPRESSED_ACTIONS = false;
		}
	},
  animationToggle: function () {
		if (settings.animation) {
			setup.ANIMATIONS = true;
		} else {
			setup.ANIMATIONS = false;
		}
	},
	difficulty: function () {
		switch (settings.difficulty) {
			case "Easy":
				V().difficulty = "easy";
				break;
			case "Normal":
				V().difficulty = "normal";
				break;
			case "Hard":
				V().difficulty = "hard";
				break;
		}
	},
  dyslexicToggle: function () {
    if (settings.dyslexic) {
			$("html").addClass("dyslexic");
		} else {
			$("html").removeClass("dyslexic");
		}
  },
  linkColor: function () {
		switch (settings.linkColor) {
			case "Blue":
				$("html").removeClass("greenLinks");
        $("html").removeClass("redLinks");
				break;
			case "Green":
        $("html").removeClass("redLinks");
        $("html").addClass("greenLinks");
				break;
			case "Red":
        $("html").removeClass("greenLinks");
        $("html").addClass("redLinks");
				break;
		}
	}
};

Setting.addToggle("showconfirm", {
	label	: "Show Confirm Phase",
	default	: true,
	onInit	: settingFunctions.confirmToggle,
	onChange: settingFunctions.confirmToggle
});

Setting.addToggle("autoend", {
	label	: "End turn automatically when all characters have acted",
	default	: true,
	onInit	: settingFunctions.turnToggle,
	onChange: settingFunctions.turnToggle
});

Setting.addToggle("compressedActions", {
	label	: "Compress action list (turn off on mobile)",
	default	: true,
	onInit	: settingFunctions.actionsToggle,
	onChange: settingFunctions.actionsToggle
});

Setting.addToggle("animation", {
  label   : "Animations",
	default : true,
	onInit	: settingFunctions.animationToggle,
	onChange: settingFunctions.animationToggle
});

Setting.addHeader("Accessibility");

Setting.addList("difficulty", {
	label   : "Difficulty Level",
	list    : ["Easy", "Normal", "Hard"],
	default : "Hard",
	onInit	: settingFunctions.difficulty,
	onChange: settingFunctions.difficulty
});

Setting.addList("linkColor", {
  label   : "Link Color",
  list    : ["Blue","Green","Red"],
	default : "Blue",
	onInit	: settingFunctions.linkColor,
	onChange: settingFunctions.linkColor
});

Setting.addToggle("dyslexic", {
  label   : "Dyslexic mode",
	default : false,
	onInit	: settingFunctions.dyslexicToggle,
	onChange: settingFunctions.dyslexicToggle
});
