const { REST, Routes, SlashCommandBuilder, PermissionFlagsBits } = require('discord.js');
require('dotenv').config();

const commandDefinitions = [
  // ================= 1. STAFF MANAGEMENT (12 COMMANDS) =================
  new SlashCommandBuilder().setName('infraction').setDescription('Issue an infraction to a staff member')
    .addUserOption(o => o.setName('staff').setDescription('The staff member').setRequired(true))
    .addStringOption(o => o.setName('type').setDescription('Infraction type').setRequired(true)
      .addChoices(
        { name: 'Warning', value: 'Warning' },
        { name: 'Strike 1', value: 'Strike 1' },
        { name: 'Strike 2', value: 'Strike 2' },
        { name: 'Final Warning', value: 'Final Warning' },
        { name: 'Suspension', value: 'Suspension' },
        { name: 'Termination', value: 'Termination' }
      ))
    .addStringOption(o => o.setName('reason').setDescription('Reason for infraction').setRequired(true))
    .addBooleanOption(o => o.setName('appealable').setDescription('Can this infraction be appealed?').setRequired(true)),
  new SlashCommandBuilder().setName('infractions').setDescription('View infractions of a staff member')
    .addUserOption(o => o.setName('staff').setDescription('The staff member').setRequired(true)),
  new SlashCommandBuilder().setName('infraction-history').setDescription('View complete server infraction records'),
  new SlashCommandBuilder().setName('infraction-appeal').setDescription('File or review an infraction appeal')
    .addIntegerOption(o => o.setName('id').setDescription('Infraction ID').setRequired(true))
    .addStringOption(o => o.setName('reason').setDescription('Reason for appeal').setRequired(true)),
  new SlashCommandBuilder().setName('promote').setDescription('Promote a staff member to a new rank')
    .addUserOption(o => o.setName('staff').setDescription('The staff member').setRequired(true))
    .addRoleOption(o => o.setName('new_rank').setDescription('The target rank role').setRequired(true))
    .addStringOption(o => o.setName('reason').setDescription('Promotion justification').setRequired(true))
    .addRoleOption(o => o.setName('old_rank').setDescription('The old rank role to remove')),
  new SlashCommandBuilder().setName('promotion-history').setDescription('View promotion logs for a staff member')
    .addUserOption(o => o.setName('staff').setDescription('The staff member').setRequired(true)),
  new SlashCommandBuilder().setName('demote').setDescription('Demote a staff member')
    .addUserOption(o => o.setName('staff').setDescription('The staff member').setRequired(true))
    .addRoleOption(o => o.setName('new_rank').setDescription('The new lower rank role').setRequired(true))
    .addStringOption(o => o.setName('reason').setDescription('Reason for demotion').setRequired(true)),
  new SlashCommandBuilder().setName('staff-feedback').setDescription('Submit feedback for a staff member')
    .addUserOption(o => o.setName('staff').setDescription('The staff member').setRequired(true))
    .addIntegerOption(o => o.setName('rating').setDescription('Rating from 1 to 5').setRequired(true)
      .addChoices(
        { name: '⭐ 1/5', value: 1 },
        { name: '⭐⭐ 2/5', value: 2 },
        { name: '⭐⭐⭐ 3/5', value: 3 },
        { name: '⭐⭐⭐⭐ 4/5', value: 4 },
        { name: '⭐⭐⭐⭐⭐ 5/5', value: 5 }
      ))
    .addStringOption(o => o.setName('reason').setDescription('Feedback details').setRequired(true)),
  new SlashCommandBuilder().setName('staff-profile').setDescription('View full performance profile for a staff member')
    .addUserOption(o => o.setName('staff').setDescription('The staff member')),
  new SlashCommandBuilder().setName('staff-activity').setDescription('Track activity metrics for staff'),
  new SlashCommandBuilder().setName('staff-blacklist').setDescription('Blacklist a user from staff applications')
    .addUserOption(o => o.setName('user').setDescription('User to blacklist').setRequired(true))
    .addStringOption(o => o.setName('reason').setDescription('Reason').setRequired(true)),
  new SlashCommandBuilder().setName('staff-notes').setDescription('Add a private management note to a staff member')
    .addUserOption(o => o.setName('staff').setDescription('Staff member').setRequired(true))
    .addStringOption(o => o.setName('note').setDescription('Note content').setRequired(true)),

  // ================= 2. APPLICATIONS (8 COMMANDS) =================
  new SlashCommandBuilder().setName('application-panel').setDescription('Deploy the interactive application panel')
    .setDefaultMemberPermissions(PermissionFlagsBits.Administrator),
  new SlashCommandBuilder().setName('application-review').setDescription('Review a submitted application')
    .addIntegerOption(o => o.setName('id').setDescription('Application ID').setRequired(true)),
  new SlashCommandBuilder().setName('application-approve').setDescription('Approve an application')
    .addIntegerOption(o => o.setName('id').setDescription('Application ID').setRequired(true)),
  new SlashCommandBuilder().setName('application-deny').setDescription('Deny an application')
    .addIntegerOption(o => o.setName('id').setDescription('Application ID').setRequired(true)),
  new SlashCommandBuilder().setName('application-reopen').setDescription('Reopen a closed application')
    .addIntegerOption(o => o.setName('id').setDescription('Application ID').setRequired(true)),
  new SlashCommandBuilder().setName('application-status').setDescription('Check your current application status'),
  new SlashCommandBuilder().setName('application-blacklist').setDescription('Manage application blacklist')
    .addUserOption(o => o.setName('user').setDescription('Target user').setRequired(true)),
  new SlashCommandBuilder().setName('application-stats').setDescription('Display comprehensive application statistics'),

  // ================= 3. TICKETS & ASSISTANCE (10 COMMANDS) =================
  new SlashCommandBuilder().setName('ticket-panel').setDescription('Deploy the assistance panel')
    .setDefaultMemberPermissions(PermissionFlagsBits.Administrator),
  new SlashCommandBuilder().setName('ticket-add').setDescription('Add a user to the current ticket')
    .addUserOption(o => o.setName('user').setDescription('User to add').setRequired(true)),
  new SlashCommandBuilder().setName('ticket-remove').setDescription('Remove a user from the ticket')
    .addUserOption(o => o.setName('user').setDescription('User to remove').setRequired(true)),
  new SlashCommandBuilder().setName('ticket-claim').setDescription('Claim the current ticket'),
  new SlashCommandBuilder().setName('ticket-close').setDescription('Close ticket and generate HTML transcript'),
  new SlashCommandBuilder().setName('ticket-escalate').setDescription('Escalate ticket to High Rank / Directive Team'),
  new SlashCommandBuilder().setName('ticket-reopen').setDescription('Reopen a closed ticket'),
  new SlashCommandBuilder().setName('ticket-transcript').setDescription('Generate an on-demand HTML transcript'),
  new SlashCommandBuilder().setName('ticket-rename').setDescription('Rename the current ticket channel')
    .addStringOption(o => o.setName('name').setDescription('New channel name').setRequired(true)),
  new SlashCommandBuilder().setName('ticket-stats').setDescription('View ticket response and resolution statistics'),

  // ================= 4. MODERATION (12 COMMANDS) =================
  new SlashCommandBuilder().setName('ban').setDescription('Ban a user from the server')
    .addUserOption(o => o.setName('target').setDescription('Target user').setRequired(true))
    .addStringOption(o => o.setName('reason').setDescription('Reason')),
  new SlashCommandBuilder().setName('unban').setDescription('Unban a user by Discord ID')
    .addStringOption(o => o.setName('id').setDescription('Target Discord ID').setRequired(true)),
  new SlashCommandBuilder().setName('kick').setDescription('Kick a member from the server')
    .addUserOption(o => o.setName('target').setDescription('Target member').setRequired(true))
    .addStringOption(o => o.setName('reason').setDescription('Reason')),
  new SlashCommandBuilder().setName('timeout').setDescription('Timeout a member')
    .addUserOption(o => o.setName('target').setDescription('Target member').setRequired(true))
    .addIntegerOption(o => o.setName('minutes').setDescription('Duration in minutes').setRequired(true))
    .addStringOption(o => o.setName('reason').setDescription('Reason')),
  new SlashCommandBuilder().setName('untimeout').setDescription('Remove timeout from a member')
    .addUserOption(o => o.setName('target').setDescription('Target member').setRequired(true)),
  new SlashCommandBuilder().setName('warn').setDescription('Issue a formal moderation warning')
    .addUserOption(o => o.setName('target').setDescription('Target member').setRequired(true))
    .addStringOption(o => o.setName('reason').setDescription('Reason').setRequired(true)),
  new SlashCommandBuilder().setName('warnings').setDescription('View warnings for a user')
    .addUserOption(o => o.setName('target').setDescription('Target user').setRequired(true)),
  new SlashCommandBuilder().setName('clear').setDescription('Purge messages from the channel')
    .addIntegerOption(o => o.setName('amount').setDescription('Number of messages to delete (1-100)').setRequired(true)),
  new SlashCommandBuilder().setName('lock').setDescription('Lock down the current channel'),
  new SlashCommandBuilder().setName('unlock').setDescription('Unlock the current channel'),
  new SlashCommandBuilder().setName('slowmode').setDescription('Set slowmode interval')
    .addIntegerOption(o => o.setName('seconds').setDescription('Seconds (0 to disable)').setRequired(true)),
  new SlashCommandBuilder().setName('modlogs').setDescription('Lookup moderation history for a user')
    .addUserOption(o => o.setName('target').setDescription('Target user').setRequired(true)),

  // ================= 5. MUSIC SYSTEM (18 COMMANDS) =================
  new SlashCommandBuilder().setName('play').setDescription('Play music from YouTube or Spotify')
    .addStringOption(o => o.setName('query').setDescription('Song name or URL').setRequired(true)),
  new SlashCommandBuilder().setName('pause').setDescription('Pause audio playback'),
  new SlashCommandBuilder().setName('resume').setDescription('Resume audio playback'),
  new SlashCommandBuilder().setName('skip').setDescription('Skip to the next song'),
  new SlashCommandBuilder().setName('previous').setDescription('Play the previous track'),
  new SlashCommandBuilder().setName('stop').setDescription('Stop music and disconnect'),
  new SlashCommandBuilder().setName('queue').setDescription('View current queue'),
  new SlashCommandBuilder().setName('nowplaying').setDescription('Show the interactive music player'),
  new SlashCommandBuilder().setName('volume').setDescription('Set music volume')
    .addIntegerOption(o => o.setName('level').setDescription('Volume (1-150)').setRequired(true)),
  new SlashCommandBuilder().setName('shuffle').setDescription('Shuffle the current queue'),
  new SlashCommandBuilder().setName('loop').setDescription('Set loop mode')
    .addStringOption(o => o.setName('mode').setDescription('Mode').setRequired(true)
      .addChoices(
        { name: 'Off', value: 'off' },
        { name: 'Current Track', value: 'track' },
        { name: 'Entire Queue', value: 'queue' }
      )),
  new SlashCommandBuilder().setName('remove').setDescription('Remove a track from the queue')
    .addIntegerOption(o => o.setName('index').setDescription('Song number in queue').setRequired(true)),
  new SlashCommandBuilder().setName('clearqueue').setDescription('Clear the entire queue'),
  new SlashCommandBuilder().setName('seek').setDescription('Seek to timestamp in current song')
    .addIntegerOption(o => o.setName('seconds').setDescription('Position in seconds').setRequired(true)),
  new SlashCommandBuilder().setName('forward').setDescription('Fast-forward playback by seconds')
    .addIntegerOption(o => o.setName('seconds').setDescription('Seconds forward').setRequired(true)),
  new SlashCommandBuilder().setName('backward').setDescription('Rewind playback by seconds')
    .addIntegerOption(o => o.setName('seconds').setDescription('Seconds backward').setRequired(true)),
  new SlashCommandBuilder().setName('playlist').setDescription('Save or load your custom playlists')
    .addStringOption(o => o.setName('action').setDescription('Action').setRequired(true)
      .addChoices(
        { name: 'Save Current Queue', value: 'save' },
        { name: 'Load Saved Playlist', value: 'load' },
        { name: 'List My Playlists', value: 'list' }
      ))
    .addStringOption(o => o.setName('name').setDescription('Playlist name')),
  new SlashCommandBuilder().setName('autoplay').setDescription('Toggle autoplay related recommendations'),

  // ================= 6. DEPARTMENTS (8 COMMANDS) =================
  new SlashCommandBuilder().setName('department').setDescription('Deploy the Los Angeles Roleplay department panel')
    .setDefaultMemberPermissions(PermissionFlagsBits.Administrator),
  new SlashCommandBuilder().setName('department-create').setDescription('Register a new department in the database')
    .addStringOption(o => o.setName('name').setDescription('Department Name').setRequired(true))
    .addStringOption(o => o.setName('link').setDescription('Discord Invite / Application Link').setRequired(true)),
  new SlashCommandBuilder().setName('department-edit').setDescription('Edit a department entry')
    .addStringOption(o => o.setName('name').setDescription('Department Name').setRequired(true))
    .addStringOption(o => o.setName('link').setDescription('New Link').setRequired(true)),
  new SlashCommandBuilder().setName('department-remove').setDescription('Remove a department')
    .addStringOption(o => o.setName('name').setDescription('Department Name').setRequired(true)),
  new SlashCommandBuilder().setName('department-apply').setDescription('Apply for a specific department')
    .addStringOption(o => o.setName('department').setDescription('Department').setRequired(true)),
  new SlashCommandBuilder().setName('department-roster').setDescription('View department membership roster')
    .addStringOption(o => o.setName('department').setDescription('Department').setRequired(true)),
  new SlashCommandBuilder().setName('department-leave').setDescription('Leave a department'),
  new SlashCommandBuilder().setName('department-stats').setDescription('Display department statistics'),

  // ================= 7. TRAINING (7 COMMANDS) =================
  new SlashCommandBuilder().setName('training-create').setDescription('Schedule a new staff training session')
    .addStringOption(o => o.setName('type').setDescription('Training type').setRequired(true))
    .addStringOption(o => o.setName('time').setDescription('Scheduled time description').setRequired(true))
    .addStringOption(o => o.setName('game_link').setDescription('Roblox Game Link').setRequired(true)),
  new SlashCommandBuilder().setName('training-start').setDescription('Officially open a training session')
    .addIntegerOption(o => o.setName('id').setDescription('Training ID').setRequired(true)),
  new SlashCommandBuilder().setName('training-end').setDescription('Conclude a training session')
    .addIntegerOption(o => o.setName('id').setDescription('Training ID').setRequired(true)),
  new SlashCommandBuilder().setName('training-cancel').setDescription('Cancel a training session')
    .addIntegerOption(o => o.setName('id').setDescription('Training ID').setRequired(true)),
  new SlashCommandBuilder().setName('training-attendance').setDescription('View attendance list for a session')
    .addIntegerOption(o => o.setName('id').setDescription('Training ID').setRequired(true)),
  new SlashCommandBuilder().setName('training-results').setDescription('Submit trainee pass/fail results')
    .addIntegerOption(o => o.setName('training_id').setDescription('Training ID').setRequired(true))
    .addUserOption(o => o.setName('trainee').setDescription('Trainee').setRequired(true))
    .addStringOption(o => o.setName('result').setDescription('Result').setRequired(true)
      .addChoices(
        { name: 'Passed', value: 'PASSED' },
        { name: 'Failed', value: 'FAILED' }
      ))
    .addStringOption(o => o.setName('notes').setDescription('Feedback notes')),
  new SlashCommandBuilder().setName('training-history').setDescription('View training history of a member')
    .addUserOption(o => o.setName('trainee').setDescription('Trainee').setRequired(true)),

  // ================= 8. COMMUNITY & UTILITY (25 COMMANDS -> EXACTLY 100 TOTAL) =================
  new SlashCommandBuilder().setName('verify').setDescription('Verify your Roblox account with Los Angeles Roleplay'),
  new SlashCommandBuilder().setName('verification-panel').setDescription('Deploy the Roblox verification panel')
    .setDefaultMemberPermissions(PermissionFlagsBits.Administrator),
  new SlashCommandBuilder().setName('verification-help').setDescription('Instructions on how to verify your Roblox account'),
  new SlashCommandBuilder().setName('serverstats').setDescription('Display comprehensive Los Angeles Roleplay statistics'),
  new SlashCommandBuilder().setName('goal').setDescription('View the server member and boost goals'),
  new SlashCommandBuilder().setName('goal-set').setDescription('Set the server target member goal')
    .addIntegerOption(o => o.setName('target').setDescription('Target member count').setRequired(true)),
  new SlashCommandBuilder().setName('giveaway').setDescription('Start a giveaway with entry buttons')
    .addStringOption(o => o.setName('prize').setDescription('Prize').setRequired(true))
    .addIntegerOption(o => o.setName('duration_minutes').setDescription('Duration in minutes').setRequired(true))
    .addIntegerOption(o => o.setName('winners').setDescription('Winner count').setRequired(true)),
  new SlashCommandBuilder().setName('giveaway-reroll').setDescription('Reroll a giveaway winner')
    .addStringOption(o => o.setName('message_id').setDescription('Giveaway Message ID').setRequired(true)),
  new SlashCommandBuilder().setName('regulations').setDescription('Post the server and roleplay regulations panel')
    .setDefaultMemberPermissions(PermissionFlagsBits.Administrator),
  new SlashCommandBuilder().setName('marketplace').setDescription('Deploy the official Los Angeles Roleplay Marketplace')
    .setDefaultMemberPermissions(PermissionFlagsBits.Administrator),
  new SlashCommandBuilder().setName('userinfo').setDescription('Display full user and Roblox account details')
    .addUserOption(o => o.setName('user').setDescription('Target user')),
  new SlashCommandBuilder().setName('avatar').setDescription('Display avatar of a user')
    .addUserOption(o => o.setName('user').setDescription('Target user')),
  new SlashCommandBuilder().setName('ping').setDescription('Check bot heartbeat latency and database response time'),
  new SlashCommandBuilder().setName('membercount').setDescription('Quick breakdown of total members, bots, and online users'),
  new SlashCommandBuilder().setName('botinfo').setDescription('Display bot system specifications, uptime, memory usage, and Node version'),
  new SlashCommandBuilder().setName('roleinfo').setDescription('Inspect detailed permissions and configuration for a Discord role')
    .addRoleOption(o => o.setName('role').setDescription('Target role').setRequired(true)),
  new SlashCommandBuilder().setName('channelinfo').setDescription('Inspect channel details, slowmode, and limits')
    .addChannelOption(o => o.setName('channel').setDescription('Target channel').setRequired(true)),
  new SlashCommandBuilder().setName('poll').setDescription('Create an official Los Angeles Roleplay community poll embed')
    .addStringOption(o => o.setName('question').setDescription('Poll question').setRequired(true)),
  new SlashCommandBuilder().setName('suggest').setDescription('Submit a community or server suggestion to the review channel')
    .addStringOption(o => o.setName('idea').setDescription('Your suggestion').setRequired(true)),
  new SlashCommandBuilder().setName('bugreport').setDescription('Report an in-game or Discord bug directly to management')
    .addStringOption(o => o.setName('details').setDescription('Detailed bug description').setRequired(true)),
  new SlashCommandBuilder().setName('remind').setDescription('Set a personal reminder')
    .addStringOption(o => o.setName('time').setDescription('Time (e.g. 10m, 2h, 1d)').setRequired(true))
    .addStringOption(o => o.setName('message').setDescription('Reminder note').setRequired(true)),
  new SlashCommandBuilder().setName('uptime').setDescription('Display continuous system uptime since last reboot'),
  new SlashCommandBuilder().setName('whois').setDescription('Lookup Roblox profile information via Roblox username')
    .addStringOption(o => o.setName('username').setDescription('Roblox username').setRequired(true)),
  new SlashCommandBuilder().setName('say').setDescription('Broadcast an official management announcement embed')
    .addStringOption(o => o.setName('message').setDescription('Announcement message').setRequired(true)),
  new SlashCommandBuilder().setName('credits').setDescription('Display system credits, architecture info, and lead developer Carlos473')
];

(async () => {
  try {
    console.log(`Starting deployment of ${commandDefinitions.length}/100 registered slash commands...`);
    const rest = new REST({ version: '10' }).setToken(process.env.TOKEN);

    await rest.put(
      Routes.applicationGuildCommands(process.env.CLIENT_ID, process.env.GUILD_ID),
      { body: commandDefinitions.map(c => c.toJSON()) }
    );

    console.log(`Successfully registered all ${commandDefinitions.length} slash commands.`);
  } catch (error) {
    console.error('Command deployment error:', error);
  }
})();
