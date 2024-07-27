//  Data for the items used by the engine tutorial. If the default inventory setup code is removed, this can be safely deleted.

Object.assign(setup.itemData, {

	// CONSUMABLES

	"Salve": {
		"usable": ["inbattle","inmenu"],
		"special": setup.actionData["Salve"].special,
		"onUse": function (puppet) {
			puppet.hp += this.special;
			inv().decItem(this.name);
			return;
		},
		"info": function (item) { console.log(item); return `Restores ${item.special} HP.`},
		"desc": "A glowing, viscous fluid within a glass bottle. Supposedly, it instantly heals wounds when applied. You're not sure how, but it's better than dying. Probably."
	},

	"Antidote": {
		"usable": ["inbattle"],
		"value": 2,
		"info": "Cures Poisoned.",
		"desc": "Isn't it convenient that everyone in the arena uses the exact same poison?"
	},

	"Fire Extinguisher": {
		"usable": ["inbattle"],
		"value": 2,
		"info": "Cures Burning.",
		"desc": "...This is a bucket of water. MegaCorp are cheapskates."
	},

	"Canned Air": {
		"usable": ["inbattle"],
		"value": 2,
		"info": "Cures Winded and restores 1 Energy.",
		"desc": "Regular inhalers are too pedestrian for MegaCorp, apparently. You're not entirely sure what's in this, but it gives more of a kick than regular oxygen."
	},

	"Healing Crystal": {
		"usable": ["inbattle"],
		"value": 2,
		"info": "Cures Dizzy.",
		"desc": "A magic crystal that supposedly absorbs feelings of confusion and disorientation from the mind. Amazingly, it actually works."
	},

	"Nanites": {
		"usable": ["inbattle"],
		"value": 2,
		"info": "Cures Injury.",
		"desc": "MegaCorp®’s patented nanobot surgery machines can fix any injury in a snap! They can fix so many things. They have so many wonderful ideas. Let them in. Let them fix you."
	},

	"Painkiller": {
		"usable": ["inbattle"],
		"value": 2,
		"info": "Cures Pain.",
		"desc": "Pain is just your body holding you back. Shut it up with MegaCorp® brand extra-strength painkillers. What does that old meat sack know anyway?"
	},

	"Asprin": {
		"usable": ["inbattle"],
		"value": 2,
		"info": "Cures Headache.",
		"desc": "Is it normal for asprin to cure a headache that fast? you think. Then you laugh. The headache is making you think such funny thoughts. The headache hurts so much. You would do anything to make it go away. Anything."
	},

	"Panacea": {
		"usable": ["inbattle"],
		"value": 10,
		"info": "Cures all status ailments.",
		"desc": "The mythical medicine has jumped out of the history books and onto your shelves! Don't ask how it's made. The answer would only upset you. But you'll take it anyway, won't you?"
	},

	"Bottled Chi": {
		"usable": ["inbattle"],
		"value": 2,
		"info": "Bestows Chi Shield.",
		"desc": "No need to spend a lifetime meditating on mountains – now you can buy enlightenment right off the shelves! Comes in lemon, berry, and ennui flavors."
	},

	"Stimulant": {
		"usable": ["inbattle"],
		"value": 10,
		"info": "Restores 5 Energy.",
		"desc": `Just "Stimulant". What kind? No need to trouble yourself. It keeps your puppets going, and that's all that matters, right?`
	},

	"Adrenaline": {
		"usable": ["inbattle"],
		"value": 3,
		"info": "Bestows an ATK Boost.",
		"desc": "A hormone that releases the body's stored sugars into the bloodstream, providing a boost in energy. At least, that's what normal adrenaline is. You can keep injecting MegaCorp's version all day without crashing. It could be something as innocuous as including extra sugars to replace the ones lost in the adrenaline rush. It could be."
	},

	"Stoneskin": {
		"usable": ["inbattle"],
		"value": 3,
		"info": "Bestows a DEF Boost.",
		"desc": "Lather yourself up with Stoneskin formula and watch the slings and arrows of misfortune bounce off your natural armor! Don't worry, there are no lasting side-effects anymore. Many, many test subjects valiantly donated their bodies to science to ensure your safety!"
	},

	"Nootropic": {
		"usable": ["inbattle"],
		"value": 3,
		"info": "Bestows a SPC Boost.",
		"desc": "Performance-enhancing drugs: not just for athletes! Put your mind into overdrive with MegaCorp®'s new brain-boosting formula."
	},

	"Throwing Knife": {
		"usable": ["inbattle"],
		"value": 3,
		"info": "Inflicts high damage to one enemy.",
		"desc": "Very different from an ordinary knife! The weight has to be balanced just so, and the cutting edge is dull -- more of a dart than a knife. But it'll fly straight and true."
	},

	"Powdered Glass": {
		"usable": ["inbattle"],
		"value": 4,
		"info": "Damages and Stuns one enemy.",
		"desc": "By crushing glass in just the right way, you can grind it into shards so tiny they look like grains of sand. Throw it into someone's eyes, and, well, you get the picture. They won't, because it's kind of hard to see with sharp things in your eyes."
	},

	"Grenade": {
		"usable": ["inbattle"],
		"value": 6,
		"info": "Inflicts high damage to one enemy, remaining enemies take half damage.",
		"desc": "It's just a grenade. Just a totally normal explosive powered by totally mundane chemical reactions. You're sure. You're pretty sure. You stare at it nervously, daring it to show you what dark arts MegaCorp used to make it."
	},

	"Flamethrower": {
		"usable": ["inbattle"],
		"value": 6,
		"info": "Damages and Burns all enemies. Damage is greater against fewer enemies.",
		"desc": "Have a burning need to burn your enemies to ash? Try the MegaCorp® Flamethrower 4000! No longer has the potential for those embarrassing backfire explosions you got with the 3000."
	},

	"Gas Bomb": {
		"usable": ["inbattle"],
		"value": 6,
		"info": "Damages and Poisons all enemies. Damage is greater against fewer enemies.",
		"desc": `You don't know what kind of "gas" is supposed to be in this. Perhaps it's better that way. The casing feels oddly soft, like rotting flesh.`
	},

	"Calamity Bomb": {
		"usable": ["inbattle"],
		"value": 6,
		"info": "Damages an enemy and inflicts Injury, Pain, and Headache.",
		"desc": "A small, strange explosive wrapped in cursed scrolls."
	},

	"Flashbang": {
		"usable": ["inbattle"],
		"value": 5,
		"info": "Stuns all enemies.",
		"desc": "This bomb contains chemicals that shine brightly instead of exploding. The flash is so bright it'll shock your foes' retinas into blindness, for a time."
	},

	"Smelling Salts": {
		"usable": ["inbattle"],
		"info": "Cures Asleep.",
		"desc": "Resist the urge to sniff these, the pungent mix of ammonia and other nasty stuff won't be fragrant at all. This is designed to shock a body back into consciousness no matter how battered its state. It's jokingly said to be strong enough to wake the dead, but this is (currently) beyond MegaCorp's capabilities. It will, however, wake puppets from even magical sleep, so strong is the body's desire to escape the smell."
	},

	"Anti-Mineral Water": {
		"usable": ["inbattle"],
		"info": "Cures Petrification.",
		"desc": `Takes the "in" out of "inorganic"! Using it on materials not originally organic is not recommended.`
	},

	"Apple of Life": {
		"usable": ["inmenu"],
		"onUse": function (puppet) {
			puppet.maxhp += 100;
			inv().decItem(this.name);
			return `${puppet.name} gains 100 max HP!`;
		},
		"info": "Permanently increases max HP by 100.",
		"desc": `The apple Adam and Eve didn't eat. It's lost much of its power, this far from the Garden, but it'll still make a puppet a little more vivacious than usual.`
	},

	// EQUIPMENT

	// If you don't plan to call item data directly through a function or iterator,
	// you can use equipment to modify character by proxy via the onEquip
	// and onRemove functions. These are passed the character being equipped
	// and can modify their attributes in any way you choose. Typically,
	// these functions would be inverses of each other, but you can add
	// special functionality for one or the other for e.g. cursed items.

	// restrictedTo must be defined and must be an array. Make it an empty array to make equipment unrestricted.
	// Kudos if you recognize where I got the default items' naming scheme from.

	"Example Equipment": {
		"equippable": {slot: "", restrictedTo: []},
		"tags": [],
		"onEquip": function (puppet) {

		},
		"onRemove": function (puppet) {

		},
		"desc": "",
		"info": ""
	},


	"Symbol of Destruction": {
		"equippable": {slots: "Weapon", restrictedTo: []},
		"tags": ["symbol"],
		"special": {
			"Attack": 5,
		},
		"onEquip": function (puppet) {
			for (let [pn,v] of Object.entries(this.special)) {
				puppet.stats[pn].addMod("Symbol of Destruction",v,true);
			}
		},
		"onRemove": function (puppet) {
			for (let [pn,v] of Object.entries(this.special)) {
				puppet.stats[pn].removeMod("Symbol of Destruction");
			}
		},
		"desc": "A weapon.",
		"info": "ATK +5"
	},

	"Aura of Protection": {
		"equippable": {slots: "Armor", restrictedTo: []},
		"tags": ["aura"],
		"onEquip": function (puppet) {
			puppet.tolerances.addMod("Stunned","Aura of Protection",{ immune: true });
			puppet.tolerances.addMod("Off-Balance","Aura of Protection",1);
		},
		"onRemove": function (puppet) {
			puppet.tolerances.removeMod("Stunned","Aura of Protection");
			puppet.tolerances.removeMod("Off-Balance","Aura of Protection");
		},
		"desc": "An armor.",
		"info": "Stunned Immunity | Off-Balance Tol +1"
	},

	"Color of Defeat": {
		"equippable": {slots: "Accessory", restrictedTo: ["Artist","Mage"]},
		"tags": ["color"],
		"onEquip": function (puppet) {
			this.modID.HPregen = puppet._HPregen.flat.addMod("Color of Defeat",1,true);
			this.modID.blue = puppet.elements.addMod("blue","Color of Defeat",25,true,"flat");
		},
		"onRemove": function (puppet) {
			puppet._HPregen.flat.removeMod("Color of Defeat",this.modID.HPregen);
			puppet.elements.removeMod("blue","Color of Defeat",this.modID.blue,"flat");
		},
		"desc": "Something else.<br/>Text.<br/>Text.",
		"info": "HP regeneration +1 | Blue soak +25"
	},

	"Color of Growth": {
		"equippable": {slots: "Accessory", restrictedTo: []},
		"tags": ["color"],
		"onEquip": function (puppet) {
			this.modID.HPregen = puppet._HPregen.percent.addMod("Color of Defeat",0.01,true);
			this.modID.red = puppet.elements.addMod("red","Color of Defeat",-0.25,true,"percent");
		},
		"onRemove": function (puppet) {
			puppet._HPregen.percent.removeMod("Color of Defeat",this.modID.HPregen);
			puppet.elements.removeMod("red","Color of Defeat",this.modID.red,"percent");
		},
		"desc": "Something else.",
		"info": "HP regeneration +1% | Red resistance +25%"
	},

	"Cursed Ring": {
		"equippable": {slots: "Accessory", restrictedTo: []},
		"tags": ["ring"],
		"sticky": true,
		"fakeName": "Mysterious Ring",
		"onEquip": function (puppet) {
			this.modID = puppet.stats["Attack"].addMod("Cursed Ring",-1,true);
			this.known = true;
		},
		"onRemove": function (puppet) {
			puppet.stats["Attack"].removeMod("Cursed Ring",this.modID);
		},
		"desc": function (item) {
			return (item.known) ? "A cursed ring that saps the wearer's strength."
			: "A mysterious gold ring. You don't know what it does.";
		},
		"info": function (item) {
			return (item.known) ? "CURSED | ATK -1" : "It's a mystery!";
		}
	},

	"Zweihander": {
		"equippable": {slots: ["Weapon","Armor"], restrictedTo: [], multislot: true},
		"onEquip": function (actor) {
			actor.stats["Attack"].addMod("Zweihander",{add: 20},true);
		},
		"onRemove": function (actor) {
			actor.stats["Attack"].removeMod("Zweihander");
		},
		"info": "Attack +20",
		"desc": "A massive sword too heavy to hold in only one hand."
	}
});
