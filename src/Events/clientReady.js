const Event = require('../Structures/Event');
const { YoutubeiExtractor } = require('discord-player-youtubei');

module.exports = class extends Event {

	constructor(...args) {
		super(...args, {
			once: true
		});
	}

	async run() {
		console.log("[Client] :: Successfully logged in as " + this.client.user.tag);
		
		try {
			await this.client.player.extractors.register(YoutubeiExtractor, {});
			console.log("[Extractor] :: YouTube extractor registered successfully.");
		} catch (error) {
			console.error("[Extractor] :: Failed to register YouTube extractor:", error);
		}
	}

};