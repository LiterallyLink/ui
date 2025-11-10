const Event = require('../Event.js');

const path = require('path');
const { promisify } = require('util');
const glob = promisify(require('glob'));

require('dotenv').config();
const { token, clientId, guildId } = process.env;

const { REST } = require('@discordjs/rest');
const { Routes } = require('discord-api-types/v9');

module.exports = class Util {

	constructor(client) {
		this.client = client;
	}

	get directory() {
		return `${path.dirname(require.main.filename)}${path.sep}`;
	}

	async sleep(ms) {
		await new Promise(resolve => setTimeout(resolve, ms));
	};

	shuffle(array) {
		let currentIndex = array.length, randomIndex;

		while (currentIndex !== 0) {
			randomIndex = Math.floor(Math.random() * currentIndex);
			currentIndex--;
			[array[currentIndex], array[randomIndex]] = [array[randomIndex], array[currentIndex]];
		}

		return array;
	};

	formatMilliseconds(ms) {
		const secondsInADay = 60 * 60 * 1000 * 24;
		const secondsInAHour = 60 * 60 * 1000;
	  
		const days = Math.floor(ms / secondsInADay);
		const hours = Math.floor((ms % secondsInADay) / secondsInAHour);
		const minutes = Math.floor(((ms % secondsInADay) % secondsInAHour) / (60 * 1000));
		const seconds = Math.floor((ms % (1000 * 60)) / 1000);

		const mapped = {
		  s: 'secs',
		  m: 'mins',
		  h: 'hrs',
		  d: 'days'
		};

		return [
		  { type: 'd', value: days },
		  { type: 'h', value: hours },
		  { type: 'm', value: minutes },
		  { type: 's', value: seconds }
		].filter(x => x.value > 0).map(x => `${x.value} ${mapped[x.type]}`).join(' ');
	};

	async loadSlashCommands() {
		const slashCommandArray = [];

		const commands = await glob(`${this.directory.replace(/\\/g, '/')}slashcommands/**/*.js`);

		for (const commandFile of commands) {
			const command = require(commandFile);
			slashCommandArray.push(command.data.toJSON());

			this.client.slashCommands.set(command.data.name, command);
		}

		const rest = new REST({ version: '9' }).setToken(token);

		await this.registerSlashCommands(rest, slashCommandArray);
	};

	async registerSlashCommands(rest, slashCommandArray) {
		try {
			if (guildId) {
				await rest.put(Routes.applicationGuildCommands(clientId, guildId), { body: slashCommandArray });
			} else {
				await rest.put(Routes.applicationCommands(clientId), { body: slashCommandArray });
			}
		} catch (error) {
			if (error) return console.error(error);
		}

		return console.log(`Registered ${slashCommandArray.length} Slashcommands.`);
	};

	async clearSlashCommands() {
		const rest = new REST({ version: '9' }).setToken(token);

		rest.get(Routes.applicationCommands(clientId)).then(data => {
			const promises = [];

			for (const command of data) {
				const deleteUrl = `${Routes.applicationCommands(clientId)}/${command.id}`;
				promises.push(rest.delete(deleteUrl));
			}

			return Promise.all(promises);
		});
	};

	async loadEvents() {
		const events = await glob(`${this.directory.replace(/\\/g, '/')}events/*.js`);

		for (const file of events) {
			delete require.cache[file];

			const { name } = path.parse(file);
			const EventFile = require(file);
			const event = new EventFile(this.client, name);

			if (!(event instanceof Event)) throw new TypeError(`Event ${name} doesn't belong in Events`);

			this.client.events.set(event.name, event);
			event.emitter[event.type](name, (...args) => event.run(...args));
		}

		return console.log(`Registered ${events.length} Events.`);
	};
};
