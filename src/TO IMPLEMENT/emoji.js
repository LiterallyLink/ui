const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('emoji')
        .setDescription('m-manage and view server e-emojis...')
        .addStringOption(option =>
            option.setName('list')
                .setDescription('...')
                .setRequired(true)
                .addChoices(
                    { name: 'all', value: 'all' },
                    { name: 'static', value: 'static' },
                    { name: 'animated', value: 'animated' }
                )),
    async run({ interaction }) {
        const view = interaction.options.getString('list');

        const all_emojis = await interaction.guild.emojis.fetch();

        const static_emotes = all_emojis.filter(emote => !emote.animated);
        const animated_emotes = all_emojis.filter(emote => emote.animated);

        const formatted_static_emotes = this.format_emotes(static_emotes, false);
        const formatted_animated_emotes = this.format_emotes(animated_emotes, true);

        const emote_embed = new EmbedBuilder()
            .setAuthor({
                name: 'Server Emojis',
                iconURL: interaction.guild.iconURL({ dynamic: true })
            })
            .setColor('#5b5c6e')
            .setTimestamp();

        switch (view) {
            case 'all':
                const all_description = [
                    `**Static :** ${static_emotes.size}`,
                    formatted_static_emotes || 'None',
                    '',
                    `**Animated :** ${animated_emotes.size}`,
                    formatted_animated_emotes || 'None'
                ].join('\n');

                emote_embed.setDescription(all_description);
                
                break;
            case 'static':
                emote_embed
                    .setDescription(`**Static :** ${static_emotes.size}\n${formatted_static_emotes || 'None'}`);

                break;
            case 'animated':
                emote_embed
                    .setDescription(`**Animated :** ${animated_emotes.size}\n${formatted_animated_emotes || 'None'}`);

                break;
        }

        await interaction.followUp({ embeds: [emote_embed] });
    },

    format_emotes(emojis, animated = false) {
        return emojis.size > 0 ? emojis.map(emote =>
            animated ? `<a:${emote.name}:${emote.id}>` :`<:${emote.name}:${emote.id}>`).join(' ') : null;
    }
};