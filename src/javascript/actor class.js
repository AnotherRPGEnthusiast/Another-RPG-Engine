window.Actor = class Actor {
	constructor(name,hp,stats,gender){
	if (typeof(name) == 'object'){
		Object.keys(name).forEach(prop => this[prop] = clone(name[prop]));
	}
	else {
		this.name = name;
		this.hp = hp;
		this.maxhp = hp;
		this.HPregen = 0;
		this.actions = [];
		this.elements = new Map();
		if (V().ELEMENT_LIST !== undefined){
			V().ELEMENT_LIST.forEach(function(x) {
				this.elements.set(x,1);
			}, this);
		}
		this.tolerances = new Map();
		this.isDone = false;
		this.dead = false;		
		this.effects = [];
		this.deathMessage = `${this.name} is defeated!`+"\n";
		
		/* Effect flags. You will probably want to keep noact, but feel free to remove the rest. */
		this.noact = false;
		this.untargetable = false;
		this.protected = false;
		this.guarded = false;
		this.chi = false;
		this.martyr = false;
		this.protector = false;
		this.berserker = false;
		this.defender = false;
		this.poisoned = false;
		this.burning = false;
		this.blessing = false;
		this.curse = false;
		this.offbalance = false;
		this.down = false;
		this.dizzy = false;
		this.stunned = false;
		this.winded = false;
		this.alert = false;
		this.marked = false;
		this.shield = false;
		this.stasis = false;
		this.forsaken = false;
		this.petrified = false;
		
		/* Pronoun object: sub-attributes for objective, subjective, and possessive. Set based on gender given in constructor. If you want special pronouns, can set manually in Twine after object is created. */
		switch (gender.toLowerCase()) {
			case 'f':
			case 'female':
				this.pr = {obj: "her", subj: "she", pos: "her"};
				break;
			case 'm':
			case 'male':
				this.pr = {obj: "him", subj: "he", pos: "his"};
				break;
			case 'n':
			case 'neuter':
			case 'neutral':
			case 'agender':
				this.pr = {obj: "them", subj: "they", pos: "their"};
				break;
			default:
				this.pr = {obj: "it", subj: "it", pos: "its"};
		};
		
		this.them = this.pr.obj;
		this.they = this.pr.subj;
		this.their = this.pr.pos;
		switch (this.pr.subj) {
			case "they":
				this.theyare = "they are";
				break;
			default:
				this.theyare = this.pr.subj + " is";
		}
		
		this.equipment = new Map([
			["Slot A",null],
			["Slot B",null],
			/*(you can add as many slots as you want)*/
			]);
		
		/* "Bonus" is for equipment, "Temp" is for transient changes like stat buff/debuffs. */
		this.stats = new Map([
			["Attack",{Base: stats[0], Bonus: 0, Temp: 0}],
			["Defense",{Base: stats[1], Bonus: 0, Temp: 0}],
			["Special",{Base: stats[2], Bonus: 0, Temp: 0}]
		]);
	}
	}
	
	// GETTERS/SETTERS
	
	setHP (amt) {
		/* Relative setter: keeps HP within bounds on damage or heal */
		this.hp = Math.clamp(this.hp + amt,0,this.maxhp);
	}
	
	setMaxHP (amt) {
		/* Absolute setter: for when both HP and max HP need to be set simultaneously, e.g. form changes. */
		this.hp = amt;
		this.maxhp = amt;
	}
	
	/* calculates effective stats */
	get (key) {
		let v = this.stats.get(key);
		let n = v.Base + v.Bonus + v.Temp;
		if (n < 0 && !(key == "Defense" && this.forsaken)){
				n = 0;
			}
		/* You are probably going to want to change the threshold to 1 for a divisive defense system. */
		return n;
	}
	
	getBase (key) {
		return this.stats.get(key).Base;
	}
	
	getBonus (key) {
		return this.stats.get(key).Bonus;
	}
	
	getTemp (key) {
		return this.stats.get(key).Temp;
	}
	
	setBase (k,v){
		this.stats.get(k).Base = v;
	}
	
	setBonus (k,v){
	/* This setter is relative, not absolute, because that better matches the functionality of most equipment. You could add an additional argument to convey absolute vs. relative, if absolute setting is something you need. */
		this.stats.get(k).Bonus += v;
	}
	
	setTemp (k,v,abs){
		if (abs !== undefined && (abs.toLowerCase() == 'abs' || abs.toLowerCase() == 'absolute')){
			this.stats.get(k).Temp = v;
		} else {
			this.stats.get(k).Temp += v;
		}
	}
	
	// EFFECT FUNCTIONS
	
	addEffect (effect) {
		this.effects.push(effect);
		effect.onApply(this);
		return effect.addText(this.name);
	}
	
	removeEffect (effect,mod) {
		if (!this.stasis || mod == 'pierce'){
			effect.onRemove(this);
			this.effects.delete(effect);
			return effect.removeText(this.name)+"\n";
		} else {
			return `${this.name}'s Stasis held the effect in place!<br/>`;
		}
	}
	
	/*
	removeEffect (id,mod) {
		if (!this.stasis || mod == 'pierce'){
			var effect = this.effects[id];
			this.effects.deleteAt(id);
			effect.onRemove(this);
			return effect.removeText(this.name)+"\n";
		} else {
			return `${this.name}'s Stasis held the effect in place!<br/>`;
		}
	}
	*/
	
	// EQUIPMENT FUNCTIONS
	
	unequip (type,destroy) {
		if (this.equipment.has(item.type) && this.equipment.get(item.type) !== null){
			var item = this.equipment.get(type);
			if (item.default === undefined && destroy != "destroy") {
				inv().addItem(item.name);
			}
			if (this.equipment.get(item.equippable.slot).onRemove !== undefined) {
				this.equipment.get(item.equippable.slot).onRemove(this);
			}
			this.equipment.set(type,null);
			/* If your system always has to read something in an equipment slot, such as if you wish to calculate equipment effects through a call function or iterator, replace the above line with the one below. Remember to define default equipment in the items database. */
			//this.equipment.set(type,new Item("Default "+type));
		}
	}
		
	equip (item) {
		/* To equip an item, we also have to de-equip the existing item and return it to the inventory (unless you want players to lose replaced equipment). This function checks that the equipment slot exists and that it's filled by something. If it is, the current equipment is extracted and added to the inventory before we set the new equipment. */
		/* If the item has any special equipment functionality, such as modifying stats, its onEquip function is passed the actor to modify. */
		if (this.equipment.has(item.equippable.slot)){
			if (this.equipment.get(item.equippable.slot) !== null){
				this.unequip(item.equippable.slot);
			}
			this.equipment.set(item.equippable.slot,item);
			if (item.onEquip !== undefined){
				item.onEquip(this);
			}
			if (inv() !== undefined && inv().has(item.name)){
				inv().decItem(item.name);
			}
		} else {
			return "ERROR: Equipment type not recognized\n";
		}
	}
	
	// TOLERANCE FUNCTIONS
	
	setTol (k, v) {
		/* This function works for both creation and modification (such as from equipment). Tolerances are objects with 3 attributes: current value, maximum value, and immune flag. If "immune" is true, the character has total immunity and cur/max are ignored. To set an immunity, pass "true" as the v argument. To remove an existing immunity, pass "false" as the v argument; previous tolerance values will still remain. To increment or reduce a tolerance value, pass a number as the v argument. */
		/* This function will do nothing if you pass an argument that is not a boolean or integer. To reduce potential clutter on the status screen, it is also not possible to make useless tolerance (0 points and false immunity). */
		if (this.tolerances.has(k)){
			if (typeof(v) == 'boolean'){
				this.tolerances.get(k).immune = v;
			} else if (Number.isInteger(v)){
				this.tolerances.get(k).max += v;
				this.resetTol(k);
			}
			if (this.tolerances.immune == false && this.tolerances.get(k).max <= 0){
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
	
	getTol (key) {
		/* This is for evaluating tolerance in-battle, and therefore only returns the current value. DON'T use it to access the whole tolerance object, because that's not what it returns. */
		if (!this.tolerances.has(key)){
			return undefined;
		} else if (this.tolerances.get(key).immune == true) {
			return 'immune';
		} else {
			return this.tolerances.get(key).cur;
		}
	}
	
	decTol (k) {
		this.tolerances.get(k).cur--;
	}
	
	resetTol (key) {
		this.tolerances.get(key).cur = this.tolerances.get(key).max;
	}
	
	/* Relic of a time when effective stats were stored as an actual attribute. Easier to just calculate them every time with get(). */
	/*
	calcStats (){
		this.stats.forEach( (v,k) => {
			v.Eff = v.Base + v.Bonus + v.Temp;
			if (v.Eff < 0 && !(k == "Defense" && this.forsaken)){
				v.Eff = 0;
			}
		} );
	}
	*/
}

Actor.prototype.clone = function () {
	// Return a new instance containing our current data.
	return new Actor(this);
};

Actor.prototype.toJSON = function () {
	// Return a code string that will create a new instance
	// containing our current data.
	const data = {};
    Object.keys(this).forEach(pn => data[pn] = clone(this[pn]));
    return JSON.reviveWrapper('new Actor($ReviveData$)', data);
};

