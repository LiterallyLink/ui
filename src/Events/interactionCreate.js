const Event = require('../Structures/Event.js');
const { MessageFlags } = require('discord.js');

module.exports = class extends Event {

	async run(interaction) {
		if (interaction.isChatInputCommand()) {
			await interaction.deferReply({ 
				flags: interaction.ephemeral ? MessageFlags.Ephemeral : 0 
			}).catch();

			const cmd = this.client.slashCommands.get(interaction.commandName);
			if (!cmd) { return interaction.followUp({ content: 'An error has occured ' }); }

			const args = [];

			for (const option of interaction.options.data) {
				if (option.type === 'SUB_COMMAND') {
					if (option.name) args.push(option.name);
					option.options?.forEach((subCmd) => {
						if (subCmd.value) args.push(subCmd.value);
					});
				} else if (option.value) { args.push(option.value); }
			}

			interaction.member = interaction.guild.members.cache.get(interaction.user.id);

			return cmd.run({ client: this.client, interaction, arguments: args });
		}

		if (interaction.isContextMenuCommand()) {
			await interaction.deferReply({ 
				flags: interaction.ephemeral ? MessageFlags.Ephemeral : 0 
			});
			const command = this.client.slashCommands.get(interaction.commandName);
			if (command) command.run(this.client, interaction);
		}

		if (interaction.isButton()) {
			return;
		}
	}

};