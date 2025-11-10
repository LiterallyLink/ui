const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('ping')
        .setDescription("i..hope this'll help"),
    async run({ client, interaction }) {
        const latency = Date.now() - interaction.createdTimestamp;
        const api_latency = Math.round(client.ws.ping);
        const total_uptime_ms = client.utils.formatMilliseconds(client.uptime);
        
		const ping_embed = new EmbedBuilder()
        .setTitle(`𝘗..𝘗𝘰𝘯𝘨 .ᐟ 🔔`)
        .setThumbnail('https://files.catbox.moe/ewmuub.png')
        .setDescription(`Bot Latency : ${latency}ms\nAPI Latency : ${api_latency}ms\nR..Running for ${total_uptime_ms}!`)
        .setColor('#5b5c6e');

        return interaction.followUp({ embeds: [ping_embed] });
    }
};