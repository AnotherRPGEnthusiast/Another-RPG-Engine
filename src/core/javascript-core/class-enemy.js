window.Enemy = class Enemy extends Actor {
	constructor(name,pos){
	if (typeof(name) == 'object'){
		super(name,pos);
	}
	else {
		super(name,pos);

		if (this.data.cooldown) { this.cd = new Map(Object.entries(this.data.cooldown)); }
		this._noAttacks = Number.isInteger(this.data.noAttacks) && this.data.noAttacks > 0
			? new FillStat(this.data.noAttacks)
			: new FillStat(1);
		if (this.data.specialInit) { this.data.specialInit(this); }

		if (setup.THREAT_TARGETING === true) {
			this.threat = new Map();
			puppets().forEach(function(puppet) {
				this.threat.set(puppet.name,puppet.initialThreat());
			}, this);
		}

		if (this.boss === undefined) { this.boss = false; }
		if (this.aggro === undefined) { this.aggro = false; }
	}
	}

	decCD () {
		if (this.cd !== undefined){
			this.cd.forEach(function(v,k){
				this.cd.inc(k,-1);
			}, this);
		}
	}

	CDcheck (key) {
		return (this.cd.get(key) <= 0);
	}

	get actions () {
		return (this._actions || this.data.actions || null);
	}

	get priority () {
		var r;
		if (this._priority !== undefined) {
			r = this._priority;
		} else if (this.data.priority !== undefined) {
			r = this.data.priority;
		}
		return Number.isInteger(r) ? r : enemies().indexOf(this);
	}

	set xp (num) {
		console.assert(Number.isInteger(num) && num > 0,`ERROR in xp setter: must be positive integer`);
		this._xp = num;
	}

	get xp () {
		var r;
		if (this._xp !== undefined) {
			r = this._xp;
		} else if (this.data.xp !== undefined) {
			r = this.data.xp;
		}
		return Number.isInteger(r) ? r : 0;
	}

	get XP () {
		return this.xp;
	}

	set gp (num) {
		console.assert(Number.isInteger(num) && num > 0,`ERROR in gp setter: must be positive integer`);
		this._gp = num;
	}

	get gp () {
		var r;
		if (this._gp !== undefined) {
			r = this._gp;
		} else if (this.data.gp !== undefined) {
			r = this.data.gp;
		}
		return Number.isInteger(r) ? r : 0;
	}

	get GP () {
		return this.gp;
	}

	get itemDrops () {
		//	Item drop table. Drop tables should be in the format of objects, with the item names as properties and their drop rate in integer percentage as values.

		return (this._itemDrops || this.data.itemDrops || {});
	}

	get mercy () {
		if (this._mercy !== undefined) {
			return this._mercy;
		} else if (this.data.mercy !== undefined) {
			return this.data.mercy;
		} else {
			return 3;
		}
	}

	get noAttacks () {
		return this._noAttacks.currentVal;
	}

	set noAttacks (amt) {
		this._noAttacks.currentVal = amt;
	}

	get isFirstAction () {
		//	Boolean, for enemies that take multiple actions per round; returns true if enemy has not yet performed any action this round

		return (!this.dead && V().B.actionsThisTurn[this.id] instanceof Array && V().B.actionsThisTurn[this.id].length == 0);
	}

	get surrender () {
		//	function, determines behavior if spared

		return (this._surrender || this.data.surrender || false);
	}

	get surrenderFail () {
		//	function, determines behavior if surrender violated

		return (this._surrenderFail || this.data.surrenderFail || false);
	}

	get noBestiary () {
		//	if true, enemy will not have a bestiary entry
		//	useful for abstract database entries e.g. form changes

		return (this.data.noBestiary || false);
	}

	get desc () {
		//	String, description to be displayed in the bestiary entry.

		return (this.data.desc || "Description goes here. Lorem ipsum dolor sit amen. This is a sentence. Filler text.");
	}

	get actionsThisTurn () {
		try {
			return V().B.actionsThisTurn[this.id];
		} catch (e) {
			return [];
		}
	}

	changeInto (name) {
		// Alters character attributes for mid-battle changes. By default, checks for HP, stat, and action changes.

		if (setup.enemyData[name].hp) {
			this.setMaxHP(setup.enemyData[name].hp);
		}
		if (setup.enemyData[name].stats) {
			for (let [pn,v] of Object.entries(setup.enemyData[name].stats)) {
				this.setBase(pn,v);
			}
		}
		if (setup.enemyData[name].actions) {
			this._actions = setup.enemyData[name].actions;
		}

		if (setup.enemyData[name].special) {
			// for any miscellaneous changes, specify them in a "special" function
			setup.enemyData[name].special(this);
		}
	}

	surrenderCheck () {
		if (this.surrenderFail() !== undefined && !action().truce) {
			return "\n" + this.surrenderFail();
		}
		return;
	}

	validTarget () {
		//	Returns Boolean. Determination for if character can be selected by the player in targeting phase.
		//	To customize, use Object.defineProperty.

		if (!(V().B.targeting === "all" || V().B.targeting === "enemy")) {
			//	If not targeting enemies, invalid target
			return false;
		} else if (this.dead && !action().canTargetDead) {
			//	If this actor is dead, invalid target UNLESS action canTargetDead
			return false;
		} else if (this.martyr) {
			//	If martyr, valid target
			return true;
		}
		let martyr = this.ownParty.find(function (a) { return a && a.martyr === true });
		if (martyr) {
			//	If a martyr exists and they're not this, invalid target
			return false;
		} else if (this.untargetable) {
			//	If untargetable, invalid target
			return false;
		} else if (Hitlist.guardCheck(this).id !== this.id) {
			//	For battle map: If guardCheck returns this (not guarded by anyone), valid target
			//	Bypassed if using a ranged action, which can hit anyone
			return false;
		} else {
			return true;
		}
	}

	clone () {
		// Return a new instance containing our current data.
		return new Enemy(this);
	}

	toJSON () {
		// Return a code string that will create a new instance
		// containing our current data.
		const data = {};
		Object.keys(this).forEach(pn => data[pn] = clone(this[pn]));
		return JSON.reviveWrapper('new Enemy($ReviveData$)', data);
	}
};
