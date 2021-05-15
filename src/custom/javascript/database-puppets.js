setup.PUPPET_HP = 1000;

setup.puppetData = {

	"Example": {
		"gender": 'N',
		"hp": 0,
		"stats": {

		},
		"actions": [

		],
		"defaultAction": ''
	},



	"Rogue": {
		"gender": 'N',
		"hp": setup.PUPPET_HP,
		"stats": {
			"Attack"	: 10,
			"Defense"	: 30,
			"Special"	: 50
		},
		"actions": [
			"Crafty",
			"Knife",
			"Crossbow",
			"Something in your eye",
			"Poison Prick",
			"Off Your High Horse",
			"A Farewell to Arms",
			"Below the Belt",
			"Dead Ringer",
			"Flurry",
			"Sneak"
		],
		"defaultAction": "Knife",
		"crisis": "Stash",
		"specialInit": function (actor) {
			actor.crafty = true;
			actor.crisisFactor = (10/4);
			actor.stash = [
				new ItemAction("Panacea"),
				new ItemAction("Bottled Chi"),
				new ItemAction("Adrenaline"),
				new ItemAction("Stoneskin"),
				new ItemAction("Nootropic"),
				new ItemAction("Stimulant"),
				new ItemAction("Powdered Glass"),
				new ItemAction("Grenade"),
				new ItemAction("Flamethrower"),
				new ItemAction("Gas Bomb"),
				new ItemAction("Flashbang"),
				new ItemAction("Calamity Bomb")
			];
			actor.stash.forEach(function (item) {
				item.free = true;
				item._crisis = true;
			});
		}
	},

	"Fighter": {
		"gender": 'N',
		"hp": setup.PUPPET_HP,
		"stats": {
			"Attack"	: 30,
			"Defense"	: 50,
			"Special"	: 10
		},
		"actions": [
			"Firefly",
			"Sword",
			"Punch",
			"Hammer",
			"Bull Rush",
			"Assault",
			"Meditate",
			"Berserker",
			"Defender",
			"Protector",
			"Martyr"
		],
		"defaultAction": "Sword",
		"crisis": "Perfect Defense",
		"specialInit": function (actor) {
			actor.firefly = true;
		}
	},

	"Mage": {
		"gender": 'N',
		"hp": setup.PUPPET_HP,
		"stats": {
			"Attack"	: 50,
			"Defense"	: 10,
			"Special"	: 30
		},
		"actions": [
			"Focus",
			"Sacrifice",
			"Blast",
			"Fireball",
			"Favor",
			"Restoration",
			"Neutralize",
			"Blessing",
			"Curse"
		],
		"defaultAction": "Focus",
		"crisis": "Desperate Attack"
	},

	"Bard": {
		"gender": 'N',
		"hp": setup.PUPPET_HP,
		"stats": {
			"Attack"	: 30,
			"Defense"	: 30,
			"Special"	: 30
		},
		"actions": [
			"Rapier",
			"Dagger",
			"Shout",
			"Non-Sequitor",
			"Insult",
			"Joke",
			"Equivocate",
			"Rewrite",
			"Provoke",
			"Sneak"
		],
		"defaultAction": "Rapier",
		"crisis": "Desperate Attack"
	},

	"Archer": {
		"gender": 'N',
		"hp": setup.PUPPET_HP,
		"stats": {
			"Attack"	: 70,
			"Defense"	: 10,
			"Special"	: 10
		},
		"actions": [
			"Shot",
			"Soulshot",
			"Exacerbate",
			"Explosive Bolt",
			"Mark",
			"Mercy",
			"Hunter",
			"Call to Arms"
		],
		"defaultAction": "Shot",
		"crisis": "Bloody Rain",
		"portrait": "ARCHR"
	},

	"Cleric": {
		"gender": 'N',
		"hp": setup.PUPPET_HP,
		"stats": {
			"Attack"	: 10,
			"Defense"	: 70,
			"Special"	: 10
		},
		"actions": [
			"Firefly",
			"Club",
			"Helping Hand",
			"Assured Aegis",
			"Protector_Cleric",
			"Martyr_Cleric",
			"Lifegiver",
			"Downfall",
			"Meditate_Cleric",
			"Walled City"
		],
		"defaultAction": "Club",
		"crisis": "Divine Protection",
		"portrait": "CLRIC",
		"specialInit": function (actor) {
			actor.firefly = true;
		}
	},

	"Witch": {
		"gender": 'N',
		"hp": setup.PUPPET_HP,
		"stats": {
			"Attack"	: 10,
			"Defense"	: 10,
			"Special"	: 70
		},
		"actions": [
			"Crafty",
			"Pox",
			"Focus",
			"Gift",
			"Cleanse",
			"Forgetfulness",
			"Curse",
			"Frenzy",
			"Thaumastasis",
			"Age of Enlightenment"
		],
		"defaultAction": "Focus",
		"crisis": "Desperate Attack",
		"specialInit": function (actor) {
			actor.crafty = true;
		}
	},

	"Artist": {
		"gender": 'N',
		"hp": setup.PUPPET_HP,
		"stats": {
			"Attack"	: 30,
			"Defense"	: 30,
			"Special"	: 30
		},
		"actions": [
			"Crimson Flames",
			"Azure Frost",
			"Gold Sparks",
			"White Light",
			"Black Night",
			"Violet Bloom",
			"Orange Blaze",
			"Green Toxin",
			"Prismatic Spray",
			"Red Tide",
			"Blue Lightning",
			"Yellow Scorch",
			"Sacrament",
			"Blasphemy",
			"Heal"
		],
		"defaultAction": "White Light",
		"crisis": "Desperate Attack",
		"portrait": "ARTST"
	}
};
