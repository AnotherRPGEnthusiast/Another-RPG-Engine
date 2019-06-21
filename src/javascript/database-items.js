/* Shorthand notation for player inventory. Set this to return whatever you want to call your inventory variable in-game, and it will work without needing to edit any of the code. */
/* By default, the inventory variable is the story variable "$inv" and is defined in StoryInit. To give characters unique inventories, you could define inventories as attributes of the Actor class and set this to return "this.inventory". */
window.inv = function inv () {return V().inv;}

window.Item = class Item {
/*
Due to the way the Inventory class works (see below), subclass inheritance is not recommended for specialized items. Property flags are used instead.

usable -> 1 = in battle only; 2 = out of battle only; 0 = always
equippable -> object, must have a "slot" attribute; can also add data for restrictions or special categories (e.g., tag "heavy" then exclude mages from wearing heavy armor, or make an array of characters who can wear it)
*/
	constructor(name,stock){
		this.name = name;
		if (stock === undefined){
			this.stock = 0;
		} else {
			this.stock = stock;
		}
		this.info = "Info pending.";
		this.desc = "Description pending.";
		
		switch (name) {
			
			// CONSUMABLES
			
			case "Antidote":
				this.usable = 1;
				this.cost = 2;
				this.info = "Cures Poisoned.";
				this.desc = "Isn't it convenient that everyone in the arena uses the exact same poison?";
				break;

			case "Fire Extinguisher":
				this.usable = 1;
				this.cost = 2;
				this.info = "Cures Burning.";
				this.desc = "...This is a bucket of water. MegaCorp are cheapskates.";
				break;

			case "Canned Air":
				this.usable = 1;
				this.cost = 2;
				this.info = "Cures Winded and restores 1 Energy.";
				this.desc = "Regular inhalers are too pedestrian for MegaCorp, apparently. You're not entirely sure what's in this, but it gives more of a kick than regular oxygen.";
				break;

			case "Healing Crystal":
				this.usable = 1;
				this.cost = 2;
				this.info = "Cures Dizzy.";
				this.desc = "A magic crystal that supposedly absorbs feelings of confusion and disorientation from the mind. Amazingly, it actually works.";
				break;

			case "Nanites":
				this.usable = 1;
				this.cost = 2;
				this.info = "Cures Injury.";
				this.desc = "MegaCorp®’s patented nanobot surgery machines can fix any injury in a snap! They can fix so many things. They have so many wonderful ideas. Let them in. Let them fix you.";
				break;

			case "Painkiller":
				this.usable = 1;
				this.cost = 2;
				this.info = "Cures Pain.";
				this.desc = "Pain is just your body holding you back. Shut it up with MegaCorp® brand extra-strength painkillers. What does that old meat sack know anyway?";
				break;

			case "Asprin":
				this.usable = 1;
				this.cost = 2;
				this.info = "Cures Headache.";
				this.desc = "Is it normal for asprin to cure a headache that fast? you think. Then you laugh. The headache is making you think such funny thoughts. The headache hurts so much. You would do anything to make it go away. Anything.";
				break;

			case "Panacea":
				this.usable = 1;
				this.cost = 7;
				this.info = "Cures all status ailments.";
				this.desc = "The mythical medicine has jumped out of the history books and onto your shelves! Don't ask how it's made. The answer would only upset you. But you'll take it anyway, won't you?";
				break;

			case "Bottled Chi":
				this.usable = 1;
				this.cost = 3;
				this.info = "Bestows Chi Shield.";
				this.desc = "No need to spend a lifetime meditating on mountains – now you can buy enlightenment right off the shelves! Comes in lemon, berry, and ennui flavors.";
				break;

			case "Stimulant":
				this.usable = 1;
				this.cost = 4;
				this.info = "Restores 5 Energy.";
				this.desc = `Just "Stimulant". What kind? No need to trouble yourself. It keeps your puppets going, and that's all that matters, right?`;
				break;

			case "Adrenaline":
				this.usable = 1;
				this.cost = 2;
				this.info = "Bestows an ATK Boost.";
				this.desc = "A hormone that releases the body's stored sugars into the bloodstream, providing a boost in energy. At least, that's what normal adrenaline is. You can keep injecting MegaCorp's version all day without crashing. It could be something as innocuous as including extra sugars to replace the ones lost in the adrenaline rush. It could be.";
				break;

			case "Stoneskin":
				this.usable = 1;
				this.cost = 2;
				this.info = "Bestows a DEF Boost.";
				this.desc = "Lather yourself up with Stoneskin formula and watch the slings and arrows of misfortune bounce off your natural armor! Don't worry, there are no lasting side-effects anymore. Many, many test subjects valiantly donated their bodies to science to ensure your safety!";
				break;

			case "Nootropic":
				this.usable = 1;
				this.cost = 2;
				this.info = "Bestows a SPC Boost.";
				this.desc = "Performance-enhancing drugs: not just for athletes! Put your mind into overdrive with MegaCorp®'s new brain-boosting formula.";
				break;

			case "Throwing Knife":
				this.usable = 1;
				this.cost = 4;
				this.info = "Inflicts high damage to one enemy.";
				this.desc = "Very different from an ordinary knife! The weight has to be balanced just so, and the cutting edge is dull -- more of a dart than a knife. But it'll fly straight and true.";
				break;

			case "Powdered Glass":
				this.usable = 1;
				this.cost = 4;
				this.info = "Damages and Stuns one enemy.";
				this.desc = "By crushing glass in just the right way, you can grind it into shards so tiny they look like grains of sand. Throw it into someone's eyes, and, well, you get the picture. They won't, because it's kind of hard to see with sharp things in your eyes.";
				break;

			case "Grenade":
				this.usable = 1;
				this.cost = 6;
				this.info = "Inflicts high damage to one enemy; remaining enemies take half damage.";
				this.desc = "It's just a grenade. Just a totally normal explosive powered by totally mundane chemical reactions. You're sure. You're pretty sure. You stare at it nervously, daring it to show you what dark arts MegaCorp used to make it.";
				break;

			case "Flamethrower":
				this.usable = 1;
				this.cost = 7;
				this.info = "Damages and Burns all enemies. Damage is greater against fewer enemies.";
				this.desc = "Have a burning need to burn your enemies to ash? Try the MegaCorp® Flamethrower 4000! No longer has the potential for those embarrassing backfire explosions you got with the 3000.";
				break;

			case "Gas Bomb":
				this.usable = 1;
				this.cost = 7;
				this.info = "Damages and Poisons all enemies. Damage is greater against fewer enemies.";
				this.desc = `You don't know what kind of "gas" is supposed to be in this. Perhaps it's better that way. The casing feels oddly soft, like rotting flesh.`;
				break;

			case "Calamity Bomb":
				this.usable = 1;
				this.cost = 5;
				this.info = "Damages an enemy and inflicts Injury, Pain, and Headache.";
				this.desc = "A small, strange explosive wrapped in cursed scrolls.";
				break;

			case "Flashbang":
				this.usable = 1;
				this.cost = 5;
				this.info = "Stuns all enemies.";
				this.desc = "This bomb contains chemicals that shine brightly instead of exploding. The flash is so bright it'll shock your foes' retinas into blindness, for a time.";
				break;
			
			// EQUIPMENT
			
			/* If you don't plan to call item data directly through a function or iterator, you can use equipment to modify character by proxy via the onEquip and onRemove functions. These are passed the character being equipped and can modify their attributes in any way you choose. Typically, these functions would be inverses of each other, but you can add special functionality for one or the other for e.g. cursed items. */

			/* Kudos if you recognize where I got the default items' naming scheme from. */
			
			case "Symbol of Destruction":
				this.equippable = {slot: "Weapon", tags: ["symbol"], restrictedTo: false};
				this.onEquip = function (puppet) {
					puppet.setBonus("Attack",5);
					puppet.onAttack = {type: "Pain", weight: 0.9, dur: 2};
				}
				this.onRemove = function (puppet) {
					puppet.setBonus("Attack",-5);
					puppet.onAttack = {};
				}
				break;
			
			case "Aura of Protection":
				this.equippable = {slot: "Armor", tags: ["aura"], restrictedTo: false};
				this.onEquip = function (puppet) {
					puppet.setTol("Stunned",true);
					puppet.setTol("Off-Balance",1);
				}
				this.onRemove = function (puppet) {
					puppet.setTol("Stunned",false);
					puppet.setTol("Off-Balance",-1);
				}
				break;
				
			case "Color of Growth":
				this.equippable = {slot: "Accessory", tags: ["color"], restrictedTo: false};
				this.onEquip = function (puppet) {
					puppet.HPregen += 0.01;
					puppet.elements.inc("red",-0.25);
				}
				this.onRemove = function (puppet) {
					puppet.HPregen -= 0.01;
					puppet.elements.inc("red",0.25);
				}
				break;
			
			default:
				this.info = "Unidentified item.";
		}
		
		if (this.usable && !this.action){
			/* Default construction for usable items is an ItemAction with the same name as the item. Can also define actions manually in cases. */
			this.action = new ItemAction(name);
		}
	}
}

window.Inventory = class Inventory extends Map {
	constructor(ItemArray){
	if (ItemArray instanceof Array){
		var m = [];
		ItemArray.forEach(function(item){
			m.push([item.name,item]);
		});
		super(m);
	}
	else {
		super(ItemArray);
		Object.keys(ItemArray).forEach(prop => this[prop] = clone(ItemArray[prop]));
	}
	}
	
	addItem (name,amt) {
		if (amt === undefined){
			amt = 1;
		}
		if (this.has(name)){
			this.get(name).stock += amt;
		} else {
			this.set(name,new Item(name,amt));
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
}

Item.prototype.clone = function () {
	// Return a new instance containing our current data.
	return new Item(this.name,this.stock);
};

Item.prototype.toJSON = function () {
	// Return a code string that will create a new instance
	// containing our current data.
	return JSON.reviveWrapper(String.format(
		'new ItemAction({0},{1})',
		JSON.stringify(this.name),
		JSON.stringify(this.stock)
	));
};

Inventory.prototype.clone = function () {
	// Return a new instance containing our current data.
	return new Inventory(this);
};

Inventory.prototype.toJSON = function () {
	// Return a code string that will create a new instance
	// containing our current data.
	const data = {};
    Object.keys(this).forEach(pn => data[pn] = clone(this[pn]));
    return JSON.reviveWrapper('new Inventory($ReviveData$)', data);
};
