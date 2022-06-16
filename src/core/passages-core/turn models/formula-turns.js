// turnFormula: for "ranked" system
Actor.prototype.turnFormula = function () {
  let actTime = this.get(StatName("intv"));
  this.actTime = actTime;
  return actTime;
};
