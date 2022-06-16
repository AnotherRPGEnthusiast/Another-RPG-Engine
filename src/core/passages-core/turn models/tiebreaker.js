var tiebreaker = function (a,b) {
  console.assert(a instanceof Actor,`ERROR in tiebreaker: Used on non-actor array`);
  var val;
  switch (setup.TURN_MODEL.toLowerCase()) {
    case "timeline":
      if (a.ticks === b.ticks) {
        val = b.get(StatName("intv")) - a.get(StatName("intv"));
        return (val === 0) ? random(-1,1) : val;
      }
      break;
    case "ranked":
      if (a.actTime === b.actTime) {
        val = b.get(StatName("intv")) - a.get(StatName("intv"));
        return (val === 0) ? random(-1,1) : val;
      }
    case "action": {
      if (a.actTime === b.actTime) {
        val = b.get(StatName("spd")) - a.get(StatName("spd"));
        return (val === 0) ? random(-1,1) : val;
      }
    }
  }
}
