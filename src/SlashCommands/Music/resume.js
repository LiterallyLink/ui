const { SlashCommandBuilder } = require('discord.js');
const MusicUtil = require('../../Structures/Utilities/Music/MusicUtil');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('resume')
        .setDescription('Resume the paused track'),
    async run({ client, interaction }) {
        const validation = await MusicUtil.validateMusicCommandWithQueue(client, interaction, false);
        
        if (!validation.valid) {
            return interaction.followUp({
                content: validation.message,
                ephemeral: true
            });
        }

        const { queue } = validation;

        if (!queue.node.isPaused()) {
            return interaction.followUp({ 
                content: 'Music is not paused!',
                ephemeral: true
            });
        }

        queue.node.resume();

        await interaction.followUp({ 
            content: `▶️ Resumed: **${queue.currentTrack.title}**` 
        });
    }
};
