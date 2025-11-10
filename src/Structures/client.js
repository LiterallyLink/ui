const { Client, Collection, GatewayIntentBits, Partials } = require('discord.js');
const { Player } = require('discord-player');
const { SpotifyExtractor } = require('@discord-player/extractor');
require('dotenv').config();

const { token } = process.env;

const Util = require('./Utilities/Util');
const Canvas = require('./Utilities/Canvas.js');
const MusicService = require('../Structures/Utilities/Music/MusicService.js');

module.exports = class uiClient extends Client {
	constructor() {
		super({
			intents: [
				GatewayIntentBits.Guilds,
				GatewayIntentBits.GuildMessages,
				GatewayIntentBits.DirectMessages,
				GatewayIntentBits.DirectMessageTyping,
				GatewayIntentBits.MessageContent,
				GatewayIntentBits.GuildMembers,
				GatewayIntentBits.GuildPresences,
				GatewayIntentBits.GuildVoiceStates
			],
            partials: [
                Partials.Channel,
                Partials.Message,
                Partials.Reaction,
                Partials.GuildMember,
                Partials.User,
                Partials.GuildMessageReactions
            ],
			allowedMentions: {
				parse: ['users']
			}
		});

		this.slashCommands = new Collection();
		this.events = new Collection();
		this.utils = new Util(this);
		this.canvas = new Canvas(this);
		this.player = new Player(this);
		this.musicService = new MusicService(this);
		
		this.player.extractors.register(SpotifyExtractor, {});
	}

	async start() {
		try {
			await this.utils.loadSlashCommands();
			this.utils.loadEvents();
			await super.login(token);
		} catch (err) {
            console.error('[Client] :: Initialization failed', err);
            process.exit(1);
		}
	}
};