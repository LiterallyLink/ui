const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const dbUtils = require('../../Structures/Database/dbUtils');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('balance')
        .setDescription('Check your balance'),
    async run({ interaction }) {
        try {
            const balance = await dbUtils.getBalance(interaction.user.id);

            const balanceEmbed = new EmbedBuilder()
                .setTitle(`${interaction.user.username}'s Balance`)
                .setDescription(`💰 **${balance}**`)
                .setColor('#5b5c6e')
                .setTimestamp()
                .setFooter({
                    text: interaction.user.username,
                    iconURL: interaction.user.displayAvatarURL()
                });

            await interaction.followUp({ embeds: [balanceEmbed] });
        } catch (error) {
            console.error('Balance command error:', error);
            await interaction.followUp({
                content: 'An error occurred while fetching your balance!',
                ephemeral: true
            });
        }
    }
};