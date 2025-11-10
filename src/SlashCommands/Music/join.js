const { SlashCommandBuilder } = require('discord.js');
const MusicUtil = require('../../Structures/Utilities/Music/MusicUtil');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('join')
        .setDescription('Join your voice channel'),
    async run({ client, interaction }) {
        const validation = await MusicUtil.validateBasicMusicCommand(client, interaction);
        if (!validation.valid) {
            return interaction.followUp({
                content: validation.message,
                ephemeral: true
            });
        }
        const voiceChannel = validation.voiceChannel;

        let queue = client.player.nodes.get(interaction.guildId);

        if (queue && queue.connection) {
            if (queue.connection.joinConfig.channelId === voiceChannel.id) {
                return interaction.followUp({
                    content: `I'm already in ${voiceChannel.name}!`,
                    ephemeral: true
                });
            } else {
                return interaction.followUp({
                    content: 'I\'m already connected to a different voice channel!',
                    ephemeral: true
                });
            }
        }

        if (!queue) {
            queue = client.player.nodes.create(interaction.guild, {
                metadata: {
                    voiceChannel,
                    textChannel: interaction.channel
                }
            });
        }

        try {
            await queue.connect(voiceChannel);

            await interaction.followUp({
                content: `🔗 Successfully joined ${voiceChannel.name}!`
            });
        } catch (error) {
            console.error('Join command error:', error);
            await interaction.followUp({
                content: 'Failed to join the voice channel!',
                ephemeral: true
            });
        }
    }
};
