window.Puppet = class Puppet extends Actor{
	constructor(name){
	if (typeof(name) == 'object'){
		super(name);
	}
	else {
		switch (name) {
			case "Rogue":
				super(name,
							/* hp */	State.variables.PUPPET_HP,
							/* atk */	[20,
							/* def */	30,
							/* spc */	40],
							/* pr */	'N'
						 );
				this.actions = [
					new Action("Knife"),
					new Action("Crossbow"),
					new Action("Something in your eye"),
					new Action("Poison Prick"),
					new Action("Off Your High Horse"),
					new Action("A Farewell to Arms"),
					new Action("Below the Belt"),
					new Action("Dead Ringer"),
					new Action("Flurry"),
					new Action("Sneak")
				];
				break;

			case "Fighter":
				super(name,
							/* hp */	State.variables.PUPPET_HP,
							/* atk */	[30,
							/* def */	40,
							/* spc */	20],
							/* pr */	'N'
						 );
				this.actions = [
					new Action("Sword"),
					new Action("Punch"),
					new Action("Hammer"),
					new Action("Charge"),
					new Action("Meditate"),
					new Action("Berserker"),
					new Action("Defender"),
					new Action("Protector"),
					new Action("Martyr")
				];
				this.firefly = true;
				break;

			case "Mage":
				super(name,
							/* hp */	State.variables.PUPPET_HP,
							/* atk */	[40,
							/* def */	20,
							/* spc */	30],
							/* pr */	'N'
						 );
				this.actions = [
					new Action("Focus"),
					new Action("Sacrifice"),
					new Action("Blast"),
					new Action("Fireball"),
					new Action("Favor"),
					new Action("Restoration"),
					new Action("Neutralize"),
					new Action("Blessing"),
					new Action("Curse")
				];
				break;

			case "Bard":
				super(name,
							/* hp */	State.variables.PUPPET_HP,
							/* atk */	[30,
							/* def */	30,
							/* spc */	30],
							/* pr */	'N'
						 );
				this.actions = [
					new Action("Rapier"),
					new Action("Dagger"),
					new Action("Shout"),
					new Action("Non-Sequitor"),
					new Action("Insult"),
					new Action("Joke"),
					new Action("Equivocate"),
					new Action("Rewrite"),
					new Action("Provoke"),
					new Action("Sneak")
				];
				break;

			case "Archer":
				super(name,
							/* hp */	State.variables.PUPPET_HP,
							/* atk */	[50,
							/* def */	20,
							/* spc */	20],
							/* pr */	'N'
						 );
				this.actions = [
					new Action("Shot"),
					new Action("Soulshot"),
					new Action("Exacerbate"),
					new Action("Explosive Bolt"),
					new Action("Mark"),
					new Action("Mercy"),
					new Action("Hunter"),
					new Action("Call to Arms")
				];
				break;

			case "Cleric":
				super(name,
							/* hp */	State.variables.PUPPET_HP,
							/* atk */	[20,
							/* def */	50,
							/* spc */	20],
							/* pr */	'N'
						 );
				this.actions = [
					new Action("Club"),
					new Action("Assured Aegis"),
					new Action("Protector_Cleric"),
					new Action("Martyr_Cleric"),
					new Action("Lifegiver"),
					new Action("Downfall"),
					new Action("Meditate_Cleric"),
					new Action("Walled City")
				];
				this.firefly = true;
				break;

			case "Witch":
				super(name,
							/* hp */	State.variables.PUPPET_HP,
							/* atk */	[20,
							/* def */	20,
							/* spc */	50],
							/* pr */	'N'
						 );
				this.actions = [
					new Action("Pox"),
					new Action("Focus"),
					new Action("Gift"),
					new Action("Cleanse"),
					new Action("Forgetfulness"),
					new Action("Curse"),
					new Action("Frenzy"),
					new Action("Thaumastasis"),
					new Action("Age of Enlightenment")
				];
				break;
				
			default:
				super("bad call",1,[0,0,0],'x');
		}
		
		this.en = 5;
		this.inspired = false;
		if (!this.firefly) {
			this.firefly = false;
		}

/* Features used for level ups, explained further in the "Widgets: Leveling Up" passage. You (probably) want growth rates to be unique for every character, so they are blank Maps in the general constructor. Set them when creating a character via Call widget, or make a switch statement with a case for every character to define them here. The labels must match the stat labels exactly. */
/* By default, these attributes are for Puppets only. If you want to let Enemy objects level up, just move the code into the "Actor" class and they'll apply to both. */
/*
		this.level = 1;
		this.XP = 0;
		this.levelRate = '';
		this.growthRates = new Map();
		this.StatTable = () => {
			switch (this.level){
				case 2:
					return new Map([
						["A",num],
						["B",num],
						["Skill",name]
						);
			}
		}
*/
	}
	}
	
	XPtoNext(){
	/* Calculates the XP required for the next level. Pokemon's formulas are the default; change as necessary. */
		switch (this.levelRate){
		/* You can make the switch anything; you can make it the character name to give everyone a unique formula, for instance. */
			case 'fast':
				return Math.floor((4*(this.level)^3)/5);
			case 'medium':
				return Math.floor((this.level^3));
			case 'slow':
				return Math.floor((5*(this.level)^3)/4);
			default:
				console.log("ERROR in XPtoNext: levelRate not recognized");
				return null;
		}
	}
	

	getStatCost(stat){
	/* Used for point-buy calculation. */
		switch (stat){
			case "minor stat":
				return (this.getBase(stat) * 5);
				break;
			case "major stat":
				return (this.getBase(stat) * 10);
				break;
			default:
				return null;
		}
	/* If you want unique costs for every character, you can make this an instance method instead. */
	}
	
}

Puppet.prototype.clone = function () {
	// Return a new instance containing our current data.
	return new Puppet(this);
};

Puppet.prototype.toJSON = function () {
	// Return a code string that will create a new instance
	// containing our current data.
	const data = {};
    Object.keys(this).forEach(pn => data[pn] = clone(this[pn]));
    return JSON.reviveWrapper('new Puppet($ReviveData$)', data);
};

