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
			if (setup.SECONDARY_STATS["Regen HP Flat"]
				&& Number.isInteger(setup.SECONDARY_STATS["Regen HP Flat"].default)) {
				this._HPregen.flat.base = setup.SECONDARY_STATS["Regen HP Flat"].default;
			}
			if (setup.SECONDARY_STATS["Regen HP Percent"]
				&& Number.isInteger(setup.SECONDARY_STATS["Regen HP Percent"].default)) {
				this._HPregen.flat.base = setup.SECONDARY_STATS["Regen HP Percent"].default;
			}
			this.elements = {};
			if (setup.ELEMENT_LIST !== undefined){
				setup.ELEMENT_LIST.forEach(function(x) {
					this.elements[x] = {"percent": new Stat(1), "flat": new Stat(0)};
				}, this);
				if (this.data.elements) {
					for (let [pn,v] of Object.entries(this.data.elements)) {
						if (typeof(v) === "number") {
							this.elements[pn].percent.base = v;
						} else if (typeof(v) === "object") {
							this.elements[pn].flat.base = v.flat;
							this.elements[pn].percent.base = v.percent;
						} else {
							console.log(`ERROR constructing Actor ${name}: invalid elements entry`);
						}
					}
				}
			}
			this.tolerances = new Map();
			if (setup.effectData !== undefined){
				Object.keys(setup.effectData).forEach(function(x) {
					this.tolerances.set(x,new Tolerance(0));
				}, this);
			}
			if (this.data.tolerances) { this.setTol(Object.entries(this.data.tolerances)); }

			if (Number.isInteger(this.data.hp)) {
				this._maxHP = new FillStat(this.data.hp);
			} else if (Number.isInteger(setup.SECONDARY_STATS["HP"].default)) {
				this._maxHP = new FillStat(setup.SECONDARY_STATS["HP"].default);
			} else {
				console.log(`ERROR constructing HP for ${name}: Default HP is not defined in database or SECONDARY_STATS.`);
				this._maxHP = new FillStat(0);
			}
			if (setup.SECONDARY_STATS[StatName("Energy")]) {
				if (Number.isInteger(this.data.en)) {
					this._maxEN = new FillStat(this.data.en);
				} else if (Number.isInteger(setup.SECONDARY_STATS[StatName("Energy")].default)) {
					this._maxEN = new FillStat(setup.SECONDARY_STATS[StatName("Energy")].default);
				}
				this._ENregen = new Stat(0);
				if (setup.SECONDARY_STATS["Regen EN"]) {
					if (Number.isInteger(this.data.ENregen)) {
						this._ENregen = new Stat(this.data.ENregen);
					} else if (Number.isInteger(setup.SECONDARY_STATS["Regen EN"].default)) {
						this._ENregen = new Stat(setup.SECONDARY_STATS["Regen EN"].default);
					}
				}
			}
			this.stats = {};
			for (let [pn,v] of Object.entries(setup.statInfo)) {
				if (Number.isInteger(v.default)) {
					this.stats[pn] = new Stat(v.default);
				} else {
					this.stats[pn] = new Stat(v.min);
				}
			}
			if (this.data.stats) {
				for (let [pn,v] of Object.entries(this.data.stats)) {
					console.assert(this.stats.hasOwnProperty(pn),`ERROR constructing Actor ${name}: Database entry contains invalid stat`);
					this.setBase(pn,v);
				}
			}
			Number.isInteger(this.data.retaliations) ?
				this._retaliations = new FillStat(this.data.retaliations) : this._retaliations = new FillStat(0);
			Number.isInteger(this.data.respawn) ?
				this._respawn = new FillStat(this.data.respawn) : this._respawn = new FillStat(0);
			if (typeof(this.data.respawnHP) === "number") { this._respawnHP = this.data.respawnHP; }
			typeof(this.data.threatMod) === "number" && this.data.threatMod > 0 ?
				this._threatMod = new Stat(this.data.threatMod) : this._threatMod = new Stat(1);

			this.battleMsg = [];	// container for popups that will appear during actions

			this.active = true;
			this.dead = false;
			this.protectedBy = null;
			this.effects = [];
			this.onHit = [];
			this.lastDmg = 0;
			this.dmgreflection = 0;
			this.noMinimum = [];	// stats that do not have minimums for this character; used by some effects

			this.equipment = [];
			var equipData;
			equipData = (typeof(this.equipSlots) == "object")
				? equipData = this.equipSlots
				: equipData = setup.DEFAULT_EQUIP_SLOTS;

			for (let [pn,v] of Object.entries(equipData)) {
				console.assert(Number.isInteger(v) && v > 0,`ERROR constructing Actor: equipData has non-whole numbers`);
				for (let i = 1; i <= v; i++) {
					let slot = { name: pn, id: i, item: null, locked: false };
					this.equipment.push(slot);
				}
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
				// reset actTime (if using action time system)
				if (setup.TURN_MODEL.toLowerCase() === "action") {
					this.actTime = 0;
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
		return this._maxHP.currentVal;
	}

	set hp (amt) {
		console.assert(Number.isInteger(amt),`ERROR in HP setter: HP must be integer`);
		if (setup.ANIMATIONS && V().inbattle && this.displayHP === this.hp) {
			this.displayHP = this.hp;
		}
		this._maxHP.currentVal = Math.clamp(amt,0,this.maxHP);
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
			this.maxHP.refill();
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
		return (this._maxEN instanceof FillStat) ? this._maxEN.currentVal : undefined;
	}

	set en (amt) {
		console.assert(Number.isInteger(amt),`ERROR in EN setter: EN must be integer`);
		this._maxEN.currentVal = Math.clamp(amt,0,this.maxEN);
	}

	//  maxEN: number; maximum Energy points Puppet can hold
	get maxEN () {
		return (this._maxEN instanceof FillStat) ? this._maxEN.current : undefined;
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
			let max = setup.statInfo[key].max;
			let min = setup.statInfo[key].min;
			if (isNaN(max) && isNaN(min)) {
				return n;
			} else if (isNaN(max)) {
				return Math.max(n,min);
			} else if (isNaN(min) || this.noMinimum.includes(key)) {
				return Math.min(n,max);
			} else {
				return Math.clamp(n,min,max);
			}
		} else {
			console.log("ERROR in stat getter, target does not have requested stat");
			return 0;
		}
	}

	getBase (key) {
		console.assert(typeof(key) === "string",`ERROR in getBase for ${this.name}: key must be string`);
		key = key.toUpperFirst();
		if (this.stats[key]) {
			let v = this.stats[key];
			let n = Math.round(v.base);
			return n;
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
			return n;
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
			return n;
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

	setBase (key,v) {
		console.assert(typeof(key) === "string",`ERROR in setBase for ${this.name}: key must be string`);
		console.assert(Number.isInteger(v),`ERROR in setBase for ${this.name}: v must be integer`);
		key = key.toUpperFirst();
		if (this.stats[key]) {
			let max = setup.statInfo[key].max;
			let min = setup.statInfo[key].min;
			if (isNaN(max) && isNaN(min)) {
				this.stats[key].base = v;
			} else if (isNaN(max)) {
				this.stats[key].base = Math.max(v,min);
			} else if (isNaN(min)) {
				this.stats[key].base = Math.min(v,max);
			} else {
				this.stats[key].base = Math.clamp(v,min,max);
			}
		} else {
			console.log(`ERROR in setBase: ${this.name} does not have requested stat`);
			return 0;
		}
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

	get threatMod () {
		console.assert(this._threatMod instanceof Stat,`ERROR accessing threatMod for ${this.name}: threatMod is not a Stat`);
		return this._threatMod.current;
	}

	getElement (needle,type) {
		if (type === undefined) {
			return this.elements[needle];
		} else {
			return this.elements[needle][type].current
		}
	}

	setElements (array,type) {
		// DEPRECIATED as of v5.00. The new object format for elemental affinities renders this unnecessary.

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

	hasSlot (slot,index) {
		// Checks if the Actor has an equipment slot with the provided name.
		// May optionally check for a subslot as well with the "index" argument.
		// Returns Boolean based on the result of searching for the slot.

		console.assert(typeof(slot) == "string",`ERROR in hasSlot: slot must be string`);
		if (index !== undefined) {
			console.assert(Number.isInteger(index) && index >= 1,"ERROR in getEquipment: index must be whole integer");
			return this.equipment.find(e => (e.name === slot && e.id === index)) ? true : false;
		} else {
			return this.equipment.find(e => e.name === slot) ? true : false;
		}
	}

	getEquipment (slot,index=1) {
		console.assert(typeof(slot) == "string",`ERROR in getEquipment: slot must be string`);
		console.assert(Number.isInteger(index) && index >= 1,"ERROR in getEquipment: index must be whole integer");
		let eq = this.equipment.find(e => (e.name === slot && e.id === index));
		return eq ? eq.item : null;
	}

	unequip (name,index = 1,mods = {}) {
		console.assert(typeof(name) == "string",`ERROR in unequip: name must be string`);
		console.assert(Number.isInteger(index) && index >= 1,"ERROR in unequip: index must be whole integer");
		var slot = this.equipment.find(e => (e.name === name && e.id === index));
		console.assert(slot !== undefined,`ERROR in unequip: attempted to unequip nonexistent name`);

		if (slot.locked && !mods.unlock) {
			console.log("Unequip result for "+this.name+": Slot "+name+" is locked. Remember to pass the unlock property to the mods argument if you wish to unequip a locked slot.")
			return false;
		}

		var item = slot.item;
		if (item instanceof Filler) {
			// If the equipment slot holds a Filler object, it's tied to a multi-slot
			//	item. Find the source item and unequip that instead.
			// Filler objects hold the name of their source object for this purpose.
			// Note that we have to check that a given slot's item exists before
			//	we try to read its name, because attempting to access a property
			//	of a null value will create an error.
			let sourceSlot = this.equipment.find(e => (e.item && e.item.name === item.name));
			// It's possible the find failed and returned undefined. Execute
			//	an assertion to catch this case.
			console.assert(sourceSlot !== undefined,`ERROR in unequip: Filler source does not exist`);
			this.unequip(sourceSlot.name,sourceSlot.id);
		}
		else if (item instanceof Item && (!item.sticky || mods.unsticky === true)) {
			// Standard branch. If the slot holds an Item object, as expected,
			//	remove it from the slot and return it to inventory.
			// Sticky items cannot be removed unless the unsticky mod is passed.
			if (this instanceof Puppet && item.default === undefined && mods.destroy !== true) {
				// Return the item to inventory, unless it is "default" equipment
				//	or the destroy mod is passed.
				(item.uses < item.maxUses)
					? inv().addItem(item)
					: inv().addItem(item.name);
			}
			if (item.onRemove !== undefined) {
				item.onRemove(this);
			}
			slot.item = null;

			// If your system always has to read something in an equipment name, such as if you wish to calculate equipment effects through a call function or iterator, define default item names in DEFAULT_EQUIPMENT. Remember to define default equipment in the items database.
			if (typeof(setup.DEFAULT_EQUIPMENT) === "object") {
				console.assert(typeof(setup.DEFAULT_EQUIPMENT[name]) === "string","ERROR in unequip: no default equipment specified for "+name);
				this.equip(new Item(setup.DEFAULT_EQUIPMENT[name]));
			}

			if (item.equippable.multislot) {
				// If item was equipped to multiple slots, we have to clear all the other slots it covered.
				for (let s of this.equipment) {
					if (s.item instanceof Filler && s.name === item.name) {
						s.item = null;
						if (typeof(setup.DEFAULT_EQUIPMENT) === "object") {
							console.assert(typeof(setup.DEFAULT_EQUIPMENT[s.name]) === "string","ERROR in unequip: no default equipment specified for "+s.name);
							this.equip(new Item(setup.DEFAULT_EQUIPMENT[s.name]));
						}
					}
				}
			}
		} else {
			// Default branch for unexpected results. Log error message.
			console.log("Unequip result for "+this.name+": Slot "+name+" held unexpected object type or equipment was sticky. Remember to pass unsticky to the mods argument to remove sticky equipment.");
			return false;
		}
	}

	unequipAll (mods) {
		for (let s of this.equipment) {
			this.unequip(s.name,s.id,mods);
		}
	}

	equip (item,slot) {
		// item: Item object, to be equipped.
		// slot [optional]: object or string.
		//	If string, must correspond to a valid equipment slot name.
		//	If object, it is assumed it is an equipment slot from the Actor.
		//	If unused, will default to the first slot listed in item's "slots" property.
		//	Item will be equipped to this slot.
		// To equip an item, we also have to de-equip the existing item and return it to the inventory (unless you want players to lose replaced equipment). This function checks that the equipment slot exists and if it's filled by something. If it is, the current equipment is extracted and added to the inventory before we set the new equipment.
		// If the item has any special equipment functionality, such as modifying stats, its onEquip function is passed the actor to modify.
		console.assert(item instanceof Item,`ERROR in equip: cannot equip non-Item object`);
		console.assert(typeof(item.equippable) == "object","ERROR in equip: Item has no equippable property");
		if (item.equippable.multislot) {
			// Multislot equipment branch: Must equip item to the first slot in
			//	its list and fill the rest with Filler objects.
			// Check: Does this Actor have all needed slots?
			for (let s of item.slots) {
				console.assert(this.hasSlot(s),`ERROR in equipping ${item.name} to ${this.name}: Equipment slot not recognized`);
			}
			// Check: Are any of the slots unequippable? If yes, terminate method
			//	and return false.
			if (this.equipment.find(e => item.slots.includes(e.name) && e.locked || (e.item && e.item.sticky))) {
				return false;
			}
			this.equipment.filter(e => item.slots.includes(e.name)).forEach(function(s,i) {
				this.unequip(s.name,s.id);
				s.item = (i > 0) ? new Filler(item.name) : item;
			},this);
		} else {
			var slotName;
			if (slot === undefined) {
				slotName = item.slots[0];
			} else if (typeof(slot) === "object") {
				slotName = slot.name;
			} else if (typeof(slot) === "string") {
				slotName = slot;
			}
			console.assert(this.hasSlot(slotName),`ERROR in equipping ${item.name} to ${this.name}: Equipment slot not recognized`);
			var targetSlot;
			if (typeof(slot) === "object") {
				// If slot argument was an object, we'll assume it's a valid
				//	target slot.
				targetSlot = slot;
			} else {
				// Otherwise, check all slots to see if there's a valid open slot.
				targetSlot = this.equipment.find(s => s.name === slotName && s.item === null);
				// If this results in undefined, all slots occupied. Set target to
				//	the last instance of slot with this name.
				if (targetSlot === undefined) {
					targetSlot = this.equipment.findLast(s => s.name === slotName);
				}
			}

			// Check if targetSlot is already occupied and unequip it if so.
			if (targetSlot.item !== null) {
				let test = this.unequip(targetSlot.name,targetSlot.id);
				// Check to make sure the unequip went through. If the target slot
				//	was sticky, it will return false. Return false here as well.
				if (test === false) return false;
			}

			// Assign the item to the slot.
			targetSlot.item = item;
		}

		if (item.onEquip instanceof Function){
			item.onEquip(this);
		}
		if (this instanceof Puppet && inv() instanceof Inventory && inv().getById(item.id)){
			inv().decItem(inv().getById(item.id));
		}
	}

	hasEquipped (name) {
		var result = false;
		for (let slot of this.equipment) {
			if (slot.item instanceof Item && slot.item.name === name) {
				return true;
			}
		}
		return result;
	}

	hasCursedItem () {
		var result = false;
		for (let slot of this.equipment) {
			if (slot.item instanceof Item && slot.item.sticky === true) {
				return true;
			}
		}
		return result;
	}

	checkRestriction (item) {
		// Shorthand for checking equipment restrictions. Returns true if puppet's name is in the restricted listing.
		return (item.equippable.restrictedTo instanceof Array && item.equippable.restrictedTo.length > 0)
			? (item.equippable.restrictedTo.includes(this.name))
			: true
	}

	standardEquip (item) {
		console.assert(typeof(item.special) === "object",`ERROR in standardEquip of ${item.name}: special property is not object`);
		for (let [pn,v] of Object.entries(item.special)) {
			if (this.stats.hasOwnProperty(pn)) {
				this.stats[pn].addMod(item.name,v,true);
			}
			else if (this.elements.hasOwnProperty(pn)) {
				if (typeof(v) === "number") {
					this.elements[pn].percent.addMod(item.name,v,true);
				} else if (typeof(v) === "object") {
					this.elements[pn].flat.addMod(item.name,v.flat,true);
					this.elements[pn].percent.addMod(item.name,v.percent,true);
				} else {
					console.log(`ERROR in standardEquip for ${item.name}: invalid elements entry`);
				}
			}
			else if (this.tolerances.has(pn)) {
				this.tolerances.get(pn).addMod(item.name,v,true);
			}
		}
	}

	standardRemove (item) {
		console.assert(typeof(item.special) === "object",`ERROR in standardRemove of ${item.name}: special property is not object`);
		for (let [pn,v] of Object.entries(item.special)) {
			if (this.stats.hasOwnProperty(pn)) {
				this.stats[pn].removeMod(item.name);
			}
			else if (this.elements.hasOwnProperty(pn)) {
				if (typeof(v) === "number") {
					this.elements[pn].percent.removeMod(item.name);
				} else if (typeof(v) === "object") {
					this.elements[pn].flat.removeMod(item.name);
					this.elements[pn].percent.removeMod(item.name);
				} else {
					console.log(`ERROR in standardRemove for ${item.name}: invalid elements entry`);
				}
			}
			else if (this.tolerances.has(pn)) {
				this.tolerances.get(pn).removeMod(item.name);
			}
		}
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
