const Event = require('../Structures/Event.js');

module.exports = class extends Event {

	async run(message) {
        const channel_id = message.channel.id;
        const author_id = message.author.id;
	}

};
