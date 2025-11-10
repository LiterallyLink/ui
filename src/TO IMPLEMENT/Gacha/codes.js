const { SlashCommandBuilder, EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle, StringSelectMenuBuilder } = require('discord.js');

const cheerio = require('cheerio');
const axios = require('axios');

const GAME_CONFIG = {
    hsr: {
        name: 'Honkai Starrail',
        color: 0x0099FF,
        redeemUrl: 'https://hsr.hoyoverse.com/gift',
        fetcher: fetchHSRCodes
    },
    genshin: {
        name: 'Genshin Impact',
        color: 0x00FF99,
        redeemUrl: 'https://genshin.hoyoverse.com/en/gift',
        fetcher: fetchGenshinCodes
    }
    // Example for future games:
    // newGame: {
    //     name: 'Game Name',
    //     color: 0xHEXCOLOR,
    //     redeemUrl: 'https://redeem-url.com',
    //     fetcher: fetchNewGameCodes
    // }
};

module.exports = {
    data: new SlashCommandBuilder()
        .setName('codes')
        .setDescription('u-um... i can help you find redemption codes... if you\'d like me to...')
        .addStringOption(option =>
            option.setName('game')
                .setDescription('p-please choose a game...')
                .setRequired(true)
                .addChoices(
                    { name: 'Honkai Starrail', value: 'hsr' },
                    { name: 'Genshin Impact', value: 'genshin' }
                )),
    async run({ interaction }) {
        const game = interaction.options.getString('game');
        const config = GAME_CONFIG[game];

        const codes = await config.fetcher();
        await createResponse(interaction, codes, config);
    }
};

async function createResponse(interaction, codes, config) {
    const embed = createCodesEmbed(codes, config);
    const { rows, button } = createComponents(codes, config);

    const response = await interaction.editReply({
        embeds: [embed],
        components: rows
    });

    if (config.redeemUrl) {
        const collector = response.createMessageComponentCollector({ time: 300000 });

        collector.on('collect', async i => {
            if (i.customId === 'code_selector') {
                const urlButton = ButtonBuilder
                    .from(button)
                    .setURL(`${config.redeemUrl}?code=${i.values[0]}`);

                const urlRow = new ActionRowBuilder().addComponents(urlButton);
                await interaction.editReply({
                    embeds: [embed],
                    components: [rows[0], urlRow]
                });
                
                await i.deferUpdate();
            }
        });
    }
}

function createCodesEmbed(codes, config) {
    const embed = new EmbedBuilder()
        .setTitle(`${config.name} Codes`)
        .setColor(config.color);

    codes.forEach(code => {
        const itemText = code.rewards.map(r => `\`${r.count}x ${r.item}\``).join('\n');

        embed.addFields({ 
            name: code.code, 
            value: itemText || '\`No Reward\`', 
            inline: true 
        });
    });

    return embed;
}

function createComponents(codes, config) {
    const selector = new StringSelectMenuBuilder()
        .setCustomId('code_selector')
        .setPlaceholder('Select A Code To Redeem...')
        .addOptions(
            codes.map(code => ({
                label: code.code,
                description: 'Click To Select This Code',
                value: code.code
            }))
        );

    const selectorComponents = new ActionRowBuilder().addComponents(selector);
    const rows = [selectorComponents];

    let button = null;

    if (config.redeemUrl) {
        button = new ButtonBuilder()
            .setLabel('Redeem Selected Code')
            .setStyle(ButtonStyle.Link)
            .setURL(config.redeemUrl);
        rows.push(new ActionRowBuilder().addComponents(button));
    }

    return { rows, button };
}

async function fetchHSRCodes() {
    try {
        const response = await axios.get('https://honkai-star-rail.fandom.com/wiki/Redemption_Code');
        const $ = cheerio.load(response.data);
        
        const rows = $('table.wikitable tr');
        const activeCodes = [];

        rows.each((_, row) => {
            const $row = $(row);
            const codeElement = $row.find('code');
            const rewardElements = $row.find('td span.item-text');
            const statusText = $row.text().toLowerCase();
            
            if (codeElement.length && !statusText.includes('expired')) {
                const rewards = [];
                rewardElements.each((_, element) => {
                    const $element = $(element);
                    const itemName = $element.find('a').attr('title');
                    const count = $element.text().match(/×(\d+)/)?.[1] || '1';
                    if (itemName) {
                        rewards.push({
                            item: itemName,
                            count: count
                        });
                    }
                });

                activeCodes.push({
                    code: codeElement.text().trim(),
                    rewards: rewards
                });
            }
        });

        return activeCodes;
    } catch (error) {
        console.error('Error:', error);
        return [];
    }
}

async function fetchGenshinCodes() {
    try {
        const response = await axios.get('https://genshin-impact.fandom.com/wiki/Promotional_Code');
        const $ = cheerio.load(response.data);
        
        const activeCodes = [];
        $('tr').each((_, row) => {
            const $row = $(row);
            const codes = $row.find('code');
            
            codes.each((_, codeEl) => {
                const rewards = [];
                $row.find('.item-text').each((_, el) => {
                    const count = $(el).text().match(/×(\d+)/)?.[1] || '1';
                    const item = $(el).find('a').attr('title') || '';
                    if (item) {
                        rewards.push({ item, count });
                    }
                });
                
                activeCodes.push({
                    code: $(codeEl).text().trim(),
                    rewards
                });
            });
        });

        return activeCodes;
    } catch (error) {
        console.error('Error:', error);
        return [];
    }
}