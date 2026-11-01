const {
  ActionRowBuilder,
  ButtonBuilder,
  ButtonStyle,
  StringSelectMenuBuilder,
  ModalBuilder,
  TextInputBuilder,
  TextInputStyle,
  ChannelType,
  PermissionFlagsBits
} = require('discord.js');
const db = require('../../database/db');
const { createBrandedEmbed } = require('../utils/embedBuilder');
const { generateVerificationCode, getRobloxUserByUsername, verifyRobloxProfileCode } = require('../utils/roblox');
const { generateHtmlTranscript } = require('../utils/transcriptGenerator');
const { generateGroqTicketResponse, isHumanHandoffRequested } = require('../utils/groqSupport');
const { checkAnswersForAI } = require('../utils/saplingDetector');
const musicManager = require('../music/musicManager');

// 15 Staff Application Questions
const APPLICATION_QUESTIONS = [
  "What is your ROBLOX username?",
  "What is your ROBLOX User ID?",
  "What is your current age? (Must be 13+)",
  "What timezone are you located in?",
  "Why do you want to join the Los Angeles Roleplay Staff Team?",
  "How long have you been a member of our community?",
  "Do you have previous staff experience in ER:LC / Roblox roleplay communities?",
  "How many hours per week can you actively dedicate to staffing?",
  "How would you handle a player who is RDMing and VDMing repeatedly?",
  "What would you do if a high-ranking staff member is abusing their administrator permissions?",
  "Explain what the 'New Life Rule' (NLR) means to you.",
  "What is the difference between Fail Roleplay and Fear Roleplay?",
  "How do you maintain professionalism when dealing with an aggressive player?",
  "Have you ever received an infraction or ban in our server? If so, why?",
  "Do you agree to follow all staff regulations, maintain activity, and respect the Chain of Command?"
];

const activeApplications = new Map();
const pendingVerifications = new Map();

async function handleInteraction(interaction) {
  // 1. SELECT MENUS
  if (interaction.isStringSelectMenu()) {
    const { customId, values } = interaction;

    // APPLICATION TYPE SELECT (Matches reference screenshot 093827)
    if (customId === 'app_type_select') {
      const type = values[0];
      if (type === 'staff_app') {
        const existing = db.prepare('SELECT id FROM applications WHERE applicant_id = ? AND status = "PENDING"').get(interaction.user.id);
        if (existing) {
          return interaction.reply({ content: '❌ You already have an active pending application.', ephemeral: true });
        }

        await interaction.deferReply({ ephemeral: true });

        try {
          const appChannel = await interaction.guild.channels.create({
            name: `app-${interaction.user.username.toLowerCase()}`,
            type: ChannelType.GuildText,
            parent: process.env.TICKET_CATEGORY_ID || null,
            permissionOverwrites: [
              { id: interaction.guild.id, deny: [PermissionFlagsBits.ViewChannel] },
              { id: interaction.user.id, allow: [PermissionFlagsBits.ViewChannel, PermissionFlagsBits.SendMessages, PermissionFlagsBits.ReadMessageHistory] },
              { id: interaction.client.user.id, allow: [PermissionFlagsBits.ViewChannel, PermissionFlagsBits.SendMessages, PermissionFlagsBits.ManageChannels] }
            ]
          });

          activeApplications.set(appChannel.id, {
            userId: interaction.user.id,
            step: 0,
            answers: [],
            channelId: appChannel.id,
            timer: null
          });

          const cancelRow = new ActionRowBuilder().addComponents(
            new ButtonBuilder().setCustomId('app_cancel').setLabel('Cancel Application').setStyle(ButtonStyle.Danger)
          );

          // Matches reference screenshot 093842
          const welcomeEmbeds = createBrandedEmbed({
            title: 'LOS ANGELES ROLEPLAY — APPLICATIONS',
            description: `Hello <@${interaction.user.id}>!\n\nYou have exactly **30 minutes** from now to finish this application, or your application will be cancelled and this channel will be deleted!\nMake sure to review your answers, use grammar at all times, and **don't delete** any of your answers once sent.\n\n**Good Luck!**\n**Application Closes:** in 30 minutes`,
            topBanner: process.env.APPLICATION_TOP_BANNER,
            bottomBanner: process.env.APPLICATION_BOTTOM_BANNER
          });

          await appChannel.send({ embeds: welcomeEmbeds, components: [cancelRow] });

          const qEmbed = createBrandedEmbed({
            title: `Question 1 of ${APPLICATION_QUESTIONS.length}`,
            description: `**${APPLICATION_QUESTIONS[0]}**\n\n*Write your ROBLOX name and only your ROBLOX name, nothing else with it.*\n\`Q1\``
          });
          await appChannel.send({ embeds: qEmbed });

          return interaction.editReply({ content: `✅ Application opened! Please proceed to <#${appChannel.id}>.` });
        } catch (err) {
          console.error(err);
          return interaction.editReply({ content: '❌ Could not create your application channel. Ensure bot permissions are correct.' });
        }
      }
    }

    // TICKET CATEGORY SELECT (Matches reference screenshot 093659)
    if (customId === 'ticket_category_select') {
      const category = values[0];
      await interaction.deferReply({ ephemeral: true });

      const lastTicket = db.prepare('SELECT MAX(ticket_number) as maxNum FROM tickets').get();
      const ticketNumber = (lastTicket && lastTicket.maxNum ? lastTicket.maxNum : 4600) + 1;

      try {
        const ticketChannel = await interaction.guild.channels.create({
          name: `ticket-${ticketNumber}`,
          type: ChannelType.GuildText,
          parent: process.env.TICKET_CATEGORY_ID || null,
          permissionOverwrites: [
            { id: interaction.guild.id, deny: [PermissionFlagsBits.ViewChannel] },
            { id: interaction.user.id, allow: [PermissionFlagsBits.ViewChannel, PermissionFlagsBits.SendMessages, PermissionFlagsBits.ReadMessageHistory] },
            { id: interaction.client.user.id, allow: [PermissionFlagsBits.ViewChannel, PermissionFlagsBits.SendMessages, PermissionFlagsBits.ManageChannels] },
            { id: process.env.STAFF_ROLE_ID, allow: [PermissionFlagsBits.ViewChannel, PermissionFlagsBits.SendMessages, PermissionFlagsBits.ReadMessageHistory] }
          ]
        });

        db.prepare('INSERT INTO tickets (ticket_number, creator_id, channel_id, category) VALUES (?, ?, ?, ?)').run(
          ticketNumber,
          interaction.user.id,
          ticketChannel.id,
          category
        );

        // Matching screenshot 093732: Claim (green), Close (red), Escalate (red)
        const row = new ActionRowBuilder().addComponents(
          new ButtonBuilder().setCustomId('ticket_claim').setLabel('Claim').setStyle(ButtonStyle.Success).setEmoji('✓'),
          new ButtonBuilder().setCustomId('ticket_close').setLabel('Close').setStyle(ButtonStyle.Danger).setEmoji('✕'),
          new ButtonBuilder().setCustomId('ticket_escalate').setLabel('Escalate').setStyle(ButtonStyle.Danger).setEmoji('📎')
        );

        const ticketEmbeds = createBrandedEmbed({
          title: `Hey there ${interaction.user.username} — Welcome to ${category}.`,
          description: `Please ensure you have thoroughly reviewed our Frequently Asked Questions and that your inquiry is unique so our Support Team can provide quality support as soon as possible. If you have any extra information in regards to your inquiry, you're recommended to add it here.`,
          fields: [
            { name: 'Username', value: `${interaction.user.username} (\`${interaction.user.id}\`)`, inline: true },
            { name: 'Display Name', value: interaction.user.displayName, inline: true },
            { name: 'Category', value: category, inline: true },
            { name: 'Created', value: `${new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}`, inline: true }
          ],
          topBanner: process.env.TICKET_TOP_BANNER,
          bottomBanner: process.env.TICKET_BOTTOM_BANNER
        });

        await ticketChannel.send({ embeds: ticketEmbeds, components: [row] });
        return interaction.editReply({ content: `✅ Ticket opened in <#${ticketChannel.id}>.` });
      } catch (e) {
        console.error(e);
        return interaction.editReply({ content: '❌ Failed to create ticket channel.' });
      }
    }

    // REGULATIONS SELECT (Matches reference screenshot 094006)
    if (customId === 'regulations_select') {
      const selected = values[0];
      if (selected === 'discord_reg') {
        const embeds = createBrandedEmbed({
          title: 'LOS ANGELES ROLEPLAY — DISCORD REGULATIONS',
          description: `**1: Respect**\nTreat everyone with respect. Discrimination, harassment, and slurs are strictly prohibited.\n\n**2: Usernames**\nYour Discord display name should be identifiable.\n\n**3: Moderating**\nRefrain from mass pinging or mentioning High Rank staff unnecessarily.\n\n**4: Advertising**\nSelf-promotion or unauthorized links in chat/DMs will lead to a ban.\n\n**5: Language**\nThis is an English-only community.\n\n**6: Channel Misuse**\nUse each channel strictly for its intended purpose.\n\n**7: Punishment Dispute**\nOpen an Assistance Ticket to appeal or discuss moderator actions.\n\n**8: Discord Guidelines**\nYou must follow Discord Community Guidelines & Terms of Service at all times.`,
          topBanner: process.env.REGULATIONS_TOP_BANNER,
          bottomBanner: process.env.REGULATIONS_BOTTOM_BANNER
        });
        return interaction.reply({ embeds, ephemeral: true });
      } else if (selected === 'roblox_reg') {
        const embeds = createBrandedEmbed({
          title: 'LOS ANGELES ROLEPLAY — IN-GAME REGULATIONS',
          description: `**1: Fair Roleplay**\nRealistic roleplay is strictly enforced.\n\n**2: Random Death Match (RDM)**\nYou must have a legitimate roleplay reason to kill another player.\n\n**3: Vehicle Death Match (VDM)**\nRamming vehicles without a valid RP reason is prohibited.\n\n**4: New Life Rule (NLR)**\nUpon death or arrest, you forget your prior life and cannot return to the scene.\n\n**5: Realistic Avatars**\nAvatars must look realistic. No oversized troll packages or neon clothing.\n\n**6: GTA Driving**\nExcessive swerving, unreasonable speeding, and flying off ramps without roleplaying crashes is banned.\n\n**7: Restricted Roleplays**\nTerrorism, suicide, corruption, and NSFW scenes are strictly prohibited.\n\n**8: Fear Roleplay**\nYou must value your life and act realistically when a firearm is pointed at you.`,
          topBanner: process.env.REGULATIONS_TOP_BANNER,
          bottomBanner: process.env.REGULATIONS_BOTTOM_BANNER
        });
        return interaction.reply({ embeds, ephemeral: true });
      }
    }

    // MARKETPLACE SELECT (Matches reference screenshots 093552, 093603, 093617, 093625)
    if (customId === 'market_select') {
      const item = values[0];
      const giveawayUrl = process.env.ROBLOX_GIVEAWAY_URL || 'https://www.roblox.com';
      const paidAdUrl = process.env.ROBLOX_PAID_AD_URL || 'https://www.roblox.com';
      const donate500Url = process.env.ROBLOX_DONATE_500_URL || 'https://www.roblox.com';
      const donate1000Url = process.env.ROBLOX_DONATE_1000_URL || 'https://www.roblox.com';
      const donate1500Url = process.env.ROBLOX_DONATE_1500_URL || 'https://www.roblox.com';
      const donate2000Url = process.env.ROBLOX_DONATE_2000_URL || 'https://www.roblox.com';

      if (item === 'sponsored_giveaway') {
        const embeds = createBrandedEmbed({
          title: 'Promotional Option 1',
          description: `> You can purchase the sponsored giveaway using the linked button provided attached to the embed. Please ensure you see promotional policy prior to purchase to ensure maximum efficiency.\n\n### Sponsored Giveaway\n**R$ 500**\n*Already bought it? Submit your giveaway by opening a support ticket.*\n\n### Sponsored Giveaway Information\nYour prize must be greater than R$ 500 or $5 in value, we do not post giveaways with lower prizes than that, and will not argue on the matter. We do not offer refunds, so its your job to read the fine print prior to purchase.`,
          topBanner: process.env.MARKETPLACE_TOP_BANNER,
          bottomBanner: process.env.MARKETPLACE_BOTTOM_BANNER
        });
        const row = new ActionRowBuilder().addComponents(
          new ButtonBuilder().setLabel('Purchase').setStyle(ButtonStyle.Link).setURL(giveawayUrl)
        );
        return interaction.reply({ embeds, components: [row], ephemeral: true });
      } else if (item === 'paid_ad') {
        const embeds = createBrandedEmbed({
          title: 'Promotional Option 2',
          description: `> You can purchase the paid advertisement using the linked button provided attached to the embed. Please ensure you see promotional policy prior to purchase to ensure maximum efficiency.\n\n### Paid Advertisement\n**R$ 350**\n*Already bought it? Submit your advertisement by opening a support ticket.*\n\n### Paid Ad Information\nYour advertisement must be clean, organized, and target the direct point of advert. No crazy long advertisements or poorly communicated advertisements that lack organization.`,
          topBanner: process.env.MARKETPLACE_TOP_BANNER,
          bottomBanner: process.env.MARKETPLACE_BOTTOM_BANNER
        });
        const row = new ActionRowBuilder().addComponents(
          new ButtonBuilder().setLabel('Purchase').setStyle(ButtonStyle.Link).setURL(paidAdUrl)
        );
        return interaction.reply({ embeds, components: [row], ephemeral: true });
      } else if (item === 'donations') {
        const embeds = createBrandedEmbed({
          title: 'Donations',
          description: `> We are extremely thankful for the generous members that wish to donate and give back to our community. All funds donated go directly back into the server for upgraded customization and features.\n\n### Donation Options\n\n**500 Robux Donation**\n[R$ 500](${donate500Url})\n\n**1000 Robux Donation**\n[R$ 1000](${donate1000Url})\n\n**1500 Robux Donation**\n[R$ 1500](${donate1500Url})\n\n**2000 Robux Donation**\n[R$ 2000](${donate2000Url})\n\n*Donated already? Claim your **Donator** role in a ticket.*`,
          topBanner: process.env.MARKETPLACE_TOP_BANNER,
          bottomBanner: process.env.MARKETPLACE_BOTTOM_BANNER
        });
        const row = new ActionRowBuilder().addComponents(
          new ButtonBuilder().setLabel('R$ 500').setStyle(ButtonStyle.Link).setURL(donate500Url),
          new ButtonBuilder().setLabel('R$ 1000').setStyle(ButtonStyle.Link).setURL(donate1000Url),
          new ButtonBuilder().setLabel('R$ 1500').setStyle(ButtonStyle.Link).setURL(donate1500Url),
          new ButtonBuilder().setLabel('R$ 2000').setStyle(ButtonStyle.Link).setURL(donate2000Url)
        );
        return interaction.reply({ embeds, components: [row], ephemeral: true });
      }
    }
  }

  // 2. BUTTONS
  if (interaction.isButton()) {
    const { customId } = interaction;

    // CANCEL APPLICATION (Matches screenshot 093949)
    if (customId === 'app_cancel') {
      const session = activeApplications.get(interaction.channelId);
      if (session && session.userId === interaction.user.id) {
        activeApplications.delete(interaction.channelId);
        await interaction.reply({ content: 'Your application has been cancelled.' });
        setTimeout(() => interaction.channel.delete().catch(() => {}), 2000);
      } else {
        return interaction.reply({ content: '❌ You cannot cancel this application.', ephemeral: true });
      }
    }

    // TICKET CLAIM / TAKEOVER
    if (customId === 'ticket_claim') {
      const ticket = db.prepare('SELECT * FROM tickets WHERE channel_id = ?').get(interaction.channelId);
      if (!ticket) return interaction.reply({ content: '❌ Ticket not found.', ephemeral: true });

      db.prepare('UPDATE tickets SET claimed_by = ?, ai_autopilot = 0 WHERE id = ?').run(interaction.user.id, ticket.id);
      return interaction.reply({ content: `🛡️ **Ticket Taken Over**: <@${interaction.user.id}> has claimed and taken over this ticket. Assistant AI autopilot has been paused.` });
    }

    // TICKET PAGE STAFF (When user requests immediate human assistance)
    if (customId === 'ticket_page_staff') {
      const ticket = db.prepare('SELECT * FROM tickets WHERE channel_id = ?').get(interaction.channelId);
      if (ticket) {
        db.prepare('UPDATE tickets SET human_requested = 1, ai_autopilot = 0 WHERE id = ?').run(ticket.id);
      }
      const staffRole = process.env.STAFF_ROLE_ID ? `<@&${process.env.STAFF_ROLE_ID}>` : '**Staff Team**';
      return interaction.reply({ content: `🔔 ${staffRole} — <@${interaction.user.id}> has requested human staff assistance. Assistant AI autopilot is paused and a staff member will be with you shortly!` });
    }

    // TICKET CLOSE (Matches screenshot 093924)
    if (customId === 'ticket_close') {
      const ticket = db.prepare('SELECT * FROM tickets WHERE channel_id = ?').get(interaction.channelId);
      if (!ticket) return interaction.reply({ content: '❌ Ticket record not found.', ephemeral: true });

      await interaction.reply({ content: 'Closing ticket and generating transcript...' });

      const messages = db.prepare('SELECT * FROM ticket_messages WHERE ticket_id = ? ORDER BY id ASC').all(ticket.id);
      const html = generateHtmlTranscript(ticket, messages);
      const buffer = Buffer.from(html, 'utf-8');
      const { AttachmentBuilder } = require('discord.js');
      const attachment = new AttachmentBuilder(buffer, { name: `transcript-ticket-${ticket.ticket_number}.html` });

      if (process.env.TICKET_TRANSCRIPT_CHANNEL_ID) {
        const transChannel = interaction.guild.channels.cache.get(process.env.TICKET_TRANSCRIPT_CHANNEL_ID);
        if (transChannel) {
          const closeEmbed = createBrandedEmbed({
            title: `Ticket #${ticket.ticket_number} — ${ticket.category}`,
            description: `Your ${ticket.category} ticket has been closed.\n╰ **Handled By:** <@${ticket.claimed_by || interaction.user.id}>\n╰ **Closed By:** <@${interaction.user.id}>\n\n🕐 **Opened:** ${ticket.created_at}\n🕐 **Closed:** Just now\n✉️ **Messages Sent:** ${messages.length} messages`
          });
          await transChannel.send({ embeds: closeEmbed, files: [attachment] });
        }
      }

      db.prepare('UPDATE tickets SET status = "CLOSED", closed_at = CURRENT_TIMESTAMP WHERE id = ?').run(ticket.id);
      setTimeout(() => interaction.channel.delete().catch(() => {}), 3000);
    }

    // TICKET ESCALATE
    if (customId === 'ticket_escalate') {
      if (process.env.DIRECTIVE_TEAM_ROLE_ID) {
        await interaction.channel.permissionOverwrites.edit(process.env.DIRECTIVE_TEAM_ROLE_ID, {
          ViewChannel: true,
          SendMessages: true
        });
      }
      return interaction.reply({ content: `📌 This ticket has been escalated to Directive Support by <@${interaction.user.id}>.` });
    }

    // VERIFICATION START
    if (customId === 'verify_start') {
      const modal = new ModalBuilder()
        .setCustomId('verify_modal')
        .setTitle('Roblox Verification');

      const input = new TextInputBuilder()
        .setCustomId('roblox_username')
        .setLabel('Enter your exact Roblox Username')
        .setStyle(TextInputStyle.Short)
        .setRequired(true);

      modal.addComponents(new ActionRowBuilder().addComponents(input));
      return interaction.showModal(modal);
    }

    // VERIFICATION CHECK CODE
    if (customId === 'verify_check_code') {
      const pending = pendingVerifications.get(interaction.user.id);
      if (!pending) return interaction.reply({ content: '❌ Verification session expired. Please click Verify again.', ephemeral: true });

      await interaction.deferReply({ ephemeral: true });
      const verified = await verifyRobloxProfileCode(pending.robloxId, pending.code);

      if (verified) {
        db.prepare('INSERT OR REPLACE INTO users (discord_id, roblox_id, roblox_username, verified_at) VALUES (?, ?, ?, CURRENT_TIMESTAMP)')
          .run(interaction.user.id, pending.robloxId, pending.username);

        if (process.env.VERIFIED_ROLE_ID) {
          await interaction.member.roles.add(process.env.VERIFIED_ROLE_ID).catch(() => {});
        }

        if (interaction.guild.members.me.permissions.has(PermissionFlagsBits.ManageNicknames)) {
          await interaction.member.setNickname(`${pending.username}`).catch(() => {});
        }
        pendingVerifications.delete(interaction.user.id);

        return interaction.editReply({ content: `🎉 You have successfully verified as **${pending.username}**! Your roles and nickname have been updated.` });
      } else {
        return interaction.editReply({ content: `❌ Could not find \`${pending.code}\` in your Roblox profile About section. Make sure you saved it, then try again.` });
      }
    }

    // MUSIC CONTROLS
    if (customId.startsWith('music_')) {
      const queue = musicManager.getQueue(interaction.guildId);
      if (!queue) return interaction.reply({ content: '❌ There is no active music playback.', ephemeral: true });

      if (customId === 'music_pause') {
        if (queue.isPaused) {
          queue.player.unpause();
          queue.isPaused = false;
          return interaction.reply({ content: '▶️ Playback resumed.', ephemeral: true });
        } else {
          queue.player.pause();
          queue.isPaused = true;
          return interaction.reply({ content: '⏸️ Playback paused.', ephemeral: true });
        }
      } else if (customId === 'music_skip') {
        queue.player.stop();
        return interaction.reply({ content: '⏭️ Skipped track.', ephemeral: true });
      } else if (customId === 'music_stop') {
        musicManager.deleteQueue(interaction.guildId);
        return interaction.reply({ content: '⏹️ Stopped playback and cleared queue.', ephemeral: true });
      } else if (customId === 'music_shuffle') {
        queue.queue.sort(() => Math.random() - 0.5);
        return interaction.reply({ content: '🔀 Queue shuffled.', ephemeral: true });
      } else if (customId === 'music_loop') {
        queue.loopMode = queue.loopMode === 'off' ? 'track' : queue.loopMode === 'track' ? 'queue' : 'off';
        return interaction.reply({ content: `🔁 Loop set to: **${queue.loopMode.toUpperCase()}**`, ephemeral: true });
      }
    }
  }

  // 3. MODALS
  if (interaction.isModalSubmit()) {
    if (interaction.customId === 'verify_modal') {
      const username = interaction.fields.getTextInputValue('roblox_username').trim();
      const robloxUser = await getRobloxUserByUsername(username);

      if (!robloxUser) {
        return interaction.reply({ content: `❌ Could not find a Roblox account named **${username}**.`, ephemeral: true });
      }

      const code = generateVerificationCode(interaction.user.id);
      pendingVerifications.set(interaction.user.id, {
        username: robloxUser.name,
        robloxId: robloxUser.id.toString(),
        code
      });

      const row = new ActionRowBuilder().addComponents(
        new ButtonBuilder().setCustomId('verify_check_code').setLabel('Done! Verify My Profile').setStyle(ButtonStyle.Success)
      );

      return interaction.reply({
        content: `🔒 **Verification Step for ${robloxUser.name}**\n\n1. Go to your Roblox Profile at https://www.roblox.com/users/${robloxUser.id}/profile\n2. Edit your **About / Bio** section to include this code:\n\`\`\`\n${code}\n\`\`\`\n3. Click the button below when done!`,
        components: [row],
        ephemeral: true
      });
    }
  }
}

// 15 Questions Handler + Sapling AI Writing Detection Scanner
async function handleApplicationMessage(message) {
  if (message.author.bot) return;

  const session = activeApplications.get(message.channel.id);
  if (!session || session.userId !== message.author.id) return;

  session.answers.push({
    question: APPLICATION_QUESTIONS[session.step],
    answer: message.content
  });
  session.step++;

  if (session.step < APPLICATION_QUESTIONS.length) {
    const qEmbed = createBrandedEmbed({
      title: `Question ${session.step + 1} of ${APPLICATION_QUESTIONS.length}`,
      description: `**${APPLICATION_QUESTIONS[session.step]}**\n\n*Type your answer below and hit Enter.*`
    });
    await message.channel.send({ embeds: qEmbed });
  } else {
    // Finished All 15 Questions -> Screen with Sapling AI Writing Detector
    activeApplications.delete(message.channel.id);

    // Run Sapling AI check
    const aiCheck = await checkAnswersForAI(session.answers);

    const dbRes = db.prepare('INSERT INTO applications (applicant_id, type, channel_id, answers, status, sapling_ai_score, sapling_flagged) VALUES (?, ?, ?, ?, "PENDING", ?, ?)')
      .run(message.author.id, 'Staff Application', message.channel.id, JSON.stringify(session.answers), aiCheck.score, aiCheck.isFlagged ? 1 : 0);

    const appId = dbRes.lastInsertRowid;

    await message.channel.send({
      content: '✅ **Application Complete!** Your answers have been submitted to the High Rank Team. This channel will now close.',
    });
    setTimeout(() => message.channel.delete().catch(() => {}), 4000);

    // Send complete review card to High Rank channel including Sapling AI detector results
    if (process.env.APPLICATION_REVIEW_CHANNEL_ID) {
      const revChan = message.guild.channels.cache.get(process.env.APPLICATION_REVIEW_CHANNEL_ID);
      if (revChan) {
        const fields = session.answers.slice(0, 10).map((a, i) => ({
          name: `Q${i + 1}: ${a.question.substring(0, 100)}`,
          value: a.answer.substring(0, 1024)
        }));

        // Sapling AI Detector Status Field
        const saplingField = {
          name: '🔍 Sapling AI Writing Detection',
          value: aiCheck.isFlagged
            ? `⚠️ **FLAGGED: AI-GENERATED CONTENT DETECTED!**\n**AI Score:** \`${aiCheck.percentage}%\` probability of ChatGPT/AI writing.\n*Reviewers are advised to scrutinize candidate answers closely.*`
            : `✅ **PASSED: Human-Written Answers**\n**AI Score:** \`${aiCheck.percentage}%\` (Below 50% threshold).`,
          inline: false
        };
        fields.unshift(saplingField);

        const reviewEmbeds = createBrandedEmbed({
          title: `New Staff Application — #${appId}`,
          description: `Applicant: <@${message.author.id}> (${message.author.id})\nDiscord Username: \`${message.author.tag}\``,
          fields,
          topBanner: process.env.APPLICATION_TOP_BANNER,
          bottomBanner: process.env.APPLICATION_BOTTOM_BANNER
        });

        const row = new ActionRowBuilder().addComponents(
          new ButtonBuilder().setCustomId(`app_approve_${appId}`).setLabel('Approve').setStyle(ButtonStyle.Success),
          new ButtonBuilder().setCustomId(`app_deny_${appId}`).setLabel('Deny').setStyle(ButtonStyle.Danger)
        );

        await revChan.send({ embeds: reviewEmbeds, components: [row] });
      }
    }
  }
}

// Groq AI Support Assistant for Tickets: Full conversation autopilot until user asks for real staff
async function handleTicketUserMessage(message) {
  if (message.author.bot) return;

  const ticket = db.prepare('SELECT * FROM tickets WHERE channel_id = ? AND status = "OPEN"').get(message.channel.id);
  if (!ticket) return;

  // Record every message into ticket_messages for transcripts & conversation history
  db.prepare('INSERT INTO ticket_messages (ticket_id, author_id, author_tag, content) VALUES (?, ?, ?, ?)').run(
    ticket.id,
    message.author.id,
    message.author.tag,
    message.content
  );

  // If a human staff member sends a message in the ticket or ticket was already claimed
  if (ticket.claimed_by || (ticket.creator_id !== message.author.id && message.member?.roles?.cache?.has(process.env.STAFF_ROLE_ID))) {
    if (ticket.ai_autopilot !== 0) {
      db.prepare('UPDATE tickets SET ai_autopilot = 0, claimed_by = ? WHERE id = ?').run(message.author.id, ticket.id);
    }
    return; // Human staff is actively chatting, so AI stays quiet
  }

  // If AI autopilot has been paused or disabled globally
  if (ticket.ai_autopilot === 0 || process.env.GROQ_AI_SUPPORT_ENABLED === 'false') {
    return;
  }

  // 1. Detect if the user explicitly asked for a real staff member / human
  if (isHumanHandoffRequested(message.content)) {
    await message.channel.sendTyping().catch(() => {});
    db.prepare('UPDATE tickets SET human_requested = 1, ai_autopilot = 0 WHERE id = ?').run(ticket.id);

    const staffRole = process.env.STAFF_ROLE_ID ? `<@&${process.env.STAFF_ROLE_ID}>` : '**Staff Team**';
    const handoffEmbed = createBrandedEmbed({
      title: '🚨 Human Staff Member Requested',
      description: `Hello <@${message.author.id}>, understood! I am paging our human staff team to take over this ticket right away.\n\nA real staff member will be with you shortly. You may leave any additional details or context here while you wait!`,
      fields: [
        { name: 'Status', value: 'Human Staff Paged 🔔', inline: true },
        { name: 'Assistant AI Autopilot', value: 'Paused ⏸️', inline: true }
      ]
    });

    await message.channel.send({
      content: `🔔 ${staffRole} — <@${message.author.id}> has requested a real staff member!`,
      embeds: handoffEmbed
    });
    return;
  }

  // 2. Full Autopilot Mode: Assistant AI types and answers every question automatically
  await message.channel.sendTyping().catch(() => {});

  // Fetch recent conversation history (last 6 messages) for multi-turn conversational context
  const recentRows = db.prepare('SELECT author_id, content FROM ticket_messages WHERE ticket_id = ? ORDER BY id DESC LIMIT 6').all(ticket.id).reverse();
  const history = recentRows.map(r => ({
    role: r.author_id === ticket.creator_id ? 'user' : 'assistant',
    content: r.content
  }));

  // Update initial inquiry if first message
  if (!ticket.groq_ai_answered) {
    db.prepare('UPDATE tickets SET inquiry = ?, groq_ai_answered = 1 WHERE id = ?').run(message.content, ticket.id);
  }

  // Call Groq Assistant AI
  const aiResponse = await generateGroqTicketResponse(message.content, ticket.category, message.author.username, history);
  const config = aiResponse.config || {};

  const botName = config.bot_name || 'Assistant AI';
  const footerText = config.footer_text || 'Powered by Los Angeles Roleplay · Assistant AI · A staff member can take over at any time';

  const groqEmbed = createBrandedEmbed({
    title: `🤖 ${botName}`,
    description: aiResponse.text,
    fields: [
      { name: 'Model Engine', value: `\`${aiResponse.model}\``, inline: true },
      { name: 'Staff Status', value: 'Autopilot Active · Staff on Standby 🛡️', inline: true }
    ],
    footer: footerText
  });

  // Action buttons: Staff can take over anytime or user can page human
  const actionRow = new ActionRowBuilder().addComponents(
    new ButtonBuilder()
      .setCustomId('ticket_claim')
      .setLabel('Take Over Ticket')
      .setStyle(ButtonStyle.Success)
      .setEmoji('🛡️'),
    new ButtonBuilder()
      .setCustomId('ticket_page_staff')
      .setLabel('Page Staff Member')
      .setStyle(ButtonStyle.Secondary)
      .setEmoji('🔔')
  );

  await message.channel.send({ embeds: groqEmbed, components: [actionRow] });
}

module.exports = {
  handleInteraction,
  handleApplicationMessage,
  handleTicketUserMessage
};
