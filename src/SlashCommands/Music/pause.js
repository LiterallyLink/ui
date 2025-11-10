const { SlashCommandBuilder } = require('discord.js');
const MusicUtil = require('../../Structures/Utilities/Music/MusicUtil');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('pause')
        .setDescription('Pause the current track'),
    async run({ client, interaction }) {
        const validation = await MusicUtil.validateMusicCommandWithQueue(client, interaction, true);
        
        if (!validation.valid) {
            return interaction.followUp({ 
                content: validation.message,
                ephemeral: true
            });
        }

        const { queue } = validation;

        if (queue.node.isPaused()) {
            return interaction.followUp({ 
                content: 'Music is already paused!',
                ephemeral: true
            });
        }

        queue.node.pause();
        
        await interaction.followUp({ 
            content: `⏸️ Paused: **${queue.currentTrack.title}**` 
        });
    }
};
