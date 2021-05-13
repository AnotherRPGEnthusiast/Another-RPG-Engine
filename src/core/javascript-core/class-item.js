/*
Customizable equipment:
	If like FFX, equipment has N number of slots that can be filled by traits. Each trait is a distinct item with a specific name and property, e.g. Strength +5% always boosts physical attacks by 5%.

	This could be handled with a trait database, with every trait having a unique description and onEquip functions.

	So for instance...

	"Red Ward": {
		"augment": 0.5,
		"desc": "Red resistance +"+this.augment*100+"%",	\\ no object so this won't work
		"onApply": function (puppet) {
			this.modID.blue = puppet.elements.addMod("red","Red Ward",this.augment,true,"flat");
		}
	}
*/


window.Item = class Item {
/*
Due to the way the Inventory class works (see below), subclass inheritance is not recommended for specialized items. Property flags are used instead.

equippable -> object, must have a "slot" attribute; can also add data for restrictions or special categories (e.g., tag "heavy" then exclude mages from wearing heavy armor, or make an array of characters who can wear it)
*/
	constructor(name,stock = 0){
	if (typeof(name) == 'object') {
		Object.keys(name).forEach(prop => this[prop] = clone(name[prop]));
	} else {
		this._name = name;
		if (this.usable.includes("inmenu") && this.onUse === undefined) {
			console.log(`WARNING: item ${name} does not have an onUse`);
		}
		if (this.equippable && this.onEquip === undefined) {
			console.log(`WARNING: item ${name} does not have an onEquip`);
		}
		if (this.equippable && this.onRemove === undefined) {
			console.log(`WARNING: item ${name} does not have an onRemove`);
		}
		this.stock = stock;
		this.maxstock = stock;

		if (this.equippable !== undefined) {
			this.modID = {};
		}
	}

	}

	get id() {
		//	Returns the item's hardcoded name for referencing the database. Use this for accessing data & etc.

		return this._name;
	}

	get name() {
		//	Returns the name that is displayed to the player in user interfaces & etc.
		//	If the item has a fakeName and does not have the "known" property, displays fakeName; otherwise, displays database name.

		return (this.fakeName && !this.known) ? this.fakeName : this._name;
	}

	get itemData () {
		return (setup.itemData[this.id] || {});
	}

	get info() {
      var val = (this.itemData.info || "Info pending.");
			return (val instanceof Function) ? val(this) : val;
  }

  get desc() {
      var val = (this.itemData.desc || "Description pending.");
			return (val instanceof Function) ? val(this) : val;
  }

	get special() {
    return (this.itemData.special || 0);
  }

	get value() {
		let r = (this.itemData.value || 0);
		console.assert(Number.isInteger(r),`ERROR in value getter for ${this.name}: non-integer value`);

    return (this.itemData.value || 0);
  }

  get usable() {
    return (this.itemData.usable || []);
  }

	get onUse() {
    return (this.itemData.onUse || undefined);
  }

	get instantUse() {
		//	Boolean. If true, the item's onUse will be executed immediately, instead of requiring a target.
		//	This is useful for e.g. items that affect the whole party or call up another passage for more detailed interaction.

		return (this.itemData.instantUse || false);
	}

	get equippable() {
      return (this.itemData.equippable || undefined);
  }

	get onEquip() {
      return (this.itemData.onEquip || undefined);
  }

	get onRemove() {
      return (this.itemData.onRemove || undefined);
  }

	get action() {
		console.assert(this.usable.includes("inbattle"),`ERROR in action getter for ${this.name}: item is not usable inbattle`);
		var name = this.itemData.action || this.name;
		if (this.usable.includes("inbattle")) {
			var action = new ItemAction(name);
			return action;
		} else {
			return undefined;
		}
	}

	get sticky() {
		//	If true, item cannot be unequipped through normal means.

		return (this.itemData.sticky || false);
	}

	get fakeName() {
		//	If defined, the item will display this name on the inventory screen unless its "known" property is true.
		//	Useful for cursed items, or other items you wish to make ambiguous to the player.

		return (this.itemData.fakeName || false);
	}

	checkRestriction (puppet) {
		//	DEPRECIATED as of v1.18. Use the Actor version instead.
		// Shorthand for checking equipment restrictions. Returns true if puppet's name is in the restricted listing or if the restricted listing is empty.
		return (this.equippable.restrictedTo.length == 0 || this.equippable.restrictedTo.includes(puppet.name));
	}

	toString () {
		var text = `<span class="item-name">${this.name}</span>`;
		if (this.equippable) text += `<div class="item-equippable">${this.equippable.slot}</div>`;
		text += `<div class="action-info">${this.info}</div>`;
		text += `<div class="action-desc">${this.desc}</div>`;
		return text;
	}

	clone () {
		// Return a new instance containing our current data.
		return new Item(this);
	}

	toJSON () {
		// Return a code string that will create a new instance
		// containing our current data.
		const data = {};
		Object.keys(this).forEach(pn => data[pn] = clone(this[pn]));
		return JSON.reviveWrapper('new Item($ReviveData$)', data);
	}
};

window.Inventory = class Inventory extends Map {
	constructor(ItemArray){
		var m = [];
		ItemArray.forEach(function(item){
			m.push([item.id,item]);
		});
		super(m);
	}

	clone () {
		// Return a new instance containing our current data.
		return new Inventory(Array.from(this.values()));
	}

	toJSON() {
		// Return a code string that will create a new instance
		// containing our current data.
		let data = Array.from(this.values());
		return JSON.reviveWrapper('new Inventory($ReviveData$)', data);
	}

	addItem (name,amt) {
		if (amt === undefined){
			amt = 1;
		}
		if (this.has(name)){
			if (this.get(name).stock + amt > setup.ITEM_MAX) {
				let s = 1;
				while (((this.get(name).stock + 1) < setup.ITEM_MAX) && s < amt) {
					this.get(name).stock += 1;
					s++;
				}
				return false;
			} else {
				this.get(name).stock += amt;
				return true;
			}
		} else {
			this.set(name,new Item(name,amt));
			return true;
		}
	}

	decItem (name,amt) {
		if (this.has(name)){
			if (amt === undefined){
				amt = 1;
			}
			var v = this.get(name);
			v.stock -= amt;
			if (v.stock <= 0){
				//this.delete(name);
			}
			return;
		} else {
			return "ERROR in decItem: item name not found in inventory\n";
		}
	}
};
