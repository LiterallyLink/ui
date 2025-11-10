const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('avatar')
        .setDescription("Display someone's avatar")
        .addStringOption(option =>
            option.setName('type')
                .setDescription('Choose between server or global avatar')
                .setRequired(true)
                .addChoices(
                    { name: 'Global', value: 'global' },
                    { name: 'Server', value: 'server' }
                ))
        .addUserOption(option => 
            option.setName('user')
                .setDescription('The user whose avatar you want to view')
                .setRequired(false))
        .addStringOption(option =>
            option.setName('format')
                .setDescription('Image format')
                .addChoices(
                    { name: 'PNG', value: 'png' },
                    { name: 'JPEG', value: 'jpg' },
                    { name: 'WebP', value: 'webp' },
                    { name: 'GIF', value: 'gif' }
                )),
    async run({ interaction }) {
        const targetUser = interaction.options.getUser('user') ?? interaction.user;
        const avatarType = interaction.options.getString('type');
        const format = interaction.options.getString('format') ?? 'png';

        try {
            let avatarUrl;

            if (avatarType === 'server') {
                const member = await interaction.guild.members.fetch(targetUser.id);
                avatarUrl = member.displayAvatarURL({ 
                    extension: format,
                    size: 1024
                });
            } else {
                avatarUrl = targetUser.displayAvatarURL({ 
                    extension: format,
                    size: 1024
                });
            }

            const avatarEmbed = new EmbedBuilder()
                .setTitle(`${targetUser.displayName}'s ${avatarType} avatar`)
                .setDescription(`[Download Avatar](${avatarUrl})`)
                .setImage(avatarUrl)
                .setColor(0x5b5c6e)
                .setTimestamp()
                .setFooter({ 
                    text: `Requested by ${interaction.user.displayName}`,
                    iconURL: interaction.user.displayAvatarURL()
                });

            await interaction.followUp({ embeds: [avatarEmbed] });

        } catch (error) {
            console.error('Avatar command error:', error);
            await interaction.followUp({ 
                content: 'An error occurred while fetching the avatar.', 
                ephemeral: true 
            });
        }
    }
};