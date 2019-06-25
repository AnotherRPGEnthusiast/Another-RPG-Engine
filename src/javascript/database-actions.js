/* Common action types to make assignments quicker. These are also saved to Twine variables so they can be used in the enemy actions passage. */

var justdmg = (extension) => {
			if (extension === undefined){
				extension = "";
			}
			return `<<echodamage>>`+extension;
}
window.justdmg = justdmg;

var justdmgenemy = (extension) => {
			if (extension === undefined){
				extension = "";
			}
			$.wiki('<<enemytarget>>');
			return `<<echodamage>>`+extension;
}
window.justdmgenemy = justdmgenemy;
		
function multihit (hits,extension) {
			if (extension === undefined){
				extension = "";
			}
			var str = "";
			for (let i = 0; i < hits; i++){
				str += `<<echodamage>>`;
			}
			return str+extension;
		}
window.multihit = function multihit (hits,spread) {
	var str = "";
	if (spread !== undefined){
		str = ` "spread"`;
	}
	return function () {return `<<multihit ${hits}${str}>>`;};
}
		
window.justeffect = function justeffect (target,type,dur,extension) {
			if (extension === undefined){
				extension = "";
			}
			var party;
			if (dur === undefined){
				dur = "$action.dur";
			}
			if (target == 'e' || target == 'mass'){
				party = "$enemies";
			} else if (target == 'p') {
				party = "$puppets";
			} else if (target == 's'){
				target = "$subject[0]";
			} else if (target == 't'){
				target = "$target[0]";
			}
			if (party === undefined) {
				return `<<addeffect ${target} "${type}" ${dur} $subject[0]>>`+extension;
			} else {
				return `<<for _a range ${party}>>`+
				`<<addeffect _a "${type}" ${dur} $subject[0]>>`+
				`<</for>>`+extension;
			}
}
		
window.dmgandeffect = function dmgandeffect (target,type,dur) {
			if (dur === undefined){
				dur = "$action.dur";
			}
			if (target == 's'){
				target = "$subject[0]";
			} else if (target == 't'){
				target = "$target[0]";
			}
			return `<<echodamage>><<addeffect ${target} "${type}" ${dur} $subject[0]>>`;
}

var massAttack = (party,type,dur) => {
	if (party == 'p'){
		party = '$puppets';
	} else if (party == 'e'){
		party = '$enemies';
	}
	return `<<set _cut to ${party}.length>>`+
			`<<for _a range ${party}>>`+
				`<<if _a.dead>>`+
					`<<set _cut -= 1>>`+
				`<</if>>`+
			`<</for>>`+
			`<<for _a range ${party}>>`+
			`<<if _a.dead isnot true and _a.guarded isnot true>>`+
				`<<set $target[0] = _a>>`+
				`<<damagecalc>>`+
				`<<set $dmg = Math.round($dmg/_cut)>>`+
				`<<echodamage "nocalc">>`+
				`<<addeffect $target[0] "${type}" ${dur} $subject[0]>>`+
			`<</if>>`+
		`<</for>>`;
}
window.massAttack = massAttack;
		
var grenade = (party) => {
		if (party == 'p'){
			party = '$puppets';
		} else if (party == 'e'){
			party = '$enemies';
		}
			return `<<echodamage>>`+
			`<<set _temp = $target[0]>>`+
			`<<for _a range ${party}>>`+
			`<<if !_a.dead && _a != _temp && !_a.guarded>>`+
			`<<set $target[0] = _a>>`+
			`<<damagecalc>>`+
			`<<set $dmg = Math.round($dmg/2)>>`+
			`<<echodamage "nocalc">>`+
			`<</if>>`+
			`<</for>>`;
}
window.grenade = grenade;
	

/* Preview functions */
var Prev = {
	effect: function (type,extension) {
		return function () {
			var str;
			if (extension === undefined){
				str = "This";
			} else if (extension === 'dmg') {
				str = `<<damagecalc>>This will inflict $dmg damage and`;
			} else {
				str = extension;
			}
			var end = '.';
			var time = "";
			var phrase;
			var article;
			var E = new Effect(type);
			if (E.buff == true){
				phrase = " provide";
			} else {
				phrase = " inflict";
			}
			var tol = target().getTol(type);
			if (tol !== undefined && tol == 'immune') {
				str += " would";
				end = ", but <b>the target is immune</b>.";
			} else if (E.unblockable == false && target().stasis){
				str += " would";
				end = ", but <b>the target's effects are in Stasis</b>.";
			} else if (E.unblockable == false && E.buff != true && target().chi){
				str += " would";
				end = ", but <b>the target's Chi Shield will block it</b>.";
			} else if (type == "Stunned" && target().alert) {
				str += " would";
				end = `...but <b>the target is Alert, so ${target().they} won't fall for it</b>.`;
			} else {
				str += " will";
			}
			switch (type){
				case "ATK Boost":
				case "Injury":
					article = " an";
					break;
				case "DEF Boost":
				case "SPC Boost":
				case "Blessing":
				case "Headache":
				case "Curse":
					article = " a";
					break;
				default:
					article = "";
			}
			if (action().dur > 1){
				time = ` for ${action().dur} rounds`;
			}
		return str+phrase+article+` ${type}`+time+end;
		}
	},
	stance: function () {
		if (subject().stasis){
			return `$subject[0].name is in Stasis, so this won't do anything.`;
		}
		else {return "";}
	},
	multihit: function (hits,extension) {
		if (extension === undefined){
			extension = '.';
		}
		return `<<damagecalc>>This will inflict $dmg x ${hits} damage`+extension;
	},
	cleanse: function () {
		var str;
		$.wiki('<<neutralize>>');
		if (V().removed_effects.length > 0) {
			str = "This will remove ";
			V().removed_effects.forEach(function(id,i){
				str += target().effects[id].name;
				if (i == (V().removed_effects.length-1)){
					str += '.';
				} else if (i == (V().removed_effects.length-2)){
					if (V().removed_effects.length == 2){
						str += ' and ';
					} else {
						str += ', and ';
					}
				} else {
					str += ', ';
				}
			});
		} else {
			str = "...This won't remove any effects! You can still cast it if you really want to, but it'll be a waste of a turn.";
		}
		return str;
	},
	grenade: `<<damagecalc>>This will inflict $dmg damage to $target[0].name and half damage to other enemies.`,
	cure: function (type) {
		return function () {
			var str = `This will cure ${target().name} of ${type}.`;
			var found = false;
			target().effects.forEach(function(eff){
				if (eff.name == type){
					found = true;
				} else if (type == "all" && !eff.buff){
					found = true;
				}
			});
			if (!found){
				var t;
				if (type == "all"){
					t = 'any';
				} else {
					t = 'that ailment';
				}
				str += ` ...or it would, if they had ${t}! You can still use it, but it'll be a waste.`;
			} else if (target().stasis){
				str += ` ...but ${target().their} effects are held in Stasis, so nothing will happen.`;
			}
			return str;
		}
	},
	massAttack: function (type) {
		return function () {
			return `<<set _d = ($base + $subject[0].get("Special"))*$action.weight>>\
			This will inflict _d base damage and ${type} status, divided across the current number of enemies.`;
		}
	}
}




window.Action = class Action {
	constructor(name){
	if (typeof(name) == 'object'){
		Object.keys(name).forEach(prop => this[prop] = clone(name[prop]));
	}
	else {
		this.name = name;
		this.phase = "targeting phase";
		this.target = "enemy";
		this.cost = 0;
		this.basic = false;
		this.instant = false;
		this.pierce = false;
		this.hpcost = null;
		this.info = "Info pending.";
		this.desc = "Description pending.";
		
		this.useText = `$subject[0].name uses "${this.name}".`;
		
		this.actText = null;
		
		this.act = function () {
		/* This contains the effects of the action. A returned string consisting of SugarCube code will run that code as normal. However, be warned that line breaks in template literals are also parsed and bypass nobr sections. You can get around this with the line continuation symbol, \. */
			return `This action doesn't do anything!`;
		}
		
		/* Database. */
		
		switch (name) {
			case "Sword":
				this.cost = 2;
				this.weight = 1;
				this.basic = true;
				this.info = `Attack with a weight of ${this.weight}.`;
				this.desc = `Ah, the sword: favored weapon of heroes everywhere. In reality they're pretty impractical and hard to use, but they just look so cool!`;
				this.useText = null
				this.actText = function () {
					return `$subject[0].name swings their sword with perfect form.`;
				}
				this.act = justdmg;
				break;
				
			case "Punch":
				this.cost = 1;
				this.weight = 0.75;
				this.basic = true;
				this.info = `Attack with a weight of ${this.weight}.`;
				this.desc = `A quick jab with the off-hand. Weaker than using a weapon, but less tiring.`;
				this.useText = null
				this.actText = function () {
					return `${State.variables.subject[0].name}'s fist slams into the enemy.`;
				}
				this.act = justdmg;
				break;
				
			case "Hammer":
				this.cost = 3;
				this.weight = 0.8;
				this.basic = true;
				this.pierce = true;
				this.info = `Attack with a weight of ${this.weight} and ignores enemy defense.`;
				this.desc = `Fighter's heavy warhammer concentrates all the force of their swing onto a single point, piercing through even the toughest of armor.`;
				this.useText = null
				this.actText = function () {
					return `${State.variables.subject[0].name} draws their warhammer from their back and brings it down on the enemy in a crushing blow.`;
				}
				this.act = justdmg;
				break;
				
			case "Charge":
				this.cost = 4;
				this.weight = 1.4;
				this.info = `Inflicts damage with an attack weight of ${this.weight} but knocks Fighter <b>Off-Balance</b>.`;
				this.desc = `Rush the enemy with an all-out attack! Fighter can put a lot of force behind this attack, but it'll leave them overbalanced and open to a counterattack.`;
				this.actText = function () {
					return `$subject[0].name rushes up to the enemy and puts all their weight into the attack! In the process they overextend themselves, and start to wobble a little.`;
				}
				this.act = function () {
					return `<<echodamage>>`+
					`<<addeffect $subject[0] "Off-Balance" 1 $subject[0]>>`
				}
				break;
				
			case "Berserker":
				this.cost = 1;
				this.instant = true;
				this.phase = "confirm phase";
				this.info = `Increase damage dealt and received by ${State.variables.berserk_factor*100}%.`
				this.desc = `Fighter will throw down their shield and fight with reckless abandon, hitting harder but hurting harder, too.`;
				this.actText = function () {
					return `$subject[0].name's shield drops to the ground with a <i>clang</i>, and they grip their weapon with fiery determination. No holding back, now!`;
				}
				this.act = justeffect('s',"Berserker",1);
				this.preview = Prev.stance;
				break;
				
			case "Defender":
				this.cost = 1;
				this.instant = true;
				this.phase = "confirm phase";
				this.info = `Reduce damage dealt and received by ${State.variables.defend_factor*100}%.`
				this.desc = `Fighter will hunker behind their shield, blocking oncoming blows but making it harder for them to attack.`;
				this.actText = function () {
					return `An expression of cool stillness passes over $subject[0].name's face as they hunker behind their shield, eyes peeled for all incoming attacks.`;
				}
				this.act = justeffect('s',"Defender",1);
				this.preview = Prev.stance;
				break;
				
			case "Meditate":
			case "Meditate_Cleric":
				this.cost = 5;
				this.basic = true;
				this.dur = 4;
				this.phase = "confirm phase";
				this.info = `Cure user of all negative ailments and bestow <b>Chi Shield</b>, protecting them from future ailments for ${this.dur} turns.`;
				this.actText = function () {
					return `$subject[0].name stops, and closes their eyes. Their sudden tranquility is discordant with the chaos of the battle. They take a deep breath, and when they let it out you swear you can see a physical presence leave them. They stand up straighter, positively glowing.`;
				}
				this.act = function () {
					return `<<for _k, _effect range $subject[0].effects>>`+
					`<<if _effect.buff is false and _effect.sticky isnot true>>`+
					`<<print subject().removeEffect(_effect)>>`+
					`<</if>>`+
					`<</for>>`+
					`<<addeffect $subject[0] "Chi Shield" $action.dur>>`;
				}
				this.preview = function () {
					if (subject().stasis) {
						return `$subject[0].name is in Stasis, so this won't do anything.`;
					}
					else {
						return `$subject[0].name will be cured of all ailments and gain <b>Chi Shield</b>.`;
					}
				}
				switch (name) {
					case "Meditate":
						this.desc = `The indignities of the world quail before Fighter's indomitable spirit. When that spirit is focused, all their troubles will fade away like dust in the wind.`;
						break;
					case "Meditate_Cleric":
						this.name = "Meditate";
						this.desc = `Cleric's optimism is so strong it becomes a physical force. They believe they will be alright, and so they will be.`;
						break;
				}
				break;
			
			case "Protector":
			case "Protector_Cleric":
				this.cost =		2;
				this.effweight =	0.2;
				this.dur =		3;
				this.target =	"ally";
				this.self =		false;
				this.info =		`Take hits for an ally and gain a Defense bonus for ${this.dur} rounds.`;
				this.actText = function () {
					return `Without hesitation $subject[0].name jumps in front of their charge, shielding them from all harm.`;
				}
				this.act = justeffect('s',"Protector");
				this.preview = `$subject[0].name will protect $target[0].name and gain a bonus to Defense.`;
				switch (name){
					case "Protector":
						this.desc =		`Leap to another puppet's defense! Fighter will put themselves in the way of any attack, deflecting it with their mighty shield. But they can't be everywhere at once, so beware of area attacks...`;
						break;
					case "Protector_Cleric":
						this.name = "Protector";
						this.desc =		`Cleric never hesitates to defend the weak. They will stand like a mighty titan before their charge, protecting them from all harm. But they can't be everywhere at once, so beware of area attacks...`;
						break;
				}
				break;
	
			case "Martyr":
			case "Martyr_Cleric":
				this.cost =		2;
				this.phase =	"confirm phase";
				this.info =		`Draw all direct attacks for this round.`;
				this.actText = null;
				this.act = justeffect('s',"Martyr",1);
				this.preview = Prev.stance;
				switch (name) {
					case "Martyr":
						this.desc =		`The blinding intensity of Fighter's spirit can warp perception itself. Through sheer will they can become so overpoweringly <b>real</b> that enemies become unable to see anything else, compelling them to send all attacks Fighter's way. Unfortunately, the technique requires too much concentration for Fighter to raise their shield.`;
						break;
					case "Martyr_Cleric":
						this.name = "Martyr";
						this.desc =		`The light of Cleric's spirit is blinding. Even under normal circumstances, people can't help but be drawn to them; when that spirit is focused, they will see nothing else. Cleric will gladly take all their pain and violence onto themselves.`;
						break;
				}
				break;
			
			case "Knife":
				this.cost =		2;
				this.weight =	State.variables.knife_weight;
				this.basic =	true;
				this.info =		`Attack twice with a weight of ${this.weight}.`;
				this.desc =		`It's not as strong as Fighter's big sword, but Rogue is fast enough to get two licks before their victim knows what's hit them. This is most effective against enemies with poor defense.`;
				this.useText = null
				this.actText = function () {
					return `${State.variables.subject[0].name} draws two knives and rushes in, slashing with one hand and stabbing with the other.`;
				}
				this.act = multihit(2);
				this.preview = Prev.multihit(2);
				break;

			case "Crossbow":
				this.cost =		0;
				this.weight =	1;
				this.basic =	true;
				this.info =		`Attack with a weight of ${this.weight}. Needs reloading after use.`;
				this.desc =		`Ah, the marvel of modern technology: while other fools tire themselves out swinging those heavy weapons, Rogue can send death flying through the air with just a twitch of the finger.`;
				this.useText = null
				this.actText = function () {
					return `${State.variables.subject[0].name} fires their crossbow with a <i>twang</i>.`;
				}
				this.act = function () {
					return `<<echodamage>>`+
					`<<find "$subject[0].actions" "name" "\'Crossbow\'">>`+
					`<<set $subject[0].actions[_pos] = new Action("Reload")>>`;
				}
				break;
		
			case "Reload":
				this.cost =		2;
				this.phase =	"confirm phase";
				this.basic =	true;
				this.info =		`Reload crossbow.`;
				this.desc =		`...Of course, crossbows also take an age and a half to reload.`;
				this.preview = "";
				break;
	
			case "Something in your eye":
				this.cost =		2;
				this.info =		`Stun an enemy.`;
				this.desc =		`It's amazing how if you say something ridiculous, people will hold still long enough for you to make it true. It's like they want it to happen, really.`;
				this.actText = function () {
					return `"Hey," you say. "Something in your eye."
					'Something' turns out to be a fistful of dirt."`;
				}
				this.act = justeffect('t',"Stunned",1);
				this.preview = Prev.effect("Stunned");
				break;
	
			case "Poison Prick":
				this.cost =		3;
				this.weight =	0.6;
				this.effweight =	0.6;
				this.dur =		4;
				this.info =		`Attack with a weight of ${this.weight} and inflict Poisoned for ${this.dur} rounds.`;
				this.desc =		`The tiny knife may barely break the skin, but the poison it's coated in ensures they'll be feeling it for a while to come.`;
				this.actText = function () {
					return `$subject[0].name feints to the side, then with blinding speed draws a tiny concealed knife, stabbing it into the enemy like a needle. The skin around it breaks into welts and sickly purple splotches.`;
				}
				this.act = dmgandeffect('t',"Poisoned");
				this.preview = Prev.effect("Poisoned",'dmg');
				break;
	
			case "Off Your High Horse":
				this.cost =		4;
				this.weight =	1;
				this.info =		`Attack with a weight of ${this.weight} and remove the target's most recent buff.`;
				this.desc =		`A special technique that cuts through flesh and magic alike, bringing those haughty enchanted foes back down to earth.`;
				this.actText = function () {
					return `$subject[0].name leaps forward, twirling their knife in a strange pattern before slicing it across the enemy. Glimmering lines of energy trail after it like strands of cobweb, then wink out of existence.`;
				}
				this.act = function () {
					return `<<echodamage>>`+
					`<<if !$target[0].dead && !$target[0].stasis>>`+
						`<<for _i = $target[0].effects.length-1; _i >= 0; _i-->>`+
							`<<set _effect = $target[0].effects[_i]>>`+
							`<<if _effect.buff && !_effect.sticky>>`+
								`<<print target().removeEffect(_effect)>>`+
								`<<break>>`+
							`<</if>>`+
						`<</for>>`+
					`<</if>>`;
				}
				this.preview = `<<damagecalc>>\
					<<if !$target[0].dead && !$target[0].stasis>>\
						<<for _i = $target[0].effects.length-1; _i >= 0; _i-->>\
							<<set _effect = $target[0].effects[_i]>>\
							<<if _effect.buff && !_effect.sticky>>\
								<<set _s = _effect.name>>\
								<<break>>\
							<</if>>\
						<</for>>\
					<</if>>\
					This will inflict $dmg damage<<if def _s>> and remove _s<</if>>.`;
				break;
	
			case "A Farewell to Arms":
				this.cost =		4;
				this.weight =	1;
				this.effweight =	0.6;
				this.dur =		3;
				this.info =		`Attack with a weight of ${this.weight} and inflict Injury for ${this.dur} rounds.`;
				this.desc =		`A savage laceration of the arm muscles that leaves the enemy crippled.`;
				this.actText = function () {
					return `$subject[0].name pauses, their eyes flicking over their opponent. They raise their knife level with their eyes, and the next instant lunge forward with a crippling stab to the arm joints.`;
				}
				this.act = dmgandeffect('t',"Injury");
				this.preview = Prev.effect("Injury",'dmg');
				break;
	
			case "Below the Belt":
				this.cost =		4;
				this.weight =	1;
				this.effweight =	0.6;
				this.dur =		3;
				this.info =		`Attack with a weight of ${this.weight} and inflict Pain for ${this.dur} rounds.`;
				this.desc =		`A nasty kick to the joints and other painful regions that leaves the enemy too distracted by pain to defend themselves.`;
				this.actText = function () {
					return `$subject[0].name pauses, their eyes flicking over their opponent. Suddenly they strike out like a viper, ramming a sharp kick into an exposed weak point.`;
				}
				this.act = dmgandeffect('t',"Pain");
				this.preview = Prev.effect("Pain",'dmg');
				break;
	
			case "Dead Ringer":
				this.cost =		4;
				this.weight =	1;
				this.effweight =	0.6;
				this.dur =		3;
				this.info =		`Attack with a weight of ${this.weight} and inflict Headache for ${this.dur} rounds.`;
				this.desc =		`An unsporting blow to the temple that leaves the enemy's head ringing.`;
				this.actText = function () {
					return `$subject[0].name kicks dust into their opponent's eyes, disorienting $target[0].pr.obj just long enough for them to ram their dagger's pommel straight into $target[0].pr.pos temple.`;
				}
				this.act = dmgandeffect('t',"Headache");
				this.preview = Prev.effect("Headache",'dmg');
				break;
	
			case "Flurry":
				this.cost =		5;
				this.weight =	0.7;
				this.info =		`Attack thrice with a weight of ${this.weight} and inflict Off-Balance.`;
				this.desc =		`Descend on the enemy in a whirlwind of strikes! The sudden ferocity will make them lose their footing, leaving them open to another puppet's attack.`;
				this.actText = function () {
					return `With uncharacteristic unsubtlety, $subject[0].name charges forward, swinging their blades in a whirlwind of flashing steel. Not every swing connects, but it doesn't need to. The enemy stumbles and sways from the pressing assault, looking like they could be knocked over by a light breeze. $subject[0].name grins and leaps away, their job done.`;
				}
				this.act = function () {
					return `<<echodamage>><<echodamage>><<echodamage>>`+
					`<<addeffect $target[0] "Off-Balance" 1>>`;
				}
				this.preview = Prev.effect("Off-Balance",Prev.multihit(3));
				break;
	
			case "Sneak":
				this.cost =		2;
				this.phase =	"confirm phase";
				this.dur =		3;
				this.info =		`Become untargetable for ${this.dur} rounds.`;
				this.desc =		`Become one with the shadows.`;
				this.actText = function () {
					return `The arena should be well-lit, but as $subject[0].name presses themselves against the wall, their surroundings suddenly become dimmer. You blink, and suddenly you can't tell where they end and the shadows begin.`;
				}
				this.act = justeffect('s',"Hidden");
				this.preview = Prev.stance;
				break;

			case "Procure":
				this.phase =	"procure";
				this.target = null;
				this.info =		`Add an item to party stock. Cost varies.`;
				this.desc =		`Even you don't know where they get it from.`;
				break;
				
			case "Procure_Witch":
				this.phase =	"procure";
				this.name =		"Procure";
				this.target = null;
				this.info =		`Add an item to party stock. Cost varies.`;
				this.desc =		`A witch's pockets always have just what they need.`;
				break;
	
			case "Focus":	
				this.cost =		2;
				this.special = 	4;
				this.phase =	"confirm phase";
				this.info =		`Gain ${this.special} Energy (net ${this.special - this.cost}).`;
				this.desc =		`Magic is everywhere if you know where to look. A skilled mage can, with concentration, read the currents that flow through the world and pluck power from them like notes from a harp.`;
				this.actText = function () {
					return `$subject[0].name holds out a hand. The motion is calm and easy, like trailing a hand through a forest stream. Glimmering motes of multicolored light settle on it like dew, trickling into the center of their palm before vanishing with a soft glow.`;
				}
				this.act = function () {
					return `<<set $subject[0].en -= $action.cost>>`+
					`<<set $subject[0].en += ${this.special}>>`+
					`Mage gains ${this.special} Energy!`;
				}
				this.preview = `$subject[0].name will gain ${this.special - this.cost} net Energy.`;
				break;	

			case "Sacrifice":
				this.cost =		0;
				this.special =	2;
				this.phase =	"confirm phase";
				this.basic =	true;
				this.instant =	true;
				this.hpcost = 	State.variables.SACRIFICE_HP;
				this.info =		`Sacrifice ${this.hpcost} HP to generate 2 Energy.`;
				this.desc =		`Magic is born from a desire to impose morality on a cruel and uncaring world. If we suffer, should good things not happen to balance it out? Only wishful thinking when done by humans, of course -- but Mage makes it a reality.`;
				this.actText = function () {
					return `$subject[0].name presses their hand into a fist so tight it draws blood. As you watch, their blood changes from a thick red into an inky black that streams away as if you are underwater. In an instant it is gone, leaving $subject[0].name with only a faint scar.`;
				}
				this.act = function () {
					return `Mage loses $action.hpcost HP.
					Mage gains 2 Energy!`+
					`<<set $subject[0].hp -= $action.hpcost>>`+
					`<<set $subject[0].en += ${this.special}>>`+
					`<<set $SacrificeUsed to true>>`;
				}
				this.preview = `$subject[0].name will lose ${this.hpcost} HP and gain ${this.special} Energy.`;
				break;
	
			case "Blast":
				this.cost =		3;
				this.weight =	1;
				this.phase =	"spell phase";
				this.spellMod = function () {
					switch (this.cost){
						case 10:
							V().action = new Action("Indignant Variati");
							break;
						default:
							console.log("default case active");
							this.weight = this.weight + 0.25*(this.cost - V().B.mincost);
					}
				}
				this.basic =	true;
				this.info =		`Inflict damage with an attack weight of ${this.weight} + 0.25 per Energy invested.`;
				this.desc =		`Use the beautiful, wonderous, and infinite power of magic to blow something up.`;
				this.actText = function () {
					switch (V().action.cost) {
						case 3:
							return `$subject[0].name raises a hand, and an orb of glowing blue-white energy shoots out of their palm.`;
						case 4:
							return `$subject[0].name raises a hand, and a missile of glowing blue-white energy shoots out of their palm, showering shimmering motes like snow.`;
						case 5:
						case 6:
							return `$subject[0].name raises a hand, and blue-white energy erupts from it like a geyser, blasting into the enemy.`;
						case 7:
						case 8:
							return `$subject[0].name raises both of their hands, and blue-white energy erupts in front of them in a chaotic blast, glowing tendrils arcing against the air and ground as the enemy is eveloped in waves of destruction.`;
						case 9:
							return `$subject[0].name raises both of their hands, glowing with power. Countless rays of blue-white energy spread out in all directions before curving in and condensing into a huge, powerful beam.`;
					}
				}
				this.act = justdmg;
				break;
			
			case "Indignant Variati":
				this.cost =		10;
				this.weight =	3;
				this.actText = function () {
					return `$subject[0].name calmly steps forward, and raises a hand to the heavens. In an instant, the sky is suddenly ablaze with wrathful fire. Fire and lightning rain down from the inferno to strike the earth, blasting the enemy in a terrifying and beautiful display of utter destruction.`;
				}
				this.act = function () {
					return `<<echodamage>>`+
					`<<addeffect $target[0] "Knocked Down" -1>>`+
					`<<addeffect $subject[0] "Winded" 3>>`;
				}
				this.preview = `<<damagecalc>>\
The wrath of the gods. This attack will inflict $dmg damage and <b>knock the enemy off their feet</b>, but the exertion will leave Mage <b>Winded</b>.`
				break;
	
			case "Fireball":
				this.cost =		4;
				this.weight =	1;
				this.effweight =	0.6;
				this.phase =	"spell phase";
				this.spellMod = function () {
					switch (this.cost){
						case 10:
							V().action = new Action("Perdition");
							break;
						default:
							this.effweight = 0.6+ 0.1*(this.cost-V().B.mincost);
					}
				}
				this.dur =		3;
				this.info =		`Inflict damage with an attack weight of ${this.weight} and inflict Burning status with greater severity per Energy invested.`;
				this.desc =		`Since the beginning of humanity, fire has had a hallowed place in the halls of myth and magic. One moment, there is nothing but dead wood and still air -- the next, a wild, flickering shape that banishes the cold and dark, changes objects irrevocably, purges evil and disease. What could be more magical than that? Of course, you don't care about any of that. You just want to burn stuff.`;
				this.actText = function () {
					switch (State.variables.action.cost) {
						case 4:
							return `$subject[0].name waves a hand, and a ball of orange flame bursts into existence to fly towards the enemy, igniting in an impressive display of fire that clings to the enemy's skin.`;
						case 5:
							return `$subject[0].name waves a hand, and a ball of yellow flame bursts into existence to fly towards the enemy, igniting in a magnificent display of fire that clings to the enemy's skin.`;
						case 6:
						case 7:
						case 8:
							return `$subject[0].name throws out their hand like a punch. A jet of flame shoots out like a comet, swallowing the enemy in fire.`;
						case 9:
							return `$subject[0].name points a finger at the enemy, and a perfect sphere of orange-red flame shoots out like a missile. When it connects it lights up like a firework, exploding in a brilliant inferno.`;
					}
				}
				this.act = dmgandeffect('t',"Burning");
				this.preview = Prev.effect("Burning",'dmg');
				break;
			
			case "Perdition":
				this.cost =		10;
				this.weight =	1;
				this.effweight =	0.5;
				this.actText = function () {
					return `$subject[0].name raises their palms as if lifting a great weight, and the enemy is suddenly enveloped in a pillar of screaming white fire. The ember, lodged in the enemy's heart, is unquenchable.`;
				}
				this.act = dmgandeffect('t',"Perdition");
				this.preview = `<<damagecalc>>\
The flames of eternal torment. This attack will inflict $dmg damage and <b>Perdition</b> status, which will remain for the duration of the battle.`;
				break;

			case "Favor":
				this.cost =		1;
				this.phase =	"spell phase";
				this.spellMod = function () {
					switch (this.cost){
						case 10:
							V().action = new Action("Inspiration");
							break;
						default:
					}
				}
				this.target =	"ally";
				this.self =		false;
				this.info =		`Lend Energy to an ally.`;
				this.desc =		`Magic blurs the boundaries of the natural world, and the boundaries between individuals. Mage can allow another to use their energy as if it was their own.`;
				this.actText = function () {
					return `$subject[0].name clasps one hand over their heart, and extends another towards $target[0].name. Glowing blue energy flows between them.`;
				}
				this.act = function () {
					return `$target[0].name gains $action.cost Energy!`+
					`<<set $target[0].en += $action.cost>>`;
				}
				this.preview = function () {
					var note = "";
					if ((target().en + V().action.cost) > 10) {
						note = ` ...but they already have $target[0].en Energy, so some of it will be wasted.`;
					}
					return `$subject[0].name will transfer $action.cost Energy to $target[0].name.`+note;
				}
				break;	
				
			case "Inspiration":
				this.cost =		10;
				this.target = 	"ally";
				this.self =		false;
				this.actText = function () {
					return `$subject[0].name places their palm flat below their mouth. They close their eyes, and blow out a breath towards $target[0].name. It glows with a strange energy, wrapping around $target[0].name. They look ready for anything.`;
				}
				this.act = function () {
					target().en += action().cost;
					if (target().isDone == true){
						target().isDone = false;
					} else {
						target().inspired = true;
					}
					return `$target[0].name gains $action.cost Energy and an additional action!`;
				}
				this.preview = `The breath of life. Mage will transfer $action.cost Energy to $target[0].name and grant them an additional action.`;
				break;

			case "Restoration":
				this.cost =		3;
				this.phase =	"spell phase";
				this.spellMod = function () {
					switch (this.cost){
						case 10:
							V().action = new Action("Salvation");
							V().target = [null,null];
							break;
						default:
							V().effects_to_remove = 1+(this.cost-V().B.mincost);
					}
				}
				this.target =	"ally";
				this.info =		`Cure an ally of their most recent status ailment, plus one ailment per Energy invested.`;
				this.desc =		`People have always turned to mystics for cures to the world's ills and pains. To be blighted by an enemy you cannot see is terrifying and transcendent -- so surely, one must seek out a person that is the same. And so Mage gained the power of healing.`;
				this.actText = function () {
					return `$subject[0].name waves their hands in smooth, wide motions, as if polishing a surface. When they're finished they stretch their hands out imperiously, and positive energy washes over $target[0].name in a bright burst.`;
				}
				this.act = function () {
					return `<<for _effect range $removed_effects>>`+
					`<<print target().removeEffect(_effect)>>`+
					`<</for>>`+
					`<<set $removed_effects = []>>`;
				}
				this.preview = Prev.cleanse;
				break;
			
			case "Salvation":
				this.cost =		10;	
				this.dur = 		4;
				this.phase =	"confirm phase";
				this.actText = function () {
					return `$subject[0].name spreads their hands wide, exultant. The curses afflicting your puppets condense into balls of dark energy before bursting in brilliant showers of light. The glow swirls around them, enveloping them in protective energy.`;
				}
				this.act = function () {
					return `<<for _puppet range $puppets>>`+
					`<<if _puppet.dead isnot true>>`+
					`<<for _k, _effect range _puppet.effects>>`+
					`<<if _effect.buff isnot true and _effect.ULTIMATESTICKY is false>>`+
					`<<print _puppet.removeEffect(_effect)>>`+
					`<</if>>`+
					`<</for>>`+
					`<<addeffect _puppet "Chi Shield" $action.dur>>`+
					`<</if>>`+
					`<</for>>`;
				}
				this.preview = Prev.cleanse;
				break;

			case "Neutralize":
				this.cost =		3;
				this.phase =	"spell phase";
				this.spellMod = function () {
					switch (this.cost){
						case 10:
							V().action = new Action("Annulment");
							V().target = [null,null];
							break;
						default:
							V().effects_to_remove = 1+(this.cost-V().B.mincost);
					}
				}
				this.info =		`Strip an enemy of their most recent buff, plus one buff per Energy invested.`;
				this.desc = 	`To make magic, one must first know how to break it. Your enemies think themselves safe, shining and untouchable with all those enchantments? With a whisper, Mage can remind them just how mortal they really are.`;
				this.actText = function () {
					return `$subject[0].name waves their hands in contracted, sprialling motions, as if gathering up dust. When they're finished, they swipe a hand sharply to the side as if in dismissal. You see $target[0].name's magic flash and sputter, fading away like mist.`;
				}
				this.act = function () {
					return `<<for _effect range $removed_effects>>`+
					`<<print target().removeEffect(_effect)>>`+
					`<</for>>`+
					`<<set $removed_effects = []>>`;
				}
				this.preview = Prev.cleanse;
				break;
			
			case "Annulment":
				this.cost =		10;
				this.phase =	"confirm phase";
				this.actText = function () {
					return `$subject[0].name places their hand out, palm up. With violent suddenness they close it into a fist. You suddenly see the enchantments aiding the enemy clear as day, little balls of energy orbiting them like little planets -- before they all shatter at once like a galaxy of dying stars.`;
				}
				this.act = function () {
					return `<<for _enemy range $enemies>>`+
					`<<if _enemy.dead isnot true>>`+
					`<<for _k, _effect range _enemy.effects>>`+
					`<<if _effect.buff is true and _effect.ULTIMATESTICKY is false>>`+
					`<<print _puppet.removeEffect(_effect)>>`+
					`<</if>>`+
					`<</for>>`+
					`<</if>>`+
					`<</for>>`;
				}
				this.preview = `A judgment upon those who would defy you. This will strip all buffs from every enemy, including Alert and Chi Shield.`;
				break;

			case "Blessing":
				this.cost =		5;
				this.effweight =	0.2;
				this.phase =	"spell phase";
				this.spellMod = function () {
					switch (this.cost){
						case 10:
							V().action = new Action("Ascension");
							V().target = [null,null];
							break;
						default:
							// duration
							switch (this.cost){
								case 6:
								case 7:
									this.dur = 4;
									break;
								case 8:
								case 9:
									this.dur = 5;
									break;
								default:
							}
							// effect
							switch (this.cost){
								case 7:
								case 8:
									this.effweight = (10/35);
									break;
								case 9:
									this.effweight = (15/35);
									break;
								default:
							}
					}
				}
				this.dur =		3;
				this.target =	"ally";
				this.info =		`Bestow a Blessing, which will boost all stats for ${this.dur} rounds. Additional Energy points will alternate improvements in duration and effect.`;
				this.desc = 	`Grant us strength that we may strike true. Grant us protection that we may endure. Grant us wisdom that we may see the way through the darkness.`;
				this.actText = function () {
					return `$subject[0].name raises their arms skyward, then clasps their hands together as if in prayer. They suddenly let go, and wave their hands over $target[0].name with a flourish. Motes of light fall over $target[0].pr.obj, making $target[0].pr.obj glow with a strange aura.`;
				}
				this.act = justeffect('t',"Blessing");
				this.preview = Prev.effect("Blessing");
				break;
				
			case "Ascension":
				this.cost =		10;
				this.effweight =	(10/35);
				this.dur =		5;
				this.phase =	"confirm phase";
				this.actText = function () {
					return `$subject[0].name raises their arms skyward. Their muscles strain and their fists suddenly clench, as if they are trying to grasp the Sun itself. Perhaps they succeed: their hands are suddenly effulgent with light, which they push down into the earth. The ground glows and your puppets are bathed in geysers of light, exultant.`;
				}
				this.act = function () {
					return `<<for _puppet range $puppets>>`+
					`<<addeffect _puppet "Blessing" $action.dur $subject[0]>>`+
					`<</for>>`;
				}
				this.preview = `Become something greater. This will endow a Blessing to all puppets for ${this.dur} rounds.`;
				break;
			
			case "Curse":
				this.cost =		5;
				this.effweight =	0.25;
				this.phase =	"spell phase";
				this.spellMod = function () {
					switch (this.cost){
						case 10:
							V().action = new Action("Forsaken");
							break;
						default:
							// duration
							switch (this.cost){
								case 6:
								case 7:
									this.dur = 4;
									break;
								case 8:
								case 9:
									this.dur = 5;
									break;
								default:
							}
							// effect
							switch (this.cost){
								case 7:
								case 8:
									this.effweight = 0.35;
									break;
								case 9:
									this.effweight = 0.5;
									break;
								default:
							}
					}
				}
				this.dur =		3;
				this.info =		`Inflict a Curse, which will weaken all stats for ${this.dur} rounds. Additional Energy points will alternate improvements in duration and effect.`;
				this.desc =		`May their flesh sag and rot. May their bones crumble like parchment. May their thoughts slow like treacle.`;
				this.actText = function () {
					return `$subject[0].name stares intently, then calmly points a single finger at the enemy. $target[0].name sways, and the air around $target[].pr.obj suddenly looks dingier.`;
				}
				this.act = justeffect('t',"Curse");
				this.preview = Prev.effect("Curse");
				break;
			
			case "Forsaken":
				this.cost =		10;
				this.effweight =	2;
				this.dur =		4;
				this.actText = function () {
					return `$subject[0].name does not even move. They only spare $target[0].name a look, and they are suddenly drowned in darkness.`;
				};
				this.act = justeffect('t',"Forsaken");
				this.preview = `A terrible judgment that denies all mercy. This will inflict <b>Forsaken</b> status, which will sharply reduce Defense, even into the negatives.`;
				break;
			
			case "Rapier":
				this.cost = 2;
				this.weight = 1;
				this.basic = true;
				this.info = `Inflicts damage with an attack weight of ${this.weight}.`;
				this.desc = `A flashy, elegant weapon for sophisticated duelists, specialized for thrusts and precise cuts. Its usefulness in a real brawl is questionable, but if you can't fight in style, what's even the point?`;
				this.useText = null
				this.actText = function () {
					return `${State.variables.subject[0].name} elegantly stabs the foe with their rapier.`;
				}
				this.act = justdmg;
				break;

			case "Dagger":
				this.cost =		2;
				this.weight =	State.variables.knife_weight;
				this.basic =	true;
				this.info = 	`Attack twice with a weight of ${this.weight}.`;
				this.desc =		`A real dagger, not the shoddy knife you'd find in the hands of a thug! Longer than a knife and shorter than a sword, the dagger is an elegant weapon combining strength and concealment. It's favored by assassins and scheming nobles.`;
				this.useText = null
				this.actText = function () {
					return `${State.variables.subject[0].name} draws an ornate dagger and slashes it twice across the enemy.`;
				}
				this.act = multihit(2);
				this.preview = Prev.multihit(2);
				break;

			case "Shout":
				this.cost =		3;
				this.weight =	1;
				this.phase =	"spell phase";
				this.spellMod = function () {
					this.weight = this.weight + 0.25*(this.cost - V().B.mincost);
				}
				this.basic =	true;
				this.info =		`Inflict damage with an attack weight of ${this.weight} + 0.25 per Energy invested.`;
				this.desc =		`Bard knows all about the destructive power of words, though it's a bit more literal than usual in this case. With a little magic, boosted by their own mythological resonance with the domain of sound, Bard can turn their voice into an oddly melodic sonic attack.`;
				this.actText = function () {
					return `$subject[0].name projects their voice into a wave of crushing force.`;
				}
				this.act = justdmg;
				break;

			case "Non-Sequitor":
				this.cost =		4;
				this.weight =	0.9;
				this.info =		`Attack with a weight of ${this.weight} and inflict Off-Balance.`;
				this.desc =		`"This statement is false!" Sometimes you need to do the thing they least expect. It'll throw them off-kilter, especially after you follow it with a sucker punch.`;
				this.useText = null
				this.actText = function () {
					return `$subject[0].name says something so random the enemy has to stop to process it. While they're doing that, $subject[0].name socks them in the face.`;
				}
				this.act = dmgandeffect('t',"Off-Balance",1);
				this.preview = Prev.effect("Off-Balance",'dmg');
				break;

			case "Insult":
				this.cost =		2;
				this.effweight =	0.3;
				this.dur =		3;
				this.info =		`Inflict an Injury for ${this.dur} rounds.`;
				this.desc =		`"You fight like a cow!" Any bard worth their salt knows exactly what wicked wordplay will leave their victims a laughingstock. The injury inflicted is only emotional, but really, isn't that worse?`;
				this.useText = null
				this.actText = function () {
					return `$subject[0].name insults the opponent's fighting style so wickedly they are crushed by despair.`;
				}
				this.act = justeffect('t',"Injury");
				this.preview = Prev.effect("Injury");
				break;

			case "Joke":
				this.cost =		2;
				this.effweight =	0.3;
				this.dur =		3;
				this.info =		`Inflict Pain for ${this.dur} rounds.`;
				this.desc =		`Bard can make jokes so bad they cause physical pain. Bard assures us they're doing it ironically. You think that makes worse.`;
				this.useText = null
				this.actText = function () {
					return `$subject[0].name makes a painfully bad joke.`;
				}
				this.act = justeffect('t',"Pain");
				this.preview = Prev.effect("Pain");
				break;

			case "Equivocate":
				this.cost =		2;
				this.effweight =	0.3;
				this.dur =		3;
				this.info =		`Inflict Headache for ${this.dur} rounds.`;
				this.desc =		`"Oh, I'm sure you <b>believe</b> that's true, but have you considered..." Also known as "playing devil's advocate" or, more colloquially, "trolling". Bard is a master.`
				this.useText = null
				this.actText = function () {
					return `$subject[0].name leads the enemy on a meandering and nonsensical argument. It's irritating to everyone, but $target[0].name gets the worst of it.`;
				}
				this.act = justeffect('t',"Headache");
				this.preview = Prev.effect("Headache");
				break;

			case "Rewrite":
				this.cost =		5;
				this.target =	"all";
				this.info =		`Remove all effects (positive and negative) from a target.`;
				this.desc =		`Don't like the story? Then change it! It's the tales that are remembered, and in a way isn't that more real than what actually happened?`;
				this.actText = function () {
					return `$subject[0].name crafts a personal narrative so compelling it overwrites $target[0].name's state of being. All the forces acting upon $target[0].pr.obj vanish like they were never even there.`;
				}
				this.act = function () {
					return `<<for _k, _effect range $target[0].effects>>`+
					`<<if _effect.sticky != true>>`+
					`<<print target().removeEffect(_effect)>>`+
					`<</if>>`+
					`<</for>>`
				}
				this.preview = function () {
					var str = "";
					if (target().stasis){
						str += "<b>The target is in Stasis</b>, so this won't do anything!";
					} else {
						str += "This will remove all effects from the target, excepting Alert and Chi Shield.";
					}
					return str;
				}
				break;

			case "Provoke":
				this.cost =		2;
				this.phase =	"confirm phase";
				this.info =		`Draw all direct attacks for this round.`;
				this.desc =		`A bard thrives in the spotlight. This one knows just how to get it.`;
				this.actText = function () {
					return `$subject[0].name runs around like a headless chicken while insulting everyone's parentage.`;
				}
				this.act = justeffect('s',"Martyr",1);
				this.preview = Prev.stance;
				break;

			case "Shot":
				this.cost =		1;
				this.weight =	0.75;
				this.phase =	"spell phase";
				this.spellMod = function () {
					this.weight = this.weight + 0.25*(this.cost - V().B.mincost);
				}
				this.basic =	true;
				this.info =		`Inflict damage with an attack weight of ${this.weight} + 0.25 per Energy invested.`;
				this.desc =		`Ranged weapons are where the real power's at. With sharp eyes, you can strike down an entire battalion of soldiers before they can land even single blow. Of course, in this arena, everyone is always within melee range of each other, so it's a bit less useful. Archer has to make up for it by firing multiple arrows at once -- they can draw on their mythological resonance to create them out of Energy points, so you'll never run out.`;
				this.useText = null
				this.actText = function () {
					var str;
					if (V().action.cost == 1) {
						str = "an arrow";
					} else if (V().action.cost == 10) {
						return `If there was a sun here, ${subject().name}'s arrows would blot it out.`;
					} else {
						str = "a volley of arrows";
					}
					return `${State.variables.subject[0].name} fires ${str}.`;
				}
				this.act = justdmg;
				break;
				
			case "Mark Shot":
				this.cost =		1;
				this.weight =	0.75;
				this.useText = null
				this.actText = `$subject[0].name follows up the attack with a shot at all their marks.`;
				this.act = function () {
					return `<<for _enemy range _hitlist>>\
								<<set $target[0] = _enemy>>\
								<<echodamage>>\
								<<set $puppets[_pos].en -= $action.cost>>\
								<<if $puppets[_pos].en <= 0>>\
									$puppets[_pos].name has run out of arrows!
									<<addeffect $puppets[_pos] "Winded" 3>>\
									All Marks vanish!\
									<<break>>\
								<</if>>\
							<</for>>`;
				}
				break;
				
			case "Hunter Counter":
				this.cost =		0;
				this.weight =	0.75;
				this.useText = null
				this.actText = function () {
					return `_enemy.name should've known better than to attract $puppets[_pos].name's attention. $puppets[_pos].name counterattacks!`;
				}
				this.act = justdmg;
				break;

			case "Soulshot":
				this.cost =		3;
				this.weight =	0.8;
				this.phase =	"spell phase";
				this.spellMod = function () {
					this.weight = this.weight + 0.1*(this.cost - V().B.mincost);
				}
				this.pierce =	true;
				this.info =		`Inflict damage with an attack weight of ${this.weight} + 0.1 per Energy invested and ignore enemy defense.`;
				this.desc =		`Arrows made of pure ether. Their insubstantial nature makes them weaker than real weapons, but they'll glide straight through any armor to pierce the heart.`;
				this.useText = null
				this.actText = function () {
					return `${State.variables.subject[0].name} fires the ghost of an arrow.`;
				}
				this.act = justdmg;
				break;

			case "Exacerbate":
				this.cost =		3;
				this.weight =	1;
				this.info =		`Inflict damage with a weight of ${this.weight} + 0.25 for every ailment afflicting the enemy.`;
				this.desc =		`A cruel attack targeted at existing wounds and injuries. Go on. Twist the knife.`;
				this.actText = function () {
					return `$subject[0].name pulls out a massive, wicked thing with a head of twisted, barbed metal; it looks more like a harpoon than an arrow. They draw their bowstring to the limit, quivering with tension. Their eyes flick over their opponent, scanning for the slightest weakness. Then, with a suddenness that makes you jump, they let the arrow fly.`;
				}
				this.act = justdmg;
				break;

			case "Explosive Bolt":
				this.cost =		4;
				this.weight =	1;
				this.info =		`Inflict damage with a weight of ${this.weight} to target and half damage to all other enemies.`;
				this.desc =		`The famous "bomb arrow" technique popularized by a certain green-capped troublemaker. It consists of strapping a bomb to an arrow and shooting it away from you very fast. It's totally absurd, but then, what isn't?`;
				this.useText = null
				this.actText = function () {
					return `${State.variables.subject[0].name} straps a sizzling bomb to an arrow and lets it fly.`;
				}
				this.act = grenade('e');
				this.preview = Prev.grenade;
				break;

			case "Mark":
				this.cost =		0;
				this.dur =		3;
				this.basic =	true;
				this.info =		`Paint a target on an enemy. Every time another puppet attacks, Archer will follow up with a 1-point Shot on every Marked enemy. (Archer will become Winded if their Energy is exhausted in this manner.)`;
				this.desc =		`Archer never lets up once an enemy is in their sights.`;
				this.actText = function () {
					return `$subject[0].name stares with burning intensity, and if you squint, you think you can see a target over $target[0].name.`;
				}
				this.act = justeffect('t',"Marked");
				this.preview = Prev.effect("Marked");
				break;
				
			case "Mercy":
				this.cost =		0;
				this.basic =	true;
				this.instant =	true;
				this.info =		`Remove a Mark from an enemy.`;
				this.desc =		`Archer wants you to know they're letting you live because they feel like it, and not because they're too tired to keep going. They never let up, remember!`;
				this.actText = null
				this.act = function () {
					target().effects.forEach(function(effect){
						if (effect.name == "Marked"){
							State.temporary.effect = effect;
							return `<<print target().removeEffect(_effect)>>`;
						}
					});
				}
				this.preview = function () {
					var str = "$target[0].name will lose their Mark.";
					if (!target().marked){
						str += " ...or they would, if they had one!";
					}
					return str;
				}
				break;

			case "Hunter":
				this.cost =		2;
				this.phase =	"confirm phase";
				this.info =		`Counterattack every enemy that attacks this round at a weight of ${State.variables.HUNTER_WEIGHT}.`;
				this.desc =		`Archer can forgo an attack to hone their senses to the peak of human perfection, straining their ears and eyes for the slightest movement. Any enemy that dares to come close will know their swift and vengeful wrath.`;
				this.actText = null
				this.act = justeffect('s',"Hunter",1);
				this.preview = Prev.stance;
				break;

			case "Call to Arms":
				this.cost =		7;
				this.effweight =	(1/3);
				this.phase =		"confirm phase";
				this.dur =		3;
				this.info =		`Bestow an ATK Boost to all puppets for ${this.dur} rounds.`;
				this.desc =		`Let slip the dogs of war.`;
				this.actText = null
				this.act = function () {
					return `<<for _puppet range $puppets>>`+
					`<<addeffect _puppet "ATK Boost" $action.dur $subject[0]>>`+
					`<</for>>`;
				}
				this.preview = `All puppets will gain an ATK Boost, provided they are not in Stasis.`;
				break;

			case "Club":
				this.cost =		2;
				this.weight =	1;
				this.basic =	true;
				this.info =		`Attack with a weight of ${this.weight}.`;
				this.desc =		`Priests are prohibited from shedding blood. Violence against one's fellow man is a sin, after all! Fortunately, bludgeoning weapons, though capable of causing horrific internal injuries, don't spill blood, so it's all kosher.`;
				this.useText = null
				this.actText = function () {
					return `${State.variables.subject[0].name} nonviolently clubs the enemy over the head.`;
				}
				this.act = justdmg;
				break;

			case "Assured Aegis":
				this.cost =		3;
				this.dur =		3;
				this.target =	"ally";
				this.info =		`Bestows a Shield to a puppet for ${this.dur} rounds, reducing incoming damage by ${State.variables.SHIELD_FACTOR*100}%.`;
				this.desc =		`Don't worry. You're safe now.`;
				this.actText = function () {
					return `$subject[0].name places a hand over $target[0].name like a benediction.`;
				}
				this.act = justeffect('t',"Shield");
				this.preview = Prev.effect("Shield");
				break;

			case "Lifegiver":
				this.cost =		1;
				this.hpcost =	State.variables.LIFEGIVER_HP;
				this.dur =		3;
				this.basic =	true;
				this.target =	"ally";
				this.self =		false;
				this.info =		`Give ${this.hpcost} HP to another puppet.`;
				this.desc = 	`Life is a limited resource. We have only what we were given. But, if our life is ours, is it not up to us what we do with it?`;
				this.actText = function () {
					return `$subject[0].name cradles $target[0].name in a comforting embrace. Vibrant green energy flows into $target[0].pr.pos wounds, and the broken flesh knits back together.`;
				}
				this.act = function () {
					subject().hp -= this.hpcost;
					target().hp = Math.clamp(target().hp + this.hpcost, 0, target().maxhp);
					return `$subject[0].name gives ${this.hpcost} HP to $target[0].name!`;
				}
				this.preview = function () {
					var str = `$subject[0].name will give ${this.hpcost} HP to $target[0].name.`;
					if ((target().hp + this.hpcost) > target().maxhp){
						str += " ...but some of it will be wasted.";
					}
					return str;
				}
				break;

			case "Downfall":
				this.cost =		6;
				this.weight =	1;
				this.info =		`Inflict damage with a weight of ${this.weight} + 0.2 for every buff empowering the enemy, removing them in the process.`;
				this.desc =		`Pride goeth before a fall. Cleric can turn the enemy's hubris against them, reminding them that even the strongest warrior can be brought low by the smallest among us.`;
				this.actText = function () {
					return `$subject[0].name plants their feet firmly. They swing their staff around in wide, twirling motions, building up momentum before charging $target[0].name head-on and bringing it down like a judgment from the heavens.`;
				}
				this.act = function () {
					return `<<echodamage>>\
					<<for _effect range $removed_effects>>`+
					`<<print target().removeEffect(_effect)>>`+
					`<</for>>`+
					`<<set $removed_effects = []>>`;
				}
				this.preview = `<<echodamage>>\
				This will inflict $dmg damage and remove all buffs, excepting Alert and Chi Shield.`;
				break;

			case "Walled City":
				this.cost =		7;
				this.effweight =	(1/3);
				this.phase =		"confirm phase";
				this.dur =		3;
				this.info =		`Bestow a DEF Boost to all puppets for ${this.dur} rounds.`;
				this.desc =		`A line, to separate us from them. A shield to repel all.`;
				this.actText = null
				this.act = function () {
					return `<<for _puppet range $puppets>>`+
					`<<addeffect _puppet "DEF Boost" $action.dur $subject[0]>>`+
					`<</for>>`;
				}
				this.preview = `All puppets will gain a DEF Boost, provided they are not in Stasis.`;
				break;

			case "Pox":
				this.cost =		2;
				this.weight =	0.75;
				this.effweight =	0.6;
				this.phase =		"targeting phase";
				this.dur =		2;
				this.info =		`Inflict damage with a weight of ${this.weight} and inflict Pain for ${this.dur} rounds.`;
				this.desc =		`Witches are feared for their power over the unseen and unknowable. Cross them and they will strike you with an attack you can't even see: a terrible sickness of sores and blisters, unbearable in their pain.`;
				this.actText = function () {
					return `$subject[0].name points a finger at $target[0].name, and $target[0].pr.pos skin instantly breaks out in boils that swell and burst. It looks pretty painful.`;
				}
				this.act = dmgandeffect('t',"Pain");
				this.preview = Prev.effect("Pain",'dmg');
				break;

			case "Gift":
				this.cost =		1;
				this.phase =	"spell phase";
				this.spellMod = function () {
					switch (this.cost){
						case 10:
							V().action = new Action("Miracle");
							V().target = [null,null];
							break;
						default:
					}
				}
				this.basic =	true;
				this.target =	"ally";
				this.self =		false;
				this.info =		`Lend Energy to an ally.`;
				this.desc =		`The mages may speak of "equivalent exchange", of sacrifice. Witch understands the world is not so simple. Our lives are a renewable resource, a rich pattern of ups and downs, flourishing anew every day with new choices and ideas. So this is a gift, freely given: do with it what you will.`;
				this.actText = function () {
					return `$subject[0].name exchanges a meaningful look with $target[0].name, and gives them a slight nod.`;
				}
				this.act = function () {
					return `$target[0].name gains $action.cost Energy!`+
					`<<set $target[0].en += $action.cost>>`;
				}
				this.preview = function () {
					var note = "";
					if ((target().en + V().action.cost) > 10) {
						note = ` ...but they already have $target[0].en Energy, so some of it will be wasted.`;
					}
					return `$subject[0].name will transfer $action.cost Energy to $target[0].name.`+note;
				}
				break;	
			
			case "Miracle":
				this.cost = 10;
				this.special = 4;
				this.phase = "confirm phase";
				this.actText = function () {
					return `$subject[0].name kneels down, spreading their hand over the earth, and whispers something you can't hear. There is a pause, and then shoots of green break through the ground. They grow and grow, joined by more and more as you watch. They burst into beautiful blooms of every possible color, vines and branches stretching out to gently rest against your puppets' shoulders like a motherly hand. Something in your vision shifts and the image suddenly disappears -- but the vibrancy of life remains. Your puppets are glowing with energy.`;
				}
				this.act = function () {
					return `<<for _puppet range $puppets>>`+
					`<<set _puppet.en += ${this.special}>>`+
					`<<print "_puppet.name gains ${this.special} Energy!\n">>`+
					`<</for>>`;
				}
				this.preview = `It's a sad truth that one often gains a lesser reward than the sacrifice one gave up to achieve it. But if that's true, could it mean that sometimes, one can gain something for nothing? This spell will take 10 Energy to call to the Earth for supplication, but it will give 12 Energy in return, spread evenly across your puppets.`;
				break;

			case "Cleanse":
				this.cost =		2;
				this.phase =	"spell phase";
				this.spellMod = function () {
					switch (this.cost){
						case 10:
							V().action = new Action("Renewal");
							V().target = [null,null];
							break;
						default:
							V().effects_to_remove = 1+(this.cost-V().B.mincost);
					}
				}
				this.basic =	true;
				this.target =	"all";
				this.info =		`Removes the most recent ailment from an ally or the most recent buff from an enemy, plus 1 effect for every Energy point invested.`;
				this.desc =		`Wizards heal by forcing their will upon the world, demanding that it change for them. But there is an easier way, if you are willing to work with the currents of the world instead of against them. <b>Let</b> the magic depart, like water flowing downhill.`;
				this.actText = function () {
					return `$subject[0].name calmly waves a hand, and the magic passes like a dream.`;
				}
				this.act = function () {
					return `<<for _effect range $removed_effects>>`+
					`<<print target().removeEffect(_effect)>>`+
					`<</for>>`+
					`<<set $removed_effects = []>>`;
				}
				this.preview = Prev.cleanse;
				break;	
				
			case "Renewal":
				this.cost = 10;
				this.phase = "confirm phase";
				this.actText = function () {
					return `$subject[0].name lifts their hands to the sky, palms up. There is an expectant, yearning silence in the air, and then you hear it: the crashing of waves. From out of nowhere comes an unstoppable tide of crystal-clear water, flowing over the whole arena. With every fighter it passes, you see motes of glowing magic dissolve into it, until the world before you looks like the clear night sky, bedazzled with lights. Then the flood passes, and the arena is back to normal. Everyone is completely dry.`;
				}
				this.act = function () {
					return `<<for _enemy range $enemies>>`+
					`<<if _enemy.dead isnot true>>`+
					`<<for _k, _effect range _enemy.effects>>`+
					`<<if _effect.buff is true and _effect.ULTIMATESTICKY is false>>`+
					`<<print _enemy.removeEffect(_effect,'pierce')>>`+
					`<</if>>`+
					`<</for>>`+
					`<</if>>`+
					`<</for>>`+
					`<<for _puppet range $puppets>>`+
					`<<if _puppet.dead isnot true>>`+
					`<<for _k, _effect range _puppet.effects>>`+
					`<<if _effect.buff isnot true and _effect.ULTIMATESTICKY is false>>`+
					`<<print _puppet.removeEffect(_effect,'pierce')>>`+
					`<</if>>`+
					`<</for>>`+
					`<</if>>`+
					`<</for>>`;
				}
				this.preview = `By accepting the flow of nature, all your troubles can be washed away. This miracle will remove all buffs from enemies and all ailments from allies, even through Stasis and Chi Shield.`;
				break;

			case "Forgetfulness":
				this.cost =		2;
				this.info =		`Stun an enemy.`;
				this.desc =		`There's no need to go through your opponent when you can go around them instead. A simple touch on the mind, and they'll lose all memory of what they were doing.`;
				this.actText = function () {
					return `$subject[0].name slowly waves a hand over $target[0].name's eyes.`;
				}
				this.act = justeffect('t',"Stunned",1);
				this.preview = Prev.effect("Stunned");
				break;	
	
			case "Frenzy":
				this.cost =		4;
				this.effweight =	(20/45);
				this.dur =		3;
				this.target =	"ally";
				this.info =		`Greatly boost Attack, but cut Defense by half the amount.`;
				this.desc =		`Power like no other, at the expense of all else. Witch can give it to you, if you are prepared to accept it.`;
				this.actText = function () {
					return `$subject[0].name bites their thumb, and smears the blood over $target[0].name's face in a strange pattern. Their eyes narrow into slits.`;
				}
				this.act = justeffect('t',"Frenzy");
				this.preview = Prev.effect("Frenzy");
				break;

			case "Thaumastasis":
				this.cost =		5;
				this.phase =	"targeting phase";
				this.dur =		7;
				this.target =	"ally";
				this.info =		`Place a puppet in Stasis, preventing any change to their effects for ${this.dur} rounds.`;
				this.desc =		`Being one with nature sounds all well and good right up until you're getting chased by a bear while suffering from some new and exciting disease and starving from the recent drought. Sometimes, nature needs a kick in the teeth. Witch can forcefully stop the flow of magic completely, forcing every one of an individual's effects to stay exactly as they are.`;
				this.actText = function () {
					return `$subject[0].name snaps their fingers. The air around $target[0].name seems to freeze for a moment, then returns to normal.`;
				}
				this.act = justeffect('t',"Stasis");
				this.preview = `$target[0].name's effects will be held in Stasis.`
				break;	
	
			case "Age of Enlightenment":
				this.cost =		7;
				this.effweight =	(1/3);
				this.phase =	"confirm phase";
				this.dur =		3;
				this.info =		`Bestow a SPC Boost to all puppets for ${this.dur} rounds.`;
				this.desc =		`To hoard one's knowledge is inevitably to lose it. Let it free, so that it can live.`;
				this.actText = null
				this.act = function () {
					return `<<for _puppet range $puppets>>`+
					`<<addeffect _puppet "SPC Boost" $action.dur $subject[0]>>`+
					`<</for>>`;
				}
				this.preview = `All puppets will gain a SPC Boost, provided they are not in Stasis.`;
				break;			
			
			case "kill":
			/* Debug action used to quickly test death effects. */
				this.cost = 0;
				this.act = function () {
					return `<<set $target[0].hp to 0>>`+
						`<<deathcheck>>`;
				}
				break;
				
			default:
				this.info = "Unknown action.";
		}
		
		if (this.preview === undefined && this.weight !== undefined){
			this.preview = `<<damagecalc>>\
			This attack will inflict $dmg damage.`;
		}
	}
	}
}

window.ItemAction = class ItemAction extends Action {
	constructor(name){
	if (typeof(name) == 'object'){
		super(name);
	}
	else {
		function cure (type,extension) {
			if (extension === undefined){
				extension = "";
			}
			return function () {return `<<for _k, _effect range $target[0].effects>>\
			<<if _effect.name == "${type}">>\
				<<print target().removeEffect(_effect)>>\
			<</if>>\
		<</for>>`+extension;};
		}
		super(name);
		this.item = true;
		this.cost = 0;
		this.useText = null;
		var article;
		switch (this.name.charAt(0).toLowerCase()){
			case 'i':
			case 'e':
			case 'o':
			case 'u':
			case 'a':
				article = 'an';
				break;
			default:
				article = 'a';
		}
		this.actText = `$subject[0].name uses ${article} ${this.name}.`;
		
		switch (name) {
			case "Antidote":
				this.target = "ally";
				this.act = cure("Poisoned");
				this.preview = Prev.cure("Poisoned");
				break;
				
			case "Fire Extinguisher":
				this.target = "ally";
				this.act = cure("Burning");
				this.preview = Prev.cure("Burning");
				break;
			
			case "Healing Crystal":
				this.target = "ally";
				this.act = cure("Dizzy");
				this.preview = Prev.cure("Dizzy");
				break;
				
			case "Nanites":
				this.target = "ally";
				this.act = cure("Injury");
				this.preview = Prev.cure("Injury");
				break;
				
			case "Painkiller":
				this.target = "ally";
				this.act = cure("Pain");
				this.preview = Prev.cure("Pain");
				break;
				
			case "Asprin":
				this.target = "ally";
				this.act = cure("Headache");
				this.preview = Prev.cure("Headache");
				break;
				
			case "Canned Air":
				this.target = "ally";
				this.act = cure("Winded",`<<set $target[0].en += 1>>`);
				this.preview = Prev.cure("Winded");
				break;
			
			case "Panacea":
				this.target = "ally";
				this.act = function () {
			return 		 `<<for _k, _effect range $target[0].effects>>\
					<<if _effect.buff isnot true and _effect.ULTIMATESTICKY isnot true>>\
						<<print target().removeEffect(_effect)>>\
					<</if>>\
					<</for>>`;
				}
				this.preview = Prev.cure("all");
				break;
				
			case "Bottled Chi":
				this.target = "ally";
				this.act = justeffect('t',"Chi Shield");
				this.preview = Prev.effect("Chi Shield");
				break;
				
			case "Adrenaline":
				this.effweight = (15/35);
				this.dur = 4;
				this.target = "ally";
				this.actText = `$subject[0].name injects a shot of adrenaline.`;
				this.act = justeffect('t',"ATK Boost");
				this.preview = Prev.effect("ATK Boost");
				break;
				
			case "Stoneskin":
				this.effweight = (15/35);
				this.dur = 4;
				this.target = "ally";
				this.actText = `$subject[0].name uses some Stoneskin formula.`;
				this.act = justeffect('t',"DEF Boost");
				this.preview = Prev.effect("DEF Boost");
				break;
				
			case "Nootropic":
				this.effweight = (15/35);
				this.dur = 4;
				this.target = "ally";
				this.act = justeffect('t',"SPC Boost");
				this.preview = Prev.effect("SPC Boost");
				break;
				
			case "Stimulant":
				this.target = "ally";
				this.act = function () {
			return 		 `<<set $target[0].en += 5>>\
					$target[0].name gains 5 Energy!`;
				}
				this.preview = function () {
					var note = "";
					if ((target().en + 5) > 10) {
						note = ` ...but they already have $target[0].en Energy, so some of it will be wasted.`;
					}
					return `$target[0].name will gain 5 Energy.`+note;
				}
				break;
			
			case "Throwing Knife":
				this.weight = 1.25;
				this.act = justdmg;
				this.preview = `<<damagecalc>>\
				This attack will inflict $dmg damage.`;
				break;
				
			case "Powdered Glass":
				this.weight = 1;
				this.actText = `$subject[0].name throws powdered glass in your enemy's eyes. Ouch!`;
				this.act = dmgandeffect('t',"Stunned",1);
				this.preview = Prev.effect("Stunned",'dmg');
				break;
				
			case "Grenade":
				this.weight = 1.5;
				this.actText = `$subject[0].name chucks a grenade.`;
				this.act = grenade('e');
				this.preview = Prev.grenade;
				break;
			
			case "Flamethrower":
				this.weight = 2;
				this.effweight = 0.6;
				this.phase = "confirm phase";
				this.actText = `$subject[0].name bathes your enemies in flame.`;
				this.act = massAttack('e',"Burning",5);
				this.preview = Prev.massAttack("Burning");
				break;
			
			case "Gas Bomb":
				this.weight = 2;
				this.effweight = 0.6;
				this.phase = "confirm phase";
				this.actText = `$subject[0].name throws a bomb filled with noxious gas.`;
				this.act = massAttack('e',"Poisoned",5);
				this.preview = Prev.massAttack("Poisoned");
				break;

			case "Flashbang":
				this.phase = "confirm phase";
				this.act = justeffect('mass',"Stunned",1);
				this.preview = "This will inflict Stunned status on all enemies, provided they are not Alert enough to block their eyes.";
				break;
			
			case "Calamity Bomb":
				this.weight = 1;
				this.effweight = 1;
				this.dur = 3;
				this.actText = `$subject[0].name throws a calamity bomb.`;
				this.act = function () {
					return `<<echodamage>>\
					<<addeffect $target[0] "Injury" ${this.dur} $subject[0]>>\
					<<addeffect $target[0] "Pain" ${this.dur} $subject[0]>>\
					<<addeffect $target[0] "Headache" ${this.dur} $subject[0]>>`;
				}
				this.preview = function () {
					var str = `<<damagecalc>>This will inflict $dmg damage as well as Injury, Pain, and Headache status.`;					
					if (target().stasis){
						str += " ...but <b>the target's effects are in Stasis</b>.";
					} else if (target().chi){
						str += " ...but <b>the target's Chi Shield will block the ailments</b>.";
					}
					return str;
				}
				break;
			
			default:
				this.preview = "This doesn't do anything!";
		}
	}
	}
}

Action.prototype.clone = function () {
	// Return a new instance containing our current data.
	return new Action(this);
};

Action.prototype.toJSON = function () {
	// Return a code string that will create a new instance
	// containing our current data.
	// Return a code string that will create a new instance
	// containing our current data.
	return JSON.reviveWrapper(String.format(
		'new Action({0})',
		JSON.stringify(this.name)
	));
};

ItemAction.prototype.clone = function () {
	// Return a new instance containing our current data.
	return new ItemAction(this.name);
};

ItemAction.prototype.toJSON = function () {
	// Return a code string that will create a new instance
	// containing our current data.
	return JSON.reviveWrapper(String.format(
		'new ItemAction({0})',
		JSON.stringify(this.name)
	));
};


