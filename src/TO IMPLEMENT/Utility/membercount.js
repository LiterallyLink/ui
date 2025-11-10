const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('membercount')
        .setDescription("i.. i promise i didn't miscount!"),
    async run({ interaction }) {
        try {
            const all_members = await interaction.guild.members.fetch();

            const status_count = all_members.reduce((account, { presence }) => {
                const status = presence?.status || 'offline';
                account[status] = (account[status] || 0) + 1;
                
                // Check if member is streaming
                const isStreaming = presence?.activities?.some(activity => activity.type === 1);
                if (isStreaming) account.streaming = (account.streaming || 0) + 1;
                
                return account;
            }, { online: 0, idle: 0, dnd: 0, streaming: 0, offline: 0 });

            const member_count = all_members.size;
            const human_count = all_members.filter(member => !member.user.bot).size;
            const bot_count = all_members.filter(member => member.user.bot).size;

            const member_count_embed = new EmbedBuilder()
                .setTitle(`Member Count for ${interaction.guild.name}`)
                .setThumbnail(interaction.guild.iconURL({ dynamic: true }))
                .addFields(
                    { name: "Total Members", value: `${member_count}`, inline: true},
                    { name: "Total Humans", value: `${human_count}`, inline: true},
                    { name: "Total Bots", value: `${bot_count}`, inline: true},
                    { name: "Online", value: `${status_count.online}`, inline: true },
                    { name: "Idle", value: `${status_count.idle}`, inline: true },
                    { name: "DND", value: `${status_count.dnd}`, inline: true },
                    { name: "Offline", value: `${status_count.offline}`, inline: true },
                    { name: "Streaming", value: `${status_count.streaming}`, inline: true }
                )
                .setColor('#5b5c6e');
            
            return interaction.followUp({ embeds: [member_count_embed] });
        } catch (error) {
            console.error("Error in membercount command:", error);
            return interaction.followUp({ content: "Failed to fetch member information" });
        }
    }
};