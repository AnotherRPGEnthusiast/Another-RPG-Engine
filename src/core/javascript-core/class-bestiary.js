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
