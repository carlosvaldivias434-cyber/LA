const { EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle, StringSelectMenuBuilder } = require('discord.js');
const db = require('../../database/db');

/**
 * !ticket / !claim / !close / !escalate
 * Prefix ticketing command suite
 */
module.exports = {
  name: 'ticket',
  description: 'Manage support tickets, claim tickets, and trigger escalations',
  aliases: ['t', 'claim', 'close', 'escalate', 'transcript'],
  usage: '!ticket <panel | claim | close | escalate | status>',

  async execute(message, args, commandTrigger = 'ticket') {
    const trigger = commandTrigger.toLowerCase();

    if (trigger === 'close') {
      const closeEmbed = new EmbedBuilder()
        .setTitle('🔒 Ticket Closing in 5 Seconds')
        .setDescription('This ticket has been marked as resolved and closed. Generating secure HTML transcript...')
        .setColor(0xED4245);

      return message.channel.send({ embeds: [closeEmbed] });
    }

    if (trigger === 'claim') {
      const claimEmbed = new EmbedBuilder()
        .setTitle('✅ Ticket Claimed by Staff Member')
        .setDescription(`This ticket has been claimed by <@${message.author.id}>.\nThe AI Assistant Autopilot is now paused. A human staff member is actively assisting.`)
        .setColor(0x57F287);

      return message.channel.send({ embeds: [claimEmbed] });
    }

    if (trigger === 'escalate') {
      const escalateEmbed = new EmbedBuilder()
        .setTitle('🚨 Ticket Escalated to Directive & High Rank')
        .setDescription(`**Priority Escalate Triggered by <@${message.author.id}>.**\n\n• **Reason:** Requires Executive Management review / Internal Affairs\n• **Status:** Directive Team alerted\n• **Autopilot:** Paused`)
        .setColor(0xED4245);

      return message.channel.send({ embeds: [escalateEmbed] });
    }

    // Default to displaying ticket panel with categories
    const panelEmbed = new EmbedBuilder()
      .setTitle('🌴 Los Angeles Roleplay — Support & Assistance')
      .setDescription(
        'Welcome to the official Los Angeles Roleplay Support Center.\n' +
        'Please select the appropriate category from the menu below to open a ticket.\n\n' +
        '• **⚙️ General:** Server questions, rules, assistance, bot issues\n' +
        '• **🛡️ High Rank:** Staff issues, executive reports, appeals\n' +
        '• **👮 Department:** LAPD, LASD, CHP, LAFD inquiries and transfer requests\n\n' +
        '*Our AI Support Assistant is available immediately inside your ticket to assist you!*'
      )
      .setColor(0x5865F2)
      .setFooter({ text: 'Los Angeles Roleplay Staff Team' });

    const menu = new ActionRowBuilder().addComponents(
      new StringSelectMenuBuilder()
        .setCustomId('ticket_category_select')
        .setPlaceholder('Choose your category')
        .addOptions([
          { label: 'General', value: 'general', description: 'General server support & questions', emoji: '⚙️' },
          { label: 'High Rank', value: 'high_rank', description: 'High rank & executive matters', emoji: '🛡️' },
          { label: 'Department', value: 'department', description: 'Law enforcement & department inquiries', emoji: '👮' }
        ])
    );

    return message.channel.send({ embeds: [panelEmbed], components: [menu] });
  }
};
