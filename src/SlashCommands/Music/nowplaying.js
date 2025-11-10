const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const MusicUtil = require('../../Structures/Utilities/Music/MusicUtil');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('nowplaying')
        .setDescription('Show information about the currently playing track'),
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

        if (!currentTrack) {
            return interaction.followUp({
                content: 'No track information available!',
                ephemeral: true
            });
        }

        try {
            const progress = queue.node.streamTime;
            const total = currentTrack.durationMS;

            const progressSeconds = Math.floor(progress / 1000);
            const totalSeconds = Math.floor(total / 1000);

            const formatTime = (seconds) => {
                const hours = Math.floor(seconds / 3600);
                const minutes = Math.floor((seconds % 3600) / 60);
                const secs = seconds % 60;

                if (hours > 0) {
                    return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
                } else {
                    return `${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
                }
            };

            const progressBar = (current, max, length = 20) => {
                const percentage = Math.min(current / max, 1);
                const filled = Math.round(percentage * length);
                const empty = length - filled;
                return '▰'.repeat(filled) + '▱'.repeat(empty);
            };

            const embed = new EmbedBuilder()
                .setTitle('🎵 Now Playing')
                .addFields(
                    { name: 'Track', value: `**${currentTrack.title}**`, inline: true },
                    { name: 'Artist', value: `${currentTrack.author}`, inline: true },
                    { name: 'Duration', value: `${currentTrack.duration}`, inline: true },
                    { name: 'Progress', value: `${formatTime(progressSeconds)} / ${formatTime(totalSeconds)}`, inline: true },
                    { name: 'Queue Position', value: `1 of ${queue.tracks.data.length + 1}`, inline: true },
                    { name: 'Source', value: `[View Original](${currentTrack.url})`, inline: true },
                    { name: '\u200b', value: `${progressBar(progress, total)}\n\`${formatTime(progressSeconds)}\` ━━━━━━━━━━━━━━━━━━━━ \`${formatTime(totalSeconds)}\``, inline: false }
                )
                .setThumbnail(currentTrack.thumbnail)
                .setColor('#5b5c6e')
                .setTimestamp();

            if (currentTrack.requestedBy) {
                embed.setFooter({
                    text: `Requested by ${currentTrack.requestedBy.username}`,
                    iconURL: currentTrack.requestedBy.displayAvatarURL()
                });
            }

            if (queue.tracks.data.length > 0) {
                const nextTrack = queue.tracks.data[0];
                embed.addFields({
                    name: 'Up Next',
                    value: `**${nextTrack.title}** by ${nextTrack.author}`,
                    inline: false
                });
            }

            await interaction.followUp({ embeds: [embed] });

        } catch (error) {
            console.error('Now playing command error:', error);
            await interaction.followUp({
                content: 'An error occurred while getting track information!',
                ephemeral: true
            });
        }
    }
};
