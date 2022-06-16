// timeFormula: For "action" system
Actor.prototype.timeFormula = function () {
  let actGain = this.get(StatName("spd"));
  this.actTime += actGain;
  return;
};
