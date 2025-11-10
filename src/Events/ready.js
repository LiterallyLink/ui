const Event = require('../Structures/Event');
const { YoutubeiExtractor } = require('discord-player-youtubei');

module.exports = class extends Event {

	constructor(...args) {
		super(...args, {
			once: true
		});
	}

	async run() {
		console.log("Initializing Bot.");
		
		try {
			await this.client.player.extractors.register(YoutubeiExtractor, {});
			console.log("YouTube extractor registered successfully.");
		} catch (error) {
			console.error("Failed to register YouTube extractor:", error);
		}
	}

};