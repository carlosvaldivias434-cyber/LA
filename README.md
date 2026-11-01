# Los Angeles Roleplay — Assistant AI System

**Lead Developer & System Architect:** Carlos473  
**Application Type:** Assistant AI  
**Target Platform:** Los Angeles Roleplay Discord Community  
**Version:** 1.0.0 (Production Release)  
**Slash Commands:** Exactly 100/100 Fully Implemented  
**Technology Stack:** Node.js 20+, Discord.js v14, SQLite (`better-sqlite3` in WAL mode), Groq LLaMA 3.3 70B, Sapling AI Detection, `@discordjs/voice`, `play-dl`

---

## 🌟 Key Features

1. **Dual-Banner Professional Embeds**:
   - Every embed features dedicated, independently configurable `TOP_BANNER` and `BOTTOM_BANNER` URLs from `.env`.
   - Embed color configured globally via `BOT_COLOR=#37373E`.

2. **100 Rotating Watching/Listening Statuses**:
   - Automatic 30-second cycle through 100 Los Angeles-themed presence activities (LAPD, LASD, CHP, LAFD, SWAT, Music, and Community).

3. **50 Rotating Carlos473 Bot Bios ("About Me")**:
   - Automatic 15-minute rotation of official Discord Application descriptions crediting **Carlos473** and Los Angeles Roleplay, respecting Discord API rate limits.

4. **15-Question Automated Staff Hiring Flow**:
   - Applicants pick "Staff Application" from the `/application-panel` dropdown.
   - A private channel is opened (`app-username`) giving 30 minutes to complete the 15-question interview.
   - Questions are served one-by-one; answers are persistently stored in SQLite.
   - Automatically posts review card with Approve / Deny buttons to the High Rank channel.
   - Generates and delivers the exact formatted Acceptance DM (to @Rajdeep_singh292) or Denial DM (to @Killerman7204).

5. **Assistance Ticket System & HTML Transcripts**:
   - Categories: `General`, `High Rank`, `Department`.
   - Real interactive Claim (Green), Close (Red), and Escalate (Orange) buttons.
   - Upon closing, generates a self-contained, beautiful Dark-Mode HTML transcript and files it in `#ticket-transcripts`.

6. **Original Roblox Profile Code Verification**:
   - Generates unique codes (`LARP-hollywood-4821-1234`).
   - Verifies against public Roblox user profile descriptions via the Roblox API.
   - Automatically synchronizes user nicknames to their verified Roblox username and grants the Verified role.

7. **Advanced Music Streaming Engine**:
   - YouTube searches & direct URLs, Spotify metadata resolution.
   - Interactive `/nowplaying` interface with real-time text progress bar (`01:24 ━━━━━━━━━●━━━━━━ 04:45`).
   - 2 rows of control buttons (⏮️ Previous, ⏯️ Pause/Resume, ⏭️ Skip, ⏹️ Stop, 🔁 Loop, 🔀 Shuffle).

8. **Full Staff Performance & Disciplinary Tracking**:
   - Warnings, strikes, suspensions, terminations, promotions, demotions, and 5-star community feedback (e.g., from @premroblox51 for @Raven).

---

## 🚀 Quick Start Guide

### 1. Prerequisites
- Node.js 20 or higher
- Discord Bot Token with privileged gateway intents enabled:
  - `GuildMembers`
  - `MessageContent`
  - `GuildVoiceStates`

### 2. Configuration
Copy `.env.example` to `.env`:
```bash
cp .env.example .env
```
Fill in your credentials:
- `TOKEN`: Your Discord Bot Token
- `CLIENT_ID`: Your Application Client ID
- `GUILD_ID`: Your Los Angeles Roleplay Server ID
- Desired Channel & Role IDs

### 3. Deploy Slash Commands
Register all 100 slash commands with Discord:
```bash
node deploy-commands.js
```

### 4. Start the Bot
```bash
node index.js
```

---

## 📂 Project Architecture

```
los-angeles-roleplay-bot/
├── index.js                  # Gateway entry, 100 statuses & 50 bios rotation loops
├── deploy-commands.js        # 100 slash command registry script
├── package.json              # Dependencies and scripts
├── .env.example              # Full environment variable configuration template
├── README.md                 # System manual & architecture specification
├── database/
│   ├── db.js                 # better-sqlite3 WAL mode connection
│   ├── schema.sql            # Relational database schema with 14 tables
│   └── larp.sqlite           # SQLite database file (auto-created)
└── src/
    ├── utils/
    │   ├── embedBuilder.js   # Dual-banner branded embed generator
    │   ├── roblox.js         # Roblox API code verification engine
    │   └── transcriptGenerator.js # HTML transcript compiler
    ├── music/
    │   └── musicManager.js   # Audio player, queue manager & progress bar
    └── handlers/
        ├── commandHandler.js # Execution router for all 100 commands
        └── interactionHandler.js # Button, select menu, modal & application logic
```
