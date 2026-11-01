const {
  joinVoiceChannel,
  createAudioPlayer,
  createAudioResource,
  AudioPlayerStatus,
  VoiceConnectionStatus,
  entersState
} = require('@discordjs/voice');
const play = require('play-dl');

class MusicQueue {
  constructor(guildId, voiceChannelId, textChannel, client) {
    this.guildId = guildId;
    this.voiceChannelId = voiceChannelId;
    this.textChannel = textChannel;
    this.client = client;
    this.connection = null;
    this.player = createAudioPlayer();
    this.queue = [];
    this.history = [];
    this.currentTrack = null;
    this.volume = parseInt(process.env.MUSIC_DEFAULT_VOLUME) || 70;
    this.loopMode = 'off'; // 'off', 'track', 'queue'
    this.autoplay = false;
    this.progressInterval = null;
    this.nowPlayingMessage = null;
    this.playbackStartTime = 0;
    this.isPaused = false;

    this.player.on(AudioPlayerStatus.Idle, () => this.handleSongEnd());
    this.player.on('error', (err) => {
      console.error('[MusicPlayer Error]', err);
      this.handleSongEnd();
    });
  }

  async connect() {
    this.connection = joinVoiceChannel({
      channelId: this.voiceChannelId,
      guildId: this.guildId,
      adapterCreator: this.textChannel.guild.voiceAdapterCreator
    });
    await entersState(this.connection, VoiceConnectionStatus.Ready, 20000);
    this.connection.subscribe(this.player);
  }

  async play() {
    if (this.queue.length === 0) {
      if (this.progressInterval) clearInterval(this.progressInterval);
      this.currentTrack = null;
      return;
    }

    this.currentTrack = this.queue[0];
    try {
      const stream = await play.stream(this.currentTrack.url);
      const resource = createAudioResource(stream.stream, {
        inputType: stream.type,
        inlineVolume: true
      });
      resource.volume.setVolume(this.volume / 100);
      this.player.play(resource);
      this.playbackStartTime = Date.now();
      this.isPaused = false;

      await this.sendNowPlayingInterface();
    } catch (e) {
      console.error('[Stream Error]', e);
      this.queue.shift();
      this.play();
    }
  }

  handleSongEnd() {
    if (this.progressInterval) clearInterval(this.progressInterval);
    if (!this.currentTrack) return;

    this.history.push(this.currentTrack);
    if (this.loopMode === 'track') {
      // Loop same track
    } else if (this.loopMode === 'queue') {
      const finished = this.queue.shift();
      this.queue.push(finished);
    } else {
      this.queue.shift();
    }

    this.play();
  }

  renderProgressBar(currentSec, totalSec) {
    const size = 15;
    const progress = Math.min(Math.max(currentSec / (totalSec || 1), 0), 1);
    const progressIndex = Math.round(size * progress);
    const bar = '━'.repeat(progressIndex) + '●' + '━'.repeat(size - progressIndex);
    const formatTime = (s) => {
      const mins = Math.floor(s / 60);
      const secs = Math.floor(s % 60);
      return `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
    };
    return `${formatTime(currentSec)} ${bar} ${formatTime(totalSec)}`;
  }

  async sendNowPlayingInterface() {
    const { createBrandedEmbed } = require('../utils/embedBuilder');
    const { ActionRowBuilder, ButtonBuilder, ButtonStyle } = require('discord.js');

    const totalSeconds = this.currentTrack.durationSec || 200;
    const bar = this.renderProgressBar(0, totalSeconds);

    const embeds = createBrandedEmbed({
      title: 'LOS ANGELES ROLEPLAY — NOW PLAYING',
      description: `[${this.currentTrack.title}](${this.currentTrack.url})\n\n\`${bar}\``,
      fields: [
        { name: '👤 Artist / Author', value: this.currentTrack.author || 'Unknown', inline: true },
        { name: '⏳ Duration', value: this.currentTrack.durationText || 'Unknown', inline: true },
        { name: '🎧 Requested By', value: `<@${this.currentTrack.requestedBy}>`, inline: true },
        { name: '🔊 Volume', value: `${this.volume}%`, inline: true },
        { name: '🔁 Loop', value: this.loopMode.toUpperCase(), inline: true },
        { name: '📑 Queue Size', value: `${this.queue.length} Songs`, inline: true }
      ],
      topBanner: process.env.MUSIC_TOP_BANNER,
      bottomBanner: process.env.MUSIC_BOTTOM_BANNER
    });

    // 2 Action Rows to respect Discord's max 5 buttons per row
    const row1 = new ActionRowBuilder().addComponents(
      new ButtonBuilder().setCustomId('music_prev').setEmoji('⏮️').setStyle(ButtonStyle.Secondary),
      new ButtonBuilder().setCustomId('music_pause').setEmoji('⏯️').setStyle(ButtonStyle.Primary),
      new ButtonBuilder().setCustomId('music_skip').setEmoji('⏭️').setStyle(ButtonStyle.Secondary)
    );

    const row2 = new ActionRowBuilder().addComponents(
      new ButtonBuilder().setCustomId('music_stop').setEmoji('⏹️').setStyle(ButtonStyle.Danger),
      new ButtonBuilder().setCustomId('music_loop').setEmoji('🔁').setStyle(ButtonStyle.Secondary),
      new ButtonBuilder().setCustomId('music_shuffle').setEmoji('🔀').setStyle(ButtonStyle.Secondary)
    );

    this.nowPlayingMessage = await this.textChannel.send({ embeds, components: [row1, row2] });

    if (this.progressInterval) clearInterval(this.progressInterval);

    let lastRenderedProgress = 0;
    this.progressInterval = setInterval(async () => {
      if (this.isPaused || !this.currentTrack || !this.nowPlayingMessage) return;
      const elapsedSec = (Date.now() - this.playbackStartTime) / 1000;
      if (elapsedSec >= totalSeconds) return;

      if (Math.floor(elapsedSec / 10) !== lastRenderedProgress) {
        lastRenderedProgress = Math.floor(elapsedSec / 10);
        const updatedBar = this.renderProgressBar(elapsedSec, totalSeconds);
        const updatedEmbeds = createBrandedEmbed({
          title: 'LOS ANGELES ROLEPLAY — NOW PLAYING',
          description: `[${this.currentTrack.title}](${this.currentTrack.url})\n\n\`${updatedBar}\``,
          fields: [
            { name: '👤 Artist / Author', value: this.currentTrack.author || 'Unknown', inline: true },
            { name: '⏳ Duration', value: this.currentTrack.durationText || 'Unknown', inline: true },
            { name: '🎧 Requested By', value: `<@${this.currentTrack.requestedBy}>`, inline: true },
            { name: '🔊 Volume', value: `${this.volume}%`, inline: true },
            { name: '🔁 Loop', value: this.loopMode.toUpperCase(), inline: true },
            { name: '📑 Queue Size', value: `${this.queue.length} Songs`, inline: true }
          ],
          topBanner: process.env.MUSIC_TOP_BANNER,
          bottomBanner: process.env.MUSIC_BOTTOM_BANNER
        });
        await this.nowPlayingMessage.edit({ embeds: updatedEmbeds }).catch(() => {});
      }
    }, 5000);
  }

  destroy() {
    if (this.progressInterval) clearInterval(this.progressInterval);
    this.queue = [];
    this.player.stop();
    if (this.connection) this.connection.destroy();
  }
}

const queues = new Map();

module.exports = {
  getQueue: (guildId) => queues.get(guildId),
  createQueue: (guildId, voiceChannelId, textChannel, client) => {
    const queue = new MusicQueue(guildId, voiceChannelId, textChannel, client);
    queues.set(guildId, queue);
    return queue;
  },
  deleteQueue: (guildId) => {
    const q = queues.get(guildId);
    if (q) q.destroy();
    queues.delete(guildId);
  }
};
