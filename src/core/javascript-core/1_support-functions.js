const V = variables; /* for convenience */

predisplay['set-return-variable'] = function () {
	// "Long return" functionality, for menus and other situations where the player may jump through multiple side-passages before returning to the main story. See the SugarCube documentation for more details.
	if (!tags().includes('noreturn')) {
		State.variables['return'] = passage();
	}
};

window.puppets = function puppets () {
	// Processes the puppets array before accessing it. Used in all engine code that accesses $puppets.
	// Filters null entries from the puppets array. Useful for an earlier version of the battle grid that used null entries for empty spaces, but no longer needed with the new update.
	return V().puppets.filter(function(p) { return p !== null });
};

window.enemies = function enemies () {
	// Same as the puppets() function, but for enemies.
	return V().enemies.filter(function(p) { return p !== null });
};

window.encounters = function encounters () {
	// Shorthand access for the $encounters variable.
	return V().encounters;
};

window.inv = function inv () {
	// Shorthand access for player inventory variable.
	// Called for all engine code that accesses inventory, so you can edit the name of your inventory variable here without needing to edit any core code.
	// By default, this variable is the story variable "$inventory" and is defined in StoryInit.
	return V().inventory;
};

// Accessor functions for $target, $subject, and $action story variables. This is simply easier than writing out the full State.variables address in JavaScript.
const target = function target () {return State.variables.target;}
const subject = function subject () {return State.variables.subject;}
const action = function action () {return State.variables.action;}
window.target = target; window.subject = subject; window.action = action;

window.getActor = function getActor(x) {
	// getActor: maintains object persistence across passages for important variables such as $target and $subject.
	var targets = [];
	var id;
	var actor;
	switch(x) {
		case "target": id = target() !== undefined ? target().id : undefined; break;
		case "subject": id = subject() !== undefined ? subject().id : undefined; break;
		case "actor": id = V().B.actor !== undefined ? V().B.actor.id : undefined; break;
		default: console.log("ERROR in getActor: invalid argument");
	}
	if (id !== undefined) {
		actor = getActorById(id);
		switch(x) {
			case "target": V().target = actor; break;
			case "subject": V().subject = actor; break;
			case "actor": V().B.actor = actor; break;
			default: console.log("ERROR in getActor: invalid argument");
		}
	}
	return;
};

const getActorById = function (id) {
	var targets = [];
	var actor;
	if (id !== undefined) {
		switch(id.charAt(0)) {
			case "p": targets = State.variables.puppets; break;
			case "e": targets = State.variables.enemies; break;
			default: console.log("ERROR: Target ID does not match any known party."); return;
		}
		actor = targets.find(function(t) { return t && t.id === id; });
	}
	return actor;
};
window.getActorById = getActorById;

window.deadCount = function deadCount (party = puppets()) {
	//	Returns the number of characters marked "dead" in a party.
	//	party = array of Actors; defaults to $puppets.
	let count = 0;
	party.forEach(function(actor) {
		if (actor.dead) {
			count++;
		}
	});
	return count;
};

const allActors = function allActors (sort = "") {
	//	allActors: Shorthand for concatenating $puppets and $enemies for functions that affect both.
	//	sort: string; determines sorting order after concatenation.
	//		Currently has only one type, "timeline", which sorts in ascending tick order.
  let r = State.variables.puppets.concat(State.variables.enemies);
  switch (sort.toLowerCase()) {
    case "timeline":
      r = r.sort(function(a,b) { return (a.ticks - b.ticks) });
      break;
		case "action":
			r = r.sort(function(a,b) { return (b.actTime - a.actTime) })
			break;
		case "ranked":
			r = r.sort(function(a,b) { return (b.turnFormula() - a.turnFormula())});
			break;
		case "intv":
			r = r.sort(function(a,b) { return (b.get(StatName("intv")) - a.get(StatName("intv")))});
			break;
    default:
			return r;
  }
  return r.sort(tiebreaker);
};
window.allActors = allActors;

const chainBattleGrid = function (grid) {
	// chainBattleGrid: Used in conjunction with getActor to maintain object persistence for the battle grid.
	console.assert(grid instanceof Array,`ERROR in chainBattleGrid: non-array passed`);
	for (let row of grid) {
		for (let cell of row) {
			if (cell.contents instanceof Actor) {
				cell.contents = getActorById(cell.contents.id);
			}
		}
	}
};
window.chainBattleGrid = chainBattleGrid;

const animationsOn = function () {
	// animationsOn: Returns Boolean reporting if animations should be run. Also checks for the existence of _queue as a failsafe.
	return (setup.ANIMATIONS === true && temporary().queue instanceof Set);
};
window.animationsOn = animationsOn;

const StatName = function (statName) {
	// Shorthand for stat name access.
	// Simply accesses the corresponding property in STAT_NAMES if no special case is present.
	if (typeof(statName) === "string") {
		switch (statName) {
			case 'def':
				statName = "Defense";
				break;
			case 'atk':
				statName = "Attack";
				break;
			case 'spc':
				statName = "Special";
				break;
			case 'spd':
				statName = "Speed";
				break;
			case 'intv':
				statName = "Initiative";
				break;
			case 'eva':
				statName = "Evasion";
				break;
			case 'acc':
				statName = "Accuracy";
				break;
			case 'crt':
				statName = "Crit";
				break;
		}
		return setup.STAT_NAMES[statName];
	} else {
		return setup.STAT_NAMES;
	}
}
window.StatName = StatName;

const StatMin = function (statName) {
	// Quick access for stat minimums.
	console.assert(typeof(statName) === "string" && setup.statInfo[statName],`ERROR in StatMin: stat undefined in statInfo`);
	return setup.statInfo[statName].min;
}
window.StatMin = StatMin;

const StatMax = function (statName) {
	// Quick access for stat maximums.
	console.assert(typeof(statName) === "string" && setup.statInfo[statName],`ERROR in StatMin: stat undefined in statInfo`);
	return setup.statInfo[statName].max;
}
window.StatMax = StatMax;

Map.prototype.inc = function (key,amt) {
	//	Increases the value of an entry in a Map object by amt.
	//	Applied to the Map prototype, so will be present in all Map objects and subclasses.
	this.set(key,this.get(key)+amt);
	return;
};

function convertFunction (v) {
	// If v is a function, calls v and returns its output; else, returns v unchanged.
	// Used for action functions that can be passed either functions or text but must ultimately return text only.
	return (v instanceof Function) ? v() : v;
}

/*
// DEPRECIATED: Old guardCheck for the old battle grid code.
window.guardCheck = function guardCheck (index) {
	if (index < 0 || index >= V().enemies.length) {
		console.log("ERROR in guardCheck: index out of bounds");
		index = Math.clamp(index,0,V().enemies.length-1);
	}
	if (setup.BATTLE_GRID != true) {
		return true;
	}
	else if (index >= setup.ROW_SIZE && V().enemies[index-setup.ROW_SIZE] !== null && !V().enemies[index-setup.ROW_SIZE].dead) {
		// Guarded by character in next row up, cannot be targeted
		return false;
	}
	else if (index >= setup.ROW_SIZE * 2) {
		// No immediate guard (previous check failed), but not in front two rows, so another guard is possible. Move up a row and check again.
		return guardCheck(index-setup.ROW_SIZE);
	}
	else {
		return true;
	}
};
*/

/*
	Number-To-Words module
	Converts a number, which must be a safe integer, into its short scale word equivalent.

	USAGE:
		numberToWords(4269)   →  four thousand two hundred sixty-nine
		numberToWords(-4269)  →  negative four thousand two hundred sixty-nine
*/
!function(){"use strict";function isTruthy(number){return!!number}function chunk(number){for(var thousands=[];number>0;)thousands.push(number%1e3),number=Math.floor(number/1e3);return thousands}function toEnglish(number){if(number<20)return UNDER_TWENTY[number-1];var hundreds,tens,ones,words=[];return number<100?(ones=number%10,tens=number/10|0,words.push(TENS[tens-1]),words.push(toEnglish(ones)),words.filter(isTruthy).join("-")):(hundreds=number/100|0,words.push(toEnglish(hundreds)),words.push(HUNDRED),words.push(toEnglish(number%100)),words.filter(isTruthy).join(" "))}function appendScale(chunk,i){if(chunk)return[chunk,SCALES[i-1]].filter(isTruthy).join(" ")}function numberToWords(number){if(!Number.isSafeInteger(number))throw new Error("numberToWords number parameter must be a safe integer");return 0===number?ZERO:(number<0?NEGATIVE+" ":"")+chunk(Math.abs(number)).map(toEnglish).map(appendScale).filter(isTruthy).reverse().join(" ")}var NEGATIVE="negative",ZERO="zero",UNDER_TWENTY=["one","two","three","four","five","six","seven","eight","nine","ten","eleven","twelve","thirteen","fourteen","fifteen","sixteen","seventeen","eighteen","nineteen"],TENS=["ten","twenty","thirty","forty","fifty","sixty","seventy","eighty","ninety"],HUNDRED="hundred",SCALES=["thousand","million","billion","trillion","quadrillion"];window.numberToWords=numberToWords}();

// Controlled axis fixed element hack by Richard Harrison
// @Note: not sure e.pageX will work in IE8
(function(window){
  if (true) {
		// A full compatability script from MDN:
		var supportPageOffset = window.pageXOffset !== undefined;
		var isCSS1Compat = ((document.compatMode || "") === "CSS1Compat");

		// Set up some variables
		var statusbar;
		var noHorizontal;
		var noVertical;
		// Add an event to the window.onscroll event
		window.addEventListener("scroll", function() {

		statusbar = document.getElementById("status");
		noHorizontal = document.getElementById("noHorizontal");
		noVertical = document.getElementById("noVertical");

		// A full compatability script from MDN for gathering the x and y values of scroll:
		var x = supportPageOffset ? window.pageXOffset : isCSS1Compat ? document.documentElement.scrollLeft : document.body.scrollLeft;
		var y = supportPageOffset ? window.pageYOffset : isCSS1Compat ? document.documentElement.scrollTop : document.body.scrollTop;

		if (noHorizontal) {
			noHorizontal.style.left = -x + 1250 + "px";
		}
		if (statusbar) {
			statusbar.style.left = -x + 1020 + "px";
		}
		if (noVertical) {
			noVertical.style.top = -y + 50 + "px";
		}
	});
  }
})(window);

(function(window){
  if (true) {

		// Set up some variables
		var popup;
		var actionList;
		// Add an event to the window.mousemove event
		window.addEventListener("mousemove", function(e) {

			popup = document.getElementById("actionBox");

			if (popup) {
				popup.style.left = e.clientX - $("#content").position().left + 10 + "px";
				popup.style.top = e.clientY + (popup.offsetHeight/2) > window.innerHeight ?
					window.innerHeight - popup.offsetHeight - 1 + "px" : e.clientY - (popup.offsetHeight/2) + "px"
				actionList = document.getElementById("actionList");
				if (actionList) {
					actionList.addEventListener("scroll", function() {
						popup.style.visibility = "hidden";
					});
				}
			}
		});
	}
})(window);

window.reverseChildren = function reverseChildren(parent) {
// Code by Ayman Abdel-Rahman
    for (var i = 1; i < parent.childNodes.length; i++){
        parent.insertBefore(parent.childNodes[i], parent.firstChild);
    }
};

// textWidth function
setup.textWidth = function(text, bold, size) {
    /* create the <span> to measure the text width */
	if (bold === undefined) {
		bold = "normal";
	}
	else if (bold === true) {
		bold = "bold";
	}
	if (size === undefined || typeof(size) != 'number') {
		size = "12pt";
	} else {
		size = Number.toString(size) + "px";
	}
    var tElement = jQuery(`<span style="font-weight: ${bold}">` + String(text) + "</span>");
    /* add it (hidden) to the end of the document's body so that
       the browser updates its width and we can save it */
    tElement.hide().appendTo(document.body);
    var width = tElement.width();
    /* clean up */
    tElement.remove();
    return width;
};

setup.scaledTextDiv = function(text, width, mods = {}, print) {
  var tWidth = setup.textWidth(text, mods.bold, mods.size);
	if (print !== undefined) {
		text = print;
	}
    if (temporary().enemy !== undefined && temporary().enemy.large) {
		return `<div>${text}</div>`;
	} else if(tWidth < width) {
        return `<div style="width: ${width}px; overflow: hidden;"><span style="display: inline-block; white-space: nowrap;">${text}</span></div>`;
    } else {
        return `<div style="width: ${width}px; overflow: hidden;"><span style="display: inline-block; white-space: nowrap; transform: translate(-50%, 0) scaleX(${width / tWidth}) translate(50%, 0);">${text}</span></div>`;
    }
};

setup.NAME_LENGTH = 120;	// length of the actor name in actor block, in px


/*! <<numberboxplus>> and <<textboxplus>> macros for SugarCube v2 */
!function(){
	"use strict";
	var _typeof="function"==typeof Symbol&&"symbol"==typeof Symbol.iterator?function(obj){return typeof obj}:function(obj){return obj&&"function"==typeof Symbol&&obj.constructor===Symbol&&obj!==Symbol.prototype?"symbol":typeof obj};
	if("undefined"==typeof version||void 0===version.title||"SugarCube"!==version.title||void 0===version.major||version.major<2||void 0===version.minor||version.minor<32)throw new Error("<<numberboxplus>> macro requires SugarCube 2.32.0 or greater, aborting load");

	Macro.add(['numberboxplus', 'textboxplus'], {
		isAsync : true,
		tags		: null,

		handler	:	function() {
			var _this = this;
			if (this.args.length < 2) {
				const errors = [];
				if (this.args.length < 1) { errors.push('variable name'); }
				if (this.args.length < 2) { errors.push('default value'); }
				return this.error(`no ${errors.join(' or ')} specified`);
			}

			// Ensure that the variable name argument is a string.
			if (typeof this.args[0] !== 'string') {
				return this.error('variable name argument is not a string');
			}

			var varName = this.args[0].trim();

			// Try to ensure that we receive the variable's name (incl. sigil), not its value.
			if (varName[0] !== '$' && varName[0] !== '_') {
				return this.error(`variable name "${this.args[0]}" is missing its sigil ($ or _)`);
			}

			// Custom debug view setup.
			if (Config.debug) {
				this.debugView.modes({ block : true });
			}

			var asNumber     = this.name === 'numberboxplus';
			var defaultValue = asNumber ? Number(this.args[1]) : this.args[1];

			if (asNumber && Number.isNaN(defaultValue)) {
				return this.error(`default value "${this.args[1]}" is neither a number nor can it be parsed into a number`);
			}

			var varId = Util.slugify(varName);
			var el    = document.createElement('input');
			let autofocus = false;
			let passage;

			if (this.args.length > 3) {
				passage   = this.args[2];
				autofocus = this.args[3] === 'autofocus';
			}
			else if (this.args.length > 2) {
				if (this.args[2] === 'autofocus') {
					autofocus = true;
				}
				else {
					passage = this.args[2];
				}
			}

			if (typeof passage === 'object') {
				// Argument was in wiki link syntax.
				passage = passage.link;
			}

			// Set up and append the input element to the output buffer.
			jQuery(el)
				.attr({
					id       : `${this.name}-${varId}`,
					name     : `${this.name}-${varId}`,
					type     : asNumber ? 'number' : 'text',
					tabindex : 0 // for accessiblity
				})
				.addClass(`macro-${this.name}`)
				.on('change.macros', this.createShadowWrapper(function () {
					State.setVar(varName, asNumber ? Number(this.value) : this.value);
				}))
				.on('keypress.macros', this.createShadowWrapper(function () {
					// If Return/Enter is pressed, set the variable, execute contents and, optionally, forward to another passage.
					var contents=_this.payload[0].contents.trim();
					return function (ev) {
						if (ev.which === 13) { // 13 is Return/Enter
							ev.preventDefault();
							State.setVar(varName, asNumber ? Number(this.value) : this.value);

							if (contents !== "") {
								Wikifier.wikifyEval(contents);
							}

							if (passage != null) { // lazy equality for null
								Engine.play(passage);
							}
						}
					}
				}()))
				.appendTo(this.output);

			// Set the variable and input element to the default value.
			State.setVar(varName, defaultValue);
			el.value = defaultValue;

			// Autofocus the input element, if requested.
			if (autofocus) {
				// Set the element's "autofocus" attribute.
				el.setAttribute('autofocus', 'autofocus');

				// Set up a single-use post-display task to autofocus the element.
				postdisplay[`#autofocus:${el.id}`] = task => {
					delete postdisplay[task]; // single-use task
					setTimeout( function () {
						return el.focus();
					}, Engine.minDomActionDelay);
				};
			}
		}
	});
}();

$(document).on(":all-animations-done", function () {
	if (V().inbattle) {
		temporary().showDead = true;
		$.wiki('<<update>>');
		temporary().queue.forEach(function (actor) {
			delete actor._displayHP;
		})
	}
});

// animateCSS function, by animate.style team
const animateCSS = (element, animation, time, prefix = 'animate__') =>
  // We create a Promise and return it
  new Promise((resolve, reject) => {
    const animationName = `${prefix}${animation}`;
    const node = document.querySelector(element);
		const duration = typeof(time) == "string" ? time : node.style.getPropertyValue('--animate-duration');

		node.style.setProperty('--animate-duration', duration);
    node.classList.add(`${prefix}animated`, animationName);

    // When the animation ends, we clean the classes and resolve the Promise
    function handleAnimationEnd() {
      node.classList.remove(`${prefix}animated`, animationName);
			if (typeof(temporary().animationsComplete) == "number") {temporary().animationsComplete++;}
			if ($('#continue') !== undefined && temporary().animationsComplete >= temporary().animationsToComplete) {
					$("#continue .macro-button").each((index, element) => {
						element.disabled = false;
					});
					$.event.trigger(":all-animations-done");
			}
      resolve('Animation ended');
    }

    node.addEventListener('animationend', handleAnimationEnd, {once: true});
  });
window.animateCSS = animateCSS;

const resetAnimation = (element, animation) => {
	const animationName = "animate__"+animation;
	const node = document.querySelector(element);
	node.classList.remove(animationName);
	setTimeout(function () {
		node.classList.add(animationName);
	},10);
}
window.resetAnimation = resetAnimation;
