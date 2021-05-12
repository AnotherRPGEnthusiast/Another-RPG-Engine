Object.assign(setup.actionData, {
	// Note that this will overwrite any actions with identical names

	// DIPPER

	"Dispel Magick": {
		"cooldown": 4,
		"useText": function () {
			var god;
			switch (target().name){
				case "Rogue":
				case "Witch":
					god = "Chattur'gha";
					break;
				case "Fighter":
				case "Archer":
					god = "Ulyaoth";
					break;
				default:
					god = "Xel'lotath";
					break;
			}
			return `Dipper frantically flips through his journal before yelling, "Nekleth Redgemor ${god}!"`
		},
		"actText": function () {
			return `Magickal runes swirl around Dipper before crashing violently to the earth, releasing a nauseating wave that strips ${target().name} of ${target().their} powers.`;
		},
		"act": removeEffect({dispel: true})
	},

	"Recovery": {
		"targetMethod": function () {
			var dipper = enemies().find(function (e) {return e.name === "Dipper"});
			var mabel = enemies().find(function (e) {return e.name === "Mabel"});
			if (mabel.effectCount("ailment") > 0 && mabel.effectCount("ailment") >= dipper.effectCount("ailment")){
				//If Mabel has any ailments and more ailments than Dipper, Dipper will always heal her
				return mabel;
			} else if (dipper.effectCount("ailment") > 0) {
				//If first check failed, Dipper must have more ailments than Mabel; if he has any ailments, he will always heal himself.
				return dipper;
			} else {
				//If no one has ailments, target is random
				return Hitlist.targetAlly(["random"]);
			}
		},
		"effweight": setup.STD_BUFF,
		"dur": 3,
		"target": "ally",
		"useText": function () {
			let rand = random(1,3);
			switch (rand) {
				case 1:
					action().god = "Chattur'gha";
					action()._special = "DEF";
					break;
				case 2:
					action().god = "Ulayoth";
					action()._special = "ATK";
					break;
				case 3:
					action().god = "Xel'lotath";
					action()._special = "SPC";
					break;
			}
			return `Dipper frantically flips through his journal before yelling, "Narokath Santak ${action().god}!"`;
		},
		"actText": function () {
			let extension = "";
			switch (action().god) {
				case "Chattur'gha":
					extension += `pulses with a violent red light.`;
					break;
				case "Ulayoth":
					extension += `glows with the deep blue of the abyss.`;
					break;
				case "Xel'lotath":
					extension += `shines with a green light that hurts to look at.`;
					break;
			}
			return `Eldritch runes glow beneath Dipper's feet, and ${target().name} `+extension;
		},
		"act": function () {
			return `<<for _effect range $B.target.effects>>\
								<<if !_effect.buff>>\
									<<set _effect.duration -= 1>>\
									<<if _effect.duration == 0>>\
										<<print target().removeEffect(_effect)>>\
									<</if>>\
								<</if>>\
							<</for>>\
							<<print target().addEffect("${action().special} Boost")>>`;
		}
	},

	"Damage Field": {
		"targetMod": ["debuff"],
		"weight": 0.8,
		"effweight": setup.STD_DEBUFF,
		"dur": 3,
		"useText": function () {
			let rand = random(1,3);
			switch (rand) {
				case 1:
					action().god = "Chattur'gha";
					action()._special = "Pain";
					break;
				case 2:
					action().god = "Ulayoth";
					action()._special = "Injury";
					break;
				case 3:
					action().god = "Xel'lotath";
					action()._special = "Headache";
					break;
			}
			return `Dipper frantically flips through his journal before yelling, "Bankorok Redgemor ${action().god}!"`;
		},
		"actText": function () {
			switch (action().god) {
				case "Chattur'gha":
					return `Pillars of red energy burst from the ground under $B.target.name like claws, searing their flesh where they touch.`;
				case "Ulayoth":
					return `Waves of blue energy pulse around $B.target.name and chill them with a numbing cold.`;
				case "Xel'lotath":
					return `The floor under $B.target.name flashes with a sickening green energy that makes your vision swim.`;
			}
			return `ERROR: invalid god`;
		},
		"act": function () {
			return `<<echoDamage>>\
				<<print target().addEffect("${action().special}")>>`;
		}
	},

	"Bind Creature": {
		"targetMod": ["ignore downed"],
		"dur": 1,
		"weight": 0.7,
		"useText": function () {
			let god = "";
			switch (target().name){
				case "Rogue":
				case "Witch":
					god = "Chattur'gha";
					break;
				case "Fighter":
				case "Archer":
					god = "Ulyaoth";
					break;
				default:
					god = "Xel'lotath";
					break;
			}
			return `Dipper frantically flips through his journal before yelling, "Bankorok Aretak ${god}!"`;
		},
		"actText": function () {
			return `${target().name} is lashed by chains of light.`;
		},
		"act": applyEffect("Stunned",{dmg: true})
	},

	// BIG DIPPER

	"Empowered Dispel Magick": {
		"cooldown": 4,
		"nameCD": "Dispel Magick",
		"useText": function () {
			return `A deep voice intones, "Pargon Nekleth Redgemor Mantorok."`
		},
		"actText": function () {
			return `Magickal runes swirl around Dipper before crashing violently to the earth, releasing a nauseating wave that dispels everyone's magic.`;
		},
		"act": massAttack({target: "enemies", content: removeEffect({dispel: true})})
	},

	"Empowered Recovery": {
		"targetMethod": function () {
			return subject();
		},
		"effweight": 0.2,
		"dur": 3,
		"target": "ally",
		"useText": function () {
			return `A deep voice intones, "Pargon Narokath Santak Mantorok."`;
		},
		"actText": function () {
			return `Veins of indigo darkness wrap around Dipper like a caress.`;
		},
		"act": function () {
			return `<<for _effect range $B.subject.effects>>\
								<<if !_effect.buff>>\
									<<set _effect.duration -= 1>>\
									<<if _effect.duration == 0>>\
										<<print target().removeEffect(_effect)>>\
									<</if>>\
								<</if>>\
							<</for>>\
							<<print subject().addEffect("Blessing")>>`;
		}
	},

	"Empowered Damage Field": {
		"weight": 1,
		"effweight": 0.3,
		"dur": 3,
		"useText": function () {
			return `A deep voice intones, "Pargon Bankorok Redgemor Mantorok."`;
		},
		"actText": function () {
			return `$B.target.name is crushed by a field of violet energy. Though it's only the puppet that was hit, you get a feeling like someone's walked over your grave.`;
		},
		"act": applyEffect("Curse",{dmg: true})
	},

	"Empowered Bind Creature": {
		"targetMod": ["ignore downed"],
		"dur": 1,
		"weight": 1,
		"useText": function () {
			return `A deep voice intones, "Pargon Bankorok Aretak Mantorok."`;
		},
		"actText": function () {
			return `${target().name} is savagely lashed by chains of darkness.`;
		},
		"act": applyEffect("Stunned",{dmg: true})
	},

	"Empowered Magickal Attack": {
		"weight": 0.75,
		"dur": 2,
		"useText": function () {
			return `A deep voice intones, "Pargon Antorbok Redgemor Mantorok."`;
		},
		"actText": function () {
			return `Dark lightning leaps from Dipper's feet to strike your puppets in turn. The shock makes them stagger and move erratically, draining their energy.`;
		},
		"act": massAttack({target: "enemies", content: applyEffect("Winded",{dmg: true})})
	},

	// MABEL

	"Cuteness Poisoning": {
		"targetMod": ["custom"],
		"weight": 1,
		"effweight": 0.3,
		"dur": 3,
		"actText": function () {
			return `Mabel conjures an image of a kitten... no, wait, <i>two</i> kittens? And they're riding on a <i>puppy</i>? Omigosh, it's so cute you could just <i>DIE!</i>`;
		},
		"act": applyEffect("Poisoned",{dmg: true})
	},

	"Galacta Burning": {
		"targetMod": ["custom"],
		"weight": 1,
		"effweight": 0.3,
		"dur": 3,
		"actText": function () {
			return `Mabel points her hands at you, and multicolored cartoon stars fly from her fingertips, leaving glittering trails behind them. When they run into ${target().name} they explode in a fiery burst, as hot as if they were real stars.`;
		},
		"act": applyEffect("Burning",{dmg: true})
	},

	"Glitter Bomb": {
		"cooldown": 2,
		"weight": 1,
		"dur": 3,
		"actText": function () {
			return `Out of nowhere, Mabel summons a dazzling, multicolored ball of sparkles and glitter. With a manic laugh she throws it at $B.target.name, and it explodes with a blinding firework of color!`;
		},
		"act": applyEffect("Dizzy",{dmg: true})
	},

	"Chaos Blaster": {
		"weight": 1,
		"actText": function () {
			return `You blink, and Mabel is suddenly holding a massive gun absolutely drowning in glitter and unicorn decals. She triumphantly points it at $B.target.name and shouts, "CHAOS... BLASTERRR!!" A shimmering, multicolored beam erupts from the cannon before it explodes magnificently in a burst of glitter.`;
		},
		"act": justdmg()
	},

	"Kitty Cannon": {
		"targetMod": ["custom","random"],
		"weight": 0.5,
		"actText": function () {
			return `Mabel's fists are suddenly replaced with mewling kittens. Just as you're trying to guess what tactical advantage this could possibly provide, they fly at your puppets like missiles!`;
		},
		"act": multihitCustom({content: `<<echoDamage>>`, hits: 3, spread: true})
	},

	// MEGA MABEL

	"Cuteness Overload": {
		"targetMod": ["custom"],
		"weight": 0.8,
		"effweight": 0.3,
		"dur": 3,
		"actText": function () {
			return `Mabel conjures a huge panorama of impossibly cute things. It's like your own petting zoo in here! There are ducks riding ponies! Puppies snuggling in boxes! Cats doing that thing where they curl their head in their little paws! It's... too much! The cuteness is going to make you EXPLODE!`;
		},
		"act": massAttack({target: "enemies", content: applyEffect("Poisoned",{dmg: true})})
	},

	"Galacta Blazing": {
		"targetMod": ["custom"],
		"weight": 0.8,
		"effweight": 0.3,
		"dur": 3,
		"actText": function () {
			return `Mabel flies up and raises her hands to the stars... and suddenly, the stars seem a whole lot closer. Mabel rains down what looks like the whole galaxy on you, stars bursting into psychedelic sparkles and flames where they hit.`;
		},
		"act": massAttack({target: "enemies", content: applyEffect("Burning",{dmg: true})})
	},

	"Anarchy Rave": {
		"cooldown": 3,
		"nameCD": "Glitter Bomb",
		"weight": 0.8,
		"dur": 3,
		"actText": function () {
			return `Mabel rocks out, literally bouncing off the walls with her aerial acrobatics. A disco ball appears out of nowhere and the arena is suddenly ablaze with strobe lights.

			And lasers. The disco ball also shoots lasers. The hot, burny kind, not the fun kind.`;
		},
		"act": massAttack({target: "enemies", content: applyEffect("Dizzy",{dmg: true})})
	},

	"Chaos Thunder": {
		"weight": 1.25,
		"actText": function () {
			return `Mabel does her best witchy cackle, letting her hands arc and crackle with electricity. She throws her arms straight up, and the magic shoots into to the sky in a brilliant stream. Then with a final, bellowing laugh, she closes her hand into a fist and brings it down like a hammer.

			"CHAOS... THUNDERRR!!"

			Lightning splits the air, leaving a wave of multicolored stars around the hapless puppet it fries.`;
		},
		"act": justdmg()
	},

});
