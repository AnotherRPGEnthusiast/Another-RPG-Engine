// Common action types to make assignments quicker. These are also saved to Twine variables so they can be used in the enemy actions passage.

// Most actions have an "extension" variable that allows for greater modularity. Anything passed into the extension variable is appended to the normal result, and can incorporate any text or SugarCube code, including the result of other action functions. You can use extensions to "chain" the effects of multiple action types in this way.
// Extensions can also be passed as a function; the function will be called and converted into its return string. This is to enable chaining of action functions that return a function, which is necessary for those that use findTarget.

function findTarget (selector) {
//	Targeting code: Actions target character specified by the target variable by default, but you can make this explicit with a 't' argument. To target self, pass 's'. To target opposing party (enemies if used by a puppet, puppets if used by an enemy), pass 'mass', 'e', or 'enemies'. To target allied party, pass 'a' or 'allies'.
//	Returns three variables, target, party, and mass. This means you must assign the variables the same way, through a two-element array.
//	IMPORTANT: Any action that uses this must RETURN A FUNCTION rather than calculating its results immediately. This is because the result will change depending on the active target and subject, so the function call itself must be renewed.

//	console.log("findTarget called, selector = "+selector);
	var target;
	var party;
	var mass = false;
	if (selector == 'mass' || selector == 'e' || selector == 'enemies'){
		if (subject() instanceof Puppet) {
			party = "$enemies";
		} else if (subject() instanceof Enemy) {
			party = "$puppets";
		}
		target = "$B.target";
		mass = true;
	} else if (selector == 'a' || selector == 'allies') {
		if (subject() instanceof Puppet) {
			party = "$puppets";
		} else if (subject() instanceof Enemy) {
			party = "$enemies";
		}
		target = "$B.target";
		mass = true;
	} else if (selector == 'all') {
		party = "$B.actors"
		target = "$B.target";
		mass = true;
	} else if (selector == 's'){
		target = "$B.subject";
		if (State.getVar(target) !== null) {
			switch (State.getVar(target).id.charAt(0)) {
				case 'p':
					party = "$puppets";
					break;
				case 'e':
					party = "$enemies";
					break;
			}
		}
	} else if (selector === undefined || selector == 't'){
		target = "$B.target";
		if (State.getVar(target) !== null) {
			switch (State.getVar(target).id.charAt(0)) {
				case 'p':
					party = "$puppets";
					break;
				case 'e':
					party = "$enemies";
					break;
			}
		}
	} else {
		console.log("ERROR in findTarget: invalid selector");
	}
	return [target,party,mass];
}


var justdmg = function justdmg (extension,mods) {
	var result = `<<echoDamage>>`;
	if (mods === undefined) {
		mods = {};
	}
	if (extension === undefined){
		extension = "";
	}
	if (mods.counter === true) {
		result = `<<set _counterActive = true>>`+result;
	}
	return function () {
		if (extension instanceof Function) {
			result += extension();
		} else {
			result += extension;
		}
		return result;
	}
};

var heal = function heal (test,extension = "") {
//	test = Boolean; set true to have the function return only the healing value. Useful if you just want to quickly calculate the result of the healing formula.

	if (extension instanceof Function){
		extension = "<br/>" + extension();
	}
	var gain;
	gain = "$action.special"; // you may implement your own formula here
	if (test === true) {
		return gain;
	}
	else {
		return `<<if setup.ANIMATIONS === true && _queue instanceof Set>>\
			<<set _queue.add(target())>>\
			<<set target().battleMsg.push({type: "healing", content: ${gain}})>>\
		<</if>>\
		<<run target().hp += ${gain}>>\
		${target().name} recovers ${gain} HP!`+extension;
	}
};

var multihit = function multihit (args = {},extension = "") {
//	Function for simple multi-hit abilities that only inflict damage, e.g. Rogue's Knife. For more complex abilities, use multihitCustom.

//Args = object with following properties:
//	hits = int. Number of attacks. If undefined or noninteger, will attempt to read the active action for a "_hits" property. If that fails, the function will return an error message.

//	Note that extension is applied only after ALL hits are done.

	return function () {
		var final = "<<echoDamage>>";
		if (!Number.isInteger(args.hits) && V().action !== null){
			args.hits = action()._hits;
		}
		if (!Number.isInteger(args.hits)) {
			return "ERROR in multihit: args.hits must be an integer";
		}

		if (extension instanceof Function){
			extension = extension();
		}
		for (let h = 1; h < args.hits; h++) {
			final += "<<echoDamage>>";
		}
		return final+extension;
	}
};

var multihitCustom = function multihitCustom (args = {content: `<<echoDamage>>`},finalExtension = "") {
//	Function for more complex multi-hit abilities.

//args = object with following properties:
//	hits = int. Number of hits/applications of the content. If undefined or noninteger, will attempt to read the active action for a "_hits" property. If that fails, the function will return an error message.
//	content = string. Full content of actions to occur with each hit. Defaults to echoDamage.
//	spread = Boolean. If true, a new target will be chosen after each hit.
//	noRedundant = Boolean. If true, spread attacks will be unable to hit the same character multiple times. Spread behavior will be applied automatically even if spread parameter is not true.
//	finalExtension = string. SugarCube code to execute after ALL hits are completed. Only executes once.

	var content;
	if (args.content === undefined){
		content = `<<echoDamage>>`;
	} else if (args.content instanceof Function){
		content = content();
	}
	if ((args.hits === undefined || !Number.isInteger(args.hits)) && V().action !== null){
		args.hits = action()._hits;
	}
	if (args.hits === undefined || !Number.isInteger(args.hits)) {
		return "ERROR in multihitCustom: args.hits must be an integer";
	}
	if (finalExtension instanceof Function){
		finalExtension = finalExtension();
	}
	var str = "";
	if (args.noRedundant === true) {
		if ((puppets().length - deadCount()) < args.hits) {
			args.hits = puppets().length - deadCount();
		}
		State.temporary.list = [];
		temporary().list.push(target().name);
		str += content;
		var subloop;
		for (let i = 1; i < args.hits; i++){
			subloop = `<<set _keepGoing = true>>\
					<<for _keepGoing>>\
						<<set $B.target = Hitlist.targetEnemy($action.targetMods)>>\
						<<if _list.includes(target().name)>>\
							<<set _keepGoing = true>>\
						<<else>>\
							<<set _keepGoing = false; _list.push(target().name)>>`+
							content+
						`<</if>>\
					<</for>>`;
			str += subloop;
		}
	} else {
		str += content;
		for (let i = 1; i < args.hits; i++){
			if (args.spread === true) {
				str += `<<set $B.target = Hitlist.targetEnemy($action.targetMods)>>`;
			}
			str += content;
		}
	}
	return str+finalExtension;
};

var applyEffect = function applyEffect (effects, args = {}, extension = "") {
//	Function for abilities that apply status effects.

//	effects is a string or array of strings corresponding to the effects to apply. Duration, power, and target will be the defaults. For more complex behavior, use Actor.addEffect directly.

//args is object with following properties:
//	dmg = Boolean. If true, echoDamage widget prepended to result.
//	self = Boolean. If true, effect is applied to subject instead of target.

//	extension = string. Additional SugarCube code appended to the end of the result. For AoE attacks, this is only appended once, after the entire loop.

	return function () {

	console.assert(effects instanceof Array || typeof(effects) == 'string',"ERROR in applyEffect: invalid effects argument");
	if (typeof(effects) == 'string') {
		effects = [effects];
	}
	if (extension instanceof Function){
		extension = extension();
	}

	var target;
	target = args.self === true ? "$B.subject" : "$B.target";
	var content = "";

	effects.forEach(function (effect) {
		console.assert(typeof(effect) == "string","ERROR in applyEffect: effect undefined or non-string");
		content += `<<print ${target}.addEffect("${effect}")>>`;
	});

	if (args.dmg === true) {
		return `<<echoDamage>>`+content+extension;
	} else {
		return content+extension;
	}

	}
};

var removeEffect = function (args = {target: 't'}, extension = "") {
//	Function for removal of specific status effects, e.g. through the status cure items.
//	By default, removes both buffs AND ailments if type is "all".

//args = object with the following properties:
//	type = string or array. Name of effect(s) to remove. Set to "all" to remove all effects. Defaults to "all".
//	target = string. Defaults to target if unset. See findTarget for details.
//	dispel = Boolean. Set true to remove only buffs.
//	cure = Boolean. Set true to remove only ailments.
//	removeStack = Boolean. Set true to remove all instances of a stackable effect.
//	unsticky = Boolean. Allows cure to remove sticky effects (but not ULTIMATESTICKY)
//	pierce = Boolean. Allows effect removal through Stasis.
//	perExtension = string. Extension to be added within each iteration of a mass targeting loop.

	if (!(typeof(args.type) == "string" || args.type instanceof Array)) {
		args.type = "all";
	}

	if (args.target === undefined) {
		args.target = 't';
	}

	return function () {
		var condition = `true`;	//filter for effects, by default selects all effects
		var perExtension = args.perExtension;
		temporary().mods = args;	//will be passed to removeEffect execution in SugarCube

		if (args.type instanceof Array) {
			temporary().removedEffects = args.type;
			condition = `_removedEffects.includes(_effect.name)`;
		}	else if (args.cure === true) {
			condition = `!_effect.buff`;
		} else if (args.dispel === true) {
			condition = `_effect.buff`;
		}

		if (extension instanceof Function) {
			extension = extension();
		}

		if (perExtension === undefined) {
			perExtension = "";
		}
		if (args.perExtension instanceof Function) {
			perExtension = args.perExtension();
		}

		var content = "";
		var [target,party,mass] = findTarget(args.target);

		if (args.type == 'all' || args.type instanceof Array) {
			content += `<<for _effect range ${target}.effects>>\
			<<if ${condition}>>\
				<<print ${target}.removeEffect(_effect,_mods)>>\
			<</if>>\
			<</for>>`
		} else {
			content += `<<print ${target}.removeEffect("${args.type}",_mods)>>`;
		}

		if (mass === true) {
			return `<<for _a range ${party}>>\
				<<set $B.target = _a>>`+
					content+perExtension+
			`<</for>>`+extension;
		} else {
			return content+extension;
		}
	}
};

var massAttack = function massAttack (args = {target: 'enemies', content: `<<echoDamage>>`},extension = "") {
//	Function for attacks that target an entire party. By default, characters with the "guarded" flag are immune to this ability.
//	The extension for this function is executed only once, after the loop.

//args = object with the following properties:
//	target = string. Defaults to 'enemies'. See findTarget for details.
//	content = string. Code to be executed on each character of the party. Defaults to echoDamage.
//	cut = Boolean. Set to true to divide damage by the number of living characters. This will automatically add an instance of damage before each set of content.
//	type = string. Used to denote special AoE attacks if the battle grid is active. Can be row, column, adjacent (+ shape), or all.

	return function () {

//	console.log("massAttack after inner function call, arguments:"); console.log(args);
	if (args.target === undefined) {
		args.target = 'enemies';
	}
	var content = args.content;
	if (args.content === undefined) {
		content = `<<echoDamage>>`;
	} else if (args.content instanceof Function){
//		console.log("content is a function");
		content = args.content();
	}
	if (extension instanceof Function){
		extension = extension();
	}

	var result = `<<set _AoE = true>>`;

	var [target,party] = findTarget(args.target);
	if (args.cut === true) {
		var count = 0;
		State.getVar(party).filter(function (a) { return a !== null; }).forEach(function(actor) {
			if (!actor.dead && !actor.guarded) {
				count++;
			}
		});
		var prepend = `<<damageCalc>>\
		<<set $dmg = Math.round($dmg/${count})>>\
		<<echoDamage "nocalc">>`;
		content = prepend+content;
	}
	if (typeof(args.type) == 'string') {
		if (party.length < setup.PARTY_SIZE) {
			// If the party isn't the normal size, something weird is going on, such as a singular boss enemy. We'll only hit the original target in this case.
			result += content;
		}
		switch (args.type.toLowerCase()) {
			case 'row':
				result += `<<for _i = (target().row - 1) * setup.ROW_SIZE; _i < (target().row * setup.ROW_SIZE); _i++>>\
						<<if ${party}[_i] !== null && !${party}[_i].dead && !${party}[_i].guarded>>\
							<<set $B.target = ${party}[_i]>>\
							${content}\
						<</if>>\
					<</for>>`;
				break;
			case 'col':
			case 'column':
				result += `<<for _i = (target().col - 1); _i < (setup.COLUMN_SIZE * setup.ROW_SIZE); _i += setup.ROW_SIZE>>\
						<<if ${party}[_i] !== null && !${party}[_i].dead && !${party}[_i].guarded>>\
							<<set $B.target = ${party}[_i]>>\
							${content}\
						<</if>>\
					<</for>>`;
				break;
			case 'adjacent':
			case '+':
				var hitlist = [State.getVar(party).indexOf(target()),			// center
					State.getVar(party).indexOf(target())-setup.ROW_SIZE,		// above
					State.getVar(party).indexOf(target())-1,					// left
					State.getVar(party).indexOf(target())+1,					// right
					State.getVar(party).indexOf(target())+setup.ROW_SIZE];		// below
				hitlist.deleteWith(function (targIdx,i) {
					// This will remove targets that are out of index bounds and left/right entries that jump rows
					return (targIdx < 0 || targIdx >= State.getVar(party).length || (i == 2 && target().col == 1) || (i == 3 && target().col == setup.ROW_SIZE));
				});
				State.temporary.hitlist = hitlist;
				result += `<<for _t range _hitlist>>\
						<<if ${party}[_t] !== null && !${party}[_t].dead && !${party}[_t].guarded>>\
							<<set $B.target = ${party}[_t]>>\
							${content}\
						<</if>>\
					<</for>>`;
				break;
			default:
				result += `<<for _a range ${party}>>\
					<<if _a !== null && !_a.dead && !_a.guarded>>\
						<<set $B.target = _a>>\
						${content}\
					<</if>>\
				<</for>>`;
				break;
		}
	}
	else {
		result += `<<for _a range ${party}>>\
					<<if _a !== null && !_a.dead && !_a.guarded>>\
						<<set $B.target = _a>>\
						${content}\
					<</if>>\
				<</for>>`;
	}
	return result+extension;

	}
};

var splashDamage = function splashDamage (args = {target: 't', cut: 1}, extension) {
//	Function for "splash damage" attacks that inflict less damage to indirect targets, e.g. Grenade items.

//args = object with the following properties:
//	target = string. Defaults to 't'. See findTarget for details.
//	cut = number, damage against other targets is divided by this number.

	return function () {

	if (args.target === undefined) {
		args.target = 't';
	}
	console.assert(Number.isFinite(args.cut),"ERROR in splashDamage: cut value undefined or nonnumber");

	var [target,party] = findTarget(args.target);

	if (extension === undefined) {
		extension = "";
	} else if (extension instanceof Function){
		extension = extension();
	}

	return `<<echoDamage>>\
	<<set _temp = $B.target>>\
	<<for _actor range ${party}>>\
	<<if !_actor.dead && _actor.id != _temp.id && !_actor.guarded>>\
	<<set $B.target = _actor>>\
	<<damageCalc>>\
	<<set $dmg = Math.round($dmg/${args.cut})>>\
	<<echoDamage "nocalc">>\
	<</if>>\
	<</for>>`+extension;

	}
};

var removeLastEffect = function removeLastEffect (args) {
//	Removes the last buff of the target. For e.g. Off Your High Horse

	return function () {
		if (!target().dead && !target().stasis) {
			temporary().effect = target().effects.filter(function (eff) { return eff && eff.buff && !eff.sticky }).last();
			if (temporary().effect instanceof Effect) {
				return `<<print target().removeEffect(_effect)>>`;
			}
		}
	}
};

window.dispelCalc = function dispelCalc () {
//	Calculates how many effects to remove with dispel abilities. Run automatically during the dispel function.

	if (target().stasis != true) {
		// Stasis blocks any effect changes, so it blocks this too.
		var effects = target().effects;
		// This is done just so you don't have to write out the longer name
		var e = V().effects_to_remove;
		for (var i = effects.length-1; i >= 0; i--) {
			if (e <= 0) {
				break;
				// The number of effects removed by Neutralize/Restoration varies depending on energy invested. If there are more effects than the spell can remove, we end the function here. Otherwise the spell would clear all effects regardless of strength!
			}
			if (target() instanceof Puppet) {
				if (!effects[i].buff && !effects[i].sticky) {
					// Because there are fewer buffs than debuffs, a single "buff" flag is used to distinguish them. We only want Restoration to remove debuffs, so it will only trigger the removal code if the effect's buff flag is NOT true.
					// You may also want some effects to be irremovable. This is the purpose of the "sticky" flag, which is set in the effects database.
					V().removed_effects.push(effects[i]);
					e--;
				}
			} else if (target() instanceof Enemy) {
				if (effects[i].buff && !effects[i].sticky) {
					// Because there are fewer buffs than debuffs, a single "buff" flag is used to distinguish them. We only want Restoration to remove debuffs, so it will only trigger the removal code if the effect's buff flag is NOT true.
					// You may also want some effects to be irremovable. This is the purpose of the "sticky" flag, which is set in the effects database.
					V().removed_effects.push(effects[i]);
					e--;
				}
			}
		}
	}
};

var dispel = function () {
	dispelCalc();
	if ((target() instanceof Puppet) && (subject() instanceof Puppet)) {
		V().B.heal_used = true;
	}
	return `<<for _effect range $removed_effects>>`+
	`<<print target().removeEffect(_effect)>>`+
	`<</for>>`+
	`<<set $removed_effects = []>>`;
};

var pushAttack = function pushAttack (args = {target: 't'},extension = "") {
//	Function for abilities that move characters in the battle grid. Only works if BATTLE_GRID is enabled. Will only move characters if the target square is unoccupied (null or dead).
//	NOTE: BATTLE_GRID is set in StoryInit, which is excuted after this file. This means this function can only be called within a function if assigned as a property of an action.

//args = object with the following properties:
//	target = string. Defaults to 't'. See findTarget for details.
//	direction = int or strings "forward", "up", "back", "down", "left", or "right". String arguments will move the character in the stated direction, int will move the character to that index value in their party array.

	if (args.target === undefined) {
		args.target = 't';
	}

	return function () {

	if (setup.BATTLE_GRID === true && (typeof(args.direction) == 'string' || Number.isInteger(args.direction))) {
		var [target,party] = findTarget(args.target);
		if (extension instanceof Function){
			extension = extension();
		}
		var offset = 0;
		var index = State.getVar(party).indexOf(State.getVar(target));
		if (typeof(args.direction) == 'string') {
			switch (args.direction.toLowerCase()) {
				case "forward":
				case "up":
					State.getVar(target).row == 1 ? offset = 0 : offset = (setup.ROW_SIZE * -1);
					// if target is in front row, they can't be pulled forward any further
					break;
				case "back":
				case "down":
					State.getVar(target).row == setup.COLUMN_SIZE ? offset = 0 : offset = setup.ROW_SIZE;
					// if target is in back row (equal to column size), they can't be pushed any further
					break;
				case "left":
					State.getVar(target).col == 1 ? offset = 0 : offset = -1;
					// if target is in the first column, they can't go any more left
					break;
				case "right":
					State.getVar(target).col == setup.ROW_SIZE ? offset = 0 : offset = 1;
					// if target is in the last column, they can't go any more right
					break;
				default:
					return "ERROR invalid direction in pushAttack";
			}
		} else if (Number.isInteger(args.direction)) {
			offset = args.direction;
		}
		if (offset === 0 || State.getVar(target).unmovable) {
			// If offset is 0, no movement will occur; no point in running the check. Just return the extension.
			return extension;
		} else {
			return `<<set _newIdx = ${party}.indexOf(${target})+${offset}>>\
				<<if ${party}[_newIdx] === null || ${party}[_newIdx].dead>>\
					<<set _temp = ${target}>>\
					<<set ${party}.indexOf(target()) = ${party}[_newIdx]; ${party}[_newIdx] = _temp>>\
					${target().name} moved!<br/>\
				<<else>>\
					${target().name} couldn't be moved!<br/>\
				<</if>>`+extension;
		}
	} else {
		return "ERROR in pushAttack: battle grid disabled or invalid direction type";
	}

	}
};

// PREVIEW FUNCTIONS

var Prev = {
	dmg: `<<damageCalc>>This attack will inflict $dmg damage.`,
	heal: function (args) {
		return function() {
			if (typeof(args) !== 'object') {
				args = {};
			}
			var gain = heal(true);
			if (args.revive) {
				if (target().dead) {
					gain = Math.round(target().maxhp * action().special);
					return `$B.target.name will revive with ${gain} HP.`;
				} else {
					return `${target().name} isn't defeated, so this won't do anything.`;
				}
			}
			else if (args.mass) {
				return `All allies will recover ${gain} HP.`;
			}
			else {
				return `${target().name} will recover ${gain} HP.`;
			}
		}
	},
	effect: function (type,extension) {
		return function () {
			var str;
			if (extension === undefined){
				str = "This";
			} else if (extension === 'dmg') {
				str = `<<damageCalc>>This will inflict $dmg damage and`;
			} else {
				str = extension;
			}
			var end = '.';
			var time = "";
			var phrase;
			var article;
			var E = new Effect(type);
			if (E.buff == true){
				phrase = " provide";
			} else {
				phrase = " inflict";
			}
			var tol = target().getTol(type);
			if (tol !== undefined && tol == 'immune') {
				str += " would";
				end = ", but <b>the target is immune</b>.";
			} else if (E.unblockable == false && target().stasis){
				str += " would";
				end = ", but <b>the target's effects are in Stasis</b>.";
			} else if (E.unblockable == false && E.buff != true && target().chi){
				str += " would";
				end = ", but <b>the target's Chi Shield will block it</b>.";
			} else if (type == "Stunned" && target().alert) {
				str += " would";
				end = `...but <b>the target is Alert, so ${target().they} won't fall for it</b>.`;
			} else {
				str += " will";
			}
			switch (type){
				case "ATK Boost":
				case "Injury":
					article = " an";
					break;
				case "DEF Boost":
				case "SPC Boost":
				case "Blessing":
				case "Headache":
				case "Curse":
					article = " a";
					break;
				default:
					article = "";
			}
			if (action().dur > 1){
				time = ` for ${action().dur} rounds`;
			}
		return str+phrase+article+` ${type}`+time+end;
		}
	},
	stance: function () {
		if (subject().stasis){
			return `$B.subject.name is in Stasis, so this won't do anything.`;
		}
		else {return "";}
	},
	multihit: function (hits,extension) {
		if (extension === undefined){
			extension = '.';
		}
		return `<<damageCalc>>This will inflict $dmg x ${hits} damage`+extension;
	},
	cleanse: function () {
		var str;
		dispelCalc();
		if (V().removed_effects.length > 0) {
			str = "This will remove ";
			V().removed_effects.forEach(function(effect,i){
				str += effect.name;
				if (i == (V().removed_effects.length-1)){
					str += '.';
				} else if (i == (V().removed_effects.length-2)){
					if (V().removed_effects.length == 2){
						str += ' and ';
					} else {
						str += ', and ';
					}
				} else {
					str += ', ';
				}
			});
		} else {
			str = "...This won't remove any effects! You can still cast it if you really want to, but it'll be a waste of a turn.";
		}
		V().removed_effects = [];
		// This is necessary for the actual action to work as intended; because it also draws on this variable, when dispelCalc() is called again it would double the array and cause the action to remove the effects twice.
		return str;
	},
	grenade: `<<damageCalc>>This will inflict $dmg damage to $B.target.name and half damage to other enemies.`,
	cure: function (type = "") {
		return function () {
			var str = `This will cure ${target().name} of ${type}`;
			if (type == "all") {
				str += " ailments.";
			} else {
				str += ".";
			}
			var found = false;
			target().effects.forEach(function(eff){
				if (eff.name == type){
					found = true;
				} else if (type == "all" && !eff.buff){
					found = true;
				}
			});
			if (!found){
				var t;
				if (type == "all"){
					t = 'any';
				} else {
					t = 'that ailment';
				}
				str += ` ...or it would, if they had ${t}! You can still use it, but it'll be a waste.`;
			} else if (target().stasis && (type != "Knocked Down")){
				str += ` ...but ${target().their} effects are held in Stasis, so nothing will happen.`;
			}
			return str;
		}
	},
	massAttack: function (type = "") {
		switch (type.toLowerCase()) {
			case 'row':
				return `<<for _i = (target().row - 1) * setup.ROW_SIZE; _i < (target().row * setup.ROW_SIZE); _i++>>\
						<<if $enemies[_i] !== null && !$enemies[_i].dead && !$enemies[_i].guarded>>\
							<<damageCalc $enemies[_i]>>\
							$enemies[_i].name will take <b>$dmg</b> damage<br/>\
						<</if>>\
					<</for>>`;
			case 'col':
			case 'column':
				return `<<for _i = (target().col - 1); _i < (setup.COLUMN_SIZE * setup.ROW_SIZE); _i += setup.ROW_SIZE>>\
						<<if $enemies[_i] !== null && !$enemies[_i].dead && !$enemies[_i].guarded>>\
							<<damageCalc $enemies[_i]>>\
							$enemies[_i].name will take <b>$dmg</b> damage<br/>\
						<</if>>\
					<</for>>`
			case 'adjacent':
			case '+':
				var hitlist = [V().enemies.indexOf(target()),			// center
					V().enemies.indexOf(target())-setup.ROW_SIZE,		// above
					V().enemies.indexOf(target())-1,					// left
					V().enemies.indexOf(target())+1,					// right
					V().enemies.indexOf(target())+setup.ROW_SIZE];		// below
				hitlist.deleteWith(function (targIdx,i) {
					// This will remove targets that are out of index bounds and left/right entries that jump rows
					return (targIdx < 0 || targIdx >= V().enemies.length || (i == 2 && target().col == 1) || (i == 3 && target().col == setup.ROW_SIZE));
				});
				State.temporary.hitlist = hitlist;
				return `<<for _t range _hitlist>>\
						<<if $enemies[_t] !== null && !$enemies[_t].dead && !$enemies[_t].guarded>>\
							<<damageCalc $enemies[_t]>>\
							$enemies[_t].name will take <b>$dmg</b> damage<br/>\
						<</if>>\
					<</for>>`;
			default:
				return `<<for _enemy range enemies()>>\
							<<if !_enemy.dead>>\
								<<damageCalc _enemy>>\
								_enemy.name will take <b>$dmg</b> damage<br/>\
							<</if>>\
						<</for>>`;
		}
	},
	cutAttack: function (type) {
		return function () {
			return `<<set _d = (setup.base + $B.subject.get("Special"))*$action.weight>>\
			This will inflict _d base damage and ${type} status, divided across the current number of enemies.`;
		}
	}
};



var dmgandeffect = function dmgandeffect (target,type,dur) {
// DEPRECIATED as of version 1.11. Use the dmg flag in applyEffect instead.

			if (dur === undefined){
				dur = "$action.dur";
			}
			if (target == 's'){
				target = "$B.subject";
			} else if (target == 't'){
				target = "$B.target";
			}
			return `<<echoDamage>><<addEffect ${target} "${type}" ${dur} $B.subject>>`;
};
