window.Enemy = class Enemy extends Actor {
	constructor(name){
	if (typeof(name) == 'object'){
		super(name);
	}
	else {
		switch (name) {
			
			/* Gravity Falls 1 */
			case "Dipper":
				super(name,
						/* hp */	1500,
						/* atk */	[30,
						/* def */	30,
						/* spc */	30],
						/* pr */	'M'
						);
				this.cd = new Map([
					["Dispel Magick",0]
					]);
				this.actions = function () {
					while (V().action === null) {
						var act = random(1,100);
						
					/* Dipper is a support caster. Half the time, he will enter support mode. If he is able, he will prioritize Dispel Magick, which will remove all buffs from one target. This is pretty powerful, so for balance it has a long cooldown (4 rounds) and a threshold of 2 buffs. If dispeltarget fails the threshold or Dispel is still on cooldown, he will use Recovery. Since there's no healing, I will instead interpret this as a buff spell, but it can also provide the ailment reduction like Bonfire Monk's Heal. Because he's selfless, he will prioritize Mabel if she has the same number of ailments as him; otherwise he will pick the person with more ailments, or choose randomly if no one has any ailments. The buff is chosen completely randomly because I don't want to try to make logic for that. (Patron maps onto the specializations for the basic three classes, so Chattur'gha = DEF, Ulayoth = ATK, Xel'lotath = SPC.) */
					
					/* Half the time, he will enter attack mode. 25% of the time, he will use Damage Field, which I am interpreting as damage + debuff because Mabel already has DoT and there are no multi-turn stuns. Debuff is again chosen randomly. The other 25% of the time, he will use Bind Creature, which does weak damage + stun. All of his attack weights are below 1, so he cannot deal significant damage on his own. */
					
					if (this.cd.get("Dispel Magick") < 0 && act <= 50) {
						$.wiki('<<dispeltarget 2>>');
						if (State.temporary.go){
							V().action = new Action();
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
								case "Mage":
								case "Cleric":
									god = "Xel'lotath";
									break;									
							}
							V().action.useText = `Dipper frantically flips through his journal before yelling, "Nekleth Redgemor ${god}!"`;
							V().action.actText = `Magickal runes swirl around Dipper before crashing violently to the earth, releasing a nauseating wave that strips $target[0].name of their powers.`;
							V().action.act = ``+
							`<<for _effect range $target[0].effects>>\
								<<if _effect.buff && !_effect.sticky>>\
									<<print target().removeEffect(_effect)>>\
								<</if>>\
							<</for>>`;
							this.cd.set("Dispel Magick",4);
							return;
						}
					}
					if (act <= 50) {
						var count = [];
						V().enemies.forEach(function(enemy,i){
							count.push(0);
							enemy.effects.forEach(function(effect){
								if (!effect.buff && (effect.duration > 0)){
									/* if ailment and curable */
									count[i]++;
								}
							});
						});
						if (count[1] > 0 && (count[1] >= count[0])){
							/* If Mabel has any ailments and more ailments than Dipper, Dipper will always heal her */
							V().target[0] = V().enemies[1];
						} else if (count[0] > 0) {
							/* If first check failed, Dipper must have more ailments than Mabel; if he has any ailments, he will always heal himself. */
							V().target[0] = V().enemies[0];
						} else {
							/* If no one has ailments, target is random */
							$.wiki('<<allytarget>>');
						}
						V().action = new Action();
						V().action.effweight = 0.4;
						V().action.dur = 3;
						act = random(1,3);
						var boost;
						if (act == 1) {
							V().action.useText = `Dipper frantically flips through his journal before yelling, "Narokath Santak Chattur'gha!"`;
							V().action.actText = `$target[0].name pulses with a violent red light.`;
							boost = "DEF";
						} else if (act == 2) {
							V().action.useText = `Dipper frantically flips through his journal before yelling, "Narokath Santak Ulayoth!"`;
							V().action.actText = `$target[0].name glows with the deep blue of the abyss.`;
							boost = "ATK";
						} else if (act == 3) {
							V().action.useText = `Dipper frantically flips through his journal before yelling, "Narokath Santak Xel'lotath!"`;
							V().action.actText = `$target[0].name shines with a green light that hurts to look at.`;
							boost = "SPC";
						}
						V().action.act = `\
						<<for _effect range $target[0].effects>>\
							<<if !_effect.buff>>\
								<<set _effect.duration -= 1>>\
								<<if _effect.duration == 0>>\
									<<print target().removeEffect(_effect)>>\
								<</if>>\
							<</if>>\
						<</for>>\
						<<addeffect $target[0] "${boost} Boost" $action.dur $subject[0]>>`;
					}
					else if (act <= 75 && act > 50) {
						$.wiki('<<enemytarget "debuff">>');
						V().action = new Action();
						V().action.weight = 0.8;
						V().action.effweight = 0.6;
						V().action.dur = 3;
						act = random(1,3);
						if (act == 1){
							V().action.useText = `Dipper frantically flips through his journal before yelling, "Bankorok Redgemor Chattur'gha!"`;
							V().action.actText = `Pillars of red energy burst from the ground under $target[0].name like claws, searing their flesh where they touch.`;
							V().action.act = dmgandeffect('t',"Pain");
						} else if (act == 2){
							V().action.useText = `Dipper frantically flips through his journal before yelling, "Bankorok Redgemor Ulayoth!"`;
							V().action.actText = `Waves of blue energy pulse around $target[0].name and chill them with a numbing cold.`;
							V().action.act = dmgandeffect('t',"Injury");
						} else if (act == 3){
							V().action.useText = `Dipper frantically flips through his journal before yelling, "Bankorok Redgemor Xel'lotath!"`;
							V().action.actText = `The floor under $target[0].name flashes with a sickening green energy that makes your vision swim.`;
							V().action.act = dmgandeffect('t',"Headache");
						}
					}					
					else if (act <= 100 && act > 75) {
						$.wiki('<<enemytarget "ignore downed">>');
						V().action = new Action("Bind Creature");
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
								case "Mage":
								case "Cleric":
									god = "Xel'lotath";
									break;									
							}
						V().action.weight = 0.7;
						V().action.useText = `Dipper frantically flips through his journal before yelling, "Bankorok Aretak ${god}!`;
						V().action.actText = `$target[0].name is lashed by chains of light.`;
						V().action.act = dmgandeffect('t',"Stunned",1);
					}
					
					} /*end loop*/
					return;
				}
				break;
			
			case "Mabel":
				super(name,
						/* hp */	1500,
						/* atk */	[40,
						/* def */	25,
						/* spc */	25],
						/* pr */	'F'
						);
				
				this.elements = new Map([
					["black", 1],
					["white", 1],
					["red", 0.5],
					["blue", 2],
					["yellow", -2]
				]);
				this.setTol("Ailment",true);
				this.setTol("Effect",1);
				this.cd = new Map([
					["Glitter Bomb",0]
					]);
				this.actions = function () {
					while (V().action === null){
						var act = random(1,100);
					
					/* Mabel is a simple soul, so she just picks from five attacks randomly with even chances. */
					
					/* Mabel is blaster caster. She has two DoT attacks, one for Poison and one for Burning. Due to the imbalance between her ATK and SPC, they are designed to be mainly heavy initial hits with minor DoT, to ease players into the concept before the fight with Bill, who will invert the dynamic. She also has a Dizzy attack, just because I loved the idea of a "Glitter Bomb" attack and that was the logical ailment for it. Since this is a hold effect, it has a one-turn cooldown to prevent her from incapacitating the whole party with lucky rolls. For pure damage, she has a 3-hit spread attack as well as a regular attack that actually functions effectively as more of a breather, as it's not significantly stronger than her DoT attacks. */
					
					if (act <= 20){
						$.wiki('<<enemytarget>>');
						V().action = new Action("Cuteness Poisoning");
						V().action.weight = 1;
						V().action.effweight = 0.3;
						V().action.dur = 3;
						V().action.actText = function () {return ``+
`Mabel conjures an image of a kitten... no, wait, <i>two</i> kittens? And they're riding on a <i>puppy</i>? Omigosh, it's so cute you could just <i>DIE!</i>`;};
						V().action.act = dmgandeffect('t',"Poisoned");
					}
					else if (act <= 40 && act > 20) {
						$.wiki('<<enemytarget>>');
						V().action = new Action("Galacta Burning");
						V().action.weight = 1;
						V().action.effweight = 0.3;
						V().action.dur = 3;
						V().action.actText = function () {return ``+
`Mabel points her hands at you, and multicolored cartoon stars fly from her fingertips, leaving glittering trails behind them. When they run into ${target().name} they explode in a fiery burst, as hot as if they were real stars.`;};
						V().action.act = dmgandeffect('t',"Burning");
					}
					else if (this.cd.get("Glitter Bomb") < 0 && act <= 60 && act > 40) {
						$.wiki('<<enemytarget>>');
						V().action = new Action("Glitter Bomb");
						V().action.weight = 1;
						V().action.dur = 3;
						V().action.actText = function ()  {return ``+
`Out of nowhere, Mabel summons a dazzling, multicolored ball of sparkles and glitter. With a manic laugh she throws it at $target[0].name, and it explodes with a blinding firework of color!`;};
						V().action.act = dmgandeffect('t',"Dizzy")
						this.cd.set("Glitter Bomb",1);
					}
					else if (act <= 80 && act > 60) {
						$.wiki('<<enemytarget>>');
						V().action = new Action("Chaos Blaster");
						V().action.weight = 1;
						V().action.actText = function ()  {return ``+
`You blink, and Mabel is suddenly holding a massive gun absolutely drowning in glitter and unicorn decals. She triumphantly points it at $target[0].name and shouts, "CHAOS... BLASTERRR!!" A shimmering, multicolored beam erupts from the cannon before it explodes magnificently in a burst of glitter.`;};
						V().action.act = justdmg;
					}
					else if (act > 80) {
						$.wiki('<<enemytarget>>');
						V().action = new Action("Kitty Cannon");
						V().action.weight = 0.7;
						V().action.actText = function ()  {return ``+
`Mabel's fists are suddenly replaced with mewling kittens. Just as you're trying to guess what tactical advantage this could possibly provide, they fly at your puppets like missiles!`;};
						V().action.act = function ()  {return `<<multihit 3 "spread">>`;}
					}
					
					} /* end loop */
					return;
				}
				break;
			
			/* see changeInto for their super versions */
			
			/* Adventure Time 1 */
			case "Finn":
				super(name,
						/* hp */	750,
						/* atk */	[50,
						/* def */	25,
						/* spc */	15],
						/* pr */	'M'
						);					
				this.actions = function () {
					while (V().action === null){
						var act = random(1,2);
						
					/* Finn smash. Half the time he will do a regular attack, and half the time he will mimic Fighter's Charge. No further logic, because he is a doofus with no concern for his own safety. */
					
					if (act == 1) {
						$.wiki('<<enemytarget>>');
						V().action = new Action("Sword");
						V().action.actText = "Finn swings his sword wildly!";
						V().action.useText = null;
					} else if (act == 2) {
						$.wiki('<<enemytarget>>');
						V().action = new Action("Charge");
						V().action.actText = "Finn charges in recklessly!";
						V().action.useText = null;
					}
						
					} /* end loop */
					return;
				}
				break;
			
			case "Jake":
				super(name,
						/* hp */	750,
						/* atk */	[25,
						/* def */	40,
						/* spc */	25],
						/* pr */	'M'
						);					
				this.cd = new Map([
					["Below the Belt",0],
					["Dead Ringer",0],
					["Trip",0]
					]);
				this.actions = function () {
					console.log("At turn start, action = "+V().action);
					while (V().action === null){
						var act = random(1,100);
						console.log(`Jake act = ${act}`);
						
					/*
					Jake is a dual-class Fighter/Rogue. He always protects someone if they're at less than half health (but prioritizes Finn because he cares about him more). From there his breakdown is:
					25%: Martyr (if viable)
					10%: stun
					20%: Below the Belt
					20%: Dead Ringer
					10%: AoE Off-Balance
					15%: regular attack
					
					He therefore has a higher chance of tanking than any other individual action, but will use debuff attacks most of the time. However, his attacks have long cooldowns, so on any given turn his chances might break down differently.
					*/
					
					if (V().enemies[2].hp < (V().enemies[2].maxhp / 2) && !V().enemies[2].dead && !this.protector && act <= 30){ /* If Finn is below 50% HP */
						V().target[0] = V().enemies[2];
						V().action = new Action("Protector");
						V().action.actText = `Jake wraps himself around $target[0].name like a suit of armor.`;
					}
					else if (V().enemies[1].hp < (V().enemies[1].maxhp / 2) && !V().enemies[1].dead && !this.protector && act <= 30){ /* If Bubblegum is below 50% HP */
						V().target[0] = V().enemies[1];
						V().action = new Action("Protector");
						V().action.actText = `Jake wraps himself around $target[0].name like a suit of armor.`;
					}
					else if (!V().enemies[1].dead && !V().enemies[2].dead && act <= 25){
						console.log("Martyr branch")
						V().action = new Action("Martyr");
						V().action.actText = `Jake stretches himself into a huge wall of flesh, covering the others from your attacks!`;
					}
					else if (act <= 40 && act > 30){
						console.log("Stun branch")
						$.wiki('<<enemytarget "ignore downed">>');
						if (!target().alert && !target().chi && !target().stasis){ /* Unlike most enemies, Jake is a hardened criminal and smart enough not to try to stun an alert character. */
							console.log("Target valid");
							V().action = new Action("Something in your eye");
							action().useText = null;
							action().actText = `Jake stretches out towards $target[0].name and wraps around and around until they can't move!`;
						}
					}
					else if (this.cd.get("Below the Belt") < 0 && act <= 60 && act > 40){
						console.log("Below the Belt branch")
						$.wiki('<<enemytarget "debuff">>');
						V().action = new Action("Below the Belt");
						action().actText = `Jake raises his fists as if to punch $target[0].name, but instead his legs snap out to hit them right in the knees.`;
						this.cd.set("Below the Belt",2);
					}
					else if (this.cd.get("Dead Ringer") < 0 && act <= 80 && act > 60){
						console.log("Dead Ringer branch")
						$.wiki('<<enemytarget "debuff">>');
						V().action = new Action("Dead Ringer");
						action().actText = `Jake stretches around behind $target[0].name before they can react, and whacks them hard on the back of the head.`;
						this.cd.set("Dead Ringer",2);
					}
					else if (this.cd.get("Trip") < 0 && act <= 90 && act > 80){
						console.log("Trip branch")
						V().action = new Action("Trip");
						V().action.useText = null;
						V().action.actText = `Jake stretches his arms into whips and trips everyone up!`;
						V().action.act = function () {return ``+
						`<<for _puppet range $puppets>>`+
							`<<addeffect _puppet "Off-Balance" 1>>`+
						`<</for>>`;}
						this.cd.set("Trip",2);
					}
					else {
						console.log("Default attack branch")
						V().action = new Action();
						V().action.weight = 1;
						V().action.useText = null;
						V().action.actText = `Jake attacks!`;
						V().action.act = justdmgenemy;
					}
					
					if (V().action === null) {
						console.log("Action null, should reroll");
					} else {
						console.log("At loop end, action = "+V().action.name);
					}
						
					} /* end loop */
					return;
				}
				break;
				
			case "Princess Bubblegum":
				super(name,
						/* hp */	1500,
						/* atk */	[20,
						/* def */	35,
						/* spc */	35],
						/* pr */	'F'
						);					
				this.ready = false;
				this.cd = new Map([
					["mass buff",0],
					["Chi Shield",0]
					]);
				this.actions = function () {
					while (V().action === null){
						var act = random(1,100);
						
					/*
					Bubblegum delegates to her subordinates instead of doing stuff directly. She will always use a mass buff ability if she is able, but must wait for the buffs to expire before she can use one again, so she can't just stack buffs until the enemies are unstoppable. On her off-turns, she can freely use single-target buff drugs (weaker than the player's for balance purposes) and bestow Chi Shield (with a cooldown since it's so hard to remove). Rarely, she will attack by throwing bombs, but must spend a turn to make one first. (Bombs get second priority after mass buffs if she has one ready.)
					
					50%: use drugs
					25%: Chi Shield
					25%: ready a bomb					
					*/
					
					if (this.cd.get("mass buff") < 0) {
						act = random(1,3)
						switch (act) {
							case 1:
								V().action = new Action("Call to Arms");
								V().action.act = function () {
									return `<<for _enemy range $enemies>>`+
										`<<addeffect _enemy "ATK Boost" $action.dur $subject[0]>>`+
										`<</for>>`;
									}
								break;
							case 2:
								V().action = new Action("Walled City");
								V().action.act = function () {
									return `<<for _enemy range $enemies>>`+
										`<<addeffect _enemy "DEF Boost" $action.dur $subject[0]>>`+
										`<</for>>`;
									}
								break;
							case 3:
								V().action = new Action("Age of Enlightenment");
								V().action.act = function () {
									return `<<for _enemy range $enemies>>`+
										`<<addeffect _enemy "SPC Boost" $action.dur $subject[0]>>`+
										`<</for>>`;
									}
								break;
						}
						this.cd.set("mass buff",2);
					}
					else if (this.ready) {
						act = random(1,2)
						if (act == 1) {
							$.wiki('<<enemytarget>>');
							V().action = new ItemAction("Grenade");
							V().action.weight = 1;
							V().action.useText = null;
							V().action.actText = `Princess Bubblegum throws what appears to be a giant peppermint, but as soon as it hits the ground it explodes with the force of a grenade, spreading hard candy shrapnel everywhere.`;
							V().action.act = grenade('p');
						}
						else if (act == 2) {
							$.wiki('<<enemytarget "ignore downed" "debuff">>');
							V().action = new Action();
							V().action.effweight = 0.8;
							V().action.dur = 4;
							V().action.useText = null;
							V().action.actText = `Princess Bubblegum douses $target[0].name in a stinging, sticky syrup. They cough and stagger as their skin breaks out in welts.`;
							V().action.act = justeffect('t',"Poisoned");
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
							V().target[0] = hitlist[t];
							act = random(1,3)
							switch (act) {
								case 1:
									V().action = new ItemAction("Adrenaline");
									V().action.dur = 2;
									V().action.effweight = 0.4;
									V().action.act = justeffect('t',"ATK Boost");
									break;
								case 2:
									V().action = new ItemAction("Stoneskin");
									V().action.dur = 2;
									V().action.effweight = 0.4;
									V().action.act = justeffect('t',"DEF Boost");
									break;
								case 3:
									V().action = new ItemAction("Nootropic");
									V().action.dur = 2;
									V().action.effweight = 0.4;
									V().action.act = justeffect('t',"SPC Boost");
									break;
							}
						}
					}
					else if (this.cd.get("Chi Shield") < 0 && act <= 75 && act > 50) {
						$.wiki('<<allytarget "buff">>');
						if (target() !== null){
							V().action = new Action();
							V().action.dur = 2;
							V().action.useText = null;
							V().action.actText = function () {
								var str;
								if (V().target[0] == subject()){
									str = "her becomes";
								} else {
									str = "$target[0].name is";
								}
								return `$subject[0].name presses a button, the air around ${str} surrounded by a force field.`
							}
							V().action.act = justeffect('t',"Chi Shield");
							this.cd.set("Chi Shield",1);
						}
					}
					else {
						V().action = new Action();
						V().action.useText = null;
						V().action.actText = `Princess Bubblegum pulls something out of her pack.`;
						V().action.act = `Something has changed...`;
						this.ready = true;
					}
						
					} /* end loop */
					return;
				}
				break;
			
			/* Gumball 1 */
			case "Gumball":
				super(name,
						/* hp */	1000,
						/* atk */	[20,
						/* def */	40,
						/* spc */	30],
						/* pr */	'M'
						);					
				this.surrender = function () {
					V().action = {
						useText: null,
						actText: ``+
`Gumball laughs so hard he cries. "Wow! Wow, I really don't have to..." His expression snaps to suspicion with unsettling speed, and his head darts from side to side like a bird's. "This isn't a trick, is it? You're not gonna stab me in the back? I'm not gonna trip and break my neck? An anvil's not gonna fall from the sky?"
						
He cowers for several seconds, but nothing happens. After a few more moments, he gingerly cracks an eye open. A heartbeat later, he's suddenly jumping wildly up and down, cackling frenziedly. "Ahahaha! Yes! <i>Yes!</i>" He raises his fist in triumph. "Guess who didn't get beaten to a pulp today? That's right, ME! Suck on that, Universe! SUCK! ON! TH--"

Gumball slips on a stray pebble, falls back, hits his head, and is instantly knocked unconscious.`,
					act: null};
					target().dead = true;
					V().kills.push("Gumball");
					V().surrender = false;
				}
				this.surrenderFail = function () {
					V().surrender = false;
					return `Gumball sighs. "Well, it was worth a shot." He raises his fists, but halfheartedly. "Hey, you never know. Maybe I'll get lucky for once. Stranger things have happened!"`;
				}
				this.actions = function () {
					if (V().surrender){
						V().action = {useText: null, act: null, actText: `Gumball is watching you expectantly.`};
					}
					else {
					
					while (V().action === null){
						var act = random(1,100);
					
					/*
					Gumball is intended to be a wild card. His behavior is highly random and his actions vary wildly in usefulness, from knocking himself down to an AoE nuke. Most of his attacks are rogueish, because he is a bratty troublemaker. However, unlike most enemies he does not use smart targeting for his debuffs, because he is also an idiot.
					
					5%: self-inflict Knocked Down
					5%: skip turn
					10%: hide
					10%: stun all except himself
					10%: stun
					10%: gimped Below the Belt
					10%: damage + Winded
					40%: use item
					-5%: skip turn
					-20%: attack
					-20%: SPC Boost
					-20%: DEF Boost
					-15%: hit all, including allies
					-5%: hit all, high damage					
					*/
					
					if (act <= 5) {
						V().action = new Action();
						V().action.useText = null;
						V().action.actText = `Gumball doesn't feel like doing anything this turn.`;
						V().action.act = `$subject[0].name does nothing!`;
					}
					else if (act <= 10 && act > 5) {
						V().action = new Action();
						V().action.useText = null;
						V().action.actText = `Gumball trips over his own feet!`;
						V().action.act = justeffect('s',"Knocked Down",-1);
					}
					else if (!V().enemies[1].dead && !V().enemies[2].dead && !this.untargetable && act <= 20 && act > 10) {
						V().action = new Action("Sneak");
						V().action.useText = null;
						V().action.actText = `Gumball's eyes flick from side to side. When he thinks no one is watching him, he slinks away from the fight.`;
					}
					else if (act <= 30 && act > 20) {
						V().action = new Action("screech");
						V().action.useText = null;
						V().action.actText = `Gumball lets out an ear-splitting screech! Everyone has to stop what they're doing to clamp their hands over their ears.`;
						V().action.act = `<<for _t = 1; _t < V().enemies.length; _t++>>`+
											`<<addeffect $enemies[_t] "Stunned" 1>>`+
										`<</for>>`+
										`<<for _puppet range $puppets>>`+
											`<<addeffect _puppet "Stunned" 1>>`+
										`<</for>>`;
					}
					else if (act <= 40 && act > 30) {
						$.wiki('<<enemytarget "ignore downed">>');
						V().action = new Action("Something in your eye");
						V().action.useText = null;
						V().action.actText = `Gumball spits in $target[0].name's eyes!`;
					}
					else if (act <= 50 && act > 40) {
						$.wiki('<<enemytarget>>');
						V().action = new Action("Below the Belt");
						V().action.weight = 0.9;
						V().action.effweight = 0.3;
						V().action.useText - null;
						V().action.actText = `Gumball kicks $target[0].name in the shins!`;
					}
					else if (act <= 60 && act > 50) {
						$.wiki('<<enemytarget>>');
						V().action = new Action();
						V().action.weight = 0.9;
						V().action.dur = 3;
						V().action.useText = null;
						V().action.actText = `Gumball rushes forward and punches $target[0].name hard in the gut, leaving them gasping.`;
						V().action.act = dmgandeffect('t',"Winded");
					}
					else {
						V().action = new ItemAction();
						V().action.useText = `Gumball rummages through his pockets...`;
						act = random(1,20); /* rolling a d20, as is custom */
						if (act == 1) {
							// critical fail: gumball
							V().action.actText = `...and only finds a gumball. He giggles to himself and sticks it to the arena wall with a mischevious grin. In the process, he seems to have forgotten about attacking you.`;
							V().action.act = null;
						}
						else if (act > 1 && act <= 6) {
							// 5 in 20: rubber band (effectively a weaker Throwing Knife)
							$.wiki('<<enemytarget>>');
							V().action.weight = 1;
							V().action.actText = `...and retrieves a thick rubber band. "Oh, awesome!" he says, his face lighting up. He looks at you with a predatory glint in his eyes. "Hey," he says with a smirk, stretching the band between his fingers like a slingshot. "Wanna see a trick?"`;
							V().action.act = justdmg;
						}
						else if (act > 6 && act <= 11) {
							// 5 in 20: candy bar
							V().action.effweight = 0.4;
							V().action.dur = 3;
							V().action.actText = `...and retrieves a brightly-wrapped candy bar. "Oh, awesome! I forgot I had this!" He downs the whole thing in a few bites. You dread the sugar high he's going to get...`;
							V().action.act = justeffect('s',"SPC Boost");
						}
						else if (act > 11 && act <= 16) {
							// 5 in 20: protein bar
							V().action.effweight = 0.4;
							V().action.dur = 3;
							V().action.actText = `...and pulls out a protein bar. He glares at it as if its existence offends him, then nonchalantly shrugs and takes a bite. "Food's food," he says.`;
							V().action.act = justeffect('s',"DEF Boost");
						}
						else if (act > 16 && act <= 19) {
							// 3 in 20: angry cat
							V().action.weight = 0.8;
							V().action.actText = `...and pulls out a thin, mangy cat.
							
He screams and drops it, much to the cat's displeasure. "How did that even fit in there?! No -- wait -- good kitty -- AAAAHHHH!"`;
							V().action.act = `<<for _enemy range $enemies>>`+
												`<<set $target[0] = _enemy>>`+
												`<<echodamage>>`+
											`<</for>>`+
											`<<for _pupppet range $puppets>>`+
												`<<set $target[0] = _puppet>>`+
												`<<echodamage>>`+
											`<</for>>`;
						}
						else if (act == 20) {
							// critical success: neutrino bomb
							V().action.weight = 1.5;
							V().action.actText = `...and pulls out a neutrino bomb?!
							
He yelps and throws the beeping thing up into the air, but catches it before it hits the ground. "Why do I even have this?!" he yells, then shakes his head. "Whatever, don't look a gift horse in the mouth! CATCH!"

<i>BOOM.</i>`
							V().action.act = `<<for _puppet range $puppets>>`+
												`<<set $target[0] = _puppet>>`+
												`<<echodamage>>`+
											`<</for>>`;
						}
					}
						
					} /* end loop */
					
					} /* end surrender if */
					return;
				}
				break;
				
			case "Anais":
				super(name,
						/* hp */	1000,
						/* atk */	[25,
						/* def */	15,
						/* spc */	50],
						/* pr */	'F'
						);					
				this.ready = false;
				this.cd = new Map([
					["Flamethrower",0],
					["Gas Bomb",0],
					["Chaff",0],
					["Calamity Bomb",0]
					]);
				this.surrender = function () {
					V().action = {
						useText: null,
						actText: ``+
`You order $subject[0].name forward. They grasp Anais' hand, bending down to do so, and she shakes it firmly.

"That's it," Anais says. "I'm glad we could resolve this like civilized -- PSYCHE!!"

Before you can react, Anais pulls out a comically large syringe and stabs it into $subject[0].name, cackling maniacally. She leaps away as they stagger back.

"Did you REALLY think I'd just let you win after what you did to my brothers?!" she screams. "Wattersons never give up! And now, that poison will give you a heart attack in three... two... one!"

Without fanfare, $subject[0].name falls to the ground like a puppet with its stings cut. Which, you suppose, is pretty accurate.`,
						act: `<<set $subject[0].hp to 0>><<deathcheck $subject[0]>><<set $anais_trap = true>>`
					}
					V().surrender = false;
				}
				this.surrenderFail = function () {
					V().surrender = false;
					return `"Eh, it was worth a shot." Anais steps back. "Alrighty then. Let's finish this your way, you barbarian."`;
				}
				this.actions = function () {
					if (V().surrender) {
						V().action = {useText: null, act: null, actText: `Anais is waiting for your decision.`};
					}
					else {
					
					while (V().action === null){
						var act = random(1,3);
						
					/*
					Anais is the squishy wizard and the opposite of Gumball: her behavior is extremely predictable and consistent. She spends one turn making a bomb, then uses it the next turn. Rarely, she will use a regular attack instead; this is intended as a breather due to her low Attack.
					
					1/3: attack
					2/3: make bomb
					-20%: grenade
					-20%: flamethrower
					-20%: gas bomb
					-20%: calamity bomb
					-20%: chaff grenade (Dizzy mass attack)
					*/
					
					if (this.ready) {
						act = random(1,5);
						
						if (act == 1){
							$.wiki('<<enemytarget>>');
							V().action = new ItemAction("Grenade");
							V().action.actText = `Anais lobs a grenade at you!`;
							V().action.act = grenade('p');
						}
						else if (this.CDcheck("Flamethrower") && act == 2){
							V().action = new ItemAction("Flamethrower");
							V().action.actText = `Anais pulls out a flamethrower! You barely have time to wonder how she got it before she starts shooting fire in all directions.`;
							V().action.act = massAttack('p',"Burning",this.dur);
							this.cd.set("Flamethrower",4);
						}
						else if (this.CDcheck("Gas Bomb") && act == 3){
							V().action = new ItemAction("Gas Bomb");
							V().action.actText = `Anais pulls a gas mask over her face. You barely have time to wonder where she got it from before she throws something that bursts into a cloud of stinging green gas.`;
							V().action.act = massAttack('p',"Poisoned",this.dur);
							this.cd.set("Gas Bomb",4);
						}
						else if (this.CDcheck("Calamity Bomb") && act == 4){
							$.wiki('<<enemytarget "debuff">>');
							V().action = new ItemAction("Calamity Bomb");
							V().action.actText = `Anais pulls out a scroll that pulses with dark runes. She throws it at $target[0].name, where it explodes in a cloud of cursed magic.`;
							this.cd.set("Calamity Bomb",4);
						}
						else if (this.CDcheck("Chaff") && act == 5){
							V().action = new ItemAction("Chaff Grenade");
							V().action.weight = 1;
							V().action.dur = 3;
							V().action.actText = `Anais lobs a grenade at you -- but to your surprise, when it explodes it leaves a massive cloud of shiny metal flakes. It just looks like silly confetti to you, but your puppets stutter and freeze up trying to see through all the flashing lights!`;
							V().action.act = massAttack('p',"Dizzy");
							this.cd.set("Chaff",4);
						}
						this.ready = false;
					}
					else if (act <= 2){
						V().action = new Action();
						V().action.useText = null;
						V().action.actText = `Anais turns around and builds something you can't see.`;
						V().action.act = `Something has changed...`;
						this.ready = true;
					}
					else {
						$.wiki('<<enemytarget>>');
						V().action = new Action();
						V().action.weight = 1;
						V().action.useText = null;
						V().aciton.actText = `Anais slaps $target[0].name.`;
						V().action.act = justdmg;
					}
					
					} /* end loop */
					
					} /* end surrender if */
					return;
				}
				break;
				
			case "Darwin":
				super(name,
						/* hp */	1000,
						/* atk */	[35,
						/* def */	30,
						/* spc */	25],
						/* pr */	'M'
						);					
				this.cd = new Map([
					["Dance",0],
					["Dizzy",0],
					["Moralize",0]
					]);
				this.actions = function () {
					while (V().action === null){
						var act = random(1,100);
						
					/*
					Darwin is a dual-class Rogue/Fighter, with more emphasis on Rogue. He uses a regular attack most of the time, but has access to several debuffs Gumball lacks.
					
					30%: regular attack
					30%: Protector
					10%: Off Your High Horse
					10%: piercing attack
					10%: Dizzy attack
					10%: mass Injury
					*/
					
					if (act <= 30){
						$.wiki('<<enemytarget>>');
						V().action = new Action();
						V().action.weight = 1;
						V().action.useText = null;
						V().aciton.actText = `Darwin punches $target[0].name!`; /* This is a purposeful contrast with Gumball's low kick */
						V().action.act = justdmg;
					}
					else if (!this.protector && !(V().enemies[0].dead && V().enemies[1].dead) && act <= 60 && act > 30){ /* disqualified if Darwin is only one left */
						var t;
						if (V().enemies[0].dead){
							t = 0;
						} else if (V().enemies[1].dead){
							t = 1;
						} else {
							t = random(0,1);
						}
						V().target[0] = V().enemies[t];
						V().action = new Action("Protector");
						V().action.actText = `Darwin heroically leaps in front of $target[0].name, protecting $target[0].them from attacks.`;
					}
					else if (act <= 70 && act > 60){
						$.wiki('<<dispeltarget 1>>');
						if (State.temporary.go){
							V().action = new Action("Off Your High Horse");
							V().action.actText = `Darwin leaps and attacks with a roundhouse kick that knocks off V().target[0].name's magic!`;
						}
					}
					else if (this.CDcheck("Dance") && act <= 80 && act > 70){
						$.wiki('<<enemytarget>>');
						V().action = new Action("Dance Attack");
						V().action.weight = V().pierce_weight;
						V().action.pierce = true;
						V().action.useText = null;
						V().action.actText = `Darwin leaps and twirls in a spectacular dance, the sun shining dazzlingly off his golden scales. It's so captivating, you don't even think to tell your puppet to defend until he's already kicked them in the face.`;
						V().action.act = justdmg;
						this.cd.set("Dance",1);
					}
					else if (this.CDcheck("Dizzy") && act <= 90 && act > 80){
						$.wiki('<<enemytarget>>');
						V().action = new Action("Dancing Strikes");
						V().action.weight = 0.8;
						V().action.dur = 3;
						V().action.actText = `Darwin leaps into the fray with graceful, dancing blows, striking, retreating, and leaping over your puppet to strike again. Not every attack connects, but by the end $target[0].name has had to spin around so much they can't tell which way is up.`;
						V().action.act = `<<multihit 2>><<addeffect $target[0] "Dizzy" $action.dur>>`;
						this.cd.set("Dizzy",1);
					}
					else if (this.CDcheck("Moralize") && act > 90){
						V().action = new Action("Moralize");
						V().action.effweight = 0.6;
						V().action.dur = 3;
						V().action.actText = `Darwin puts on irresistible puppy eyes and makes a seemingly-heartfelt speech about how mean you are for beating him up. You feel uncomfortable, and your puppets hesitate before attacking again.`;
						V().action.act = `<<for _puppet range $puppets>><<addeffect _puppet "Injury" $action.dur $subject[0]>><</for>>`;
						this.cd.set("Moralize",2);
					}
					
					} /* end loop */
					return;
				}
				break;
			
			/* Steven Universe 1 */			
			case "Pearl":
				super(name,
						/* hp */	1000,
						/* atk */	[20,
						/* def */	30,
						/* spc */	40],
						/* pr */	'F'
						);					
				this.deathMessage = `${this.name} poofs!`;
				this.cd = new Map([
					["Fireball",0],
					["pierce",0]
					]);
				this.actions = function () {
					while (V().action === null){
						var act = random(1,100);
						
					/*
					Pearl uses her abilities from Attack the Light: normal damage, stun, DoT, and bit hit. Since the engine is not as well-suited to multi-hit abilities as Attack the Light, these are adjusted: Holo-Pearl is only a 1-turn stun but also inflicts Off-Balance; her spear throw is changed to a piercing attack; and her regular attack is split into a single hit and double hit skill.
					
					10%: attack
					20%: Holo-Pearl
					25%: Fireball (CD 1)
					25%: pierce (CD 1)
					20%: 2 hits spread
					*/
						
					if (act <= 10) {
						$.wiki('<<enemytarget>>');
						V().action = new Action("Sword");
						V().action.actText = `Pearl advances with graceful steps, and thrusts her spear with perfect precision.`;
					}
					else if (act <= 30 && act > 10) {
						$.wiki('<<enemytarget "ignore downed">>');
						if (!target().alert && !target().chi && !target().stasis){
							V().action = new Action("Holo-Pearl");
							V().action.actText = `Pearl twirls and dips, projecting a holographic copy of herself from the gem on her forehead. It rushes at $target[0].name, pushing them away from the battle and locking them in combat.`;
							V().action.act = justeffect('t',"Stunned",1,justeffect('t',"Off-Balance",1));
						}
					}
					else if (this.CDcheck("Fireball") && act <= 55 && act > 30) {
						$.wiki('<<enemytarget>>');
						V().action = new Action("Fireball");
						V().action.weight = 0.8;
						V().action.effweight = 0.7;
						V().action.dur = 3;
						V().action.actText = `Pearl levels her spear like a rifle as white energy swirls around the blade. Pearl fires, and the projectile bursts into searing white flames!`;
						this.cd.set("Fireball",1);
					}
					else if (this.CDcheck("pierce") && act <= 80 && act > 55) {
						$.wiki('<<enemytarget>>');
						V().action = new Action("Comet Strike"); /* Last Scenario reference! */
						V().action.weight = V().pierce_weight;
						V().action.pierce = true;
						V().action.actText = `Pearl stands as still as a statue, staring at $target[0].name with robotic intensity. Then, in the span of an eyeblink, she hurls her spear with so much force the air ignites. It sails through the air with perfect accuracy, and hits $target[0].name right through a chink in their armor.`;
						V().action.act = justdmg;
						this.cd.set("pierce",1);
					}
					else if (act > 80) {
						$.wiki('<<enemytarget>>');
						V().action = new Action("Shooting Stars");
						V().action.weight = 0.8;
						V().action.actText = `Pearl summons a second, identical spear from her forehead, then, with the grace of a dancer, leaps high into the air. She spins, and rains down her spears like thunderbolts from Heaven.`;
						V().action.act = `<<multihit 2 "spread">>`;
					}
					
					} /* end loop */
					return;
				}
				break;
				
			case "Garnet":
				super(name,
						/* hp */	1000,
						/* atk */	[35,
						/* def */	35,
						/* spc */	20],
						/* pr */	'F'
						);					
				this.deathMessage = `${this.name} poofs!`;
				this.cd = new Map([
					["grenade",0],
					["combo",0]
					]);
				this.actions = function () {
					while (V().action === null){
						var act = random(1,100);
						
					/*
					Garnet has all of her abilities from Attack the Light, with the 6-hit-combo obviously downgraded.
					
					30%: attack
					20%: attack + Pain (high damage, low effect)
					25%: grenade (CD 1)
					25%: 2 hit, higher weight than normal (CD 1)
					*/
					
					if (act <= 30){
						$.wiki('<<enemytarget>>');
						V().action = new Action("Sword");
						V().action.useText = `Garnet rushes forward and slams her gauntlet into $target[0].name!`;
					}
					else if (act <= 50 && act > 30){
						$.wiki('<<enemytarget "debuff">>');
						V().action = new Action("Below the Belt");
						V().action.weight = 0.9;
						V().action.effweight = 0.3;
						V().action.dur = 3;
						V().action.useText = null;
						V().action.actText = `Garnet raises her fists above her head, and her gauntlets grow to twice their size. Without missing a beat, she swings forward and crushes $target[0].name under their weight.`;
					}
					else if (this.CDcheck("grenade") && act <= 75 && act > 50){
						$.wiki('<<enemytarget>>');
						V().action = new Action("Explosive Bolt");
						V().action.weight = 1;
						V().action.useText = null;
						V().action.actText = `Garnet sticks her arm straight out, and her gauntlet detaches from her arm, rocketing towards you like a missile! It slams into $target[0].name before exploding in a wide burst.`;
						V().action.act = grenade('p');
						this.cd.set("grenade",2);
					}
					else if (this.CDcheck("combo") && act > 75){
						$.wiki('<<enemytarget>>');
						V().action = new Action("Two-hit Combo");
						V().action.weight = 0.9;
						V().action.useText = null;
						V().action.actText = `Garnet rushes $target[0].name with a two-hit combo!`;
						V().action.act = `<<multihit 2>>`;
						this.cd.set("combo",1);
					}
						
					} /* end loop */
					return;
				}
				break;
				
			case "Amethyst":
				super(name,
						/* hp */	1000,
						/* atk */	[40,
						/* def */	25,
						/* spc */	25],
						/* pr */	'F'
						);					
				this.deathMessage = `${this.name} poofs!`;
				this.cd = new Map([
					["debuff",0],
					["spin",0]
					]);
				this.actions = function () {
					while (V().action === null){
						var act = random(1,100);
						
					/*
					Amethyst is tricky to adapt, because her "lots of tiny hits" skill can't feasibly be adapted at all. I've replaced it with a poisoning attack. Her other abilities work fine, however.
					
					25%: hit all (weak)
					25%: damage + Injury, on par with Rogue's (CD 1)
					25%: damage + Poisoned (more direct dmg than Pearl's Fireball but weaker DoT)
					25%: high damage + Knocked Down (CD 3)
					*/
					
					if (act <= 25){
						V().action = new Action("whip");
						V().action.weight = 0.75;
						V().action.useText = null;
						V().action.actText = `Amethyst lashes her whip in a wide arc, striking all your puppets!`;
						V().action.act = `<<for _puppet range $puppets>><<set $target[0] = _puppet>><<echodamage>><</for>>`;
					}
					else if (this.CDcheck("debuff") && act <= 50 && act > 25){
						$.wiki('<<enemytarget "debuff">>');
						V().action = new Action("A Farewell to Arms");
						action().useText = null;
						action().actText = `Amethyst shapeshifts into a huge, muscled wrestler. She roars and beats her chest, then slams violently into $target[0].name!`;
						this.cd.set("debuff",1);
					}
					else if (act <= 75 && act > 50){
						$.wiki('<<enemytarget>>');
						V().action = new Action();
						V().action.weight = 0.9;
						V().action.effweight = 0.5;
						V().action.dur = 3;
						action().useText = null;
						action().actText = `Amethyst's gem flashes, and her whip suddenly gains a strange, oily sheen. She spins it around and around and then, with a smirk, snaps it out at $target[0].name like a hornet's sting.`;
						V().action.act = dmgandeffect('t',"Poisoned");
					}
					else if (this.CDcheck("spin") && act > 75){
						$.wiki('<<enemytarget "ignore downed">>');
						V().action = new Action("spin ball");
						action().weight = 1.2;
						action().useText = null;
						action().actText = `Amethyst curls up against the ground, and spins her whole body like a wheel. Sparks fly as she builds up speed, then without warning, she rockets straight into $target[0].name, sending them flying!`;
						V().action.act = dmgandeffect('t',"Knocked Down");
						this.cd.set("spin",3);
					}
						
					} /* end loop */
					return;
				}
				break;
				
			case "Steven":
				super(name,
						/* hp */	300,
						/* atk */	[0,
						/* def */	20,
						/* spc */	0],
						/* pr */	'M'
						);					
				this.effects = [new Effect("Guarded",-1,0)];
				this.deathMessage = `${this.name} is knocked unconscious!`;
				this.surrender = function () {
					V().action = {
						useText: null,
						act: null,
						actText: `You let Steven scuttle away with the gems in tow.`
					}
					V().surrender = false;
					V().target.dead = true;
				}
				this.surrenderFail = function () {
					if (target().name == "Steven" && !target().dead){
						var m = random(1,4);
						switch (m){
							case 1:
								return `"Owwww! That hurts!"`;
								break;
							case 2:
								return `"Please stop! I don't want to fight!"`;
								break;
							case 3:
								return `"Wh-why are you doing this?"`;
								break;
							case 4:
								return `Steven starts crying harder.`;
						}
					}
				}
				this.actions = function () {
					if (V().surrender){
						var act = random(1,3)
					
					if (act == 1) {
						V().action = new Action("Bubble");
						V().action.dur = 3;
						V().action.useText = null;
						V().action.actText = `Steven wails, and his gem flashes a bright pink.`;
						V().action.act = justeffect('s',"Bubble");
					}
					else {
						V().action = {useText: null, act: null, actText: `Steven clutches the gems to his chest and blubbers.`};
					}
					
					} else {
					
					while (V().action === null){
						var act = random(1,3);
						
					/* Steven is pure support. He provides weak buffs and occasionally bubble shields. */
					
					if (act <= 2) {
						V().action = new Action("Encouragement");
						V().action.effweight = 1;
						V().action.dur = 3;
						$.wiki('<<allytarget>>');
						switch (target().name){
							case "Pearl":
								V().action.actText = `"Pearl, you got this!" cries Steven. Pearl stands up straighter, and clutches her spear with newfound resolve.`;
								V().action.act = justeffect('t',"ATK Boost");
								break;
							case "Garnet":
								V().action.actText = `"Garnet, you're amazing!" cries Steven. Garnet's mask of stoicism cracks just long enough for her to curl a smile.`;
								V().action.act = justeffect('t',"SPC Boost");
								break;
							case "Amethyst":
								V().action.actText = `"Amethyst, keep it up!" cries Steven. Amethyst whoops and flexes her muscles.`;
								V().action.act = justeffect('t',"DEF Boost");
								break;
						}
					}
					else if (act == 3) {
						V().action = new Action("Bubble");
						V().action.dur = 3;
						V().enemies.forEach(function(enemy,i){
							if (i == 0){
								V().target[0] = enemy;
							} else if (enemy.name == "Steven") {
								/* do nothing */
							} else {
								if (!enemy.dead && (enemy.hp < V().enemies[i-1])) /* target gem with lowest health */ {
									V().target[0] = enemy;
								}
							}
						});
						V().action.useText = null;
						V().action.actText = `"A bubble for your trouble?" Steven lifts his shirt, and you see his gem flash with a pink light.`;
						V().action.act = justeffect('t',"Bubble");
					}
					
					} /* end loop */
					
					} /* end surrender if */
					return;
				}
				break;
				
			case "Nicole":
				super(name,
						/* hp */	2000,
						/* atk */	[100,
						/* def */	30,
						/* spc */	20],
						/* pr */	'F'
						);					
				this.boss = true;
				this.fullname = "Nicole Watterson";
				this.setTol("Injury",1);
				this.cd = new Map([
					["Meditate",0],
					["stun",0],
					["pierce",0],
					["multihit",0]
					]);
				this.mercy = 4; /* Nicole gets to be a little smarter than normal enemies. */
				this.actions = function () {
					while (V().action === null){
						var act = random(1,100);
						var count = 0;
					
					/*
					Nicole is a "rush boss" -- she can dish it out but she can't take it, so one way or another the battle will be over fast. All of her actions revolve around dealing damage: she has a regular attack, a multi-hit attack, a piercing attack, and a damage + winded + prone attack that will make characters more vulnerable. As a monk type, she also has Fighter's Meditate skill to prevent you from exploiting her low Special *too* much.
					
					She uses a separate check for using Meditate. The longer she has to wait for her current effects to expire, the more likely she'll use it. If there are a total of 5 rounds of duration, she will always use it; at 4 rounds, she has an 80% chance of using it; and so on until 20% at 1 round. If Meditate is chosen, the return statement in the if closes the actions function immediately and Meditate is selected as the action. If not, we reroll the act variable to determine her attack.
					
					20%: winded + prone + damage at 0.75 (CD 2)
					20%: 3 hits at 0.6 (CD 4 because multihit is RIDICULOUSLY powerful with her Attack)
					20%: pierce at 0.8 (CD 2)
					40%: regular attack
					
					She should also get Assassin's Riposte, still thinking on how to implement that. Even if I make the text ambiguous, too easy to avoid once player knows what's going on. Thinking I should make it a free action every X turns.
					
					Alternatively, give that to Rose? Since it's dodging attacks, improves survivability -- doesn't fit mechanically with rush boss. Maybe give her Hunter.
					*/
					
					subject().effects.forEach(function(effect){
						if (!effect.buff && !effect.sticky) {
							if (effect.duration >= 0){
								count += effect.duration;
							} else {
								count += 4;
							}
						}
					});
										
					if (this.CDcheck("Meditate") && ((count >= 5) || (count >= 4 && act <= 80) || (count >= 3 && act <= 60) || (count >= 2 && act <= 40) || (count >= 1 && act <= 20))) {
						V().action = new Action("Meditate");
						V().action.actText = `This whole time, Nicole has been quivering with intensity, but now she goes as still as a stone. She places her hand in front of her like a prayer, and closes her eyes.
						
						Her aura flares so brightly you have to shield your eyes. When you look at her again she is staring straight at you, literally glowing with health.`;
						this.cd.set("Meditate",5);
						return;
					}
					
						act = random(1,100);
					
					if (this.CDcheck("stun") && act <= 20) {
						$.wiki('<<enemytarget "ignore downed">>');
						V().action = new Action("Sweep the Leg");
						V().action.weight = 0.75;
						V().action.actText = `Nicole leaps with a flying kick, slamming her heel into $target[0].name's knee with crushing force. It strikes the perfect point to twist the joint with a sickening <i>snap</i>, sweeping their legs clean out and throwing them flat on their back with such force it knocks the breath out of them.`;
						V().action = justdmg(justeffect('t',"Knocked Down",-1,justeffect('t',"Winded",3)));
						this.cd.set("stun",2)
					}
					else if (this.CDcheck("multihit") && act <= 40 && act > 20) {
						$.wiki('<<enemytarget "smart">>');
						V().action = new Action("Camilla Petals Dancing");
						V().action.weight = 0.6;
						V().action.actText = `Nicole leans back slightly, and eyes $target[0].name with a predatory intensity. In the next instant she springs forward like lighting, descending on them with a graceful yet unstoppable flurry of fists.`;
						V().action.act = `<<multihit 3>>`;
						this.cd.set("multihit",4);
					}
					else if (this.CDcheck("pierce") && act <= 60 && act > 40) {
						$.wiki('<<enemytarget "pierce" "ignore downed">>');
						V().action = new Action("Steel Dragon Breaker");
						V().action.weight = 0.8;
						V().action.pierce = true;
						V().action.actText = `Nicole bends her knees slightly, and eyes $target[0].name with a predatory intensity. In the next instant she leaps high into the air, and as she gathers speed you think you see her catch fire like a meteorite. She slams her entire arm down on $target[0].name with a force to shatter steel.`;
						V().action.act = justdmg;
						this.cd.set("pierce",2);
					}
					else {
						$.wiki('<<enemytarget>>');
						V().action = new Action("Lotus Strike");
						V().action.weight = 1;
						V().action.actText = `Nicole's palm snaps out like a spring.`;
						V().action.act = justdmg;
					}
					
					} /* end loop */
					return;
				}
				break;
				
			case "Bill":
				super(name,
						/* hp */	3000,
						/* atk */	[40,
						/* def */	40,
						/* spc */	70],
						/* pr */	'M'
						);					
				this.boss = true;
				this.fullname = "Bill Cipher";
				this.mercy = 0; /* Bill is ruthless */
				this.setTol("Headache",1);
				this.setTol("Curse",1);
				this.cd = new Map([
					["Wild Magic",0],
					["Rain of Fire",0]
					]);
				
				this.actions = function () {
					while (V().action === null){
						var act = random(1,100);
						var count = 0;
						
					/*
					Bill is a bad day. He slowly grinds you down with damage-over-time and hold effects.
					
					Bill's AI is heavy on special attacks.
					
					1) Count the total number of effects on the puppets. If >= 2, (20 + (effects-2)*20)% chance of using Wild Magic, which damages everyone once for every effect on them. CD 2 because this could get nasty if he does it continuously.
					
					2) Check if anyone has protection effects. If yes, Shatter (damage + protection strip on everyone who has it). This is second priority after Wild Magic, so he will ALWAYS do this if you have such an effect active. No cooldown, effectively preventing you from using these effects at all. Should be impossible to trick him into doing this constantly because Chi Shield and Stasis have such high EN costs that you cannot make him do this every turn.
					
					3) Check how many puppets are asleep. (30 * sleepers)% chance of using Nightmare, 1.25 damage on all sleepers. 100% chance if everyone is asleep.
					
					Only then does he enter normal behavior:
					
					40%: hit all (0.6) + Burning (0.5) (CD 2)
					10%: petrification (permanent stun), can only be active on one person at a time for balance purposes
					10%: doom
					20%: sleep
					10%: lock items
					10%: regular attack (0.9 + reduce buff durations by 1)
					*/
					
					V().puppets.forEach(function(puppet){
						count += puppet.effects.length;
					});
					
						var t = 20 + (count-2)*20;
					
					if (this.CDcheck("Wild Magic") && count >= 2 && act <= t){
						V().action = new Action("Wild Magic");
						V().action.weight = 0.7;
						V().action.actText = `Bill cackles maniacally as your magic goes haywire! Every effect on your puppets bursts with unstable energy.`;
						V().action.act = `<<for _puppet range $puppets>><<for _effect range _puppet.effects>><<echodamage>><</for>><</for>>`;
						this.cd.set("Wild Magic",2);
						return;
					}
					
						count = 0;
					
						var shatter = false;
						State.temporary.hitlist = [];
					
					V().puppets.forEach(function(puppet){
						puppet.effects.forEach(function(effect){
							if (effect.name == "Chi Shield" || effect.name == "Stasis"){
								shatter = true;
								State.temporary.hitlist.push(puppet);
							}
						});
					});
					
					if (shatter){
						V().action = new Action("Shatter");
						V().action.weight = 1;
						V().action.actText = `Bill raises a gloved hand, and snaps his fingers. The noise splits through your skull like a gunshot, forcing you to clamp your hands over your ears as the air itself seems to shatter like glass. When you look up, your puppets' protections are gone.`;
						V().action.act = `<<for _puppet range _hitlist>>`+
						`<<set $target[0] = _puppet>><<echodamage>>`+
						`<<for _k, _effect range _puppet.effects>>`+
						`<<if _effect.name == "Chi Shield" || _effect.name == "Stasis">>`+
						`<<print _puppet.removeEffect(_effect,"pierce")>>`+
						`<</if>><</for>><</for>>`;
						return;
					}
					
					V().puppets.forEach(function(puppet){
						if (puppet.asleep){
							count++;
						}
					});
					
					if ((count == 3) || (count == 2 && act <= 60) || (count == 1 && act <= 30)){
						V().action = new Action("Nightmare");
						V().action.weight = 1.2;
						V().action.actText = `Bill closes his eye and raises his hands to... where his temples would be, you think. He glows with a dark, menacing aura, and all your sleeping puppets start writhing in pain, savaged by psychic phantoms.`;
						V().action.act = `<<for _puppet range $puppets>>`+
						`<<if _puppet.asleep>><<echodamage>><</if>>`+
						`<</for>>`;
						return;
					}
					
						act = random(1,100);
					
					if (this.CDcheck("Rain of Fire") && act <= 40){
						V().action = new Action("Rain of Fire");
						V().action.weight = 0.6;
						V().action.effweight = 0.5;
						V().action.dur = 3;
						V().action.actText = `Bill raises his arms skyward and cackles. Flaming rocks fall from the sky like infernal hail, spreading like wildfire where they hit.`;
						V().action.act = `<<for _puppet range $puppets>><<echodamage>><<addeffect $target[0] "Burning" $action.dur $subject[0]>><</for>>`;
						this.cd.set("Rain of Fire",2);
					}
					else if (act <= 50 && act > 40){
						var go = true;
						V().puppets.forEach(function(puppet){
							puppet.effects.forEach(function(effect){
								if (effect.name == "Petrified"){
									go = false;
								}
							});
						});
						if (go){
							$.wiki('<<enemytarget "ignore downed">>');
							V().action = new Action("Stone Gaze");
							V().action.actText = `Bill turns the full force of his huge, all-consuming eye on $target[0].name. The schlera around the slitted pupil glows a sickly, ugly yellow, the color of rotting pus. You see Bill's gaze become a physical force, a cone of light that swallows $target[0].name in its entirety. Before your eyes, you see their flesh turn to stone under that strange light.`;
							V().action.act = justeffect('t',"Petrified",-1);
						}
					}
					else if (act <= 60 && act > 50){
						$.wiki('<<enemytarget "ignore downed">>');
						var go = true;
						if (target().doom){ /* Doom doesn't stack, so no point in reapplying it if target already has it */
							go = false;
						}
						if (go){
							V().action = new Action("Memento Mori");
							V().action.effweight = 0.75;
							V().action.actText = `Bill's eye glows blood-red as he points his finger at $target[0].name.
							
							<b><i>"Die."</i></b>`;
							V().action.act = justeffect('t',"Doom",-1);
						}
					}
					else if (count < 3 && act <= 80 && act > 60){
						/* count carries over from Nightmare check; this won't activate if everyone is asleep */
						$.wiki('<<enemytarget "ignore downed">>');
						while (target().petrified || target().asleep){
							$.wiki('<<enemytarget "ignore downed">>');
						}
						V().action = new Action("sleep");
						V().action.dur = 4;
						V().action.useText = `"I think it's past your bedtime, kid!"`;
						V().action.actText = `Bill snaps his fingers, and target().name is out like a light.`;
						V().action.act = justeffect('t',"Asleep");
					}						
					else if (V().B.embargo <= 0 && act <= 90 && act > 80){
						V().action = new Action("Embargo");
						V().action.useText = null;
						V().action.actText = `Bill stares lazily at something to your side. You trace his gaze just in time to see your pack grow wings and fly away! Bill laughs madly.`;
						V().action.act = `<<set $B.embargo = 4>>Can't use items for 4 turns!`;
					}
					else if (act > 90) {
						$.wiki('<<enemytarget>>');
						V().action = new Action();
						V().action.weight = 0.9;
						V().action.useText = null;
						V().action.actText = `Bill charges forward with a clenched fist, but stops inches away from $target[0].name. Then, almost playfully, he snaps out a finger to flick them in the face.`;
						V().action.act = justdmg(`<<if !target().stasis>><<for _effect range target().effects>><<if _effect.buff && !_effect.sticky>><<set _effect.duration -= 1>><<if _effect.duration == 0>><<print target().removeEffect(_effect)>><</if>><</if>><</for>><</if>>`);
					}
						
					} /* end loop */
					return;
				}
				break;
				
			case "Rose":
				super(name,
						/* hp */	500,
						/* atk */	[65,
						/* def */	35,
						/* spc */	50],
						/* pr */	'F'
						);					
				this.boss = true;
				this.deathMessage = "special";
				this.fullname = "Rose Quartz";
				this.mercy = 4; /* As a war commander, Rose is a smarter tactician than average */
				this.setTol("Pain",1);
				this.setTol("Curse",1);
				this.cd = new Map([
					["Revolution",0],
					["Starlight Flurry",2]
					]);
				this.actions = function () {
					while (V().action === null){
						var act = random(1,100);
						
					/*
					Rose is a multistage boss. This is her first form, offense. Based on Flynn 1 (Last Scenario): has a one-hit, a slightly weaker 2-hit spread, and a 4-hit supermove. She additionally has an AoE attack that reduces buff durations by 1. Like Flynn, she will always use her supermove every 5 turns. Otherwise, her behavior is:
					
					50%: attack, x1
					30%: 2 hit spread, x0.8
					20%: hit all, x0.75, buff durations -1
					*/
					
					if (this.CDcheck("Starlight Flurry")) {
						$.wiki('<<enemytarget>>');
						V().action = new Action("Starlight Flurry"); /* Last Scenario reference! */
						V().action.weight = 0.65;
						V().action.actText = `Rose grasps her sword with both hands, and leans forward slightly. With shocking speed for her size she charges forward, striking before gracefully spinning around to another puppet like a dancer. She brings the sword down again and again in a dazzling flurry of slashes, never allowing your puppets a single opening.`;
						V().action.act = `<<multihit 4 "spread">>`;
						this.cd.set("Starlight Flurry",4);
						return;
					}
					
					if (act <= 30) {
						$.wiki('<<enemytarget>>');
						V().action = new Action("Shooting Stars");
						V().action.weight = 0.8;
						V().action.actText = `Rose jumps high into the air, seemingly weightless. She shoots down like a lightning bolt, sword extended, then uses her momentum to sweep around for another strike. She lands perfectly in her original position, as if she hadn't ever moved.`;
						V().action.act = `<<multihit 2 "spread">>`;
					}
					else if (this.CDcheck("Revolution") && act <= 50 && act > 30) {
						$.wiki('<<dispeltarget 2 "mass">>');
						if (State.temporary.go){
							V().action = new Action("Revolution");
							V().action.weight = 0.75;
							V().action.actText = `Rose grasps her sword firmly and crouches down. She and the sword glow pink, and suddenly she moves with lightning speed in a dazzling twirl, blade sweeping across all your puppets in a wide cleave.`;
							V().action.act = `<<for _puppet range $puppets>><<echodamage _puppet>>`+
							`<<for _effect range _puppet.effects>><<if _effect.buff && !_effect.sticky>><<set _effect.duration -= 1>>`+
							`<<if _effect.duration == 0>><<print _puppet.removeEffect(_effect)>>`+
							`<</if>><</if>><</for>><</for>>`;
							this.cd.set("Revolution",2);
						}
					}
					else {
						$.wiki('<<enemytarget>>');
						V().action = new Action("Sword");
						V().action.actText = `Rose swings her sword with perfect grace.`;
					}
					
					} /* end loop */
					return;
				}
				break;
				
			case "Marceline":
				super(name,
						/* hp */	500,
						/* atk */	[50,
						/* def */	50,
						/* spc */	50],
						/* pr */	'F'
						);					
				this.boss = true;
				this.immortal = true;
				this.fullname = "Marceline the Vampire Queen";
				this.setTol("Poisoned",true);
				this.setTol("Off-Balance",true);
				this.setTol("Curse",2);
				this.actions = function () {
					while (V().action === null){
						
					/*
					Puzzle boss. Can't be killed, but reducing her HP to 0 stuns her for X turns. Solution is Undertale-esque, like in her intro episode you have to entertain her enough that she decides you're friends.
					
					Possibly different method for each puppet.
					-Fighter: aggro abilities draw her attention and make her start a dramatic pose-off, she keeps transforming into bigger monsters to scare you off and you have to do a set of abilities in sequence to get through the pantomime to her satisfaction
					-Rogue/Witch: get her drunk with red wine
					-Bard: tell jokes until she laughs too hard to keep fighting
					*/
						
					} /* end loop */
					return;
				}
				break;
				
			case "PB Champ":
				super("Bonnibel",
						/* hp */	1000,
						/* atk */	[20,
						/* def */	30,
						/* spc */	40],
						/* pr */	'F'
						);					
				this.actions = function () {
					while (V().action === null){
					
					/* Similar to original but can no longer mass buff */
					
					} /* end loop */
					return;
				}
				break;
				
			case "Dipper Champ":
				super("Dipper",
						/* hp */	1000,
						/* atk */	[40,
						/* def */	20,
						/* spc */	30],
						/* pr */	'M'
						);					
				this.actions = function () {
					while (V().action === null){
					
					/*
					Flawless Deduction (Logomancer reference!): Forsaken, exact mimic of Mage's spell
					Appalling Secret (Fallen London reference!): dmg + Poison, analogous to Mage's Fireball
					Anti-Weirdness Field: dispel one
					Chaos Thunder: heavy hit one
					*/
					
					} /* end loop */
					return;
				}
				break;
				
			case "Stevonnie":
				super(name,
						/* hp */	1000,
						/* atk */	[30,
						/* def */	40,
						/* spc */	20],
						/* pr */	'N'
						);					
				this.actions = function () {
					while (V().action === null){
					}
					return;
				}
				break;
				
			case "Gumball Champ":
				super("Gumball",
						/* hp */	1000,
						/* atk */	[30,
						/* def */	30,
						/* spc */	30],
						/* pr */	'M'
						);					
				this.actions = function () {
					while (V().action === null){
					
					/* Similar to original but no longer skips turns */
					
					} /* end loop */
					return;
				}
				break;
			
			default:
				super("Enemy",1000,[10,10,10],'X');
		}
		
		if (this.mercy === undefined){
			this.mercy = 3; /* 1/(mercy) chance of ignoring smart targeting. Set to 1 for always random or 0 for always smart. */
		}
		if (this.boss === undefined){
			this.boss = false;
		}
		if (this.aggro === undefined){
			this.aggro = false;
		}
	}
	}
	
	decCD () {
		if (this.cd !== undefined){
			this.cd.forEach(function(v,k){
				this.cd.inc(k,-1);
			}, this);
		}
	}
	
	CDcheck (key) {
		return (this.cd.get(key) < 0);
	}
	
	changeInto (name) {
		/* Alters character attributes for mid-battle changes. */
		
		switch (name){
			case "Big Dipper":
				this.name = name;
				this.actions = function () {
					while (V().action === null){
						var act = random(1,100);
						
					/*
					Big Dipper gains stronger offense to make up for the loss of Mabel, but still focuses on debuffs and ailments, making him a sort of balanced mage. His Damage Field and Bind Creature go up to weight 1, making them fairly potent attacks, and he gains a full-party damage + Winded spell.
					
					20%: Empowered Dispel Magick
					20%: Empowered Recovery (Mantorok), which grants Blessing
					20%: Empowered Damage Field (Mantorok), which inflicts Curse
					20%: Empowered Bind Creature
					20%: Empowered Magickal Attack
					*/
					
					if (this.cd.get("Dispel Magick") < 0 && act <= 20) {
						$.wiki('<<dispeltarget 4 "mass">>');
						if (State.temporary.go){
							V().action = new Action();
							V().action.useText = `A deep voice intones, "Pargon Nekleth Redgemor Mantorok."`;
							V().action.actText = `Magickal runes swirl around Dipper before crashing violently to the earth, releasing a nauseating wave that dispels everyone's magic.`;
							V().action.act = ``+
							`<<for _puppet range $puppets>>`+
								`<<for _effect range $target[0].effects>>`
									`<<if _effect.buff && !_effect.sticky>>`+
										`<<print _puppet.removeEffect(_effect)>>`+
									`<</if>>`+
								`<</for>>`+
							`<</for>>`;
							this.cd.set("Dispel Magick",4);
							return;
						}
					}
					else if (this.blessing == false && act <= 40 && act > 20) {
						V().action = new Action();
						V().action.effweight = 0.4;
						V().action.dur = 3;
						V().action.useText = `A deep voice intones, "Pargon Narokath Santak Mantorok."`;
						V().action.actText = `Veins of indigo darkness wrap around Dipper like a caress.`;
						V().action.act = ``+
						`<<for _effect range $subject[0].effects>>`+
							`<<if !_effect.buff>>`+
								`<<set _effect.duration -= 1>>`+
								`<<if _effect.duration == 0>>`+
									`<<print subject().removeEffect(_effect)>>`+
								`<</if>>`+
							`<</if>>`+
						`<</for>>`+
						`<<addeffect $subject[0] "Blessing" $action.dur $subject[0]>>`;
					}
					else if (act <= 60 && act > 40) {
						$.wiki('<<enemytarget "debuff">>');
						V().action = new Action();
						V().action.weight = 1;
						V().action.effweight = 0.9;
						V().action.dur = 3;
						V().action.useText = `A deep voice intones, "Pargon Bankorok Redgemor Mantorok."`;
						V().action.actText = `$target[0].name is crushed by a field of violet energy. Though it's only the puppet that was hit, you get a feeling like someone's walked over your grave.`;
						V().action.act = dmgandeffect('t',"Curse");
					}					
					else if (act <= 80 && act > 60) {
						$.wiki('<<enemytarget>>');
						V().action = new Action("Bind Creature");
						V().action.weight = 1;
						V().action.useText = `A deep voice intones, "Pargon Bankorok Aretak Mantorok."`;
						V().action.actText = `$target[0].name is savagely lashed by chains of darkness.`;
						V().action.act = dmgandeffect('t',"Stunned",1);
					}
					else if (act <= 100 && act > 80) {
						V().action = new Action("Magickal Attack");
						V().action.weight = 0.75;
						V().action.dur = 2;
						V().action.useText = `A deep voice intones, "Pargon Antorbok Redgemor Mantorok."`;
						V().action.actText = `Dark lightning leaps from Dipper's feet to strike your puppets in turn. The shock makes them stagger and move erratically, draining their energy.`;
						V().action.act = ``+
						`<<for _puppet range $puppets>>`+
							`<<set $target[0] = _puppet>>`+
							`<<echodamage>>`
							`<<addeffect _puppet "Winded" $action.dur $subject[0]>>`+
						`<</for>>`;
					}
					
					}
					return;
				}
				break;
			
			case "Mega Mabel":
				this.name = name;
				this.actions = function () {
					while (V().action === null){
						var act = random(1,100);
						
					/* The idea behind Mega Mabel is a "sprint to the finish" kind of boss. Her attacks don't get stronger, but they now strike the whole party, making them much harder to defend against and encouraging the player to just rush her before she overwhelms you. Chaos Blaster is also upgraded to a true single-target nuke, meaning it is still possible for her to pick off individuals. */
					
					if (act <= 20){
						V().action = new Action("Cuteness Overload");
						V().action.weight = 0.8;
						V().action.effweight = 0.3;
						V().action.dur = 3;
						V().action.actText = function () {return ``+
`Mabel conjures a huge panorama of impossibly cute things. It's like your own petting zoo in here! There are ducks riding ponies! Puppies snuggling in boxes! Cats doing that thing where they curl their head in their little paws! It's... too much! The cuteness is going to make you EXPLODE!`;};
						V().action.act = ``+
						`<<for _puppet range $puppets>>`+
							`<<set $target[0] = _puppet>>`+
							`<<echodamage>>`
							`<<addeffect _puppet "Poisoned" $action.dur $subject[0]>>`+
						`<</for>>`;
					}
					else if (act <= 40 && act > 20) {
						V().action = new Action("Galacta Blazing");
						V().action.weight = 0.8;
						V().action.effweight = 0.3;
						V().action.dur = 3;
						V().action.actText = function () {return ``+
`Mabel flies up and raises her hands to the stars... and suddenly, the stars seem a whole lot closer. Mabel rains down what looks like the whole galaxy on you, stars bursting into psychedelic sparkles and flames where they hit.`;};
						V().action.act = ``+
						`<<for _puppet range $puppets>>`+
							`<<set $target[0] = _puppet>>`+
							`<<echodamage>>`
							`<<addeffect _puppet "Burning" $action.dur $subject[0]>>`+
						`<</for>>`;
					}
					else if (this.cd.get("Glitter Bomb") < 0 && act <= 60 && act > 40) {
						V().action = new Action("Anarchy Rave");
						V().action.weight = 0.8;
						V().action.dur = 3;
						V().action.actText = function ()  {return ``+
`Mabel rocks out, literally bouncing off the walls with her aerial acrobatics. A disco ball appears out of nowhere and the arena is suddenly ablaze with strobe lights.

And lasers. The disco ball also shoots lasers. The hot, burny kind, not the fun kind.`;};
						V().action.act = ``+
						`<<for _puppet range $puppets>>`+
							`<<set $target[0] = _puppet>>`+
							`<<echodamage>>`
							`<<addeffect _puppet "Dizzy" $action.dur $subject[0]>>`+
						`<</for>>`;
						this.cd.set("Glitter Bomb",2);
					}
					else if (act <= 80 && act > 60) {
						$.wiki('<<enemytarget>>');
						V().action = new Action("Chaos Thunder");
						V().action.weight = 1.25;
						V().action.actText = function ()  {return ``+
`Mabel does her best witchy cackle, letting her hands arc and crackle with electricity. She throws her arms straight up, and the magic shoots into to the sky in a brilliant stream. Then with a final, bellowing laugh, she closes her hand into a fist and brings it down like a hammer.

"CHAOS... THUNDERRR!!"

Lightning splits the air, leaving a wave of multicolored stars around the hapless puppet it fries.`;};
						V().action.act = justdmg;
					}
					else if (act > 80) {
						$.wiki('<<enemytarget>>');
						V().action = new Action("Kitty Cannon");
						V().action.weight = 0.7;
						V().action.actText = function ()  {return ``+
`Mabel's fists are suddenly replaced with mewling kittens. Just as you're trying to guess what tactical advantage this could possibly provide, they fly at your puppets like missiles!`;};
						V().action.act = function ()  {return `<<multihit 3 "spread">>`;}
					}
					
					} /* end loop */
					return;
				}
				break;
			
			case "PB alone":
				this.cd.set("mass buff",-1);
				this.actions = function () {
					while (V().action === null){
						var act = random(1,100);
						
					/*
					PB switches to an offensive role when Jake and Finn are down. Her mass buff is changed to a Blessing, and she is now much more likely to make a bomb. She may also attack regularly, but this is more of a breather due to her low Attack.
					
					25%: attack
					75%: make bomb
					*/
						
					if (this.CDcheck("mass buff")) {
						V().action = new Action("Mandate of Heaven");
						V().action.effweight = 0.4;
						V().action.dur = 4;
						action().actText = null;
						V().action.act = justeffect('s',"Blessing");
						this.cd.set("mass buff",3);
					}
					else if (this.ready) {
						act = random(1,2)
						if (act == 1) {
							$.wiki('<<enemytarget>>');
							V().action = new ItemAction("Grenade");
							V().action.weight = 1;
							V().action.useText = null;
							V().action.actText = `Princess Bubblegum throws what appears to be a giant peppermint, but as soon as it hits the ground it explodes with the force of a grenade, spreading hard candy shrapnel everywhere.`;
							V().action.act = grenade('p');
						}
						else if (act == 2) {
							$.wiki('<<enemytarget "ignore downed" "debuff">>');
							V().action = new Action();
							V().action.effweight = 0.8;
							V().action.dur = 4;
							V().action.useText = null;
							V().action.actText = `Princess Bubblegum douses $target[0].name in a stinging, sticky syrup. They cough and stagger as their skin breaks out in welts.`;
							V().action.act = justeffect('t',"Poisoned");
						}
						this.ready = false;
					}
					else if (act <= 25) {
						$.wiki('<<enemytarget>>');
						V().action = new Action();
						V().action.weight = 1;
						V().action.useText = null;
						V().action.actText = `Princess Bubblegum blasts $target[0].name with her ray gun.`;
						V().action.act = justdmg;
					}
					else {
						V().action = new Action();
						V().action.useText = null;
						V().action.actText = `Princess Bubblegum pulls something out of her pack.`;
						V().action.act = `Something has changed...`;
						this.ready = true;
					}
						
					} /* end loop */
				}
				break;
				
			case "Rose 2":
				this.setBase("Attack",40);
				this.setBase("Defense",60);
				this.changeHP(2000);
				this.cd = new Map([
					["Meditate",0],
					["Revolution",0],
					["injury",0],
					["Downfall",0]
					]);
				this.actions = function () {
					while (V().action === null){
						var act = random(1,100);
						var count = 0;
						
					/*
					Rose's main form: endurance match. Loses her strong multi-hit attacks but gains utility and disabling moves.
					
					Meditate
					Thorns
					-spontaneously: 5% (with other moves)
					-if Attack or Defense lowered: 30%
					-if Attack AND Defense lowered: 50%
					-if Marked: 90%
					15%: Downfall
					10%: Revolution
					10%: Shield Bash: hit one x? + Knocked Down
					10%: poison all (but no damage)
					10%: Guerilla Warfare: Winded all
					20%: A Farewell to Arms: hit all x? + Injury
					20%: regular attack
					*/
					
					subject().effects.forEach(function(effect){
						if (!effect.buff && !effect.sticky) {
							if (effect.duration >= 0){
								count += effect.duration;
							} else {
								count += 4;
							}
						}
					});
										
					if (this.CDcheck("Meditate") && ((count >= 5) || (count >= 4 && act <= 80) || (count >= 3 && act <= 60) || (count >= 2 && act <= 40) || (count >= 1 && act <= 20))) {
						V().action = new Action("Meditate");
						V().action.actText = `Rose closes her eyes and takes a moment to catch her breath. You think you see her glowing slightly.`;
						this.cd.set("Meditate",5);
						return;
					}
					
						act = random(1,100);
						
					if ( ((this.get("Defense") < this.getBase("Defense")) || (this.get("Attack") < this.getBase("Attack")) && act <= 30) || ((this.get("Defense") < this.getBase("Defense")) && (this.get("Attack") < this.getBase("Attack")) && act <= 50) || (this.marked && act <= 90) ){
						V().action = new Action("Thorns");
						action().useText = null;
						action().actText = `Rose grins from ear to ear as her gem flashes a bright pink.`;
						action().act = justeffect('s',"Thorns",3);
						return;
					}
					
						act = random(1,100);
					
					if (act <= 5 && !this.thorns) {
						V().action = new Action("Thorns");
						action().useText = null;
						action().actText = `Rose grins from ear to ear as her gem flashes a bright pink.`;
						action().act = justeffect('s',"Thorns",3);
					}
					else if (act <= 15 && act > 5) {
						$.wiki('<<enemytarget "ignore downed">>');
						V().action = new Action("Shield Bash");
						V().action.weight = 0.8;
						V().action.actText = `Rose rushes forward, but instead of striking with her sword, she slams her shield into $target[0].name like a battering ram.`;
						V().action.act = dmgandeffect('t',"Stunned",1);
					}
					else if (this.CDcheck("Revolution") && act <= 25 && act > 15) {
						$.wiki('<<dispeltarget 2 "mass">>');
						if (State.temporary.go){
							V().action = new Action("Revolution");
							V().action.weight = 0.75;
							V().action.actText = `Rose grasps her sword firmly and crouches down. She and the sword glow pink, and suddenly she moves with lightning speed in a dazzling twirl, blade sweeping across all your puppets in a wide cleave.`;
							V().action.act = `<<for _puppet range $puppets>><<echodamage _puppet>>`+
							`<<for _effect range _puppet.effects>><<if _effect.buff && !_effect.sticky>><<set _effect.duration -= 1>>`+
							`<<if _effect.duration == 0>><<print _puppet.removeEffect(_effect)>>`+
							`<</if>><</if>><</for>><</for>>`;
							this.cd.set("Revolution",1);
						}
					}
					else if (act <= 35 && act > 25) {
						V().action = new Action("Guerilla Warfare");
						V().action.actText = `Rose leads your puppets along an infuriating series of feints, dodges, and near-misses. She doesn't touch them once -- you swear she's toying with you -- but by the end your puppets have been run ragged. She just grins at you, as hale and hearty as ever.`;
						V().action.act = justeffect('p',"Winded",3);
					}
					else if (this.CDcheck("injury") && act <= 55 && act > 35) {
						V().action = new Action("A Farewell to Arms");
						V().action.weight = 1;
						V().action.effweight = 0.6;
						V().action.actText = `Rose hurls her shield like a discus. It flies unerringly to hit every one of your puppets in just the right spot to make them drop their weapons, bouncing off them like they're targets in a pinball machine. When it returns to her, she catches it perfectly.`;
						V().action.act = `<<for _a range $puppets>>`+
						`<<set V().target[0] = _a>>`+
						`<<echodamage>>`+
						`<<addeffect _a "Injury" $action.dur $subject[0]>>`+
						`<</for>>`
						this.cd.set("injury",3);
					}
					else if (this.CDcheck("Downfall") && act <= 70 && act > 55) {
						$.wiki('<<dispeltarget 2>>');
						if (State.temporary.go) {
							V().action = new Action("Downfall");
							action().actText = `Rose gets a glint in her eye, then starts whirling her sword around like a pinwheel. She charges forward, then chains her final spin into a massive overhead cleave, bringing it crashing down on $target[0].name.`;
							this.cd.set("Downfall",2);
						}
					}
					else if (act <= 80 && act > 70) {
						V().action = new Action("Poison Powder");
						V().action.effweight = 0.6;
						V().action.dur = 4;
						V().action.actText = `Rose strikes her sword along the ground, exposing a single crack. Rose closes her eyes, focusing, and a dark green vine suddenly sprouts from the earth. It grows towards your puppets like it has a will of its own, and instantly blooms into dark indigo blossoms just beneath each of your puppets' faces. With a light <i>puff</i>, they let out a strange purple powder that your puppets don't seem to like at all.`;
						V().action.act = justeffect('p',"Poisoned");
					}
					else {
						$.wiki('<<enemytarget>>');
						V().action = new Action("Sword");
						V().action.actText = `Rose swings her sword with perfect grace.`;
					}
						
					} /* end loop */
				}
				break;
			
			case "Rose 3":
				this.hp = 100;
				this.maxhp = 100;
				this.healing = true;
				this.deathMessage = `Rose poofs!`;
				
				this.actions = function () {
					
				/* Final form. After defeat of second form she will stick the party with incurable DoT, giving you a time limit to finish her off in this form. Has a permanent shield that reduces all damage by 50% (?), and all she does is heal herself very slightly. */
					
					V().action = new Action("Defiance");
					V().action.special = 10;
					V().action.actText = `Rose pants heavily, visibly sweating. She doesn't take her eyes off you.`;
					V().action.act = `<<set subject().hp = Math.clamp(subject().hp+$action.special,0,subject().maxhp)>>Rose regains $action.special HP.`;
				}
				break;
			
			default:
		}
	}
	
	surrenderCheck () {
		switch (V().action.name){
			case "rest":
			case "struggle":
			case "spare":
			case "Reload":
				return;
				break;
			default:
				return "\n" + this.surrenderFail();
		}
	}
}

Enemy.prototype.clone = function () {
	// Return a new instance containing our current data.
	return new Enemy(this);
};

Enemy.prototype.toJSON = function () {
	// Return a code string that will create a new instance
	// containing our current data.
	const data = {};
    Object.keys(this).forEach(pn => data[pn] = clone(this[pn]));
    return JSON.reviveWrapper('new Enemy($ReviveData$)', data);
};

