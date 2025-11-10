const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const dbUtils = require('../../Structures/Database/dbUtils');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('balance')
        .setDescription('Check your balance'),
    async run({ interaction }) {
        try {
            const wallet = await dbUtils.getWallet(interaction.user.id);
            const bank = await dbUtils.getBank(interaction.user.id);
            const netWorth = wallet + bank;

            const balanceEmbed = new EmbedBuilder()
                .setTitle(`${interaction.user.username}'s balance`)
                .addFields(
                    { name: 'Wallet', value: `\`${wallet} 🪙\``, inline: true },
                    { name: 'Bank', value: `\`${bank} 🪙\``, inline: true },
                    { name: 'Net Worth', value: `\`${netWorth} 🪙\``, inline: true }
                )
                .setColor(0x36393F)
                .setThumbnail(interaction.user.displayAvatarURL({ size: 256 }))
                .setFooter({
                    text: `Requested by ${interaction.user.displayName}`,
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