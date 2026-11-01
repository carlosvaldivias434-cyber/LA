PRAGMA foreign_keys = ON;

CREATE TABLE IF NOT EXISTS users (
  discord_id TEXT PRIMARY KEY,
  roblox_id TEXT,
  roblox_username TEXT,
  verified_at DATETIME
);

CREATE TABLE IF NOT EXISTS staff_profiles (
  discord_id TEXT PRIMARY KEY,
  rank TEXT NOT NULL,
  points INTEGER DEFAULT 0,
  strikes INTEGER DEFAULT 0,
  warnings INTEGER DEFAULT 0,
  suspended INTEGER DEFAULT 0,
  notes TEXT,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS infractions (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  user_id TEXT NOT NULL,
  issuer_id TEXT NOT NULL,
  type TEXT NOT NULL,
  reason TEXT NOT NULL,
  appealable INTEGER DEFAULT 1,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS promotions (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  user_id TEXT NOT NULL,
  promoter_id TEXT NOT NULL,
  old_rank TEXT,
  new_rank TEXT NOT NULL,
  reason TEXT NOT NULL,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS staff_feedback (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  staff_id TEXT NOT NULL,
  reviewer_id TEXT NOT NULL,
  rating INTEGER NOT NULL CHECK (rating BETWEEN 1 AND 5),
  reason TEXT NOT NULL,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS applications (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  applicant_id TEXT NOT NULL,
  type TEXT NOT NULL,
  channel_id TEXT,
  answers TEXT,
  status TEXT DEFAULT 'PENDING',
  reviewer_id TEXT,
  sapling_ai_score REAL DEFAULT 0,
  sapling_flagged INTEGER DEFAULT 0,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS tickets (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  ticket_number INTEGER UNIQUE NOT NULL,
  creator_id TEXT NOT NULL,
  channel_id TEXT UNIQUE NOT NULL,
  category TEXT NOT NULL,
  claimed_by TEXT,
  status TEXT DEFAULT 'OPEN',
  inquiry TEXT,
  groq_ai_answered INTEGER DEFAULT 0,
  ai_autopilot INTEGER DEFAULT 1,
  human_requested INTEGER DEFAULT 0,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  closed_at DATETIME
);

CREATE TABLE IF NOT EXISTS ticket_messages (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  ticket_id INTEGER NOT NULL,
  author_id TEXT NOT NULL,
  author_tag TEXT NOT NULL,
  content TEXT,
  attachments TEXT,
  timestamp DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (ticket_id) REFERENCES tickets(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS trainings (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  trainer_id TEXT NOT NULL,
  type TEXT NOT NULL,
  status TEXT DEFAULT 'SCHEDULED',
  scheduled_for TEXT,
  game_link TEXT,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS training_attendees (
  training_id INTEGER NOT NULL,
  user_id TEXT NOT NULL,
  status TEXT DEFAULT 'REGISTERED',
  notes TEXT,
  PRIMARY KEY (training_id, user_id),
  FOREIGN KEY (training_id) REFERENCES trainings(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS giveaways (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  message_id TEXT UNIQUE NOT NULL,
  channel_id TEXT NOT NULL,
  prize TEXT NOT NULL,
  winners_count INTEGER DEFAULT 1,
  ends_at INTEGER NOT NULL,
  ended INTEGER DEFAULT 0
);

CREATE TABLE IF NOT EXISTS giveaway_entries (
  giveaway_id INTEGER NOT NULL,
  user_id TEXT NOT NULL,
  PRIMARY KEY (giveaway_id, user_id),
  FOREIGN KEY (giveaway_id) REFERENCES giveaways(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS saved_playlists (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  user_id TEXT NOT NULL,
  name TEXT NOT NULL,
  tracks TEXT NOT NULL,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(user_id, name)
);

CREATE TABLE IF NOT EXISTS guild_settings (
  key TEXT PRIMARY KEY,
  value TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS ai_config (
  id INTEGER PRIMARY KEY CHECK (id = 1),
  bot_name TEXT DEFAULT 'Assistant AI',
  footer_text TEXT DEFAULT 'Powered by Los Angeles Roleplay · Assistant AI · A staff member can take over at any time',
  staff_paged_status TEXT DEFAULT 'Support Team Paged 🔔',
  model TEXT DEFAULT 'llama-3.3-70b-versatile',
  enabled INTEGER DEFAULT 1,
  system_instructions TEXT DEFAULT 'You are the official Assistant AI for Los Angeles Roleplay (LARP). Provide accurate, concise, professional answers based on server rules and policies. Always remind users that human staff can take over if needed.'
);

CREATE TABLE IF NOT EXISTS ai_knowledge_base (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  topic TEXT NOT NULL,
  keywords TEXT NOT NULL,
  content TEXT NOT NULL,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);
