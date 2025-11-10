const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('ping')
        .setDescription("Check on the latency and uptime of the bot!"),
    async run({ client, interaction }) {
        const latency = Date.now() - interaction.createdTimestamp;
        const api_latency = Math.round(client.ws.ping);
        const total_uptime_ms = client.utils.formatMilliseconds(client.uptime);
        
		const ping_embed = new EmbedBuilder()
        .setTitle(`𝘗𝘰𝘯𝘨— .ᐟ 🔔`)
        .setDescription(`Bot Latency : ${latency}ms\nAPI Latency : ${api_latency}ms\nRunning for ${total_uptime_ms}`)
        .setColor('#5b5c6e');

        return interaction.followUp({ embeds: [ping_embed] });
    }
};