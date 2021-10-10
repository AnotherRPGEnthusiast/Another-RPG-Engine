window.Hitlist = class Hitlist extends Array {
	constructor(party,mods) {
		//	Creates a Hitlist of all actors in the party array, initializing their chance values to 1.
		//	If no party is passed, Hitlist will be empty; populate it later with addTarget.

		mods = (mods || []);
		console.assert(mods instanceof Array,`ERROR in Hitlist constructor: mods must be array`);

		super(0);
		if (party instanceof Array) {
			this.addTarget(party,mods);
		}
	}

	addTarget (target,mods) {
		//	Adds targets to the array and initalizes their chance value.
		//	Can pass party or single actors. If you pass a party, it will only be added if the hitlist is currently empty.

		console.assert(target instanceof Array || target instanceof Actor,`ERROR in addTarget: target argument must be array or Actor`);
		mods = (mods || []);

		if (target instanceof Actor) {
			var initChance = 1;
			if (mods.includes("ally")) {
				if (
						!(mods.includes("noself") && target == subject()) &&
						!(mods.includes("effect") && target.stasis)
						) {
					this.push({target: target, chance: initChance});
				}
			} else {
				if (setup.THREAT_TARGETING === true && subject() instanceof Enemy) {
					// If threat targeting used, chance is initialized to subject's threat towards target.
					initChance = subject().threat.get(target.name);
				}
				if (
						!target.dead &&
						!(mods.includes("noself") && target == subject()) &&
						(target.martyr || mods.includes("ignore untargetable") || !target.untargetable)
						) {
					// Do not add actors that are dead or untargetable.
					// Martyr supercedes untargetable; martyrs will be targeted even if they are untargetable.
					// Exception for untargetability if "ignore untargetable" is passed.
					this.push({target: target, chance: initChance});
				}
			}
		} else if (target instanceof Array) {
			for (let t of target) {
				this.addTarget(t,mods);
			}
		}
	}

	returnTarget (mods,bypass) {
		//	Returns a target randomly, weighted by chance value.
		//	mods must be an array.
		//	Automatically adjusts chances based on Firefly, Wallflower, and untargetable.
		//	Set bypass to true to ignore these factors (e.g. if you populated the hitlist with unique logic)

		mods = (mods || []);
		console.assert(mods instanceof Array,`ERROR in returnTarget: mods must be array`);

		for (let t of this) {
			// Martyrs are instantly selected as target, provided they aren't dead
			if (t.target.martyr && !t.target.dead && !(mods.includes("ignore martyr") || mods.includes("ally"))) {
				return t.target;
			}
			// Dead and untargetable characters cannot be targeted, set chance to 0
			if (t.target.dead || (t.target.untargetable && !(mods.includes("ignore untargetable") || mods.includes("ally")))) {
				t.chance = 0;
			} else if (bypass !== true) {
				// fireflies have their chances multiplied (default by 2)
				if (t.target.firefly) {
					t.chance *= setup.FIREFLY_FACTOR;
				}
				// wallflowers have their chances multiplied (default by 0.5)
				if (t.target.wallflower) {
					t.chance *= setup.WALLFLOWER_FACTOR;
				}
			}
		}

		// remove targets with 0 chance
		i = 0;
		while (i < this.length) {
			if (this[i].chance > 0) i++;
			else this.splice(i, 1);
		}

		// If this empties the array (length of 0), there are no viable targets; flag targetfail and return null
		if (this.length == 0) {
			temporary().targetfail = true;
			return null;
		}

		// If truly random targeting is desired, we will ignore chance values and just pick a target with the random function
		if (mods.includes("random")) {
			let target = this.map(function (t) { return t.target }).random();
			return Hitlist.protectionCheck(Hitlist.guardCheck(target),mods);
		}

		// vectorize chance values
//		console.log("before vectorization,"); console.log(this);
		var chance = this.map(function (t) { return t.chance });
		const total = chance.reduce((a, c) => a + c, 0);
		this.forEach((el, i) => el.chance = el.chance/total, this);
//		console.log("after vectorization,"); console.log(this);

		// return target randomly, weighted by chance value
		var i, sum=0, r=Math.random();
		for (i of this) {
			sum += i["chance"];
			if (r <= sum) return Hitlist.protectionCheck(Hitlist.guardCheck(i.target),mods);
		}
		temporary().targetfail = true;
		console.log(`ERROR in returnTarget: failed to find target. Likely cause is empty hitlist; check targeting logic.`);
		console.log(`Echoing hitlist for verification.`);
		console.log(this);
		return;
	}

	dispelFactors (mods) {
		//	Adds extra weight to targets with buffs, based on effects' threat value.

		mods = (mods || []);
		console.assert(mods instanceof Array,`ERROR in dispelFactors: mods must be array`);

		for (let t of this) {
			for (let eff of t.target.effects) {
				if (eff.buff && (!eff.sticky || mods.includes("unsticky"))) {
					t.target.chance += eff.threat;
				}
			}
		}
		if (mods.includes("exclusive dispel")) {
			this.onlyVulnerable();
		}
	}

	onlyVulnerable () {
		//	Filters hitlist to only targets with chance > 1 (i.e. those selected by addFactors)
		//	This will not do anything if the resulting hitlist would be empty.

		var altered = false;
		if (this.some(el => el.chance > 1)) {
			altered = true;
			let i = 0;
			while (i < this.length) {
				if (this[i].chance > 1) i++;
				else this.splice(i, 1);
			}
		}
		return altered;
	}

	martyrCheck () {
		//	Searches for a martyr in the hitlist. If a live martyr is found, it is returned; else, returns undefined.

		var test = this.find(function (t) { return t && t.target.martyr && !t.target.dead });
		return typeof(test) === "object" ? test.target : false;
	}

	static protectionCheck (target,mods) {
		// Checks if target is protected by someone with the Protector effect

		mods = (mods || []);
		console.assert(mods instanceof Array,`ERROR in returnTarget: mods must be array`);

		if (!(mods.includes("ignore protection") || mods.includes("ally")) && target.protectedBy) {
			var party;
			switch (target.id.charAt(0)) {
				case "p":
					party = V().puppets;
					break;
				case "e":
					party = V().enemies;
					break;
				default:
					party = V().puppets; console.log("ERROR in protectionCheck: invalid ID type");
			}
			var newTarget = party.find(function(t) { return t && t.id === target.protectedBy; });
			temporary().targetingMsg = newTarget.name+" took the hit for "+target.name+"!\n";
			return newTarget;
		} else {
			return target;
		}
	}

	static guardCheck (target) {
		//	For use with the battle grid. Checks if the target is guarded by a frontline character.
		//	By default, this check is bypassed by ranged attacks and friendly fire.

		var rangeCheck = true;
		try {
			rangeCheck = !V().action.ranged;
		} catch (e) {
			// no change needed
		}

		if (setup.BATTLE_GRID === true
			&& rangeCheck
			&& (subject().id.charAt(0) !== target.id.charAt(0))) {

			console.assert(target instanceof Actor,`ERROR in guardCheck: target must be Actor`);
			var newTarget = target;

			// Search for character immediately in front of this one (same column, row - 1)
			newTarget = target.ownParty.find(function (a) { return a && a.col === this.col && a.row === this.row - 1 },target);
			if (newTarget instanceof Actor && !newTarget.guardBreak) {
				newTarget = Hitlist.guardCheck(newTarget); // Run again to test if the new target is in turn guarded by a front row character
			} else {
				newTarget = target;
			}
			return newTarget;
		} else {
			return target;
		}
	}

	clone () {
		// Return a new instance containing our current data.
		return new Hitlist(this.map(function (t) {return t.target}));
	}

	toJSON() {
		// Return a code string that will create a new instance
		// containing our current data.
		let data = this.map(function (t) {return t.target});
		return JSON.reviveWrapper('new Hitlist($ReviveData$)', data);
	}
};

Hitlist.targetEnemy = function (args) {
	//	Targeting logic for offensive abilities.
	//	args = string or array of strings, modifies logic

	//	If all of one party are dead, there are no valid targets. Flag targetfail and return null.
	if (deadCount() == puppets().length || enemies().filter(function (e) { return e.dead; }).length == enemies().length) {
		temporary().targetfail = true;
		return null;
	}

	var mods = [];
	if (args instanceof Array) {
		mods = args;
	} else if (typeof(args) == "string") {
		mods = [args];
	}

	var party = V().puppets;

	// Check if this widget is being run for an uncontrollable actor.
	if (subject().uncontrollable) {
		// if can target any party (e.g. confusion), pass "any" as an argument to the widget and target party will be selected randomly
		if (mods.includes("any")) {
			let selector = random(1,2);
			switch (selector) {
				case 1:
					party = V().puppets;
					break;
				case 2:
					party = V().enemies;
					break;
			}
		}
		else if (mods.includes("enemies")) {
			party = subject().otherParty;
		}
		else if (mods.includes("allies")) {
			party = subject().ownParty;
		}
	}

	party = party.filter(function (a) { return a !== null; });

	// if only untargetables remain, must ignore untargetable
	if (!mods.includes("ignore untargetable")) {
		let untargetTest = party.filter(function (p) { return (p.dead || p.untargetable) });
		if (untargetTest.length == party.length) {
			mods.push("ignore untargetable");
		}
	}

	var hitlist = new Hitlist(party,mods);

	// If there's an active martyr in the target party, we can stop here.
	if (!mods.includes("ignore martyr") && hitlist.martyrCheck() instanceof Actor) {
		return hitlist.martyrCheck();
	}

	// If subject is uncontrollable, target will be selected completely randomly. By default, it is possible for a charmed or confused actor to attack themselves.
	if (subject().uncontrollable) {
		mods.pushUnique("random");
		return hitlist.returnTarget(mods);
	}

	if (mods.includes("dispel")) {
		hitlist.dispelFactors(mods);
	}

	// mercy setting
	var mercy = 0;
	if (subject().mercy < 1 || mods.includes("smart")) {
	// if enemy's mercy is below 1, they will always use smart targeting
		mercy = 2;
	}
	else {
	// 1 in (mercy) chance of random targeting, to give players a break
		mercy = random(1,subject().mercy);
	}

	// smart targeting
	switch (V().difficulty) {
		case "hard":
		// Hard difficulty: If any puppets are vulnerable, non-vulnerable puppets will be ignored
			if (mercy > 1) {
				hitlist.addFactors(mods);
				hitlist.onlyVulnerable();
			}
			break;

		case "medium":
			// Medium difficulty: All puppets will be considered, but vulnerable puppets will get additional chances to be selected.
			if (mercy > 1) {
				hitlist.addFactors(mods);
			}
			break;

		case "easy":
			// Easy difficulty: Smart targeting is only used with the "smart" mod.
			if (mods.includes("smart")) {
				hitlist.addFactors(mods);
			}
			break;
	}

	return hitlist.returnTarget(mods);
};

Hitlist.targetAlly = function (args) {
	//	Targeting logic for support abilities.
	//	args = string or array of strings, modifies logic

	//	If all of one party are dead, there are no valid targets. Flag targetfail and return null.
	if (subject().ownParty.filter(function (e) { return e.dead; }).length == enemies().length) {
		temporary().targetfail = true;
		return null;
	}

	var mods = [];
	if (args instanceof Array) {
		mods = args;
	} else if (typeof(args) == "string") {
		mods = [args];
	}
	mods.push("ally");

	var party = subject().ownParty.filter(function (a) { return a !== null; });
	var hitlist = new Hitlist(party,mods);
	if (!mods.includes("random")) {
		hitlist.allyFactors(mods);
	}
	return hitlist.returnTarget(mods,true);
};

Hitlist.prototype.addFactors = function (mods) {
	//	Adds additional weighting to targets depending on passed mods.
	//	Assumes action is an attack targeting enemy.

	mods = (mods || []);
	console.assert(mods instanceof Array,`ERROR in addFactors: mods must be array`);

	var mostDamaging = Math.max(...this.map(function (t) { return t.target.lastDmg }));
	var highestStat = {};
	var lowestStat = {};
	for (let [pn,v] in setup.statInfo) {
		highestStat[pn] = Math.max(...this.map(function (t) { return t.target.get(pn) }))
	}
	for (let [pn,v] in setup.statInfo) {
		lowestStat[pn] = Math.min(...this.map(function (t) { return t.target.get(pn) }))
	}
	if (mods.includes("most HP")) {
		var greatestHP = Math.max(...this.filter(function (t) { return t.chance > 0 }).map(function (t) { return t.target.hp }));
	} else if (mods.includes("least HP")) {
		var lowestHP = Math.min(...this.filter(function (t) { return t.chance > 0 }).map(function (t) { return t.target.hp }));
	}
	for (let t of this) {
		// Exclusive mods: These will target ONLY the character with the highest or lowest parameter.
		// As such, they are mutually exclusive and ignore other mods.
		if (mods.includes("least HP") && t.target.hp <= lowestHP) {
			t.chance += 1;
		} else if (mods.includes("most HP") && t.target.hp >= greatestHP) {
			t.chance += 1;
		} else if (mods.includes("most damage") && t.target.lastDmg >= mostDamaging) {
			t.chance += 1;
		} else if (mods.includes("most DEF") && t.target.get(V().DefenseStat) >= highestStat[V().DefenseStat]) {
			t.chance += 1;
		} else if (mods.includes("least DEF") && t.target.get(V().DefenseStat) >= lowestStat[V().DefenseStat]) {
			t.chance += 1;
		} else if (mods.includes("most ATK") && t.target.get(V().AttackStat) >= highestStatV().AttackStat) {
			t.chance += 1;
		} else if (mods.includes("least ATK") && t.target.get(V().AttackStat) >= lowestStatV().AttackStat) {
			t.chance += 1;
		} else if (mods.includes("most SPC") && t.target.get(V().SpecialStat) >= highestStat[V().SpecialStat]) {
			t.chance += 1;
		} else if (mods.includes("least SPC") && t.target.get(V().SpecialStat) >= lowestStat[V().SpecialStat]) {
			t.chance += 1;
		} else if (mods.includes("no effect") && !t.target.effects.includesAny(action().effects)) {
			t.chance += 1;
		} else if (mods.includes("exclusive")) {
			t.chance = 0;
		} else {
			// Preferentially target Off-Balance characters to proc Knocked Down,
			// and target Knocked Down characters to take advantage of DEF penalty.
			// To exclude this clause, pass "ignore downed"; such as for non-damaging moves
			if (!mods.includes("ignore downed") && (t.target.offbalance || t.target.down)) {
				t.chance += 1;
			}
			// Characters who inflicted the most damage on the last turn get an extra weight.
			if (!mods.includes("ignore damaging") && t.target.lastDmg >= mostDamaging) {
				t.chance += 1;
			}
			// If this attack pierces defense, preferentially target the character with the highest defense.
			if (mods.includes("pierce") && t.target.get(V().DefenseStat) >= highestStat[V().DefenseStat]) {
				t.chance += 1;
			}
			// Otherwise, preferentially target characters with a DEF debuff to get the most out of the attack.
			// To exclude this clause, pass "ignore vulnerable"; such as for non-damaging moves
			else if (!mods.includes("ignore vulnerable") && t.target.get(V().DefenseStat) < t.target.getBase(V().DefenseStat)) {
				t.chance += 1;
			}
			// Preferentially target more injured characters.
			// To exclude this clause, pass "ignore vulnerable"; such as for non-damaging moves
			// To weight this even higher, pass "ruthless"; multiplies this factor by RUTHLESS_FACTOR.
			if (mods.includes("ruthless")) {
				t.chance += (1-((t.target.hp)/t.target.maxhp))*setup.RUTHLESS_FACTOR;
			}
			else if (!mods.includes("ignore vulnerable")) {
				t.chance += (1-((t.target.hp)/t.target.maxhp));
			}
			// If this attack applies a debuff, preferentially target characters with a SPC debuff,
			// and ignore those with protective effects.
			if (mods.includes("effect") && !(t.target.chi || t.target.stasis)
				&& t.target.get(V().SpecialStat) < t.target.getBase(V().SpecialStat)) {
					t.chance += 1;
			}
		}
	}
};

Hitlist.prototype.allyFactors = function (mods) {
	//	Adds extra weight to targets based on passed mods; for support abilities
	//	mods:
	//		"pragmatic": exclude allies with HP below proportion specified by PRAGMATIC_CUTOFF
	//		"vulnerable": chance boosted by proportion of HP remaining
	//		"most vulnerable": only the character with the lowest HP will be selected
	//		"ailments": chance boosted by threat value of all ailments on character

	mods = (mods || []);
	console.assert(mods instanceof Array,`ERROR in allyFactors: mods must be array`);

	if (mods.includes("pragmatic")) {
		for (let t of this) {
			if (t.target.hp < (t.target.maxhp * Math.clamp(setup.PRAGMATIC_CUTOFF,0,1))) {
				t.chance = 0;
			}
		}
	}

	if (mods.includes("most HP")) {
		var greatestHP = Math.max(...this.filter(function (t) { return t.chance > 0 }).map(function (t) { return t.target.hp }));
	} else if (mods.includes("least HP")) {
		var lowestHP = Math.min(...this.filter(function (t) { return t.chance > 0 }).map(function (t) { return t.target.hp }));
	}
	for (let t of this) {
		if (mods.includes("least HP") && t.target.hp <= lowestHP) {
			t.chance += 1;
		} else if (mods.includes("most HP") && t.target.hp >= greatestHP) {
			t.chance += 1;
		} else if (mods.includes("no effect") && !t.target.hasEffect(action().effects)) {
			t.chance += 1;
		} else if (mods.includes("exclusive")) {
			t.chance = 0;
		} else {
			if (mods.includes("vulnerable")) {
				t.chance += (1-((t.target.hp)/t.target.maxhp))*2;
			}
			if (mods.includes("ailments")) {
				t.chance += t.target.effectCount("ailment",["threat","nosticky"])
			}
		}
	}
};
