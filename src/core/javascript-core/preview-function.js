const ActionProto = Object.getPrototypeOf(new Action(""));

if(!ActionProto.preview) {
  Object.defineProperty(ActionProto,'preview', {
    configurable: true,
    enumerable: true,
    get: function () {
      //	Function. Pre-calculates the effect of the action and provides the result to the player in the Confirm Phase.

      var val = this._preview;
  		if (val === undefined) {
  			val = this.actionData.preview;
  		}
  		if (val === null || val instanceof Function) {
  			return val;
  		} else if (typeof(val) === "string") {
  			val = [val];
  		} else if (!(val instanceof Array)) {
  			val = [];
  		}
      var rounds = setup.TURN_MODEL === "timeline" ? "ticks" : "rounds";
  		var result = "";
  		var initialLength = 0;
  		if (val.includes("spread")) {
  			if (this.weight > 0) {
  				return `Will hit <b>${this.hits}</b> targets randomly`;
  			}
  		} else if (target() instanceof Actor) {
  			var hits = 0;
  			var party = [target()];
  			if (val.includes("mass") || val.includes("all")) {
  				party = target().ownParty.filter(function (a) { return a && !a.areaImmune });
  			} else if (val.includes("row")) {
  				party = target().ownParty
  								.filter(function (a) { return a && !a.areaImmune && a.row === target().row });
  			} else if (val.includes("col") || val.includes("column")) {
  				party = target().ownParty
  								.filter(function (a) { return a && !a.areaImmune && a.col === target().col });
  			} else if (val.includes("adjacent") || val.includes("+")) {
  				party = target().ownParty
  								.filter(function (a) { return a && !a.areaImmune && (
  												a.id === target().id ||
  												a.col === target().col && (a.row === target().row + 1 || a.row === target().row - 1) ||
  											 	a.row === target().row && (a.col === target().col + 1 || a.row === target().col - 1)
  												) });
  			}
  			if (!this.canTargetDead) {
  				party = party.filter(function (a) { return !a.dead });
  			}
  			for (let actor of party) {
  				initialLength = result.length;
  				hits = this.hits - actor.shieldHits;
  				if (val.includes("multihit")) {
  					if (this.weight > 0) {
  						if (hits > 0) {
  							result += `<<damageCalc>><b>${actor.name}</b> will take <b>$dmg x ${hits}</b> damage`;
  						} else {
  							result += `<b>${actor.name}</b> <b>will block all ${this.hits} hits</b>`;
  						}
  					}
  		 		} else if (val.includes("splash") && target().id !== actor.id) {
  					if (this.weight > 0) {
  						if (hits > 0) {
  							temporary().temp = actor;
  							$.wiki('<<damageCalc _temp>>');
  							result += `<b>${actor.name}</b> will take <b>${V().dmg}</b> damage`;
  						} else {
  							result += `<b>${actor.name}</b> <b>will block the hit</b>`;
  						}
  					}
  				} else if (val.includes("heal")) {
  					result += `<<healCalc>><b>${target().name}</b> will recover <b>$heal</b> health`;
  				} else {
  					if (this.weight > 0) {
  						if (hits < 1) {
  							result += `<b>${target().name}</b> <b>will block the hit</b>`;
  						} else {
  							result += `<<damageCalc>><b>${target().name}</b> will take <b>$dmg</b> damage`;
  						}
  					}
  				}

  				if (result.length > initialLength) {
  					result += `<br/>`;
  				}

  				if (val.includes("lastEffect")) this.removedEffects = 1;

  				if (val.includes("cleanse") && Number.isInteger(this.removedEffects)) {
  					this.effects = [];
  					let e = clone(this.removedEffects);
  					let effects = actor.effects;
  					for (let i = effects.length-1; i >= 0; i--) {
  						if (e <= 0) {
  							break;
  							// The number of effects removed by Neutralize/Restoration varies depending on energy invested. If there are more effects than the spell can remove, we end the function here. Otherwise the spell would clear all effects regardless of strength!
  						}
  						if (subject().ownParty === actor.ownParty && !effects[i].buff) {
  							// If using this on ally, only remove ailments
  							this.effects.push(effects[i].name);
  							e--;
  						} else if (effects[i].buff) {
  							this.effects.push(effects[i].name);
  							e--;
  						}
  					}
  					val.pushUnique("removeEffect");
  				}
  				if (this.effects instanceof Array) {
  					if (val.includes("removeEffect")) {
  						if (actor.testRemoval(this.effects[0],{unsticky: val.includes("unsticky")}) === "none") {
  							result += `<b>${actor.name} doesn't have any effects to remove!</b><br/>`;
  						} else {
  							let effects = clone(this.effects);
  							if (effects.includes("all")) {
  								effects = actor.effects.map(function (e) { return e.name });
  							} else if (effects.includes("ailments")) {
  								effects = actor.effects.filter(function(e) { return e && !e.buff }).map(function (e) { return e.name });
  							} else if (effects.includes("buffs")) {
  								effects = actor.effects.filter(function(e) { return e && e.buff }).map(function (e) { return e.name });
  							}
  							console.log(effects);
  							for (let effect of effects) {
  								let testResult = actor.testRemoval(effect,{unsticky: val.includes("unsticky")});
  								switch (testResult) {
  									case "block":
  										result += `<b>${actor.name}'s effects are sealed</b>`;
  										break;
  									case "none":
  										result += `<b>${actor.name} doesn't have any effects to remove!</b>`;
  										break;
  									case "absent":
  										result += `<b>${actor.name}</b> <b>does not have ${effect}</b>`;
  										break;
  									case "sticky":
  										result += `<b>${effect} can't be removed!</b>`;
  										break;
  									default:
  										result += `<b>${actor.name}</b> will lose <b>${effect}</b>`;
  								}
  								result += `<br/>`;
  							}
  						}
  					} else {
  						for (let effect of this.effects) {
  							switch (actor.testEffect(effect)) {
  								case "immune":
  									result += `<b>${actor.name}</b> <b>is immune to ${effect}</b>`;
  									break;
  								case "block":
  									result += `<b>${actor.name}</b> <b>is protected from ${effect}</b>`;
  									break;
  								case "tolerance":
  									result += `<b>${actor.name}</b> will lose <b>${this.toleranceDamage} ${effect} tolerance</b>`;
  									break;
  								default:
  									result += `<b>${actor.name}</b> will gain <b>${effect}</b>`;
  									if (this.dur > 1) result += ` for <b>${this.dur}</b> ${rounds}`;
  							}
  							result += `<br/>`;
  						}
  					}
  				}
  			}
  		} else {
  			return null;
  		}
  		return result;
    },
    set: function () {
      console.assert(typeof(val) === "string" || val instanceof Function,`ERROR: preview must be string or function`);
  		this._preview = val;
    }
  })
}
