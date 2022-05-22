const customMods = function () {

const ActionProto = Object.getPrototypeOf(new Action(""));

//  PUPPET MODS

const PuppetProto = Object.getPrototypeOf(new Puppet("Dummy"));

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
    writable: true,
    configurable: true,
    enumerable: true,
    value: function (level) {
      if (level === undefined) {
        level = this.level;
      }
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
