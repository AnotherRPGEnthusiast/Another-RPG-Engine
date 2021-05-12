Object.assign(setup.effectData, {

	"Example": {
		"persistAfterBattle":	false,
		"persistAfterDeath":	false,
		"buff": 							false,
		"stackable": 					false,
		"sticky": 						false,
		"ULTIMATESTICKY": 		false,
		"unblockable": 				false,
		"topDec":							false,
		"exclusive":					false,
		"unique":							false,
		"statmod": 						false,
		"uncontrollable": 		false,
		"untargetable": 			false,
		"threat":							undefined,
		"shock":							0,
		// block subtype:
		"block": false,
			"blockCondition": function (effect) {
				return false;
			},
			"blockText": function (actor) {
				return ``;
			},
		// hold subtype:
		"hold":	false,
			"holdAction": function () {
				return {useText: null,
					actText: "",
					act: null};
			},
		// DoT subtype:
		"dot": false,
			"dmgtype": "",
			"msg": function (target) {return ``},
		// shield subtype:
		"shield": false,
			"uses": 0,
			"onHit": function (puppet) {
						return ``;
			},

		"priority": 0,	// hold or block only
		"onApply": function (puppet) {

		},
		"onRemove": function (puppet) {

		},
		"info": function (effect) {
			return ``;
		},
		"addText": function (target) {
			return ``;
		},
		"removeText": function (target) {
			return ``;
		}
	},




//	END OF DATABASE
});
