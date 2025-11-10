const Event = require('../Structures/Event');

module.exports = class extends Event {
    constructor(...args) {
        super(...args, {
            emitter: 'player'
        });
    }

    async run(queue, error) {
        console.error(`[Player Error] :: Guild: ${queue.guild.name} (${queue.guild.id})`);
        console.error(`[Player Error] :: ${error.message}`);
        console.error(error);

        if (queue.metadata && queue.metadata.textChannel) {
            try {
                await queue.metadata.textChannel.send({
                    content: '❌ An error occurred while playing music. The queue has been cleared.'
                });
            } catch (channelError) {
                console.error('[Player Error] :: Failed to send error message to channel:', channelError);
            }
        }

        try {
            queue.tracks.clear();
            queue.delete();
        } catch (cleanupError) {
            console.error('[Player Error] :: Failed to cleanup queue:', cleanupError);
        }
    }
};