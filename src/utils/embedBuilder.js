const { EmbedBuilder } = require('discord.js');
require('dotenv').config();

function createBrandedEmbed({
  title,
  description,
  fields = [],
  color = process.env.BOT_COLOR || '#37373E',
  topBanner = process.env.GLOBAL_TOP_BANNER,
  bottomBanner = process.env.GLOBAL_BOTTOM_BANNER,
  footer,
  footerText = process.env.BOT_FOOTER || 'Los Angeles Roleplay | Management System | Coded by Carlos473',
  timestamp = true
}) {
  const actualFooter = footer || footerText;
  const topEmbed = topBanner ? new EmbedBuilder().setColor(color).setImage(topBanner) : null;

  const mainEmbed = new EmbedBuilder()
    .setColor(color)
    .setFooter({ text: actualFooter });

  if (title) mainEmbed.setTitle(title);
  if (description) mainEmbed.setDescription(description);
  if (fields && fields.length > 0) mainEmbed.addFields(fields);
  if (timestamp) mainEmbed.setTimestamp();

  const embeds = [];
  if (topEmbed) embeds.push(topEmbed);
  embeds.push(mainEmbed);

  if (bottomBanner) {
    const bottomEmbed = new EmbedBuilder().setColor(color).setImage(bottomBanner);
    embeds.push(bottomEmbed);
  }

  return embeds;
}

module.exports = { createBrandedEmbed };
