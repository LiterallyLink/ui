const { SlashCommandBuilder } = require('discord.js');
const MusicUtil = require('../../Structures/Utilities/Music/MusicUtil');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('skip')
        .setDescription('Skip the current track'),
    async run({ client, interaction }) {
        const validation = await MusicUtil.validateMusicCommandWithQueue(client, interaction, true);
        
        if (!validation.valid) {
            return interaction.followUp({ 
                content: validation.message,
                ephemeral: true
            });
        }

        const { queue } = validation;
        const currentTrack = queue.currentTrack;
        
        if (queue.tracks.data.length === 0) {
            queue.node.stop();
            return interaction.followUp({ 
                content: `⏭️ Skipped: **${currentTrack.title}** - No more tracks in queue.` 
            });
        }
        
        queue.node.skip();
        
        await interaction.followUp({ 
            content: `⏭️ Skipped: **${currentTrack.title}**` 
        });
    }
};