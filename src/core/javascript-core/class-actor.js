window.Actor = class Actor {
	constructor(name){
	if (typeof(name) == 'object'){
		Object.keys(name).forEach(prop => this[prop] = clone(name[prop]));
	}
	else {
		if (this instanceof Puppet) {
			this.id = "p";
		} else if (this instanceof Enemy) {
			this.id = "e";
		} else {
			this.id = "_";
		}
		this.id += (new Date().getTime() + Math.random() * 0x10000000000).toString(16);

		this.name = name;

		if (this.data) {
			this._HPregen = {
				"flat": new Stat(0),
				"percent": new Stat(0)
			}
			this.elements = new Map();
			if (setup.ELEMENT_LIST !== undefined){
				setup.ELEMENT_LIST.forEach(function(x) {
					this.elements.set(x,{"percent": new Stat(1), "flat": new Stat(0)});
				}, this);
			}
			this.tolerances = new Map();
			if (setup.effectData !== undefined){
				Object.keys(setup.effectData).forEach(function(x) {
					this.tolerances.set(x,new Tolerance(0));
				}, this);
			}

			this._maxhp = new Stat(this.data.hp);
			this._hp = this.data.hp;
			this.stats = {};
			for (let [pn,v] of Object.entries(this.data.stats)) {
				this.stats[pn] = new Stat(v);
			}
			if (this.data.elements) { this.setElements(Object.entries(this.data.elements),"percent"); }
			if (this.data.tolerances) { this.setTol(Object.entries(this.data.tolerances)); }
			Number.isInteger(this.data.retaliations) ?
				this._retaliations = new FillStat(this.data.retaliations) : this._retaliations = new FillStat(0);
			Number.isInteger(this.data.respawn) ?
				this._respawn = new FillStat(this.data.respawn) : this._respawn = new FillStat(0);
			if (typeof(this.data.respawnHP) === "number") { this._respawnHP = this.data.respawnHP; }

			this.battleMsg = [];	// container for popups that will appear during actions

			this.isDone = false;
			this.dead = false;
			this.protectedBy = null;
			this.effects = [];
			this.onHit = [];
			this.lastDmg = 0;

			this.equipment = new Map();
			var equipData;
			equipData = (typeof(this.equipSlots) == "object")
				? equipData = this.equipSlots
				: equipData = setup.DEFAULT_EQUIP_SLOTS;

			for (let [pn,v] of Object.entries(equipData)) {
				this.equipment.set(pn,new Array(v).fill(null));
			}
		}
		else if (name !== "Dummy") {
			console.log("ERROR: Actor "+name+" is not in database");
			this.name = "INVALID ACTOR";
			this._hp = 1;
			this._maxhp = new Stat(1);
		}
	}
	}

	// GETTERS/SETTERS

	get idname () {
		return (this._idname || this.name);
	}

	get data () {
		if (this instanceof Puppet) {
			return (setup.puppetData[this.idname] || false);
		}
		else if (this instanceof Enemy) {
			return (setup.enemyData[this.idname] || false);
		}
		else {
			return undefined;
		}
	}

	get ownParty () {
		switch (this.id.charAt(0)) {
			case 'p':
				return V().puppets;
			case 'e':
				return V().enemies;
			default:
				console.log("ERROR in ownParty: invalid ID type");
				return V().B.actors;
		}
	}

	get otherParty () {
		switch (this.id.charAt(0)) {
			case 'p':
				return V().enemies;
			case 'e':
				return V().puppets;
			default:
				console.log("ERROR in otherParty: invalid ID type");
				return V().B.actors;
		}
	}

	get fullname () {
		return (this._fullname || this.data.fullname || this.name || false);
	}

	get equipSlots () {
		return (this._equipSlots || this.data.equipSlots || undefined);
	}

	get dead () {
		return this._dead;
	}

	set dead (flag) {
		if (typeof(flag) == 'boolean') {
			this._dead = flag;
			// reset respawn if it exists (happens on both defeat and revival)
			if (this.respawn !== undefined) {
				this._respawn.refill();
			}
			// erase delayed action on death UNLESS the action persists past user death
			if (!this.actionReady) {
				this.delayedAction = null;
			}
			// reset threat (if using threat targeting)
			if (setup.THREAT_TARGETING === true && this instanceof Puppet && V().inbattle) {
				if (flag === true) {
					enemies().forEach(function(enemy) {
						enemy.threat.forEach(function(v,k) {
							if (k == this.name) {
								enemy.threat.set(k,0);
							}
						}, this);
					}, this);
				} else if (flag === false) {
					enemies().forEach(function(enemy) {
						enemy.threat.forEach(function(v,k) {
							if (k == this.name) {
								enemy.threat.set(k,this.initialThreat());
							}
						}, this);
					}, this);
				}
			}
		}
		else {
			console.log("ERROR: death flag setter passed non-Boolean value");
		}
	}

	get noact () {
		//	Checks if the Actor is under a hold effect.
		//	If hold effect found, will return a truthy value, else will return a falsy value.

		return this.effects.find(function(eff) { return eff && eff.hold });
	}

	get untargetable () {
		//	Checks if the Actor is under an untargetable effect.
		//	If untargetable effect found, will return a truthy value, else will return a falsy value.

		return this.effects.find(function(eff) { return eff && eff.untargetable });
	}

	get uncontrollable () {
		//	Checks if the Actor is under a loss-of-control effect.
		//	If uncontrollable effect found, will return a truthy value, else will return a falsy value.

		return this.effects.find(function(eff) { return eff && eff.uncontrollable });
	}

	get hp () {
		return this._hp;
	}

	set hp (amt) {
		if (setup.ANIMATIONS && V().inbattle && this.displayHP === this.hp) {
			this.displayHP = this.hp;
		}
		this._hp = Math.clamp(amt,0,this.maxhp);
	}

	get maxhp () {
		return this._maxhp.current;
	}

	set maxhp (amt) {
		this._maxhp.base = amt;
	}

	updateHP () {
		// used for matching current HP to changes in max HP, e.g. HP-boosting equipment
		if (!(this instanceof Puppet && V().lastingDamage)) {
			this.hp = this.maxhp;
		}
	}

	get HPregen () {
		return this._HPregen;
	}

	get HPregenFlat () {
		return this._HPregen.flat.current;
	}

	set HPregenFlat (amt) {
		this._HPregen.flat.base = amt;
	}

	get HPregenPercent () {
		return this._HPregen.percent.current;
	}

	set HPregenPercent (amt) {
		this._HPregen.percent.base = amt;
	}

	get displayHP () {
		return (this._displayHP || this.hp);
	}

	set displayHP (amt) {
		this._displayHP = Math.clamp(amt,0,this.maxhp);
	}

	get lastDmg () {
		return this._lastDmg;
	}

	set lastDmg (val) {
		console.assert(typeof(val) == "number",`ERROR: lastDmg must be number`);
		this._lastDmg = val;
	}

	// Respawn functions. These assume respawn time is a FillStat.

	get maxRespawn () {
		if (this._respawn === undefined) {
			return undefined;
		} else {
			return this._respawn.current;
		}
	}

	set maxRespawn (amt) {
		if (this._respawn === undefined) {
			this._respawn = new FillStat(amt);
		} else {
			this._respawn.base = amt;
		}
	}

	get respawn () {
		if (this._respawn === undefined) {
			return undefined;
		} else {
			return this._respawn.currentVal;
		}
	}

	set respawn (amt) {
		this._respawn.currentVal = Math.clamp(amt,0,this.maxRespawn);
	}

	get respawnHP () {
		// Number between 0 and 1. Proportion of max HP restored on a respawn.

		var val = (this._respawnHP || setup.RESPAWN_HP);
		return Math.clamp(val,0,1);
	}

	get respawnMessage () {
		return (this._respawnMessage || this.data.respawnMessage || `${this.name} respawns!`)
	}

	resetRespawn () {
		if (this.respawn !== undefined) {
			this._respawn.refill();
		}
	}

	setHP (amt) {
		// Relative setter: keeps HP within bounds on damage or heal
		// DEPRECIATED as of version 1.12; use the hp setter instead.
		this._hp = Math.clamp(this.hp + amt,0,this.maxhp);
	}

	setMaxHP (amt) {
		// Absolute setter: for when both HP and max HP need to be set simultaneously, e.g. form changes.
		this.maxhp = amt;
		this.hp = amt;
	}

	get (key) {
		// calculates effective stats
		key = key.toUpperFirst();
		if (this.stats[key]) {
			let v = this.stats[key];
			let n = v.current;
			if (n < setup.MIN_STAT && !(key == "Defense" && this.forsaken)){
				n = setup.MIN_STAT; // 0 in subtractive, 1 otherwise
			}
			return Math.round(n);
		} else {
			console.log("ERROR in stat getter, target does not have requested stat");
			return 0;
		}
	}

	getBase (key) {
		key = key.toUpperFirst();
		return this.stats[key].base;
	}

	getBonus (key) {
		key = key.toUpperFirst();
		return this.stats[key].bonus;
	}

	getEquipBonus (key) {
		key = key.toUpperFirst();
		return this.stats[key].equipBonus;
	}

	statRaised (key) {
		key = key.toUpperFirst();
		return (this.get(key) > this.getBase(key));
	}

	statLowered (key) {
		key = key.toUpperFirst();
		return (this.get(key) < this.getBase(key));
	}

	setBase (k,v){
		this.stats[k].base = v;
	}

	setTemp (k,v,abs){
		// DEPRECIATED as of version 1.08. Use addMod instead.
		if (abs !== undefined && (abs.toLowerCase() == 'abs' || abs.toLowerCase() == 'absolute')){
			this.stats.get(k).Temp = v;
		} else {
			this.stats.get(k).Temp += v;
		}
	}

	getElement (needle,type) {
		if (type === undefined) {
			return this.elements.get(needle);
		} else {
			return this.elements.get(needle)[type].current
		}
	}

	setElements (array,type) {
		// Easy way to set base elemental affinities. Takes an array of arrays that each contain two elements, the name of the effect and the base value. Pass the second argument to denote if you are setting flat or percent rates.
		if (type === undefined || typeof(type) !== 'string') {
			console.log("ERROR in setElements: no type defined");
		} else {
			array.forEach(function(data) {
				if (this.elements.has(data[0])) {
					this.elements.get(data[0])[type].base = data[1];
				}
			}, this);
		}
	}

	get retaliations () {
		if (this._retaliations) { return this._retaliations.currentVal; } else { return undefined; }
	}

	set retaliations (amt) {
		if (this._retaliations) {
			this._retaliations.base = amt;
		} else {
			this._retaliations = new FillStat(amt);
		}
	}

	get dmgreflection () {
		if (this._dmgreflection) { return this._dmgreflection.current; } else { return undefined; }
	}

	set dmgreflection (amt) {
		if (this._dmgreflection) {
			this._dmgreflection.base = amt;
		} else {
			this._dmgreflection = new Stat(amt);
		}
	}

	// gender and pronouns

	get gender () {
		return (this._gender || this.data.gender || 'x');
	}

	getPronouns (type) {
		if (typeof(type) == 'string') {
			var pr;
			switch(this.gender.toLowerCase()) {
				case 'f':
				case 'female':
					pr = {obj: "her", subj: "she", pos: "her"};
					break;
				case 'm':
				case 'male':
					pr = {obj: "him", subj: "he", pos: "his"};
					break;
				case 'n':
				case 'neuter':
				case 'neutral':
				case 'agender':
					pr = {obj: "them", subj: "they", pos: "their"};
					break;
				default:
					pr = {obj: "it", subj: "it", pos: "its"};
			}
			var result = pr[type];
			if (result === undefined) { console.log("ERROR in getPronouns: invalid pronoun type"); }
			return result;
		}
		else {
			console.log("ERROR in getPronouns: no pronoun type passed");
			return undefined;
		}
	}

	get them () {
		return this.getPronouns("obj");
	}

	get themself () {
		return this.getPronouns("obj")+"self";
	}

	get they () {
		return this.getPronouns("subj");
	}

	get their () {
		return this.getPronouns("pos");
	}

	get theyare () {
		switch (this.they) {
			case "they":
				return "they are";
			default:
				return (this.they + " is");
		}
	}

	get theyre () {
		switch (this.they) {
			case "they":
				return "they're";
			default:
				return (this.they + "'s");
		}
	}

	get deathMessage () {
		var base = (this._deathMessage || this.data.deathMessage || `${this.name} is defeated!`);
		return base+"<br/>";
	}

	// EQUIPMENT FUNCTIONS

	unequip (slot,index,mods) {
		mods = (mods || {});
		index = (index || 0);
		console.assert(typeof(slot) == "string",`ERROR in unequip: slot must be string`);
		console.assert(Number.isInteger(index),"ERROR in unequip: index must be integer");
		console.assert(this.equipment.has(slot),`ERROR in unequip: attempted to unequip nonexistent slot`);

		var item = this.equipment.get(slot)[index];
		if (item !== null && (!item.sticky || mods.unsticky === true)){
			if (item.default === undefined && mods.destroy !== true) {
				inv().addItem(item.id);
			}
			if (item.onRemove !== undefined) {
				item.onRemove(this);
			}
			this.equipment.get(slot)[index] = null;
			// If your system always has to read something in an equipment slot, such as if you wish to calculate equipment effects through a call function or iterator, replace the above line with the one below. Remember to define default equipment in the items database.
			//this.equipment.set(slot,new Item("Default "+slot));
		}
	}

	unequipAll (mods) {
		this.equipment.forEach(function (slot,name) {
			slot.forEach(function(subslot,index) {
				this.unequip(name,index,mods);
			}, this);
		}, this);
	}

	equip (item) {
		// To equip an item, we also have to de-equip the existing item and return it to the inventory (unless you want players to lose replaced equipment). This function checks that the equipment slot exists and that it's filled by something. If it is, the current equipment is extracted and added to the inventory before we set the new equipment.
		// If the item has any special equipment functionality, such as modifying stats, its onEquip function is passed the actor to modify.
		console.assert(this.equipment.has(item.equippable.slot),"ERROR in equip: Equipment type not recognized");
		var slot = this.equipment.get(item.equippable.slot);
		var existing = null;
		var subslot = -1;
		// Run over the equipment subslots and find the first one that is empty (contains null)
		for (let i = 0; i < slot.length; i++) {
			if (slot[i] === null) {
				subslot = i;
				break;
			}
		}
		// If no empty subslot found (still -1), all subslots are occupied. Grab the item in the last subslot so we can unequip it.
		if (subslot === -1) {
			subslot = slot.length-1;
			existing = slot[subslot];
		}
		// If an item is already equipped in this slot, unequip it.
		if (existing !== null) this.unequip(item.equippable.slot,subslot);

		slot[subslot] = item;
		if (item.onEquip !== undefined){
			item.onEquip(this);
		}
		if (inv() instanceof Inventory && inv().has(item.id)){
			inv().decItem(item.id);
		}
	}

	hasEquipped (name) {
		var result = false;
		this.equipment.forEach(function (item,slot) {
			item.forEach(function (subitem) {
				if (subitem !== null && subitem.id == name) {
					return true;
				}
			});
		});
		return result;
	}

	hasCursedItem () {
		var result = false;
		this.equipment.forEach(function (item,slot) {
			item.forEach(function (subitem) {
				if (subitem !== null && subitem.sticky === true) {
					return true;
				}
			});
		});
		return result;
	}

	checkRestriction (item) {
		// Shorthand for checking equipment restrictions. Returns true if puppet's name is in the restricted listing or if the restricted listing is empty.
		return (item.equippable.restrictedTo.length == 0 || item.equippable.restrictedTo.includes(this.name));
	}

	// TOLERANCE FUNCTIONS

	getTol (key) {
		// This is for evaluating tolerance in-battle, and therefore only returns the current value. DON'T use it to access the whole tolerance object, because that's not what it returns.
		if (!this.tolerances.has(key)){
			return undefined;
		} else {
			return this.tolerances.get(key).currentVal;
		}
	}

	decTol (k) {
		this.tolerances.get(k).currentVal--;
	}

	resetTol (key) {
		this.tolerances.get(key).refill();
	}

	setTol (array) {
		// Easy way to set base tolerances. Takes an array of arrays that each contain two elements, the name of the effect and the base value.
		array.forEach(function(data) {
			if (this.tolerances.has(data[0])) {
				this.tolerances.get(data[0]).base = data[1];
			}
		}, this);
	}

	// GRID FUNCTIONS

	get row () {
		if (setup.BATTLE_GRID === true) {
			var party;
			if (this instanceof Enemy) {
				party = V().enemies;
			} else if (this instanceof Puppet) {
				party = V().puppets;
			}
			for (var i = 1; i <	setup.COLUMN_SIZE; i++) {
				if (party.indexOf(this) < i * setup.ROW_SIZE) {
					return i;
				}
			}
			console.log("ERROR in row getter: could not find row");
			return 0;
		} else {
			return undefined;
		}
	}

	get col () {
		if (setup.BATTLE_GRID === true) {
			var party;
			if (this instanceof Enemy) {
				party = V().enemies;
			} else if (this instanceof Puppet) {
				party = V().puppets;
			}
			for (var i = 1; i <	setup.ROW_SIZE; i++) {
				if (party.indexOf(this) % setup.COLUMN_SIZE == (i-1)) {
					return i;
				}
			}
			console.log("ERROR in column getter: could not find column");
			return 0;
		} else {
			return undefined;
		}
	}

	// MISCELLANEOUS

	regenHP () {
		var gain = 0;
		var mod;
		gain += this.maxhp * this.HPregenPercent;
		gain += this.HPregenFlat;
		if (gain === 0) {
			return;
		}
		this.hp += gain;
		if (gain > 0) {
			mod = "truegreen";
			gain = "+"+gain;
		}
		this.addPopup({type: "regen", content: gain, mod: mod});
	}

	addPopup (popup) {
		console.assert(typeof(popup) === "object" && popup.content !== undefined,`ERROR in addPopup for ${this.name}: invalid popup object`);
		if (setup.ANIMATIONS === true && this.battleMsg instanceof Array) {
			if (temporary().queue instanceof Set) {	temporary().queue.add(this) }
			this.battleMsg.push(popup);
		}
		return;
	}

	get actionReady () {
		//	Returns true if actor has a valid delayed action stored,
		//	and they can perform it (not dead/held/uncontrollable, or delayPersist)

		return (typeof(this.delayedAction) === "string" && this.delayCounter <= 0 &&
			(setup.actionData[this.delayedAction].delayPersist ||
				!(this.dead || this.fakedeath || this.noact || this.uncontrollable)));
	}

	get immortal () {
		var val = this._immortal;
		if (val === undefined) {
			val = this.data.immortal;
		}
		if (val === undefined) {
			val = false
		}
		return val;
	}

	set immortal (flag) {
		this._immortal = flag;
	}

	get large () {
		var val = this._large;
		if (val === undefined) {
			val = this.data.large;
		}
		if (val === undefined) {
			val = false
		}
		return val;
	}

	set large (flag) {
		this._large = flag;
	}

	get maskhp () {
		var val = this._maskhp;
		if (val === undefined) {
			val = this.data.maskhp;
		}
		if (val === undefined) {
			val = false
		}
		return val;
	}

	set maskhp (flag) {
		this._maskhp = flag;
	}

	effectCount (type,mods) {
		//	Returns the number of instances of the named effect currently posessed by this actor.
		//	Can search for specific effects or classes of effect: buffs, ailments, DoTs, holds, blocks, shields, or all.
		//	Note that unlike for other effect functions, you must specify if you do NOT want stickies counted.
		//	mods is an array of strings.
		//		"nosticky": effects will not count if they are sticky

		console.assert(typeof(type) == "string",`ERROR in effectCount: non-string passed`);
		mods = (mods || []);
		let count = 0;
		this.effects.forEach(function (effect) {
				if (!(effect.sticky && mods.includes("nosticky")) &&
						effect.name == type ||
						type == "all" ||
						type == "buff" && effect.buff ||
						type == "ailment" && !effect.buff ||
						type == "dot" && effect.dot ||
						type == "hold" && effect.hold ||
						type == "block" && effect.block ||
						type == "shield" && effect.shield) {
							if (mods.includes("threat")) {
								count += effect.threat;
							} else {
								count++;
							}
				}
			});

		return count;
	}

/*
	setTol (k, v) {
		// DEPRECIATED as of version 1.08. Tolerances are now tied to the Tolerance object and function like Stats.

		// This function works for both creation and modification (such as from equipment). Tolerances are objects with 3 attributes: current value, maximum value, and immune flag. If "immune" is true, the character has total immunity and cur/max are ignored. To set an immunity, pass "true" as the v argument. To remove an existing immunity, pass "false" as the v argument; previous tolerance values will still remain. To increment or reduce a tolerance value, pass a number as the v argument.
		// This function will do nothing if you pass an argument that is not a boolean or integer. To reduce potential clutter on the status screen, it is also not possible to make useless tolerance (0 points and false immunity).
		if (this.tolerances.has(k)){
			if (typeof(v) == 'boolean'){
				this.tolerances.get(k).immune = v;
			} else if (Number.isInteger(v)){
				this.tolerances.get(k).max += v;
				this.resetTol(k);
			}
			if (this.tolerances.get(k).immune === false && this.tolerances.get(k).max <= 0){
				this.tolerances.delete(k);
			}
		} else {
			var tol;
			if (Number.isInteger(v)){
				tol = {cur: v, max: v, immune: false};
			} else if (v === true){
				tol = {cur: 0, max: 0, immune: v};
			} else {
				return "ERROR in setTol: non-integer or non-Boolean value passed\n";
			}
			this.tolerances.set(k, tol);
		}
	}
*/

	/* Relic of a time when effective stats were stored as an actual attribute. Easier to just calculate them every time with get(). */
	/*
	calcStats (){
		this.stats.forEach( (v,k) => {
			v.Eff = v.Base + v.bonus + v.Temp;
			if (v.Eff < 0 && !(k == "Defense" && this.forsaken)){
				v.Eff = 0;
			}
		} );
	}
	*/

	clone () {
		// Return a new instance containing our current data.
		return new Actor(this);
	}

	toJSON () {
		// Return a code string that will create a new instance
		// containing our current data.
		const data = {};
		Object.keys(this).forEach(pn => data[pn] = clone(this[pn]));
		return JSON.reviveWrapper('new Actor($ReviveData$)', data);
	}
};
