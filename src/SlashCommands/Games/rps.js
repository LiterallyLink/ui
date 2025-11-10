const { SlashCommandBuilder, EmbedBuilder, ButtonBuilder, ButtonStyle, ActionRowBuilder } = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('rps')
        .setDescription('Play Rock Paper Scissors!')
        .addSubcommand(subcommand =>
            subcommand
                .setName('ai')
                .setDescription('Play against the AI'))
        .addSubcommand(subcommand =>
            subcommand
                .setName('challenge')
                .setDescription('Challenge another user')
                .addUserOption(option =>
                    option.setName('opponent')
                    .setDescription('Who would you like to challenge?')
                    .setRequired(true))),

    async run({ interaction }) {
        const subcommand = interaction.options.getSubcommand();
        const opponent = interaction.options.getUser('opponent') || interaction.client.user;
        const challenger = interaction.user;
        
        const isAIGame = subcommand === 'ai' || opponent.bot;
        const isSelfChallenge = opponent.id === challenger.id;

        const gameState = {
            challenger: { id: challenger.id, choice: null, user: challenger },
            opponent: { id: opponent.id, choice: null, user: opponent },
            isAIGame,
            isSelfChallenge
        };

        const rpsEmbed = this.createGameEmbed(challenger, opponent);
        const rpsButtons = this.createRpsButtons();
        
        const message = await interaction.followUp({
            embeds: [rpsEmbed],
            components: [rpsButtons]
        });

        const filter = i => {
            if (isAIGame || isSelfChallenge) return i.user.id === challenger.id;
            return i.user.id === challenger.id || i.user.id === opponent.id;
        };

        const collector = message.createMessageComponentCollector({
            filter,
            time: 30000
        });

        collector.on('collect', async i => {
            try {
                if (i.user.id === challenger.id && gameState.challenger.choice) {
                    return;
                }
                if (i.user.id === opponent.id && gameState.opponent.choice) {
                    return;
                }

                if (i.user.id === challenger.id) {
                    gameState.challenger.choice = i.customId;
                } else if (i.user.id === opponent.id) {
                    gameState.opponent.choice = i.customId;
                }

                if (isSelfChallenge && gameState.challenger.choice && !gameState.opponent.choice) {
                    gameState.opponent.choice = gameState.challenger.choice;
                }

                if (isAIGame && gameState.challenger.choice && !gameState.opponent.choice) {
                    const choices = ['rock', 'paper', 'scissors'];
                    gameState.opponent.choice = choices[Math.floor(Math.random() * choices.length)];
                }

                const updatedEmbed = this.updateGameEmbed(rpsEmbed, gameState);
                
                if (gameState.challenger.choice && gameState.opponent.choice) {
                    const result = this.determineWinner(gameState.challenger.choice, gameState.opponent.choice);
                    const finalEmbed = this.createResultEmbed(gameState, result);
                    const disabledButtons = this.createRpsButtons(true);

                    await i.update({
                        embeds: [finalEmbed],
                        components: [disabledButtons]
                    });
                    
                    collector.stop('game_complete');
                } else {
                    await i.update({
                        embeds: [updatedEmbed],
                        components: [rpsButtons]
                    });
                }
            } catch (error) {
                console.error('RPS Game Error:', error);
                await i.reply({ content: 'An error occurred during the game.', ephemeral: true });
            }
        });

        collector.on('end', (collected, reason) => {
            if (reason !== 'game_complete') {
                const timeoutEmbed = this.createTimeoutEmbed(challenger, opponent);
                const disabledButtons = this.createRpsButtons(true);

                interaction.editReply({ 
                    embeds: [timeoutEmbed], 
                    components: [disabledButtons] 
                }).catch(console.error);
            }
        });
    },

    createGameEmbed(challenger, opponent) {
        return new EmbedBuilder()
            .setTitle('Rock... Paper... Scissors .ᐟ')
            .setFields(
                { name: challenger.username, value: '❓', inline: true },
                { name: 'V/S', value: '⚡', inline: true },
                { name: opponent.username, value: '❓', inline: true }
            )
            .setColor('#5865f2');
    },

    updateGameEmbed(embed, gameState) {
        const challengerValue = gameState.challenger.choice ? '✅' : '❓';
        const opponentValue = gameState.opponent.choice ? '✅' : '❓';

        return embed.setFields(
            { name: gameState.challenger.user.username, value: challengerValue, inline: true },
            { name: 'V/S', value: '⚡', inline: true },
            { name: gameState.opponent.user.username, value: opponentValue, inline: true }
        ).setColor('#faa61a');
    },

    createResultEmbed(gameState, result) {
        const emojis = {
            rock: '🪨',
            paper: '📄',
            scissors: '✂️'
        };

        let resultTitle = '';
        let color = '#ed4245';

        switch (result) {
            case 'tie':
                resultTitle = "It's A Tie .ᐟ";
                color = '#faa61a';
                break;
            case 'win':
                resultTitle = `${gameState.challenger.user.username} Wins .ᐟ`;
                color = '#57f287';
                break;
            case 'lose':
                resultTitle = `${gameState.opponent.user.username} Wins .ᐟ`;
                color = '#ed4245';
                break;
        }

        return new EmbedBuilder()
            .setTitle(resultTitle)
            .setColor(color)
            .setFields(
                { name: gameState.challenger.user.username, value: emojis[gameState.challenger.choice], inline: true },
                { name: 'V/S', value: '⚡', inline: true },
                { name: gameState.opponent.user.username, value: emojis[gameState.opponent.choice], inline: true }
            );
    },

    createTimeoutEmbed(challenger, opponent) {
        return new EmbedBuilder()
            .setTitle('Time Up .ᐟ')
            .setColor('#ed4245')
            .setFields(
                { name: challenger.username, value: '❌', inline: true },
                { name: 'V/S', value: '⚡', inline: true },
                { name: opponent.username, value: '❌', inline: true }
            );
    },

    createRpsButtons(disabled = false) {
        return new ActionRowBuilder()
            .addComponents(
                new ButtonBuilder()
                    .setCustomId('rock')
                    .setLabel('🪨')
                    .setStyle(ButtonStyle.Primary)
                    .setDisabled(disabled),
                new ButtonBuilder()
                    .setCustomId('paper')
                    .setLabel('📄')
                    .setStyle(ButtonStyle.Primary)
                    .setDisabled(disabled),
                new ButtonBuilder()
                    .setCustomId('scissors')
                    .setLabel('✂️')
                    .setStyle(ButtonStyle.Primary)
                    .setDisabled(disabled)
            );
    },

    determineWinner(choice1, choice2) {
        const rules = {
            rock: { beats: 'scissors', losesTo: 'paper' },
            paper: { beats: 'rock', losesTo: 'scissors' },
            scissors: { beats: 'paper', losesTo: 'rock' }
        };

        if (choice1 === choice2) return 'tie';
        return rules[choice1].beats === choice2 ? 'win' : 'lose';
    }
};