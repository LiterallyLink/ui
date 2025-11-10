const { SlashCommandBuilder } = require('discord.js');
const MusicUtil = require('../../Structures/Utilities/Music/MusicUtil');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('clear')
        .setDescription('Clear all tracks from the music queue'),
    async run({ client, interaction }) {
        const validation = await MusicUtil.validateMusicCommandWithQueue(client, interaction, true);
        
        if (!validation.valid) {
            return interaction.followUp({ 
                content: validation.message,
                ephemeral: true
            });
        }

        const { queue } = validation;
        const tracks = queue.tracks.data;

        if (tracks.length === 0) {
            return interaction.followUp({ 
                content: 'The queue is already empty!',
                ephemeral: true
            });
        }

        try {
            const trackCount = tracks.length;
            queue.tracks.clear();
            
            await interaction.followUp({ 
                content: `🗑️ Successfully cleared **${trackCount}** track${trackCount === 1 ? '' : 's'} from the queue!\n\nThe current track will continue playing.` 
            });
        } catch (error) {
            console.error('Clear command error:', error);
            await interaction.followUp({ 
                content: 'An error occurred while clearing the queue!',
                ephemeral: true
            });
        }
    }
};
