window.Actor = class Actor {
	constructor(name,pos){
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
		this.delayedAction = null;

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
			if (this.data.elements) { this.setElements(Object.entries(this.data.elements),"percent"); }
			if (this.data.tolerances) { this.setTol(Object.entries(this.data.tolerances)); }

			this._maxHP = new Stat(this.data.hp);
			this._hp = this.data.hp;
			if (Number.isInteger(this.data.en)) {
				this._maxEN = new Stat(this.data.en);
				this._en = this.data.en;
			} else if (Number.isInteger(setup.MAX_EN)) {
				this._maxEN = new Stat(setup.MAX_EN);
				this._en = setup.MAX_EN;
			}
			this._ENregen = new Stat(0);
			if (Number.isInteger(this.data.ENregen)) {
				this._ENregen = new Stat(this.data.ENregen);
			} else if (Number.isInteger(setup.EN_REGEN)) {
				this._ENregen = new Stat(setup.EN_REGEN);
			}
			this.stats = {};
			for (let [pn,v] of Object.entries(setup.statInfo)) {
				switch (pn) {
					case 'Accuracy':
						this.stats[pn] = new Stat(100);
						break;
					default:
						this.stats[pn] = new Stat(0);
				}
			}
			for (let [pn,v] of Object.entries(this.data.stats)) {
				this.setBase(pn,v);
			}
			Number.isInteger(this.data.retaliations) ?
				this._retaliations = new FillStat(this.data.retaliations) : this._retaliations = new FillStat(0);
			Number.isInteger(this.data.respawn) ?
				this._respawn = new FillStat(this.data.respawn) : this._respawn = new FillStat(0);
			if (typeof(this.data.respawnHP) === "number") { this._respawnHP = this.data.respawnHP; }

			this.battleMsg = [];	// container for popups that will appear during actions

			this.active = true;
			this.dead = false;
			this.protectedBy = null;
			this.effects = [];
			this.onHit = [];
			this.lastDmg = 0;
			this.dmgreflection = 0;
			this.noMinimum = [];	// stats that do not have minimums for this character; used by some effects

			this.equipment = new Map();
			var equipData;
			equipData = (typeof(this.equipSlots) == "object")
				? equipData = this.equipSlots
				: equipData = setup.DEFAULT_EQUIP_SLOTS;

			for (let [pn,v] of Object.entries(equipData)) {
				this.equipment.set(pn,new Array(v).fill(null));
			}

			if (pos instanceof Array) {
				console.assert(pos.length == 2 && Number.isInteger(pos[0]),`ERROR in Actor constructor: invalid position array passed`);
				this.position = pos;
			}
		}
		else if (name !== "Dummy") {
			console.log("ERROR: Actor "+name+" is not in database");
			this.name = "INVALID ACTOR";
			this._hp = 1;
			this._maxHP = new Stat(1);
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
			if (flag === true) {
				// erase delayed action on death UNLESS the action persists past user death
				if (this.delayedAction instanceof Action && !this.delayedAction.delayPersist) {
					this.delayedAction = null;
				}
				// remove from $actors (if using ranked order system)
				if (setup.TURN_MODEL.toLowerCase() === "ranked" && V().actors instanceof Array) {
					V().actors.deleteWith(function (a) { return a.id === this.id });
				}
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

	get skillLock () {
		//	Checks if the Actor is under a skill-locking effect (e.g. Dizzy)
		//	If skillLock effect found, will return a truthy value, else will return a falsy value.

		return this.effects.find(function(eff) { return eff && eff.skillLock });
	}

	get healBlock () {
		//	Checks if the Actor is under an effect that prevents healing
		//	If healBlock effect found, will return a truthy value, else will return a falsy value.

		return this.effects.find(function(eff) { return eff && eff.healBlock });
	}

	get interruptGuard () {
		//	Checks if the Actor is under an effect that prevents action interruption
		//	If interruptGuard effect found, will return a truthy value, else will return a falsy value.

		return this.effects.find(function(eff) { return eff && eff.interruptGuard });
	}

	get noENregen () {
		//	Checks if the Actor is under an effect that prevents EN regen
		//	If noENregen effect found, will return a truthy value, else will return a falsy value.

		return (typeof(this.en) === "number") && (this.dead || this.effects.find(function(eff) { return eff && eff.noENregen }));
	}

	get shieldHits () {
		//	Returns the number of blocks from shield effects on this character, if they have any

		var hits = 0;
		this.effects.filter(function (eff) {return eff && eff.shield }).forEach(function (shield) {
			hits += shield.uses;
		});
		return hits;
	}

	get hp () {
		return this._hp;
	}

	set hp (amt) {
		console.assert(Number.isInteger(amt),`ERROR in HP setter: HP must be integer`);
		if (setup.ANIMATIONS && V().inbattle && this.displayHP === this.hp) {
			this.displayHP = this.hp;
		}
		this._hp = Math.clamp(amt,0,this.maxHP);
	}

	get maxHP () {
		return this._maxHP.current;
	}

	set maxHP (amt) {
		console.assert(Number.isInteger(amt),`ERROR in max HP setter: max HP must be integer`);
		this._maxHP.base = amt;
	}

	updateHP () {
		// used for matching current HP to changes in max HP, e.g. HP-boosting equipment
		if (!(this instanceof Puppet && V().lastingDamage)) {
			this.hp = this.maxHP;
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
		this._displayHP = Math.clamp(amt,0,this.maxHP);
	}

	//  en: number; Energy points spent to use actions
	get en () {
		return this._en;
	}

	set en (amt) {
		console.assert(Number.isInteger(amt),`ERROR in EN setter: EN must be integer`);
		this._en = Math.clamp(amt,0,this.maxEN);
	}

	//  maxEN: number; maximum Energy points Puppet can hold
	get maxEN () {
		return this._maxEN.current;
	}

	set maxEN (amt) {
		console.assert(Number.isInteger(amt),`ERROR in max en setter: max en must be integer`);
		this._maxEN.base = amt;
	}

	//  ENregen: number; determines EN gain per turn
	get ENregen () {
		return this._ENregen.current;
	}

	set ENregen (amt) {
		console.assert(Number.isInteger(amt),`ERROR in EN regen setter: EN regen must be integer`);
		this._ENregen.base = amt;
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
		this._hp = Math.clamp(this.hp + amt,0,this.maxHP);
	}

	setMaxHP (amt) {
		// Absolute setter: for when both HP and max HP need to be set simultaneously, e.g. form changes.
		this.maxHP = amt;
		this.hp = amt;
	}

	get (key) {
		// calculates effective stats
		key = key.toUpperFirst();
		if (this.stats[key]) {
			let v = this.stats[key];
			let n = Math.round(v.current);
			let max = setup.STAT_MAX[key];
			let min = setup.STAT_MIN[key];
			if (isNaN(max) || isNaN(min)) {
				return n;
			} else {
				return this.noMinimum.includes(key)
					? Math.min(n,max)
					: Math.clamp(n,min,max);
			}
		} else {
			console.log("ERROR in stat getter, target does not have requested stat");
			return 0;
		}
	}

	getBase (key) {
		key = key.toUpperFirst();
		if (this.stats[key]) {
			let v = this.stats[key];
			let n = Math.round(v.base);
			let max = setup.STAT_MAX[key];
			let min = setup.STAT_MIN[key];
			return this.noMinimum.includes(key)
				? Math.min(n,max)
				: Math.clamp(n,min,max);
		} else {
			console.log("ERROR in base stat getter, target does not have requested stat");
			return 0;
		}
	}

	getBonus (key) {
		key = key.toUpperFirst();
		if (this.stats[key]) {
			let v = this.stats[key];
			let n = Math.round(v.bonus);
			let max = setup.STAT_MAX[key];
			let min = setup.STAT_MIN[key];
			return this.noMinimum.includes(key)
				? Math.min(n,max)
				: Math.clamp(n,min,max);
		} else {
			console.log("ERROR in stat getter, target does not have requested stat");
			return 0;
		}
	}

	getEquipBonus (key) {
		key = key.toUpperFirst();
		if (this.stats[key]) {
			let v = this.stats[key];
			let n = Math.round(v.equipBonus);
			let max = setup.STAT_MAX[key];
			let min = setup.STAT_MIN[key];
			return this.noMinimum.includes(key)
				? Math.min(n,max)
				: Math.clamp(n,min,max);
		} else {
			console.log("ERROR in stat getter, target does not have requested stat");
			return 0;
		}
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

	addMod (key, id, mod, equipment) {
		return this.stats[key].addMod(id,mod,equipment);
	}

	removeMod (key, id, index) {
		this.stats[key].removeMod(id, index);
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
		var val = this._deathMessage;
		if (val === undefined) {
			val = this.data.deathMessage;
		}
		if (val === null) {
			return null;
		} else if (val === undefined) {
			val = `${this.name} is defeated!`;
		}
		if (val instanceof Function) val = val(this);
		return val+"<br/>";
	}

	// EQUIPMENT FUNCTIONS

	unequip (slot,index = 0,mods = {}) {
		console.assert(typeof(slot) == "string",`ERROR in unequip: slot must be string`);
		console.assert(Number.isInteger(index) && index >= 0,"ERROR in unequip: index must be whole integer");
		console.assert(this.equipment.has(slot),`ERROR in unequip: attempted to unequip nonexistent slot`);

		var item = this.equipment.get(slot)[index];
		if (item instanceof Filler) {
			console.log(this.equipment.values());
			var multislot = Array.from(this.equipment.values()).flat().find(function (i) { return (i instanceof Item) && i.id === item.id });
			this.unequip(Array.from(multislot.equippable.slot)[0]);
		}
		else if (item !== null && (!item.sticky || mods.unsticky === true)){
			if (item.default === undefined && mods.destroy !== true) {
				inv().addItem(item.id);
			}
			if (item.onRemove !== undefined) {
				item.onRemove(this);
			}
			this.equipment.get(slot)[index] = null;

			// If your system always has to read something in an equipment slot, such as if you wish to calculate equipment effects through a call function or iterator, define default item names in DEFAULT_EQUIPMENT. Remember to define default equipment in the items database.
			if (typeof(setup.DEFAULT_EQUIPMENT) === "object") {
				console.assert(typeof(setup.DEFAULT_EQUIPMENT[slot]) === "string","ERROR in unequip: no default equipment specified for "+slot);
				this.equipment.get(slot)[index] = new Item(setup.DEFAULT_EQUIPMENT[slot]);
			}

			if (item.equippable.slot instanceof Set) {
				// If item was equipped to multiple slots, we have to clear all the other slots it covered.
				for (let slotName of item.equippable.slot) {
					var pos = this.equipment.get(slotName);
					for (let i = 0; i < pos.length; i++) {
						pos[i] = null;
					}
				}
			}
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
		console.assert(typeof(item.equippable) == "object","ERROR in equip: Item has no equippable property");
		if (item.equippable.slot instanceof Set) {
			var slotList = item.equippable.slot;
			for (let slot of slotList) {
				console.assert(this.equipment.has(slot),"ERROR in equip: Equipment type not recognized");
			}
			for (let [s,slot] of Array.from(slotList).entries()) {
				var pos = this.equipment.get(slot);
				for (let i = 0; i < pos.length; i++) {
					this.unequip(slot,i);
					pos[i] = (s > 0 || i > 0) ? new Filler(item.id) : item;
				}
			}
		} else {
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

			// Assign the item to the slot.
			slot[subslot] = item;
		}

		if (item.onEquip !== undefined){
			item.onEquip(this);
		}
		if (inv() instanceof Inventory && inv().has(item.id)){
			inv().decItem(item.id);
		}
	}

	hasEquipped (name) {
		var result = false;
		for (let [slot,item] of this.equipment) {
			for (let subitem of item) {
				if (subitem !== null && subitem.id == name) {
					return true;
				}
			}
		}
		return result;
	}

	hasCursedItem () {
		var result = false;
		this.equipment.forEach(function (slot,name) {
			slot.forEach(function (subitem) {
				if (subitem !== null && subitem.sticky === true) {
					result = true;
				}
			});
		});
		return result;
	}

	checkRestriction (item) {
		// Shorthand for checking equipment restrictions. Returns true if puppet's name is in the restricted listing.
		return (item.equippable.restrictedTo instanceof Array)
			? (item.equippable.restrictedTo.includes(this.name))
			: true
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

	decTol (key, amt = 1) {
		this.tolerances.get(key).currentVal -= amt;
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

	set row (num) {
		console.assert(Number.isInteger(num),`ERROR in row setter: row must be integer`);
		console.assert(num > 0,`ERROR in row setter: row must be positive`);
		console.assert(num <= setup.COLUMN_SIZE,`ERROR in row setter: row cannot be greater than column size`);
		this._row = num;
	}

	get row () {
		return (this._row || 1);
	}

	set col (num) {
		console.assert(Number.isInteger(num),`ERROR in column setter: column must be integer`);
		console.assert(num > 0,`ERROR in column setter: column must be positive`);
		console.assert(num <= setup.ROW_SIZE,`ERROR in column setter: column cannot be greater than row size`);
		this._col = num;
	}

	get col () {
		return (this._col || this.ownParty.indexOf(this) + 1);
	}

	get gridArea () {
		//	For use with CSS styling.
		if (this instanceof Enemy) {
			return `grid-area: ${setup.COLUMN_SIZE - this.row + 1} / ${this.col}`;
		} else {
			return `grid-area: ${this.row} / ${this.col}`;
		}
	}

	get position () {
		//	Returns this character's cell in the grid object.
		//	Note this does NOT return the cell's contents, but the cell itself.
		var grid;
		if (V().inbattle === true) {
			switch (this.id.charAt(0)) {
				case 'p':
					grid = V().puppetGrid;
					break;
				case 'e':
					grid = V().enemyGrid;
					break;
			}
		} else {
			grid = V().grid;
		}
		console.assert(grid instanceof Array,`ERROR in position getter: grid does not exist or is not array`);
		return grid[this.row-1][this.col-1];
	}

	set position (pos) {
		//	Adjusts row and column simultaneously and automatically swaps with the contents of the new cell.
		//	pos = array of 2 positive integers, [row,col]
		console.assert(pos instanceof Array && pos.length >= 2,`ERROR in position setter: pos must be array with 2 elements`);
		console.assert(pos[0] > 0 && pos[1] > 0,`ERROR in position setter: pos must be positive`);
		console.assert(pos[0] <= setup.COLUMN_SIZE,`ERROR in position setter: row cannot be greater than column size`);
		console.assert(pos[1] <= setup.ROW_SIZE,`ERROR in position setter: column cannot be greater than row size`);
		var org;
		try {
			org = this.position;
		} catch (e) {
			org = this.ownParty.find(function (a) { return a && a.row === pos[0] && a.col === pos[1] });
		}
		var row = this.row;
		var col = this.col;
		this.row = pos[0];
		this.col = pos[1];
		// hold the contents of the cell that will be at the actor's new position
		var holder;
		try {
			holder = this.position.contents;
		} catch (e) {
			holder = org;
		}
		if (holder instanceof Actor) {
			holder.row = row;
			holder.col = col;
		}
		try {
			// populate the new cell with this character
			this.position.contents = this;
			// move the held contents to the original position
			org.contents = holder;
		} catch (e) {
			// if no grid defined, further adjustments unnecessary; end here
		}
	}

	get guardBreak () {
		//	Boolean. If true, this character will not guard characters behind them.
		//	By default, dead characters will automatically return true.

		return (this.dead || this.effects.find(function(eff) { return eff && eff.guardBreak }));
	}

	get guarded () {
		//	Boolean. Returns true if guardCheck returns a different target, and false otherwise.

		var newTarget = Hitlist.guardCheck(this);
		return newTarget === this ? false : true;
	}

	numAdjacent (area) {
		//	Integer. Returns the number of OTHER characters in the group specified; does not include calling character
		//	area: string; corresponds to one of the AoE types
		console.assert(typeof(area) === "string",`ERROR in numAdjacent: area must be string`);

		switch (area) {
			case 'col':
			case 'column':
				return this.ownParty.filter(function (a) { return a && a.id !== this.id && a.col === this.col }).length;
			case 'row':
				return this.ownParty.filter(function (a) { return a && a.id !== this.id && a.row === this.row }).length;
			case '+':
			case 'adjacent':
				return this.ownParty.filter(function (a) { return a && a.id === target().id && (
					(a.col === target().col && (a.row === target().row + 1 || a.row === target().row - 1)) ||
					(a.row === target().row && (a.col === target().col + 1 || a.col === target().col - 1))
				)}).length;
			default:
				return 0;
		}
	}

	// TIMELINE FUNCTIONS

	get ticks () {
		return this._ticks;
	}

	set ticks (num) {
		console.assert(Number.isInteger(num),`ERROR in tick setter: non-integer passed`);
		this._ticks = Math.max(0,num);
	}

	// BOOLEAN FLAGS

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
		console.assert(typeof(flag) === "boolean",`ERROR in immortal setter: non-Boolean passed`);
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
		console.assert(typeof(flag) === "boolean",`ERROR in large setter: non-Boolean passed`);
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
		console.assert(typeof(flag) === "boolean",`ERROR in maskhp setter: non-Boolean passed`);
		this._maskhp = flag;
	}

	get loadBearing () {
		//	Boolean. If true, defeating this character will instantly end the encounter.

		var val = this._loadBearing;
		if (val === undefined) {
			val = this.data.loadBearing;
		}
		if (val === undefined) {
			val = false
		}
		return val;
	}

	set loadBearing (flag) {
		console.assert(typeof(flag) === "boolean",`ERROR in loadBearing setter: non-Boolean passed`);
		this._loadBearing = flag;
	}

	get uncounted () {
		//	Boolean. If true, this character does not need to be defeated to end an encounter.

		var val = this._uncounted;
		if (val === undefined) {
			val = this.data.uncounted;
		}
		if (val === undefined) {
			val = false
		}
		return val;
	}

	set uncounted (flag) {
		console.assert(typeof(flag) === "boolean",`ERROR in uncounted setter: non-Boolean passed`);
		this._uncounted = flag;
	}

	// MISCELLANEOUS

	regenHP () {
		var gain = 0;
		var mod;
		gain += this.maxHP * this.HPregenPercent;
		gain += this.HPregenFlat;
		if (gain === 0) {
			return;
		}
		this.hp = Math.max(this.hp + gain,1);		//	HP degen cannot take HP below 1
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

	hasEffect (name) {
		//	name = string or array, name of effect to check

		return this.effects.map(function (e) { return e.name }).includesAny(name);
	}

	get actionReady () {
		//	Returns true if actor has a valid delayed action stored,
		//	and they can perform it (not dead/held/uncontrollable, or delayPersist)

		if (this.delayedAction instanceof Action) {
//			console.log(`Checking actionReady for ${this.name}`); console.log(this.delayedAction);
//			console.log(`Active?`); console.log(this.active);
/*			console.log(`Can act?`); console.log((this.delayedAction instanceof Action
				&& this.delayedAction.delayCounter <= 0
				&& (this.active || this.delayedAction.delayPersist)
				&& (this.delayedAction.delayPersist ||
					!(this.dead || this.fakedeath || this.noact || this.uncontrollable))
				));
*/		}

		return (this.delayedAction instanceof Action
			&& this.delayedAction.delayCounter <= 0
			&& (this.active || this.delayedAction.delayPersist)
			&& (this.delayedAction.delayPersist ||
				!(this.dead || this.fakedeath || this.noact || this.uncontrollable))
			);
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

	replenishUses (name) {
		//	name = string
		//	Refills the uses of all actions matching the passed name.

		console.assert(typeof(name) == "string",`ERROR in replenishUses: action name must be string`);
		this.actions.forEach(function (action) {
			if (action.name === name) action.refill();
		});
		return;
	}

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