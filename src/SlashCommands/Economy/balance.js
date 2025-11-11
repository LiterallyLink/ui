const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const dbUtils = require('../../Structures/Database/dbUtils');
const path = require('path');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('balance')
        .setDescription('Check your balance')
        .addUserOption(option =>
            option.setName('user')
                .setDescription('The user to check the balance of')
                .setRequired(false)),
    async run({ interaction }) {
        try {
            const targetUser = interaction.options.getUser('user') ?? interaction.user;
            const wallet = await dbUtils.getWallet(targetUser.id);
            const bank = await dbUtils.getBank(targetUser.id);
            const netWorth = wallet + bank;

            const coinsPath = path.join(__dirname, '../../..', 'assets', 'economy', 'coins.gif');

            const balanceEmbed = new EmbedBuilder()
                .setTitle(` `)
                .setAuthor({
                    name: `${targetUser.username}'s Balance`,
                    iconURL: targetUser.displayAvatarURL({ size: 256 })
                })
                .addFields(
                    { name: 'Wallet', value: `\`${wallet} 🪙\``, inline: true },
                    { name: 'Bank', value: `\`${bank} 🪙\``, inline: true },
                    { name: 'Net Worth', value: `\`${netWorth} 🪙\``, inline: true }
                )
                .setColor(0x36393F)
                .setThumbnail('attachment://coins.gif')
                .setFooter({
                    text: `Requested by ${interaction.user.displayName}`,
                    iconURL: interaction.user.displayAvatarURL()
                });

            await interaction.followUp({ 
                embeds: [balanceEmbed],
                files: [{ attachment: coinsPath, name: 'coins.gif' }]
            });
        } catch (error) {
            console.error('Balance command error:', error);
            await interaction.followUp({
                content: 'An error occurred while fetching your balance!',
                ephemeral: true
            });
        }
    }
};