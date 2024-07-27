window.Item = class Item {
	//	RELEVANT SETUP VARIABLES:
	//		ITEM_MAX: Default stackSize for items if none defined.

	constructor(name,stock = 1){
	if (typeof(name) == 'object') {
		// clone branch
		Object.keys(name).forEach(prop => this[prop] = clone(name[prop]));
	} else {
		// standard branch
		this.id = "_" + (new Date().getTime() + Math.random() * 0x10000000000).toString(16);
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
		if (this.itemData && Number.isInteger(this.itemData.uses)) {
			this._uses = new FillStat(this.itemData.uses);
		} else {
			this._uses = new FillStat(1);
		}

		if (this.equippable !== undefined) {
			this.modID = {};
		}
	}

	}

	get name() {
		return this._name;
	}

	get displayName() {
		//	Returns the name that is displayed to the player in user interfaces & etc.
		//	If the item has a fakeName and does not have the "known" property, displays fakeName; otherwise, displays database name.

		return (this.fakeName && !this.known) ? this.fakeName : this.name;
	}

	get itemData () {
		return (setup.itemData[this.name] || {});
	}

	get stock() {
		return this._stock;
	}

	set stock(amt) {
		//	Ensures stock cannot go below 0 or above stackSize.
		//	Throws error if amt is non-integer.

		console.assert(Number.isInteger(amt),`ERROR in stock setter for ${this.name}: non-integer amt. Echo: ${amt}`);
		console.assert(amt <= this.stackSize,`ERROR in stock setter for ${this.name}: ${amt} exceeds stack size ${this.stackSize}.`);
		this._stock = Math.clamp(amt,0,this.stackSize);
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
		//	Integer. Number of currency units required to buy the item.

		let r = (this.itemData.value || 0);
		r = (r instanceof Function) ? r(this) : r;
		console.assert(Number.isInteger(r),`ERROR in value getter for ${this.name}: non-integer value`);

    return r;
  }

	get sellValue() {
		//	Integer. Number of currency units item can be sold for.

		let r = (this.itemData.sellValue || this.value);
		r = (r instanceof Function) ? r(this) : r;
		console.assert(Number.isInteger(r),`ERROR in sellValue getter for ${this.name}: non-integer value`);

    return r;
	}

  get usable() {
		//	Array of strings. Determines the contexts in which the item can be used, if any.
		//		-"inmenu" allows the item to be used in the menu (make sure there is a defined onUse!)
		//		-"inbattle" allows the item to be used in battle (make sure there is an associated action!)

    return (this.itemData.usable || []);
  }

	get uses () {
		//	currentVal of the item's uses property. Number of times the item can be used before expiring.
		//	Assumes _uses is a FillStat

		return this._uses instanceof FillStat ? this._uses.currentVal : undefined;
	}

	set uses (amt) {
		if (this.uses !== undefined) { this._uses.currentVal = Math.clamp(amt,0,this._uses.current); }
	}

	get maxUses () {
		return this._uses instanceof FillStat ? this._uses.current : undefined;
	}

	set maxUses (amt) {
		if (this.uses !== undefined) { this._uses.base = amt; }
	}

	get onUse() {
		//	Function. Run when the item is used outside of battle.

    return (this.itemData.onUse || undefined);
  }

	get instantUse() {
		//	Boolean. If true, the item's onUse will be executed immediately, instead of requiring a target.
		//	This is useful for e.g. items that affect the whole party or call up another passage for more detailed interaction.

		return (this.itemData.instantUse || false);
	}

	get equippable() {
		// Generic object. Has the following properties:
		//		"slots": String or Array of strings. Must match the equipment slot(s)
		//			where the item is to be equipped EXACTLY.
		//		"multislot": Boolean. If true, item will occupy every slot listed
		//			in "slots" when equipped.
		//		"restrictedTo": Array of strings. Can only be equipped by characters
		//			with names matching the strings.
		//			To make equipment with no restrictions, use an empty array.
		//		"tags": [OPTIONAL] Array of strings. Additional metadata for other
		//			logic, e.g. special rules for "heavy armor".

    return (this.itemData.equippable || undefined);
  }

	get slots() {
		// Returns valid equipment slots, based on equippable object.
		// If equippable.slots is a single string, will be returned as
		//	a one-element array containing that string.
		// If item has no equippable object, returns empty array.

		if (this.itemData.equippable) {
			console.assert(typeof(this.itemData.equippable.slots) === "string" || this.itemData.equippable.slots instanceof Array,`ERROR in slots getter for ${this.name}: slots property is neither string nor Array`);
			return typeof(this.itemData.equippable.slots) === "string"
				? [this.itemData.equippable.slots]
				: this.itemData.equippable.slots;
		} else {
			return [];
		}
	}

	get onEquip() {
		// Function. Executed when item is equipped.

    return (this.itemData.onEquip || undefined);
  }

	get onRemove() {
		// Function. Executed when item is unequipped.

    return (this.itemData.onRemove || undefined);
  }

	get action() {
		//	Action to be called when item is used in battle.
		//	Requires "usable" property to include "inbattle".

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
		//	Boolean. If true, item cannot be unequipped through normal means.

		return (this.itemData.sticky || false);
	}

	get fakeName() {
		//	String. If defined, the item will display this name on the
		//		inventory screen unless its "known" property is true.
		//	Useful for cursed items, or other items you wish to make ambiguous
		//		to the player.

		return (this.itemData.fakeName || false);
	}

	get stackSize() {
		//	Integer. Maximum number of copies that can exist in an inventory.
		//	Defaults to ITEM_MAX.
		//	If item has variable uses, this MUST be 1, or the engine will be unable
		//		to differentiate between items with different uses.

		if (this.maxUses > 1) {
			return 1;
		}
		let val = this.itemData.stackSize;
		if (Number.isInteger(val) && val > 0) {
			return val;
		} else {
			return setup.ITEM_MAX;
		}
	}

	get restrictedTo () {
		//	Shorthand for getting the restrictedTo property of the equippable object.

		return (typeof(this.equippable) == "object")
			? this.equippable.restrictedTo
			: undefined;
	}

	get tags () {
		let r = (this._tags || this.itemData.tags || []);
		if (typeof(r) === "string") r = [r];
		console.assert(r instanceof Array,`ERROR in item ${this.name}: tags must be array`);
		return r;
	}

	checkRestriction (puppet) {
		//	DEPRECIATED as of v1.18. Use the Actor version instead.
		// Shorthand for checking equipment restrictions. Returns true if puppet's name is in the restricted listing or if the restricted listing is empty.
		return (this.restrictedTo instanceof Array)
			? (this.restrictedTo.includes(puppet.name))
			: true
	}

	toString () {
		var text = `<span class="itemstock-detail">x${this.stock}</span>`;
		text += `<div class="item-header">`;
		text += `<span class="item-name">${this.displayName}</span>`;
		if (this.equippable) {
			text += `<div class="action-tags"><span>`;
			let t = (this.multislot) ? " & " : " / ";
			this.slots.forEach(function(slot,s) {
				text += slot;
				if (s < this.slots.length-1) text += t;
			},this);
			text += `</span></div>`;
		}
		text += `</div>`;
		text += `<div id="display-content">`;
		text += `<div class="action-info">${this.info}</div>`;
		if (this.restrictedTo instanceof Array && this.restrictedTo.length > 0) {
			text += `<div class="item-restriction">Restriction:`;
			this.restrictedTo.forEach(function(name,n) {
				text += ` ${name}`;
				if (n < this.restrictedTo.length-1) text += ", ";
			},this);
			text += `</div>`;
		}
		if (this.desc !== null) text += `<div class="action-desc">${this.desc}</div>`;
		text += `</div>`;
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

window.Filler = class Filler {
	//	Junk object used to visually fill slots taken up by multi-slot equipment.

	constructor(name) {
		this.name = name;
	}

	toString () {
		return "&mdash;&mdash;";
	}

	clone () {
		// Return a new instance containing our current data.
		return new Filler(this.name);
	}

	toJSON () {
		// Return a code string that will create a new instance
		// containing our current data.
		let data = this.name;
		return JSON.reviveWrapper('new Filler($ReviveData$)', data);
	}
};

window.Inventory = class Inventory extends Array {
	//	RELEVANT SETUP VARIABLES:
	//		DUPLICATE_ITEMS: Boolean. If true, multiple stacks of the same item can
	//			exist in the inventory. If false, items over the stack size limit
	//			cannot be added.
	//		REMOVE_ITEMS: Boolean. If true, items reduced to 0 stock are removed
	//			from inventory.

	constructor(ItemArray=[],size=0){
		//	ItemArray: Array of Item objects. Will be inserted into the Inventory
		//		during construction.
		//	size: Integer. Determines the maximum number of item stacks
		//		the Inventory is allowed to hold. If Inventory is full, new items
		//		cannot be picked up. (see addItem in methods)
		//		Set <= 0 to create a limitless Inventory.

//		console.log("constructing Inventory, ItemArray:"); console.log(ItemArray);
		if (typeof(ItemArray) === "object" && !(ItemArray instanceof Array)) {
			// clone branch
			super(0);
			Object.keys(ItemArray).forEach(prop => this[prop] = clone(ItemArray[prop]));
		} else if (ItemArray instanceof Array) {
			// standard branch
			super(0);
			console.assert(size <= 0 || ItemArray.length <= size,`ERROR constructing Inventory: ItemArray must not exceed size`);
			ItemArray.forEach(function(item){
				this.push(item);
			},this);
			console.assert(Number.isInteger(size),`ERROR constructing Inventory: size must be integer`);
			this.size = size;
		} else {
			// failsafe, should never execute
			super(0);
			console.log(`Inventory constructor: something unexpected happened. Echo:`);
			console.log(ItemArray);
		}
	}

	clone () {
		// Return a new instance containing our current data.
		return new Inventory(this);
	}

	toJSON() {
		// Return a code string that will create a new instance
		// containing our current data.
		const data = {};
		Object.keys(this).forEach(pn => data[pn] = clone(this[pn]));
		return JSON.reviveWrapper('new Inventory($ReviveData$)', data);
	}

	get isFull() {
		// Returns Boolean determining if inventory is full.
		// If the inventory's size is 0, is never considered full.

		return (this.size > 0 && this.length < this.size);
	}

	get(name) {
		//	Find and return the first instance of an item by name.
		console.assert(typeof(name) === "string",`ERROR in Inventory.get: ${name} is not a string`);

		return this.find(item => item.name === name);
	}

	getById(id) {
		//	Find and return an item by its unique id.

		return this.find(item => item.id === id);
	}

	addItem (item,amt = 1,recursive) {
		//	Adds an item to the inventory while accounting for stack and size
		//		limits, etc.
		//	item: String or Item.
		//		If string, a new Item object named by item will be created.
		//		If Item, the Item object will be added directly.
		//	amt: Positive integer. Number of items to add. Defaults to 1.
		//	recursive: Boolean.

		//	Return value: If item added successfully, returns true; else, returns
		//		remaining stock that could not fit into inventory.

		console.assert(Number.isInteger(amt) && amt > 0,`ERROR in addItem: amt was not positive integer. Echo: ${amt}`);
		var itemToAdd;
		var curItem;
		var result;

		// 1: Are we creating a new item by name or adding a premade Item?
		if (typeof(item) === "string" && item.charAt(0) !== "_") {
			// If string and not ID, check if any instances of the item already exist
//			console.log("finding item by name; this is the first call");
			curItem = this.get(item);
			itemToAdd = new Item(item);
		} else if (typeof(item) === "string" && item.charAt(0) === "_") {
			// If ID, find the existing item matching the ID
			curItem = this.getById(item);
			// If a recursive call, must generate a new Item to create unique ID
			itemToAdd = (recursive === true) ? new Item(curItem.name,1) : curItem;
		} else if (item instanceof Item) {
			// If Item, just add it
			if (!this.isFull) {
				this.push(item);
				return true;
			} else {
				return item.stock;
			}
		} else {
			console.log(`ERROR in addItem: item was not string or Item. Echo:`); console.log(item);
			return false;
		}

		// 2: Does this Inventory already contain the item?
		if (curItem) {
			console.log("item exists in inventory");
			// If get() found an item, the result will be truthy and we proceed to this branch.
			// 3: Will adding this item exceed the found item's stackSize?
			var excess = (curItem.stock + amt) - curItem.stackSize;
			console.log(`excess = ${excess}`);
			if (excess > 0) {
				console.log("executing excess > 0 branch");
				// If yes...
				if (curItem.stock < curItem.stackSize) {
					// Max out curItem's stock, unless that's already true.
					curItem.stock = curItem.stackSize;
//					console.log(`stock maxed`);
				}
				// 3a: Are duplicate items allowed?
				if (setup.DUPLICATE_ITEMS === true) {
					console.log("duplicate items branch executing");
					// 3b: Do any other stacks of the same item already exist?
					curItem = this.find(i => (i.name === itemToAdd.name) && i.stock < i.stackSize);
					if (curItem) {
						console.log("another stack exists, enter recursion");
						// If yes, recursively call addItem again with the remaining amt.
						result = this.addItem(curItem.id,excess,true);
						// RECURSIVE LOOP, WILL END WHEN REMAINDER EXHAUSTED OR ALL ITEM INSTANCES MAXED OUT
						return result;
					} else if (!this.isFull) {
//						console.log("other stack does not exist, add new stack");
						// If no, 3c: Does this inventory have empty slots?
						// If yes, add the item as a new element to the inventory
						//	and reduce remainder by 1.
						this.push(itemToAdd);
						excess -= 1;
						// If excess still exists, recursively call addItem again.
						if (excess > 0) {
//							console.log(`remainder ${excess}, enter recursion`);
							result = this.addItem(itemToAdd.id,excess,true);
							// RECURSIVE LOOP, WILL END WHEN REMAINDER EXHAUSTED OR INVENTORY FILLED
							return result;
						} else {
//							console.log("no excess, done");
							return true;
							// END METHOD
						}
					} else {
						// If no, nothing more can be done. Return the remainder.
						return excess;
						// END METHOD
					}
				} else {
					// If no, nothing more can be done. Return the remainder.
					return excess;
					// END METHOD
				}
			} else {
				// If no, amt can be added to stock without issue.
//				console.log("excess does not exceed stackSize, done");
				curItem.stock += amt;
				return true;
				// END METHOD
			}
		}

		// If inventory does not contain the item, add it as a new element.
//		console.log("item not in inventory");
		this.push(itemToAdd);
		// If remainder still exists, recursively call addItem again.
		if (amt - 1 > 0) {
//			console.log(`Item added, remainder: ${amt - 1}`);
			result = this.addItem(itemToAdd.id,amt - 1,true);
			// RECURSIVE LOOP, WILL END WHEN AMT EXHAUSTED OR INVENTORY FILLED
			return result;
		} else {
			return true;
			// END METHOD
		}
	}

	decItem (item,amt = 1) {
		//	Decreases item stock. Optionally removes items from inventory if
		//		their stock is reduced to 0.
		//		Throws error if arguments are invalid types or item cannot be found.
		//	item: String or Item.
		//		If string, acts on first instance of the item in inventory.
		//		If Item, acts on instance matching item's ID.
		//	amt: Positive integer. Number of items to remove. Defaults to 1.

		console.assert(Number.isInteger(amt) && amt > 0,`ERROR in decItem: amt was not positive integer. Echo: ${amt}`);
		if (setup.DUPLICATE_ITEMS === true && typeof(item) === "string") {
			var curItems;
			curItems = this.filter(i => (i.name === item));
			console.assert(curItems.length > 0,`ERROR in decItem: item not found in inventory`);
			curItems.sort(function(a,b) { return a.stock - b.stock });
			for (let i of curItems) {
				if (amt > i.stock) {
					amt -= i.stock;
					i.stock = 0;
				} else {
					i.stock -= amt;
					break;
				}
			}
			if (setup.REMOVE_ITEMS) {
				this.deleteWith(i => i.stock <= 0);
			}
		} else {
			var curItem;
			if (typeof(item) === "string") {
				// If string, check if any instances of the item already exist
				curItem = this.get(item);
			} else if (item instanceof Item) {
				// If Item, check if an item matching its unique ID already exists
				curItem = this.getById(item.id);
			} else {
				console.log(`ERROR in decItem: item was not string or Item. Echo:`); console.log(item);
				return false;
			}
			console.assert(curItem instanceof Item,`ERROR in decItem: item not found in inventory`);

			curItem.stock -= amt;
			if (setup.REMOVE_ITEMS && curItem.stock <= 0) {
				this.delete(curItem);
			}
		}
		return true;
	}

	clearItems (name) {
		//	Removes all instances of a given item from the inventory.
		//	name: String. Name of item to target.
		//	Returns the removed items.

		console.assert(typeof(name) === "string",`ERROR in clearItems: name was not string. Echo: ${name}`);
		return this.deleteWith(item => item.name === name);
	}
};

setup.itemData = {};
