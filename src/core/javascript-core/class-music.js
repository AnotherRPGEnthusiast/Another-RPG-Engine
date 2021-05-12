window.Music = class Music {
	constructor (name) {
		this.title = name;
	}

	get musicData () {
		return (setup.musicData[this.title] || {});
	}

	get author () {
		return this.musicData.author;
	}

	get license () {
		return this.musicData.license;
	}

	get distributor () {
		return this.musicData.distributor;
	}

	clone () {
		// Return a new instance containing our current data.
		return new Music(this.title);
	}

	toJSON () {
		// Return a code string that will create a new instance
		// containing our current data.
		return JSON.reviveWrapper('new Music($ReviveData$)', this.title);
	}
};
