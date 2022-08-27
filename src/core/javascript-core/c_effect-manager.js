Effect.prototype.calculatePower = function (effectTarget,effectSubject) {
  if (!(effectTarget instanceof Actor)) {
    effectTarget = target();
  }
  if (!(effectSubject instanceof Actor)) {
    effectSubject = subject();
  }
  console.assert(effectTarget instanceof Actor,`ERROR in calculatePower: invalid effectTarget`);
  console.assert(effectSubject instanceof Actor,`ERROR in calculatePower: invalid effectSubject`);

  let power;
  let check = this.buff ? setup.FORMULA_INFO.minBuff : setup.FORMULA_INFO.minDebuff;

  if (effectSubject.stats[StatName("spc")] !== undefined) {
    if (this.statmod) {
      let def = this.buff ? 0 : effectTarget.get(StatName("spc"));
      power = Math.round(
        (setup.FORMULA_INFO.effbase + setup.FORMULA_INFO.effdamper * (effectSubject.get(StatName("spc")) - def)) * action().effweight);
    } else if (this.dot) {
      return effectSubject.get(StatName("spc"));
    }
  }
  else {
    power = (this.effectData.power || 0);
  }

  return Math.max(power,check);
}

Actor.prototype.testEffect = function (name,mods = {}) {
  //  Tests if an effect will be applied (for previews).
  //  Returns string or Boolean.
  //  If the effect will go through, return true; else, return a string describing the exact point of failure.

  console.assert(typeof(name) == "string",`ERROR in testEffect: no effect passed`);
  var E = new Effect(name);
  let entry;
  if (V().bestiary instanceof Bestiary && V().bestiary.fetch(this.name) instanceof BestiaryEntry) {
    entry = V().bestiary.fetch(this.name);
  }

  //  block check
  this.effects.filter(function (e) { return e && e.block })
    .sort(function(a,b) { return a.priority - b.priority; })
    .forEach(function (effect) {
      if (effect.blockCondition(E)) {
        console.log("block found");
        return "block";
      }
    },this);

  //  tolerance check
  let n = (E.synonym || E.name);
  if (this.tolerances.get(n).current != 0 && !mods.pierceImmunity) {

    console.log("tolerance found");
    //  If this character has a bestiary entry, we must check if the tolerance is known
    if (entry && entry.tolerancesKnown[n] !== true) {
      //  If it isn't, we return true -- no spoilers!
      console.log("tolerance not known");
      return true;
    }

    if (this.getTol(n) === -1) {
      //  If tolerance value is -1, target is immune.
      return "immune";
    }
    else if (this.getTol(n) > 0 && !mods.pierceTol) {
      console.log("tolerance");
      return "tolerance";
    }
  }
  return true;
}

Actor.prototype.addEffect = function (name,mods={}) {
  console.assert(typeof(name) == "string" || name instanceof Effect,`ERROR in addEffect: no effect passed`);
  if (!action()) { V().action = new Action("") }
  var dur = (mods.dur || action().dur || 1);
  var E;

  if (name instanceof Effect) { E = name; mods.bypass = true }

  if (mods.bypass === true) {
    if (typeof(name) == "string") { E = new Effect(name,dur,mods.power,mods) }
  }
  else if (temporary().hit === false) {
    //  Missed/blocked attacks do not apply effects
    return "";
  }
  else {

    // check if the effect will be applied; used for report functions
    if (temporary().effectApplied === undefined) {
      temporary().effectApplied = {}
    }
    if (V().target === null) V().target = this;
    temporary().effectApplied[name] = this.testEffect(name,mods);
    this.effectApplied = temporary().effectApplied;

    //  Create dummy Effect to access database properties
    E = new Effect(name);
    if (E.statmod && subject() instanceof Puppet && target() instanceof Enemy) {
      V().B.debuff_used = true;
    }
    if (!this.dead || E.persistAfterDeath) {

      let found = false;
      let power;
      let subj;
      subj = mods.actor instanceof Actor ? mods.actor : subject();

      if (!(E.unblockable || mods.unblockable === true)) {

        //  Block effect logic. Filter character effects to only block effects, sort them by priority, then check the block condition for each. If block condition passes, return blockText and terminate immediately.

        this.effects.filter(function (e) { return e && e.block })
          .sort(function(a,b) { return a.priority - b.priority; })
          .forEach(function (effect) {
            if (effect.blockCondition(E)) {
              this.addPopup({shake: false, type: "block", content: "BLOCKED"});
              return effect.blockText(this)+"\r\n";
            }
          },this);

      }

      let n = (E.synonym || E.name);
      if (this.tolerances.get(n).current != 0 && !mods.pierceImmunity) {
        //  Tolerance logic. If the tolerance stat is not 0, we need to check the tolerance.
        //  Note that this checks the maximum tolerance, not the variable point value.

        //  If this character has a bestiary entry, mark this tolerance known
        if (V().bestiary instanceof Bestiary && V().bestiary.fetch(this.name) instanceof BestiaryEntry) {
          V().bestiary.fetch(this.name).tolerancesKnown[n] = true;
        }

        //  If pierceTol enabled, set tolerance value to 0
        if (mods.pierceTol === true && this.tolerances.get(n).current > 0) {
          this.tolerances.get(n).currentVal = 0;
        }

        if (this.getTol(n) === -1) {
          //  If tolerance value is -1, target is immune. Print a message to this effect and terminate function.
          this.addPopup({shake: false, type: "block", content: "IMMUNE"});
          return `${this.name} is immune to ${name}.`+"\r\n";
        }
        else if (this.getTol(n) > 0) {
          //  If tolerance is above 0, decrement tolerance and print a message to that effect, then terminate function.
          this.decTol(n,action().toleranceDamage);
          this.addPopup({shake: true, type: "block", content: "RESISTED"});
          return `${this.name}'s tolerance to ${name} was weakened.`+"\r\n";
        }
        else if (this.getTol(n) === 0) {
          //  If tolerance is 0, continue to application section but reset tolerance.
          this.resetTol(n);
        }
      }

      //  Power calculation. If valid power property passed as argument, that overrides standard power calculation.
      power = typeof(mods.power) == "number" ? power = mods.power : E.calculatePower(this,subj);

      if (E.unique) {
        //  Only one instance of a unique effect can be present in a given party. Remove any instances of this effect from other characters in this character's party.

        this.ownParty.filter(function (a) { return a && a.name !== this.name },this).forEach(function (actor) {
          actor.removeEffect(E.name,{pierce: true, unsticky: true, removeStack: true, noPopup: true});
        });
      }

      if (E.exclusive) {
        //  No two exclusive effects can be present on a character at once. Filter for existing exclusive effects on the character, then remove them all.
        this.effects.filter(function (e) { return e && e.exclusive}).forEach(function (effect) {
          this.removeEffect(effect,{pierce: true, unsticky: true, removeStack: true, noPopup: true});
        },this);
      }

      if (!E.stackable) {
        //  If effect is not stackable, we need to check if it already exists in the character's effects.
        found = this.effects.find(function (e) { return e && e.name === name});
        if (found instanceof Effect) {
          //  If the effect was found, we need to update it.
          //  If extendable, extend the existing effect's duration by the duration of this application. Else, set duration to the higher of new or existing duration.
          (E.extendable) ? found.duration += dur : found.duration = Math.max(found.duration,dur);
          if (found.dot) {
            //  If existing effect is DoT, calculate if applied effect's damage is stronger; if yes, overwrite both power and weight.
            E = new Effect(name,dur,power,{weight: action().effweight});
            if (E.damage(this) > found.damage(this)) {
              found.power = power;
              found.weight = action().effweight;
            }
          } else if (power > found.power) {
            //  For non-DoT effects, overwrite power if application's is stronger. We will have to remove and re-apply the effect to ensure correct updating.
            found.onRemove(this); found.power = power; found.onApply(this);
          }
          if (!mods.noPopup) {
            let shake = (E.buff || mods.noShake) ? false : true;
            this.addPopup({shake: shake, type: "addEffect", content: E.name});
          }
          //  Flag msg as true in case this is applied at RoundEnd, and return the addText for this effect.
          temporary().msg = true;
          return E.addText(this)+"\r\n";
        }
      }

      if (name === "Off-Balance" && this.down) {
        return `${this.name} would have been pushed off-balance, but ${this.theyre} already knocked down!`+"\r\n";
      }

      if (name === "Knocked Down") {
        //  Getting knocked down removes off-balance
        this.removeEffect("Off-Balance",{pierce: true, noPopup: true});
      }

      if (E.dot) mods.weight = action().effweight;
      if (E.guard === true) {
        mods.target = target();
        target().protectedBy = this.id;
      }

      //  Create our finalized effect with the correct variables
      E = new Effect(name,dur,power,mods);
    } else {
      return "";
    }
  }

  this.effects.push(E);
  E.onApply(this);
  /*
  //  If this actor had a delayed action in progress and the effect made them
  //  unable to act AND the delayed action is not persistent, reset it
  if (!this.actionReady) {
    this.delayedAction = null;
  }
  */
  if (!mods.noPopup) {
    //  Add popup for effect. By default, ailments shake, buffs do not.
    let shake = (E.buff || mods.noShake) ? false : true;
    this.addPopup({shake: shake, type: "addEffect", content: E.name});
  }

  var text = E.addText(this);

  if (typeof(text) == "string" && text.length > 0) {
    text += '\r\n';
  }

  return text;
};

Actor.prototype.testRemoval = function (effect,mods = {}) {
  //  Tests if an effect will be removed (for previews).
  //  Returns string or Boolean.
  //  If the removal will happen, return true; else, return a string describing the exact point of failure.

  console.assert(typeof(effect) === "string",`ERROR in testEffect: effect must be string`);
  if (this.stasis && !mods.pierce === true) {
    return "block";
  } else if (effect === "all") {
    if (this.effects.length === 0) return "none";
  } else if (effect === "ailments") {
    if (this.effects.filter(function(e) { return e && !e.buff }).length === 0) return "none";
  } else if (effect === "buffs") {
    if (this.effects.filter(function(e) { return e && e.buff }).length === 0) return "none";
  } else {
    var E = this.effects.find(function(e) { return e && e.name === effect; });
    if (E === undefined) return "absent";
    if ((E.sticky && !mods.unsticky) || (E.ULTIMATESTICKY && mods.unsticky !== "ultimate")) return "sticky";
  }
  return true;

}

Actor.prototype.removeEffect = function (effect,mods = {}) {
  //	effect = Effect or string. If Effect, will remove that particular Effect object from actor's effects array. If string, will search for an Effect with that name and remove it if found.
  //	mods = object, contains optional properties:
  //		pierce = Boolean. Set true to remove effects through stasis.
  //		unsticky = Boolean. Set true to remove sticky effects, "ultimate" to remove ULTIMATESTICKY
  //		removeStack = Boolean. Set true to remove all instances of a stackable effect (only matters if string used for effect ID)

  console.assert(typeof(effect) === "string" || effect instanceof Effect,`ERROR in removeEffect: effect must be string or Effect`);
  var result = "";
  if (!this.stasis || mods.pierce === true){
    var E;
    if (typeof(effect) == 'string') {
      E = this.effects.find(function(e) { return e && e.name === effect; });
      if (E === undefined) {
        return;
      }
    }
    else {
      E = effect;
    }
    if (!V().inbattle || ((!E.ULTIMATESTICKY || mods.unsticky == "ultimate") && (!E.sticky || mods.unsticky))) {
      E.onRemove(this);
      if (!mods.noPopup) {
        var shake = E.buff ? true : false;
        this.battleMsg.push({shake: shake, type: "removeEffect", content: "- "+E.name});
      }
      this.effects.delete(E);
      result += E.removeText(this) + '\n';
      if (E.stackable && typeof(effect) == 'string' && mods.removeStack === true) {
        while (E !== undefined) {
          E = this.effects.find(function(e) { return e && e.name === effect; });
          if (E !== undefined) {
            E.onRemove(this);
            this.effects.delete(E);
            result += E.removeText(this) + '\n';
          }
        }
      }
      return result === '\n'
        ? ""
        : result
    }
    else {
      return `${E.name} status can't be removed!<br/>`;
    }
  } else {
    return `${this.name}'s Stasis held the effect in place!<br/>`;
  }
};

setup.effectFunctions = {

	add: function (actor) {
		return `${actor.name} is <b>${this.name}</b>!`;
	},
	rem: function (actor) {
		return `${actor.name} is no longer ${this.name}.`;
	},
	stance: function (actor) {
		return `${actor.name} adopts the stance of a <b>${this.name}</b>.`;
	},
	remDebuff: function (actor) {
		return `${actor.name}'s ${this.name} is cured.`;
	},
	remBuff: function (actor) {
		var article;
		switch (this.name.charAt(0).toLowerCase()){
			case "a":
			case "i":
			case "o":
			case "u":
			case "e":
				article = 'an';
				break;
			default:
				article = 'a';
		}
		return `${actor.name} loses ${article} ${this.name}.`;
	},
	invisible: function () {return "";},

	physical: function (puppet) {
		return this.weight*(setup.FORMULA_INFO.base + (setup.FORMULA_INFO.damper * (this.power - puppet.get(StatName("def")))));
	},
	special: function (puppet) {
		return this.weight*(setup.FORMULA_INFO.base + (setup.FORMULA_INFO.damper * (this.power - puppet.get(StatName("spc")))));
	},
	piercing: function (puppet) {
		return this.weight*(setup.FORMULA_INFO.base + (setup.FORMULA_INFO.damper * this.power));
	},
	proportional: function (puppet) {
		return this.weight * puppet.maxHP;
	},
	fixed: function (puppet) {
		return this.power;
	}

};
