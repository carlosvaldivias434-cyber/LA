const { EmbedBuilder } = require('discord.js');

/**
 * !help Command - Prefix Command Index
 */
module.exports = {
  name: 'help',
  description: 'Displays all available prefix commands (! prefix)',
  aliases: ['commands', 'cmds'],
  usage: '!help [category]',

  async execute(message, args) {
    const embed = new EmbedBuilder()
      .setTitle('🌴 LOS ANGELES ROLEPLAY — COMMAND DIRECTORY (!)')
      .setDescription(
        'Welcome! All commands below use the standard `!` prefix.\n' +
        'Our bot is also powered by the **Groq AI Support Assistant** and **Tripwire Watchdog**.'
      )
      .setColor(0x5865F2)
      .addFields(
        {
          name: '🚨 Security & Tripwire',
          value: '`!tripwire` — Open Tripwire Watchdog Emergency & Security Dashboard\n`!tripwire lockdown` — Engage high-security server lockdown\n`!watchdog` — View anti-abuse monitors & SHA-256 evidence vault',
          inline: false
        },
        {
          name: '🤖 AI & Knowledge Base',
          value: '`!knowledge list` — View all indexed staff rules and handbook articles\n`!knowledge search <term>` — Search policies (e.g. reinstatement)\n`!knowledge test <query>` — Test Groq AI answer generation',
          inline: false
        },
        {
          name: '🎵 Music Player System',
          value: '`!play <song>` — Play audio in current voice channel\n`!pause` / `!resume` — Toggle playback\n`!skip` — Skip to next song in queue\n`!stop` — Stop audio and clear queue\n`!queue` — View active voice tracklist\n`!loop` / `!shuffle` — Toggle loop or shuffle tracks',
          inline: false
        },
        {
          name: '🎫 Tickets & Support',
          value: '`!ticket` — Open the official ticket category selector (General, High Rank, Department)\n`!claim` — Claim current ticket as staff\n`!escalate` — Escalate ticket to Executive Management\n`!close` — Close ticket & generate HTML transcript',
          inline: false
        },
        {
          name: '📝 Staff Applications',
          value: '`!apply` — Open staff application menu with Sapling AI screening\n`!cancel` — Cancel active application (`Your application has been cancelled.`)',
          inline: false
        }
      )
      .setFooter({ text: 'Los Angeles Roleplay • All commands run with ! prefix' })
      .setTimestamp();

    return message.channel.send({ embeds: [embed] });
  }
};
