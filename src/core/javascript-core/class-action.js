window.Action = class Action {
	constructor(name){
	if (typeof(name) == 'object') {
		Object.keys(name).forEach(prop => this[prop] = clone(name[prop]));
	} else {
		this.name = name;
		if (Number.isInteger(this.actionData.uses)) { this._uses = new FillStat(this.actionData.uses); }
		if (Number.isInteger(this.actionData.cooldown)) { this._cd = new FillStat(this.actionData.cooldown); }
		if (Number.isInteger(this.actionData.warmup) && this.cd !== undefined) { this.cd = this.actionData.warmup; }

		if (this.name !== this.displayname) {
			for (let [pn,v] of Object.entries(this.actionData)) {
				this["_"+pn] = v;
			}
			this.name = this.displayname;
		}
	}
	}

	get actionData () {
		return (setup.actionData[this.name] || {});
	}

	get displayname () {
		//	Name of the action displayed in the player menu. This may be different from the action's name in the code.
		//	Useful for related families of actions that are very similar but require different names in the database (such as upgraded abilities).

		var val = this._displayname;
		if (val === undefined && setup.actionData[this.name] !== undefined) {
			val = setup.actionData[this.name].displayname;
		}
		if (val === undefined) {
			val = this.name;
		}
		return val;
	}

	set displayname (val) {
		console.assert(typeof(val) == "string",`ERROR: displayname is not string`);
		this._displayname = val;
	}

	get tags () {
		//	String or array of strings. If string, will be converted into a 1-element array. Identifiers used for miscellaneous purposes.

		let r = (this._tags || this.actionData.tags || []);
		if (typeof(r) === "string") r = [r];
		console.assert(r instanceof Array,`ERROR in action ${this.name}: tags must be array`);
		return r;
	}

	get formula () {
		//	Function. Special damage formula, if divergence from the default is desired. If unset, will default to the normal damage formula.

		var val = this._formula;
		if (val === undefined) {
			val = this.actionData.formula;
		}
		if (val === undefined) {
			val = null;
		}
		return val;
	}

	set formula (val) {
		console.assert(val instanceof Function,`ERROR: formula is not function`);
		this._formula = val;
	}

	get info() {
		//	Gameplay information on the action's function, displayed to the player during action selection.

		var val = this._info;
		if (val === undefined) {
			val = this.actionData.info;
		}
		if (val === undefined) {
			val = "Info pending.";
		}
		return (val instanceof Function) ? val(this) : val;
  }

	set info (val) {
		this._info = val;
	}

  get desc() {
		//	Flavor text displayed below action info in smaller text.

		var val = this._desc;
		if (val === undefined) {
			val = this.actionData.desc;
		}
		if (val === undefined) {
			val = "Description pending.";
		}
		return val;
  }

	set desc (val) {
		this._desc = val;
	}

	get useText() {
		//	Text to be displayed above actText. Usually provides the name of the action.
		//	Set to null to remove this section from the action display entirely.

		var val = this._useText;
		if (val === undefined) {
			val = this.actionData.useText;
		}
		if (val === undefined) {
			val = `${subject().name} uses "${this.displayname}".`;
		}
		return val;
  }

	set useText (val) {
		this._useText = val;
	}

	get actText() {
		//	Text to be displayed in actFlavor when the action is executed.

    var val = this._actText;
		if (val === undefined) {
			val = this.actionData.actText;
		}
		if (val === undefined) {
			val = null;
		}
		return val;
  }

	set actText (val) {
		this._actText = val;
	}

	get confirmText() {
		//	Text to be displayed during the confirm phase.

		var val = (this._confirmText || this.actionData.confirmText);
		return (val instanceof Function) ? val(this) : val;
	}

	get act() {
		//	Gameplay effect of the action. Usually a string of SugarCube code.
		//	Results of this call are printed in the actEffects textbox. Note that JavaScript code cannot print to a passage.

		var val = this._act;
		if (val === undefined) {
			val = this.actionData.act;
		}
		if (val === undefined) {
			val = `This action doesn't do anything!`;
		}
		return val;
  }

	set act (val) {
		this._act = val;
	}

	get finisher() {
		//	Function. Effect ocurring on the final hit of the action only. Optional.
		//	Note that ONLY the finisher is triggered on the final hit.

		var val = this._finisher;
		if (val === undefined) {
			val = this.actionData.finisher;
		}
		return val;
  }

	set finisher (val) {
		console.assert(val instanceof Function,`ERROR in finisher setter: must be function`);
		this._finisher = val;
	}

	get onMiss() {
		//	Function. Executes if the action misses (but not if blocked by a shield effect). Optional.

		var val = this._onMiss;
		if (val === undefined) {
			val = this.actionData.onMiss;
		}
		return val;
  }

	set onMiss (val) {
		console.assert(val instanceof Function,`ERROR in onMiss setter: must be function`);
		this._onMiss = val;
	}

	get spellMod() {
		//	Function. Called in the Spell Phase to modify the action if the action's spell attribute is true.

    return (this._spellMod || this.actionData.spellMod || "ERROR SPELLMOD UNDEFINED");
  }

	get phase () {
		//	String. Phase that the player will be forwarded to when the action is selected.
		//	Must match one of the phase passage names EXACTLY.

		return (this._phase || this.actionData.phase || "Targeting Phase");
	}

	get target () {
		//	String. Specifies what party or parties can be targeted by the action.
		//	Can take value of "enemy", "ally", or "all".
		//	See noself for additional modifier on targeting properties.

		return (this._target || this.actionData.target || "enemy");
	}

	set target (val) {
		this._target = val;
	}

	get cost () {
		//	Number. Value subtracted from user EN on use.

		var val = this._cost;
		if (val === undefined) {
			val = this.actionData.cost;
		}
		if (val === undefined) {
			val = 0;
		}
		return (val instanceof Function) ? val(this) : val;
	}

	set cost (val) {
		this._cost = val;
	}

	get hpcost () {
		//	Number. Value subtracted from user HP on use.

		var val = this._hpcost;
		if (val === undefined) {
			val = this.actionData.hpcost;
		}
		if (val === undefined) {
			val = 0;
		}
		return (val instanceof Function) ? val(this) : val;
	}

	set hpcost (val) {
		this._hpcost = val;
	}

	get weight () {
		//	Number. Attack damage is weighted by this number according to damage formula.

		var val = this._weight;
		if (val === undefined) {
			val = this.actionData.weight;
		}
		if (val === undefined) {
			val = 1;
		}
		return (val instanceof Function) ? val(this) : val;
	}

	set weight (val) {
		console.assert(typeof(val) === "number" && val >= 0,`ERROR in action weight setter: value was non-number or less than 0`)
		this._weight = val;
	}

	get base () {
		//	Integer. Flat bonus added to attack damage.

		var val = this._base;
		if (val === undefined) {
			val = this.actionData.base;
		}
		if (val === undefined) {
			val = 0;
		}
		return (val instanceof Function) ? val(this) : val;
	}

	set base (val) {
		console.assert(Number.IsInteger(val) && val >= 0,`ERROR in action base setter: value was non-integer or less than 0`)
		this._base = val;
	}

	get effweight () {
		//	Number. Weights the effect of numerical status effects according to the effect formula.

		var val = this._effweight;
		if (val === undefined) {
			val = this.actionData.effweight;
		}
		if (val === undefined) {
			val = 0;
		}
		return (val instanceof Function) ? val(this) : val;
	}

	set effweight (val) {
		this._effweight = val;
	}

	get dur () {
		//	Number. Duration of an applied effect.

		var val = this._dur;
		if (val === undefined) {
			val = this.actionData.dur;
		}
		if (val === undefined) {
			val = 0;
		}
		return (val instanceof Function) ? val(this) : val;
	}

	set dur (val) {
		this._dur = val;
	}

	get threat () {
		//	Number. Additional flat threat value incurred to the user when action used.
		//	Stacks with standard threat gain from damage formula.

		var val = this._threat;
		if (val === undefined) {
			val = this.actionData.threat;
		}
		if (val === undefined) {
			val = 0;
		}
		return (val instanceof Function) ? val(this) : val;
	}

	set threat (val) {
		this._threat = val;
	}

	get special () {
		//	Value used for miscellaneous purposes, e.g. the EN gain from Focus.

		return (this._special || this.actionData.special || "ERROR SPECIAL UNDEFINED");
	}

	set special (val) {
		this._special = val;
	}

	get basic () {
		//	If true, can be used even while Dizzy.

		var val = this._basic;
		if (val === undefined) {
			val = this.tags.includes("basic");
		}
		return (val instanceof Function) ? val(this) : val;
	}

	set basic (val) {
		this._basic = val;
	}

	get instant () {
		//	If true, does not end the user's turn.

		var val = this._instant;
		if (val === undefined) {
			val = this.tags.includes("instant");
		}
		return (val instanceof Function) ? val(this) : val;
	}

	set instant (val) {
		this._instant = val;
	}

	get pierce () {
		//	If true, attack ignores enemy defense.

		var val = this._pierce;
		if (val === undefined) {
			val = this.actionData.pierce;
		}
		if (val === undefined) {
			val = false;
		}
		return (val instanceof Function) ? val(this) : val;
	}

	set pierce (val) {
		this._pierce = val;
	}

	get noself () {
		//	If true, the user cannot target themself with this action.

		var val = this._noself;
		if (val === undefined) {
			val = this.actionData.noself;
		}
		if (val === undefined) {
			val = false;
		}
		return val;
	}

	get counter () {
		//	If true, this is considered a counter action

		var val = this._counter;
		if (val === undefined) {
			val = this.actionData.counter;
		}
		if (val === undefined) {
			val = false;
		}
		return val;
	}

	get item () {
		//	If true, the item entry in the player's inventory that matches the action's name will be decremented after action is used.

		var val = this._item;
		if (val === undefined) {
			val = this.actionData.item;
		}
		if (val === undefined) {
			val = false;
		}
		return val;
	}

	get passive () {
		//	If true, action will not be displayed or selectable during battle.

		var val = this._passive;
		if (val === undefined) {
			val = this.actionData.passive;
		}
		if (val === undefined) {
			val = false;
		}
		return val;
	}

	get nosave () {
		//	If true, action will not be saved to lastAction.

		var val = this._nosave;
		if (val === undefined) {
			val = this.actionData.nosave;
		}
		if (this.crisis || this instanceof ItemAction) {
			val = true;
		} else if (val === undefined) {
			val = false;
		}
		return val;
	}

	get saveMod () {
		//	String. User's last action will be saved as this name. Defaults to the action's regular name.

		return (this._saveMod || this.actionData.saveMod || this.name);
	}

	get passagejump () {
		//	String. If filled, action will forward the player to the passage with the same name as this property's value.
		//	Value must match the desired passage name EXACTLY.

		var val = this._passagejump;
		if (val === undefined) {
			val = this.actionData.passagejump;
		}
		if (val === undefined) {
			val = false;
		}
		return val;
	}

	get accuracy () {
		// 	Nonnegative number, percentile value of chance to hit. Reduced by enemy evasion stat if it exists.
		//	Set to Boolean true for an always-accurate attack (bypasses accuracy and evasion checks).
		//	By default, magical attacks (denoted by useSpecial of 1) have perfect accuracy.

		var val = this._accuracy;
		if (val === undefined) {
			val = this.actionData.accuracy;
		}
		if (val === undefined) {
			this.useSpecial == 1 ? val = true : val = setup.ACCURACY_RATE;		/* magic cannot miss */
		}
		if (val === true) {
			return true;
		} else if (isNaN(val)) {
			console.log(`ERROR: accuracy rate of ${this.name} is not a number`);
			return 0;
		}
		return Math.abs(val);
	}

	set accuracy (val) {
		this._accuracy = val;
	}

	get critRate () {
		//	Nonnegative number, percentile value of chance of landing a critical hit.
		//	By default, magical attacks (denoted by useSpecial of 1) always have 0% crit rate.

		var val = this._critRate;
		if (val === undefined) {
			val = this.actionData.critRate;
		}
		if (val === undefined) {
			this.useSpecial == 1 ? val = 0 : val = setup.CRITICAL_RATE;		/* magic cannot crit */
		}
		if (isNaN(val)) {
			console.log(`ERROR: critical rate of ${this.name} is not a number`);
			return 0;
		}
		return Math.abs(val);
	}

	set critRate (val) {
		this._critRate = val;
	}

	get critMultiplier () {
		//	Nonnegative number, multiplier for damage on a critical hit. Defaults to critical multiplier value defined in setup.

		var val = this._critMultiplier;
		if (val === undefined) {
			val = this.actionData.critMultiplier;
		}
		if (val === undefined) {
			val = setup.CRITICAL_MULTIPLIER;
		}
		if (isNaN(val)) {
			console.log(`ERROR: crit multiplier of ${this.name} is not a number`);
			return 0;
		}
		return Math.abs(val);
	}

	set critMultiplier (val) {
		this._critMultiplier = val;
	}

	get trigger () {
		//	For counterattacks. Function or Boolean. If result is true, counter will trigger.

		var val = this._trigger;
		if (val === undefined) {
			val = this.actionData.trigger;
		}
		if (val === undefined) {
			val = true;
		}
		return (val instanceof Function) ? val(this) : val;
	}

	get fullround () {
		//	If true, action will use up all enemy actions.

		var val = this._fullround;
		if (val === undefined) {
			val = this.actionData.fullround;
		}
		if (val === undefined) {
			val = false;
		}
		return (val instanceof Function) ? val(this) : val;
	}

	get element () {
		//	String or Array. Elemental affinity of the action. See damage formula for details.

		var val = this._element;
		if (val === undefined) {
			val = this.actionData.element;
		}
		if (val === undefined) {
			val = setup.DEFAULT_ELEMENT;
		} else if (val instanceof Function) {
			val = val();
		}
		if (typeof(val) == "string") {
			console.assert(setup.ELEMENT_LIST.includes(val),`ERROR: ${this.name} has illegal element`);
			return val.toLowerCase();
		} else if (val instanceof Array) {
			for (let elm of val) {
				console.assert((typeof(elm) == "string" && setup.ELEMENT_LIST.includes(elm)),`ERROR: ${this.name} has illegal element`);
			}
			return val;
		} else if (val !== null) {
			console.log(`ERROR: ${this.name} has non-string element value`);
			return null;
		}
		return val;
	}

	get crisis () {
		//	Determines if this is a crisis action.

		var val = this._crisis;
		if (val === undefined) {
			val = this.actionData.crisis;
		}
		if (val === undefined) {
			val = false;
		}
		return val;
	}

	get silent () {
		//	If true, action will not display any text during the Action Phase. Effects will still trigger, but the player will be auto-forwarded to the next phase.

		var val = this._silent;
		if (val === undefined) {
			val = this.actionData.silent;
		}
		if (val === undefined) {
			val = false;
		}
		return val;
	}

	get oncePerTurn () {
		//	If true, action can only be used once per turn, even if it is instant.

		var val = this._oncePerTurn;
		if (val === undefined) {
			val = this.actionData.oncePerTurn;
		}
		if (val === undefined) {
			val = false;
		}
		return val;
	}

	get ranged () {
		//	If true, action can target anyone on the battlefield regardless of configuration. See the battle grid for details.

		var val = this._ranged;
		if (val === undefined) {
			val = this.actionData.ranged;
		}
		if (val === undefined) {
			val = false;
		}
		return val;
	}

	set ranged (val) {
		this._ranged = val;
	}

	get noDefault () {
		// if true, action cannot be set as a default

		var val = this._noDefault;
		if (val === undefined) {
			val = this.actionData.noDefault;
		}
		if (val === undefined) {
			this.passive || this.crisis || this.weight === 0 ? val = true : val = false;
		}
		return val;
	}

	get noShock () {
		// if true, action cannot cure "shock" effects on direct damage

		var val = this._noShock;
		if (val === undefined) {
			val = this.actionData.noShock;
		}
		if (val === undefined) {
			val = false;
		}
		return val;
	}

	get needsPriorElement () {
		//	If true, action will require an element in the user's lastUsed property.

		var val = this._needsPriorElement;
		if (val === undefined) {
			val = this.actionData.needsPriorElement;
		}
		if (val === undefined) {
			val = false;
		}
		return val;
	}

	get truce () {
		//	If true, action will not violate an enemy's truce

		var val = this._truce;
		if (val === undefined) {
			val = this.actionData.truce;
		}
		if (val === undefined) {
			val = this.silent ? true : false;
		}
		return val;
	}

	get useSpecial () {
		// Number between 0 and 1, determines proportion of base damage dependent on Special. Attack dependence is automatically calculated as the inverse, so e.g. a 75% Special dependence results in a 25% Attack dependence.

		var val = this._useSpecial;
		if (val === undefined) {
			val = this.actionData.useSpecial;
		}
		if (val === undefined) {
			this instanceof ItemAction? val = 1 : val = 0;
		}
		return Math.clamp(val,0,1);
	}

	set useSpecial (val) {
		this._useSpecial = val;
	}

	get uses () {
		// Assumes _uses is a FillStat
		return this._uses instanceof FillStat ? this._uses.currentVal : undefined;
	}

	set uses (amt) {
		if (this.uses !== undefined) { this._uses.currentVal = Math.clamp(amt,0,this._uses.current); }
	}

	get maxUses () {
		return this._uses instanceof FillStat ? this._uses.current : undefined;
	}

	set maxUses (amt) {
		if (this.uses !== undefined) { this._uses.base = amt; }
	}

	refill () {
		if (this.uses !== undefined) { this._uses.refill(); }
	}

	get cd () {
		// Assumes _cd is a FillStat
		return this._cd === undefined ? undefined : this._cd.currentVal;
	}

	set cd (amt) {
		if (this.cd !== undefined) { this._cd.currentVal = Math.max(amt,0); }
	}

	get maxCD () {
		return this._cd === undefined ? undefined : this._cd.current;
	}

	set maxCD (amt) {
		if (this.cd !== undefined) { this._cd.base = amt; }
	}

	resetCD () {
		if (this.cd !== undefined) { this._cd.refill(); }
	}

	get warmup () {
		var val = this._warmup;
		if (val === undefined) {
			val = this.actionData.warmup;
		}
		if (val === undefined) {
			val = 0;
		}
		return val;
	}

	get enemyCD () {
		var val = this._enemyCD;
		if (val === undefined) {
			val = this.actionData.enemyCD;
		}
		if (val === undefined) {
			val = this.actionData.cooldown;
		}
		if (val === undefined) {
			val = false;
		}
		return val;
	}

	get nameCD () {
		return (this._nameCD || this.actionData.nameCD || this.name);
	}

	get setupAction () {
		//	String. Name of action that will be performed after this action following a delay specified by setupDelay.
		return (this._setupAction || this.actionData.setupAction || null);
	}

	set setupAction (val) {
		this._setupAction = val;
	}

	get setupDelay () {
		//	Positive integer. Number of turns that must elapse before a delayed action is performed.
		//	Assumes setupAction is defined; if not, will not be read.
		//	Defaults to 1 (action performed on next turn)
		var val = this._setupDelay;
		if (val === undefined) {
			val = this.actionData.setupDelay;
		}
		if (val === undefined || (!Number.isInteger(val) || val < 0)) {
			val = 1;
		}
		return val;
	}

	set setupDelay (val) {
		this._setupDelay = val;
	}

	get delayPersist () {
		//	Boolean. If true and this is a delayed action, the action will occur even if the user is dead or under a hold effect.
		var val = this._delayPersist;
		if (val === undefined) {
			val = this.actionData.delayPersist;
		}
		if (val === undefined) {
			val = false
		}
		return val;
	}

	get delayHold () {
		//	Boolean. If true and this is a delayed action, the user will not be able to act for the duration of the action's delay time.
		var val = this._delayHold;
		if (val === undefined) {
			val = this.actionData.delayHold;
		}
		if (val === undefined) {
			val = false
		}
		return val;
	}

	get delayMessage () {
		//	Function. Message printed at top of round when character is charging a delayed action.
		//	Must be attached to the delayed action, not the setup action.
		//	Set to null to display no message.

		var val = this._delayMessage;
		if (val === undefined) {
			val = this.actionData.delayMessage;
		}
		if (val === undefined) {
			val = function () {
				return `${subject().name} is preparing to use ${this.displayname}!`;
			};
		}
		return val;
	}

	get waitTime () {
		//	Whole integer. Number of ticks between selection and action execution.
		//	For use with the timeline system.

		var val = this._waitTime;
		if (val === undefined) {
			val = this.actionData.waitTime;
		}
		if (val === undefined) {
			val = 0;
		}
		return val;
	}

	set waitTime (val) {
		console.assert(Number.isInteger(val) && val >= 0,`ERROR: waitTime must be whole integer`);
		this._waitTime = val;
	}

	set recoveryTime (val) {
		console.assert(Number.isInteger(val) && val >= 0,`ERROR: recoveryTime must be whole integer`);
		this._recoveryTime = val;
	}

	get recoveryTime () {
		//	Whole integer. Number of ticks between action's execution and the user's next turn.
		//	For use with the timeline system.

		var val = this._recoveryTime;
		if (val === undefined) {
			val = this.actionData.recoveryTime;
		}
		if (val === undefined) {
			val = 0;
		}
		return (val instanceof Function) ? val(this) : val;
	}


	get targetMethod () {
		//	Function. Determines targeting logic for actions that must choose their own target, e.g. enemy and delayed actions.
		//	Return value is the target object.
		//	Defaults to targetEnemy, or targetAlly if the action's target property is "ally".

		var val = (this._targetMethod || this.actionData.targetMethod)
		if (!(val instanceof Function)) {
			if (this.target === "ally") {
				val = function () {
					return Hitlist.targetAlly(this.targetMod);
				};
			} else {
				val = function () {
					return Hitlist.targetEnemy(this.targetMod);
				};
			}
		}
		return val;
	}

	set targetMethod (val) {
		console.assert(val instanceof Function,`ERROR: targetMethod is not function`);
		this._targetMethod = val;
	}

	get targetMod () {
		//	Array of strings. Passed to targetMethod to customize targeting logic.

		var val = (this._targetMod || this.actionData.targetMod || []);
		if (!(val.includes("custom") || val.includes("random"))) {
			// add standard mods relevant to action unless bypassed with the "custom" mod
			// the "random" mod will also bypass this since it makes mods meaningless
			if (this.pierce === true) {
				val.pushUnique("pierce");
			}
			if (this.effweight > 0) {
				val.pushUnique("effect");
			}
			if (this.weight === 0) {
				val.pushUnique("ignore downed","ignore vulnerable");
			}
			if (this.noself === true) {
				val.pushUnique("noself");
			}
		}
		return val;
	}

	set invisible (val) {
		console.assert(typeof(val) === "boolean",`ERROR: invisible must be Boolean`);
		this._invisible = val;
	}

	get invisible () {
		//	Boolean. If true, action will not be displayed in the action list.
		//	By default, passive abilities are invisible if displayed in-battle, but not if viewed from the menu.

		var val = this._invisible;
		if (val === undefined) {
			val = this.actionData.invisible;
		}
		if (val === undefined) {
			val = V().inbattle && this.passive ? true : false;
		}
		return val;
	}

	set canTargetDead (val) {
		console.assert(typeof(val) === "boolean",`ERROR: canTargetDead must be Boolean`);
		this._canTargetDead = val;
	}

	get canTargetDead () {
		//	Boolean. If true, action can target dead actors in the Targeting Phase.
		//	(By default, dead characters cannot be targeted.)

		var val = this._canTargetDead;
		if (val === undefined) {
			val = this.actionData.canTargetDead;
		}
		if (val === undefined) {
			val = false;
		}
		return val;
	}

	set noReflection (val) {
		console.assert(typeof(val) === "boolean",`ERROR: noReflection must be Boolean`);
		this._noReflection = val;
	}

	get noReflection () {
		//	Boolean. If true, action will not trigger damage reflection.
		//	(Unless the target has the "absreflect" property.)

		var val = this._noReflection;
		if (val === undefined) {
			val = this.actionData.noReflection;
		}
		if (val === undefined) {
			val = false;
		}
		return val;
	}

	set spread (val) {
		console.assert(typeof(val) === "boolean",`ERROR: spread must be Boolean`);
		this._spread = val;
	}

	get spread () {
		//	Boolean. If true and this action has multiple hits, a new target will be chosen every hit.

		var val = this._spread;
		if (val === undefined) {
			val = this.actionData.spread;
		}
		if (val === undefined) {
			val = false;
		}
		return val;
	}

	set noRedundant (val) {
		console.assert(typeof(val) === "boolean",`ERROR: noRedundant must be Boolean`);
		this._noRedundant = val;
	}

	get noRedundant () {
		//	Boolean. If true and this action has multiple hits and this action is a spread action, this action may not target the same actor twice.

		var val = this._noRedundant;
		if (val === undefined) {
			val = this.actionData.noRedundant;
		}
		if (val === undefined) {
			val = false;
		}
		return val;
	}

	set unstoppable (val) {
		console.assert(typeof(val) === "boolean",`ERROR: unstoppable must be Boolean`);
		this._unstoppable = val;
	}

	get unstoppable () {
		//	Boolean. If true, action cannot be interrupted.

		var val = this._unstoppable;
		if (val === undefined) {
			val = this.actionData.unstoppable;
		}
		if (val === undefined) {
			val = false;
		}
		return val;
	}

	set area (val) {
		console.assert(typeof(val) === "string",`ERROR: area must be string`);
		this._area = val;
	}

	get area () {
		//	String. Denotes class of AoE, if the action contains an area of effect.

		return (this._area || this.actionData.area || "enemies");
	}

	set onApply (val) {
		console.assert(val instanceof Function,`ERROR: onApply is not function`);
		this._onApply = val;
	}

	get onApply () {
		return (this._onApply || this.actionData.onApply || function () { return; });
	}

	set onRemove (val) {
		console.assert(val instanceof Function,`ERROR: onRemove is not function`);
		this._onRemove = val;
	}

	get onRemove () {
		return (this._onRemove || this.actionData.onRemove || function () { return; });
	}

	set onUse (val) {
		console.assert(val instanceof Function,`ERROR: onUse is not function`);
		this._onUse = val;
	}

	get onUse() {
		//	Determines the effect abilities will have when used from the menu outside of battle. Optional.

    return (this._onUse || this.actionData.onUse || undefined);
  }

	set instantUse (val) {
		console.assert(typeof(val) === "boolean",`ERROR: instantUse must be Boolean`);
		this._instantUse = val;
	}

	get instantUse() {
		//	Boolean. If true, the action's onUse will be executed immediately, instead of requiring a target.
		//	This is useful for e.g. action that affect the whole party or call up another passage for more detailed interaction.

		return (this._instantUse || this.actionData.instantUse || false);
	}

	set toleranceDamage (val) {
		console.assert(Number.isInteger(val) && val > 0,`ERROR: toleranceDamage must be positive integer`);
		this._toleranceDamage = val;
	}

	get toleranceDamage() {
		//	Positive integer. If action inflicts an effect, it will reduce tolerance by this number.
		//	Defaults to 1.

		var val = this._toleranceDamage;
		if (val === undefined) {
			val = this.actionData.toleranceDamage;
		}
		if (val === undefined) {
			val = 1;
		}
		return val;
	}

	set hits (val) {
		console.assert(Number.isInteger(val) && val > 0,`ERROR: hits must be positive integer`);
		this._hits = val;
	}

	get hits() {
		//	Positive integer. Determines number of hits if attack hits multiple times.
		//	Defaults to 1.

		var val = this._hits;
		if (val === undefined) {
			val = this.actionData.hits;
		}
		if (val === undefined) {
			val = 1;
		}
		return (val instanceof Function) ? val(this) : val;
	}

	set effects (val) {
		console.assert(val instanceof Array,`ERROR: effects must be array`);
		this._effects = val;
	}

	get effects () {
		//	Array of strings. Name of effects that will be applied by the action.
		//		if single string is passed, it will be converted into a 1-element array
		//	Used in previews and as defaults for applyEffect.

		var result = (this._effects || this.actionData.effects || null);
		if (typeof(result) == "string") result = [result];
		return result;
	}

	//	Checks for action availability. Separate ones needed to customize UI feedback.
	//	A true return means the action FAILED the check and will be unavailable.

	standardCheck (actor) {
		//	Checks for EN cost, uses, cooldown, and crisis points.
		let subj = subject() || actor;
		return (subj.en < this.cost)
		|| (typeof(this.uses) == "number" && this.uses < 1)
		|| (typeof(this.cd) == "number" && this.cd !== 0)
		|| (this.used === true)
		|| (this.crisis && subject().crisisPoints < 100);
	}

	lockCheck (actor) {
		//	Checks if character is under a skill lock.
		let subj = subject() || actor;
		return (subj.skillLock && !this.basic);
	}

	HPCheck (actor) {
		//	Checks if character cannot pay the HP cost.
		let subj = subject() || actor;
		return (this.hpcost && subj.hp <= this.hpcost);
	}

	elementCheck (actor) {
		//	Checks that a character has a prior element stored for actions that need a prior element.
		let subj = subject() || actor;
		return (this.needsPriorElement && typeof(subj.lastUsed) !== "string");
	}

	check (actor) {
		return (this.standardCheck(actor) || this.lockCheck(actor) || this.HPCheck(actor) || this.elementCheck(actor));
	}

	toString () {
		//	Determines the default way actions are displayed in-game. Used with actionList.
		var subj = subject() || temporary().display;
		var energyPic = typeof(setup.energyPic) === "string" ? setup.energyPic : "energy.png";

	  var cRef = `<img src="${setup.ImagePath}/ui/waittime.png" />`;
	  var rRef = `<img src="${setup.ImagePath}/ui/recovertime.png" />`;
		var hRef = `<img src="${setup.ImagePath}/ui/hp_cost.png" />`;
	  var eRef = `<img src="${setup.ImagePath}/ui/${energyPic}" />`;

	  var text = `<span class="action-name">${this.name}</span>`;
	  if (typeof(this.cd) === "number" && this.cd !== 0) text += ` <span class="action-cooldown">[CD ${this.cd}]</span>`
	  if (this.uses !== undefined) text += ` <span class="action-uses">(Uses: ${this.uses}/${this.maxUses})</span>`;
	  var tags = "";
	  var cost = "";
	  if (this.crisis) tags += `<span class="crisis-tag">Crisis</span>`;
		for (let tag of this.tags) {
	    if (!setup.HIDDEN_TAGS.includes(tag)) tags += `<span>${tag.toUpperFirst()}</span>`;
	  }
	  if (this.passive) tags += `<span>Passive</span>`;
	  if (!V().inbattle && subj.defaultAction === this.name) tags += `<span><b>Default</b></span>`;
	  text += `<div class="action-tags">${tags}</div>`;
	  if (!this.passive && Number.isInteger(this.cost) && this.cost > 0) {
	    cost += `${eRef} `;
	    cost += this.cost;
	    if (this.phase === "Spell Phase") cost += `+`;
	    cost = `<div>${cost}</div>`;
	  } else {
	    cost = `<div><br/></div>`;
	  }
		if (this.hpcost > 0) {
			cost += `<div>${hRef} ${this.hpcost}</div>`
		}
	  if (Number.isInteger(this.waitTime) && this.waitTime > 0) {
	    let waitTime = this.waitTime;
	    let css = "";
	    if (subject() instanceof Actor && subject().get("Speed") !== 0) {
	      waitTime = Math.max(1,waitTime - subject().get("Speed"));
	      if (subject().get("Speed") > 0) {
	        css = "stat-raised";
	      } else {
	        css = "stat-lowered";
	      }
	    }
	    cost += `<div>${cRef} <span class="${css}">${waitTime}</span>s</div>`;
	  }
	  if (Number.isInteger(this.recoveryTime) && this.recoveryTime > 0) {
	    cost += `<div>${rRef} ${this.recoveryTime}s</div>`;
	  }
	  text += `<div class="action-cost">${cost}</div>`;
	  var data = this;
	  text += `<div class="action-info">${data.info}</div>`;
	  if (data.desc !== null) text += `<div class="action-desc">${data.desc}</div>`;
	  return text;
  }

	printCompressed () {
		//	Determines the display for compressed actions.
		//	By default, this strips tags, info, and description.

		var energyPic = typeof(setup.energyPic) === "string" ? setup.energyPic : "energy.png";
		var eRef = `<img src="${setup.ImagePath}/ui/${energyPic}" />`;

	  var text = `<span class="action-name">${this.name}</span>`;
	  var cost = "";
	  if (this instanceof ItemAction && !this.crisis) {
	    cost += `x${inv().get(this.name).stock}`;
	  } else if (!this.passive && Number.isInteger(this.cost) && this.cost > 0) {
	    cost += `${eRef} `;
	    cost += this.cost;
	    if (this.phase === "Spell Phase") cost += `+`;
	    cost = `<div>${cost}</div>`;
	  } else {
	    cost = `<div><br/></div>`;
	  }
	  text += `<span class="action-cost">${cost}</span>`;
	  return text;
	}

	clone () {
		// Return a new instance containing our current data.
		return new Action(this);
	}

	toJSON () {
		// Return a code string that will create a new instance
		// containing our current data.
		const data = {};
		Object.keys(this).forEach(pn => data[pn] = clone(this[pn]));
		return JSON.reviveWrapper('new Action($ReviveData$)', data);
	}
};

window.ItemAction = class ItemAction extends Action {
	constructor(name){
		super(name);
		if (typeof(name) === 'string') {
			this._item = true;
		}
	}

	get useText() {
      return (this._useText || this.actionData.useText || null);
  }

	get actText() {
    return (this._actText || this.actionData.actText ||
			function () {
				var article;
				if (this.name) {
					switch (this.name.charAt(0).toLowerCase()){
						case 'i':
						case 'e':
						case 'o':
						case 'u':
						case 'a':
							article = 'an';
							break;
						default:
							article = 'a';
					}
				return `$subject.name uses ${article} ${this.name}.`;
				}
			}
			|| null);
  }

	get source() {
		//	The item from which the ItemAction comes. Defaults to the action's name.

		return (this.actionData.source || this.name);
	}

	standardCheck (i) {
		var inventory = (i || inv());
		return (inventory.get(this.source).stock < 1);
	}

	toString () {
		//	Determines the default way actions are displayed in-game. Used with actionList.
		var subj = subject() || temporary().display;

    var text = `<span class="action-name">${this.name}</span>`;
		var tags = "";
    if (!this.crisis) {
      tags += `x${inv().get(this.source).stock}`;
    }
    text += `<span class="action-cost">${tags}</span>`;
    var data = new Item(this.source);
    text += `<div class="action-info">${data.info}</div>`;
    if (data.desc !== null) text += `<div class="action-desc">${data.desc}</div>`;
		console.log(text);
    return text;
  }

	printCompressed () {
		//	Determines the display for compressed actions.
		//	By default, this strips tags, info, and description.

		var text = `<span class="action-name">${this.name}</span>`;
		var tags = "";
    if (!this.crisis) {
      tags += `x${inv().get(this.source).stock}`;
    }
    text += `<span class="battle-stock">${tags}</span>`;
		return text;
	}

	clone () {
		// Return a new instance containing our current data.
		return new ItemAction(this);
	}

	toJSON () {
		// Return a code string that will create a new instance
		// containing our current data.
		const data = {};
		Object.keys(this).forEach(pn => data[pn] = clone(this[pn]));
		return JSON.reviveWrapper('new ItemAction($ReviveData$)', data);
	}
};

setup.actionData = {};
