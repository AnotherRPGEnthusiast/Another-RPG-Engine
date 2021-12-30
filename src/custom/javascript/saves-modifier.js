/* GEMS saves descriptions module. */
/* Code by The Mad Exile, with modifications by Another RPG Enthusiast */
(function() {
	// Add metadata to saves.
	Save.onSave.add(function (save) {
		var active = save.state.history[save.state.index];
		save.metadata = {
			area	: active.variables.currentArea,
			party	: active.variables.puppets.filter(function (p) { return p !== null; }),
			money	: active.variables.currency,
//			level	: active.variables.puppets[0].level
		};
	});

	// Create save description from metadata.
	function createSaveDescription(metadata) {
		var desc = `<div class="save-desc monospace"><div class="save-left">`;
//		var extra = `<div class="save-extra">`;

		if (metadata.area !== undefined) { desc += `<span class="save-area">${metadata.area}</span>`; }
//		if (metadata.level !== undefined) { desc += `<span class="save-level">LV ${metadata.level}</span>`; }
		if (metadata.money !== undefined) { desc += `<span class="save-money">${setup.CURRENCY_NAME}: ${metadata.money}</span>`; }
		desc += `</div>`;
		if (metadata.party !== undefined) {
			desc += `<span class="save-party" style="min-width:${setup.PORTRAIT_SIZE*setup.PARTY_SIZE}px;">`;
			metadata.party.forEach(function(puppet) {
				desc += `<div style="display:inline-flex; flex-direction:column;"><span class="save-puppet" style="width:${setup.PORTRAIT_SIZE}px; height:${setup.PORTRAIT_SIZE}px;">`;
				if (setup.SHOW_PORTRAITS === true && puppet.portrait !== undefined) {
					desc += `<img src="${puppet.portrait}" />`;
				} else {
					desc += `${puppet.portrait}`;
				}
				desc += `</span>LV ${puppet.level}</div>`;
			});
			desc += '</span>';
		}
//		extra += `</div>`

		return desc+`</div>`;
	}

	// Modify native Save dialog descriptions upon opening the dialog.
	if (true) {
		$(document).on(':dialogopening', function () {
			if ($('#ui-dialog-body').hasClass('saves')) {
				$('#ui-dialog-body.saves tr').each(function (_, el) {
					var $tr = $(el);
					var $load = $tr.find('button.load:not([disabled])');

					if ($load.length === 0) {
						return;
					}

					var slot = $load.attr('id').split('-')[2];
					var save = slot === 'auto'
						? Save.autosave.get()
						: Save.slots.get(Number(slot));

					if (save !== null && typeof(save.metadata) == 'object') {
						$tr.find('td>div:first-child')
							.empty()
							.append(createSaveDescription(save.metadata));
					}
				});
				// Refresh the custom display when deleting saves
				$('#ui-dialog-body.saves button.delete').on('click', function () {
					$(document).trigger(':dialogopening');
				});
			}
		});
	}
})();
