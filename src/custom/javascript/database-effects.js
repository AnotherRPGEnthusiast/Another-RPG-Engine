setup.effectData = {

	"Example": {
		"persistAfterBattle":	false,
		"persistAfterDeath":	false,
		"buff": 							false,
		"stackable": 					false,
		"sticky": 						false,
		"ULTIMATESTICKY": 		false,
		"unblockable": 				false,
		"topDec":							false,
		"exclusive":					false,
		"unique":							false,
		"statmod": 						false,
		"uncontrollable": 		false,
		"untargetable": 			false,
		"skillLock":					false,
		"guardBreak":					false,
		"threat":							undefined,
		"shock":							0,
		// block subtype:
		"block": false,
			"blockCondition": function (effect) {
				return false;
			},
			"blockText": function (actor) {
				return ``;
			},
		// hold subtype:
		"hold":	false,
			"holdAction": function () {
				return {useText: null,
					actText: "",
					act: null};
			},
		// DoT subtype:
		"dot": false,
			"dmgtype": "",
			"msg": function (target) {return ``},
		// shield subtype:
		"shield": false,
			"uses": 0,
			"onHit": function (puppet) {
						return ``;
			},

		"priority": 0,	// hold or block only
		"onApply": function (puppet) {

		},
		"onRemove": function (puppet) {

		},
		"info": function (effect) {
			return ``;
		},
		"addText": function (target) {
			return ``;
		},
		"removeText": function (target) {
			return ``;
		}
	},


  "Injury": {
    "stackable": true,
    "statmod": true,
    "onApply": function (puppet) {
      this.id = puppet.stats[StatName("atk")].addMod("Injury",-this.power);
    },
    "onRemove": function (puppet) {
      puppet.stats[StatName("atk")].removeMod("Injury",this.id);
    },
    "info": function (effect) {
      return `Attack reduced by ${this.power}.`;
    },
    "addText": function (actor) {
      return `${actor.name} suffers an <b>Injury</b>!`;
    },
    "removeText": setup.effectFunctions.remDebuff
  },
  "Pain": {
    "stackable": true,
    "statmod": true,
    "onApply": function (puppet) {
      this.id = puppet.stats[StatName("def")].addMod("Pain",-this.power);
    },
    "onRemove": function (puppet) {
      puppet.stats[StatName("def")].removeMod("Pain",this.id);
    },
    "info": function (effect) {
      return `Defense reduced by ${this.power}.`;
    },
    "addText": function (actor) {
      return `${actor.name} is struck with <b>Pain</b>!`;
    },
    "removeText": setup.effectFunctions.remDebuff
  },
  "Headache": {
    "stackable": true,
    "statmod": true,
    "onApply": function (puppet) {
      this.id = puppet.stats[StatName("spc")].addMod("Headache",-this.power);
    },
    "onRemove": function (puppet) {
      puppet.stats[StatName("spc")].removeMod("Headache",this.id);
    },
    "info": function (effect) {
      return `Special reduced by ${this.power}.`;
    },
    "addText": function (actor) {
      return `${actor.name} gets a <b>Headache</b>!`;
    },
    "removeText": setup.effectFunctions.remDebuff
  },
  "ATK Boost": {
    "buff": true,
    "stackable": true,
    "statmod": true,
    "onApply": function (puppet) {
      this.id = puppet.stats[StatName("atk")].addMod("ATK Boost",this.power);
    },
    "onRemove": function (puppet) {
      puppet.stats[StatName("atk")].removeMod("ATK Boost",this.id);
    },
    "info": function (effect) {
      return `Attack boosted by ${this.power}.`;
    },
    "addText": function (actor) {
      return `${actor.name} is surging with strength!`;
    },
    "removeText": setup.effectFunctions.remBuff
  },
  "DEF Boost": {
    "buff": true,
    "stackable": true,
    "statmod": true,
    "onApply": function (puppet) {
      this.id = puppet.stats[StatName("def")].addMod("DEF Boost",this.power);
    },
    "onRemove": function (puppet) {
      puppet.stats[StatName("def")].removeMod("DEF Boost",this.id);
    },
    "info": function (effect) {
      return `Defense boosted by ${this.power}.`;
    },
    "addText": function (actor) {
      return `${actor.name} feels tougher.`;
    },
    "removeText": setup.effectFunctions.remBuff
  },
  "SPC Boost": {
    "buff": true,
    "stackable": true,
    "statmod": true,
    "onApply": function (puppet) {
      this.id = puppet.stats[StatName("spc")].addMod("SPC Boost",this.power);
    },
    "onRemove": function (puppet) {
      puppet.stats[StatName("spc")].removeMod("SPC Boost",this.id);
    },
    "info": function (effect) {
      return `Special boosted by ${this.power}.`;
    },
    "addText": function (actor) {
      return `${actor.name}'s mind is racing.`;
    },
    "removeText": setup.effectFunctions.remBuff
  },
  "Burning": {
    "dot": true,
    "dmgtype": setup.effectFunctions.physical,
    "msg": function (actor) {return `${actor.name} is burning!`},
    "onApply": function (puppet) {
      puppet.burning = true;
    },
    "onRemove": function (puppet) {
      puppet.burning = false;
    },
    "info": function (effect) {
      return `Inflicts <<print _effect.damage($B.actor)>> physical damage per round.`;
    },
    "addText": setup.effectFunctions.add,
    "removeText": setup.effectFunctions.rem
  },
  "Perdition": {
    "dot": true,
    "dmgtype": setup.effectFunctions.piercing,
    "msg": function (actor) {return `The fires of perdition burn in ${actor.name}'s soul.`},
    "sticky": true,
    "synonym": "Burning",
    "onApply": function (puppet) {
      puppet.perdition = true;
    },
    "onRemove": function (puppet) {
      puppet.perdition = false;
    },
    "info": function (effect) {
      return `Inflicts <<print _effect.damage($B.actor)>> magical damage per round.`;
    },
    "addText": function (actor) {
      return `${actor.name} feels the fires of <b>Perdition</b>.`;
    },
    "removeText": function (actor) {
      return `${actor.name} is freed from the fires of Perdition.`;
    }
  },
  "Poisoned": {
    "dot": true,
    "dmgtype": setup.effectFunctions.special,
    "msg": function (actor) {return `${actor.name} writhes in agony as poison courses through ${actor.their} veins.`},
    "onApply": function (puppet) {
      puppet.poisoned = true;
    },
    "onRemove": function (puppet) {
      puppet.poisoned = false;
    },
    "info": function (effect) {
      return `Inflicts <<print _effect.damage($B.actor)>> special damage per round.`;
    },
    "addText": setup.effectFunctions.add,
    "removeText": setup.effectFunctions.rem
  },
  "Dizzy": {
		"skillLock": true,
    "onApply": function (puppet) {
      puppet.dizzy = true;
    },
    "onRemove": function (puppet) {
      puppet.dizzy = false;
    },
    "info": function (effect) {
      return `Can only use basic skills.`;
    },
    "addText": setup.effectFunctions.add,
    "removeText": setup.effectFunctions.rem
  },
  "Winded": {
		"noENregen": true,
    "onApply": function (puppet) {

    },
    "onRemove": function (puppet) {

    },
    "info": function (effect) {
      return `No Energy regen.`;
    },
    "addText": setup.effectFunctions.add,
    "removeText": setup.effectFunctions.rem
  },
  "Stunned": {
    "hold": true,
    "onApply": function (puppet) {
      puppet.stunned = true;
    },
    "onRemove": function (puppet) {
      puppet.stunned = false;
      if (V().inbattle){
        var d;
        if (puppet.boss){
          d = 7;
        } else {
          d = 3;
        }
        puppet.addEffect("Alert",{time: d, noPopup: true});
      }
    },
    "info": function (effect) {
      return `Cannot act.`;
    },
    "holdAction": function () {
      temporary().enemy.decCD();
      return {useText: null,
        actText: "_enemy.name is stunned!",
        act: null};
    },
    "priority": 1,
    "addText": setup.effectFunctions.add,
    "removeText": setup.effectFunctions.rem
  },
  "Off-Balance": {
    "topDec": true,
    "onApply": function (puppet) {
      puppet.offbalance = true;
    },
    "onRemove": function (puppet) {
      puppet.offbalance = false;
    },
    "info": function (effect) {
      return `Direct damage will inflict Knocked Down.`;
    },
    "addText": setup.effectFunctions.add,
    "removeText": setup.effectFunctions.rem
  },
  "Knocked Down": {
    "hold": true,
    "onApply": function (puppet) {
      puppet.down = true;
      puppet.stats[StatName("def")].addMod("Knocked Down",{mult: -0.5});
    },
    "onRemove": function (puppet) {
      puppet.down = false;
      puppet.stats[StatName("def")].removeMod("Knocked Down");
    },
    "info": function (effect) {
      return `Cannot act until righted. Defense halved.`;
    },
    "holdAction": function () {
      temporary().enemy.removeEffect("Knocked Down",{pierce: true, noPopup: true});
      return {useText: null,
        actText: "_enemy.name struggles back to _enemy.their feet.",
        act: null};
    },
    "priority": 2,
    "addText": setup.effectFunctions.add,
    "removeText": setup.effectFunctions.rem
  },
  "Curse": {
    "statmod": true,
    "threat": 3,
    "onApply": function (puppet) {
      puppet.curse = true;
      puppet.stats[StatName("atk")].addMod("Curse",-this.power);
      puppet.stats[StatName("def")].addMod("Curse",-this.power);
      puppet.stats[StatName("spc")].addMod("Curse",-this.power);
    },
    "onRemove": function (puppet) {
      puppet.curse = false;
      puppet.stats[StatName("atk")].removeMod("Curse"),
      puppet.stats[StatName("def")].removeMod("Curse"),
      puppet.stats[StatName("spc")].removeMod("Curse");
    },
    "info": function (effect) {
      return `All stats reduced by ${this.power}.`;
    },
    "addText": function (actor) {
      return `${actor.name} can't seem to do anything right.`;
    },
    "removeText": function (actor) {
      return `${actor.name}'s ${this.name} is lifted.`;
    }
  },
  "Forsaken": {
    "statmod": true,
    "synonym": "Curse",
    "onApply": function (puppet) {
      puppet.noMinimum.push(StatName("def"));
      puppet.stats[StatName("def")].addMod("Forsaken",-this.power);
    },
    "onRemove": function (puppet) {
      puppet.noMinimum.deleteAt(puppet.noMinimum.indexOf(StatName("def")));
      puppet.stats[StatName("def")].removeMod("Forsaken");
    },
    "info": function (effect) {
      return `Defense reduced by ${this.power}. Defense can be negative.`;
    },
    "addText": function (actor) {
      return `${actor.name} is <b>Forsaken</b>.`;
    },
    "removeText": setup.effectFunctions.rem
  },
  "Blessing": {
    "buff": true,
    "statmod": true,
    "threat": 3,
    "onApply": function (puppet) {
      puppet.blessing = true;
      puppet.stats[StatName("atk")].addMod("Blessing",this.power);
      puppet.stats[StatName("def")].addMod("Blessing",this.power);
      puppet.stats[StatName("spc")].addMod("Blessing",this.power);
    },
    "onRemove": function (puppet) {
      puppet.blessing = false;
      puppet.stats[StatName("atk")].removeMod("Blessing");
      puppet.stats[StatName("def")].removeMod("Blessing");
      puppet.stats[StatName("spc")].removeMod("Blessing");
    },
    "info": function (effect) {
      return `All stats boosted by ${this.power}.`;
    },
    "addText": function (actor) {
      return `${actor.name} feels a sense of grace.`;
    },
    "removeText": setup.effectFunctions.remBuff
  },
  "Alert": {
    "buff": true,
    "sticky": true,
    "unblockable": true,
    "block": true,
    "priority": 3,
    "blockCondition": function (effect) {
      return effect.name === "Stunned";
    },
    "blockText": function (actor) {
      return `${actor.name} saw it coming and wasn't stunned!`;
    },
    "onApply": function (puppet) {
      puppet.alert = true;
    },
    "onRemove": function (puppet) {
      puppet.alert = false;
    },
    "info": function (effect) {
      return `Can't be stunned.`;
    },
    "addText": setup.effectFunctions.invisible,
    "removeText": setup.effectFunctions.rem
  },
  "Chi Shield": {
    "buff": true,
    "sticky": true,
    "block": true,
    "priority": 2,
    "blockCondition": function (effect) {
      return !(effect.buff || target().id === subject().id);
    },
    "blockText": function (actor) {
      return `${actor.name}'s Chi Shield protected ${actor.them} from the ailment.`;
    },
    "onApply": function (puppet) {
      puppet.chi = true;
    },
    "onRemove": function (puppet) {
      puppet.chi = false;
    },
    "info": function (effect) {
      return `Protected from ailments.`;
    },
    "addText": function (actor) {
      return `${actor.name} has a tangible aura.`;
    },
    "removeText": function (actor) {
      return `${actor.name} is no longer protected by ${this.name}.`;
    }
  },
  "Protector": {
    "topDec": true,
    "buff": true,
    "statmod": true,
    "exclusive": true,
    "unblockable": true,
		"guard": true,
    "onApply": function (puppet) {
      puppet.protector = true;
      puppet.stats[StatName("def")].addMod("Protector",this.power);
    },
    "onRemove": function (puppet) {
      puppet.protector = false;
      puppet.stats[StatName("def")].removeMod("Protector");
      var targets = [];
      switch(this.target.id.charAt(0)) {
        case "p": targets = State.variables.puppets; break;
        case "e": targets = State.variables.enemies; break;
        default: console.log("ERROR: Target ID does not match any known party.");
      }
      var id = this.target.id;
      var actor = targets.find(function(t) { return t && t.id === id; });
      actor.protectedBy = null;
    },
    "info": function (effect) {
      return `Taking hits for ${effect.target.name}. Defense boosted by ${effect.power}.`;
    },
    "addText": function (actor) {
      return `${actor.name} is protecting $target.name.`;
    },
    "removeText": function (actor) {
      return `${actor.name} is no longer protecting anyone.`;
    }
  },
  "Martyr": {
    "buff": true,
    "exclusive": true,
		"unique": true,
    "topDec": true,
    "threat": 0,
    "onApply": function (puppet) {
      puppet.martyr = true;
    },
    "onRemove": function (puppet) {
      puppet.martyr = false;
    },
    "info": function (effect) {
      return `Will be targeted by all direct attacks.`;
    },
    "addText": function (actor) {
      return `All eyes are on ${actor.name}.`;
    },
    "removeText": setup.effectFunctions.invisible
  },
  "Hunter": {
    "buff": true,
    "exclusive": true,
    "topDec": true,
    "onApply": function (puppet) {
      puppet.hunter = true;
    },
    "onRemove": function (puppet) {
      puppet.hunter = false;
    },
    "info": function (effect) {
      return `Counterattacking.`;
    },
    "addText": setup.effectFunctions.stance,
    "removeText": setup.effectFunctions.invisible
  },
  "Hidden": {
    "untargetable": true,
    "buff": true,
    "exclusive": true,
    "onApply": function (puppet) {
      return;
    },
    "onRemove": function (puppet) {
      return;
    },
    "info": function (effect) {
      return `Can't be targeted by direct attacks.`;
    },
    "addText": function (actor) {
      return `${actor.name} is evading attacks.`;
    },
    "removeText": function (actor) {
      return `${actor.name} is no longer hidden.`;
    }
  },
  "Berserker": {
    "buff": true,
    "exclusive": true,
    "topDec": true,
    "onApply": function (puppet) {
      puppet.berserker = true;
    },
    "onRemove": function (puppet) {
      puppet.berserker = false;
    },
    "info": function (effect) {
      return `Damage dealt and received up by <<print setup.BERSERK_FACTOR*100>>%.`;
    },
    "addText": setup.effectFunctions.stance,
    "removeText": setup.effectFunctions.invisible
  },
  "Defender": {
    "buff": true,
    "exclusive": true,
    "topDec": true,
    "threat": 0,
    "onApply": function (puppet) {
      puppet.defender = true;
    },
    "onRemove": function (puppet) {
      puppet.defender = false;
    },
    "info": function (effect) {
      return `Damage dealt and received down by <<print setup.DEFEND_FACTOR*100>>%.`;
    },
    "addText": setup.effectFunctions.stance,
    "removeText": setup.effectFunctions.invisible
  },
  "Shield": {
    "buff": true,
    "onApply": function (puppet) {
      puppet.shield = true;
    },
    "onRemove": function (puppet) {
      puppet.shield = false;
    },
    "info": function (effect) {
      return `Incoming damage reduced by <<print setup.SHIELD_FACTOR*100>>%.`;
    },
    "addText": function (actor) {
      return `The air before ${actor.name} glimmers with a magical <b>Shield</b>.`;
    },
    "removeText": function (actor) {
      return `${actor.name}'s Shield is gone.`;
    }
  },
  "Frenzy": {
    "statmod": true,
    "buff": true,
    "onApply": function (puppet) {
      puppet.frenzy = true;
      puppet.stats[StatName("atk")].addMod("Frenzy",this.power);
      puppet.stats[StatName("def")].addMod("Frenzy",-this.power/2);
    },
    "onRemove": function (puppet) {
      puppet.frenzy = false;
      puppet.stats[StatName("atk")].removeMod("Frenzy");
      puppet.stats[StatName("def")].removeMod("Frenzy");
    },
    "info": function (effect) {
      return `Attack boosted by ${this.power}; Defense reduced by ${Math.round(this.power/2)}.`;
    },
    "addText": function (actor) {
      return `${actor.name} feels the <b>Frenzy</b>!`;
    },
    "removeText": function (actor) {
      return `${actor.name} is no longer in a Frenzy.`;
    }
  },
  "Stasis": {
    "unblockable": true,
    "sticky": true,
    "block": true,
    "priority": 1,
    "blockCondition": function (effect) {
      return true;
    },
    "blockText": function (actor) {
      return `${actor.name}'s effects are in Stasis.`;
    },
    "onApply": function (puppet) {
      puppet.stasis = true;
    },
    "onRemove": function (puppet) {
      puppet.stasis = false;
    },
    "info": function (effect) {
      return `Effects will not decay. Effects cannot be added or removed.`;
    },
    "addText": function (actor) {
      return `${actor.name}'s effects are placed in <b>Stasis</b>.`;
    },
    "removeText": function (actor) {
      return `${actor.name}'s effects are no longer in Stasis.`;
    }
  },
  "Marked": {
    "onApply": function (puppet) {
      puppet.marked = true;
    },
    "onRemove": function (puppet) {
      puppet.marked = false;
    },
    "info": function (effect) {
      return `Will be shot every time someone attacks.`;
    },
    "addText": setup.effectFunctions.add,
    "removeText": setup.effectFunctions.rem
  },
  "Guarded": {
    // Note that this functions uniquely. The AoE protection is automatic, but everyone else taking hits for Steven is hard-coded into the "battle interruptions" passage. You may want to generalize it, but you will need to add your own code for that.
    "buff": true,
    "sticky": true,
    "ULTIMATESTICKY": true,
    "onApply": function (puppet) {
      puppet.areaImmune = true;
    },
    "onRemove": function (puppet) {
      puppet.areaImmune = false;
    },
    "info": function (effect) {
      return `Protected from direct attacks; out of reach of area attacks.`;
    },
    "removeText": setup.effectFunctions.invisible
  },
  "Bubble": {
    "buff": true,
    "shield": true,
    "uses": 1,
    "onApply": function (puppet) {
      puppet.bubbled = true;
    },
    "onRemove": function (puppet) {
      puppet.bubbled = false;
    },
    "onHit": function (puppet) {
      return `${puppet.name}'s bubble pops like a balloon under the attack, leaving ${puppet.them} unharmed!<br/>`;
    },
    "info": function (effect) {
      return `Protects against one attack.`;
    },
    "addText": function (actor) {
      return `Translucent pink petals rise from the ground to wrap ${actor.name} in a protective bubble.`;
    },
    "removeText": function (actor) {
      return `${actor.name}'s bubble shield dissipates.`;
    }
  },
  "Doom": {
    "dot": true,
    "dmgtype": setup.effectFunctions.piercing,
    "msg": function (actor) {return `${actor.name}'s doom ticks closer.`},
    "onApply": function (puppet) {
      puppet.doom = true;
    },
    "onRemove": function (puppet) {
      puppet.doom = false;
    },
    "info": function (effect) {
      return `Inflicts <<print _effect.damage($B.actor)>> magical damage per round.`;
    },
    "addText": function (actor) {
      return `${actor.name} is cursed with <b>Doom</b>! Their life ticks away...`;
    },
    "removeText": function (actor) {
      return `${actor.name}'s ${this.name} is dispelled.`;
    }
  },
  "Asleep": {
    "hold": true,
    "onApply": function (puppet) {
      puppet.asleep = true;
    },
    "onRemove": function (puppet) {
      puppet.asleep = false;
    },
    "info": function (effect) {
      return `Cannot act.`;
    },
    "addText": setup.effectFunctions.add,
    "removeText": function (actor) {
      return `${actor.name} wakes up!`;
    }
  },
  "Petrified": {
    "hold": true,
		"noENregen": true,
    "onApply": function (puppet) {
      puppet.petrified = true;
    },
    "onRemove": function (puppet) {
      puppet.petrified = false;
    },
    "info": function (effect) {
      return `Cannot act.`;
    },
    "addText": setup.effectFunctions.add,
    "removeText": setup.effectFunctions.rem
  },
  "Thorns": {
    "buff": true,
    "shield": true,
    "uses": 1,
    "onApply": function (puppet) {
      puppet.thorns = true;
    },
    "onRemove": function (puppet) {
      puppet.thorns = false;
    },
    "onHit": function (puppet) {
      return `${puppet.name}'s bubble pops like a balloon under the attack, and ${subject().name} is pricked by the thorns!
      <<if target() !== subject()>>\
        <<set _OG = {subject: $subject, target: $target, action: $action}>>\
        <<set $action = new Action("Thorn Counterattack"); $subject = _OG.target; $target = _OG.subject>>\
        <<echoDamage "nocounter">>\
        <<set $action = _OG.action; $subject = _OG.subject; $target = _OG.target>>\
        <<unset _OG>>\
      <</if>>`;
    },
    "info": function (effect) {
      return `Protects and counterattacks against one attack.`;
    },
    "addText": function (actor) {
      return `Translucent pink petals rise from the ground to wrap ${actor.name} in a protective bubble that grows menacing, spiky thorns all around.`;
    },
    "removeText": function (actor) {
      return `${actor.name}'s spiky bubble dissipates.`;
    }
  },
  "Consecrated": {
    "buff": true,
    "onApply": function (puppet) {
      this.power = V().action.special;
      this.type = V().action.element;
      puppet.elements.addMod(this.type,"Consecrated",-this.power,false,"percent");
    },
    "onRemove": function (puppet) {
      puppet.elements.removeMod(this.type,"Consecrated",null,"percent");
    },
    "info": function (effect) {
      return `${this.type.toUpperFirst()} resistance increased by ${this.power*100}%.`;
    },
    "addText": function (actor) {
      return `${actor.name} is <b>Consecrated</b> in the power of the <<print $action.element.toUpperFirst()>>.`;
    },
    "removeText": setup.effectFunctions.rem
  },
  "Desecrated": {
    "onApply": function (puppet) {
      this.power = V().action.special;
      this.type = V().action.element;
      puppet.elements.addMod(this.type,"Desecrated",this.power,false,"percent");
    },
    "onRemove": function (puppet) {
      puppet.elements.removeMod(this.type,"Desecrated",null,"percent");
    },
    "info": function (effect) {
      return `${this.type.toUpperFirst()} resistance decreased by ${this.power*100}%.`;
    },
    "addText": function (actor) {
      return `${actor.name} is <b>Desecrated</b> in the power of the <<print $action.element.toUpperFirst()>>.`;
    },
    "removeText": setup.effectFunctions.rem
  },
  "Hatred": {
    "uncontrollable": true,
    "topDec": true,
    "onApply": function (puppet) {
      puppet.hatred = true;
    },
    "onRemove": function (puppet) {
      puppet.hatred = false;
    },
    "info": function (effect) {
      return `Compelled to attack enemies.`;
    },
    "addText": function (actor) {
      return `${actor.name} is filled with a blinding <b>Hatred</b>!`;
    },
    "removeText": function (actor) {
      return `${actor.name}'s unnatural hatred has passed.`;
    }
  },
  "Confusion": {
    "uncontrollable": true,
    "topDec": true,
    "onApply": function (puppet) {
      puppet.confusion = true;
    },
    "onRemove": function (puppet) {
      puppet.confusion = false;
    },
    "info": function (effect) {
      return `Compelled to attack at random.`;
    },
    "addText": function (actor) {
      return `${actor.name} cannot tell friend from foe!`;
    },
    "removeText": function (actor) {
      return `${actor.name}'s head clears.`;
    }
  },
  "Charmed": {
    "uncontrollable": true,
    "topDec": true,
    "onApply": function (puppet) {
      puppet.charmed = true;
    },
    "onRemove": function (puppet) {
      puppet.charmed = false;
    },
    "info": function (effect) {
      return `Compelled to attack allies.`;
    },
    "addText": setup.effectFunctions.add,
    "removeText": setup.effectFunctions.rem
  },
  "Invincible": {
    "buff": true,
    "sticky": true,
    "unblockable": true,
    "onApply": function (puppet) {
      puppet.invincible = true;
    },
    "onRemove": function (puppet) {
      puppet.invincible = false;
    },
    "info": function (effect) {
      return `Takes no damage from attacks.`;
    },
    "addText": setup.effectFunctions.add,
    "removeText": setup.effectFunctions.rem
  },
  "Divine Protection": {
    "buff": true,
    "shield": true,
    "unblockable": true,
    "uses": 2,
    "onApply": function (puppet) {
      puppet.shielded = true;
      puppet.divineProt = true;
    },
    "onRemove": function (puppet) {
      puppet.shielded = false;
      puppet.divineProt = false;
    },
    "onHit": function (puppet) {
      return `Divine intervention shields ${puppet.name} from harm!<br/>`;
    },
    "info": function (effect) {
      return `Protects against two attacks. (Remaining: ${effect.uses})`;
    },
    "addText": function (actor) {
      return `${actor.name} gains <b>${this.name}!</b>`;
    },
    "removeText": function (actor) {
      return `${actor.name} loses ${this.name}.`;
    }
  }

};
