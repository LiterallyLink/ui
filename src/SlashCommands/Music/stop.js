const { SlashCommandBuilder } = require('discord.js');
const MusicUtil = require('../../Structures/Utilities/Music/MusicUtil.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('stop')
        .setDescription('Stop music playback and clear the queue'),
    async run({ client, interaction }) {
        const validation = await MusicUtil.validateMusicCommandWithQueue(client, interaction, true);
        
        if (!validation.valid) {
            return interaction.followUp({
                content: validation.message,
                ephemeral: true
            });
        }

        const { queue } = validation;
        
        queue.node.stop();
        queue.tracks.clear();
        queue.delete();

        await interaction.followUp({ 
            content: `⏹️ Stopped playback and cleared queue.` 
        });
    }
};
