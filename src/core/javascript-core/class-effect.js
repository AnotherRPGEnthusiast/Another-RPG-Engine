window.Effect = class Effect {
	constructor(name,time,power,special){
		if (typeof(name) == 'object'){
			Object.keys(name).forEach(prop => this[prop] = clone(name[prop]));
		}
		else {
			special = (special || {});
			this.name = name;
			this.duration = Number.isInteger(time) ? time : 1;
			this.power = typeof(power) == 'number' ? power : 0;
			if (Number.isInteger(this.effectData.uses)) {
				this.uses = this.effectData.uses;
			}
			if (special.weight) {
				this.weight = special.weight;
			}
			if (special.target instanceof Actor) {
				this.target = special.target;
			}
		}
	}

	get effectData () {
		return (setup.effectData[this.name] || {});
	}

	get duration () {
		return this._duration;
	}

	set duration (amt) {
		this._duration = Math.min(amt,setup.DURATION_MAX);
	}

	get info () {
		return (this._info || this.effectData.info || function () { return "Unknown."; });
	}

	get addText () {
		return (this._addText || this.effectData.addText || function (target) { return `${target} is afflicted with <b>${this.name}</b>!`; });
	}

	get removeText () {
		return (this._removeText || this.effectData.removeText || function (target) { return `${target} is cured of ${this.name}.`; });
	}

	get onApply () {
		return (this._onApply || this.effectData.onApply || function () { return; });
	}

	get onRemove () {
		return (this._onRemove || this.effectData.onRemove || function () { return; });
	}

	get dmgtype () {
		return (this._dmgtype || this.effectData.dmgtype || function () { return 0; });
	}

	get msg () {
		return (this._msg || this.effectData.msg || function () { return null; });
	}

	get buff () {
		var val = this._buff;
		if (val === undefined) {
			val = this.effectData.buff;
		}
		if (val === undefined) {
			val = false;
		}
		return val;
	}

	get stackable () {
		var val = this._stackable;
		if (val === undefined) {
			val = this.effectData.stackable;
		}
		if (val === undefined) {
			val = false;
		}
		return val;
	}

	get exclusive () {
		var val = this._exclusive;
		if (val === undefined) {
			val = this.effectData.exclusive;
		}
		if (val === undefined) {
			val = false;
		}
		return val;
	}

	get statmod () {
		var val = this._statmod;
		if (val === undefined) {
			val = this.effectData.statmod;
		}
		if (val === undefined) {
			val = false;
		}
		return val;
	}

	get dot () {
		var val = this._dot;
		if (val === undefined) {
			val = this.effectData.dot;
		}
		if (val === undefined) {
			val = false;
		}
		return val;
	}

	get shield () {
		var val = this._shield;
		if (val === undefined) {
			val = this.effectData.shield;
		}
		if (val === undefined) {
			val = false;
		}
		return val;
	}

	get hold () {
		var val = this._hold;
		if (val === undefined) {
			val = this.effectData.hold;
		}
		if (val === undefined) {
			val = false;
		}
		return val;
	}

	get untargetable () {
		var val = this._untargetable;
		if (val === undefined) {
			val = this.effectData.untargetable;
		}
		if (val === undefined) {
			val = false;
		}
		return val;
	}

	get uncontrollable () {
		var val = this._uncontrollable;
		if (val === undefined) {
			val = this.effectData.uncontrollable;
		}
		if (val === undefined) {
			val = false;
		}
		return val;
	}

	get healBlock () {
		var val = this._healBlock;
		if (val === undefined) {
			val = this.effectData.healBlock;
		}
		if (val === undefined) {
			val = false;
		}
		return val;
	}

	get block () {
		var val = this._block;
		if (val === undefined) {
			val = this.effectData.block;
		}
		if (val === undefined) {
			val = false;
		}
		return val;
	}

	get blockCondition () {
		return (this._blockCondition || this.effectData.blockCondition || function () { return false });
	}

	get blockText () {
		return (this._blockText || this.effectData.blockText || function () { return `BLOCK TEXT FOR ${this.name} UNSET` });
	}

	get topDec () {
		var val = this._topDec;
		if (val === undefined) {
			val = this.effectData.topDec;
		}
		if (val === undefined) {
			val = false;
		}
		return val;
	}

	get sticky () {
		var val = this._sticky;
		if (val === undefined) {
			val = this.effectData.sticky;
		}
		if (val === undefined) {
			val = false;
		}
		return val;
	}

	get ULTIMATESTICKY () {
		var val = this._ULTIMATESTICKY;
		if (val === undefined) {
			val = this.effectData.ULTIMATESTICKY;
		}
		if (val === undefined) {
			val = false;
		}
		return val;
	}

	get unblockable () {
		var val = this._unblockable;
		if (val === undefined) {
			val = this.effectData.unblockable;
		}
		if (val === undefined) {
			val = false;
		}
		return val;
	}

	get persistAfterDeath () {
		var val = this._persistAfterDeath;
		if (val === undefined) {
			val = this.effectData.persistAfterDeath;
		}
		if (val === undefined) {
			val = false;
		}
		return val;
	}

	get persistAfterBattle () {
		var val = this._persistAfterBattle;
		if (val === undefined) {
			val = this.effectData.persistAfterBattle;
		}
		if (val === undefined) {
			val = false;
		}
		return val;
	}

	get weight () {
		return (this._weight || this.effectData.weight || 0);
	}

	set weight (amt) {
		this._weight = amt;
	}

	get shock () {
		// integer between 1 and 100, equal to chance of being cured by direct damage from attacks.
		// value of true is equivalent to 100% chance.
		// if noninteger, will default to Boolean false
		var result = (this._shock || this.effectData.shock || false);
		if (Number.isInteger(result)) {
			return Math.clamp(result,1,100);
		}
		else if (result === true) {
			return 100;
		}
		else {
			return false;
		}
	}

	get holdAction () {
		return (this._holdAction || this.effectData.holdAction || null);
	}

	get priority () {
		//	Integer. Order for which hold effects get resolved first. Lower numbers are resolved earlier.
		//	Defaults to 0.

		var val = this._priority;
		if (!Number.isInteger(val)) {
			val = this.effectData.priority;
		}
		if (!Number.isInteger(val)) {
			val = 0;
		}
		return val;
	}

	get onHit () {
		return (this._onHit || this.effectData.onHit || null);
	}

	get uses () {
		return this._uses;
	}

	set uses (amt) {
		//	Tracks uses for shield effects. Each use will block/interact with one attack. When uses are exhausted, the effect is removed.
		//	Currently there is no easy way to track the character an effect is attached to from within the effect, so this always removes the effect from the target, as this should only be changing when a character is the target of an attack.

		this._uses = amt;
		if (this.uses <= 0) {
			console.log("uses dropped to 0, should remove effect");
			target().removeEffect(this.name,{unsticky: true, pierce: true, noPopup: true});
		}
	}

	get synonym () {
		//	String. If defined, effect will be blocked by the tolerance matching this name rather than its own.
		//	Must match an extant tolerance value EXACTLY.

		return (this._synonym || this.effectData.synonym || false);
	}

	get threat () {
		//	Number. Added to weighting when selecting targets for dispelling.
		//	Defaults to 1.

		var val = this._threat;
		if (typeof(val) !== "number") {
			val = this.effectData.threat;
		}
		if (typeof(val) !== "number") {
			val = 1;
		}
		if (this.duration < 0) {
			val *= setup.INDEFINITE_EFFECT_MULTIPLIER;
		} else {
			val += ((this.duration-1)/setup.EFFECT_THREAT_CUT);
		}
		return val;
	}

	get unique () {
		//	Boolean. If true, only one instance of this effect can exist per party.

		var val = this._unique;
		if (val === undefined) {
			val = this.effectData.unique;
		}
		if (val === undefined) {
			val = false;
		}
		return val;
	}

	get guardBreak () {
		//	Boolean. If true, characters with this effect cannot guard characters behind them in the battle map.

		var val = this._guardBreak;
		if (val === undefined) {
			val = this.effectData.guardBreak;
		}
		if (val === undefined) {
			val = false;
		}
		return val;
	}

	get skillLock () {
		//	Boolean. If true, this effect will prevent the victim from using non-basic actions.

		var val = this._skillLock;
		if (val === undefined) {
			val = this.effectData.skillLock;
		}
		if (val === undefined) {
			val = false;
		}
		return val;
	}

	damage (actor) {
		console.assert(this.dot,`ERROR in effect ${this.name}: damage function called on non-DoT`);
		var dmg = Math.round(this.dmgtype(actor));
		if (dmg < setup.min_DoT){
			dmg = setup.min_DoT;
		}
		return dmg;
	}

	decay (actor) {
		if (this.duration >= 1 && !(actor.stasis && this.name != "Stasis")) {
      this.duration -= 1;
		}
		if (this.duration == 0) {
      var m = actor.removeEffect(this,{pierce: true, unsticky: "ultimate", noPopup: true});
			if (m.length > 1) {
				State.temporary.message = true;
			}
			return m;
		} else {
			return "";
		}
	}
}

Effect.prototype.clone = function () {
	// Return a new instance containing our current data.
	return new Effect(this);
};

Effect.prototype.toJSON = function () {
	// Return a code string that will create a new instance
	// containing our current data.
	const data = {};
	Object.keys(this).forEach(pn => data[pn] = clone(this[pn]));
	return JSON.reviveWrapper('new Effect($ReviveData$)', data);
};
