const customMods = function () {

const ActionProto = Object.getPrototypeOf(new Action(""));

Object.defineProperty(ActionProto,'toString', {
  value: function () {
    var text = `<span class="action-name">${this.name}</span>`;
    if (this.uses !== undefined) text += ` <span class="action-uses">(Uses: ${this.uses}/${this.maxUses})</span>`;
    var tags = "";
    if (!V().inbattle && subject().defaultAction === this.name) tags += `<b>[Default]</b> `;
    if (this.crisis) tags += `<b>[Crisis]</b> `;
    if (this.basic) tags += `[Basic] `;
    if (this.instant) tags += `[Instant] `;
    if (this.passive) tags += `[Passive] `;
    if (this instanceof ItemAction && !this.crisis) {
      tags += `x${inv().get(this.name).stock}`;
    } else if (!this.passive && Number.isInteger(this.cost) &&
              ((!this.crisis && this.cost >= 0) || (this.crisis && this.cost > 0))) {
      tags += this.cost;
      if (this.phase === "spell phase") tags += `+`;
      tags += ` EN`;
    }
    text += `<span class="action-tags">${tags}</span>`;
    var data = this instanceof ItemAction ? new Item(this.name) : this;
    text += `<div class="action-info">${data.info}</div>`;
    if (data.desc !== null) text += `<div class="action-desc">${data.desc}</div>`;
    return text;
  }
});

//  PUPPET MODS

const PuppetProto = Object.getPrototypeOf(new Puppet("Dummy"));

//  maxen: number; maximum Energy points Puppet can hold
if(!PuppetProto.maxen) {
  Object.defineProperty(PuppetProto,'maxen', {
    configurable: true,
    writable: true,
    enumerable: true,
    value: 10
  })
}

//  en: number; Energy points spent to use actions
if(!PuppetProto.en) {
  Object.defineProperty(PuppetProto,'en', {
    configurable: true,
    enumerable: true,
    get: function() { return this._en },
    set: function(amt) { this._en = Math.clamp(amt,0,this.maxen) }
  })
}

if(!PuppetProto._en) {
  Object.defineProperty(PuppetProto,'_en', {
    configurable: true,
    writable: true,
    enumerable: false,
    value: 5
  })
}

//  ENregen: Stat; determines EN gain per turn
if(!PuppetProto.ENregen) {
  Object.defineProperty(PuppetProto,'ENregen', {
    configurable: true,
    enumerable: true,
    get: function() { return this._ENregen.current },
    set: function(amt) { this._ENregen.base = amt }
  })
}

if(!PuppetProto._ENregen) {
  Object.defineProperty(PuppetProto,'_ENregen', {
    configurable: true,
    writable: true,
    enumerable: false,
    value: new Stat(setup.ENregen)
  })
}

//  crisisPoints: number; tracks progress to Crisis ability
if(!PuppetProto.crisisPoints) {
  Object.defineProperty(PuppetProto,'crisisPoints', {
    configurable: true,
    enumerable: true,
    get: function() { return this._crisisPoints },
    set: function(amt) { this._crisisPoints = Math.clamp(amt,0,100) }
  })
}

if(!PuppetProto._crisisPoints) {
  Object.defineProperty(PuppetProto,'_crisisPoints', {
    configurable: true,
    writable: true,
    enumerable: false,
    value: 0
  })
}

//  crisisFactor: number; modulates the rate of crisis point gain
if(!PuppetProto.crisisFactor) {
  Object.defineProperty(PuppetProto,'crisisFactor', {
    configurable: true,
    enumerable: true,
    get: function() { return (this._crisisFactor || setup.CRISIS_FACTOR) },
    set: function(amt) { this._crisisFactor = amt }
  })
}

// XPtoNext: Calculates the XP required for the next level. Pokemon's formulas are the default; change as necessary.
if(!PuppetProto.XPtoNext) {
  Object.defineProperty(PuppetProto,'XPtoNext', {
    configurable: true,
    enumerable: true,
    value: function (level) {
      if (level === undefined) {
        level = this.level;
      }
      var toNext;
      if (level >= setup.LEVEL_CAP) {
        return "--";
      }
      else if (level <= 0) {
        return 0;
      }
      switch (this.levelRate){
        case 'fast':
          return Math.floor((4*(this.level)^3)/5);
        case 'medium':
          return Math.floor((this.level^3));
        case 'slow':
          return Math.floor((5*(this.level)^3)/4);
        default:
          console.log("ERROR in XPtoNext: levelRate not recognized");
          return 0;
      }
    }
  })
}

//  initialThreat: Generates starting threat values. Required if threat targeting enabled, unused otherwise. Can implement any functions or logic here to produce variable results.
if(!PuppetProto.initialThreat) {
  Object.defineProperty(PuppetProto,'initialThreat', {
    configurable: true,
    enumerable: true,
    value: function () {
      return 1;
    }
  })
}

//  ENEMY MODS

const EnemyProto = Object.getPrototypeOf(new Enemy("Dummy"));

//  decayThreat: Logic for threat reduction per turn. Required if threat targeting enabled, unused otherwise.
if(!EnemyProto.decayThreat) {
  Object.defineProperty(EnemyProto,'decayThreat', {
    configurable: true,
    enumerable: true,
    value: function () {
      if (setup.THREAT_TARGETING === true) {
        this.threat.forEach(function(value,key) {
          this.threat.set(key,value-setup.THREAT_DECAY);
          if (this.threat.get(key) < 1) {
            this.threat.set(key,1);
          }
        }, this);
      }
    }
  })
}

}
window.customMods = customMods;
