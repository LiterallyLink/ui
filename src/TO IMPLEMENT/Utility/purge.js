const { SlashCommandBuilder, PermissionFlagsBits } = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('purge')
        .setDescription('d-delete messages with various filters... i\'ll be careful!')
        .setDefaultMemberPermissions(PermissionFlagsBits.ManageMessages)
        // Subcommand: all messages
        .addSubcommand(subcommand => 
            subcommand
                .setName('all')
                .setDescription('d-delete all messages')
                .addIntegerOption(option =>
                    option.setName('amount')
                        .setDescription('h-how many messages should i remove...?')
                        .setRequired(true)
                        .setMinValue(1)
                        .setMaxValue(100)))
        // Subcommand: user messages
        .addSubcommand(subcommand => 
            subcommand
                .setName('user')
                .setDescription('d-delete messages from a specific user')
                .addUserOption(option =>
                    option.setName('target')
                        .setDescription('w-which user\'s messages should i remove?')
                        .setRequired(true))
                .addIntegerOption(option =>
                    option.setName('amount')
                        .setDescription('h-how many messages should i remove...?')
                        .setRequired(true)
                        .setMinValue(1)
                        .setMaxValue(100)))
        // Subcommand: bot messages
        .addSubcommand(subcommand => 
            subcommand
                .setName('bots')
                .setDescription('d-delete messages from bot users')
                .addIntegerOption(option =>
                    option.setName('amount')
                        .setDescription('h-how many messages should i remove...?')
                        .setRequired(true)
                        .setMinValue(1)
                        .setMaxValue(100)))
        // Subcommand: text match
        .addSubcommand(subcommand => 
            subcommand
                .setName('text')
                .setDescription('d-delete messages containing specific text')
                .addStringOption(option =>
                    option.setName('substring')
                        .setDescription('w-what text should i look for?')
                        .setRequired(true))
                .addIntegerOption(option =>
                    option.setName('amount')
                        .setDescription('h-how many messages should i check...?')
                        .setRequired(true)
                        .setMinValue(1)
                        .setMaxValue(100)))
        // Subcommand: embeds
        .addSubcommand(subcommand => 
            subcommand
                .setName('embeds')
                .setDescription('d-delete messages with embeds')
                .addIntegerOption(option =>
                    option.setName('amount')
                        .setDescription('h-how many messages should i check...?')
                        .setRequired(true)
                        .setMinValue(1)
                        .setMaxValue(100)))
        // Subcommand: emoji
        .addSubcommand(subcommand => 
            subcommand
                .setName('emoji')
                .setDescription('d-delete messages with custom emoji')
                .addIntegerOption(option =>
                    option.setName('amount')
                        .setDescription('h-how many messages should i check...?')
                        .setRequired(true)
                        .setMinValue(1)
                        .setMaxValue(100)))
        // Subcommand: attachments
        .addSubcommand(subcommand => 
            subcommand
                .setName('attachments')
                .setDescription('d-delete messages with files or attachments')
                .addIntegerOption(option =>
                    option.setName('amount')
                        .setDescription('h-how many messages should i check...?')
                        .setRequired(true)
                        .setMinValue(1)
                        .setMaxValue(100)))
        // Subcommand: human messages
        .addSubcommand(subcommand => 
            subcommand
                .setName('humans')
                .setDescription('d-delete messages from human users (non-bots)')
                .addIntegerOption(option =>
                    option.setName('amount')
                        .setDescription('h-how many messages should i check...?')
                        .setRequired(true)
                        .setMinValue(1)
                        .setMaxValue(100)))
        // Subcommand: images
        .addSubcommand(subcommand => 
            subcommand
                .setName('images')
                .setDescription('d-delete messages with images')
                .addIntegerOption(option =>
                    option.setName('amount')
                        .setDescription('h-how many messages should i check...?')
                        .setRequired(true)
                        .setMinValue(1)
                        .setMaxValue(100)))
        // Subcommand: links
        .addSubcommand(subcommand => 
            subcommand
                .setName('links')
                .setDescription('d-delete messages containing links')
                .addIntegerOption(option =>
                    option.setName('amount')
                        .setDescription('h-how many messages should i check...?')
                        .setRequired(true)
                        .setMinValue(1)
                        .setMaxValue(100)))
        // Subcommand: mentions
        .addSubcommand(subcommand => 
            subcommand
                .setName('mentions')
                .setDescription('d-delete messages with @mentions')
                .addIntegerOption(option =>
                    option.setName('amount')
                        .setDescription('h-how many messages should i check...?')
                        .setRequired(true)
                        .setMinValue(1)
                        .setMaxValue(100)))
        // Subcommand: reactions
        .addSubcommand(subcommand => 
            subcommand
                .setName('reactions')
                .setDescription('remove all reactions from messages')
                .addIntegerOption(option =>
                    option.setName('amount')
                        .setDescription('f-from how many messages should i remove reactions?')
                        .setRequired(true)
                        .setMinValue(1)
                        .setMaxValue(100))),
    
    async run({ interaction }) {
        try {
            const subcommand = interaction.options.getSubcommand();
            const amount = interaction.options.getInteger('amount');
            const channel = interaction.channel;
            
            const messages = await this.fetchMessages(channel, amount, interaction.id);
            
            if (messages.size === 0) {
                return interaction.followUp(`I-I couldn't find any messages to purge...`);
            }
            
            switch (subcommand) {
                case 'all': {
                    return this.handlePurgeAll(interaction, messages);
                }
                case 'user': {
                    const user = interaction.options.getUser('target');
                    return this.handlePurgeUser(interaction, messages, user);
                }
                case 'bots': {
                    return this.handlePurgeBots(interaction, messages);
                }
                case 'text': {
                    const substring = interaction.options.getString('substring');
                    return this.handlePurgeText(interaction, messages, substring);
                }
                case 'embeds': {
                    return this.handlePurgeEmbeds(interaction, messages);
                }
                case 'emoji': {
                    return this.handlePurgeEmoji(interaction, messages);
                }
                case 'attachments': {
                    return this.handlePurgeAttachments(interaction, messages);
                }
                case 'humans': {
                    return this.handlePurgeHumans(interaction, messages);
                }
                case 'images': {
                    return this.handlePurgeImages(interaction, messages);
                }
                case 'links': {
                    return this.handlePurgeLinks(interaction, messages);
                }
                case 'mentions': {
                    return this.handlePurgeMentions(interaction, messages);
                }
                case 'reactions': {
                    return this.handlePurgeReactions(interaction, messages);
                }
            }
            
        } catch (error) {
            console.error('Error in purge command:', error);
            
            if (error.code === 50034) {
                return interaction.followUp(`I-I can't delete messages that are older than 14 days due to Discord limitations...`);
            }
            
            return interaction.followUp(`I-I'm sorry, something went wrong while deleting messages...`);
        }
    },
    
    async handlePurgeAll(interaction, messages) {
        return this.deleteMessages(interaction, messages, 'all messages');
    },
    
    async handlePurgeUser(interaction, messages, user) {
        const filtered = messages.filter(msg => msg.author.id === user.id);
        return this.deleteMessages(interaction, filtered, `messages from ${user.username}`);
    },
    
    async handlePurgeBots(interaction, messages) {
        const filtered = messages.filter(msg => msg.author.bot);
        return this.deleteMessages(interaction, filtered, 'messages from bots');
    },
    
    async handlePurgeText(interaction, messages, substring) {
        const filtered = messages.filter(msg => 
            msg.content && msg.content.toLowerCase().includes(substring.toLowerCase())
        );
        return this.deleteMessages(interaction, filtered, `messages containing "${substring}"`);
    },
    
    async handlePurgeEmbeds(interaction, messages) {
        const filtered = messages.filter(msg => 
            msg.embeds && msg.embeds.length > 0
        );
        return this.deleteMessages(interaction, filtered, 'messages with embeds');
    },
    
    async handlePurgeEmoji(interaction, messages) {
        const emojiRegex = /<a?:[a-zA-Z0-9_]+:[0-9]+>/g;
        const filtered = messages.filter(msg => 
            msg.content && emojiRegex.test(msg.content)
        );
        return this.deleteMessages(interaction, filtered, 'messages with custom emoji');
    },
    
    async handlePurgeAttachments(interaction, messages) {
        const filtered = messages.filter(msg => 
            msg.attachments && msg.attachments.size > 0
        );
        return this.deleteMessages(interaction, filtered, 'messages with attachments');
    },
    
    async handlePurgeHumans(interaction, messages) {
        const filtered = messages.filter(msg => !msg.author.bot);
        return this.deleteMessages(interaction, filtered, 'messages from humans');
    },
    
    async handlePurgeImages(interaction, messages) {
        const filtered = messages.filter(msg => {
            const hasImageAttachment = msg.attachments.some(attachment => 
                attachment.contentType && attachment.contentType.startsWith('image/')
            );
            
            const hasImageEmbed = msg.embeds.some(embed => 
                embed.image || embed.thumbnail
            );
            
            return hasImageAttachment || hasImageEmbed;
        });
        return this.deleteMessages(interaction, filtered, 'messages with images');
    },
    
    async handlePurgeLinks(interaction, messages) {
        const urlRegex = /(https?:\/\/[^\s]+)/g;
        const filtered = messages.filter(msg => 
            msg.content && urlRegex.test(msg.content)
        );
        return this.deleteMessages(interaction, filtered, 'messages with links');
    },
    
    async handlePurgeMentions(interaction, messages) {
        const filtered = messages.filter(msg => 
            (msg.mentions.users.size > 0) || 
            (msg.mentions.roles.size > 0) || 
            msg.mentions.everyone
        );
        return this.deleteMessages(interaction, filtered, 'messages with mentions');
    },
    
    async handlePurgeReactions(interaction, messages) {
        let count = 0;
        for (const message of messages.values()) {
            if (message.reactions && message.reactions.cache.size > 0) {
                await message.reactions.removeAll().catch(error => console.error('Failed to clear reactions:', error));
                count++;
            }
        }
        
        return interaction.followUp(`I-I've removed all reactions from ${count} message${count !== 1 ? 's' : ''}!`);
    },
    
    // Helper methods
    async fetchMessages(channel, amount, beforeId) {
        return await channel.messages.fetch({ 
            limit: amount,
            before: beforeId 
        });
    },
    
    async deleteMessages(interaction, messages, type) {
        if (messages.size === 0) {
            return interaction.followUp(`I-I couldn't find any ${type} to delete...`);
        }
        
        const twoWeeksAgo = Date.now() - (14 * 24 * 60 * 60 * 1000);
        const filteredMessages = messages.filter(msg => msg.createdTimestamp > twoWeeksAgo);
        
        if (filteredMessages.size === 0) {
            return interaction.followUp(`I-I found messages matching your criteria, but they're all older than 14 days and can't be bulk deleted...`);
        }
        
        const deleted = await interaction.channel.bulkDelete(filteredMessages, true);
        
        return interaction.followUp(`I-I've deleted ${deleted.size} ${type}!`);
    }
};