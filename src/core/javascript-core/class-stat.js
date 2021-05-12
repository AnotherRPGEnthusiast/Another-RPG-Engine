window.Stat = class Stat {
// Designed by Akjosch

	constructor (base) {
		this._base = base;
		this._mods = {};
		this._current = undefined;
	}

	clearCache () {
		this._current = undefined;
	}

	addMod (id, mod, equipment) {
		id = String(id);
		var mods = this._mods[id] = this._mods[id] || [];
		if(Number.isFinite(mod)) {
			mod = { add: mod };
			if (equipment === true) {
				mod.equipment = true;
			}
		}
		if(typeof mod === "object") {
			var idx = 0;
			mods.forEach(function(mod) { idx = Math.max(idx, mod.idx); });
			mod.idx = (++ idx);
			mods.push(mod);
			this.clearCache();
			return mod.idx;
		}
	}

	removeMod (id, index) {
		id = String(id);
		if (Number.isFinite(index)) {
			this._mods[id].deleteWith(function(mod) { return (mod.idx === index); })
		} else {
			delete this._mods[id];
		}
		this.clearCache();
	}

	clearMods () {
		this._mods = {};
		this.clearCache();
	}

	get base () {
		return this._base;
	}

	set base (newBase) {
		newBase = Number(newBase);
		/* alternative: newBase = setup.roll(newBase) for "3d6" as inputs */
		if(!Number.isFinite(newBase)) {
			newBase = 0;
		}
		if (this._base !== newBase) {
			this._base = newBase;
			this.clearCache();
		}
	}

	get current () {
		if (this._current === undefined) {
			/* gather multipliers */
			var mult = Object.values(this._mods)
				.reduce(function(bigSum, entry) { return bigSum + entry
					.map(function(m) { return Number.isFinite(m.mult) ? m.mult : 0; })
					.reduce(function(sum, add) { return sum + add; }, 0);
				}, 0);
			/* gather sums */
			var add = Object.values(this._mods)
				.reduce(function(bigSum, entry) { return bigSum + entry
					.map(function(m) { return Number.isFinite(m.add) ? m.add : 0; })
					.reduce(function(sum, add) { return sum + add; }, 0);
				}, 0);
			this._current = this.base * (mult + 1) + add;
		}
			return this._current;
	}

	get bonus () {
		return this.current - this.base;
	}

	get equipBonus () {
		var mult = Object.values(this._mods)
			.reduce(function(bigSum, entry) { return bigSum + entry
				.map(function(m) { return m.equipment === true ? m : {}; })
				.map(function(m) { return Number.isFinite(m.mult) ? m.mult : 0; })
				.reduce(function(sum, add) { return sum + add; }, 0);
			}, 0);
		var add = Object.values(this._mods)
			.reduce(function(bigSum, entry) { return bigSum + entry
				.map(function(m) { return m.equipment === true ? m : {}; })
				.map(function(m) { return Number.isFinite(m.add) ? m.add : 0; })
				.reduce(function(sum, add) { return sum + add; }, 0);
			}, 0);
		return this.base * (mult + 1) + add - this.base;
	}

	toString () {
		var mult = Object.values(this._mods)
			.map(function(m) { return Number.isFinite(m.mult) ? m.mult : 0; })
			.reduce(function(sum, add) { return sum + add; }, 0);
		var add = Object.values(this._mods)
			.map(function(m) { return Number.isFinite(m.add) ? m.add : 0; })
			.reduce(function(sum, add) { return sum + add; }, 0);
		return this.current.toFixed(2)
			+ " [" + this.base.toFixed(2)
			+ " x " + (mult + 1).toFixed(2)
			+ (add >= 0 ? " + " + add.toFixed(2) : " - " + (-add).toFixed(2))
			+ "]";
	}

	/* SugarCube support */
	clone () {
		return Stat.create(this);
	}

	toJSON () {
		return JSON.reviveWrapper('Stat.create($ReviveData$)', Object.assign({}, clone(this)));
	}
};

Stat.create = function(vals) {
	vals = vals || {};
	var result = new Stat();
	result._base = vals._base;
	result._mods = clone(vals._mods);
	result._current = vals._current;
	return result;
};

window.FillStat = class FillStat extends Stat {
	// Stat that contains both a current and maximum value, such as tolerances or retaliations.
	// Due to inheritance, the "current" and "base" attributes actually refers to the maximum value. "currentVal" refers to the actual current value. Apologies for confusion.
	constructor (base) {
		super(base);
		this.currentVal = base;
	}

	clearCache () {
		this._current = undefined;
		this.refill();
	}

	refill () {
		this.currentVal = this.current;
	}

	get isFull () {
		return this.currentVal == this.current;
	}

	get base () {
		return this._base;
	}

	get current () {
		if (this._current === undefined) {
			/* gather multipliers */
			var mult = Object.values(this._mods)
				.reduce(function(bigSum, entry) { return bigSum + entry
					.map(function(m) { return Number.isFinite(m.mult) ? m.mult : 0; })
					.reduce(function(sum, add) { return sum + add; }, 0);
				}, 0);
			/* gather sums */
			var add = Object.values(this._mods)
				.reduce(function(bigSum, entry) { return bigSum + entry
					.map(function(m) { return Number.isFinite(m.add) ? m.add : 0; })
					.reduce(function(sum, add) { return sum + add; }, 0);
				}, 0);
			this._current = this.base * (mult + 1) + add;
		}
			return this._current;
	}

	set base (newBase) {
		newBase = Number(newBase);
		if(!Number.isFinite(newBase)) {
			newBase = 0;
		}
		if (this._base !== newBase) {
			this._base = newBase;
			this.clearCache();
		}
	}

	clone () {
		return FillStat.create(this);
	}

	toJSON () {
		return JSON.reviveWrapper('FillStat.create($ReviveData$)', Object.assign({}, clone(this)));
	}
}

FillStat.create = function(vals) {
	vals = vals || {};
	var result = new FillStat();
	result._base = vals._base;
	result._mods = clone(vals._mods);
	result._current = vals._current;
	result.currentVal = vals.currentVal;
	return result;
};

window.Tolerance = class Tolerance extends FillStat {
	constructor (base) {
		super(base);
	}

	get current () {
		if (this._current === undefined) {
			// check for immunity
			let immunity = false;
			if (this.base >= 0) {
				Object.values(this._mods)	// returns array of arrays
					.forEach(function(modArray) {
						modArray.forEach(function(mod) { if (mod.immune === true) {immunity = true;} });
					});
			} else {
				immunity = true;
			}
			if (immunity === true) {
				this._current = -1;
			} else {
				// gather tolerance
				var tol = Object.values(this._mods)
					.reduce(function(bigSum, entry) { return bigSum + entry
						.map(function(m) { return Number.isFinite(m.add) ? m.add : 0; })
						.reduce(function(sum, add) { return sum + add; }, 0);
					}, 0);
				this._current = this.base + tol;
			}
		}
			return this._current;
	}

	clone () {
		return Tolerance.create(this);
	}

	toJSON () {
		return JSON.reviveWrapper('Tolerance.create($ReviveData$)', Object.assign({}, clone(this)));
	}
};

Tolerance.create = function(vals) {
	vals = vals || {};
	var result = new Tolerance();
	result._base = vals._base;
	result._mods = clone(vals._mods);
	result._current = vals._current;
	result.currentVal = vals.currentVal;
	return result;
};

Map.prototype.addMod = function (key, id, mod, equipment, type) {
	if (type !== undefined && typeof(type) == 'string') {
		return this.get(key)[type].addMod(id,mod,equipment);
	} else {
		return this.get(key).addMod(id,mod,equipment);
	}
};

Map.prototype.removeMod = function (key, id, index, type) {
	if (type !== undefined && typeof(type) == 'string') {
		this.get(key)[type].removeMod(id, index);
	} else {
		this.get(key).removeMod(id, index);
	}
};
