Object.assign(setup.actionData, {
	//	Actions defined here will be added to the action database.
	//	Note that actions defined here will overwrite entries in the core database if they have the same name.

	"Example": {
		"passive": 				false,
		"silent": 				false,
		"truce":					false,
		"fullround": 			false,
		"basic": 					false,
		"pierce":					false,
		"instant":				false,
		"oncePerTurn":		false,
		"noself":					false,
		"noShock":				false,
		"ranged":					false,
		"counter":				false,
		"cost": 					0,
		"hpcost":					0,
		"accuracy":				true,
		"critRate":				0,
		"critMultiplier":	1.5,
		"weight": 				0,
		"effweight": 			0,
		"dur": 						0,
		"useSpecial":			0,
		"uses":						null,
		"warmup":					null,
		"cooldown":				null,
			"enemyCD":			null,
			"nameCD":				null,
		"element":				null,
		"target": 				"enemy",
		"phase": 					"Targeting Phase",
		"formula":				null,
		"info": function (action) {return ``},
		"desc": ``,
		"useText": null,
		"actText": function () {
			return ``;
		},
		"act": function () {

		},
		"preview": function () {

		}
	},

});
