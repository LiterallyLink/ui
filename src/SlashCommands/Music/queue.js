const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const MusicUtil = require('../../Structures/Utilities/Music/MusicUtil');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('queue')
        .setDescription('Show the current music queue'),
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
        const tracks = queue.tracks.data;

        const embed = new EmbedBuilder()
            .setTitle('🎵 Music Queue')
            .setColor('#5b5c6e')
            .setTimestamp();

        if (currentTrack) {
            embed.addFields({
                name: '🎶 Now Playing',
                value: `**${currentTrack.title}**\nBy: ${currentTrack.author}\nDuration: ${currentTrack.duration}`,
                inline: false
            });
        }

        if (tracks.length > 0) {
            const upcomingTracks = tracks.slice(0, 10).map((track, index) => {
                return `${index + 1}. **${track.title}** - ${track.author} (${track.duration})`;
            }).join('\n');

            embed.addFields({
                name: `📋 Up Next (${tracks.length} tracks)`,
                value: upcomingTracks,
                inline: false
            });
        } else {
            embed.addFields({
                name: '📋 Up Next',
                value: 'No tracks in queue',
                inline: false
            });
        }

        await interaction.followUp({ embeds: [embed] });
    }
};
