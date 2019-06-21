window.Effect = class Effect {
	constructor(name,time,power){
		this.name = name;
		this.duration = time;
		this.power = power;
		this.invisible = false;
		this.buff = false;
		this.unblockable = false;
		this.sticky = false;
		this.ULTIMATESTICKY = false;
		this.stackable = false;
		this.exclusive = false;
		this.statmod = false;
		this.dot = false;
		this.topDec = false;
		this.info;
		this.addText = function (target) {
			return `${target} is afflicted with <b>${this.name}</b>!`;
		};
		this.removeText = function (target) {
			return `${target} is cured of ${this.name}.`;
		}
				
		var add = function (target) {
			return `${target} is <b>${this.name}</b>!`;
		}
		var rem = function (target) {
			return `${target} is no longer ${this.name}.`;
		}
		var stance = function (target) {
			return `${target} adopts the stance of a <b>${this.name}</b>.`;
		}
		var remDebuff = function (target) {
			return `${target}'s ${this.name} is cured.`;
		}
		var remBuff = function (target) {
			switch (this.name.charAt(0).toLowerCase()){
				case 'a':
				case 'i':
				case 'o':
				case 'u':
				case 'e':
					var article = 'an';
					break;
				default:
					var article = 'a';
			}
			return `${target} loses ${article} ${this.name}.`;
		}
		var invisible = function () {return "";}
		
		var physical = function (puppet) {
			return this.weight*(V().base + (V().damper * (this.power - puppet.get("Defense"))));
		}
		var special = function (puppet) {
			return this.weight*(V().base + (V().damper * (this.power - puppet.get("Special"))));
		}
		var piercing = function (puppet) {
			return this.weight*(V().base + (V().damper * this.power));
		}
		var proportional = function (puppet) {
			return this.weight * puppet.maxhp;
		}
		var fixed = function (puppet) {
			return this.power;
		}
		
		switch (name) {
			case 'Injury':
				this.stackable = true;
				this.statmod = true;
				this.onApply = function (puppet) {
					puppet.setTemp("Attack",-this.power);
				}
				this.onRemove = function (puppet) {
					puppet.setTemp("Attack",this.power);
				}
				this.info = function () {
					return `Attack reduced by ${this.power}.`;
				}
				this.addText = function (target) {
					return `${target} suffers an <b>Injury</b>!`;
				}
				this.removeText = remDebuff;
				break;
			case 'Pain':
				this.stackable = true;
				this.statmod = true;
				this.onApply = function (puppet) {
					puppet.setTemp("Defense",-this.power);
				}
				this.onRemove = function (puppet) {
					puppet.setTemp("Defense",this.power);
				}
				this.info = function () {
					return `Defense reduced by ${this.power}.`;
				}
				this.addText = function (target) {
					return `${target} is struck with <b>Pain</b>!`;
				}
				this.removeText = remDebuff;
				break;
			case 'Headache':
				this.stackable = true;
				this.statmod = true;
				this.onApply = function (puppet) {
					puppet.setTemp("Special",-this.power);
				}
				this.onRemove = function (puppet) {
					puppet.setTemp("Special",this.power);
				}
				this.info = function () {
					return `Special reduced by ${this.power}.`;
				}
				this.addText = function (target) {
					return `${target} gets a <b>Headache</b>!`;
				}
				this.removeText = remDebuff;
				break;
			case 'ATK Boost':
				this.buff = true;
				this.stackable = true;
				this.statmod = true;
				this.onApply = function (puppet) {
					puppet.setTemp("Attack",this.power);
				}
				this.onRemove = function (puppet) {
					puppet.setTemp("Attack",-this.power);
				}
				this.info = function () {
					return `Attack boosted by ${this.power}.`;
				}
				this.addText = function (target) {
					return `${target} is surging with strength!`;
				}
				this.removeText = remBuff;
				break;
			case 'DEF Boost':
				this.buff = true;
				this.stackable = true;
				this.statmod = true;
				this.onApply = function (puppet) {
					puppet.setTemp("Defense",this.power);
				}
				this.onRemove = function (puppet) {
					puppet.setTemp("Defense",-this.power);
				}
				this.info = function () {
					return `Defense boosted by ${this.power}.`;
				}
				this.addText = function (target) {
					return `${target} feels tougher.`;
				}
				this.removeText = remBuff;
				break;
			case 'SPC Boost': 
				this.buff = true;
				this.stackable = true;
				this.statmod = true;
				this.onApply = function (puppet) {
					puppet.setTemp("Special",this.power);
				}
				this.onRemove = function (puppet) {
					puppet.setTemp("Special",-this.power);
				}
				this.info = function () {
					return `Special boosted by ${this.power}.`;
				}
				this.addText = function (target) {
					return `${target}'s mind is racing.`;
				}
				this.removeText = remBuff;
				break;
			case 'Burning':
				this.dot = true;
				this.type = physical;
				this.msg = function (target) {return `${target.name} takes $dmg burning damage!`}
				this.onApply = function (puppet) {
					puppet.burning = true;
				}
				this.onRemove = function (puppet) {
					puppet.burning = false;
				}
				this.info = function () {
					return `Inflicts <<print _effect.damage($actor[0])>> physical damage per round.`;
				}
				this.addText = add;
				this.removeText = rem;
				break;
			case 'Perdition':
				this.dot = true;
				this.type = piercing;
				this.msg = function (target) {return `The fires of perdition burn in ${target.name}'s soul. ${target.name} takes $dmg magical damage.`}
				this.sticky = true;
				this.onApply = function (puppet) {
					puppet.perdition = true;
				}
				this.onRemove = function (puppet) {
					puppet.perdition = false;
				}
				this.info = function () {
					return `Inflicts <<print _effect.damage($actor[0])>> magical damage per round.`;
				}
				this.addText = function (target) {
					return `${target} feels the fires of <b>Perdition</b>.`;
				}
				this.removeText = function (target) {
					return `${target} is freed from the fires of Perdition.`;
				}
				break;
			case 'Poisoned':
				this.dot = true;
				this.type = special;
				this.msg = function (target) {return `${target.name} takes $dmg poison damage!`}
				this.onApply = function (puppet) {
					puppet.poisoned = true;
				}
				this.onRemove = function (puppet) {
					puppet.poisoned = false;
				}
				this.info = function () {
					return `Inflicts <<print _effect.damage($actor[0])>> special damage per round.`;
				}
				this.addText = add;
				this.removeText = rem;
				break;
			case 'Dizzy':				
				this.onApply = function (puppet) {
					puppet.dizzy = true;
				}
				this.onRemove = function (puppet) {
					puppet.dizzy = false;
				}
				this.info = function () {
					return `Can only use basic skills.`;
				}
				this.addText = add;
				this.removeText = rem;
				break;
			case 'Winded':		
				this.onApply = function (puppet) {
					puppet.winded = true;
				}
				this.onRemove = function (puppet) {
					puppet.winded = false;
				}
				this.info = function () {
					return `No Energy regen.`;
				}
				this.addText = add;
				this.removeText = rem;
				break;
			case 'Stunned':
				this.onApply = function (puppet) {
					puppet.stunned = true;
					puppet.noact = true;
				}
				this.onRemove = function (puppet) {
					puppet.stunned = false;
					puppet.noact = false;
					if (V().inbattle){
						var d;
						if (puppet.boss){
							d = 7;
						} else {
							d = 3;
						}						
						puppet.addEffect(new Effect("Alert",d,0));
					}
				}
				this.info = function () {
					return `Cannot act.`;
				}
				this.addText = add;
				this.removeText = rem;
				break;
			case 'Off-Balance':
				this.topDec = true;
				this.onApply = function (puppet) {
					puppet.offbalance = true;
				}
				this.onRemove = function (puppet) {
					puppet.offbalance = false;
				}
				this.info = function () {
					return `Direct damage will inflict Knocked Down.`;
				}
				this.addText = add;
				this.removeText = rem;
				break;
			case 'Knocked Down':
				this.statmod = true;
				this.onApply = function (puppet) {
					puppet.down = true;
					puppet.noact = true;
					var p = puppet.getBase("Defense")/2;
					puppet.setTemp("Defense",-p);
				}
				this.onRemove = function (puppet) {
					puppet.down = false;
					puppet.noact = false;
					var p = puppet.getBase("Defense")/2;
					puppet.setTemp("Defense",p);
				}
				this.info = function () {
					return `Cannot act until righted. Defense halved.`;
				}
				this.addText = add;
				this.removeText = rem;
				break;
			case 'Curse':
				this.statmod = true;
				this.onApply = function (puppet) {
					puppet.curse = true;
					puppet.setTemp("Attack",-this.power);
					puppet.setTemp("Defense",-this.power);
					puppet.setTemp("Special",-this.power);
				}
				this.onRemove = function (puppet) {
					puppet.curse = false;
					puppet.setTemp("Attack",this.power);
					puppet.setTemp("Defense",this.power);
					puppet.setTemp("Special",this.power);
				}
				this.info = function () {
					return `All stats reduced by ${this.power}.`;
				}
				this.addText = function (target) {
					return `${target} can't seem to do anything right.`;
				}
				this.removeText = function (target) {
					return `${target}'s ${this.name} is lifted.`;
				}
				break;
			case 'Forsaken':
				this.statmod = true;
				this.onApply = function (puppet) {
					puppet.forsaken = true;
					puppet.setTemp("Defense",-this.power);
				}
				this.onRemove = function (puppet) {
					puppet.forsaken = false;
					puppet.setTemp("Defense",this.power);
				}
				this.info = function () {
					return `Defense reduced by ${this.power}. Defense can be negative.`;
				}
				this.addText = function (target) {
					return `${target} is <b>Forsaken</b>.`;
				}
				this.removeText = rem;
				break;
			case 'Blessing': 
				this.buff = true;
				this.statmod = true;
				this.onApply = function (puppet) {
					puppet.blessing = true;
					puppet.setTemp("Attack",this.power);
					puppet.setTemp("Defense",this.power);
					puppet.setTemp("Special",this.power);
				}
				this.onRemove = function (puppet) {
					puppet.blessing = false;
					puppet.setTemp("Attack",-this.power);
					puppet.setTemp("Defense",-this.power);
					puppet.setTemp("Special",-this.power);
				}
				this.info = function () {
					return `All stats boosted by ${this.power}.`;
				}
				this.addText = function (target) {
					return `${target} feels a sense of grace.`;
				}
				this.removeText = remBuff;
				break;
			case 'Alert':
				this.buff = true;
				this.sticky = true;
				this.unblockable = true;
				this.onApply = function (puppet) {
					puppet.alert = true;
				}
				this.onRemove = function (puppet) {
					puppet.alert = false;
				}
				this.info = function () {
					return `Can't be stunned.`;
				}
				this.addText = invisible;
				this.removeText = rem;
				break;
			case 'Chi Shield':
				this.buff = true;
				this.sticky = true;
				this.onApply = function (puppet) {
					puppet.chi = true;
				}
				this.onRemove = function (puppet) {
					puppet.chi = false;
				}
				this.info = function () {
					return `Protected from ailments.`;
				}
				this.addText = function (target) {
					return `${target} has a tangible aura.`;
				}
				this.removeText = function (target) {
					return `${target} is no longer protected by ${this.name}.`;
				}
				break;
			case 'Protector':
				this.buff = true;
				this.statmod = true;
				this.exclusive = true;
				this.unblockable = true;
				this.onApply = function (puppet) {
					puppet.protector = true;
					puppet.setTemp("Defense",this.power);
				}
				this.onRemove = function (puppet) {
					puppet.protector = false;
					puppet.setTemp("Defense",-this.power);
					var party;
					if (puppet instanceof Puppet){
						party = V().puppets;
					} else if (puppet instanceof Enemy) {
						party = V().enemies;
					}
					var pos = party.map(function(x) { return(x.protectedBy) }).indexOf("\'"+puppet.name+"\'");
					if (pos > -1){
						party[pos].protected = false;
						party[pos].protectedBy = null;
					}
				}
				this.info = function () {
					return `Taking hits for an ally. Defense boosted by ${this.power}.`;
				}
				this.addText = function (target) {
					return `${target} is protecting $target[0].name.`;
				}
				this.removeText = function (target) {
					return `${target} is no longer protecting anyone.`;
				}
				break;
			case 'Martyr': 
				this.buff = true;
				this.exclusive = true;
				this.topDec = true;
				this.onApply = function (puppet) {
					puppet.martyr = true;
				}
				this.onRemove = function (puppet) {
					puppet.martyr = false;
				}
				this.info = function () {
					return `Will be targeted by all direct attacks.`;
				}
				this.addText = function (target) {
					return `All eyes are on ${target}.`;
				}
				this.removeText = invisible;
				break;
			case 'Hunter': 
				this.buff = true;
				this.exclusive = true;
				this.topDec = true;
				this.onApply = function (puppet) {
					puppet.hunter = true;
				}
				this.onRemove = function (puppet) {
					puppet.hunter = false;
				}
				this.info = function () {
					return `Counterattacking.`;
				}
				this.addText = stance;
				this.removeText = invisible;
				break;
			case 'Hidden': 
				this.buff = true;
				this.exclusive = true;
				this.onApply = function (puppet) {
					puppet.untargetable = true;
				}
				this.onRemove = function (puppet) {
					puppet.untargetable = false;
				}
				this.info = function () {
					return `Can't be targeted by direct attacks.`;
				}
				this.addText = function (target) {
					return `${target} is evading attacks.`;
				}
				this.removeText = function (target) {
					return `${target} is no longer hidden.`;
				}
				break;
			case 'Berserker':
				this.buff = true;
				this.exclusive = true;
				this.topDec = true;
				this.onApply = function (puppet) {
					puppet.beserker = true;
				}
				this.onRemove = function (puppet) {
					puppet.berserker = false;
				}
				this.info = function () {
					return `Damage dealt and received up by <<print $berserk_factor*100>>%.`;
				}
				this.addText = stance;
				this.removeText = invisible;
				break;
			case 'Defender':
				this.buff = true;
				this.exclusive = true;
				this.topDec = true;
				this.onApply = function (puppet) {
					puppet.defender = true;
				}
				this.onRemove = function (puppet) {
					puppet.defender = false;
				}
				this.info = function () {
					return `Damage dealt and received down by <<print $berserk_factor*100>>%.`;
				}
				this.addText = stance;
				this.removeText = invisible;
				break;
			case 'Shield':
				this.buff = true;
				this.onApply = function (puppet) {
					puppet.shield = true;
				}
				this.onRemove = function (puppet) {
					puppet.shield = false;
				}
				this.info = function () {
					return `Incoming damage reduced by <<print $SHIELD_FACTOR*100>>%.`;
				}
				this.addText = function (target) {
					return `The air before ${target} glimmers with a magical <b>Shield</b>.`;
				}
				this.removeText = function (target) {
					return `${target}'s Shield is gone.`;
				}
				break;
			case 'Frenzy':
				this.buff = true;
				this.onApply = function (puppet) {
					puppet.frenzy = true;
					puppet.setTemp("Attack",this.power);
					puppet.setTemp("Defense",-this.power/2);
				}
				this.onRemove = function (puppet) {
					puppet.frenzy = false;
					puppet.setTemp("Attack",-this.power);
					puppet.setTemp("Defense",this.power/2);
				}
				this.info = function () {
					return `Attack boosted by ${this.power}; Defense reduced by ${Math.round(this.power/2)}.`;
				}
				this.addText = function (target) {
					return `${target} feels the <b>Frenzy</b>!`;
				}
				this.removeText = function (target) {
					return `${target} is no longer in a Frenzy.`;
				}
				break;
			case 'Stasis':
				this.unblockable = true;
				this.sticky = true;
				this.onApply = function (puppet) {
					puppet.stasis = true;
				}
				this.onRemove = function (puppet) {
					puppet.stasis = false;
				}
				this.info = function () {
					return `Effects will not decay. Effects cannot be added or removed.`;
				}
				this.addText = function (target) {
					return `${target}'s effects are placed in <b>Stasis</b>.`;
				}
				this.removeText = function (target) {
					return `${target}'s effects are no longer in Stasis.`;
				}
				break;
			case 'Marked':
				this.onApply = function (puppet) {
					puppet.marked = true;
				}
				this.onRemove = function (puppet) {
					puppet.marked = false;
				}
				this.info = function () {
					return `Will be shot every time someone attacks.`;
				}
				this.addText = add;
				this.removeText = rem;
				break;
			case 'Guarded':
				/* Note that this functions uniquely. The AoE protection is automatic, but everyone else taking hits for Steven is hard-coded into the "battle interruptions" passage. You may want to generalize it, but you will need to add your own code for that. */
				this.buff = true;
				this.sticky = true;
				this.ULTIMATESTICKY = true;
				this.onApply = function (puppet) {
					puppet.guarded = true;
				}
				this.onRemove = function (puppet) {
					puppet.guarded = false;
				}
				this.info = function () {
					return `Protected from direct attacks; out of reach of area attacks.`;
				}
				this.removeText = invisible;
				break;
			case 'Bubble':
				this.buff = true;
				this.onApply = function (puppet) {
					puppet.bubbled = true;
				}
				this.onRemove = function (puppet) {
					puppet.bubbled = false;
				}
				this.info = function () {
					return `Protects against one attack.`;
				}
				this.addText = function (target) {
					return `Translucent pink petals rise from the ground to wrap ${target} in a protective bubble.`;
				}
				this.removeText = function (target) {
					return `${target}'s bubble shield dissipates.`;
				}
				break;
			case 'Doom':
				this.dot = true;
				this.type = piercing;
				this.msg = function (target) {return `${target.name}'s doom ticks closer. They suffer $dmg damage.`}
				this.onApply = function (puppet) {
					puppet.doom = true;
				}
				this.onRemove = function (puppet) {
					puppet.doom = false;
				}
				this.info = function () {
					return `Inflicts <<print _effect.damage($actor[0])>> magical damage per round.`;
				}
				this.addText = function (target) {
					return `${target} is cursed with <b>Doom</b>! Their life ticks away...`;
				}
				this.removeText = function (target) {
					return `${target}'s ${this.name} is dispelled.`;
				}
				break;
			case 'Asleep':
				this.onApply = function (puppet) {
					puppet.asleep = true;
					puppet.noact = true;
				}
				this.onRemove = function (puppet) {
					puppet.asleep = false;
					puppet.noact = false;
				}
				this.info = function () {
					return `Cannot act.`;
				}
				this.addText = add;
				this.removeText = function (target) {
					return `${target} wakes up!`;
				}
				break;
			case 'Petrified':
				this.onApply = function (puppet) {
					puppet.petrified = true;
					puppet.noact = true;
				}
				this.onRemove = function (puppet) {
					puppet.petrified = false;
					puppet.noact = false;
				}
				this.info = function () {
					return `Cannot act.`;
				}
				this.addText = add;
				this.removeText = rem;
				break;
			case 'Thorns':
				this.buff = true;
				this.onApply = function (puppet) {
					puppet.thorns = true;
				}
				this.onRemove = function (puppet) {
					puppet.thorns = false;
				}
				this.info = function () {
					return `Protects and counterattacks against one attack.`;
				}
				this.addText = function (target) {
					return `Translucent pink petals rise from the ground to wrap ${target} in a protective bubble that grows menacing, spiky thorns all around.`;
				}
				this.removeText = function (target) {
					return `${target}'s spiky bubble dissipates.`;
				}
				break;
			case `Rose's Thorns`:
				this.dot = true;
				this.type = proportional;
				this.msg = function (target) {return `Rose's thorns are choking the life out of ${target}. They take $dmg damage.`}
				this.sticky = true;
				this.ULTIMATESTICKY = true;
				this.unblockable = true;
				this.onApply = function (puppet) {
					return;
				}
				this.onRemove = function (puppet) {
					return;
				}
				this.info = function () {
					return `Inflicts <<print _effect.damage($actor[0])>> damage per round. Irremovable.`;
				}
				this.addText = invisible;
				this.removeText = invisible;
				break;
			case `Rose's Shield`:
				this.buff = true;
				this.sticky = true;
				this.ULTIMATESTICKY = true;
				this.onApply = function (puppet) {
					puppet.roseshield = true;
				}
				this.onRemove = function (puppet) {
					puppet.roseshield = false;
				}
				this.info = function () {
					return `Reduces all damage by 60%. Irremovable.`;
				}
				/* This is cheating a little since in canon it is pretty clearly invincible. I am going with the old-school D&D justification that hit points are more endurance than literal health, and successful hits are still tiring Rose out. */
				this.addText = invisible;
				this.removeText = invisible;
				break;
			default:
				this.info = function () {return "This effect isn't in the database!";}
				this.addText = function (target) {
					return `An unknown effect (${this.name}) was applied.`;
				}
		}		
	}
}

window.DoT = class DoT extends Effect {
	constructor(name,time,power,weight){
		super(name,time,power);
		this.weight = weight;
		this.dot = true;
		this.damage = function (puppet) {
			var dmg = Math.round(this.type(puppet));
			if (dmg < V().min_DoT){
				dmg = V().min_DoT;
			}
			return dmg;
		}
	}
}

window.Protector = class Protector extends Effect {
	constructor(name,time,power,target){
		super(name,time,power);
		this.target = target;
	}
}

Effect.prototype.clone = function () {
	// Return a new instance containing our current data.
	return new Effect(this.name,this.duration,this.power);
};

Effect.prototype.toJSON = function () {
	// Return a code string that will create a new instance
	// containing our current data.
	return JSON.reviveWrapper(String.format(
		'new Effect({0},{1},{2})',
		JSON.stringify(this.name),
		JSON.stringify(this.duration),
		JSON.stringify(this.power)
	));
};

DoT.prototype.clone = function () {
	// Return a new instance containing our current data.
	return new DoT(this.name,this.duration,this.power,this.weight);
};

DoT.prototype.toJSON = function () {
	// Return a code string that will create a new instance
	// containing our current data.
	return JSON.reviveWrapper(String.format(
		'new DoT({0},{1},{2},{3})',
		JSON.stringify(this.name),
		JSON.stringify(this.duration),
		JSON.stringify(this.power),
		JSON.stringify(this.weight)
	));
};

Protector.prototype.clone = function () {
	// Return a new instance containing our current data.
	return new Protector(this.name,this.duration,this.power,this.target);
};

Protector.prototype.toJSON = function () {
	// Return a code string that will create a new instance
	// containing our current data.
	return JSON.reviveWrapper(String.format(
		'new Protector({0},{1},{2},{3})',
		JSON.stringify(this.name),
		JSON.stringify(this.duration),
		JSON.stringify(this.power),
		JSON.stringify(this.target)
	));
};

