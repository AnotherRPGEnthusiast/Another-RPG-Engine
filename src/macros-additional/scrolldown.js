/*
	<<scrolldown [duration]>>
	
	Credit to The Mad Exile

	duration : (optional) The length of time to animate the scroll, as the
	           strings 'fast' or 'slow' or a valid CSS time value (e.g. 5s
	           and 500ms).  The default duration is 'slow'.
*/
Macro.add('scrolldown', {
	handler : function () {
		var target   = document.scrollingElement || 'html,body';
		var duration;

		if (this.args.length > 0) {
			switch (this.args[0]) {
			case 'fast':
			case 'slow':
				duration = this.args[0];
				break;
			default:
				try {
					duration = Math.max(Engine.minDomActionDelay, Util.fromCssTime(this.args[0]));
				}
				catch (ex) {
					return this.error(ex.message);
				}
				break;
			}
		}
		else {
			duration = 'slow';
		}

		setTimeout(function () {
			$(target).animate({
				scrollTop: $(document).height() - $(window).height()
			}, duration);
		}, Engine.minDomActionDelay);
	}
});

