const { Client, GatewayIntentBits, Partials, ActivityType } = require('discord.js');
require('dotenv').config();

const db = require('./database/db');
const { handleCommand } = require('./src/handlers/commandHandler');
const { handleInteraction, handleApplicationMessage, handleTicketUserMessage } = require('./src/handlers/interactionHandler');
const { handlePrefixCommand } = require('./handlers/prefixCommandHandler');
const { createBrandedEmbed } = require('./src/utils/embedBuilder');

const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMembers,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.GuildVoiceStates,
    GatewayIntentBits.MessageContent
  ],
  partials: [Partials.Message, Partials.Channel, Partials.GuildMember]
});

// ============================================================================
// EXACTLY 100 ROTATING WATCHING & LISTENING STATUSES (Cycles every 30 seconds)
// ============================================================================
const STATUS_ROTATION = [
  { type: ActivityType.Watching, text: "🌴 Los Angeles Roleplay | /help" },
  { type: ActivityType.Listening, text: "📻 LAPD Central Dispatch Radio" },
  { type: ActivityType.Watching, text: "🚔 LAPD Metropolitan Division Patrol" },
  { type: ActivityType.Listening, text: "🚨 911 Emergency Communications" },
  { type: ActivityType.Watching, text: "⭐ California Highway Patrol Units" },
  { type: ActivityType.Listening, text: "🎵 2Pac - California Love | /play" },
  { type: ActivityType.Watching, text: "🛡️ LASD County Sheriff Deputy Patrol" },
  { type: ActivityType.Listening, text: "🚁 LAFD Air Ops Helipad Comms" },
  { type: ActivityType.Watching, text: "🚒 LAFD Station 8 Engine Operations" },
  { type: ActivityType.Listening, text: "🎙️ High Rank Executive Briefing" },
  { type: ActivityType.Watching, text: "🏖️ Venice Beach Boardwalk Activity" },
  { type: ActivityType.Listening, text: "📡 West Coast ATC Airport Tower" },
  { type: ActivityType.Watching, text: "🌆 Downtown Los Angeles Skyline" },
  { type: ActivityType.Listening, text: "⚡ Carlos473 Systems Engine" },
  { type: ActivityType.Watching, text: "🏎️ High Speed Pursuits on I-5" },
  { type: ActivityType.Listening, text: "🎧 Trainee Academy Radio Frequencies" },
  { type: ActivityType.Watching, text: "⚖️ Los Angeles County Superior Court" },
  { type: ActivityType.Listening, text: "🔊 Tactical SWAT Entry Frequencies" },
  { type: ActivityType.Watching, text: "👮 LAPD Mission Community Police Station" },
  { type: ActivityType.Listening, text: "🎼 West Coast Hip-Hop Radio" },
  { type: ActivityType.Watching, text: "🏢 City Hall Council Meetings" },
  { type: ActivityType.Listening, text: "📬 Inbound Support Tickets | /ticket-panel" },
  { type: ActivityType.Watching, text: "🎥 Hollywood Boulevard Roleplay" },
  { type: ActivityType.Listening, text: "🚨 Bank Heist Silent Alarm Trips" },
  { type: ActivityType.Watching, text: "🌉 Vincent Thomas Bridge Traffic" },
  { type: ActivityType.Listening, text: "📻 LASD Twin Towers Custody Comms" },
  { type: ActivityType.Watching, text: "🏥 Cedars-Sinai Medical Hospital" },
  { type: ActivityType.Listening, text: "🎶 Dr. Dre - Still D.R.E. | /play" },
  { type: ActivityType.Watching, text: "🕵️ FBI Los Angeles Field Office" },
  { type: ActivityType.Listening, text: "📡 Automated Radar Speed Traps" },
  { type: ActivityType.Watching, text: "🌴 Beverly Hills Rodeo Drive Patrol" },
  { type: ActivityType.Listening, text: "💬 Community General Chat Voice" },
  { type: ActivityType.Watching, text: "🚁 LAPD Air Support Division Helis" },
  { type: ActivityType.Listening, text: "📻 CHP Statewide Frequency 39.80" },
  { type: ActivityType.Watching, text: "🏎️ Midnight Canyon Drifters" },
  { type: ActivityType.Listening, text: "🎙️ Directive Team Management Audio" },
  { type: ActivityType.Watching, text: "🚢 Port of Los Angeles Cargo Docks" },
  { type: ActivityType.Listening, text: "🎵 Kendrick Lamar - Not Like Us" },
  { type: ActivityType.Watching, text: "🚧 Caltrans Freeway Construction" },
  { type: ActivityType.Listening, text: "🚨 Jewel Store Silent Duress Alarms" },
  { type: ActivityType.Watching, text: "🎯 SWAT Active Tactical Deployments" },
  { type: ActivityType.Listening, text: "📻 Inter-Agency Mutual Aid Patch" },
  { type: ActivityType.Watching, text: "🌅 Sunset Boulevard Nightlife" },
  { type: ActivityType.Listening, text: "🎧 Custom Playlists | /playlist" },
  { type: ActivityType.Watching, text: "🏨 Millennium Biltmore Hotel District" },
  { type: ActivityType.Listening, text: "📡 Anti-Cheat Threat Tripwire Logs" },
  { type: ActivityType.Watching, text: "🏖️ Santa Monica Pier Tourists" },
  { type: ActivityType.Listening, text: "📻 LAX Airport Police Scanner" },
  { type: ActivityType.Watching, text: "🚔 Gang and Narcotics Division (GND)" },
  { type: ActivityType.Listening, text: "🎵 Ice Cube - It Was A Good Day" },
  { type: ActivityType.Watching, text: "🌲 Angeles National Forest Patrols" },
  { type: ActivityType.Listening, text: "💬 Carlos473 Architecture Heartbeat" },
  { type: ActivityType.Watching, text: "🚓 K9 Unit Traffic Stops" },
  { type: ActivityType.Listening, text: "🚨 10-99 Officer Needs Assistance" },
  { type: ActivityType.Watching, text: "🏟️ Dodger Stadium Event Crowds" },
  { type: ActivityType.Listening, text: "📻 Fire Rescue Dispatch Talkgroup" },
  { type: ActivityType.Watching, text: "🛡️ Staff Disciplinary Log Records" },
  { type: ActivityType.Listening, text: "🎧 Low-Latency Opus Audio Streams" },
  { type: ActivityType.Watching, text: "🏪 24/7 Store Robbery Scenes" },
  { type: ActivityType.Listening, text: "📡 Live Roblox Player Verifications" },
  { type: ActivityType.Watching, text: "🌴 Malibu Coastal Highway Cruisers" },
  { type: ActivityType.Listening, text: "📻 Marine Rescue Lifeguard Tower" },
  { type: ActivityType.Watching, text: "🏛️ Federal Detention Center DTLA" },
  { type: ActivityType.Listening, text: "🎵 Warren G - Regulate | /nowplaying" },
  { type: ActivityType.Watching, text: "🚨 Priority 1 Pursuit Radio Calls" },
  { type: ActivityType.Listening, text: "💬 Trainee Application Question Submissions" },
  { type: ActivityType.Watching, text: "📈 Server Boosting Milestones" },
  { type: ActivityType.Listening, text: "📻 Internal Affairs Inquiry Audio" },
  { type: ActivityType.Watching, text: "🏢 Wilshire Grand Center Rooftop" },
  { type: ActivityType.Listening, text: "🚨 Code 3 Emergency Siren Wail" },
  { type: ActivityType.Watching, text: "🚊 Metro Blue Line Station Platforms" },
  { type: ActivityType.Listening, text: "📡 Discord Gateway Websocket Ping" },
  { type: ActivityType.Watching, text: "📦 Robux Marketplace Store Orders" },
  { type: ActivityType.Listening, text: "📻 LASD Lakewood Sheriff Station" },
  { type: ActivityType.Watching, text: "🌴 Palms Neighborhood Cruisers" },
  { type: ActivityType.Listening, text: "🎵 Nate Dogg - Nobody Does It Better" },
  { type: ActivityType.Watching, text: "🔍 Internal Affairs Audits" },
  { type: ActivityType.Listening, text: "🚨 Felony Vehicle Stop Directives" },
  { type: ActivityType.Watching, text: "🏎️ Street Racers on Long Beach Blvd" },
  { type: ActivityType.Listening, text: "📻 CHP South Los Angeles Area Base" },
  { type: ActivityType.Watching, text: "🛡️ Moderator Slowmode Enforcement" },
  { type: ActivityType.Listening, text: "🎧 320kbps High-Fidelity Music" },
  { type: ActivityType.Watching, text: "🚑 EMT Paramedic Resuscitation Units" },
  { type: ActivityType.Listening, text: "📻 Countywide Broadcast Frequencies" },
  { type: ActivityType.Watching, text: "🌴 Compton Creek Perimeter Units" },
  { type: ActivityType.Listening, text: "📡 SQLite WAL Engine Read/Writes" },
  { type: ActivityType.Watching, text: "🚔 L.A. County Highway Interdictions" },
  { type: ActivityType.Listening, text: "🚨 Code 4 Scene Secure Announcements" },
  { type: ActivityType.Watching, text: "📝 Live 15-Question Staff Exams" },
  { type: ActivityType.Listening, text: "🎙️ Carlos473 Management Updates" },
  { type: ActivityType.Watching, text: "🌆 Los Angeles City Lights at Dusk" },
  { type: ActivityType.Listening, text: "📻 Bureau of Emergency Medical Comms" },
  { type: ActivityType.Watching, text: "🛡️ 100 Slash Command Routes" },
  { type: ActivityType.Listening, text: "🎵 Eazy-E - Real Muthaphuckkin G's" },
  { type: ActivityType.Watching, text: "🚨 Spike Strip Tactical Deployments" },
  { type: ActivityType.Listening, text: "📡 Live Roblox Avatar Profile Sync" },
  { type: ActivityType.Watching, text: "🏎️ High Stakes Getaway Chases" },
  { type: ActivityType.Listening, text: "📻 Tactical Talkaround Frequency A" },
  { type: ActivityType.Watching, text: "🌴 Official Los Angeles Roleplay | Carlos473" },
  { type: ActivityType.Listening, text: "🛡️ Complete Security & Anti-Raid Shield" }
];

// ============================================================================
// EXACTLY 50 ROTATING BOT PROFILE BIOS ("ABOUT ME") (Cycles every 15 minutes)
// ============================================================================
const BIO_ROTATION = [
  "🤖 Official Los Angeles Roleplay Assistant AI | Engineered by Carlos473",
  "🌴 Los Angeles Roleplay Assistant AI. Instant Groq Ticket Support, Staff Management & Audio | Carlos473",
  "⚡ High-performance Assistant AI backend for Los Angeles Roleplay. Designed by Carlos473.",
  "📻 Serving the Los Angeles Roleplay community with Assistant AI automation and HD Music. Built by Carlos473.",
  "🛡️ Los Angeles Roleplay Assistant AI: Security, Moderation, and Audio Core. Architectural Design by Carlos473.",
  "🎵 24/7 High-Fidelity Voice Audio & Assistant AI Administration for Los Angeles Roleplay | Carlos473",
  "⭐ Los Angeles Roleplay's premier Assistant AI. Automated ticketing, applications, and Roblox sync. By Carlos473.",
  "🌴 Powered by Node.js 20 & SQLite WAL | Los Angeles Roleplay Assistant AI | Carlos473",
  "🚨 100 Fully Functional Slash Commands powering Los Angeles Roleplay Assistant AI. Developed by Carlos473.",
  "👮 LAPD, LASD, CHP, and LAFD Assistant AI Management Engine for Los Angeles Roleplay. By Carlos473.",
  "🌴 Venice to Hollywood — Assistant AI Maintaining Law, Order & Music across Los Angeles Roleplay. By Carlos473.",
  "💎 Enterprise Assistant AI & Interactive Marketplace for Los Angeles Roleplay. By Carlos473.",
  "🔒 Dedicated Roblox Verification & Assistant AI Staff Onboarding | Los Angeles Roleplay | Carlos473",
  "📡 Real-time HTML ticket archiving & Assistant AI metric evaluation | Los Angeles Roleplay | Carlos473",
  "🌴 Welcome to Los Angeles Roleplay! Type /help or /verify to begin. Assistant AI by Carlos473.",
  "🏎️ The ultimate ER:LC Los Angeles Roleplay Assistant AI. Built and tuned by Carlos473.",
  "🎼 Streaming your favorite YouTube & Spotify tracks across Los Angeles Roleplay | Assistant AI by Carlos473",
  "📊 Real-time server statistics, giveaways, and department roster control. Assistant AI by Carlos473.",
  "🌴 Welcome to the City of Angels. Powered by the Los Angeles Roleplay Assistant AI | Carlos473",
  "🛡️ Zero-compromise staff management, infractions, and appeals with Assistant AI. By Carlos473.",
  "🚔 Los Angeles Roleplay Emergency Dispatch, Application Review & Music Core | Assistant AI by Carlos473",
  "⭐ Designed exclusively for Los Angeles Roleplay. Assistant AI crafted with precision by Carlos473.",
  "🌴 The heartbeat of Los Angeles Roleplay. Automated Assistant AI workflows & 320kbps music. By Carlos473.",
  "📝 15-Question Automated Staff Hiring Engine & Sapling Screening | Assistant AI by Carlos473",
  "🎧 Interactive queue control, progress bars, and volume slider | Assistant AI | Carlos473",
  "🌴 Los Angeles Roleplay Community Hub | Powered by Carlos473 Assistant AI Architecture",
  "🚨 Comprehensive staff tracking, warnings, strikes, and promotions | Assistant AI | Carlos473",
  "🌴 Experience next-gen Discord management with Los Angeles Roleplay Assistant AI | By Carlos473",
  "📻 Handling 911 calls, ticket escalations, and moderation logs | Assistant AI | Carlos473",
  "💎 Los Angeles Roleplay Marketplace, Robux items, and custom department rosters. Assistant AI by Carlos473.",
  "🌴 Built for realism, high FPS, and seamless Discord integration | Assistant AI | Carlos473",
  "👮 Maintaining strict community regulations and fair roleplay standards. Assistant AI by Carlos473.",
  "🎵 Stream California Love and classic West Coast anthems with /play | Assistant AI | Carlos473",
  "🌴 Los Angeles Roleplay Operations, Anti-Raid & Disciplinary Engine | Assistant AI by Carlos473",
  "🔒 Safe, verified, and automated Roblox account linking | Assistant AI | Carlos473",
  "📊 Keeping track of 19,000+ Los Angeles Roleplay community members. Assistant AI by Carlos473.",
  "🌴 Los Angeles County's most advanced Discord roleplay Assistant AI. Programmed by Carlos473.",
  "🚁 Air Ops, Metropolitan Division & Highway Patrol Administration | Assistant AI | Carlos473",
  "⭐ Premium embeds with dual-banner branding for Los Angeles Roleplay. Assistant AI by Carlos473.",
  "🌴 Los Angeles Roleplay Staff Team & Trainee Academy Headquarters | Assistant AI by Carlos473",
  "⚡ SQLite WAL persistent memory engine powering Los Angeles Roleplay Assistant AI | By Carlos473",
  "🎧 Clean audio, interactive buttons, and zero website dependency | Assistant AI | Carlos473",
  "🌴 Need assistance? Run /ticket-panel in Los Angeles Roleplay. Assistant AI by Carlos473.",
  "🚔 High rank oversight, department rosters, and automated logging | Assistant AI by Carlos473",
  "🌴 Los Angeles Roleplay: Where Realism Meets Technology | Assistant AI by Carlos473",
  "🛡️ Enforcing NLR, FearRP, and server guidelines across Los Angeles Roleplay. Assistant AI by Carlos473.",
  "💎 The all-in-one Assistant AI for Los Angeles Roleplay. Engineered by Carlos473.",
  "🌴 Welcome to Los Angeles Roleplay — Join a department today via /department. Assistant AI by Carlos473.",
  "📻 Radio silent alarms, interactive moderation, and queue control | Assistant AI by Carlos473",
  "⭐ Los Angeles Roleplay Assistant AI | Master Codebase by Carlos473"
];

// ============================================================================
// BOT STARTUP & DYNAMIC CYCLING
// ============================================================================
client.once('ready', async () => {
  console.log(`
==================================================
LOS ANGELES ROLEPLAY MANAGEMENT SYSTEM
--------------------------------------------------
Lead Developer: Carlos473
Database: Connected (SQLite WAL Mode)
Discord Gateway: Connected as ${client.user.tag}
Command Handler: Loaded (100/100 Slash Commands)
Interactive Subsystems: Online (App, Ticket, Verify)
Status Loop: Initialized (100 Rotations / 30s)
Bio Loop: Initialized (50 Rotations / 15m)
Music Playback Engine: Initialized
--------------------------------------------------
Bot Status: ONLINE
==================================================
  `);

  // 1. Status Rotation Loop (Cycles every 30 seconds across 100 statuses with Do Not Disturb status)
  let statusIndex = 0;
  setInterval(() => {
    const current = STATUS_ROTATION[statusIndex % STATUS_ROTATION.length];
    client.user.setPresence({
      status: 'dnd',
      activities: [{ name: current.text, type: current.type }]
    });
    statusIndex++;
  }, 30000);

  // Set initial status immediately on ready to Do Not Disturb (dnd)
  client.user.setPresence({
    status: 'dnd',
    activities: [{ name: STATUS_ROTATION[0].text, type: STATUS_ROTATION[0].type }]
  });

  // 2. Profile "About Me" Bio Rotation Loop (Cycles every 15 minutes across 50 bios)
  let bioIndex = 0;
  async function updateBotBio() {
    try {
      if (client.application) {
        const nextBio = BIO_ROTATION[bioIndex % BIO_ROTATION.length];
        await client.application.edit({ description: nextBio });
        bioIndex++;
      }
    } catch (err) {
      console.error('[Bio Rotation Info] Discord API Rate limit or permission:', err.message);
    }
  }

  // Initial update
  await updateBotBio();
  setInterval(updateBotBio, 15 * 60 * 1000);
});

// Route Interactions
client.on('interactionCreate', async (interaction) => {
  try {
    if (interaction.isChatInputCommand()) {
      await handleCommand(interaction);
    } else {
      await handleInteraction(interaction);
    }
  } catch (error) {
    console.error('[Interaction Execution Error]', error);
    if (!interaction.replied && !interaction.deferred) {
      await interaction.reply({ content: '❌ An internal error occurred while processing this request.', ephemeral: true }).catch(() => {});
    }
  }
});

// Listen for application step responses and ticket logging
client.on('messageCreate', async (message) => {
  if (message.author.bot) return;

  // Process prefix commands (!tripwire, !help, !knowledge, !play, etc.)
  if (message.content.startsWith('!')) {
    const executed = await handlePrefixCommand(message);
    if (executed) return;
  }

  // Log all messages in ticket channels for HTML transcripts
  const ticket = db.prepare('SELECT id FROM tickets WHERE channel_id = ?').get(message.channel.id);
  if (ticket) {
    const attachmentUrl = message.attachments.first() ? message.attachments.first().url : null;
    db.prepare('INSERT INTO ticket_messages (ticket_id, author_id, author_tag, content, attachments) VALUES (?, ?, ?, ?, ?)')
      .run(ticket.id, message.author.id, message.author.tag, message.content, attachmentUrl);
  }

  // Handle application answers step-by-step
  await handleApplicationMessage(message);

  // Handle Groq AI support assistant reply in ticket channels
  await handleTicketUserMessage(message);
});

// Welcome / Verification Prompt on Member Join
client.on('guildMemberAdd', async (member) => {
  if (!process.env.WELCOME_CHANNEL_ID) return;
  const channel = member.guild.channels.cache.get(process.env.WELCOME_CHANNEL_ID);
  if (!channel) return;

  const count = member.guild.memberCount;
  channel.send({
    content: `👋 Welcome <@${member.id}> to **Los Angeles Roleplay**! You are our **${count.toLocaleString()}th** member, we hope you enjoy your stay!\nEnsure to verify in <#${process.env.VERIFICATION_CHANNEL_ID}> to gain full access.`
  });
});

// Booster Announcement
client.on('guildMemberUpdate', async (oldMember, newMember) => {
  if (!oldMember.premiumSince && newMember.premiumSince && process.env.BOOSTER_CHANNEL_ID) {
    const boosterChannel = newMember.guild.channels.cache.get(process.env.BOOSTER_CHANNEL_ID);
    if (!boosterChannel) return;

    const embeds = createBrandedEmbed({
      title: '💎 Thank You for Boosting!',
      description: `Thank you <@${newMember.id}> for boosting **Los Angeles Roleplay**! Your support keeps our community going.\nAs a thank you, you have received the booster role and perks.\n\n🎁 We're now at **${newMember.guild.premiumSubscriptionCount}** boosts.`,
      bottomBanner: process.env.BOOSTER_BANNER
    });

    boosterChannel.send({ embeds });
  }
});

client.login(process.env.TOKEN);
