const Event = require('../Structures/Event');

module.exports = class extends Event {
    constructor(...args) {
        super(...args, {
            emitter: 'player'
        });
    }

    async run(queue, track) {
        console.log(`[Player Start] :: Now playing: ${track.title} in ${queue.guild.name}`);

        if (queue.metadata && queue.metadata.textChannel) {
            try {
                await queue.metadata.textChannel.send({
                    content: `🎵 Now playing: **${track.title}** by **${track.author}**`
                });
            } catch (error) {
                console.error('[Player Start] :: Failed to send now playing message:', error);
            }
        }
    }
};