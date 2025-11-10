const { SlashCommandBuilder, StringSelectMenuBuilder, ActionRowBuilder, ComponentType } = require('discord.js');
const MusicUtil = require('../../Structures/Utilities/Music/MusicUtil');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('play')
        .setDescription('Play a song in voice channel')
        .addStringOption(option =>
            option.setName('query')
                .setDescription('Song name or URL to play')
                .setRequired(true)
        ),
    async run({ client, interaction }) {
        const validation = await MusicUtil.validateBasicMusicCommand(client, interaction);
        if (!validation.valid) {
            return interaction.followUp({ 
                content: validation.message,
                ephemeral: true
            });
        }

        const voiceChannel = validation.voiceChannel;
        const query = interaction.options.getString('query');

        let queue = client.player.nodes.get(interaction.guildId);
        
        if (!queue) {
            queue = client.player.nodes.create(interaction.guild, {
                metadata: {
                    voiceChannel: voiceChannel,
                    textChannel: interaction.channel
                }
            });
        }

        try {
            if (!queue.connection) {
                await queue.connect(voiceChannel);
            }
        } catch (error) {
            return interaction.followUp({ 
                content: 'Failed to connect to voice channel!',
                ephemeral: true
            });
        }

        try {
            const searchResult = await client.player.search(query, {
                requestedBy: interaction.user
            });

            if (!searchResult || !searchResult.tracks.length) {
                return interaction.followUp({ 
                    content: `No results found for: ${query}`,
                    ephemeral: true
                });
            }

            const isDirectUrl = this.isUrl(query);
            
            // Check if it's a playlist
            if (searchResult.playlist) {
                return this.playPlaylist(queue, searchResult, interaction);
            }
            
            if (isDirectUrl || searchResult.tracks.length === 1) {
                return this.playTrack(queue, searchResult.tracks[0], interaction);
            }

            return this.showSearchResults(queue, searchResult.tracks.slice(0, 5), interaction);

        } catch (error) {
            console.error('Play command error:', error);
            return interaction.followUp({ 
                content: 'An error occurred while searching for the track!',
                ephemeral: true
            });
        }
    },

    async playPlaylist(queue, searchResult, interaction) {
        const playlist = searchResult.playlist;
        const tracks = searchResult.tracks;
        const wasPlaying = queue.node.isPlaying();
        
        queue.addTrack(tracks);
        
        if (!wasPlaying) {
            await queue.node.play();
        }

        const totalDurationMs = tracks.reduce((total, track) => total + track.durationMS, 0);
        const totalDurationFormatted = this.formatPlaylistDuration(totalDurationMs);

        const embed = MusicUtil.createPlaylistEmbed(
            playlist,
            tracks.length,
            totalDurationFormatted,
            wasPlaying,
            interaction.user
        );

        await interaction.followUp({ embeds: [embed] });
    },

    async showSearchResults(queue, tracks, interaction) {
        const embed = MusicUtil.createSearchResultsEmbed(tracks);
        
        const selectMenu = new StringSelectMenuBuilder()
            .setCustomId('track_selection')
            .setPlaceholder('Choose a track to play...')
            .addOptions(tracks.map((track, index) => ({
                label: `${track.title}`.slice(0, 100),
                description: `${track.author} - ${track.duration}`.slice(0, 100),
                value: index.toString()
            })));

        const row = new ActionRowBuilder().addComponents(selectMenu);

        const response = await interaction.followUp({
            embeds: [embed],
            components: [row]
        });

        const collector = response.createMessageComponentCollector({
            componentType: ComponentType.StringSelect,
            filter: i => i.user.id === interaction.user.id,
            time: 60000
        });

        collector.on('collect', async selectInteraction => {
            const selectedIndex = parseInt(selectInteraction.values[0]);
            const selectedTrack = tracks[selectedIndex];

            await selectInteraction.deferUpdate();
            await this.playTrack(queue, selectedTrack, interaction, selectInteraction);
            collector.stop();
        });

        collector.on('end', (collected, reason) => {
            if (reason === 'time') {
                const disabledRow = new ActionRowBuilder()
                    .addComponents(
                        StringSelectMenuBuilder.from(selectMenu).setDisabled(true)
                    );
                
                interaction.editReply({ 
                    components: [disabledRow] 
                }).catch(console.error);
            }
        });
    },

    async playTrack(queue, track, originalInteraction, selectInteraction = null) {
        const wasPlaying = queue.node.isPlaying();
        
        queue.addTrack(track);
        if (!wasPlaying) {
            await queue.node.play();
        }

        const estimatedWait = MusicUtil.calculateEstimatedWait(queue);
        const embed = MusicUtil.createPlayingEmbed(
            track, 
            wasPlaying, 
            estimatedWait, 
            queue.tracks.data.length, 
            originalInteraction.user
        );

        if (selectInteraction) {
            await originalInteraction.editReply({ 
                embeds: [embed], 
                components: [] 
            });
        } else {
            await originalInteraction.followUp({ embeds: [embed] });
        }
    },

    formatPlaylistDuration(durationMs) {
        const totalSeconds = Math.floor(durationMs / 1000);
        const hours = Math.floor(totalSeconds / 3600);
        const minutes = Math.floor((totalSeconds % 3600) / 60);
        
        if (hours > 0) {
            return `${hours}h ${minutes}m`;
        }
        return `${minutes}m`;
    },

    isUrl(string) {
        try {
            new URL(string);
            return true;
        } catch {
            return false;
        }
    }
};