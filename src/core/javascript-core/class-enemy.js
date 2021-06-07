window.Enemy = class Enemy extends Actor {
	constructor(name){
	if (typeof(name) == 'object'){
		super(name);
	}
	else {
		super(name);

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
		} else if (action().ranged || Hitlist.guardCheck(this).id === this.id) {
			//	For battle map: If guardCheck returns this (not guarded by anyone), valid target
			//	Bypassed if using a ranged action, which can hit anyone
			return true;
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

window.BestiaryEntry = class BestiaryEntry {
	constructor(name,enemy){
	//	name: String, name of database entry
	//	enemy: Object, associated data from enemy database

	if (typeof(name) === "string"){
		this.name = name;
		this.encountered = false;
		this.defeated = 0;
		this.statsKnown = {
			"hp": false,
			"gp": false,
			"xp": false
		};
		this.tolerancesKnown = {};

		if (enemy.stats !== undefined) {
			for (let stat in enemy.stats) {
				this.statsKnown[stat] = false;
			}
		}
		if (setup.ELEMENT_LIST !== undefined) {
			setup.ELEMENT_LIST.forEach(function (elmn) {
				this.statsKnown[elmn] = false;
			},this);
			this.elementData = this.access().elements;
		}
		if (enemy.tolerances !== undefined) {
			for (let tolerance in enemy.tolerances) {
				this.tolerancesKnown[tolerance] = false;
			}
		}

		if (enemy.alts !== undefined) {
			this.altSkin = null;
			this.altsKnown = {};
			enemy.alts.forEach(function (alt) {
				this.altsKnown[alt] = false;
			},this);
		}
	}
	else {
		Object.keys(name).forEach(prop => this[prop] = clone(name[prop]));
	}

	}

	get data () {
		return (setup.enemyData[this.altSkin] || setup.enemyData[this.name]);
	}

	get baseData () {
		return setup.enemyData[this.name];
	}

	get bestiaryNo () {
		return setup.enemyData[this.name].bestiaryNo;
	}

	get desc () {
		return (this.data.desc || this.access().desc);
	}

	get abilityInfo () {
		return (this.data.abilityInfo || this.baseData.abilityInfo || "Pending.");
	}

	get itemDrops () {
		return (this.data.itemDrops || {});
	}

	get (stat) {
		//	stat = String, assumes valid match for entry in statsKnown

		console.assert(typeof(stat) == "string","ERROR in BestiaryEntry.get(): stat argument "+stat+" is not a string");
		if (this.statsKnown[stat] === true) {
			let s = stat.toLowerCase();
			if (s == 'hp' || s == 'gp' || s == 'xp') {
				return (this.data[s] || this.baseData[s] || 0);
			} else if (setup.ELEMENT_LIST.includes(s)) {
				return this.elementData[s];
			} else {
				let statData = (this.data.stats || this.baseData.stats);
				if (typeof(statData) == 'object') {
					return (statData[stat] || this.baseData.stats[stat]);
				} else {
					console.log("ERROR in BestiaryEntry.get(): database entry has no stat object");
					return;
				}
			}
		} else {
			return "???";
		}
	}

	revealAll () {
		//	Sets all data flags to true, allowing all information to be displayed to the player

		this.encountered = true;
		for (let pn in this.statsKnown) {
			this.statsKnown[pn] = true;
		}
		if (Object.keys(this.tolerancesKnown).length > 0) {
			for (let pn in this.tolerancesKnown) {
				this.tolerancesKnown[pn] = true;
			}
		}
	}

	access () {
		//	Creates an Enemy object with the same name as the BestiaryEntry.
		//	Use to access specific Enemy functions needed for displaying data.

		return new Enemy(this.name);
	}

	clone () {
		// Return a new instance containing our current data.
		return new BestiaryEntry(this);
	}

	toJSON () {
		// Return a code string that will create a new instance
		// containing our current data.
		const data = {};
		Object.keys(this).forEach(pn => data[pn] = clone(this[pn]));
		return JSON.reviveWrapper('new BestiaryEntry($ReviveData$)', data);
	}
}

window.Bestiary = class Bestiary extends Array {
	constructor(foo) {
	if (typeof(foo) == 'object'){
		super(0);
		Object.keys(foo).forEach(prop => this[prop] = clone(foo[prop]));
	}
	else {
		super(0);
		for (let [name,enemy] of Object.entries(setup.enemyData)) {
			if (typeof(enemy.bestiaryNo) == "number") {
				this.push(new BestiaryEntry(name,enemy));
			}
		}
		this.sort(function (a,b) { return a.bestiaryNo - b.bestiaryNo});
	}
	}

	fetch (name) {
		//	name = String, assumes Bestiary contains matching name

		console.assert(typeof(name) == "string","ERROR in Bestiary.fetch(): non-string argument passed");

		return this.find(function (e){ return e.name === name; });
	}

	encountered () {
		//	Returns array of only encountered enemies

		return this.filter(function (e) { return e.encountered === true; });
	}

	nextEntry (index) {
		//	index = nonnegative integer
		//	finds the next entry in the Bestiary that has been encountered

		if (index+1 >= this.length) {
			//	If out of bounds, loop around, start from beginning
			index = -1;
		}
		for (let i = index+1; i < this.length; i++) {
			if (this[i].encountered === true) {
				return this[i];
			}
		}
		return this[index];
	}

	lastEntry (index) {
		//	index = nonnegative integer
		//	finds the previous entry in the Bestiary that has been encountered

		if (index-1 < 0) {
			//	If out of bounds, loop around, start at end
			index = this.length;
		}
		for (let i = index-1; i >= 0; i--) {
			if (this[i].encountered === true) {
				return this[i];
			}
		}
		return this[index];
	}

	clone () {
		// Return a new instance containing our current data.
		return new Bestiary(this);
	}

	toJSON () {
		// Return a code string that will create a new instance
		// containing our current data.
		const data = {};
		Object.keys(this).forEach(pn => data[pn] = clone(this[pn]));
		return JSON.reviveWrapper('new Bestiary($ReviveData$)', data);
	}
};
