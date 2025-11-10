const { SlashCommandBuilder } = require('discord.js');
const { QueueRepeatMode } = require('discord-player');
const MusicUtil = require('../../Structures/Utilities/Music/MusicUtil');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('loop')
        .setDescription('Toggle loop mode for music playback')
        .addStringOption(option =>
            option.setName('mode')
                .setDescription('Loop mode to set')
                .setRequired(true)
                .addChoices(
                    { name: 'Off', value: 'off' },
                    { name: 'Track', value: 'track' },
                    { name: 'Queue', value: 'queue' }
                )
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
        const mode = interaction.options.getString('mode');

        try {
            let repeatMode;
            let message;

            switch (mode) {
                case 'off':
                    repeatMode = QueueRepeatMode.OFF;
                    message = '🔄 Loop disabled';
                    break;
                case 'track':
                    repeatMode = QueueRepeatMode.TRACK;
                    message = '🔂 Now looping current track';
                    break;
                case 'queue':
                    repeatMode = QueueRepeatMode.QUEUE;
                    message = '🔁 Now looping entire queue';
                    break;
                default:
                    return interaction.followUp({
                        content: 'Invalid loop mode!',
                        ephemeral: true
                    });
            }

            queue.setRepeatMode(repeatMode);

            await interaction.followUp({
                content: message
            });

        } catch (error) {
            console.error('Loop command error:', error);
            await interaction.followUp({
                content: 'An error occurred while setting loop mode!',
                ephemeral: true
            });
        }
    }
};