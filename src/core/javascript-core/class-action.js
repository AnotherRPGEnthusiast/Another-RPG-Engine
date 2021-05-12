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

	get preview() {
		//	Function. Pre-calculates the effect of the action and provides the result to the player in the confirm phase.

    var val = this._preview;
		if (val === undefined) {
			val = this.actionData.preview;
		}
		if (val === undefined) {
			val = Prev.dmg;
		}
		return val;
  }

	set preview (val) {
		console.assert(val instanceof Function,`ERROR: preview is not function`);
		this._preview = val;
	}

	get useText() {
		//	Text to be displayed above actText. Usually provides the name of the action.
		//	Set to null to remove this section from the action display entirely.

		var val = this._useText;
		if (val === undefined) {
			val = this.actionData.useText;
		}
		if (val === undefined) {
			val = `$B.subject.name uses "${this.name}".`;
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

	get spellMod() {
		//	Function. Called in the spell phase to modify the action if the action's spell attribute is true.

    return (this._spellMod || this.actionData.spellMod || "ERROR SPELLMOD UNDEFINED");
  }

	get phase () {
		//	String. Phase that the player will be forwarded to when the action is selected.
		//	Must match one of the phase passage names EXACTLY.

		return (this._phase || this.actionData.phase || "targeting phase");
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
			val = 0;
		}
		return (val instanceof Function) ? val(this) : val;
	}

	set weight (val) {
		this._weight = val;
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
			val = this.actionData.basic;
		}
		if (val === undefined) {
			val = false;
		}
		return val;
	}

	set basic (val) {
		this._basic = val;
	}

	get instant () {
		//	If true, does not end the user's turn.

		var val = this._instant;
		if (val === undefined) {
			val = this.actionData.instant;
		}
		if (val === undefined) {
			val = false;
		}
		return val;
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
		return val;
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
		return val;
	}

	get element () {
		//	String or Array. Elemental affinity of the action. See damage formula for details.

		var val = this._element;
		if (val === undefined) {
			val = this.actionData.element;
		}
		if (val === undefined) {
			val = null;
		}
		if (typeof(val) == "string") {
			if (!setup.ELEMENT_LIST.includes(val)) {
				console.log(`ERROR: ${this.name} has illegal element`);
				return null;
			} else {
				return val.toLowerCase();
			}
		} else if (val instanceof Array) {
			for (let elm of val) {
				if (!(typeof(elm) == "string" && setup.ELEMENT_LIST.includes(elm))) {
					console.log(`ERROR: ${this.name} has illegal element`);
					return null;
				}
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
		//	If true, action will not display any text during the action phase. Effects will still trigger, but the player will be auto-forwarded to the next phase.

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
		return this._uses === undefined ? undefined : this._uses.currentVal;
	}

	set uses (amt) {
		if (this.uses !== undefined) { this._uses.currentVal = Math.clamp(amt,0,this._uses.current); }
	}

	get maxUses () {
		return this._uses === undefined ? undefined : this._uses.current;
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
		if (val === undefined || (!Number.isInteger(val) || val <= 0)) {
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
				return `$B.subject.name uses ${article} ${this.name}.`;
				}
			}
			|| null);
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
