const Database = require('better-sqlite3');
const fs = require('fs');
const path = require('path');
require('dotenv').config();

const dbPath = process.env.DATABASE_PATH || './database/larp.sqlite';
const dir = path.dirname(dbPath);
if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });

const db = new Database(dbPath);
if (process.env.SQLITE_WAL === 'true') {
  db.pragma('journal_mode = WAL');
}
db.pragma('foreign_keys = ON');

const schemaPath = path.join(__dirname, 'schema.sql');
if (fs.existsSync(schemaPath)) {
  const schema = fs.readFileSync(schemaPath, 'utf8');
  db.exec(schema);
}

// Seed default AI config if not present
const configCount = db.prepare('SELECT COUNT(*) as count FROM ai_config').get();
if (configCount.count === 0) {
  db.prepare(`
    INSERT INTO ai_config (id, bot_name, footer_text, staff_paged_status, model, enabled, system_instructions)
    VALUES (
      1,
      'Assistant AI',
      'Powered by Los Angeles Roleplay · Assistant AI · A staff member can take over at any time',
      'Support Team Paged 🔔',
      'llama-3.3-70b-versatile',
      1,
      'You are the official Assistant AI for Los Angeles Roleplay (LARP). Provide concise, polite, professional support.'
    )
  `).run();
}

// Seed default knowledge base entries
const kbCount = db.prepare('SELECT COUNT(*) as count FROM ai_knowledge_base').get();
if (kbCount.count === 0) {
  const seedFaqs = [
    {
      topic: 'Staff Application Guide',
      keywords: 'apply, staff application, join staff, become staff, mod application, moderator',
      content: 'To apply for staff in Los Angeles Roleplay, navigate to the #applications channel, select "Staff Application" from the dropdown, and complete the 15-question private channel questionnaire within 30 minutes. Requirements: You must be 13 years or older, have a valid Roblox account, and answer in your own words (AI-generated answers are automatically screened and disqualified by Sapling AI).'
    },
    {
      topic: 'Staff Reinstatement Policy',
      keywords: 'reinstate, reinstatement, 30 days, reapply, come back to staff, resign',
      content: 'Yes, the staff reinstatement cooldown is strictly 30 days from the date of your voluntary resignation or inactivity leave. If you left in good standing and at least 30 days have elapsed, open an Assistance Ticket to submit your reinstatement request to the Directive Team.'
    },
    {
      topic: 'Robux Marketplace & Store',
      keywords: 'market, marketplace, robux, donate, donation, paid ad, advertisement, sponsored giveaway, purchase',
      content: 'We only accept Robux payments; real-world currency is not accepted. Sponsored Giveaways cost R$ 500 (prize must be >R$ 500 or $5 value). Paid Advertisements cost R$ 350. Donations are accepted in R$ 500, R$ 1000, R$ 1500, and R$ 2000 tiers and grant the Donator role. All sales are final with no refunds.'
    },
    {
      topic: 'Banned Items & Prohibited RP',
      keywords: 'banned items, banned guns, banned vehicles, rules, prohibited, rdm, vdm, nlr, fear rp',
      content: 'Banned items include military-grade explosive weapons and rocket launchers, unrealistic troll avatar packages, and flying vehicles without authorization. Strictly prohibited roleplays: Terrorism, suicide RP, ERP/NSFW scenes, and unauthorized police corruption. Standard ER:LC rules enforce NLR (New Life Rule), No RDM/VDM, and FearRP.'
    },
    {
      topic: 'Departments & Law Enforcement',
      keywords: 'lapd, lasd, chp, lafd, fbi, departments, join police, sheriff, fire',
      content: 'Los Angeles Roleplay features LAPD (Los Angeles Police Dept), LASD (Los Angeles County Sheriff Dept), CHP (California Highway Patrol), LAFD (Los Angeles Fire Dept), and FBI. Each department holds public tryouts and application cycles posted in the server.'
    }
  ];

  const insertKb = db.prepare('INSERT INTO ai_knowledge_base (topic, keywords, content) VALUES (?, ?, ?)');
  for (const faq of seedFaqs) {
    insertKb.run(faq.topic, faq.keywords, faq.content);
  }
}

module.exports = db;
