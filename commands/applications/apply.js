const { EmbedBuilder, ActionRowBuilder, StringSelectMenuBuilder } = require('discord.js');

/**
 * !apply / !cancel / !review
 * Staff application prefix commands
 */
module.exports = {
  name: 'apply',
  description: 'Initiate or cancel a staff application with Sapling AI screening',
  aliases: ['cancel', 'review-app', 'applications'],
  usage: '!apply | !cancel | !review <application_id>',

  async execute(message, args, commandTrigger = 'apply') {
    const trigger = commandTrigger.toLowerCase();

    if (trigger === 'cancel') {
      return message.channel.send({
        content: 'Your application has been cancelled.'
      });
    }

    const appEmbed = new EmbedBuilder()
      .setTitle('🛡️ Los Angeles Roleplay — Staff Applications')
      .setDescription(
        'Interested in joining the Los Angeles Roleplay staff team?\n\n' +
        '**Requirements:**\n' +
        '• Must be at least 13 years of age\n' +
        '• Must have a clean moderation record for the past 30 days\n' +
        '• Must write all responses in your own original words\n' +
        '• Submissions are screened with Sapling AI detection (never auto-rejected without human review)\n\n' +
        'Select **Staff Application** from the dropdown below to begin.'
      )
      .setColor(0x5865F2)
      .setFooter({ text: 'Los Angeles Roleplay Staff Team' });

    const menu = new ActionRowBuilder().addComponents(
      new StringSelectMenuBuilder()
        .setCustomId('app_type_select')
        .setPlaceholder('Choose an application type...')
        .addOptions([
          { label: 'Staff Application', value: 'staff_app', description: 'Apply for staff', emoji: '🛡️' }
        ])
    );

    return message.channel.send({ embeds: [appEmbed], components: [menu] });
  }
};
