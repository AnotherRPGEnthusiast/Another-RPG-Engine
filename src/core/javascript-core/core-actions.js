/* common variables */
setup.knife_weight = 0.6; /* weight for all basic multi-hit attacks; localized here for easy testing */
setup.pierce_weight = 0.95; /* weight for all basic piercing attacks; localized here for easy testing */
setup.boost_time = 3;
setup.HUNTER_WEIGHT = 0.8;
setup.STD_DEBUFF = 0.6;
setup.STD_BUFF = (20/45);

setup.actionData = {

	"Heal": {
		"cost": 1,
		"special": 50,
		"target": "ally",
		"info": function (action) { return `Heals ${action.special} HP.`},
		"desc": "Art heals.",
		"onUse": function (puppet) {
			temporary().targ = puppet;
			$.wiki('<<healCalc _targ>>');
			puppet.hp += V().heal;
			subject().en -= this.cost;
			return `${puppet.name} recovers <<print $heal>> HP!`;
		},
		"act": heal(),
		"preview": "heal"
	},

	// MISC

	"rest": {
		"silent": true,
		"cost": 0,
		"act": function () {
			subject().removeEffect("Winded",{pierce: true, noPopup: true});
			return;
		},
		"preview": null
	},

	"struggle": {
		"silent": true,
		"cost": function () { return setup.STRUGGLE_COST; },
		"act": function () {
			subject().removeEffect("Knocked Down",{pierce: true, noPopup: true});
			return;
		},
		"preview": null
	},

	"Thorn Counterattack": {
		//Currently only used for immediate damage following Rose's thorn bubble.
		"weight": 1.5,
		"useSpecial": 1
	},

	"kill": {
	// Debug action used to quickly test death effects.
		"cost": 0,
		"act": function () {
			return `<<set $target.hp to 0>>`+
		`<<deathcheck>>`;
		}
	},

	"Wait": {
		"cost": 0,
		"fullround": true,
		"useText": null,
		"actText": function () {
			return `${subject().name} waits for a better time to act.<<set $target.isDone = false; $B.enemyTurns++>>`;
		},
		"act": null
	},

	// Passive skills

	"Firefly": {
		"passive": true,
		"onApply": function (actor) {
			actor.firefly = true;
		},
		"onRemove": function (actor) {
			actor.firefly = false;
		},
		"info": function (action) {return `Enemies are twice as likely to target this character.`},
		"desc": null
	},

	"Crafty": {
		"passive": true,
		"onApply": function (actor) {
			actor.crafty = true;
		},
		"onRemove": function (actor) {
			actor.crafty = false;
		},
		"info": function (action) {return `Items cost half as much Energy to use.`},
		"desc": null
	},

	// FIGHTER

	"Sword": {
		"cost": 2,
		"weight": 1,
		"basic": true,
		"info": function (action) {return `Attack with a weight of ${action.weight}.`},
		"desc": `Ah, the sword: favored weapon of heroes everywhere. In reality they're pretty impractical and hard to use, but they just look so cool!`,
		"useText": null,
		"actText": function () {
			return `${subject().name} swings ${subject().their} sword with perfect form.`;
		},
		"act": justdmg()
	},

	"Punch": {
		"cost": 1,
		"weight": 0.75,
		"basic": true,
		"info": function (action) {return `Attack with a weight of ${action.weight}.`},
		"desc": `A quick jab with the off-hand. Weaker than using a weapon, but less tiring.`,
		"useText": null,
		"actText": function () {
			return `${subject().name}'s fist slams into the enemy.`;
		},
		"act": justdmg()
	},

	"Hammer": {
		"cost": 3,
		"weight": 0.95,
		"basic": true,
		"pierce": true,
		"info": function (action) {return `Attack with a weight of ${action.weight} and ignore enemy defense.`},
		"desc": `Fighter's heavy warhammer concentrates all the force of their swing onto a single point, piercing through even the toughest of armor.`,
		"useText": null,
		"actText": function () {
			return `${subject().name} draws ${subject().their} warhammer from ${subject().their} back and brings it down on the enemy in a crushing blow.`;
		},
		"act": justdmg()
	},

	"Bull Rush": {
		"cost": 4,
		"weight": 1.1,
		"dur": 1,
		"effects": ["Off-Balance"],
		"info": function (action) {return `Inflicts damage with an attack weight of ${action.weight} and knocks the enemy <b>Off-Balance</b>, but knocks Fighter Off-Balance too.`},
		"desc": `A reckless charge that attempts to overpower the enemy with sheer force. Fighter can put a lot of strength behind this attack, but it'll leave them overbalanced and open to a counterattack.`,
		"actText": function () {
			return `${subject().name} rushes up to the enemy and puts all ${subject().their} weight into the attack! In the process ${subject().they} overextend ${subject().themself}, and start to wobble a little.`;
		},
		"act": function () {
			return `<<echoDamage>>\
							<<print target().addEffect("Off-Balance")>>\
							<<print subject().addEffect("Off-Balance")>>`;
		}
	},

	"Assault": {
		"cost": 4,
		"weight": 1.4,
		"dur": 3,
		"info": function (action) {return `Inflicts damage with an attack weight of ${action.weight}, but makes Fighter <b>Winded</b>.`},
		"desc": `Rush the enemy with an all-out attack!`,
		"actText": function () {
			return `${subject().name} lets out a primal roar before descending on $target.name, swinging ${subject().their} weapon in a series of heavy, brutal swings. At the end, ${subject().theyare} left panting.`;
		},
		"act": function () {
			return `<<echoDamage>>\
							<<print subject().addEffect("Winded")>>`;
		}
	},

	"Berserker": {
		"cost": 0,
		"instant": true,
		"phase": "confirm phase",
		"effects": ["Berserker"],
		"info": function (action) {return `Increase damage dealt and received by ${setup.BERSERK_FACTOR*100}%.`},
		"desc": `Fighter will throw down their shield and fight with reckless abandon, hitting harder but hurting harder, too.`,
		"actText": function () {
			return `${subject().name}'s shield drops to the ground with a <i>clang</i>, and ${subject().they} grip ${subject().their} weapon with fiery determination. No holding back, now!`;
		},
		"act": applyEffect("Berserker",{self:true})
	},

	"Defender": {
		"cost": 0,
		"instant": true,
		"phase": "confirm phase",
		"effects": ["Defender"],
		"info": function (action) {return `Reduce damage dealt and received by ${setup.DEFEND_FACTOR*100}%.`},
		"desc": `Fighter will hunker behind their shield, blocking oncoming blows but making it harder for them to attack.`,
		"actText": function () {
			return `An expression of cool stillness passes over ${subject().name}'s face as they hunker behind ${subject().their} shield, eyes peeled for all incoming attacks.`;
		},
		"act": applyEffect("Defender",{self:true})
	},

	"Meditate": {
		"cost": 5,
		"basic": true,
		"dur": 4,
		"phase": "confirm phase",
		"effects": ["ailments"],
		"info": function (action) {return `Cure user of all negative ailments and bestow <b>Chi Shield</b>, protecting them from future ailments for ${action.dur} turns.`},
		"actText": function () {
			return `${subject().name} stops, and closes ${subject().their} eyes. ${subject().their.toUpperFirst()} sudden tranquility is discordant with the chaos of the battle. ${subject().they.toUpperFirst()} take a deep breath, and when ${subject().they} let it out you swear you can see a physical presence leave ${subject().them}. ${subject().they.toUpperFirst()} stand up straighter, positively glowing.`;
		},
		"act": removeEffect({target:'s'},
						applyEffect("Chi Shield",{self:true},
						`<<set $B.heal_used = true>>`)),
		"preview": function () {
			if (subject().stasis) {
				return `$subject.name <b>is in Stasis, so this won't do anything.</b>`;
			}
			else {
				return `$subject.name will be cured of all ailments and gain <b>Chi Shield</b>.`;
			}
		},
		"desc": `The indignities of the world quail before Fighter's indomitable spirit. When that spirit is focused, all their troubles will fade away like dust in the wind.`
	},

	"Protector": {
		"cost":		2,
		"effweight":	0.25,
		"dur":		3,
		"target":	"ally",
		"noself":	true,
		"effects": ["Protector"],
		"info":	function (action) {return 	`Take hits for an ally and gain a Defense bonus for ${action.dur} rounds.`},
		"actText": function () {
			return `Without hesitation ${subject().name} jumps in front of ${subject().their} charge, shielding them from all harm.`;
		},
		"act": applyEffect("Protector",{self:true}),
		"preview": `$subject.name will protect $target.name and gain a bonus to Defense.`,
		"desc":		`Leap to another puppet's defense! Fighter will put themselves in the way of any attack, deflecting it with their mighty shield. But they can't be everywhere at once, so beware of area attacks...`
	},

	"Martyr": {
		"cost":		2,
		"phase":	"confirm phase",
		"effects": ["Martyr"],
		"info":	function (action) {return 	`Draw all direct attacks for this round.`},
		"actText": null,
		"act": applyEffect("Martyr",{self:true}),
		"desc":		`The blinding intensity of Fighter's spirit can warp perception itself. Through sheer will they can become so overpoweringly <b>real</b> that enemies become unable to see anything else, compelling them to send all attacks Fighter's way. Unfortunately, the technique requires too much concentration for Fighter to raise their shield.`
	},

	// ROGUE

	"Knife": {
		"cost":		2,
		"weight":	setup.knife_weight,
		"basic":	true,
		"hits": 2,
		"info":	function (action) {return 	`Attack twice with a weight of ${action.weight.toFixed(2)}.`},
		"desc":		`It's not as strong as Fighter's big sword, but Rogue is fast enough to get two licks before their victim knows what's hit them. This is most effective against enemies with poor defense.`,
		"useText": null,
		"actText": function () {
			return `${subject().name} draws two knives and rushes in, slashing with one hand and stabbing with the other.`;
		},
		"act": multihit({hits: 2}),
		"preview": "multihit"
	},

	"Crossbow": {
		"cost":		0,
		"weight":	1,
		"basic":	true,
		"pierce":	true,
		"noDefault": true,
		"saveMod": "Reload",
		"info":	function (action) {return 	`Attack with a weight of ${action.weight} and ignore defense. Needs reloading after use.`},
		"desc":		`Ah, the marvel of modern technology: while other fools tire themselves out swinging those heavy weapons, Rogue can send death flying through the air with just a twitch of the finger.`,
		"useText": null,
		"actText": function () {
			return `${subject().name} fires ${subject().their} crossbow with a <i>twang</i>.`;
		},
		"act": function () {
			var x = subject().actions.find(function(a) { return a && a.name == "Crossbow" });
			subject().actions[subject().actions.indexOf(x)] = new Action("Reload");
			return `<<echoDamage>>`;
		},
	},

	"Reload": {
		"cost":		2,
		"phase":	"confirm phase",
		"basic":	true,
		"silent": true,
		"noDefault": true,
		"saveMod": "Crossbow",
		"info":	function (action) {return 	`Reload crossbow.`},
		"desc":		`...Of course, crossbows also take an age and a half to reload.`,
		"preview": null,
		"act": function () {
			var x = subject().actions.find(function(a) { return a && a.name == "Reload" });
			subject().actions[subject().actions.indexOf(x)] = new Action("Crossbow");
		}
	},

	"Something in your eye": {
		"cost":		2,
		"effects": ["Stunned"],
		"info":	function (action) {return 	`Stun an enemy.`},
		"desc":		`It's amazing how if you say something ridiculous, people will hold still long enough for you to make it true. It's like they want it to happen, really.`,
		"actText": function () {
			return `"Hey," you say. "Something in your eye."
			'Something' turns out to be a fistful of dirt.`;
		},
		"act": applyEffect("Stunned")
	},

	"Poison Prick": {
		"cost":		3,
		"weight":	0.5,
		"effweight":	0.6,
		"dur":		3,
		"effects": ["Poisoned"],
		"info":	function (action) {return 	`Attack with a weight of ${action.weight} and inflict Poisoned for ${action.dur} rounds.`},
		"desc":		`The tiny knife may barely break the skin, but the poison it's coated in ensures they'll be feeling it for a while to come.`,
		"actText": function () {
			return `$subject.name feints to the side, then with blinding speed draws a tiny concealed knife, stabbing it into the enemy like a needle. The skin around it breaks into welts and sickly purple splotches.`;
		},
		"act": applyEffect("Poisoned",{dmg: true})
	},

	"Off Your High Horse": {
		"cost":		4,
		"weight":	1,
		"info":	function (action) {return 	`Attack with a weight of ${action.weight} and remove the target's most recent buff.`},
		"desc":		`A special technique that cuts through flesh and magic alike, bringing those haughty enchanted foes back down to earth.`,
		"actText": function () {
			return `$subject.name leaps forward, twirling ${subject().their} knife in a strange pattern before slicing it across the enemy. Glimmering lines of energy trail after it like strands of cobweb, then wink out of existence.`;
		},
		"act": justdmg(removeLastEffect()),
		"preview": ["cleanse","lastEffect"]
	},

	"A Farewell to Arms": {
		"cost":		4,
		"weight":	1,
		"effweight":	setup.STD_DEBUFF,
		"dur":		3,
		"effects": ["Injury"],
		"info":	function (action) {return 	`Attack with a weight of ${action.weight} and inflict Injury for ${action.dur} rounds.`},
		"desc":		`A savage laceration of the arm muscles that leaves the enemy crippled.`,
		"actText": function () {
			return `$subject.name pauses, their eyes flicking over their opponent. They raise their knife level with their eyes, and the next instant lunge forward with a crippling stab to the arm joints.`;
		},
		"act": applyEffect("Injury", {dmg: true})
	},

	"Below the Belt": {
		"cost":		4,
		"weight":	1,
		"effweight":	setup.STD_DEBUFF,
		"dur":		3,
		"effects": ["Pain"],
		"info":	function (action) {return 	`Attack with a weight of ${action.weight} and inflict Pain for ${action.dur} rounds.`},
		"desc":		`A nasty kick to the joints and other painful regions that leaves the enemy too distracted by pain to defend themselves.`,
		"actText": function () {
			return `$subject.name pauses, their eyes flicking over their opponent. Suddenly they strike out like a viper, ramming a sharp kick into an exposed weak point.`;
		},
		"act": applyEffect("Pain", {dmg: true})
	},

	"Dead Ringer": {
		"cost":		4,
		"weight":	1,
		"effweight":	setup.STD_DEBUFF,
		"dur":		3,
		"effects": ["Headache"],
		"info":	function (action) {return 	`Attack with a weight of ${action.weight} and inflict Headache for ${action.dur} rounds.`},
		"desc":		`An unsporting blow to the temple that leaves the enemy's head ringing.`,
		"actText": function () {
			return `$subject.name kicks dust into their opponent's eyes, disorienting ${target().them} just long enough for them to ram their dagger's pommel straight into ${target().their} temple.`;
		},
		"act": applyEffect("Headache", {dmg: true})
	},

	"Flurry": {
		"cost":		5,
		"weight":	0.55,
		"hits": 3,
		"dur":	1,
		"effects": ["Off-Balance"],
		"info":	function (action) {return 	`Attack thrice with a weight of ${action.weight} and inflict Off-Balance.`},
		"desc":		`Descend on the enemy in a whirlwind of strikes! The sudden ferocity will make them lose their footing, leaving them open to another puppet's attack.`,
		"actText": function () {
			return `With uncharacteristic unsubtlety, $subject.name charges forward, swinging their blades in a whirlwind of flashing steel. Not every swing connects, but it doesn't need to. The enemy stumbles and sways from the pressing assault, looking like they could be knocked over by a light breeze. $subject.name grins and leaps away, their job done.`;
		},
		"act": multihit({hits: 3},applyEffect("Off-Balance")),
		"preview": "multihit"
	},

	"Sneak": {
		"cost":		2,
		"phase":	"confirm phase",
		"dur":		3,
		"effects": ["Hidden"],
		"info":	function (action) {return 	`Become untargetable for ${action.dur} rounds.`},
		"desc":		`Become one with the shadows.`,
		"actText": function () {
			return `The arena should be well-lit, but as $subject.name presses themselves against the wall, their surroundings suddenly become dimmer. You blink, and suddenly you can't tell where they end and the shadows begin.`;
		},
		"act": applyEffect("Hidden",{self:true})
	},

	"Procure": {
		"phase":	"procure",
		"target": null,
		"noDefault": true,
		"info":	function (action) {return 	`Add an item to party stock. Cost varies.`},
		"desc":		`Even you don't know where they get it from.`
	},

	// MAGE

	"Focus": {
		"cost":		2,
		"special": 	4,
		"noDefault": false,
		"phase":	"confirm phase",
		"info":	function (action) {return 	`Gain ${action.special} Energy (net ${action.special - action.cost}).`},
		"desc":		`Magic is everywhere if you know where to look. A skilled mage can, with concentration, read the currents that flow through the world and pluck power from them like notes from a harp.`,
		"actText": function () {
			return `${subject().name} holds out a hand. The motion is calm and easy, like trailing a hand through a forest stream. Glimmering motes of multicolored light settle on it like dew, trickling into the center of ${subject().their} palm before vanishing with a soft glow.`;
		},
		"act": function () {
			return `<<set $subject.en += action().special>>\
			$subject.name gains ${action().special} Energy!`;
		},
		"preview": `$subject.name will gain <<print $action.special - $action.cost>> net Energy.`
	},

	"Sacrifice": {
		"cost":		0,
		"special":	2,
		"phase":	"confirm phase",
		"basic":	true,
		"instant":	true,
		"oncePerTurn": true,
		"hpcost": 	50,
		"info":	function (action) {return 	`Sacrifice ${action.hpcost} HP to generate ${action.special} Energy.`},
		"desc":		`Magic is born from a desire to impose morality on a cruel and uncaring world. If we suffer, should good things not happen to balance it out? Only wishful thinking when done by humans, of course -- but Mage makes it a reality.`,
		"actText": function () {
			return `${subject().name} presses ${subject().their} hand into a fist so tight it draws blood. As you watch, ${subject().their} blood changes from a thick red into an inky black that streams away as if you are underwater. In an instant it is gone, leaving ${subject().name} with only a faint scar.`;
		},
		"act": function () {
			return `Mage loses $action.hpcost HP.
			Mage gains $action.special Energy!\
			<<set $subject.en += $action.special>>`;
		},
		"preview": `$subject.name will lose $action.hpcost HP and gain $action.special Energy.`
	},

	"Blast": {
		"cost":		3,
		"weight":	1,
		"phase":	"spell phase",
		"spellMod": function () {
			switch (action().cost){
				case 10:
					V().action = new Action("Indignant Variati");
					break;
				default:
					console.log("default active");
					action()._weight = action().weight + 0.25*(action().cost - V().B.mincost);
			}
		},
		"basic":	true,
		"info":	function (action) {return 	`Inflict damage with an attack weight of ${action.weight} + 0.25 per Energy invested.`},
		"desc":		`Use the beautiful, wonderous, and infinite power of magic to blow something up.`,
		"actText": function () {
			switch (V().action.cost) {
				case 3:
					return `$subject.name raises a hand, and an orb of glowing blue-white energy shoots out of ${subject().their} palm.`;
				case 4:
					return `$subject.name raises a hand, and a missile of glowing blue-white energy shoots out of ${subject().their} palm, showering shimmering motes like snow.`;
				case 5:
				case 6:
					return `$subject.name raises a hand, and blue-white energy erupts from it like a geyser, blasting into the enemy.`;
				case 7:
				case 8:
					return `$subject.name raises both of ${subject().their} hands, and blue-white energy erupts in front of ${subject().them} in a chaotic blast, glowing tendrils arcing against the air and ground as the enemy is eveloped in waves of destruction.`;
				case 9:
					return `$subject.name raises both of ${subject().their} hands, glowing with power. Countless rays of blue-white energy spread out in all directions before curving in and condensing into a huge, powerful beam.`;
			}
		},
		"act": justdmg()
	},

	"Indignant Variati": {
		"cost":		10,
		"weight":	3,
		"saveMod": "Blast",
		"effects": ["Knocked Down"],
		"actText": function () {
			return `$subject.name calmly steps forward, and raises a hand to the heavens. In an instant, the sky is suddenly ablaze with wrathful fire. Fire and lightning rain down from the inferno to strike the earth, blasting the enemy in a terrifying and beautiful display of utter destruction.`;
		},
		"act": function () {
			return `<<echoDamage>>\
							<<print target().addEffect("Knocked Down",{time: -1})>>\
							<<print subject().addEffect("Winded",{time: 3})>>`;
		},
		"preview": `<<damageCalc>>\
			The wrath of the gods. This attack will inflict $dmg damage and <b>knock the enemy off their feet</b>, but the exertion will leave Mage <b>Winded</b>.`
	},

	"Fireball": {
		"cost":		4,
		"weight":	1,
		"effweight":	0.6,
		"effects": ["Burning"],
		"phase":	"spell phase",
		"spellMod": function () {
			switch (action().cost){
				case 10:
					V().action = new Action("Perdition");
					break;
				default:
					action()._effweight = 0.6+0.1*(action().cost-V().B.mincost);
			}
		},
		"dur":		3,
		"info":	function (action) {return 	`Inflict damage with an attack weight of ${action.weight} and inflict Burning status with greater severity per Energy invested.`},
		"desc":		`Since the beginning of humanity, fire has had a hallowed place in the halls of myth and magic. One moment, there is nothing but dead wood and still air -- the next, a wild, flickering shape that banishes the cold and dark, changes objects irrevocably, purges evil and disease. What could be more magical than that? Of course, you don't care about any of that. You just want to burn stuff.`,
		"actText": function () {
			switch (action().cost) {
				case 4:
					return `$subject.name waves a hand, and a ball of orange flame bursts into existence to fly towards the enemy, igniting in an impressive display of fire that clings to the enemy's skin.`;
				case 5:
					return `$subject.name waves a hand, and a ball of yellow flame bursts into existence to fly towards the enemy, igniting in a magnificent display of fire that clings to the enemy's skin.`;
				case 6:
				case 7:
				case 8:
					return `$subject.name throws out their hand as if throwing a punch. A jet of flame shoots out like a comet, swallowing the enemy in fire.`;
				case 9:
					return `$subject.name points a finger at the enemy, and a perfect sphere of orange-red flame shoots out like a missile. When it connects it lights up like a firework, exploding in a brilliant inferno.`;
			}
		},
		"act": applyEffect("Burning", {dmg: true})
	},

	"Perdition": {
		"cost":		10,
		"weight":	1,
		"effweight":	0.4,
		"effects": ["Perdition"],
		"saveMod": "Fireball",
		"actText": function () {
			return `$subject.name raises their palms as if lifting a great weight, and $target.name is suddenly enveloped in a pillar of screaming white fire. The ember, lodged in $target.their heart, is unquenchable.`;
		},
		"act": applyEffect("Perdition", {dmg: true}),
		"preview": `<<damageCalc>>\
			The flames of eternal torment. This attack will inflict $dmg damage and <b>Perdition</b> status, which will remain for the duration of the battle.`
	},

	"Favor": {
		"cost":		1,
		"phase":	"spell phase",
		"spellMod": function () {
			switch (action().cost){
				case 10:
					V().action = new Action("Inspiration");
					break;
				default:
			}
		},
		"target":	"ally",
		"noself":	true,
		"info":	function (action) {return 	`Lend Energy to an ally.`},
		"desc":		`Magic blurs the boundaries of the natural world, and the boundaries between individuals. Mage can allow another to use their energy as if it was their own.`,
		"actText": function () {
			return `$subject.name clasps one hand over their heart, and extends another towards $target.name. Glowing blue energy flows between them.`;
		},
		"act": function () {
			return `$target.name gains $action.cost Energy!`+
			`<<set $target.en += $action.cost>>`;
		},
		"preview": function () {
			var note = "";
			if ((target().en + V().action.cost) > target().maxen) {
				note = ` ...but they already have $target.en Energy, so some of it will be wasted.`;
			}
			return `$subject.name will transfer $action.cost Energy to $target.name.`+note;
		}
	},

	"Inspiration": {
		"cost":		10,
		"target": 	"ally",
		"noself":	true,
		"saveMod": "Favor",
		"actText": function () {
			return `$subject.name places their palm flat below their mouth. They close their eyes, and blow out a breath towards $target.name. It glows with a strange energy, wrapping around $target.name. They look ready for anything.`;
		},
		"act": function () {
			target().en += action().cost;
			if (target().isDone == true){
				target().isDone = false;
			} else {
				target().inspired = true;
			}
			return `$target.name gains $action.cost Energy and an additional action!`;
		},
		"preview": `The breath of life. Mage will transfer $action.cost Energy to $target.name and grant them an additional action.`
	},

	"Restoration": {
		"cost":		3,
		"phase":	"spell phase",
		"spellMod": function () {
			switch (action().cost) {
				case 10:
					V().action = new Action("Salvation"),
					V().target = null;
					break;
				default:
					this.removedEffects = 1+(action().cost-V().B.mincost);
			}
		},
		"target":	"ally",
		"info":	function (action) {return 	`Cure an ally of their most recent status ailment, plus one ailment per Energy invested.`},
		"desc":		`People have always turned to mystics for cures to the world's ills and pains. To be blighted by an enemy you cannot see is terrifying and transcendent -- so surely, one must seek out a person that is the same. And so Mage gained the power of healing.`,
		"actText": function () {
			return `$subject.name waves their hands in smooth, wide motions, as if polishing a surface. When they're finished they stretch their hands out imperiously, and positive energy washes over $target.name in a bright burst.`;
		},
		"act": removeEffect(),
		"preview": "cleanse"
	},

	"Salvation": {
		"cost":		10,
		"dur": 		3,
		"phase":	"confirm phase",
		"saveMod": "Restoration",
		"actText": function () {
			return `$subject.name spreads their hands wide, exultant. The curses afflicting your puppets condense into balls of dark energy before bursting in brilliant showers of light. The glow swirls around them, enveloping them in protective energy.`;
		},
		"act": removeEffect(
			{target: "allies", type: "all", cure: true, unsticky: true,
			perExtension: `<<print _puppet.addEffect("Chi Shield")>>`}
		),
		"preview": function () {
			return `A miracle to turn the tide of battle. This will cure your puppets of all ailments and bestow each with Chi Shield for ${action().dur} rounds.`;
		}
	},

	"Neutralize": {
		"cost":		3,
		"phase":	"spell phase",
		"spellMod": function () {
			switch (action().cost) {
				case 10:
					V().action = new Action("Annulment");
					V().target = null;
					break;
				default:
					this.removedEffects = 1+(action().cost-V().B.mincost);
			}
		},
		"info":	function (action) {return 	`Strip an enemy of their most recent buff, plus one buff per Energy invested.`},
		"desc": 	`To make magic, one must first know how to break it. Your enemies think themselves safe, shining and untouchable with all those enchantments? With a whisper, Mage can remind them just how mortal they really are.`,
		"actText": function () {
			return `$subject.name waves their hands in contracted, sprialling motions, as if gathering up dust. When they're finished, they swipe a hand sharply to the side as if in dismissal. You see $target.name's magic flash and sputter, fading away like mist.`;
		},
		"act": removeEffect(),
		"preview": "cleanse"
	},

	"Annulment": {
		"cost":		10,
		"weight": 	1,
		"phase":	"confirm phase",
		"saveMod": "Neutralize",
		"actText": function () {
			return `$subject.name places their hand out, palm up. With violent suddenness they close it into a fist. You suddenly see the enchantments aiding the enemy clear as day, little balls of energy orbiting them like little planets -- before they all shatter at once like a galaxy of dying stars.`;
		},
		"act": function () {
			var cut = 0;
			enemies().forEach(function(enemy) {
				if (!enemy.dead && !enemy.areaImmune) {
					cut++;
				}
			});
			return `<<for _enemy range $enemies>>\
								<<if !_enemy.dead && !_enemy.areaImmune>>\
									<<set $target = _enemy>>\
									<<damageCalc>>\
									<<set $dmg = Math.round($dmg/${cut})>>\
									<<echoDamage "nocalc">>\
									<<for _k, _effect range _enemy.effects>>\
										<<if _effect.buff>>\
											<<print _enemy.removeEffect(_effect)>>\
										<</if>>\
									<</for>>\
								<</if>>\
			<</for>>`;
		},
		"preview": `<<set _d = (setup.base + $subject.get(V().AttackStat))*$action.weight>>\
			A judgment upon those who would defy you. This will inflict _d base damage and strip all buffs from every enemy.`
	},

	"Blessing": {
		"cost":		5,
		"effweight":	(10/45),
		"effects": ["Blessing"],
		"phase":	"spell phase",
		"spellMod": function () {
			switch (action().cost){
				case 10:
					V().action = new Action("Ascension"),
					V().target = null;
					break;
				default:
					// duration
					switch (action().cost){
						case 6:
						case 7:
							action()._dur = 4;
							break;
						case 8:
						case 9:
							action()._dur = 5;
							break;
						default:
					}
					// effect
					switch (action().cost){
						case 7:
						case 8:
							action()._effweight = (15/45);
							break;
						case 9:
							action()._effweight = (20/45);
							break;
						default:
					}
				}
		},
		"dur":		3,
		"target":	"ally",
		"info":	function (action) {return 	`Bestow a Blessing, which will boost all stats for ${action.dur} rounds. Additional Energy points will alternate improvements in duration and effect.`},
		"desc": 	`Grant us strength that we may strike true. Grant us protection that we may endure. Grant us wisdom that we may see the way through the darkness.`,
		"actText": function () {
			return `$subject.name raises their arms skyward, then clasps their hands together as if in prayer. They suddenly let go, and wave their hands over $target.name with a flourish. Motes of light fall over ${target().them}, making ${target().them} glow with a strange aura.`;
		},
		"act": applyEffect("Blessing")
	},

	"Ascension": {
		"cost":		10,
		"effweight":	(10/45),
		"dur":		5,
		"phase":	"confirm phase",
		"saveMod": "Blessing",
		"actText": function () {
			return `$subject.name raises their arms skyward. Their muscles strain and their fists suddenly clench, as if they are trying to grasp the Sun itself. Perhaps they succeed: their hands are suddenly effulgent with light, which they push down into the earth. The ground glows and your puppets are bathed in geysers of light, exultant.`;
		},
		"act": massAttack({target: "allies", content: applyEffect("Blessing")}),
		"preview": function () {
			return `Become something greater. This will endow a Blessing to all puppets for ${action().dur} rounds.`;
		}
	},

	"Curse": {
		"cost":		5,
		"effweight":	(1/3),
		"effects": ["Curse"],
		"phase":	"spell phase",
		"spellMod": function () {
			switch (action().cost){
				case 10:
					V().action = new Action("Forsaken");
					break;
				default:
					// duration
					switch (action().cost){
						case 6:
						case 7:
							action()._dur = 4;
							break;
						case 8:
						case 9:
							action()._dur = 5;
							break;
						default:
					}
					// effect
					switch (action().cost){
						case 7:
						case 8:
							action()._effweight = (15/30);
							break;
						case 9:
							action()._effweight = (2/3);
							break;
						default:
					}
			}
		},
		"dur":		3,
		"info":	function (action) {return 	`Inflict a Curse, which will weaken all stats for ${action.dur} rounds. Additional Energy points will alternate improvements in duration and effect.`},
		"desc":		`May their flesh sag and rot. May their bones crumble like parchment. May their thoughts slow like treacle.`,
		"actText": function () {
			return `$subject.name stares intently, then calmly points a single finger at the enemy. $target.name sways, and the air around $target.them suddenly looks dingier.`;
		},
		"act": applyEffect("Curse")
	},

	"Forsaken": {
		"cost":		10,
		"effweight":	1,
		"dur":		5,
		"effects": ["Forsaken"],
		"saveMod": "Curse",
		"actText": function () {
			return `$subject.name does not even move. They only spare $target.name a look, and <<print target().theyare>> suddenly drowned in darkness.`;
		},
		"act": applyEffect("Forsaken"),
		"preview": `A terrible judgment that denies all mercy. This will inflict <b>Forsaken</b> status, which will sharply reduce Defense, even into the negatives.`
	},

	// BARD

	"Rapier": {
		"cost": 2,
		"weight": 1,
		"basic": true,
		"info": function (action) {return `Inflicts damage with an attack weight of ${action.weight}.`},
		"desc": `A flashy, elegant weapon for sophisticated duelists, specialized for thrusts and precise cuts. Its usefulness in a real brawl is questionable, but if you can't fight in style, what's even the point?`,
		"useText": null,
		"actText": function () {
			return `${subject().name} elegantly stabs the foe with ${subject().their} rapier.`;
		},
		"act": justdmg()
	},

	"Dagger": {
		"cost":		2,
		"weight":	setup.knife_weight,
		"hits": 2,
		"basic":	true,
		"info": function (action) {return 	`Attack twice with a weight of ${action.weight.toFixed(2)}.`},
		"desc":		`A real dagger, not the shoddy knife you'd find in the hands of a thug! Longer than a knife and shorter than a sword, the dagger is an elegant weapon combining strength and concealment. It's favored by assassins and scheming nobles.`,
		"useText": null,
		"actText": function () {
			return `${subject().name} draws an ornate dagger and slashes it twice across the enemy.`;
		},
		"act": multihit({hits: 2})
	},

	"Shout": {
		"cost":		3,
		"weight":	1,
		"phase":	"spell phase",
		"spellMod": function () {
			action()._weight = action().weight + 0.25*(action().cost - V().B.mincost);
		},
		"basic":	true,
		"info":	function (action) {return 	`Inflict damage with an attack weight of ${action.weight} + 0.25 per Energy invested.`},
		"desc":		`Bard knows all about the destructive power of words, though it's a bit more literal than usual in this case. With a little magic, boosted by their own mythological resonance with the domain of sound, Bard can turn their voice into an oddly melodic sonic attack.`,
		"actText": function () {
			return `$subject.name projects ${subject().their} voice into a wave of crushing force.`;
		},
		"act": justdmg()
	},

	"Non-Sequitor": {
		"cost":		4,
		"weight":	0.9,
		"dur": 1,
		"effects": ["Off-Balance"],
		"info":	function (action) {return 	`Attack with a weight of ${action.weight} and inflict Off-Balance.`},
		"desc":		`"This statement is false!" Sometimes you need to do the thing they least expect. It'll throw them off-kilter, especially after you follow it with a sucker punch.`,
		"useText": null,
		"actText": function () {
			return `$subject.name says something so random the enemy has to stop to process it. While they're doing that, $subject.name socks them in the face.`;
		},
		"act": applyEffect("Off-Balance",{dmg: true})
	},

	"Insult": {
		"cost":		2,
		"effweight":	0.4,
		"dur":		3,
		"effects": ["Injury"],
		"info":	function (action) {return 	`Inflict an Injury for ${action.dur} rounds.`},
		"desc":		`"You fight like a cow!" Any bard worth their salt knows exactly what wicked wordplay will leave their victims a laughingstock. The injury inflicted is only emotional, but really, isn't that worse?`,
		"useText": null,
		"actText": function () {
			return `$subject.name insults the opponent's fighting style so wickedly they are crushed by despair.`;
		},
		"act": applyEffect("Injury")
	},

	"Joke": {
		"cost":		2,
		"effweight":	0.4,
		"dur":		3,
		"effects": ["Pain"],
		"info":	function (action) {return 	`Inflict Pain for ${action.dur} rounds.`},
		"desc":		`Bard can make jokes so bad they cause physical pain. Bard assures us they're doing it ironically. You think that makes worse.`,
		"useText": null,
		"actText": function () {
			return `$subject.name makes a painfully bad joke.`;
		},
		"act": applyEffect("Pain")
	},

	"Equivocate": {
		"cost":		2,
		"effweight":	0.4,
		"dur":		3,
		"effects": ["Headache"],
		"info":	function (action) {return 	`Inflict Headache for ${action.dur} rounds.`},
		"desc":		`"Oh, I believe that <b>you</b> believe, but have you considered..." Also known as "playing devil's advocate" or, more colloquially, "trolling". Bard is a master.`,
		"useText": null,
		"actText": function () {
			return `$subject.name leads the enemy on a meandering and nonsensical argument. It's irritating to everyone, but $target.name gets the worst of it.`;
		},
		"act": applyEffect("Headache")
	},

	"Rewrite": {
		"cost":		4,
		"target":	"all",
		"effects": ["all"],
		"info":	function (action) {return 	`Remove all effects (positive and negative) from a target.`},
		"desc":		`Don't like the story? Then change it! It's the tales that are remembered, and in a way isn't that more real than what actually happened?`,
		"actText": function () {
			return `$subject.name crafts a personal narrative so compelling it overwrites $target.name's state of being. All the forces acting upon ${target().them} vanish like they were never even there.`;
		},
		"act": removeEffect({target:'t'},`<<set $B.heal_used = true>>`)
	},

	"Provoke": {
		"cost":		2,
		"dur":		1,
		"effects": ["Martyr"],
		"phase":	"confirm phase",
		"info":	function (action) {return 	`Draw all direct attacks for this round.`},
		"desc":		`A bard thrives in the spotlight. This one knows just how to get it.`,
		"actText": function () {
			return `$subject.name runs around like a headless chicken while insulting everyone's parentage.`;
		},
		"act": function () {
			return `<<print subject().addEffect("Martyr")>>`;
		}
	},

	// ARCHER

	"Shot": {
		"cost":		1,
		"weight":	0.45,
		"phase":	"spell phase",
		"spellMod": function () {
			if (action().cost > 1) {
				action().hits = action().cost;
				action().act = multihit();
			}
		},
		"basic":	true,
		"info":	function (action) {return 	`Inflict damage with an attack weight of ${action.weight} once per Energy point invested.`},
		"desc":		`Ranged weapons are where the real power's at. With sharp eyes, you can strike down an entire battalion of soldiers before they can land even single blow. Of course, in this arena, everyone is always within melee range of each other, so it's a bit less useful. Archer has to make up for it by firing multiple arrows at once -- they can draw on their mythological resonance to create them out of Energy points, so you'll never run out.`,
		"useText": null,
		"actText": function () {
			var str;
			if (V().action.cost == 1) {
				str = "an arrow";
			} else if (V().action.cost == 10) {
				return `Were there a sun here, ${subject().name}'s arrows would blot it out.`;
			} else {
				str = "a volley of arrows";
			}
			return `${subject().name} fires ${str}.`;
		},
		"act": justdmg()
	},

	"Soulshot": {
		"cost":		2,
		"weight":	1,
		"phase":	"spell phase",
		"spellMod": function () {
			action()._weight = action().weight + 0.25*(action().cost - V().B.mincost);
		},
		"basic":	true,
		"info":	function (action) {return 	`Inflict damage with an attack weight of ${action.weight} + 0.25 per Energy invested.`},
		"desc":		`The <b>idea</b> of an arrow, shot from the heart -- and ideally, into someone else's. The more Archer focuses, the more they feel the thrill of the hunt, the stronger it will become.`,
		"useText": null,
		"actText": function () {
			if (V().action.cost == 10) {
				return `${V().subject.name} nocks what looks to be the Platonic ideal of an arrow. The shaft is perfectly balanced, the point, so razor-sharp you cannot even see the edge. This is the arrow that always finds its mark, the weapon from which there is no refuge.

				${V().subject.name} lets it fly.`;
			} else {
				return `${subject().name} fires the ghost of an arrow.`;
			}
		},
		"act": justdmg()
	},

	"SoulshotOLD": {
		"cost":		3,
		"weight":	0.8,
		"phase":	"spell phase",
		"spellMod": function () {
			action()._weight = action().weight + 0.1*(action().cost - V().B.mincost);
		},
		"pierce":	true,
		"info":	function (action) {return 	`Inflict damage with an attack weight of ${action.weight} + 0.1 per Energy invested and ignore enemy defense.`},
		"desc":		`Arrows made of pure ether. Their insubstantial nature makes them weaker than real weapons, but they'll glide straight through any armor to pierce the heart.`,
		"useText": null,
		"actText": function () {
			return `${subject().name} fires the ghost of an arrow.`;
		},
		"act": justdmg
	},

	"Mark Shot": {
		"cost":		1,
		"weight":	0.75,
		"useText": null,
		"actText": function () {
			return `${subject().name} follows up the attack with a shot at all ${subject().their} marks.`
		},
		"act": function () {
			return `<<set _markActive = true>>\
			<<for _enemy range enemies().filter(function (e) { return e.marked && !e.dead })>>\
				<<set $target = _enemy>>\
				<<echoDamage "nocounter">>\
				<<set subject().en -= $action.cost>>\
				<<if subject().en <= 0>>\
					${subject().name} has run out of arrows!
					<<addEffect $subject "Winded" 3>>\
					<<for _enemy range enemies()>>\
						<<run _enemy.removeEffect("Marked",{pierce: true})>>\
					<</for>>\
					All Marks vanish!\
					<<break>>\
				<</if>>\
			<</for>>\
			<<set _markActive = false>>`;
		}
	},

	"Hunter Counter": {
		"cost":		0,
		"weight":	0.75,
		"counter": true,
		"useText": null,
		"actText": function () {
			return `${target().name} should've known better than to attract ${subject().name}'s attention. ${subject().name} counterattacks!`;
		},
		"act": justdmg("",{counter: true})
	},

	"Exacerbate": {
		"cost":		3,
		"weight":	function () {
			var w = 1;
			if (target() == true) {
				target().effects.forEach(function (eff) {
					if (!eff.buff) {
						w += action().special;
					}
				});
			}
			return w;
		},
		"special":  0.35,
		"info":	function (action) {return 	`Inflict damage with a weight of ${action.weight} + ${action.special} for every ailment afflicting the enemy.`},
		"desc":		`A cruel attack targeted at existing wounds and injuries. Go on. Twist the knife.`,
		"actText": function () {
			return `${subject().name} pulls out a massive, wicked thing with a head of twisted, barbed metal, it looks more like a harpoon than an arrow. ${subject().they.toUpperFirst()} draw ${subject().their} bowstring to the limit, quivering with tension, and as ${subject().they} do so ${subject().their} eyes flick over ${subject().their} opponent, scanning for the slightest weakness. Then, with a suddenness that makes you jump, ${subject().they} let the arrow fly.`;
		},
		"act": justdmg()
	},

	"Explosive Bolt": {
		"cost":		4,
		"weight":	1,
		"area": "all",
		"info":	function (action) {return 	`Inflict damage with a weight of ${action.weight} to target and half damage to all other enemies.`},
		"desc":		`The famous "bomb arrow" technique popularized by a certain green-capped troublemaker. It consists of strapping a bomb to an arrow and shooting it away from you very fast. It's totally absurd, but then, what isn't?`,
		"useText": null,
		"actText": function () {
			return `${subject().name} straps a sizzling bomb to an arrow and lets it fly.`;
		},
		"act": splashDamage({target:'t', cut:2}),
		"preview": ["splash","mass"]
	},

	"Mark": {
		"cost":		0,
		"dur":		3,
		"effects": ["Marked"],
		"basic":	true,
		"info":	function (action) {return 	`Paint a target on an enemy. Every time another puppet attacks, Archer will follow up with a 1-point Shot on every Marked enemy. (Archer will become Winded if their Energy is exhausted in this manner.)`},
		"desc":		`Archer never lets up once an enemy is in their sights.`,
		"actText": function () {
			return `$subject.name stares with burning intensity, and if you squint, you think you can see a target over $target.name.`;
		},
		"act": applyEffect("Marked")
	},

	"Mercy": {
		"cost":		0,
		"effects": ["Marked"],
		"basic":	true,
		"instant":	true,
		"info":	function (action) {return 	`Remove a Mark from an enemy.`},
		"desc":		`Archer wants you to know they're letting you live because they feel like it, and not because they're too tired to keep going. They never let up, remember!`,
		"actText": null,
		"act": removeEffect({target:'t'}),
		"preview": "removeEffect"
	},

	"Hunter": {
		"cost":		2,
		"effects": ["Hunter"],
		"phase":	"confirm phase",
		"info":	function (action) {return 	`Counterattack every enemy that attacks this round at a weight of ${setup.HUNTER_WEIGHT}.`},
		"desc":		`Archer can forgo an attack to hone their senses to the peak of human perfection, straining their ears and eyes for the slightest movement. Any enemy that dares to come close will know their swift and vengeful wrath.`,
		"actText": null,
		"act": applyEffect("Hunter",{self:true})
	},

	"Call to Arms": {
		"cost":		7,
		"effweight":	(1/2),
		"target": "ally",
		"dur":		3,
		"effects": ["ATK Boost"],
		"info":	function (action) {return 	`Bestow an ATK Boost to all puppets for ${action.dur} rounds.`},
		"desc":		`Let slip the dogs of war.`,
		"actText": null,
		"act": massAttack({target: "allies", content: applyEffect("ATK Boost")}),
		"preview": "mass"
	},

	// CLERIC

	"Club": {
		"cost":		2,
		"weight":	(2/3),
		"basic":	true,
		"pierce":	true,
		"info":	function (action) {return 	`Attack with a weight of ${action.weight.toFixed(2)} and ignore defense.`},
		"desc":		`Priests are prohibited from shedding blood. Violence against one's fellow man is a sin, after all! Fortunately, bludgeoning weapons, though capable of causing horrific internal injuries, don't spill blood, so it's all kosher.`,
		"useText": null,
		"actText": function () {
			return `${subject().name} nonviolently clubs the enemy over the head.`;
		},
		"act": justdmg()
	},

	"Meditate_Cleric": {
		"displayname": "Meditate",
		"desc": `Cleric's optimism is so strong it becomes a physical force. They believe they will be alright, and so they will be.`
	},

	"Protector_Cleric": {
		"displayname": "Protector",
		"desc":	`Cleric never hesitates to defend the weak. They will stand like a mighty titan before their charge, protecting them from all harm. But they can't be everywhere at once, so beware of area attacks...`
	},

	"Martyr_Cleric": {
		"displayname": "Martyr",
		"desc":		`The light of Cleric's spirit is blinding. Even under normal circumstances, people can't help but be drawn to them; when that spirit is focused, they will see nothing else. Cleric will gladly take all their pain and violence onto themselves.`
	},

	"Helping Hand": {
		"cost": 2,
		"effects": ["Knocked Down"],
		"target": "ally",
		"noself": true,
		"info": function (action) {return `Right an ally who has been Knocked Down.`},
		"desc": `Being knocked prone is a terrible thing to happen during a battle. Normally a person can only be righted with magic or personal struggle, but you can also just... pull them back up. Cleric is the only puppet who'd bother.`,
		"actText": function () {
			return `$subject.name helps $target.name back to $target.their feet.`;
		},
		"act": removeEffect({pierce: true}),
		"preview": "removeEffect"
	},

	"Assured Aegis": {
		"cost":		3,
		"dur":		4,
		"effects": ["Shield"],
		"target":	"ally",
		"info":	function (action) {return 	`Bestows a Shield to a puppet for ${action.dur} rounds, reducing incoming damage by ${setup.SHIELD_FACTOR*100}%.`},
		"desc":		`Don't worry. You're safe now.`,
		"actText": function () {
			return `$subject.name places a hand over $target.name like a benediction.`;
		},
		"act": applyEffect("Shield")
	},

	"Lifegiver": {
		"cost":		1,
		"hpcost":	250,
		"basic":	true,
		"target":	"ally",
		"noself":	true,
		"info":	function (action) {return 	`Give ${action.hpcost} HP to another puppet.`},
		"desc": 	`Life is a limited resource. We have only what we were given. But, if our life is ours, is it not up to us what we do with it?`,
		"actText": function () {
			return `$subject.name cradles $target.name in a comforting embrace. Vibrant green energy flows into ${target().their} wounds, and the broken flesh knits back together.`;
		},
		"act": function () {
			return `$subject.name gives ${action().hpcost} HP to $target.name!\
							<<if $ANIMATIONS === true && _queue instanceof Set>>\
								<<run target().addPopup({type: "healing", content: action().hpcost})>>\
							<<else>>\
								<<set target().hp += action().hpcost>>\
							<</if>>`
		},
		"preview": function () {
			var str = `$subject.name will give action().hpcost HP to $target.name.`;
			if ((target().hp + action().hpcost) > target().maxhp){
				str += " ...but some of it will be wasted.";
			}
			return str;
		}
	},

	"Downfall": {
		"cost":		6,
		"weight":	function () {
			var w = 1;
			if (target() == true) {
				target().effects.forEach(function (eff) {
					if (eff.buff) {
						w += action().special;
					}
				});
			}
			return w;
		},
		"special":  0.25,
		"effects": ["buffs"],
		"info":	function (action) {return 	`Inflict damage with a weight of ${action.weight} + ${action.special} for every buff empowering the enemy, removing them in the process.`},
		"desc":		`Pride goeth before a fall. Cleric can turn the enemy's hubris against them, reminding them that even the strongest warrior can be brought low by the smallest among us.`,
		"actText": function () {
			return `$subject.name plants their feet firmly. They swing their staff around in wide, twirling motions, building up momentum before charging $target.name head-on and bringing it down like a judgment from the heavens.`;
		},
		"act": function () {
			return `<<echoDamage>>\
			<<for _effect range target().effects>>`+
			`<<if _effect.buff && !_effect.sticky>>`+
			`<<print target().removeEffect(_effect)>>`+
			`<</if>>`+
			`<</for>>`+
			`<<set $removed_effects = []>>`;
		},
		"preview": "removeEffect"
	},

	"Walled City": {
		"cost":		7,
		"effweight":	(1/2),
		"target": "ally",
		"dur":		3,
		"effects": ["DEF Boost"],
		"info":	function (action) {return 	`Bestow a DEF Boost to all puppets for ${action.dur} rounds.`},
		"desc":		`A line, to separate us from them. A shield to repel all.`,
		"actText": null,
		"act": massAttack({target: "allies", content: applyEffect("DEF Boost")}),
		"preview": "mass"
	},

	// WITCH

	"Pox": {
		"cost":		2,
		"weight":	0.75,
		"effweight":	0.5,
		"effects": ["Pain"],
		"phase":		"targeting phase",
		"dur":		2,
		"info":		function (action) {return `Inflict damage with a weight of ${action.weight} and inflict Pain for ${action.dur} rounds.`},
		"desc":		`Witches are feared for their power over the unseen and unknowable. Cross them and they will strike you with an attack you can't even see: a terrible sickness of sores and blisters, unbearable in their pain.`,
		"actText": function () {
			return `$subject.name points a finger at ${target().name}, and ${target().their} skin instantly breaks out in boils that swell and burst. It looks pretty painful.`;
		},
		"act": applyEffect("Pain", {dmg: true})
	},

	"Gift": {
		"cost":		1,
		"phase":	"spell phase",
		"spellMod": function () {
			switch (action().cost) {
				case 10:
					V().action = new Action("Miracle");
					V().target = null;
					break;
				default:
			}
		},
		"basic":	true,
		"target":	"ally",
		"noself":	true,
		"info":		`Lend Energy to an ally.`,
		"desc":		`The mages may speak of "equivalent exchange", of sacrifice. Witch understands the world is not so simple. Our lives are a renewable resource, a rich pattern of ups and downs, flourishing anew every day with new choices and ideas. So this is a gift, freely given: do with it what you will.`,
		"actText": function () {
			return `$subject.name exchanges a meaningful look with $target.name, and gives them a slight nod.`;
		},
		"act": function () {
			return `$target.name gains $action.cost Energy!`+
			`<<set $target.en += $action.cost>>`;
		},
		"preview": function () {
			var note = "";
			if ((target().en + V().action.cost) > 10) {
				note = ` ...but they already have $target.en Energy, so some of it will be wasted.`;
			}
			return `$subject.name will transfer $action.cost Energy to $target.name.`+note;
		}
	},

	"Miracle": {
		"cost": 10,
		"special": 4,
		"phase": "confirm phase",
		"saveMod": "Gift",
		"actText": function () {
			return `$subject.name kneels down, spreading their hand over the earth, and whispers something you can't hear. There is a pause, and then shoots of green break through the ground. They grow and grow, joined by more and more as you watch. They burst into beautiful blooms of every possible color, vines and branches stretching out to gently rest against your puppets' shoulders like a motherly hand. Something in your vision shifts and the image suddenly disappears -- but the vibrancy of life remains. Your puppets are glowing with energy.`;
		},
		"act": function () {
			return `<<for _puppet range puppets()>>\
								<<set _puppet.en += ${this["special"]}>>\
								<<print "_puppet.name gains ${this["special"]} Energy!">>`+"\r\n"+
							`<</for>>`;
		},
		"preview": `It's a sad truth that one often gains a lesser reward than the sacrifice one gave up to achieve it. But if that's true, could it mean that sometimes, one can gain something for nothing? This spell will take 10 Energy to call to the Earth for supplication, but it will give 12 Energy in return, spread evenly across your puppets.`
	},

	"Cleanse": {
		"cost":		2,
		"phase":	"spell phase",
		"spellMod": function () {
			switch (action().cost){
				case 10:
					V().action = new Action("Renewal"),
					V().target = null;
					break;
				default:
					this.removedEffects = 1+(action().cost-V().B.mincost);
			}
		},
		"basic":	true,
		"target":	"all",
		"info":		`Removes the most recent ailment from an ally or the most recent buff from an enemy, plus 1 effect for every Energy point invested.`,
		"desc":		`Wizards heal by forcing their will upon the world, demanding that it change for them. But there is an easier way, if you are willing to work with the currents of the world instead of against them. <b>Let</b> the magic depart, like water flowing downhill.`,
		"actText": function () {
			return `$subject.name calmly waves a hand, and the magic passes like a dream.`;
		},
		"act": removeEffect(),
		"preview": "cleanse"
	},

	"Renewal": {
		"cost": 10,
		"phase": "confirm phase",
		"saveMod": "Cleanse",
		"actText": function () {
			return `$subject.name lifts their hands to the sky, palms up. There is an expectant, yearning silence in the air, and then you hear it: the crashing of waves. From out of nowhere comes an unstoppable tide of crystal-clear water, flowing over the whole arena. With every fighter it passes, you see motes of glowing magic dissolve into it, until the world before you looks like the clear night sky, bedazzled with lights. Then the flood passes, and the arena is back to normal. Everyone is completely dry.`;
		},
		"act": function () {
			return `<<for _enemy range $enemies>>\
								<<if !_enemy.dead>>\
									<<for _k, _effect range _enemy.effects>>\
										<<if _effect.buff>>\
											<<print _enemy.removeEffect(_effect,{pierce: true, unsticky: true})>>\
										<</if>>\
									<</for>>\
								<</if>>\
							<</for>>\
							<<for _puppet range puppets()>>\
								<<if _puppet.dead isnot true>>\
									<<for _k, _effect range _puppet.effects>>\
										<<if !_effect.buff>>\
											<<print _puppet.removeEffect(_effect,{pierce: true, unsticky: true})>>\
										<</if>>\
									<</for>>\
								<</if>>\
			<</for>>`;
		},
		"preview": `By accepting the flow of nature, all your troubles can be washed away. This miracle will remove all buffs from enemies and all ailments from allies, even through Stasis and Chi Shield.`
	},

	"Forgetfulness": {
		"cost":		2,
		"dur":		1,
		"effects": ["Stunned"],
		"info":		`Stun an enemy.`,
		"desc":		`There's no need to go through your opponent when you can go around them instead. A simple touch on the mind, and they'll lose all memory of what they were doing.`,
		"actText": function () {
			return `$subject.name slowly waves a hand over $target.name's eyes.`;
		},
		"act": applyEffect("Stunned")
	},

	"Frenzy": {
		"cost":		4,
		"effweight":	(40/55),
		"dur":		3,
		"effects": ["Frenzy"],
		"target":	"ally",
		"info":		function (action) {return `Greatly boost Attack, but cut Defense by half the amount. Lasts ${action.dur} rounds.`},
		"desc":		`Power like no other, at the expense of all else. Witch can give it to you, if you are prepared to accept it.`,
		"actText": function () {
			return `$subject.name bites their thumb, and smears the blood over $target.name's face in a strange pattern. Their eyes narrow into slits.`;
		},
		"act": applyEffect("Frenzy")
	},

	"Thaumastasis": {
		"cost":		5,
		"phase":	"targeting phase",
		"dur":		7,
		"effects": ["Stasis"],
		"target":	"ally",
		"info":		function (action) {return `Place a puppet in Stasis, preventing any change to their effects for ${action.dur} rounds.`},
		"desc":		`Being one with nature sounds all well and good right up until you're getting chased by a bear while suffering from some new and exciting disease and starving from the recent drought. Sometimes, nature needs a kick in the teeth. Witch can forcefully stop the flow of magic completely, forcing every one of an individual's effects to stay exactly as they are.`,
		"actText": function () {
			return `$subject.name snaps their fingers. The air around $target.name seems to freeze for a moment, then returns to normal.`;
		},
		"act": applyEffect("Stasis")
	},

	"Age of Enlightenment": {
		"cost":		7,
		"effweight":	(1/2),
		"effects": ["SPC Boost"],
		"target": "ally",
		"dur":		3,
		"info":		function (action) {return `Bestow a SPC Boost to all puppets for ${action.dur} rounds.`},
		"desc":		`To hoard one's knowledge is inevitably to lose it. Let it free, so that it can live.`,
		"actText": null,
		"act": massAttack({target: "allies", content: applyEffect("SPC Boost")}),
		"preview": "mass"
	},

	// ARTIST

	"Crimson Flames": {
		"basic": true,
		"cost": 2,
		"weight": 1,
		"element": "red",
		"info":	function (action) {return 	`Inflicts Red damage with a weight of ${action.weight}.`},
		"desc":		`Red is the color of anger, passion, and hunger. The consuming power of fire is often used as its conduit, even though real flames can be almost any color.`,
		"actText": function () {
			return `${subject().name} paints a pure red flame to consume the foe.`;
		},
		"act": justdmg()
	},

	"Azure Frost": {
		"basic": true,
		"cost": 2,
		"weight": 1,
		"element": "blue",
		"info":	function (action) {return 	`Inflicts Blue damage with a weight of ${action.weight}.`},
		"desc":		`Blue is the color of sadness, stillness, and emptiness. The stilling power of ice is often used as its conduit, even though real ice is colorless in all but the largest quantities.`,
		"actText": function () {
			return `${subject().name} paints crystals of stark blue ice to freeze the foe.`;
		},
		"act": justdmg()
	},

	"Gold Sparks": {
		"basic": true,
		"cost": 2,
		"weight": 1,
		"element": "yellow",
		"info":	function (action) {return 	`Inflicts Yellow damage with a weight of ${action.weight}.`},
		"desc":		`Yellow is the color of joy, energy, and movement. The velocitous power of electricity is often used as its conduit, even though real arcs are so bright and ephemeral none can truly claim to know their color.`,
		"actText": function () {
			return `${subject().name} paints dazzling gold arcs of electricity to shock the foe.`;
		},
		"act": justdmg()
	},

	"White Light": {
		"basic": true,
		"cost": 2,
		"weight": 1,
		"element": "white",
		"info":	function (action) {return 	`Inflicts ${action.element.toUpperFirst()} damage with a weight of ${action.weight}.`},
		"desc":		`White is the color of everything or the color of nothing, depending on how you look at it. Blessed light or blank canvas, purity or pollution? But no matter your perspective, none can deny its power. White is attributed to the arcane, the spiritual, the transcendent. Let the enemy witness it, and weep.`,
		"actText": function () {
			return `${subject().name} paints a sunburst of purest white.`;
		},
		"act": justdmg()
	},

	"Black Night": {
		"basic": true,
		"cost": 2,
		"weight": 1,
		"element": "black",
		"info":	function (action) {return 	`Inflicts ${action.element.toUpperFirst()} damage with a weight of ${action.weight}.`},
		"desc":		`Black is the color of nothing or the color of everything, depending on how you look at it. Empty void or rich soil, death or life? But no matter your perspective, none can deny its power. Black is attributed to the dark, the physical, the unknown. Let the enemy witness it, and weep.`,
		"actText": function () {
			return `${subject().name} paints a night of purest black.`;
		},
		"act": justdmg()
	},

	"Red Tide": {
		"cost": 6,
		"weight": 0.8,
		"element": "red",
		"area": "all",
		"info":	function (action) {return 	`Inflicts Red damage to all enemies with a weight of ${action.weight}.`},
		"desc":		`Remember that it is the color that matters, not the medium. Though we often associate water with the color blue, in truth it is a blank palette, clear but for the impurities it has consumed and scattered throughout its body. With this in mind, it is surprisingly easy to tint it with the consuming power of the Red.`,
		"actText": function () {
			return `${subject().name} paints a wave of blood-red water that washes away the enemies.`;
		},
		"act": massAttack(),
		"preview": "mass"
	},

	"Blue Lightning": {
		"cost": 6,
		"weight": 0.8,
		"element": "blue",
		"area": "all",
		"info":	function (action) {return 	`Inflicts Blue damage to all enemies with a weight of ${action.weight}.`},
		"desc":		`Remember that it is the color that matters, not the medium. We often associate lightning with the color yellow, but why? It exists only for but a blinding instant; can you be sure your eyes do not play tricks on you? Some say it looks closer to a blue tinge, and sure enough it can channel the awful majesty of the Blue as well.`,
		"actText": function () {
			return `${subject().name} paints a storm of sky-blue lightning to devastate the enemies.`;
		},
		"act": massAttack(),
		"preview": "mass"
	},

	"Yellow Scorch": {
		"cost": 6,
		"weight": 0.8,
		"element": "yellow",
		"area": "all",
		"info":	function (action) {return 	`Inflicts Yellow damage to all enemies with a weight of ${action.weight}.`},
		"desc":		`Remember that it is the color that matters, not the medium. Though we often associate fire with the color red, that is only actually true for the coldest flames. A hotter flame can hold the manic energy of the Yellow just fine.`,
		"actText": function () {
			return `${subject().name} paints a scorching blaze of star-yellow fire that sweeps over the enemies.`;
		},
		"act": massAttack(),
		"preview": "mass"
	},

	"Violet Bloom": {
		"cost": 2,
		"weight": 1,
		"element": ["red","blue"],
		"info":	function (action) {return 	`Inflicts Red/Blue damage with a weight of ${action.weight}.`},
		"desc":		`Red and blue combined makes violet. Flowers can be used as its conduit, combining the hypnotic beauty of the Blue with the hungry consumption of the Red.`,
		"actText": function () {
			return `${subject().name} paints the enemy wrapped in a violet wreath of beautiful, hungry flowers.`;
		},
		"act": justdmg()
	},

	"Orange Blaze": {
		"cost": 2,
		"weight": 1,
		"element": ["red","yellow"],
		"info":	function (action) {return 	`Inflicts Red/Yellow damage with a weight of ${action.weight}.`},
		"desc":		`Red and yellow combined makes orange. Fury and ecstasy together create a wild, uncontrollable flame that consumes all in its path.`,
		"actText": function () {
			return `${subject().name} splatters ${subject().their} canvas with a wild blaze of orange, consuming the foe utterly.`;
		},
		"act": justdmg()
	},

	"Green Toxin": {
		"cost": 2,
		"weight": 1,
		"element": ["blue","yellow"],
		"info":	function (action) {return 	`Inflicts Blue/Yellow damage with a weight of ${action.weight}.`},
		"desc":		`Blue and yellow combined makes green. Despair and mania both, a seeming impossibility, can be channeled through the power of poisons that overstimulate the body unto exhaustion.`,
		"actText": function () {
			return `${subject().name} paints tendrils of toxic green curling into the enemy's veins.`;
		},
		"act": justdmg()
	},

	"Prismatic Spray": {
		"cost": 3,
		"weight": 1,
		"element": ["red","blue","yellow","white","black"],
		"info":	function (action) {return 	`Inflicts omni-elemental damage with a weight of ${action.weight}.`},
		"desc":		`Light contains all colors, if one knows how to reveal their secrets.`,
		"actText": function () {
			return `${subject().name} refracts a beam of light through ${subject().their} canvas, creating a kaleidescopic spray of color.`;
		},
		"act": justdmg()
	},

	"Sacrament": {
		"cost": 4,
		"weight": 2,
		"element": function () {
			return subject().lastUsed;
		},
		"dur": 4,
		"effects": ["Consecrated"],
		"special": 0.5,
		"noDefault": true,
		"needsPriorElement": true,
		"info":	function (action) {return 	`Inflicts damage of the last element used with a weight of ${action.weight}, and increases the enemy's resistance to that element by ${action.special*100}% for ${action.dur} turns.`},
		"desc": `Bless an enemy with the purest hue of an element's color. It will overwhelm their uninitiated senses in an orgy of agony and ecstasy, but afterwards they will be inoculated, resisting further manifestations of the element.`,
		"actText": function () {
			return `${subject().name} consecrates the enemy in the holy power of the ${subject().lastUsed.toUpperFirst()}, searing its color into ${target().their} soul.`;
		},
		"act": function () {
			return `<<set $action._element = subject().lastUsed>>\
							<<echoDamage>>\
							<<print target().addEffect("Consecrated")>>`;
		},
	},

	"Blasphemy": {
		"cost": 4,
		"weight": 0.75,
		"element": function () {
			return subject().lastUsed;
		},
		"dur": 4,
		"effects": ["Desecrated"],
		"special": 0.5,
		"noDefault": true,
		"needsPriorElement": true,
		"info":	function (action) {return 	`Inflicts damage of the last element used with a weight of ${action.weight}, and reduces the enemy's resistance to that element by ${action.special*100}% for ${action.dur} turns.`},
		"desc": `Desecrate an element that lies within an enemy. Such an irreverent technique can inflict only superficial damage, but it will leave a scar.`,
		"actText": function () {
			return `${subject().name} desecrates the ${subject().lastUsed.toUpperFirst()} before the enemy, opening ${target().their} soul to its wrath.`;
		},
		"act": function () {
			return `<<set $action._element = subject().lastUsed>>\
							<<echoDamage>>\
							<<print target().addEffect("Desecrated")>>`;
		},
	},

	// CRISIS

	"Desperate Attack": {
		"crisis": true,
		"weight": 3.5,
		"act": justdmg(),
		"actText": null,
		"info": function (action) {return `Inflicts damage with a weight of ${action.weight}.`;},
		"desc": null
	},

	"Perfect Defense": {
		"crisis": true,
		"dur": 3,
		"effects": ["Invincible"],
		"phase": "confirm phase",
		"act": applyEffect("Invincible",{self:true}),
		"actText": null,
		"info": function (action) {return `User becomes immune to all damage for ${action.dur} rounds.`;},
		"desc": null
	},

	"Divine Protection": {
		"crisis": true,
		"dur": -1,
		"act": massAttack({target: "allies", content: applyEffect("Divine Protection")}),
		"target": "ally",
		"actText": null,
		"info": function (action) {return `All allies will gain complete protection from the next two attacks.`;},
		"desc": null
	},

	"Bloody Rain": {
		"crisis": true,
		"weight": 1.5,
		"area": "all",
		"act": massAttack(),
		"actText": function () {
			return `${subject().name} rains death from the sky.`;
		},
		"info": function (action) {return `Attack all enemies with a weight of ${action.weight}.`;},
		"desc": null,
		"preview": "mass"
	},

	"Stash": {
		"crisis": true,
		"phase": "Stash Phase",
		"info": `Use an item for free.`,
		"desc": `Rogue may have kept a few of the party's items tucked away for themselves. But now that the chips are down, they've got to use everything at their disposal!`,
		"preview": null
	},

	// ITEMS

	"Salve": {
		"target": "ally",
		"special": 250,
		"act": heal,
		"actText": function () {
			var text;
			target() == subject() ? text = subject().their : text = target().name+"'s";
			return `${subject().name} pours MegaCorp's healing salve into ${text}'s wounds.`
		},
		"preview": Prev.heal()
	},

	"Antidote": {
		"target": "ally",
		"effects": ["Poisoned"],
		"act": removeEffect(),
		"preview": "removeEffect"
	},

	"Fire Extinguisher": {
		"target": "ally",
		"effects": ["Burning"],
		"act": removeEffect(),
		"preview": "removeEffect"
	},

	"Healing Crystal": {
		"target": "ally",
		"effects": ["Dizzy"],
		"act": removeEffect(),
		"preview": "removeEffect"
	},

	"Nanites": {
		"target": "ally",
		"effects": ["Injury"],
		"act": removeEffect({removeStack: true}),
		"preview": "removeEffect"
	},

	"Painkiller": {
		"target": "ally",
		"effects": ["Pain"],
		"act": removeEffect({removeStack: true}),
		"preview": "removeEffect"
	},

	"Asprin": {
		"target": "ally",
		"effects": ["Headache"],
		"act": removeEffect({removeStack: true}),
		"preview": "removeEffect"
	},

	"Canned Air": {
		"target": "ally",
		"effects": ["Winded"],
		"act": removeEffect({type: "Winded"},`<<set $target.en += 1>>`),
		"preview": "removeEffect"
	},

	"Smelling Salts": {
		"target": "ally",
		"effects": ["Asleep"],
		"act": removeEffect(),
		"preview": "removeEffect"
	},

	"Anti-Mineral Water": {
		"target": "ally",
		"effects": ["Petrified"],
		"act": removeEffect(),
		"preview": "removeEffect"
	},

	"Panacea": {
		"target": "ally",
		"effects": ["all"],
		"act": removeEffect({unsticky: true}),
		"preview": "removeEffect"
	},

	"Bottled Chi": {
		"target": "ally",
		"dur": 3,
		"effects": ["Chi Shield"],
		"act": applyEffect("Chi Shield")
	},

	"Adrenaline": {
		"effweight": setup.STD_BUFF,
		"dur": 4,
		"effects": ["ATK Boost"],
		"target": "ally",
		"actText": `$subject.name injects a shot of adrenaline.`,
		"act": applyEffect("ATK Boost")
	},

	"Stoneskin": {
		"effweight": setup.STD_BUFF,
		"dur": 4,
		"effects": ["DEF Boost"],
		"target": "ally",
		"actText": `$subject.name uses some Stoneskin formula.`,
		"act": applyEffect("DEF Boost")
	},

	"Nootropic": {
		"effweight": setup.STD_BUFF,
		"dur": 4,
		"effects": ["SPC Boost"],
		"target": "ally",
		"act": applyEffect("SPC Boost")
	},

	"Stimulant": {
		"target": "ally",
		"act": function () {
			return 		 `<<set $target.en += 5>>\
			$target.name gains 5 Energy!`;
		},
		"preview": function () {
			var note = "";
			if ((target().en + 5) > 10) {
				note = ` ...but they already have $target.en Energy, so some of it will be wasted.`;
			}
			return `$target.name will gain 5 Energy.`+note;
		}
	},

	"Throwing Knife": {
		"weight": 1.25,
		"act": justdmg()
	},

	"Powdered Glass": {
		"weight": 1,
		"dur":	1,
		"effects": ["Stunned"],
		"actText": `$subject.name throws powdered glass in your enemy's eyes. Ouch!`,
		"act": applyEffect("Stunned",{dmg: true})
	},

	"Grenade": {
		"weight": 1.5,
		"area": "all",
		"actText": `$subject.name chucks a grenade.`,
		"act": splashDamage({target:'t',cut:2}),
		"preview": ["splash","mass"]
	},

	"Flamethrower": {
		"weight": 1,
		"effweight": 0.6,
		"dur": 5,
		"area": "all",
		"actText": `$subject.name bathes your enemies in flame.`,
		"act": massAttack({target:'enemies', cut:true, content: applyEffect("Burning")}),
		"preview": Prev.cutAttack("Burning")
	},

	"Gas Bomb": {
		"weight": 1,
		"effweight": 0.6,
		"dur": 5,
		"area": "all",
		"actText": `$subject.name throws a bomb filled with noxious gas.`,
		"act": massAttack({target:'enemies', cut:true, content: applyEffect("Poisoned")}),
		"preview": Prev.cutAttack("Poisoned")
	},

	"Flashbang": {
		"effects": "Stunned",
		"area": "all",
		"act": massAttack({target: "enemies", content: applyEffect("Stunned")}),
		"preview": "mass"
	},

	"Calamity Bomb": {
		"weight": 1,
		"effweight": 0.6,
		"dur": 3,
		"effects": ["Injury","Pain","Headache"],
		"actText": `$subject.name throws a calamity bomb.`,
		"act": applyEffect(["Injury","Pain","Headache"],{dmg: true})
	}

};
