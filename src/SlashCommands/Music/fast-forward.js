const { SlashCommandBuilder } = require('discord.js');
const MusicUtil = require('../../Structures/Utilities/Music/MusicUtil');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('fast-forward')
        .setDescription('Fast forward the current track')
        .addIntegerOption(option =>
            option.setName('seconds')
                .setDescription('Number of seconds to fast forward')
                .setRequired(true)
                .setMinValue(1)
                .setMaxValue(300)
        ),
    async run({ client, interaction }) {
        const validation = await MusicUtil.validateMusicCommandWithQueue(client, interaction, true);
        
        if (!validation.valid) {
            return interaction.followUp({
                content: validation.message,
                ephemeral: true
            });
        }

        const { queue } = validation;
        const seconds = interaction.options.getInteger('seconds');
        const currentProgress = queue.node.streamTime;
        const newPosition = currentProgress + (seconds * 1000);

        if (newPosition >= queue.currentTrack.durationMS) {
            return interaction.followUp({
                content: 'Cannot fast forward beyond the track duration!',
                ephemeral: true
            });
        }

        try {
            await queue.node.seek(newPosition);
            
            const formatTime = (ms) => {
                const totalSeconds = Math.floor(ms / 1000);
                const minutes = Math.floor(totalSeconds / 60);
                const secs = totalSeconds % 60;
                return `${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
            };

            await interaction.followUp({
                content: `⏩ Fast forwarded **${seconds}** seconds to ${formatTime(newPosition)}`
            });
        } catch (error) {
            console.error('Fast forward command error:', error);
            await interaction.followUp({
                content: 'An error occurred while fast forwarding!',
                ephemeral: true
            });
        }
    }
};