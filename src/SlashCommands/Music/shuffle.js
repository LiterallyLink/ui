const { SlashCommandBuilder } = require('discord.js');
const MusicUtil = require('../../Structures/Utilities/Music/MusicUtil');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('shuffle')
        .setDescription('Shuffle the current music queue'),
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
                content: 'There are no tracks in the queue to shuffle!',
                ephemeral: true
            });
        }

        if (tracks.length === 1) {
            return interaction.followUp({ 
                content: 'Only one track in queue - nothing to shuffle!',
                ephemeral: true
            });
        }

        try {
            const shuffledTracks = client.utils.shuffle([...tracks]);
            
            queue.tracks.clear();
            queue.addTrack(shuffledTracks);
            
            await interaction.followUp({ 
                content: `🔀 Successfully shuffled **${shuffledTracks.length}** tracks in the queue!` 
            });
        } catch (error) {
            console.error('Shuffle command error:', error);
            await interaction.followUp({ 
                content: 'An error occurred while shuffling the queue!',
                ephemeral: true
            });
        }
    }
};