setup.enemyData = {

	// GRAVITY FALLS 1

	"Dipper": {
		"bestiaryNo": 0,
		"alts": ["Big Dipper"],
		"gender": 'M',
		"hp": 1000,
		"stats": {
			"Attack"	: 25,
			"Defense"	: 30,
			"Special"	: 35
		},
		"elements": {
			"black"	: 0.8,
			"white"	: 1.2,
			"blue"	: 0,
			"yellow": -0.1
		},
		"cooldown": {
			"Dispel Magick": 0
		},
		"actions": function () {
			while (V().action === null) {
				console.log("Dipper actions rolling");
				var act = random(1,100);
				console.log("act = "+act);

			// Dipper is a support caster. Half the time, he will enter support mode. If he is able, he will prioritize Dispel Magick, which will remove all buffs from one target. This is pretty powerful, so for balance it has a long cooldown (4 rounds) and a threshold of 2 buffs. If dispelTarget fails the threshold or Dispel is still on cooldown, he will use Recovery. Since there's no healing, I will instead interpret this as a buff spell, but it can also provide the ailment reduction like Bonfire Monk's Heal. Because he's selfless, he will prioritize Mabel if she has the same number of ailments as him; otherwise he will pick the person with more ailments, or choose randomly if no one has any ailments. The buff is chosen completely randomly because I don't want to try to make logic for that. (Patron maps onto the specializations for the basic three classes, so Chattur'gha = DEF, Ulayoth = ATK, Xel'lotath = SPC.)

			// Half the time, he will enter attack mode. 25% of the time, he will use Damage Field, which I am interpreting as damage + debuff because Mabel already has DoT and there are no multi-turn stuns. Debuff is again chosen randomly. The other 25% of the time, he will use Bind Creature, which does weak damage + stun. All of his attack weights are below 1, so he cannot deal significant damage on his own.

			if (this.CDcheck("Dispel Magick") && act <= 50) {
				console.log("Dispel Magick selected");
				if (dispelCheck() > 2) {
					V().action = new Action("Dispel Magick");
					return;
				}
			}
			if (act <= 50) {
				console.log("Healing selected");
				V().action = new Action("Recovery");
			}
			else if (act <= 75 && act > 50) {
				console.log("Debuff selected");
				V().action = new Action("Damage Field");
			}
			else if (act <= 100 && act > 75) {
				console.log("Bind Creature selected");
				V().action = new Action("Bind Creature");
			}

			} // end loop
			return;
		}
	},

	"Big Dipper": {
		"noBestiary": true,
		"special": function (actor) {
			actor._idname = "Dipper";
			actor.name = "Big Dipper";
		},
		"actions": function () {
			while (V().action === null){
				var act = random(1,100);

//			Big Dipper gains stronger offense to make up for the loss of Mabel, but still focuses on debuffs and ailments, making him a sort of balanced mage. His Damage Field and Bind Creature go up to weight 1, making them fairly potent attacks, and he gains a full-party damage + Winded spell.

//			20%: Empowered Dispel Magick
//			20%: Empowered Recovery (Mantorok), which grants Blessing
//			20%: Empowered Damage Field (Mantorok), which inflicts Curse
//			20%: Empowered Bind Creature
//			20%: Empowered Magickal Attack

			if (this.CDcheck("Dispel Magick") && act <= 20) {
				if (dispelCheck(["mass"]) > 4) {
					V().action = new Action("Empowered Dispel Magick");
					return;
				}
			}
			else if (this.blessing == false && act <= 40 && act > 20) {
				V().action = new Action("Empowered Recovery");
			}
			else if (act <= 60 && act > 40) {
				V().action = new Action("Empowered Damage Field");
			}
			else if (act <= 80 && act > 60) {
				V().action = new Action("Empowered Bind Creature");
			}
			else if (act <= 100 && act > 80) {
				V().action = new Action("Empowered Magickal Attack");
			}

			}
			return;
		}
	},

	"Mabel": {
		"bestiaryNo": 0,
		"alts": ["Mega Mabel"],
		"gender": 'F',
		"hp": 1000,
		"stats": {
			"Attack"	: 40,
			"Defense"	: 25,
			"Special"	: 25
		},
		"elements": {
			"white": 0,
			"red"	: 0.5,
			"blue"	: 2,
			"yellow": -2
		},
		"cooldown": {
			"Glitter Bomb": 0
		},
		"actions": function () {
			while (V().action === null){
				console.log("Mabel actions rolling");
				var act = random(1,100);
				console.log("act = "+act);

			// Mabel is a simple soul, so she just picks from five attacks randomly with even chances.

			// Mabel is blaster caster. She has two DoT attacks, one for Poison and one for Burning. Due to the imbalance between her ATK and SPC, they are designed to be mainly heavy initial hits with minor DoT, to ease players into the concept before the fight with Bill, who will invert the dynamic. She also has a Dizzy attack, just because I loved the idea of a "Glitter Bomb" attack and that was the logical ailment for it. Since this is a hold effect, it has a one-turn cooldown to prevent her from incapacitating the whole party with lucky rolls. For pure damage, she has a 3-hit spread attack as well as a regular attack that actually functions effectively as more of a breather, as it's not significantly stronger than her DoT attacks.

			if (act <= 20){
				console.log("Cuteness Poisoning selected");
				V().action = new Action("Cuteness Poisoning");
			}
			else if (act <= 40 && act > 20) {
				console.log("Galacta Burning selected");
				V().action = new Action("Galacta Burning");
			}
			else if (this.CDcheck("Glitter Bomb") && act <= 60 && act > 40) {
				console.log("Glitter Bomb selected");
				V().action = new Action("Glitter Bomb");
			}
			else if (act <= 80 && act > 60) {
				console.log("Chaos Blaster selected");
				V().action = new Action("Chaos Blaster");
			}
			else if (act > 80) {
				console.log("Kitty Cannon selected");
				V().action = new Action("Kitty Cannon");
			}

			} //end loop
			return;
		}
	},

	"Mega Mabel": {
		"noBestiary": true,
		"special": function (actor) {
			actor._idname = "Mabel";
			actor.name = "Mega Mabel";
		},
		"actions": function () {
			while (V().action === null){
				var act = random(1,100);

			//The idea behind Mega Mabel is a "sprint to the finish" kind of boss. Her attacks don't get stronger, but they now strike the whole party, making them much harder to defend against and encouraging the player to just rush her before she overwhelms you. Chaos Blaster is also upgraded to a true single-target nuke, meaning it is still possible for her to pick off individuals.

			if (act <= 20){
				V().action = new Action("Cuteness Overload");
			}
			else if (act <= 40 && act > 20) {
				V().action = new Action("Galacta Blazing");
			}
			else if (this.CDcheck("Glitter Bomb") && act <= 60 && act > 40) {
				V().action = new Action("Anarchy Rave");
			}
			else if (act <= 80 && act > 60) {
				V().action = new Action("Chaos Thunder");
			}
			else if (act > 80) {
				V().action = new Action("Kitty Cannon");
			}

			} //end loop
			return;
		}
	},

	// ADVENTURE TIME 1

	"Finn": {
		"bestiaryNo": 0,
		"gender": 'M',
		"hp": 500,
		"stats": {
			"Attack"	: 60,
			"Defense"	: 20,
			"Special"	: 10
		},
		"actions": function () {
			while (V().action === null){
				var act = random(1,2);

			// Finn smash. Half the time he will do a regular attack, and half the time he will mimic Fighter's Assault. No further logic, because he is a doofus with no concern for his own safety.

			if (act == 1) {

				V().action = new Action("Sword");
				V().action.actText = "Finn swings his sword wildly!";
				V().action.useText = null;
			} else if (act == 2) {
				V().action = new Action("Assault");
				V().action.actText = "Finn charges in recklessly!";
				V().action.useText = null;
				V().action.act = applyEffect("Off-Balance",{self: true, dmg: true});
			}

			} //end loop
			return;
		}
	},

	"Jake": {
		"bestiaryNo": 0,
		"gender": 'M',
		"hp": 500,
		"stats": {
			"Attack"	: 20,
			"Defense"	: 40,
			"Special"	: 30
		},
		"cooldown": {
			"Below the Belt": 0,
			"Dead Ringer": 0,
			"Trip": 0
		},
		"actions": function () {
			while (V().action === null){
				var act = random(1,100);
				console.log(`Jake act = ${act}`);

//			Jake is a dual-class Fighter/Rogue. He always protects someone if they're at less than half health (but prioritizes Finn because he cares about him more). From there his breakdown is:
//			25%: Martyr (if viable)
//			10%: stun
//			20%: Below the Belt
//			20%: Dead Ringer
//			10%: AoE Off-Balance
//			15%: regular attack

//			He therefore has a higher chance of tanking than any other individual action, but will use debuff attacks most of the time. However, his attacks have long cooldowns, so on any given turn his chances might break down differently.

			if (V().enemies[2].hp < (V().enemies[2].maxhp / 2) && !V().enemies[2].dead && !this.protector && act <= 30){ //If Finn is below 50% HP
				V().target = V().enemies[2];
				V().action = new Action("Protector");
				V().action._actText = `Jake wraps himself around $target.name like a suit of armor.`;
			}
			else if (V().enemies[1].hp < (V().enemies[1].maxhp / 2) && !V().enemies[1].dead && !this.protector && act <= 30){ //If Bubblegum is below 50% HP
				V().target = V().enemies[1];
				V().action = new Action("Protector");
				V().action._actText = `Jake wraps himself around $target.name like a suit of armor.`;
			}
			else if (!V().enemies[1].dead && !V().enemies[2].dead && act <= 25){
				console.log("Martyr branch")
				V().action = new Action("Martyr");
				V().action._actText = `Jake stretches himself into a huge wall of flesh, covering the others from your attacks!`;
			}
			else if (act <= 40 && act > 30){
				console.log("Stun branch")
				if (!target().alert && !target().chi && !target().stasis){ //Unlike most enemies, Jake is a hardened criminal and smart enough not to try to stun an alert character.
					console.log("Target valid");
					V().action = new Action("Something in your eye");
					action()._targetMod = ["ignore downed"];
					action()._useText = null;
					action()._actText = `Jake stretches out towards $target.name and wraps around and around until they can't move!`;
				}
			}
			else if (this.CDcheck("Below the Belt") && act <= 60 && act > 40){
				console.log("Below the Belt branch")
				V().action = new Action("Below the Belt");
				action()._targetMod = ["debuff"];
				action()._actText = `Jake raises his fists as if to punch $target.name, but instead his legs snap out to hit them right in the knees.`;
				this.cd.set("Below the Belt",3);
			}
			else if (this.CDcheck("Dead Ringer") && act <= 80 && act > 60){
				console.log("Dead Ringer branch")
				V().action = new Action("Dead Ringer");
				action()._targetMod = ["debuff"];
				action()._actText = `Jake stretches around behind $target.name before they can react, and whacks them hard on the back of the head.`;
				this.cd.set("Dead Ringer",3);
			}
			else if (this.CDcheck("Trip") && act <= 90 && act > 80){
				console.log("Trip branch")
				V().action = new Action("Trip");
				V().action._useText = null;
				V().action._actText = `Jake stretches his arms into whips and trips everyone up!`;
				V().action._act = function () {return ``+
				`<<for _puppet range puppets()>>`+
					`<<addEffect _puppet "Off-Balance" 1>>`+
				`<</for>>`;}
				this.cd.set("Trip",3);
			}
			else {
				console.log("Default attack branch")
				V().action = new Action();
				V().action._weight = 1;
				V().action._useText = null;
				V().action._actText = `Jake attacks!`;
				V().action._act = justdmg("",{enemy:true});
			}

			if (V().action === null) {
				console.log("Action null, should reroll");
			} else {
				console.log("At loop end, action = "+V().action.name);
			}

			} //end loop
			return;
		}
	},

	"Princess Bubblegum": {
		"bestiaryNo": 0,
		"gender": 'F',
		"hp": 1000,
		"stats": {
			"Attack"	: 10,
			"Defense"	: 40,
			"Special"	: 40
		},
		"cooldown": {
			"mass buff": 0,
			"Chi Shield": 0
		},
		"actions": function () {
			while (V().action === null){
				var act = random(1,100);

//			Bubblegum delegates to her subordinates instead of doing stuff directly. She will always use a mass buff ability if she is able, but must wait for the buffs to expire before she can use one again, so she can't just stack buffs until the enemies are unstoppable. On her off-turns, she can freely use single-target buff drugs (weaker than the player's for balance purposes) and bestow Chi Shield (with a cooldown since it's so hard to remove). Rarely, she will attack by throwing bombs, but must spend a turn to make one first. (Bombs get second priority after mass buffs if she has one ready.)

//			50%: use drugs
//			25%: Chi Shield
//			25%: ready a bomb

			if (this.CDcheck("mass buff")) {
				act = random(1,3)
				switch (act) {
					case 1:
						V().action = new Action("Call to Arms");
						V().action.effweight = (1/3);
						break;
					case 2:
						V().action = new Action("Walled City");
						V().action.effweight = (1/3);
						break;
					case 3:
						V().action = new Action("Age of Enlightenment");
						V().action.effweight = (1/3);
						break;
				}
				this.cd.set("mass buff",3);
			}
			else if (this.ready) {
				act = random(1,2)
				if (act == 1) {
					V().action = new ItemAction("Grenade");
					V().action.weight = 1;
					V().action.useText = null;
					V().action.actText = `Princess Bubblegum throws what appears to be a giant peppermint, but as soon as it hits the ground it explodes with the force of a grenade, spreading hard candy shrapnel everywhere.`;
				}
				else if (act == 2) {
					V().action = new Action();
					V().action.effweight = 0.75;
					V().action.dur = 4;
					V().action.useText = null;
					V().action.actText = `Princess Bubblegum douses $target.name in a stinging, sticky syrup. They cough and stagger as their skin breaks out in welts.`;
					V().action._act = applyEffect("Poisoned");
				}
				this.ready = false;
			}
			else if (act <= 50) {
				var hitlist = [];
				if (!V().enemies[0].dead && !V().enemies[0].stasis){
					hitlist.push(V().enemies[0]);
				} else if (!V().enemies[2].dead && !V().enemies[2].stasis){
					hitlist.push(V().enemies[2]);
				}
				if (hitlist.length > 0) {
					var t = random(0,hitlist.length-1);
					V().target = hitlist[t];
					act = random(1,3)
					switch (act) {
						case 1:
							V().action = new ItemAction("Adrenaline");
							V().action._dur = 2;
							break;
						case 2:
							V().action = new ItemAction("Stoneskin");
							V().action._dur = 2;
							break;
						case 3:
							V().action = new ItemAction("Nootropic");
							V().action._dur = 2;
							break;
					}
				}
			}
			else if (this.CDcheck("Chi Shield") && act <= 75 && act > 50) {
				if (target() !== null){
					V().action = new Action("");
					V().action.dur = 2;
					V().action.useText = null;
					V().action.actText = function () {
						var str;
						if (V().target == subject()){
							str = "her becomes";
						} else {
							str = "$target.name is";
						}
						return `$subject.name presses a button, the air around ${str} surrounded by a force field.`
					}
					V().action._act = applyEffect("Chi Shield");
					this.cd.set("Chi Shield",2);
				}
			}
			else {
				V().action = new Action();
				V().action.useText = null;
				V().action.actText = `Princess Bubblegum pulls something out of her pack.`;
				V().action.act = `Something has changed...`;
				this.ready = true;
			}

			} //end loop
			return;
		}
	},

	"PB alone": {
		"noBestiary": true,
		"special": function (actor) {
			actor.cd.set("mass buff",0);
		},
		"actions": function () {
			while (V().action === null){
				var act = random(1,100);

//			PB switches to an offensive role when Jake and Finn are down. Her mass buff is changed to a Blessing, and she is now much more likely to make a bomb. She may also attack regularly, but this is more of a breather due to her low Attack.

//			25%: attack
//			75%: make bomb

			if (this.CDcheck("mass buff")) {
				V().action = new Action("Mandate of Heaven");
				V().action._effweight = 0.2;
				V().action._dur = 4;
				action()._actText = null;
				V().action._act = applyEffect("Blessing",{self:true});
				this.cd.set("mass buff",4);
			}
			else if (this.ready) {
				act = random(1,2)
				if (act == 1) {

					V().action = new ItemAction("Grenade");
					V().action._weight = 1;
					V().action._useText = null;
					V().action._actText = `Princess Bubblegum throws what appears to be a giant peppermint, but as soon as it hits the ground it explodes with the force of a grenade, spreading hard candy shrapnel everywhere.`;
				}
				else if (act == 2) {
					V().action = new Action();
					V().action._effweight = 0.75;
					V().action._dur = 4;
					V().action._useText = null;
					V().action._actText = `Princess Bubblegum douses $target.name in a stinging, sticky syrup. They cough and stagger as their skin breaks out in welts.`;
					V().action._act = applyEffect("Poisoned");
				}
				this.ready = false;
			}
			else if (act <= 25) {

				V().action = new Action();
				V().action._weight = 1;
				V().action._useText = null;
				V().action._actText = `Princess Bubblegum blasts $target.name with her ray gun.`;
				V().action._act = justdmg();
			}
			else {
				V().action = new Action();
				V().action._useText = null;
				V().action._actText = `Princess Bubblegum pulls something out of her pack.`;
				V().action._act = `Something has changed...`;
				this.ready = true;
			}

			} //end loop
		}
	},

	// GUMBALL 1

	"Gumball": {
		"bestiaryNo": 0,
		"gender": 'M',
		"hp": 666,
		"stats": {
			"Attack"	: 15,
			"Defense"	: 50,
			"Special"	: 25
		},
		"surrender": function () {
			V().action = {
				useText: null,
				actText: ``+
`Gumball laughs so hard he cries. "Wow! Wow, I really don't have to..." His expression snaps to suspicion with unsettling speed, and his head darts from side to side like a bird's. "This isn't a trick, is it? You're not gonna stab me in the back? I'm not gonna trip and break my neck? An anvil's not gonna fall from the sky?"

He cowers for several seconds, but nothing happens. After a few more moments, he gingerly cracks an eye open. A heartbeat later, he's suddenly jumping wildly up and down, cackling frenziedly. "Ahahaha! Yes! <i>Yes!</i>" He raises his fist in triumph. "Guess who didn't get beaten to a pulp today? That's right, ME! Suck on that, Universe! SUCK! ON! TH--"

Gumball slips on a stray pebble, falls back, hits his head, and is instantly knocked unconscious.`,
			act: null};
			V().enemies[0].dead = true;
			V().B.kills.push("Gumball");
			V().B.surrender = false;
		},
		"surrenderFail": function () {
			V().B.surrender = false;
			return `Gumball sighs. "Well, it was worth a shot." He raises his fists, but halfheartedly. "Hey, you never know. Maybe I'll get lucky for once. Stranger things have happened!"`;
		},
		"actions": function () {
			console.log("Gumball actions called");
			if (V().B.surrender){
				V().action = {useText: null, act: null, actText: `Gumball is watching you expectantly.`};
			}
			else {

			while (V().action === null){
				console.log("Action loop triggered");
				var act = random(1,100);

//			Gumball is intended to be a wild card. His behavior is highly random and his actions vary wildly in usefulness, from knocking himself down to an AoE nuke. Most of his attacks are rogueish, because he is a bratty troublemaker. However, unlike most enemies he does not use smart targeting for his debuffs, because he is also an idiot.

//			5%: self-inflict Knocked Down
//			5%: skip turn
//			10%: hide
//			10%: stun all except himself
//			10%: stun
//			10%: gimped Below the Belt
//			10%: damage + Winded
//			40%: use item
//			-5%: skip turn
//			-20%: attack
//			-20%: SPC Boost
//			-20%: DEF Boost
//			-15%: hit all, including allies
//			-5%: hit all, high damage

			if (act <= 5) {
				console.log("Action: do nothing");
				V().action = new Action();
				V().action._useText = null;
				V().action._actText = `Gumball doesn't feel like doing anything this turn.`;
				V().action._act = `$subject.name does nothing!`;
			}
			else if (act <= 10 && act > 5) {
				console.log("Action: trip");
				V().action = new Action();
				V().action._useText = null;
				V().action._actText = `Gumball trips over his own feet!`;
				action()._dur = -1;
				V().action._act = applyEffect("Knocked Down",{self:true});
			}
			else if (!V().enemies[1].dead && !V().enemies[2].dead && !this.untargetable && act <= 20 && act > 10) {
				console.log("Action: sneak");
				V().action = new Action("Sneak");
				V().action._useText = null;
				V().action._actText = `Gumball's eyes flick from side to side. When he thinks no one is watching him, he slinks away from the fight.`;
			}
			else if (act <= 30 && act > 20) {
				console.log("Action: screech");
				V().action = new Action("screech");
				V().action._useText = null;
				V().action._actText = `Gumball lets out an ear-splitting screech! Everyone has to stop what they're doing to clamp their hands over their ears.`;
				V().action._act = `<<for _t = 1; _t < $enemies.length; _t++>>`+
									`<<addEffect $enemies[_t] "Stunned" 1>>`+
								`<</for>>`+
								`<<for _puppet range puppets()>>`+
									`<<addEffect _puppet "Stunned" 1>>`+
								`<</for>>`;
			}
			else if (act <= 40 && act > 30) {
				console.log("Action: stun");
				V().action = new Action("Something in your eye");
				action()._targetMod = ["ignore downed"];
				V().action._useText = null;
				V().action._actText = `Gumball spits in $target.name's eyes!`;
			}
			else if (act <= 50 && act > 40) {

				V().action = new Action("Below the Belt");
				V().action._weight = 0.9;
				V().action._useText - null;
				V().action._actText = `Gumball kicks $target.name in the shins!`;
			}
			else if (act <= 60 && act > 50) {

				V().action = new Action();
				V().action._weight = 0.9;
				V().action._dur = 3;
				V().action._useText = null;
				V().action._actText = `Gumball rushes forward and punches $target.name hard in the gut, leaving them gasping.`;
				V().action._act = dmgandeffect('t',"Winded");
			}
			else {
				console.log("Action: item");
				V().action = new ItemAction("placeholder");
				V().action._useText = `Gumball rummages through his pockets...`;
				act = random(1,20); //rolling a d20, as is custom
				if (act == 1) {
					// critical fail: gumball
					V().action._actText = `...and only finds a gumball. He giggles to himself and sticks it to the arena wall with a mischevious grin. In the process, he seems to have forgotten about attacking you.`;
					V().action._act = null;
				}
				else if (act > 1 && act <= 6) {
					// 5 in 20: rubber band (effectively a weaker Throwing Knife)

					V().action._weight = 1;
					V().action._actText = `...and retrieves a thick rubber band. "Oh, cool!" He looks at you with a predatory glint in his eyes. "Hey," he says with a smirk, stretching the band between his fingers like a slingshot. "Wanna see a trick?"`;
					V().action._act = justdmg();
				}
				else if (act > 6 && act <= 11) {
					// 5 in 20: candy bar
					V().action._effweight = setup.STD_BUFF;
					V().action._dur = 3;
					V().action._actText = `...and retrieves a brightly-wrapped candy bar. "Oh, awesome! I forgot I had this!" He downs the whole thing in a few bites. You dread the sugar high he's going to get...`;
					V().action._act = applyEffect("SPC Boost",{self:true});
				}
				else if (act > 11 && act <= 16) {
					// 5 in 20: protein bar
					V().action._effweight = setup.STD_BUFF;
					V().action._dur = 3;
					V().action._actText = `...and pulls out a protein bar. He glares at it as if its existence offends him, then nonchalantly shrugs and takes a bite. "Food's food," he says.`;
					V().action._act = applyEffect("DEF Boost",{self:true});
				}
				else if (act > 16 && act <= 19) {
					// 3 in 20: angry cat
					V().action._weight = 0.8;
					V().action._actText = `...and pulls out a thin, mangy cat.

He screams and drops it, much to the cat's displeasure. "How did that even fit in there?! No -- wait -- good kitty -- AAAAHHHH!"`;
					V().action._act = `<<for _enemy range enemies()>>`+
										`<<set $target = _enemy>>`+
										`<<echoDamage>>`+
									`<</for>>`+
									`<<for _puppet range puppets()>>`+
										`<<set $target = _puppet>>`+
										`<<echoDamage>>`+
									`<</for>>`;
				}
				else if (act == 20) {
					// critical success: neutrino bomb
					V().action._weight = 1.5;
					V().action._actText = `...and pulls out a neutrino bomb?!

He yelps and throws the beeping thing up into the air, but catches it before it hits the ground. "Why do I even have this?!" he yells, then shakes his head. "Whatever, don't look a gift horse in the mouth! CATCH!"

<i>BOOM.</i>`
					V().action._act = `<<for _puppet range puppets()>>`+
										`<<set $target = _puppet>>`+
										`<<echoDamage>>`+
									`<</for>>`;
				}
			}

			} //end loop

			} //end surrender if
			return;
		}
	},

	"Anais": {
		"bestiaryNo": 0,
		"gender": 'F',
		"hp": 666,
		"stats": {
			"Attack"	: 25,
			"Defense"	: 5,
			"Special"	: 60
		},
		"cooldown": {
			"Flamethrower": 0,
			"Gas Bomb": 0,
			"Chaff": 0,
			"Calamity Bomb": 0
		},
		"specialInit": function(actor) {
			actor.ready = false;
		},
		"surrender": function () {
			V().action = {
				useText: null,
				actText: ``+
`You order $subject.name forward. They grasp Anais' hand, bending down to do so, and she shakes it firmly.

"That's it," Anais says. "I'm glad we could resolve this like civilized -- PSYCHE!!"

Before you can react, Anais pulls out a comically large syringe and stabs it into $subject.name, cackling maniacally. She leaps away as they stagger back.

"Did you REALLY think I'd just let you win after what you did to my brothers?!" she screams. "Wattersons never give up! And now, that poison will give you a heart attack in three... two... one!"

Without fanfare, $subject.name falls to the ground like a puppet with its stings cut. Which, you suppose, is pretty accurate.`,
				act: `<<set $subject.hp to 0>><<deathcheck $subject>><<set $anais_trap = true>>`
			}
			V().B.surrender = false;
		},
		"surrenderFail": function () {
			V().B.surrender = false;
			return `"Eh, it was worth a shot." Anais steps back. "Alrighty then. Let's finish this your way, you barbarian."`;
		},
		"actions": function () {
			if (V().B.surrender) {
				V().action = {useText: null, act: null, actText: `Anais is waiting for your decision.`};
			}
			else {

			while (V().action === null){
				var act = random(1,3);

//			Anais is the squishy wizard and the opposite of Gumball: her behavior is extremely predictable and consistent. She spends one turn making a bomb, then uses it the next turn. Rarely, she will use a regular attack instead; this is intended as a breather due to her low Attack.

//			1/3: attack
//			2/3: make bomb
//			-20%: grenade
//			-20%: flamethrower
//			-20%: gas bomb
//			-20%: calamity bomb
//			-20%: chaff grenade (Dizzy mass attack)

			if (this.ready) {
				act = random(1,5);

				if (act == 1){

					V().action = new ItemAction("Grenade");
					V().action._actText = `Anais lobs a grenade at you!`;
					V().action._act = splashDamage('enemies',2);
				}
				else if (this.CDcheck("Flamethrower") && act == 2){
					V().action = new ItemAction("Flamethrower");
					V().action._actText = `Anais pulls out a flamethrower! You barely have time to wonder how she got it before she starts shooting fire in all directions.`;
					this.cd.set("Flamethrower",4);
				}
				else if (this.CDcheck("Gas Bomb") && act == 3){
					V().action = new ItemAction("Gas Bomb");
					V().action._actText = `Anais pulls a gas mask over her face. You barely have time to wonder where she got it from before she throws something that bursts into a cloud of stinging green gas.`;
					this.cd.set("Gas Bomb",4);
				}
				else if (this.CDcheck("Calamity Bomb") && act == 4){
					V().action = new ItemAction("Calamity Bomb");
					action()._targetMod = ["debuff"];
					V().action._actText = `Anais pulls out a scroll that pulses with dark runes. She throws it at $target.name, where it explodes in a cloud of cursed magic.`;
					this.cd.set("Calamity Bomb",4);
				}
				else if (this.CDcheck("Chaff") && act == 5){
					V().action = new ItemAction("Chaff Grenade");
					V().action._weight = 1;
					V().action._dur = 3;
					V().action._actText = `Anais lobs a grenade at you -- but to your surprise, when it explodes it leaves a massive cloud of shiny metal flakes. It just looks like silly confetti to you, but your puppets stutter and freeze up trying to see through all the flashing lights!`;
					V().action._act = massAttack({content: applyEffect("Dizzy"), cut:true});
					this.cd.set("Chaff",4);
				}
				this.ready = false;
			}
			else if (act <= 2){
				V().action = new Action();
				V().action._useText = null;
				V().action._actText = `Anais turns around and builds something you can't see.`;
				V().action._act = `Something has changed...`;
				this.ready = true;
			}
			else {

				V().action = new Action();
				V().action._weight = 1;
				V().action._useText = null;
				V().action._actText = `Anais slaps $target.name.`;
				V().action._act = justdmg();
			}

			} //end loop

			} //end surrender if
			return;
		}
	},

	"Darwin": {
		"bestiaryNo": 0,
		"gender": 'M',
		"hp": 666,
		"stats": {
			"Attack"	: 30,
			"Defense"	: 30,
			"Special"	: 30
		},
		"cooldown": {
			"Dance": 0,
			"Dizzy": 0,
			"Moralize": 0
		},
		"actions": function () {
			while (V().action === null){
				var act = random(1,100);

//			Darwin is a dual-class Rogue/Fighter, with more emphasis on Rogue. He uses a regular attack most of the time, but has access to several debuffs Gumball lacks.

//			30%: regular attack
//			30%: Protector
//			10%: Off Your High Horse
//			10%: piercing attack
//			10%: Dizzy attack
//			10%: mass Injury

			if (act <= 30){

				V().action = new Action();
				V().action._weight = 1;
				V().action._useText = null;
				V().action._actText = `Darwin punches $target.name!`; //This is a purposeful contrast with Gumball's low kick
				V().action._act = justdmg();
			}
			else if (!this.protector && !(V().enemies[0].dead && V().enemies[1].dead) && act <= 60 && act > 30){ //disqualified if Darwin is only one left
				var t = null;
				while (t === null){
					t = random(0,1);
					if (V().enemies[t].dead) {
						t = null;
					}
				}
				V().target = V().enemies[t];
				V().action = new Action("Protector");
				V().action._actText = `Darwin heroically leaps in front of $target.name, protecting $target.them from attacks.`;
			}
			else if (act <= 70 && act > 60){
				$.wiki('<<dispelTarget 1>>');
				if (State.temporary.go){
					V().action = new Action("Off Your High Horse");
					V().action._actText = `Darwin leaps and attacks with a roundhouse kick that knocks off $target.name's magic!`;
				}
			}
			else if (this.CDcheck("Dance") && act <= 80 && act > 70){

				V().action = new Action("Dance Attack");
				V().action._weight = setup.pierce_weight;
				V().action._pierce = true;
				V().action._useText = null;
				V().action._actText = `Darwin leaps and twirls in a spectacular dance, the sun shining dazzlingly off his golden scales. It's so captivating, you don't even think to tell your puppet to defend until he's already kicked them in the face.`;
				V().action._act = justdmg();
				this.cd.set("Dance",2);
			}
			else if (this.CDcheck("Dizzy") && act <= 90 && act > 80){

				V().action = new Action("Dancing Strikes");
				V().action._weight = setup.knife_weight;
				V().action._dur = 3;
				V().action._actText = `Darwin leaps into the fray with graceful, dancing blows, striking, retreating, and leaping over your puppet to strike again. Not every attack connects, but by the end $target.name has had to spin around so much they can't tell which way is up.`;
				V().action._act = `<<multihit 2>><<addEffect $target "Dizzy" $action.dur>>`;
				this.cd.set("Dizzy",2);
			}
			else if (this.CDcheck("Moralize") && act > 90){
				V().action = new Action("Moralize");
				V().action._effweight = 0.4;
				V().action._dur = 3;
				V().action._actText = `Darwin puts on irresistible puppy eyes and makes a seemingly-heartfelt speech about how mean you are for beating him up. You feel uncomfortable, and your puppets hesitate before attacking again.`;
				V().action._act = massAttack({target: "enemies", content: applyEffect("Injury")}),
				this.cd.set("Moralize",3);
			}

			} //end loop
			return;
		}
	},

	// STEVEN UNIVERSE 1

	"Pearl": {
		"bestiaryNo": 0,
		"gender": 'F',
		"hp": 700,
		"stats": {
			"Attack"	: 10,
			"Defense"	: 30,
			"Special"	: 50
		},
		"cooldown": {
			"Fireball": 0,
			"pierce": 0
		},
		"specialInit": function (actor) {
			actor._deathMessage = `${actor.name} poofs!`;
		},
		"actions": function () {
			while (V().action === null){
				var act = random(1,100);

//			Pearl uses her abilities from Attack the Light: normal damage, stun, DoT, and bit hit. Since the engine is not as well-suited to multi-hit abilities as Attack the Light, these are adjusted: Holo-Pearl is only a 1-turn stun but also inflicts Off-Balance; her spear throw is changed to a piercing attack; and her regular attack is split into a single hit and double hit skill.

//			10%: attack
//			20%: Holo-Pearl
//			25%: Fireball (CD 1)
//			25%: pierce (CD 1)
//			20%: 2 hits spread

			if (act <= 10) {

				V().action = new Action("Sword");
				V().action._actText = `Pearl advances with graceful steps, and thrusts her spear with perfect precision.`;
			}
			else if (act <= 30 && act > 10) {
				if (!target().alert && !target().chi && !target().stasis){
					V().action = new Action("Holo-Pearl");
					action()._targetMod = ["ignore downed"];
					action()._dur = 1;
					V().action._actText = `Pearl twirls and dips, projecting a holographic copy of herself from the gem on her forehead. It rushes at $target.name, pushing them away from the battle and locking them in combat.`;
					V().action._act = applyEffect(["Stunned","Off-Balance"]);
				}
			}
			else if (this.CDcheck("Fireball") && act <= 55 && act > 30) {

				V().action = new Action("Fireball");
				V().action._weight = 0.8;
				V().action._effweight = 0.7;
				V().action._dur = 3;
				V().action._actText = `Pearl levels her spear like a rifle as white energy swirls around the blade. Pearl fires, and the projectile bursts into searing white flames!`;
				this.cd.set("Fireball",2);
			}
			else if (this.CDcheck("pierce") && act <= 80 && act > 55) {

				V().action = new Action("Comet Strike"); //Last Scenario reference!
				V().action._weight = setup.pierce_weight;
				V().action._pierce = true;
				V().action._actText = `Pearl stands as still as a statue, staring at $target.name with robotic intensity. Then, in the span of an eyeblink, she hurls her spear with so much force the air ignites. It sails through the air with perfect accuracy, and hits $target.name right through a chink in their armor.`;
				V().action._act = justdmg();
				this.cd.set("pierce",2);
			}
			else if (act > 80) {

				V().action = new Action("Shooting Stars");
				V().action._weight = setup.knife_weight;
				V().action._actText = `Pearl summons a second, identical spear from her forehead, then, with the grace of a dancer, leaps high into the air. She spins, and rains down her spears like thunderbolts from Heaven.`;
				V().action._act = `<<multihit 2 "spread">>`;
			}

			} //end loop
			return;
		}
	},

	"Garnet": {
		"bestiaryNo": 0,
		"gender": 'F',
		"hp": 700,
		"stats": {
			"Attack"	: 40,
			"Defense"	: 40,
			"Special"	: 10
		},
		"tolerances": {
			"Stunned"	: 1
		},
		"cooldown": {
			"grenade": 0,
			"combo": 0
		},
		"specialInit": function (actor) {
			actor._deathMessage = `${actor.name} poofs!`;
		},
		"actions": function () {
			while (V().action === null){
				var act = random(1,100);

//			Garnet has all of her abilities from Attack the Light, with the 6-hit-combo obviously downgraded.

//			30%: attack
//			20%: attack + Pain (high damage, low effect)
//			25%: grenade (CD 1)
//			25%: 2 hit, higher weight than normal (CD 1)

			if (act <= 30){

				V().action = new Action("Sword");
				V().action._actText = `Garnet rushes forward and slams her gauntlet into $target.name!`;
			}
			else if (act <= 50 && act > 30){
				V().action = new Action("Below the Belt");
				action()._targetMod = ["debuff"];
				V().action._weight = 0.9;
				V().action._dur = 3;
				V().action._useText = null;
				V().action._actText = `Garnet raises her fists above her head, and her gauntlets grow to twice their size. Without missing a beat, she swings forward and crushes $target.name under their weight.`;
			}
			else if (this.CDcheck("grenade") && act <= 75 && act > 50){

				V().action = new Action("Explosive Bolt");
				V().action._weight = 1;
				V().action._useText = null;
				V().action._actText = `Garnet sticks her arm straight out, and her gauntlet detaches from her arm, rocketing towards you like a missile! It slams into $target.name before exploding in a wide burst.`;
				this.cd.set("grenade",3);
			}
			else if (this.CDcheck("combo") && act > 75){

				V().action = new Action("Two-hit Combo");
				V().action._weight = 0.75;
				V().action._useText = null;
				V().action._actText = `Garnet rushes $target.name with a two-hit combo!`;
				V().action._act = `<<multihit 2>>`;
				this.cd.set("combo",2);
			}

			} //end loop
			return;
		}
	},

	"Amethyst": {
		"bestiaryNo": 0,
		"gender": 'F',
		"hp": 700,
		"stats": {
			"Attack"	: 50,
			"Defense"	: 20,
			"Special"	: 20
		},
		"cooldown": {
			"debuff": 0,
			"spin": 0
		},
		"specialInit": function (actor) {
			actor._deathMessage = `${actor.name} poofs!`;
		},
		"actions": function () {
			while (V().action === null){
				var act = random(1,100);

//			Amethyst is tricky to adapt, because her "lots of tiny hits" skill can't feasibly be adapted at all. I've replaced it with a poisoning attack. Her other abilities work fine, however.

//			25%: hit all (weak)
//			25%: damage + Injury, on par with Rogue's (CD 1)
//			25%: damage + Poisoned (more direct dmg than Pearl's Fireball but weaker DoT)
//			25%: high damage + Knocked Down (CD 3)

			if (act <= 25){
				V().action = new Action("whip");
				V().action._weight = 0.6;
				V().action._useText = null;
				V().action._actText = `Amethyst lashes her whip in a wide arc, striking all your puppets!`;
				V().action._act = `<<for _puppet range puppets()>><<set $target = _puppet>><<echoDamage>><</for>>`;
			}
			else if (this.CDcheck("debuff") && act <= 50 && act > 25){
				V().action = new Action("A Farewell to Arms");
				action()._targetMod = ["debuff"];
				action()._useText = null;
				action()._actText = `Amethyst shapeshifts into a huge, muscled wrestler. She roars and beats her chest, then slams violently into $target.name!`;
				this.cd.set("debuff",2);
			}
			else if (act <= 75 && act > 50){

				V().action = new Action();
				V().action._weight = 0.9;
				V().action._effweight = 0.6;
				V().action._dur = 3;
				action()._useText = null;
				action()._actText = `Amethyst's gem flashes, and her whip suddenly gains a strange, oily sheen. She spins it around and around and then, with a smirk, snaps it out at $target.name like a hornet's sting.`;
				V().action._act = dmgandeffect('t',"Poisoned");
			}
			else if (this.CDcheck("spin") && act > 75){
				V().action = new Action("spin ball");
				action()._targetMod = ["ignore downed"];
				action()._weight = 1.2;
				action()._useText = null;
				action()._actText = `Amethyst curls up against the ground, and spins her whole body like a wheel. Sparks fly as she builds up speed, then without warning, she rockets straight into $target.name, sending them flying!`;
				V().action._act = dmgandeffect('t',"Knocked Down");
				this.cd.set("spin",4);
			}

			} //end loop
			return;
		}
	},

	"Steven": {
		"bestiaryNo": 0,
		"gender": 'M',
		"hp": 300,
		"stats": {
			"Attack"	: 0,
			"Defense"	: 10,
			"Special"	: 0
		},
		"specialInit": function (actor) {
			actor.addEffect("Guarded",{time: -1, noPopup: true, bypass: true});
			actor._deathMessage = `${actor.name} is knocked unconscious!`;
		},
		"surrender": function () {
			V().action = {
				useText: null,
				act: null,
				actText: `You let Steven scuttle away with the gems in tow.`
			}
			V().B.surrender = false;
			V().enemies[3].dead = true;
		},
		"surrenderFail": function () {
			if (target() !== undefined && target() !== null && target().name == "Steven" && !target().dead){
				var m = random(1,4);
				switch (m){
					case 1:
						return `"Owwww! That hurts!"`;
					case 2:
						return `"Please stop! I don't want to fight!"`;
					case 3:
						return `"Wh-why are you doing this?"`;
					case 4:
						return `Steven starts crying harder.`;
				}
				return;
			}
		},
		"actions": function () {
			var act;
			if (V().B.surrender){
				act = random(1,3)

			if (act == 1) {
				V().action = new Action("Bubble");
				V().action._dur = 3;
				V().action._useText = null;
				V().action._actText = `Steven wails, and his gem flashes a bright pink.`;
				V().action._act = applyEffect("Bubble",{self:true});
			}
			else {
				V().action = {useText: null, act: null, actText: `Steven clutches the gems to his chest and blubbers.`};
			}

			} else {

			while (V().action === null){
				act = random(1,3);

			//Steven is pure support. He provides weak buffs and occasionally bubble shields.

			if (act <= 2) {
				console.log("Encouragement selected");
				V().action = new Action("Encouragement");
				V().action._effweight = (1/3);
				V().action._dur = 3;
				$.wiki('<<allytarget "noself">>');
				switch (target().name){
					case "Pearl":
						V().action._actText = `"Pearl, you got this!" cries Steven. Pearl stands up straighter, and clutches her spear with newfound resolve.`;
						V().action._act = applyEffect("ATK Boost");
						break;
					case "Garnet":
						V().action._actText = `"Garnet, you're amazing!" cries Steven. Garnet's mask of stoicism cracks just long enough for her to curl a smile.`;
						V().action._act = applyEffect("SPC Boost");
						break;
					case "Amethyst":
						V().action._actText = `"Amethyst, keep it up!" cries Steven. Amethyst whoops and flexes her muscles.`;
						V().action._act = applyEffect("DEF Boost");
						break;
					default:
						console.log("No target found");
						V().action = null;
				}
			}
			else if (act == 3) {
				console.log("Bubble selected");
				var hitlist = [];
				enemies().forEach(function(enemy,i){
					console.log(i);
					if (!enemy.dead && enemy.name != "Steven") {
						hitlist.push(enemy);
						console.log(enemy.name+" added to hitlist");
					}
				});
				hitlist.forEach(function(enemy,i){
					console.log(enemy.name);
					if (i == 0){
						V().target = enemy;
						console.log(V().target.name);
					} else if (enemy.name == "Steven") {
						//do nothing
					} else {
						console.log("Current subject HP: "+enemy.hp);
						console.log("Previous subject HP: "+hitlist[i-1].hp);
						if (enemy.hp < hitlist[i-1].hp) { //target gem with lowest health
							V().target = enemy;
							console.log(V().target.name);
						}
					}
				});
				V().action = new Action("Bubble");
				V().action._dur = 3;
				V().action._useText = null;
				V().action._actText = `"A bubble for your trouble?" Steven lifts his shirt, and you see his gem flash with a pink light.`;
				V().action._act = applyEffect("Bubble");
			}

			} //end loop

			} //end surrender if
			return;
		}
	},

	// GUMBALL 2

	"Nicole": {
		"fullname": "Nicole Watterson",
		"bestiaryNo": 0,
		"gender": 'F',
		"hp": 3000,
		"stats": {
			"Attack"	: 100,
			"Defense"	: 30,
			"Special"	: 20
		},
		"tolerances": {
			"Injury": 1,
			"Off-Balance": 1
		},
		"mercy": 4,
		"specialInit": function(actor) {
			actor.boss = true;
			actor.specialdeath = "Nicole Defeat";
		},
		"cooldown": {
			"Meditate": 0,
			"stun": 0,
			"pierce": 0,
			"multihit": 2
		},
		"actions": function () {
			while (V().action === null){
				var act = random(1,100);
				var count = 0;

//			Nicole is a "rush boss" -- she can dish it out but she can't take it, so one way or another the battle will be over fast. All of her actions revolve around dealing damage: she has a regular attack, a multi-hit attack, a piercing attack, and a damage + winded + prone attack that will make characters more vulnerable. As a monk type, she also has Fighter's Meditate skill to prevent you from exploiting her low Special *too* much.

//			She uses a separate check for using Meditate. The longer she has to wait for her current effects to expire, the more likely she'll use it. If there are a total of 5 rounds of duration, she will always use it; at 4 rounds, she has an 80% chance of using it; and so on until 20% at 1 round. If Meditate is chosen, the return statement in the if closes the actions function immediately and Meditate is selected as the action. If not, we reroll the act variable to determine her attack.

//			25%: winded + prone + damage at 1 (CD 1)
//			45%: 3 hits at 0.7 (CD 4 because multihit is RIDICULOUSLY powerful with her Attack)
//			15%: pierce at 0.9
//			15%: regular attack

			count = meditateLogic();

			if (this.CDcheck("Meditate") && ((count >= 10) || (act <= (count*10)))) {
				V().action = new Action("Meditate");
				V().action._actText = `This whole time, Nicole has been quivering with intensity, but now she goes as still as a stone. She places her hand in front of her like a prayer, and closes her eyes.

				Her aura flares so brightly you have to shield your eyes. When you look at her again she is staring straight at you, literally glowing with health.`;
				this.cd.set("Meditate",5);
				return;
			}

				act = random(1,100);

			if (this.CDcheck("stun") && act <= 25) {
				V().action = new Action("Sweep the Leg");
				action()._targetMod = ["ignore downed"];
				V().action._weight = 1;
				V().action._actText = `Nicole leaps with a flying kick, slamming her heel into $target.name's knee with crushing force. It strikes the perfect point to twist the joint with a sickening <i>snap</i>, sweeping their legs clean out and throwing them flat on their back with such force it knocks the breath out of them.`;
				V().action._act = function () {
					return `<<echoDamage>>\
						<<print target().addEffect("Knocked Down",{dur: -1})>>\
						<<print target().addEffect("Winded",{dur: 3})>>`
				};
				this.cd.set("stun",2);
			}
			else if (this.CDcheck("multihit") && act <= 70 && act > 25) {
				V().action = new Action("Camilla Petals Dancing");
				action()._targetMod = ["smart"];
				V().action._weight = 0.7;
				V().action._actText = `Nicole leans back slightly, and eyes $target.name with a predatory intensity. In the next instant she springs forward like lighting, descending on them with a graceful yet unstoppable flurry of fists.`;
				V().action._act = `<<multihit 3>>`;
				this.cd.set("multihit",4);
			}
			else if (this.CDcheck("pierce") && act <= 85 && act > 70) {
				V().action = new Action("Steel Dragon Breaker");
				action()._targetMod = ["pierce", "ignore downed"];
				V().action._weight = 0.95;
				V().action._pierce = true;
				V().action._actText = `Nicole bends her knees slightly, and eyes $target.name with a predatory intensity. In the next instant she leaps high into the air, and as she gathers speed you think you see her catch fire like a meteorite. She slams her entire arm down on $target.name with a force to shatter steel.`;
				V().action._act = justdmg();
				// this.cd.set("pierce",1);
			}
			else {

				V().action = new Action("Lotus Strike");
				V().action._weight = 1.15;
				V().action._actText = `Nicole's palm snaps out like a spring.`;
				V().action._act = justdmg();
			}

			} //end loop
			return;
		}
	},

	// STEVEN UNIVERSE 2

	"Rose": {
		"fullname": "Rose Quartz",
		"bestiaryNo": 0,
		"bestiaryName": "Stage 1",
		"alts": ["Rose 2","Rose 3"],
		"gender": 'F',
		"hp": 1000,
		"stats": {
			"Attack"	: 65,
			"Defense"	: 45,
			"Special"	: 40
		},
		"tolerances": {
			"Pain": 1,
			"Curse": 1,
			"Poisoned": 1,
			"Burning": 1,
			"Off-Balance": 1
		},
		"mercy": 4,
		"specialInit": function(actor) {
			actor.boss = true;
			actor.specialdeath = "Rose stage 2";
		},
		"cooldown": {
			"Starlight Flurry": 2,
			"Supernova": 3
		},
		"actions": function () {
			while (V().action === null){
				var act = random(1,100);

//			Rose is a multistage boss. This is her first form, offense. Based on Flynn 1 (Last Scenario): has a strong one-hit, a slightly weaker 2-hit spread, and a 4-hit supermove. She additionally has a hit-all that she will always use every 3 turns. Otherwise her behavior is:

//			50%: 2 hit spread, x0.8
//			30%: 4 hit spread, x0.7
//			20% [50% when SF on cooldown]: hit one x1.15

			if (this.CDcheck("Supernova")) {
				V().action = new Action("Supernova");
				V().action._weight = 1;
				V().action._actText = `Rose grasps her sword firmly in both hands. Her gem glows with a soft pink light that suddenly flashes with blinding intensity as she sweeps her sword out in a wide cleave. The arc extends to an impossible length, whipping out a blast of destructive energy that makes the arena shake.`;
				V().action._act = `<<for _puppet range puppets()>><<echoDamage _puppet>><</for>>`;
				this.cd.set("Supernova",4);
				return;
			}

			if (act <= 50) {

				V().action = new Action("Shooting Stars");
				V().action._weight = 0.8;
				V().action._actText = `Rose jumps high into the air, seemingly weightless. She shoots down like a lightning bolt, sword extended, then uses her momentum to sweep around for another strike. She lands perfectly in her original position, as if she hadn't ever moved.`;
				V().action._act = `<<multihit 2 "spread">>`;
			}
			else if (this.CDcheck("Starlight Flurry") && (act <= 80 && act > 50)) {

				V().action = new Action("Starlight Flurry"); //Last Scenario reference!
				V().action._weight = 0.65;
				V().action._actText = `Rose grasps her sword with both hands, and leans forward slightly. With shocking speed for her size she charges forward, striking before gracefully spinning around to another puppet like a dancer. She brings the sword down again and again in a dazzling flurry of slashes, never allowing your puppets a single opening.`;
				V().action._act = `<<multihit 4 "spread">>`;
				this.cd.set("Starlight Flurry",3);
			}
			else {

				V().action = new Action("Meteor Strike");
				action()._weight = 1.1;
				action()._actText = `Rose holds her sword like a lance and charges forward with lightning speed, skewering her target.`;
				action()._act = justdmg();
			}

			} //end loop
			return;
		}
	},

	"Rose 2": {
		"noBestiary": true,
		"bestiaryName": "Stage 2",
		"hp": 2000,
		"stats": {
			"Attack"	: 30,
			"Defense"	: 80
		},
		"special": function (actor) {
			actor._deathMessage = "Rose stage 3";
			actor.cd = new Map([
				["Meditate",0],
				["Revolution",0],
				["injury",0],
				["Downfall",0],
				["knockdown",2],
				["winded",0]
			]);
		},
		"actions": function () {
			while (V().action === null){
				var act = random(1,100);
				var count = 0;

//			Rose's main form: endurance match. Loses her strong multi-hit attacks but gains utility and disabling moves.

//			Meditate
//			Thorns
//			-spontaneously: 5% (with other moves)
//			-if Attack or Defense lowered: 30%
//			-if Attack AND Defense lowered: 50%
//			-if Marked: 90%
//			25%: dispel
//			-50%: Revolution
//			-50%: Downfall
//			20%: poison all (but no damage)
//			10%: Shield Bash: hit one x? + Knocked Down
//			10%: Guerilla Warfare: Winded all
//			10%: A Farewell to Arms: hit all x? + Injury
//			20%: attack + ATK Boost

			count = meditateLogic();

			if (this.CDcheck("Meditate") && ((count >= 10) || (act <= (count*10)))) {
				V().action = new Action("Meditate");
				V().action._actText = `Rose closes her eyes and takes a moment to catch her breath. You think you see her glowing slightly.`;
				this.cd.set("Meditate",5);
				return;
			}

				act = random(1,100);

			if ( !this.thorns && ( ( ((this.get(V().DefenseStat) < this.getBase(V().DefenseStat)) || (this.get(V().AttackStat) < this.getBase(V().AttackStat))) && act <= 30) || ((this.get(V().DefenseStat) < this.getBase(V().DefenseStat)) && (this.get(V().AttackStat) < this.getBase(V().AttackStat)) && act <= 50) || (this.marked && act <= 90) ) ) {
				V().action = new Action("Thorns");
				action()._useText = null;
				action()._actText = `Rose grins from ear to ear as her gem flashes a bright pink.`;
				action()._act = applyEffect("Thorns",{self:true});
				return;
			}

				act = random(1,100);

			if (act <= 5 && !this.thorns) {
				V().action = new Action("Thorns");
				action()._useText = null;
				action()._actText = `Rose grins from ear to ear as her gem flashes a bright pink.`;
				action()._act = applyEffect("Thorns",{self:true});
			}
			else if (act <= 30 && act > 5) {
				act = random(1,100);
				if (this.CDcheck("Revolution") && act <= 50) {
					$.wiki('<<dispelTarget 3 "mass">>');
					if (State.temporary.go){
						V().action = new Action("Revolution");
						V().action._weight = 1;
						V().action._actText = `Rose grasps her sword firmly and crouches down, she and the sword glowing pink. Suddenly she rushes forward in a dazzling twirl, sweeping the blade across all your puppets in a wide cleave.`;
						V().action._act = `<<for _puppet range puppets()>><<echoDamage _puppet>>`+
						`<<if !_puppet.dead && !_puppet.stasis>>`+
							`<<for _i = _puppet.effects.length-1; _i >= 0; _i-->>`+
								`<<set _effect = _puppet.effects[_i]>>`+
								`<<if _effect.buff && !_effect.sticky>>`+
									`<<print _puppet.removeEffect(_effect)+"\n">>`+
									`<<break>>`+
								`<</if>>`+
							`<</for>>`+
						`<</if>>`+
						`<</for>>`;
						this.cd.set("Revolution",3);
					}
				}
				else if (this.CDcheck("Downfall")) {
					$.wiki('<<dispelTarget 1>>');
					if (State.temporary.go) {
						V().action = new Action("Downfall");
						action()._weight = 1;
						action()._actText = `Rose gets a glint in her eye, then starts whirling her sword around like a pinwheel. She charges forward, then chains her final spin into a massive overhead cleave, bringing it crashing down on $target.name.`;
						this.cd.set("Downfall",2);
					}
				}
			}
			else if (act <= 40 && act > 30) {
				if (!target().chi) {
					V().action = new Action("Shield Bash");
					action()._targetMod = ["ignore downed"];
					V().action._weight = 1.15;
					V().action._actText = `Rose rushes forward, but instead of striking with her sword, she slams her shield into $target.name like a battering ram.`;
					V().action._act = dmgandeffect('t',"Knocked Down",-1);
					this.cd.set("knockdown",2);
				}
			}
			else if (act <= 50 && act > 40) {
				effectCheck();
				if (count < 3) {
					V().action = new Action("Guerilla Warfare");
					V().action._weight = 0.9;
					V().action._dur = 3;
					V().action._actText = `Rose leads your puppets along an infuriating series of feints, dodges, and near-misses. Only the lightest of her attacks actually land -- you swear she's toying with you -- but by the end your puppets have been run ragged. She just grins at you, as hale and hearty as ever.`;
					V().action._act = `<<for _a range puppets()>>`+
					`<<set $target = _a>>`+
					`<<echoDamage>>`+
					`<<addEffect _a "Winded" $action.dur $subject>>`+
					`<</for>>`;
				}
			}
			else if (this.CDcheck("injury") && act <= 60 && act > 50) {
				effectCheck();
				if (count < 3) {
					V().action = new Action("A Farewell to Arms");
					V().action._weight = 1;
					V().action._actText = `Rose hurls her shield like a discus. It flies unerringly to hit every one of your puppets in just the right spot to make them drop their weapons, bouncing off them like they're targets in a pinball machine. When it returns to her, she catches it perfectly.`;
					V().action._act = `<<for _a range puppets()>>`+
					`<<set $target = _a>>`+
					`<<echoDamage>>`+
					`<<addEffect _a "Injury" $action.dur $subject>>`+
					`<</for>>`
					this.cd.set("injury",2);
				}
			}
			else if (act <= 80 && act > 60) {
				effectCheck();
				if (count < 2) {
					V().action = new Action("Poison Powder");
					V().action._effweight = 0.6;
					V().action._dur = 4;
					V().action._actText = `Rose strikes her sword along the ground, exposing a single crack. Rose closes her eyes, focusing, and a dark green vine suddenly sprouts from the earth. It grows towards your puppets like it has a will of its own, and instantly blooms into dark indigo blossoms just beneath each of your puppets' faces. With a light <i>puff</i>, they let out a strange purple powder that your puppets don't seem to like at all.`;
					V().action._act = massAttack({target: "enemies", content: applyEffect("Poisoned")});
				}
			}
			else if (act > 80) {

				V().action = new Action("Crescendo");
				action()._weight = 1.25;
				action()._effweight = (20/50);
				action()._dur = 3;
				action()._actText = `Rose brings her sword down in an overhead strike, but at the last second, swings it around to strike against the ground instead, hitting $target.name on the upswing. The blade vibrates with a strange, alien song, and gleams with sharpness.`;
				action()._act = dmgandeffect('s',"ATK Boost");
			}

			} //end loop
		}
	},

	"Rose 3": {
		"noBestiary": true,
		"bestiaryName": "Stage 3",
		"hp": 300,
		"stats": {
			"Defense"	: 70,
			"Special"	: 50
		},
		"special": function (actor) {
			actor._deathMessage = "Rose poofs!";
			actor.showMaxHP = true;
			actor.specialdeath = false;
		},
		"actions": function () {

//	Final form. After defeat of second form she will stick the party with incurable DoT, giving you a time limit to finish her off in this form. Has a permanent shield that reduces all damage by 60%, and all she does is heal herself very slightly.

			V().action = new Action("Defiance");
			V().action._special = 10;
			V().action._actText = `Rose pants heavily, visibly sweating. She doesn't take her eyes off you.`;
			V().action._act = function () {
				subject().hp += action()._special;
				return `Rose regains $action.special HP.`;
			}
		}
	},

	// GRAVITY FALLS 2

	"Bill": {
		"fullname": "Bill Cipher",
		"bestiaryNo": 0,
		"gender": 'M',
		"hp": 3000,
		"stats": {
			"Attack"	: 40,
			"Defense"	: 40,
			"Special"	: 70
		},
		"tolerances": {
			"Headache": 1,
			"Curse": 1,
			"Off-Balance": -1
		},
		"mercy": 0,
		"specialInit": function(actor) {
			actor.boss = true;
		},
		"cooldown": {
			"Wild Magic": 0,
			"Rain of Fire": 0,
			"Stone Gaze": 0
		},
		"actions": function () {
			while (V().action === null){
				console.log("Bill actions");
				var act = random(1,100);
				var count = 0;

//			Bill is a bad day. He slowly grinds you down with damage-over-time and hold effects.

//			Bill's AI is heavy on special clauses.

//			1) If an item was used on him in the previous turn, lock items for 4 rounds.

//			2) Count the total number of effects on the puppets. If >= 2, (20 + (effects-2)*20)% chance of using Wild Magic, which damages everyone once for every effect on them. CD 2 because this could get nasty if he does it continuously.
//			-100% at 6 effects, is that too few?

//			3) Check if anyone has protection effects. If yes, Shatter (damage + protection strip on everyone who has it). This is second priority after Wild Magic, so he will ALWAYS do this if you have such an effect active. No cooldown, effectively preventing you from using these effects at all. Should be impossible to trick him into doing this constantly because Chi Shield and Stasis have such high EN costs that you cannot make him do this every turn.

//			4) Check how many puppets are asleep. (30 * sleepers)% chance of using Nightmare, 1.25 damage on all sleepers. 100% chance if everyone is asleep.

//			Only then does he enter normal behavior:

//			40%: hit all (0.6) + Burning (0.4) (CD 3)
//			30%: single target stun
//			-80%: petrify (can only be active on one person at a time for balance purposes)
//			-sleep + poison
//			-sleep + winded
//			-sleep + curse
//			-sleep two
//			10%: stun all
//			15%: doom (0.5 = 75 dmg/round)
//			5%: regular attack (0.9 + reduce buff durations by 1)

			if (V().B.item_used) {
				console.log("Item lock selected");
				V().action = new Action("Embargo");
				action()._dur = 5;
				V().action._useText = null;
				V().action._actText = `Bill stares lazily at something to your side. You trace his gaze just in time to see your pack grow wings and fly away!`;
				V().action._act = `<<set $B.embargo = $action.dur>>Can't use items for $action.dur turns!`;
				return;
			}

			puppets().forEach(function(puppet){
				count += puppet.effects.length;
			});

				var t = 20 + (count-2)*20;

			if (this.CDcheck("Wild Magic") && count >= 2 && act <= t){
				console.log("Wild Magic selected");
				V().action = new Action("Wild Magic");
				V().action._weight = 0.65;
				V().action._actText = `Bill cackles maniacally as your magic goes haywire! Every effect on your puppets bursts with unstable energy.`;
				V().action._act = `<<for _puppet range puppets()>><<set $target = _puppet>><<for _effect range _puppet.effects>><<echoDamage>><</for>><</for>>`;
				this.cd.set("Wild Magic",2);
				return;
			}

				count = 0;
				act = random(1,100);

				var shatter = false;
				State.temporary.hitlist = [];

			puppets().forEach(function(puppet){
				puppet.effects.forEach(function(effect){
					if (effect.name == "Chi Shield" || effect.name == "Stasis"){
						shatter = true;
						State.temporary.hitlist.push(puppet);
					}
				});
			});

			if (shatter){
				console.log("Shatter selected");
				V().action = new Action("Shatter");
				V().action._weight = 0.65;
				V().action._actText = `Bill raises a gloved hand, and snaps his fingers. The noise splits through your skull like a gunshot, forcing you to clamp your hands over your ears as the air itself seems to shatter like glass. When you look up, your puppets' protections are gone.`;
				V().action._act = `<<for _puppet range _hitlist>>`+
				`<<set $target = _puppet>><<echoDamage>>`+
				`<<for _k, _effect range _puppet.effects>>`+
				`<<if _effect.name == "Chi Shield" || _effect.name == "Stasis">>`+
				`<<print _puppet.removeEffect(_effect,{pierce: true})>>`+
				`<</if>><</for>><</for>>`;
				return;
			}

			puppets().forEach(function(puppet){
				if (puppet.asleep){
					count++;
				}
			});

			if ((count == 3) || (count == 2 && act <= 60) || (count == 1 && act <= 30)){
				console.log("Nightmare selected");
				V().action = new Action("Nightmare");
				V().action._weight = 1.3;
				V().action._actText = `Bill closes his eye and raises his hands to... where his temples would be, you think. He glows with a dark, menacing aura, and all your sleeping puppets start writhing in pain, savaged by psychic phantoms.`;
				V().action._act = `<<for _puppet range puppets()>>`+
				`<<if _puppet.asleep>><<echoDamage _puppet>><</if>>`+
				`<</for>>`;
				return;
			}

			count = 0;
			puppets().forEach(function(puppet){
				if (puppet.asleep || puppet.petrified){
					count++;
				}
			});

				act = random(1,100);
				var go;

			if (!V().B.fireRainUsed || (this.CDcheck("Rain of Fire") && act <= 40)){
				console.log("Rain of Fire selected");
				V().action = new Action("Rain of Fire");
				V().action._weight = 0.55;
				V().action._effweight = 0.5;
				V().action._dur = 3;
				V().action._actText = `Bill raises his arms skyward and cackles. Flaming rocks fall from the sky like infernal hail, spreading like wildfire where they hit.`;
				V().action._act = `<<for _puppet range puppets()>><<echoDamage _puppet>><<addEffect _puppet "Burning" $action.dur $subject>><</for>>`;
				this.cd.set("Rain of Fire",2);
				V().B.fireRainUsed = true;
			}
			else if (act <= 70 && act > 40){
				console.log("Single-target stun selected");
				act = random(1,100);
				if (act <= 50) {
					console.log("Stone Gaze rolled");
					go = true;
					puppets().forEach(function(puppet){
						if (puppet.petrified) {
							go = false;
						}
					});
					if (go){
						console.log("Stone Gaze selected");
						V().action = new Action("Stone Gaze");
						action()._targetMod = ["ignore downed"];
						action()._dur = -1;
						V().action._actText = `Bill turns the full force of his huge, all-consuming eye on $target.name. The schlera around the slitted pupil glows a sickly, ugly yellow, the color of rotting pus. You see Bill's gaze become a physical force, a cone of light that swallows $target.name in its entirety, and before your eyes, you see their flesh turn to stone.`;
						V().action._act = applyEffect("Petrified");
						this.cd.set("Stone Gaze",3);
					}
				}
				else if (count < 3) {
					V().target = Hitlist.targetEnemy(["ignore downed"]);
					let g = 0;
					while (g < 11 && (target().petrified || target().asleep)){
						// This should HOPEFULLY never activate under conditions where the loop cannot be broken (everyone is already asleep or petrified) but we include a guardian just in case
						V().target = Hitlist.targetEnemy(["ignore downed"]);
						g++;
					}
					act = random(1,3);
					if (act == 1) {
						V().action = new Action("Bad Dreams");
						action()._targetMethod = null;
						V().action._dur = 4;
						V().action._effweight = 0.5;
						V().action._actText = `Bill snaps his fingers, and ${target().name} is out like a light.`;
						V().action._act = applyEffect(["Asleep","Poisoned"]);
					}
					else if (act == 2) {
						V().action = new Action("Sleeping Beauty");
						action()._targetMethod = null;
						V().action._dur = 4;
						V().action._effweight = (20/50);
						V().action._actText = `Bill snaps his fingers. A strange cloudiness passes over ${target().name}'s eyes before they slowly and deliberately lie down to sleep.`;
						V().action._act = applyEffect(["Curse","Asleep"]);
					}
					else if (act == 3) {
						count = 0;
						puppets().forEach(function(puppet) {
							if (puppet.dead){
								count++;
							}
						});
						if (count < 2) { //Bill won't use this if 2 or fewer puppets remain, because it would be too unfair to incapacitate your whole team at once
							V().action = new Action("Lights Out");
							action()._targetMod = ["ignore downed", "ignore untargetable", "ignore protection"];
							V().action._dur = 4;
							action()._actText = `Bill sneers, "I think it's past your bedtime, kids!" Then with a snap of his fingers...`;
							action()._act = `<<addEffect $target "Asleep" $action.dur>>\
							<<set _hitlist = []>>\
							<<for _puppet range puppets()>>\
								<<if !_puppet.asleep>>\
									<<run _hitlist.push(_puppet)>>\
									<<if _puppet.firefly>>\
										<<run _hitlist.push(_puppet)>>\
									<</if>>\
								<</if>>\
							<</for>>\
							<<if _hitlist.length > 0>>\
								<<set _t = random(0,_hitlist.length-1)>>\
								<<set $target = _hitlist[_t]>>\
								<<addEffect $target "Asleep" $action.dur>>\
							<</if>>`;
							//Bill should not hit the same puppet twice with this attack; this WILL ALWAYS put two puppets to sleep.
						}
					}
				}
			}
			else if (act <= 85 && act > 70){
				console.log("Memento Mori rolled");
				V().target = Hitlist.targetEnemy(["ignore downed"]);
				go = true;
				console.log("Target already doomed? "+target().doom);
				if (target().doom){ //Doom doesn't stack, so no point in reapplying it if target already has it
					go = false;
				}
				if (go){
					console.log("Memento Mori selected");
					V().action = new Action("Memento Mori");
					action()._targetMethod = null;
					V().action._dur = 3;
					V().action._actText = `Bill's eye glows blood-red as he points his finger straight at $target.name.

					<b><i>"Die."</i></b>`;
					V().action._act = `<<set $action.effweight = (1/3)>>\
					<<addEffect $target "Doom" -1 $subject>>\
					<<set $action.effweight = 0.5>>\
					<<addEffect $target "Poisoned" $action.dur $subject>>\
					<<addEffect $target "Burning" $action.dur $subject>>`;
				}
			}
			else if (act <= 95 && act > 85){
				count = 0;
				puppets().forEach(function(puppet){
					if (puppet.alert) {
						count++;
					}
				});
				if (count < 3) {
					V().action = new Action("Scream");
					action()._useText = null;
					action()._actText = `Bill's whole body suddenly glows a dark, violent red. His "face" -- though it's really more like his whole body -- splits open to reveal a gut-churning array of teeth and tongues that seem to extend far deeper than his body should allow.

					Then he <i>screams</i>.

					You are dead certain that there is not a single creature on Earth, no, in the <i>universe</i> that could make a scream like that. You clamp your hands over your ears, but it does nothing. This isn't just a sound you hear in your bones, it is a sound you hear in your <i>soul</i>.`
					action()._act = massAttack({target: "enemies", content: applyEffect("Stunned")});
				}
			}
			else {
				console.log("Attack selected");

				V().action = new Action();
				V().action._weight = 0.9;
				V().action._useText = null;
				V().action._actText = `Bill charges forward with a clenched fist, but stops inches away from $target.name. Then, almost playfully, he snaps out a finger to flick them in the face.`;
				action()._act = function () {
					return `<<echoDamage>>\
					<<set _container = []>>\
					<<for _effect range $subject.effects>>\
						<<if !_effect.buff>>\
							<<run _container.push(_effect)>>\
						<</if>>\
					<</for>>\
					<<if _container.length > 0>>\
					Bill transfers all his ailments onto ${target().name}!\
					<<for _effect range _container>>\
						<<run subject().removeEffect(_effect)>>\
						<<if _effect.name == "Perdition">>\
							<<set _effect.sticky = false>>\
						<</if>>\
						<<run target().addEffect(_effect)>>\
					<</for>>\
					<</if>>`;
				}
			}

			} //end loop
			return;
		}
	},

	// ADVENTURE TIME 2

	"Marceline": {
		"fullname": "Marceline the Vampire Queen",
		"bestiaryNo": 0,
		"gender": 'F',
		"hp": 500,
		"stats": {
			"Attack"	: 50,
			"Defense"	: 50,
			"Special"	: 50
		},
		"tolerances": {
			"Poisoned": -1,
			"Off-Balance": -1,
			"Stunned": -1,
			"Curse": 1
		},
		"specialInit": function(actor) {
			actor.boss = true;
			actor.immortal = true;
			actor.specialdeath = "Marceline Fakeout";
			actor.maskhp = true;
			actor.HPregenPercent = 0.05;
		},
		"cooldown": {
			"prone": 0,
			"eat": 4
		},
		"actions": function () {
			while (V().action === null){
				var act = random(1,100);

//			Puzzle boss. Can't be killed, but reducing her HP to 0 stuns her for X turns. Solution is Undertale-esque, like in her intro episode you have to entertain her enough that she decides you're friends.

//			Possibly different method for each puppet.
//			-Fighter: aggro abilities draw her attention and make her start a dramatic pose-off, she keeps transforming into bigger monsters to scare you off and you have to do a set of abilities in sequence to get through the pantomime to her satisfaction
//			-Rogue: get her drunk with red wine
//			-Mage: break the windows and kill her with sunlight

//			abilities
//			-default: fakeout swipe with her claws, does nothing
//			-20%: picks someone up and throws them, inflicts prone
//			-35%: shrieks in someone's face, stuns
//			-15%: drains someone, minor piercing damage + absorbs their buffs
//			--maybe this absorbs ailments too, and you can trick her into drinking bad ones to stun her?
//			-eats a strawberry

			console.log("Before switch. Fighter_Route = "+V().B.Fighter_Route);

				switch (V().B.Fighter_Route) {
					case 1:
						V().action = new Action("grab");
						action()._useText = null;
						action()._actText = `<<set _p = $puppets.find(function (p) { return p && p.name === "Mage"})>>\
						"Hey, hero!" Marceline calls mockingly. "Whatcha gonna do about <i>this?</i>"

						With lightning speed, her hand snaps out and plucks Mage effortlessly off the ground. <<if _p.dead>>She doesn't seem to notice that Mage is already defeated, even as they flop ragdoll-like in her grip.<</if>> "Poor little wizard. All that power, and none of it can save you now!" She flicks out her forked tongue and stares straight at Fighter as she says, "If you don't do anything, I'm gonna suck out all their bloooood. Whatcha gonna do, hero?"`;
						action()._act = `<<addEffect _p "Grappled" -1>>\
						<<set $B.Fighter_Route++>>`;
						return;
					case 2:
						V().action = new Action("drink");
						action()._weight = 1;
						action()._pierce = true;
						action()._useText = null;
						action()._actText = `<<set _p = $puppets.find(function (p) { return p && p.name === "Mage"})>>\
						<<set $target = _p>>\
						Marceline sinks her teeth into <<print _p.name>>'s neck, sucking out their blood! She sighs with satisfaction, then tosses them to the ground like garbage.

						"Aw, too slow! Guess you're not much of a hero after all."`;
						action()._act = function () {
							return `<<echoDamage>>\
							<<print _p.removeEffect("Grappled")>>\
							<<set $B.Fighter_Route = 0>>`;
						}
						return;
					case 3:
						V().action = new Action("grab");
						action()._useText = null;
						action()._actText = `<<set _p = $puppets.find(function (p) { return p && p.name === "Rogue"})>>\
						Marceline vanishes.

						You hear her chuckle, the sound echoing all throughout the huge space, impossible to place. "You think you can hide from me? You merely adopted the darkness. I was born into it, <i>molded</i> by it. The shadows were never on <i>your</i> side. <i>I see you.</i>"

						In a flash, she appears behind Rogue, and grabs them tightly with both hands. <<if _p.dead>>Is that who she was talking about? The effect is rather diminished when they're already defeated, giving no resistance as she holds them up. She doesn't seem to care, though.<</if>> "You wanna save this one, too? Gimme your worst. I think I'll bite them just a little... maybe turn them into one of my thralls. Heheheheh!"`;
						action()._act = `<<addEffect _p "Grappled" -1>>\
						<<set $B.Fighter_Route++>>`;
						return;
					case 4:
						V().action = new Action("drink");
						action()._weight = 1;
						action()._pierce = true;
						action()._useText = null;
						action()._actText = `<<set _p = $puppets.find(function (p) { return p && p.name === "Rogue"})>>\
						<<set $target = _p>>\
						Marceline sinks her teeth into <<print _p.name>>'s neck, sucking out their blood! She sighs with satisfaction, then tosses them to the ground like garbage.

						"Aw, too slow! Guess you're not much of a hero after all."`;
						action()._act = function () {
							return `<<echoDamage>>\
							<<print _p.removeEffect("Grappled")>>\
							<<set $B.Fighter_Route = 0>>`;
						}
						return;
					case 5:
						V().action = new Action("advance");
						action()._useText = null;
						action()._actText = `<<set $B.Fighter_Route++>>\
						<<set $target = $puppets.find(function (p) { return p && p.name === "Rogue"})>>\
						Marceline touches down and begins advancing with heavy, thundering steps, her body stretching longer and taller as she raises her claws above her head. "That's it! It's <i>my</i> turn to give you everything I've got! Your puny shield can't stand against my claws! You blood is mine! <i>Bluh!</i>" But though her tone sounds angry, she's grinning wider than ever.`;
						action()._act = null;
						return;
					case 6:
						V().action = new Action("claw");
						action()._weight = 0.5;
						action()._useText = null;
						action()._actText = `<<set $B.Fighter_Route = 0>>\
						Marceline leaps with impossible agility and rakes her claws across Fighter, batting them across the arena like a cat playing with a mouse. "Hahahaha!" she laughs. "Told you, pipsqueak!"`;
						action()._act = dmgandeffect('t',"Knocked Down",-1);
						return;
					case 7:
						V().action = new Action("invisible");
						action()._useText = null;
						action()._actText = `<<set $B.Fighter_Route++>>\
						Marceline floats back. "Alright. No more fooling around. There's no way you can dodge <i>this.</i>" With a strange sound, like a finger traced against the rim of a glass, she vanishes, just like before.

						"Can you see me?" she taunts, her voice echoing around and around in the wide space of the church. "Don't worry. <i>I see you.</i>"`;
						action()._dur = -1;
						action()._act = applyEffect("Invisible",{self:true});
						return;
					case 8:
						V().action = new Action("invisible attack");
						action()._weight = 1;
						action()._pierce = true;
						action()._useText = null;
						action()._actText = `<<set $B.Fighter_Route = 0>>\
						<<set $target = $puppets.find(function (p) { return p && p.name === "Fighter"})>>\
						All of a sudden, Fighter is lifted into the air by an unseen force. Their arms are pinned to their sides as their helmet is lifted off their head, exposing the flesh of their neck. There is a familiar laugh, and then two bright red puncture wounds appear in their neck. After a noisy slurping sound, they shudder, and fall limply to the ground.

						Marceline reappears in her normal position across the stage, and licks her lips with satisfaction. "Aw, don't feel too bad. It's not your fault you can't see through invisibility. It just means you're a boring dumb fakey hero who's boring and dumb."`;
						action()._act = `<<echoDamage>>\
						<<run $subject.removeEffect("Invisible")>>`;
						return;
					default:
						console.log("Fighter Route switch triggered, default case.");
				}

				console.log("Marceline actions: after Fighter route switch, before regular actions. Fighter Route = "+V().B.Fighter_Route);

				if (this.CDcheck("eat")) {
					V().action = new Action("eat");
					action()._useText = null;
					action()._actText = `Marceline reaches out a massive claw and... grabs an apple? You can't see where she got it from, but it's a beautiful specimen, the skin a deep, lustrous red. Marceline sinks her fangs into it, and the red drains away, as if she's drinking it. She lets out a satisfied sigh, and tosses the now-colorless apple aside.`;
					action()._act = null;
					this.cd.set("eat",4);
				}
				else if (this.CDcheck("prone") && act <= 20) {
					V().action = new Action("throw");
					action()._targetMod = ["ignore downed"];
					action()._dur = -1;
					action()._useText = null;
					action()._actText = function () {
						return `Marceline lifts ${target().name} by the head and flings them across the stage!`;
					};
					action()._act = applyEffect("Knocked Down");
					this.cd.set("prone",2);
				}
				else if (act > 20 && act <= 60) {
					V().action = new Action("scream");
					action()._targetMod = ["ignore downed"];
					action()._useText = null;
					action()._actText = function () {
						return `Marceline gets all up in ${target().name}'s face and lets out a shrill, bat-like shriek!`;
					};
					action()._act = applyEffect("Stunned");
				}
				else {

					V().action = new Action("fakeout");
					action()._useText = null;
					action()._actText = function () {
						return `Marceline swings at $target.name with her sharp claws, but misses by a hair! She just keeps laughing, seemingly unbothered.`;
					}
					action()._act = `<<set $dmg = 0>><<echoDamage "nocalc">>`; // This can still knock over someone off-balance
				}

			} //end loop
			return;
		}
	},

	"Chair": {
		"gender": 'x',
		"hp": 500,
		"stats": {
			"Attack"	: 30,
			"Defense"	: 20,
			"Special"	: 10
		},
		"tolerances": {
			"Poisoned": -1,
			"Stunned": -1
		},
		"actions": function () {
			while (V().action === null){
				var act = random(1,100);

			//Offense. Damage (weight 1) or off-balance.

				if (act <= 30) {
					V().action = new Action("offbalance");
					action()._targetMod = ["ignore downed"];
					action()._useText = null;
					action()._actText = function () {
						return `A chair suddenly appears behind ${target().name}. It moves by itself to ram sharply into their legs, forcing them to stumble. Just as they lean back to steady themselves, the chair disappears again.`;
					};
					action()._act = applyEffect("Off-Balance");
				}
				else {

					V().action = new Action("attack");
					action()._weight = 1;
					action()._useText = null;
					action()._actText = `A chair suddenly flies out of the pews to smack into ${target().name}.`;
					action()._act = justdmg();
				}

			} //end loop
			return;
		}
	},

	"Table": {
		"gender": 'x',
		"hp": 500,
		"stats": {
			"Attack"	: 20,
			"Defense"	: 20,
			"Special"	: 20
		},
		"tolerances": {
			"Poisoned": -1,
			"Stunned": -1
		},
		"actions": function () {
			while (V().action === null){
				var act = random(1,100);

			//"Rogue", ailments and weak multi-hits.

				if (act <= 35) {
					V().action = new Action("poison");
					action()._targetMod = ["ignore downed"];
					action()._dur = 3;
					action()._useText = null;
					action()._actText = `Marceline's kitchen table starts pelting you with rotten food. Gross!`;
					action()._act = applyEffect("Poisoned");
				}
				else if (act > 35 && act <= 70) {
					V().action = new Action("burn");
					action()._targetMod = ["ignore downed"];
					action()._dur = 3;
					action()._useText = null;
					action()._actText = `The candles on Marceline's kitchen table suddenly flare to life before flying at ${target().name}, covering them in burning wax.`;
					action()._act = applyEffect("Burning");
				}
				else {

					V().action = new Action("attack");
					action()._weight = 0.5;
					action()._useText = null;
					action()._actText = `Marceline's table starts flinging dishes and cutlery at you!`;
					action()._act = `<<multihit 3 "spread">>`;
				}

			} //end loop
			return;
		}
	},

	"Armor": {
		"gender": 'x',
		"hp": 500,
		"stats": {
			"Attack"	: 10,
			"Defense"	: 40,
			"Special"	: 10
		},
		"tolerances": {
			"Poisoned": -1,
			"Stunned": -1
		},
		"actions": function () {
			while (V().action === null){
				var act = random(1,100);

//			Weak attack, protect other, and stun (encases one person in armor for several turns, they can't act but take reduced damage)

				if (!this.protector && !(V().enemies[0].dead && V().enemies[1].dead) && act <= 30){
					var t = null;
					while (t === null){
						t = random(0,1); // does not protect Marceline
						if (V().enemies[t].dead) {
							t = null;
						}
					}
					V().target = V().enemies[t];
					V().action = new Action("Protector");
					action()._targetMethod = null;
					V().action._actText = `A suit of armor near the wall breaks into its component parts, then rearranges into a protective casing around another piece of furniture.`;
				}
				else if (act > 30 && act <= 40) {
					V().action = new Action("stun");
					action()._targetMod = ["ignore downed"];
					action()._dur = 3;
					action()._useText = null;
					action()._actText = `A suit of armor springs to life and starts flying towards $target.name. Just before it hits, it breaks apart, reforming again around them. $target.name struggles against the armor, but it holds them fast.`;
					action()._act = `<<print target().addEffect("Encased")>><<print subject().addEffect("Encased")>>`;
				}
				else {

					V().action = new Action("attack");
					action()._weight = 1;
					action()._useText = null;
					action()._actText = `A suit of armor springs to life and slaps ${target().name} across the face!`;
					action()._act = justdmg();
				}

			} //end loop
			return;
		}
	},

	// CHAMPIONSHIP

	"PB Champ": {
		"bestiaryNo": 0,
		"gender": 'F',
		"hp": 1000,
		"stats": {
			"Attack"	: 10,
			"Defense"	: 30,
			"Special"	: 50
		},
		"specialInit": function(actor) {
			actor._idname = "PB Champ";
			actor.name = "Bonnibel";
			actor.ready = true;
			actor.inventory = new Map([
					["Bottled Chi",3],
					["Adrenaline",3],
					["Stoneskin",3],
					["Nootropic",3],
					["Powdered Glass",2],
					["Grenade",2],
					["Calamity Bomb",2],
					["Gas Bomb",1],
					["Flamethrower",1],
					["Chaff Grenade",1],
					["Panacea",3]
				]);
			actor.attackItemLogic = function () {
				while (V().action === null) { // hasItem check should prevent infinite loop but BE CAREFUL
					var act = random(1,100);
					var noPowderedGlass = false;
					var noCalamityBomb = false;
					var count = 0;

					if (act <= 40) { // use single-target item
						console.log("Bonnibel single-target attack item branch");
						effectCheck(["alert","dead"]);
						console.log("Chi check performed, count = "+count);
						if (count == puppets().length) {
							noPowderedGlass = true; // if all puppets are alert or dead, there are no viable targets for Powdered Glass
						}
						effectCheck(["dead"]);
						if (count == puppets().length) {
							noCalamityBomb = true; // if all puppets are protected or dead, there are no viable targets for Calamity Bomb
						}
						if (noPowderedGlass && noCalamityBomb) {
							act = 2;
						} else if (noPowderedGlass) {
							act = random(2,3);
						} else if (noCalamityBomb) {
							act = random(1,2);
						} else {
							act = random(1,3);
						}
						if (this.inventory.get("Powdered Glass") > 0 && act == 1) {
							if (!target().alert && !target().chi && !target().stasis) {
								V().action = new ItemAction("Powdered Glass");
								action()._targetMod = ["smart"];
								action()._actText = `Bonnibel pours what appears to be bright pink sugar onto her palm. She blows it into ${target().name}'s face, and they recoil and claw at their face as if they were shards of glass.`;
							}
						}
						else if (this.inventory.get("Grenade") > 0 && act == 2) {
							V().action = new ItemAction("Grenade");
							action()._targetMod = ["smart"];
						}
						else if (this.inventory.get("Calamity Bomb") > 0 && act == 3) {
							V().action = new ItemAction("Calamity Bomb");
							action()._targetMod = ["smart", "debuff"];
						}
					}
					else { // use multi-target item
						act = random(1,3);
						if (this.inventory.get("Gas Bomb") > 0 && act == 1) {
							V().action = new ItemAction("Gas Bomb");
						}
						else if (this.inventory.get("Flamethrower") > 0 && act == 2) {
							V().action = new ItemAction("Flamethrower");
							action()._actText = `Bonnibel assembles a flamethrower from components on her tool belt, and douses your puppets in flame.`;
						}
						else if (this.inventory.get("Chaff Grenade") > 0 && act == 3) {
							V().action = new ItemAction("Chaff Grenade");
							V().action._weight = 1;
							V().action._dur = 3;
							V().action._actText = `Bonnibel lobs a grenade at you -- but to your surprise, when it explodes it leaves a massive cloud of shiny metal flakes. It just looks like silly confetti to you, but your puppets stutter and freeze up trying to see through all the flashing lights!`;
							V().action._act = massAttack({content: applyEffect("Dizzy"), cut: true});
						}
					}
				}
			}
		},
		"cooldown": {
			"stasis": 0
		},
		"actions": function () {
			while (V().action === null){
				var act = random(1,100);
				console.log("Bonnibel act = "+act);
				var hasItem;
				var stasisCount = 0;
				var deadCount = 0;
				enemies().forEach(function(enemy) {
					if (enemy.stasis) {stasisCount++;}
					if (enemy.dead) {deadCount++;}
				});

//			Rogue. Can use items freely, but has limited stock. Has 1 of each attack item + chaff grenade, puts rest of her points into drugs and Bottled Chi.

//			if SPC buffed, 75% chance to use attack item
//			normal:
//			50%: support
//			-first, check if anyone has >= 2 buffs and <= 1 ailment. If yes, they are added to a hitlist. If hitlist contains viable targets, 50% chance to use Stasis (target selection totally random). Otherwise...
//			-target is random, but (1-hp/maxhp) chance to reroll if they are below half health (don't waste items on doomed people)
//			-25%: bottled chi
//			-50%: buff drug for focus stat (Gumball gets 25% for all)
//			-12.5%: buff drug for other stat
//			20%: attack item
//			20%: off-balance one
//			10%/default: gun or reload

			this.inventory.forEach(function(stock,item) {
				switch (item) {
					case "Powdered Glass":
					case "Grenade":
					case "Calamity Bomb":
					case "Flamethrower":
					case "Gas Bomb":
					case "Chaff Grenade":
						if (stock > 0) {
							hasItem = true;
							break;
						}
				}
			});

			if (this.get(V().SpecialStat) > this.getBase(V().SpecialStat) && act <= 85 && hasItem === true) {
				this.attackItemLogic();
				this.inventory.inc(action().name,-1);
				return;
			}

				act = random(1,100);
				console.log("Special attack item check failed, new act = "+act);

			if (stasisCount < (V().enemies.length - deadCount) && act <= 50) {
				if (this.CDcheck("stasis")) {
					var buffCount;
					var ailmentCount;
					var hitlist = [];
					enemies().forEach(function(enemy) {
						buffCount = 0;
						ailmentCount = 0;
						if (!enemy.stasis && !enemy.stunned){
							enemy.effects.forEach(function(effect) {
								if (effect.buff) {buffCount++;}
								if (!effect.buff) {ailmentCount++;}
							});
							if (buffCount >= 2 && ailmentCount <= 1) {
								hitlist.push(enemy);
							}
						}
					});
					if (hitlist.length > 0) {
						act = random(0,hitlist.length-1);
						V().target = hitlist[act];
						V().action = new Action("Thaumastasis");
						action().actText = `Bonnibel pulls a strange device out of her pocket, and points it at ${target().name}. There is an indescribable noise, and then the flow of magic around ${target().name} has frozen like amber.`;
						this.cd.set("stasis",5);
						return;
					}
				}
				hasItem = false;
				this.inventory.forEach(function(stock,item) {
					switch (item) {
						case "Bottled Chi":
						case "Adrenaline":
						case "Stoneskin":
						case "Nootropic":
							if (stock > 0) {
								hasItem = true;
								break;
							}
					}
				});
				if (hasItem) {
					var keepGoing = true;
					var chance;
					while (keepGoing) {
						$.wiki('<<allytarget "buff">>');
						if (deadCount == 3) { // There is no point in rerolling if the user is the only viable target
							keepGoing = false;
						}
						else if (target().name != "Bonnibel" && target().hp < (target().maxhp / 2)){ // Don't waste items on people who are about to die (but Bonnibel is a little selfish and excludes herself from this check)
							chance = random(1,100);
							if (chance < ((target().hp / target().maxhp) * 100)) {
								keepGoing = false;
							}
						}
						else {
							keepGoing = false;
						}
					}
					while (V().action === null) { // The hasItem check SHOULD prevent an infinite loop from occurring here, but be careful
						act = random(1,8);
						if (act <= 2 && this.inventory.get("Bottled Chi") > 0) {
							V().action = new ItemAction("Bottled Chi");
						}
						else if (target().name == "Gumball") {
							act = random(1,3);
							switch (act) {
								case 1:
									if (this.inventory.get("Adrenaline") > 0) {V().action = new ItemAction("Adrenaline")}
									break;
								case 2:
									if (this.inventory.get("Stoneskin") > 0) {V().action = new ItemAction("Stoneskin")}
									break;
								case 3:
									if (this.inventory.get("Nootropic") > 0) {V().action = new ItemAction("Nootropic")}
									break;
							}
						}
						else {
							switch (target().name) {
								case "Bonnibel":
									if (this.inventory.get("Nootropic") > 0 && act <= 6 && act > 2) {
										V().action = new ItemAction("Nootropic");
									}
									else if (this.inventory.get("Stoneskin") > 0 && act == 7) {
										V().action = new ItemAction("Stoneskin");
									}
									else if (this.inventory.get("Adrenaline") > 0 && act == 8) {
										V().action = new ItemAction("Adrenaline");
									}
									break;
								case "Dipper":
									if (this.inventory.get("Adrenaline") > 0 && act <= 6 && act > 2) {
										V().action = new ItemAction("Adrenaline");
									}
									else if (this.inventory.get("Stoneskin") > 0 && act == 7) {
										V().action = new ItemAction("Stoneskin");
									}
									else if (this.inventory.get("Nootropic") > 0 && act == 8) {
										V().action = new ItemAction("Nootropic");
									}
									if (V().B.dipper_drug_event != "done" && V().action !== null) {V().B.dipper_drug_event = "active";}
									break;
								case "Stevonnie":
									if (this.inventory.get("Stoneskin") > 0 && act <= 6 && act > 2) {
										V().action = new ItemAction("Stoneskin");
									}
									else if (this.inventory.get("Nootropic") > 0 && act == 7) {
										V().action = new ItemAction("Nootropic");
									}
									else if (this.inventory.get("Adrenaline") > 0 && act == 8) {
										V().action = new ItemAction("Adrenaline");
									}
									break;
							}
						}
					}
					this.inventory.inc(action().name,-1);
				}
			}
			else if (act <= 80 && act > 50) {
				this.attackItemLogic();
				this.inventory.inc(action().name,-1);
			}
			else if (deadCount < 3 && act <= 90 && act > 80) { // no point in using this if she is only one left
				V().action = new Action("sonar");
				action()._targetMod = ["ignore downed"];
				action()._useText = null;
				action()._actText = function () {
					return `Bonnibel pulls out a strange device and points it at ${target().name}. You hear a strange, high-pitched noise just on the edge of your hearing. It's easy enough for you to ignore, but ${target().name} can't seem to stand it -- they twitch and spasm, jerking backward and swaying.`;
				}
				action()._act = applyEffect("Off-Balance");
			}
			else {
				if (this.ready){
					V().action = new Action("shotgun");
					action()._targetMod = ["pierce"];
					action().weight = 1;
					action().pierce = true;
					action().useText = null;
					action().actText = `Bonnibel blasts ${target().name} with her shotgun.`;
					action().act = justdmg();
					this.ready = false;
				}
				else {
					V().action = new Action("load");
					action().useText = null;
					action().actText = `Bonnibel loads a cartridge into her shotgun.`;
					action().act = null;
					this.ready = true;
				}
			}

			} //end loop
			return;
		}
	},

	"Dipper Champ": {
		"bestiaryNo": 0,
		"gender": 'M',
		"hp": 1000,
		"stats": {
			"Attack"	: 50,
			"Defense"	: 10,
			"Special"	: 30
		},
		"specialInit": function(actor) {
			actor._idname = "Dipper Champ";
			actor.name = "Dipper";
			actor.ready = false;
		},
		"cooldown": {
			"Secret": 0,
			"dispel": 0,
			"Deduction": 0
		},
		"actions": function () {
			while (V().action === null){
				var act = random(1,100);

//			Mage. Can spend a turn charging up to empower abilities.

//			30%: Chaos Thunder: hit one, x1 normally, x2 if charged
//			40%: Flawless Deduction (Logomancer reference!): Forsaken, exact mimic of Mage's spell (can only be used if charged)
//			20%: Appalling Secret (Fallen London reference!): dmg + Poison, analogous to Mage's Fireball, charge increases poison damage
//			Anti-Weirdness Field: dispel one buff, charge dispels all buffs (but still only one target)

			var hitlist = [];
			enemies().forEach(function(enemy) {
				if (!enemy.stasis) {
					enemy.effects.forEach(function(effect) {
						if (!effect.buff && !effect.sticky) {
							hitlist.push(enemy);
						}
					});
				}
			});

			// Everyone is added to the hitlist once for every ailment they possess. This means that characters with more ailments will have a higher chance of getting selected.

			var uniqueAilments = 0;
			hitlist.forEach(function(enemy,i) {
				if (i != 0) {
					if (enemy !== hitlist[i-1]) {
						uniqueAilments++;
					}
				}
			});

			// If two hitlist entries don't match each other, they're different enemies. This allows us to track how many total characters have ailments. (This is important for the mass version, because Dipper shouldn't waste his charge on a mass cure if only one person has ailments.)

			if ( ((this.ready && uniqueAilments >= 3) || !this.ready) && act <= hitlist.length * 20 ) {
				if (this.ready) {
					V().action = new Action("First Aid");
					action().actText = `Dipper takes out a pack of bandages and medicine and sprints across the field, administering to everyone's wounds with expert care.`;
					action().act = `<<for _enemy range enemies()>><<print _enemy.removeEffect(_enemy.effects[_enemy.effects.length-1])>><</for>>`;
					this.ready = false;
					return;
				}
				else {
					var t = random(0,hitlist.length-1);
					V().target = hitlist[t];
					V().action = new Action("First Aid");
					action().actText = `Dipper takes out a pack of bandages and medicine and gives ${target().name} a quick treatment for their ailments.`;
					action().act = `<<print target().removeEffect(target().effects[target().effects.length-1])>>`;
					return;
				}
			}

				act = random(1,100);

			if (this.CDcheck("Deduction") && this.ready && act <= 40) {
				V().action = new Action("Forsaken");
				action()._targetMod = ["ignore downed"];
				action().effweight = 1.25;
				action().useText = `Dipper uses "Flawless Deduction".`;
				action().actText = `Dipper paws through his journal, his eyes flicking up to ${target().name} and then back to the page repeatedly. After several seconds of this, he snaps the journal shut and jabs a finger at them triumphantly. "Strike there! That's their weak point!"`
				this.ready = false;
				this.cd.set("Deduction",5);
			}
			else if (act > 40 && act <= 50) {
				if (target() !== null) {
					V().action = new Action("Appalling Secret");
					action()._targetMod = ["debuff"];
					action().weight = 1;
					action().dur = 3;
					if (this.ready) {
						action().effweight = 0.9;
					} else {
						action().effweight = 0.6;
					}
					action().actText = `Dipper reads something from his journal that makes you want to throw up.`;
					action().act = dmgandeffect('t',"Poisoned",action().dur);
					this.ready = false;
					console.log("Appalling Secret selected, duration = "+V().action.dur+" ?= "+action().dur);
				}
			}
			else if (act > 50 && act <= 60) {
				var threshold = 1;
				if (this.ready) {threshold = 2;}
				$.wiki('<<dispelTarget '+threshold+'>>');
				if (State.temporary.go){
					V().action = new Action("Anti-Weirdness Field");
					action().weight = 1;
					V().action.actText = `Dipper pulls something from his pocket and taps at it. A burst of strange energy washes over ${target().name}, stripping them of their magic.`;
					if (this.ready) {
						action().act = `<<echoDamage>><<for _effect range $target.effects>>\
						<<if _effect.buff && !_effect.sticky>>\
							<<print target().removeEffect(_effect)>>\
							<<break>>\
						<</if>>\
					<</for>>`;
						this.ready = false;
					} else {
						V().action.act = `<<echoDamage>>`+
					`<<for _effect range $target.effects>>\
						<<if _effect.buff && !_effect.sticky>>\
							<<print target().removeEffect(_effect)>>\
						<</if>>\
					<</for>>`;
					}
					this.cd.set("dispel",2);
					return;
				}
			}
			else if (act > 60 && act <= 90) {

				V().action = new Action("Chaos Thunder");
				if (this.ready){
					action().weight = 2;
				} else {
					action().weight = 1;
				}
				if (!V().B.chaos_thunder_event){
					action().useText = null;
				}
				action().actText = `Dipper extends his arm like a wizard casting a grand spell, and shouts, "CHAOS THUNDER!" Lightning splits the air, leaving a wave of multicolored stars around the hapless puppet it fries.`
				action().act = justdmg(`<<set $subject.ready = false>><<if $B.gumball_spell_event != "done">><<set $B.gumball_spell_event = "active">><</if>>`);
			}
			else if (!this.ready) {
				V().action = new Action("prepare");
				action().useText = null;
				action().actText = `Dipper pauses to look up something in his journal. He suddenly smirks with satisfaction, and writes down a note.`;
				action().act = `Dipper's next attack will be stronger.<<set $subject.ready = true>>`;
			}

			} //end loop
			return;
		}
	},

	"Gumball Champ": {
		"bestiaryNo": 0,
		"gender": 'M',
		"hp": 1000,
		"stats": {
			"Attack"	: 30,
			"Defense"	: 30,
			"Special"	: 30
		},
		"specialInit": function(actor) {
			actor._idname = "Gumball Champ";
			actor.name = "Gumball";
		},
		"actions": function () {
			while (V().action === null){
				var act = random(1,100);

			//Similar to original but no longer skips turns

			if (V().B.gumball_spell_event == "active") {
				V().action = new Action("");
				action().useText = null;
				action().actText = `Gumball's face splits in a manic grin. He throws his hands out towards you and screams, "ULTIMA!!!"

				Nothing happens.

				Gumball starts waving his hands in increasingly frantic movements. "Flare! Firaga! Magic Missile! C'mon, give me SOMETHING here!"<<if !$enemies[3].dead>>

				Stevonnie giggles, but not cruelly. "Hey, don't feel bad. Maybe you're just more of a fighter type?"<<if !$enemies[1].dead>>

				Dipper barks a laugh, much less kindly. "Nah, you wish. You're totally like, the joke character."<</if>><</if>><<if !$enemies[0].dead>>

				Bonnibel huffs. "Don't be ridiculous. Magic isn't real. And anyway, you're getting the verbal and somatic components all wrong. You can't just wave your hands and get whatever you want."<</if>>

				Gumball throws his hands up in defeat and just glowers.<<set $B.gumball_spell_event = "done">>`
				action().act = null;
				return;
			}

			if (!V().enemies[1].dead && !V().enemies[2].dead && !this.untargetable && act <= 10) {
				console.log("Action: sneak");
				V().action = new Action("Sneak");
				V().action.useText = null;
				V().action.actText = `Gumball's eyes flick from side to side. When he thinks no one is watching him, he slinks away from the fight.`;
			}
			else if (act <= 25 && act > 10) {
				console.log("Action: stun");
				V().action = new Action("Something in your eye");
				action()._targetMod = ["ignore downed"];
				V().action.useText = null;
				V().action.actText = `Gumball spits in $target.name's eyes!`;
			}
			else if (act <= 45 && act > 25) {

				V().action = new Action("Below the Belt");
				V().action.weight = 0.9;
				V().action.useText - null;
				V().action.actText = `Gumball kicks $target.name in the shins!`;
			}
			else if (act <= 65 && act > 45) {

				V().action = new Action();
				V().action.weight = 0.9;
				V().action.dur = 3;
				V().action.useText = null;
				V().action.actText = `Gumball rushes forward and punches $target.name hard in the gut, leaving them gasping.`;
				V().action.act = dmgandeffect('t',"Winded");
			}
			else {
				console.log("Action: item");
				V().action = new ItemAction("placeholder");
				V().action.useText = `Gumball rummages through his pockets...`;
				act = random(1,20); //rolling a d20, as is custom
				if (act == 1) {
					// critical fail: gumball
					V().action.actText = `...and only finds a gumball. He giggles to himself and sticks it to the arena wall with a mischevious grin. In the process, he seems to have forgotten about attacking you.`;
					V().action.act = null;
				}
				else if (act > 1 && act <= 6) {
					// 5 in 20: rubber band (effectively a weaker Throwing Knife)

					V().action.weight = 1;
					V().action.actText = `...and retrieves a thick rubber band. "Oh, cool!" He looks at you with a predatory glint in his eyes. "Hey," he says with a smirk, stretching the band between his fingers like a slingshot. "Wanna see a trick?"`;
					V().action.act = justdmg();
				}
				else if (act > 6 && act <= 11) {
					// 5 in 20: candy bar
					V().action.effweight = V().STD_BUFF;
					V().action.dur = 3;
					V().action.actText = `...and retrieves a brightly-wrapped candy bar. "Oh, awesome! I forgot I had this!" He downs the whole thing in a few bites. You dread the sugar high he's going to get...`;
					V().action.act = applyEffect("SPC Boost",{self:true});
				}
				else if (act > 11 && act <= 16) {
					// 5 in 20: protein bar
					V().action.effweight = V().STD_BUFF;
					V().action.dur = 3;
					V().action.actText = `...and pulls out a protein bar. He glares at it as if its existence offends him, then nonchalantly shrugs and takes a bite. "Food's food," he says.`;
					V().action.act = applyEffect("DEF Boost",{self:true});
				}
				else if (act > 16 && act <= 19) {
					// 3 in 20: angry cat
					V().action.weight = 0.8;
					V().action.actText = `...and pulls out a thin, mangy cat.

He screams and drops it, much to the cat's displeasure. "How did that even fit in there?! No -- wait -- good kitty -- AAAAHHHH!"`;
					V().action.act = `<<for _enemy range enemies()>>`+
										`<<set $target = _enemy>>`+
										`<<echoDamage>>`+
									`<</for>>`+
									`<<for _puppet range puppets()>>`+
										`<<set $target = _puppet>>`+
										`<<echoDamage>>`+
									`<</for>>`;
				}
				else if (act == 20) {
					// critical success: neutrino bomb
					V().action.weight = 1.5;
					V().action.actText = `...and pulls out a neutrino bomb?!

He yelps and throws the beeping thing up into the air, but catches it before it hits the ground. "Why do I even have this?!" he yells, then shakes his head. "Whatever, don't look a gift horse in the mouth! CATCH!"

<i>BOOM.</i>`
					V().action.act = `<<for _puppet range puppets()>>`+
										`<<set $target = _puppet>>`+
										`<<echoDamage>>`+
									`<</for>>`;
				}
			}

			} //end loop
			return;
		}
	},

	"Stevonnie": {
		"bestiaryNo": 0,
		"gender": 'N',
		"hp": 1000,
		"stats": {
			"Attack"	: 30,
			"Defense"	: 50,
			"Special"	: 10
		},
		"cooldown": {
			"Meditate": 2,
			"supermove": 0
		},
		"actions": function () {
			while (V().action === null){
				var act = random(1,100);

//			Fighter, with the twist that they can use Thorns for a counterattack.

//			Meditate
//			50%: Protector (only if not already protecting)
//			5%: Thorns (30% if protecting, 90% if marked)
//			15%: Farewell to Arms
//			15%: stun
//			15%/default: Sword

			var count = meditateLogic();

			if (!this.stasis && this.CDcheck("Meditate") && ((count >= 10) || (act <= (count*10)))) {
				V().action = new Action("Meditate");
				V().action.actText = `Stevonnie closes their eyes and starts to breathe in a calm, steady rhythm. You think you see them glowing slightly.`;
				this.cd.set("Meditate",5);
				return;
			}

				act = random(1,100);

			if ( !this.stasis && !this.thorns && ( (this.protector && act <= 30) || (this.marked && act <= 90) ) ) {
				V().action = new Action("Thorns");
				action().useText = null;
				action().actText = `Stevonnie concentrates for a second, and their gem flashes a bright pink.`;
				action().act = applyEffect("Thorns",{self:true});
				return;
			}

				act = random(1,100);

			if ( !this.stasis && !this.thorns && act <= 5 ) {
				V().action = new Action("Thorns");
				action().useText = null;
				action().actText = `Stevonnie concentrates for a second, and their gem flashes a bright pink.`;
				action().act = applyEffect("Thorns",{self:true});
				return;
			}
			else if (!this.protector && act > 5 && act <= 55) {
				console.log("Stevonnie chose Protector");
				var hitlist = [];
				var total_chance = 0;
				var chance;
				enemies().forEach(function(enemy,i){
					console.log(i);
					if (!enemy.dead && enemy.name != "Stevonnie") {
						hitlist.push({target: enemy, chance: 0});
						console.log(enemy.name+" added to hitlist");
					}
				});
				if (hitlist.length > 0) {
					// Incentivize protecting more injured characters: everyone's base % chance is equal to the proportion of HP they've lost
					// However, additional weights for Dipper and below half HP means this doesn't neatly equate to a % chance
					// Final selection is random but weighted, everyone has a (personal weight / total weight) chance of selection
					// To avoid bias towards later characters, everyone is given a unique range by adding the previous character's weight to their own
					// e.g. if Bonnibel and Dipper are at full HP but Gumball is at 50% HP, Bonnibel = 0; Dipper = 10; Gumball = 90 (50 normal + 40 for below half HP). The total value is 100, so the random selection variable will be from 0 to 100. Gumball's value will be changed to 90 + 10 = 100 and will only be selected if the random variable is less than or equal to his weight AND greater than Dipper's weight; this gives him a 90% chance of being selected and Dipper a 10% chance.
					hitlist.forEach(function(enemy,i){
						console.log(enemy.target.name);
						if (enemy.target.name == "Stevonnie") {
							// do nothing
						}
						else {
							enemy.chance = (1 - (enemy.target.hp / enemy.target.maxhp)) * 100;
							if (enemy.target.name == "Dipper") {
								enemy.chance += 10; // Dipper gets a bonus to be protected because of his low DEF
							}
							if (enemy.target.hp < (enemy.target.maxhp / 2)) {
								enemy.chance += 40; // higher chance if they are below half HP
							}
							console.log(enemy.target.name+" protector chance = "+enemy.chance);
						}
						total_chance += enemy.chance;
					});
					chance = random(0,total_chance);
					hitlist.forEach(function(enemy,i){
						if (i != 0) {
							enemy.chance += hitlist[i-1].chance;
							if (chance <= enemy.chance && chance > hitlist[i-1].chance) {
								V().target = enemy.target;
							}
						}
						else if (chance <= enemy.chance) {
							V().target = enemy.target;
						}
					});
					if (V().target !== null) {
						V().action = new Action("Protector");
						V().action.actText = `Stevonnie leaps fearlessly to ${target().name}'s side, raising their shield to protect ${target().them} from all harm.`;
					}
					if (V().B.bonnibel_protection_event != "done" && target().name == "Bonnibel"){
						V().B.bonnibel_protection_event = "active";
					}
				}
			}
			else if (act > 55 && act <= 70) {
				console.log("Stun branch")
				if (!target().alert && !target().chi && !target().stasis){ // Anything that's part Connie is smart enough to check these
					console.log("Target valid");
					V().action = new Action("Pommel Strike");
					action()._targetMod = ["ignore downed"];
					action().actText = function () {
						return `Stevonnie rushes forward, but at the last moment, reverses their grip on their sword to ram the pommel into ${target().name}'s face, forcing them to reel back in a daze.`;
					};
					action().act = applyEffect("Stunned");
				}
			}
			else if (act <= 85 && act > 70) {
				if (target() !== null) {
					V().action = new Action("A Farewell to Arms");
					action()._targetMod = ["debuff"];
					action().weight = 0.9;
					action().actText = function () {
						return `Stevonnie throws their shield out like a discus, expertly hitting ${target().name} straight in the arm joints.`;
					};
				}
			}
			else {
				if (V().enemies[0].dead && V().enemies[1].dead && V().enemies[2].dead && this.CDcheck("supermove")) {

					V().action = new Action("Meteor Strike");
					action().weight = 1.5;
					action().actText = `Stevonnie grips their sword with both hands, then charges forward with blinding speed to strike ${target().name} with a devastating thrust.`;
					action().act = justdmg();
					this.cd.set("supermove",3);
				}

				V().action = new Action("Sword");
			}

			} // end loop
			return;
		}
	},

};

(function () {
	//	quick hack to populate bestiary numbers if you don't want to do it yourself
	//	not foolproof, can create duplicate numbers, don't use if you're assigning your own numbers
	var num = 1;
	for (let [pn,v] of Object.entries(setup.enemyData)) {
		if (!v.noBestiary && (v.bestiaryNo === 0)) {
			v.bestiaryNo = num;
			num++;
		}
	}
})();
