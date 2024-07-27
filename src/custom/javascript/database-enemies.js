Object.assign(setup.enemyData, {

    "Example": {
      "bestiaryNo": false,
      "gender": 'N',
      "hp": 0,
      "stats": {

      },
      "tolerances": {

      },
      "elements": {

      },
      "cooldown": {

      },
      "logic": function () {
        while (V().action === null) {
          var act = random(1,100);

          if (true) {
            // action 1
          } else {
            // default action
          }

        } // end loop
        return;
      }
    },

});

(function () {
	//	quick hack to populate bestiary numbers if you don't want to do it yourself
	//	not foolproof, can create duplicate numbers, don't use if you're assigning your own numbers
	var num = 1;
	for (let [pn,v] of Object.entries(setup.enemyData)) {
		if (!v.noBestiary && (v.bestiaryNo === 0)) {
			v.bestiaryNo = num;
			num++;
		}
	}
})();
