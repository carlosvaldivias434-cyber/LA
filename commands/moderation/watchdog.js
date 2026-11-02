const { EmbedBuilder } = require('discord.js');

/**
 * !watchdog / !incidents / !evidence
 * Moderation watchdog telemetry
 */
module.exports = {
  name: 'watchdog',
  description: 'View Watchdog anti-abuse telemetry and audit logs',
  aliases: ['incidents', 'evidence', 'threats'],
  usage: '!watchdog [status | incidents | evidence <id>]',

  async execute(message, args) {
    const embed = new EmbedBuilder()
      .setTitle('🛡️ Watchdog Internal Affairs Telemetry')
      .setDescription(
        '**Zero Automated Punishments Enforced**\n' +
        'Watchdog operates under strict Human-in-the-Loop oversight. Suspicious activity generates alerts and seals cryptographic evidence for executive adjudication.'
      )
      .addFields(
        { name: 'Active Monitors', value: '• Mass Bans (< 3/min limit)\n• Mass Kicks (< 5/min limit)\n• Role Perm Swaps\n• Webhook Token Integrity', inline: false },
        { name: 'Evidence Vault', value: 'SHA-256 Chained Hash Log: `ENABLED`', inline: true },
        { name: 'Emergency Command', value: 'Run `!tripwire` for incident triage', inline: true }
      )
      .setColor(0x5865F2);

    return message.channel.send({ embeds: [embed] });
  }
};
