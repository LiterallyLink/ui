const { SlashCommandBuilder } = require('discord.js');
const MusicUtil = require('../../Structures/Utilities/Music/MusicUtil');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('leave')
        .setDescription('Leave the voice channel'),
    async run({ client, interaction }) {
        const validation = await MusicUtil.validateMusicCommandWithQueue(client, interaction, false);
        
        if (!validation.valid) {
            return interaction.followUp({
                content: validation.message,
                ephemeral: true
            });
        }
        
        const { queue } = validation;
        
        try {
            if (queue.node.isPlaying()) {
                queue.node.stop();
                queue.tracks.clear();
            }
            
            queue.delete();
            
            await interaction.followUp({
                content: '👋 Successfully left the voice channel!'
            });
        } catch (error) {
            console.error('Leave command error:', error);
            await interaction.followUp({
                content: 'An error occurred while leaving the voice channel!',
                ephemeral: true
            });
        }
    }
};
