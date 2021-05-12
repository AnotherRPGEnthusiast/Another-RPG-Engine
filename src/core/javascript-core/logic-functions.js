function meditateLogic (mods) {
	// Logic for determining the effectiveness of cure-all actions such as Meditate.
	// Returns the threat sum of all ailments on the subject.

	mods = (mods || []);
	mods.pushUnique("threat");
	return subject().effectCount("ailment",mods)
}

function effectCheck (type) {
	//	Mass form of effectCount. Returns the number of puppets currently possessing the named effect.
	//	Assumes sticky effects should be counted.
	//	type = String, name of effect to be checked

	let count = 0;
	puppets().forEach(function(puppet){
		if (puppet.effectCount(type) > 0) {
			count++;
		}
	});
	return count;
}

function dispelCheck (mods) {
	//	Logic for determining the effectiveness of buff dispel abilities.
	//	Returns the threat sum of all puppet buffs.
	//	This simulates the targeting for an actual attack, so if a martyr exists, only it will be considered;
	//	and untargetable puppets will be ignored by default.

	mods = (mods || []);
	mods.pushUnique("threat");
	var party = subject().otherParty.filter(function (a) { return a && !a.dead });
	var martyr = party.find(function (p) { return p && p.martyr === true });
	if (!(mods.includes("mass") || mods.includes("ignore martyr")) && martyr instanceof Actor) {
		// mass attacks do not worry about martyrs
		return martyr.effectCount("buff",mods);
	} else {
		var count = 0;
		for (let p of party) {
			if (mods.includes("ignore untargetable") || !p.untargetable) {
				count += p.effectCount("buff",mods);
			}
		}
		return count;
	}
}

function cureCheck (mods) {
	//	Logic for determining the effectiveness of ailment cure abilities.
	//	Returns the threat sum of all enemy ailments.

	mods = (mods || []);
	mods.push("threat");
	var party = subject().ownParty.filter(function (a) { return a && !a.dead });
	var count = 0;
	for (let p of party) {
		count += p.effectCount("ailment",mods);
	}
}
