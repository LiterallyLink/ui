const Event = require('../Structures/Event');

module.exports = class extends Event {
    constructor(...args) {
        super(...args, {
            emitter: 'player'
        });
    }

    async run(queue) {
        console.log(`[Player Empty Queue] :: Queue finished in ${queue.guild.name}`);

        if (queue.metadata && queue.metadata.textChannel) {
            try {
                await queue.metadata.textChannel.send({
                    content: '🎵 Queue finished! Add more songs with `/play` or the bot will leave soon.'
                });
            } catch (error) {
                console.error('[Player Empty Queue] :: Failed to send queue finished message:', error);
            }
        }

        setTimeout(() => {
            if (queue && queue.tracks.data.length === 0) {
                try {
                    queue.delete();
                } catch (error) {
                    console.error('[Player Empty Queue] :: Failed to cleanup inactive queue:', error);
                }
            }
        }, 5 * 60 * 1000); 
    }
};