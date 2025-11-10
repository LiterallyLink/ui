const { SlashCommandBuilder } = require('discord.js');
const { REST } = require('@discordjs/rest');
const { Routes } = require('discord-api-types/v9');
require('dotenv').config();

module.exports = {
    data: new SlashCommandBuilder()
        .setName('clear-commands')
        .setDescription('Clears all guild commands from whitelisted guilds.'),
    async run({ client, interaction }) {
        const devIds = JSON.parse(process.env.DEVELOPER_IDS || '[]');
        
        if (!devIds.includes(interaction.user.id)) {
            return interaction.followUp({
                content: '[DEV] :: You do not have permission to use this command.',
                ephemeral: true
            });
        }

        try {
            const rest = new REST({ version: '9' }).setToken(process.env.BOT_TOKEN);
            const guildIds = JSON.parse(process.env.WHITELISTED_GUILD_IDS);

            for (const guildId of guildIds) {
                await rest.put(Routes.applicationGuildCommands(process.env.CLIENT_ID, guildId), { body: [] });
            }

            await client.utils.loadSlashCommands();

            const guildList = guildIds.map((id) => `\`${id}\``).join('\n');

            await interaction.followUp({
                content: `[DEV] :: Successfully cleared and re-registered all guild commands from whitelisted guilds:\n${guildList}`,
                ephemeral: true
            });
        } catch (error) {
            console.error('[DEV] :: Error clearing commands:', error);
            await interaction.followUp({
                content: '[DEV] :: An error occurred while clearing commands.',
                ephemeral: true
            });
        }
    }
};