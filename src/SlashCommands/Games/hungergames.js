const { SlashCommandBuilder } = require('@discordjs/builders');
const { EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle, ComponentType } = require('discord.js');

const TributeManager = require('../../Structures/Utilities/Games/HungerGames/TributeManager.js');
const EventManager = require('../../Structures/Utilities/Games/HungerGames/EventManager.js');
const CanvasManager = require('../../Structures/Utilities/Games/HungerGames/CanvasManager.js');

module.exports = {
	data: new SlashCommandBuilder()
		.setName('hunger-games')
		.setDescription('Prepare a game of hunger games.')
		.addSubcommand(subcommand =>
			subcommand
				.setName('random')
				.setDescription('Start a game with random participants')
				.addIntegerOption(option =>
					option.setName('count')
						.setDescription('Number of random participants (2-24)')
						.setMinValue(2)
						.setMaxValue(24)
						.setRequired(true)
				)
				.addStringOption(option =>
					option.setName('arena')
						.setDescription('Choose the arena location')
						.addChoices(
							{ name: 'Default', value: 'default' },
							{ name: 'Arctic', value: 'arctic' },
							{ name: 'Jungle', value: 'jungle' }
						)
						.setRequired(false)
				),
		)
		.addSubcommand(subcommand =>
			subcommand
				.setName('manual')
				.setDescription('Start a game with manually selected participants')
				.addUserOption(option => option.setName('tribute-1').setDescription('The first tribute').setRequired(true))
				.addUserOption(option => option.setName('tribute-2').setDescription('The second tribute').setRequired(true))
				.addUserOption(option => option.setName('tribute-3').setDescription('The third tribute').setRequired(false))
				.addUserOption(option => option.setName('tribute-4').setDescription('The fourth tribute').setRequired(false))
				.addUserOption(option => option.setName('tribute-5').setDescription('The fifth tribute').setRequired(false))
				.addUserOption(option => option.setName('tribute-6').setDescription('The sixth tribute').setRequired(false))
				.addUserOption(option => option.setName('tribute-7').setDescription('The seventh tribute').setRequired(false))
				.addUserOption(option => option.setName('tribute-8').setDescription('The eighth tribute').setRequired(false))
				.addUserOption(option => option.setName('tribute-9').setDescription('The ninth tribute').setRequired(false))
				.addUserOption(option => option.setName('tribute-10').setDescription('The tenth tribute').setRequired(false))
				.addUserOption(option => option.setName('tribute-11').setDescription('The eleventh tribute').setRequired(false))
				.addUserOption(option => option.setName('tribute-12').setDescription('The twelfth tribute').setRequired(false))
				.addUserOption(option => option.setName('tribute-13').setDescription('The thirteenth tribute').setRequired(false))
				.addUserOption(option => option.setName('tribute-14').setDescription('The fourteenth tribute').setRequired(false))
				.addUserOption(option => option.setName('tribute-15').setDescription('The fifteenth tribute').setRequired(false))
				.addUserOption(option => option.setName('tribute-16').setDescription('The sixteenth tribute').setRequired(false))
				.addUserOption(option => option.setName('tribute-17').setDescription('The seventeenth tribute').setRequired(false))
				.addUserOption(option => option.setName('tribute-18').setDescription('The eighteenth tribute').setRequired(false))
				.addUserOption(option => option.setName('tribute-19').setDescription('The nineteenth tribute').setRequired(false))
				.addUserOption(option => option.setName('tribute-20').setDescription('The twentieth tribute').setRequired(false))
				.addUserOption(option => option.setName('tribute-21').setDescription('The twenty first tribute').setRequired(false))
				.addUserOption(option => option.setName('tribute-22').setDescription('The twenty second tribute').setRequired(false))
				.addUserOption(option => option.setName('tribute-23').setDescription('The twenty third tribute').setRequired(false))
				.addUserOption(option => option.setName('tribute-24').setDescription('The twenty fourth tribute').setRequired(false))
				.addStringOption(option =>
					option.setName('arena')
						.setDescription('Choose the arena location')
						.addChoices(
							{ name: 'Default', value: 'default' },
							{ name: 'Arctic', value: 'arctic' },
							{ name: 'Jungle', value: 'jungle' }
						)
						.setRequired(false)
				)
		),
	async run({ client, interaction }) {
		const subcommand = interaction.options.getSubcommand();
		const arenaChoice = interaction.options.getString('arena') || 'default';
		
		const eventManager = new EventManager();
		const arenaEvents = eventManager.getArenaEvents(arenaChoice);
		const { bloodbath, day, night } = arenaEvents;

		const tributeManager = new TributeManager(client);
		const canvasManager = new CanvasManager(client);

		let tributes;
		
		if (subcommand === 'random') {
			const count = interaction.options.getInteger('count');
			tributes = await tributeManager.getRandomTributes(interaction, count);
		} else if (subcommand === 'manual') {
			const userOptions = [];

			for (let i = 1; i <= 24; i++) {
				const user = interaction.options.getUser(`tribute-${i}`);
				if (user) {
					userOptions.push({ user });
				}
			}

			tributes = userOptions;
		}

		tributeManager.generateTributeData(tributes);
		const canvas = await canvasManager.populateCanvas(tributeManager.getAllTributes());

		const setupButtons = new ActionRowBuilder()
			.addComponents(
				new ButtonBuilder()
					.setCustomId('proceed')
					.setLabel('Proceed')
					.setStyle(ButtonStyle.Success),
				new ButtonBuilder()
					.setCustomId('randomize')
					.setLabel('Randomize Tributes')
					.setStyle(ButtonStyle.Primary),
				new ButtonBuilder()
					.setCustomId('delete')
					.setLabel('🗑️')
					.setStyle(ButtonStyle.Danger)
			);

		const inGameButtons = new ActionRowBuilder()
			.addComponents(
				new ButtonBuilder()
					.setCustomId('proceed')
					.setLabel('Proceed')
					.setStyle(ButtonStyle.Success),
				new ButtonBuilder()
					.setCustomId('status')
					.setEmoji('🔄')
					.setLabel('Show Status')
					.setStyle(ButtonStyle.Secondary),
				new ButtonBuilder()
					.setCustomId('delete')
					.setLabel('🗑️')
					.setStyle(ButtonStyle.Danger)
			);

		const theReapingEmbed = new EmbedBuilder()
			.setImage('attachment://tributesPage.png')
			.setColor('#5d5050');
		let theReapingMsg = await interaction.followUp({
			embeds: [theReapingEmbed],
			files: [{ attachment: canvas.toBuffer(), name: 'tributesPage.png' }],
			components: [setupButtons]
		});

		const filter = i => i.user.id === interaction.user.id;
		
		let startGame = false;
		
		while (startGame === false) {
			const response = await theReapingMsg.awaitMessageComponent({ 
				filter, 
				componentType: ComponentType.Button, 
				time: 300000 
			}).catch(() => false);
		
			if (!response) {
				return theReapingMsg.delete().catch();
			}

			if (response.customId === 'delete') {
				await response.deferUpdate();
				return theReapingMsg.delete().catch();
			} else if (response.customId === 'randomize') {
				await response.deferUpdate();
				
				tributeManager.randomizeTributeData();
				const randomizedCanvas = await canvasManager.populateCanvas(tributeManager.getAllTributes());
		
				await response.editReply({ 
					embeds: [theReapingEmbed], 
					files: [{ attachment: randomizedCanvas.toBuffer(), name: 'tributesPage.png' }] 
				});
				
				theReapingMsg = await response.fetchReply();
			} else if (response.customId === 'proceed') {
				await response.deferUpdate();
				startGame = true;
			}
		}

		let bloodBath = true;
		let sun = true;
		let turn = 0;
		let announcementCount = 1;

		do {
			if (!bloodBath && sun) turn++;

			const remainingTributes = tributeManager.tributesLeftAlive();
			const currentEvent = bloodBath ? bloodbath : sun ? day : night;

			const deaths = [];
			const results = [];
			const embedResultsText = [];
			const avatars = [];

			eventManager.eventTrigger(currentEvent, remainingTributes, avatars, deaths, results, embedResultsText, tributeManager);
			
			const updatedRemainingTributes = tributeManager.tributesLeftAlive();
			const eventText = `${bloodBath ? 'Bloodbath' : sun ? `Day ${turn}` : `Night ${turn}`}`;
			
			for (let i = 0; i < results.length; i++) {
				const eventImage = await canvasManager.generateEventImage(eventText, results[i], avatars[i]);
			
				const hungerGamesEmbed = new EmbedBuilder()
					.setTitle(`The Hunger Games - ${eventText}`)
					.setDescription(embedResultsText[i])
					.setImage('attachment://currentEvent.png')
					.setFooter({ text: `${updatedRemainingTributes.length} Tributes Remaining...` })
					.setColor('#5d5050');
			
				await interaction.followUp({ 
					embeds: [hungerGamesEmbed], 
					files: [{ attachment: eventImage.toBuffer(), name: 'currentEvent.png' }] 
				});
				await client.utils.sleep(5000);
			}

			if (deaths.length) {
				const deathMessage = `${deaths.length} cannon shot${deaths.length === 1 ? '' : 's'} can be heard in the distance.`;
				const deathList = deaths.map(trib => `<@${trib.id}>`).join('\n');
				const deathImage = await canvasManager.generateFallenTributes(deaths, announcementCount, deathMessage);

				const deadTributesEmbed = new EmbedBuilder()
					.setTitle(`The Hunger Games - Fallen Tributes`)
					.setImage('attachment://deadTributes.png')
					.setDescription(`\n${deathMessage}\n\n${deathList}`)
					.setFooter({ text: `You have 5 minutes to click proceed, or the game will continue automatically.` })
					.setColor('#5d5050');
				const deadTributeMessage = await interaction.followUp({ embeds: [deadTributesEmbed], files: [{ attachment: deathImage.toBuffer(), name: 'deadTributes.png' }], components: [inGameButtons] });

				let gameAction = false;
				while (!gameAction) {
					const continueGame = await deadTributeMessage.awaitMessageComponent({ 
						filter, 
						componentType: ComponentType.Button, 	
						time: 300000 
					}).catch(() => false);

					if (!continueGame) {
						gameAction = true;
						break;
					}

					if (continueGame.customId === 'delete') {
						await continueGame.deferUpdate();
						return deadTributeMessage.delete().catch();
					} else if (continueGame.customId === 'proceed') {
						await continueGame.deferUpdate();
						gameAction = true;
					} else if (continueGame.customId === 'status') {
						await continueGame.deferUpdate();
						
						const statusCanvas = await canvasManager.populateCanvas(tributeManager.getAllTributes());
						
						const statusEmbed = new EmbedBuilder()
							.setTitle('Current Game Status')
							.setImage('attachment://gameStatus.png')
							.setColor('#5d5050');
						
						await interaction.followUp({
							embeds: [statusEmbed],
							files: [{ attachment: statusCanvas.toBuffer(), name: 'gameStatus.png' }]
						});
					}
				}

				announcementCount++;
			}

			if (!bloodBath) sun = !sun;

			if (bloodBath) bloodBath = false;
		} while (tributeManager.gameOver() === false);

		const winnerData = tributeManager.getWinners();
		const winnerImage = await canvasManager.generateWinnerImage(winnerData.tributes);

		const winnerEmbed = new EmbedBuilder()
			.setTitle(`The ${winnerData.winnerText} ${winnerData.winner} from District ${winnerData.district}!`)
			.setImage('attachment://winner.png')
			.setColor('#5d5050');
		await interaction.followUp({ embeds: [winnerEmbed], files: [{ attachment: winnerImage.toBuffer(), name: 'winner.png' }] });
	}
};