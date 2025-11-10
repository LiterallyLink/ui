const { SlashCommandBuilder } = require('discord.js');
const MusicUtil = require('../../Structures/Utilities/Music/MusicUtil');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('volume')
        .setDescription('Change the music volume')
        .addIntegerOption(option =>
            option.setName('level')
                .setDescription('Volume level (0-100)')
                .setRequired(true)
                .setMinValue(0)
                .setMaxValue(100)
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
        const volume = interaction.options.getInteger('level');

        try {
            queue.node.setVolume(volume);
            
            await interaction.followUp({
                content: `🔊 Volume set to **${volume}%**`
            });
        } catch (error) {
            console.error('Volume command error:', error);
            await interaction.followUp({
                content: 'An error occurred while changing the volume!',
                ephemeral: true
            });
        }
    }
};