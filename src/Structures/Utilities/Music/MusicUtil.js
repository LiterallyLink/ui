const { PermissionFlagsBits, EmbedBuilder } = require('discord.js');

class MusicUtil {
    static async validateVoiceChannel(interaction) {
        const voiceChannel = interaction.member.voice.channel;
        
        if (!voiceChannel) {
            return {
                valid: false,
                message: 'You need to be in a voice channel to use music commands!'
            };
        }
        
        return { valid: true, voiceChannel };
    }
    
    static async validateBotPermissions(client, voiceChannel) {
        const permissions = voiceChannel.permissionsFor(client.user);
        
        if (!permissions.has([PermissionFlagsBits.Connect, PermissionFlagsBits.Speak])) {
            return {
                valid: false,
                message: 'I need permission to connect and speak in your voice channel!'
            };
        }
        
        return { valid: true };
    }
    
    static async validateQueue(client, guildId, requirePlaying = true) {
        const queue = client.player.nodes.get(guildId);
        
        if (!queue) {
            return {
                valid: false,
                message: 'No music queue exists!'
            };
        }
        
        if (requirePlaying && !queue.node.isPlaying()) {
            return {
                valid: false,
                message: 'No music is currently playing!'
            };
        }
        
        return { valid: true, queue };
    }
    
    static async validateSameVoiceChannel(interaction, queue) {
        const userVoiceChannel = interaction.member.voice.channel;
        const botVoiceChannel = queue.connection?.joinConfig?.channelId;
        
        if (userVoiceChannel && botVoiceChannel && userVoiceChannel.id !== botVoiceChannel) {
            return {
                valid: false,
                message: 'You need to be in the same voice channel as me to use this command!'
            };
        }
        
        return { valid: true };
    }
    
    static formatTime(seconds) {
        const hours = Math.floor(seconds / 3600);
        const minutes = Math.floor((seconds % 3600) / 60);
        const secs = seconds % 60;
        
        if (hours > 0) {
            return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
        }
        return `${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    }
    
    static createProgressBar(current, max, length = 20) {
        const percentage = Math.min(current / max, 1);
        const filled = Math.round(percentage * length);
        const empty = length - filled;
        return '▰'.repeat(filled) + '▱'.repeat(empty);
    }
    
    static async validateBasicMusicCommand(client, interaction) {
        const voiceCheck = await this.validateVoiceChannel(interaction);
        if (!voiceCheck.valid) {
            return { valid: false, message: voiceCheck.message };
        }
        
        const permCheck = await this.validateBotPermissions(client, voiceCheck.voiceChannel);
        if (!permCheck.valid) {
            return { valid: false, message: permCheck.message };
        }
        
        return { valid: true, voiceChannel: voiceCheck.voiceChannel };
    }
    
    static async validateMusicCommandWithQueue(client, interaction, requirePlaying = true) {
        const queueCheck = await this.validateQueue(client, interaction.guildId, requirePlaying);
        if (!queueCheck.valid) {
            return { valid: false, message: queueCheck.message };
        }
        
        const sameChannelCheck = await this.validateSameVoiceChannel(interaction, queueCheck.queue);
        if (!sameChannelCheck.valid) {
            return { valid: false, message: sameChannelCheck.message };
        }
        
        return { valid: true, queue: queueCheck.queue };
    }
    
    static calculateEstimatedWait(queue) {
        if (!queue.node.isPlaying()) {
            return 'Now';
        }
        
        const currentTrackTotal = queue.currentTrack?.durationMS || 0;
        const elapsedTime = queue.node.streamTime || 0;
        const currentTrackRemaining = currentTrackTotal - elapsedTime;
        
        const queueDuration = queue.tracks.data
            .slice(0, queue.tracks.data.length - 1)
            .reduce((total, track) => total + track.durationMS, 0);
        
        const totalWaitTime = currentTrackRemaining + queueDuration;
        const totalSeconds = Math.floor(totalWaitTime / 1000);
        
        return this.formatTime(totalSeconds);
    }
    
    static createPlayingEmbed(track, wasPlaying, estimatedWait, queuePosition, user) {
        return new EmbedBuilder()
            .setTitle(wasPlaying ? '🎵 ; Added to Queue' : '🎶 ; Now Playing')
            .addFields(
                { name: 'Track', value: `**${track.title}**`, inline: true },
                { name: 'By', value: `${track.author}`, inline: true },
                { name: 'Duration', value: `${track.duration}`, inline: true },
                { name: 'Position In Queue', value: `${queuePosition}`, inline: true },
                { name: 'Source', value: `[View Original](${track.url})`, inline: true },
                { name: 'Estimated Wait', value: estimatedWait, inline: true }
            )
            .setThumbnail(track.thumbnail)
            .setColor('#5b5c6e')
            .setTimestamp()
            .setFooter({
                text: `Requested by ${user.username}`,
                iconURL: user.displayAvatarURL()
            });
    }
    
    static createPlaylistEmbed(playlist, trackCount, duration, wasPlaying, user) {
        return new EmbedBuilder()
            .setTitle(wasPlaying ? '🎵 ; Added Playlist' : '🎶 ; Now Playing')
            .addFields(
                { name: 'Playlist', value: `**${playlist.title}**`, inline: true },
                { name: 'By', value: `${playlist.author?.name || 'Unknown'}`, inline: true },
                { name: 'Playlist Length', value: `${duration}`, inline: true },
                { name: 'Tracks', value: `${trackCount}`, inline: true },
                { name: 'Source', value: `[View Original](${playlist.url})`, inline: true },
                { name: 'Status', value: wasPlaying ? 'Added to Queue' : 'Now Playing', inline: true }
            )
            .setThumbnail(playlist.thumbnail)
            .setColor('#5b5c6e')
            .setTimestamp()
            .setFooter({
                text: `Requested by ${user.username}`,
                iconURL: user.displayAvatarURL()
            });
    }
    
    static createSearchResultsEmbed(tracks) {
        const embed = new EmbedBuilder()
            .setTitle('🔍 Search Results')
            .setDescription('Choose a track to play:')
            .setColor('#5b5c6e')
            .setTimestamp();

        const trackList = tracks.map((track, index) => {
            const title = track.title.length > 45 ? track.title.slice(0, 45) + '...' : track.title;
            const author = track.author.length > 20 ? track.author.slice(0, 20) + '...' : track.author;
            return `${index + 1}. **[${title}](${track.url})** by ${author}`;
        }).join('\n');
        
        embed.addFields({
            name: 'Available Tracks',
            value: trackList,
            inline: false
        });
        
        return embed;
    }
}

module.exports = MusicUtil;