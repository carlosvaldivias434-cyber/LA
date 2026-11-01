const { fetch } = require('undici');
const db = require('../../database/db');
require('dotenv').config();

/**
 * Fetches current AI config from database or defaults
 */
function getAiConfig() {
  try {
    const row = db.prepare('SELECT * FROM ai_config WHERE id = 1').get();
    if (row) return row;
  } catch (e) {
    // fallback if table query fails
  }
  return {
    bot_name: 'Assistant AI',
    footer_text: 'Powered by Los Angeles Roleplay · Assistant AI · A staff member can take over at any time',
    staff_paged_status: 'Support Team Paged 🔔',
    model: process.env.GROQ_MODEL || 'llama-3.3-70b-versatile',
    enabled: 1,
    system_instructions: 'You are the official Assistant AI for Los Angeles Roleplay (LARP). Provide concise, polite, professional support.'
  };
}

/**
 * Fetches all knowledge base FAQs
 */
function getKnowledgeBase() {
  try {
    return db.prepare('SELECT * FROM ai_knowledge_base ORDER BY id ASC').all();
  } catch (e) {
    return [];
  }
}

/**
 * Find best matching knowledge base answer locally
 */
function matchLocalKnowledge(inquiry) {
  const kb = getKnowledgeBase();
  const lower = inquiry.toLowerCase();

  for (const entry of kb) {
    const kws = entry.keywords.split(',').map(k => k.trim().toLowerCase());
    if (kws.some(kw => kw.length > 2 && lower.includes(kw))) {
      return entry;
    }
  }
  return null;
}

/**
 * Check if the user is asking to speak with a real human staff member
 */
function isHumanHandoffRequested(text) {
  if (!text) return false;
  const lower = text.toLowerCase();
  const triggers = [
    'real staff',
    'real person',
    'real human',
    'talk to human',
    'speak to human',
    'need human',
    'need a human',
    'need a real staff',
    'need real staff',
    'need staff',
    'talk to staff',
    'speak to staff',
    'speak with staff',
    'talk with staff',
    'human please',
    'agent please',
    'moderator please',
    'page staff',
    'call staff',
    'live agent',
    'human agent',
    'i need a real'
  ];
  return triggers.some(t => lower.includes(t));
}

/**
 * Groq AI Support Assistant for Tickets
 * Answers user support inquiries instantly in Discord assistance tickets with multi-turn memory.
 */
async function generateGroqTicketResponse(inquiry, ticketCategory, authorTag, history = []) {
  const config = getAiConfig();
  const kb = getKnowledgeBase();
  const matchedEntry = matchLocalKnowledge(inquiry);

  const apiKey = process.env.GROQ_API_KEY;
  if (!apiKey) {
    // Local intelligent response using server knowledge base
    if (matchedEntry) {
      return {
        text: `Hello ${authorTag}! In regard to your question about **${matchedEntry.topic}**:\n\n${matchedEntry.content}`,
        model: 'LARP Knowledge Engine (Local)',
        config
      };
    }

    return {
      text: `Hello ${authorTag}! I have recorded your message: "${inquiry}". Is there anything else about our rules, staff applications, or departments I can help with? (If you need a real staff member, just let me know!)`,
      model: 'system-fallback',
      config
    };
  }

  const model = config.model || process.env.GROQ_MODEL || 'llama-3.3-70b-versatile';

  // Build knowledge context dynamically from database
  const knowledgeSummary = kb.map(k => `[Topic: ${k.topic}]\n${k.content}`).join('\n\n');

  const systemPrompt = `${config.system_instructions}
Roleplay Server: Los Angeles Roleplay (LARP) on ER:LC (Roblox)
Ticket Category: ${ticketCategory}
Applicant/User: ${authorTag}

OFFICIAL SERVER KNOWLEDGE BASE (Strictly follow these facts):
${knowledgeSummary}

Guidelines:
- You are handling this ticket so staff members do not have to do anything unless the user specifically asks for a real staff member.
- Keep the response concise, helpful, and courteous (2-4 sentences max).
- If the user has follow-up questions, continue answering smoothly using the knowledge base.
- If the user asks for a real person or human staff member, inform them that you will page human staff right away.
- Tone: Professional, welcoming, authoritative on Los Angeles Roleplay policies.`;

  const messages = [{ role: 'system', content: systemPrompt }];

  // Inject past turns for multi-turn context
  if (Array.isArray(history) && history.length > 0) {
    for (const h of history.slice(-6)) {
      messages.push({
        role: h.role === 'assistant' ? 'assistant' : 'user',
        content: h.content
      });
    }
  }

  messages.push({ role: 'user', content: inquiry });

  try {
    const res = await fetch('https://api.groq.com/openai/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        model,
        messages,
        temperature: 0.3,
        max_tokens: 300
      })
    });

    if (!res.ok) {
      console.error('[Groq API Error]', res.status, await res.text());
      if (matchedEntry) {
        return {
          text: `Hello ${authorTag}! In regards to **${matchedEntry.topic}**:\n\n${matchedEntry.content}`,
          model: 'LARP Knowledge Base',
          config
        };
      }
      return {
        text: `Hello ${authorTag}! Thank you for reaching out in ${ticketCategory}. A member of our staff team has been paged and will assist you shortly.`,
        model: 'groq-error-fallback',
        config
      };
    }

    const data = await res.json();
    const reply = data.choices && data.choices[0] && data.choices[0].message ? data.choices[0].message.content : null;
    return {
      text: reply || (matchedEntry ? matchedEntry.content : 'A staff member will assist you shortly.'),
      model,
      config
    };
  } catch (err) {
    console.error('[Groq Exception]', err);
    if (matchedEntry) {
      return {
        text: `Hello ${authorTag}! In regards to **${matchedEntry.topic}**:\n\n${matchedEntry.content}`,
        model: 'LARP Knowledge Base',
        config
      };
    }
    return {
      text: 'Our support team has received your ticket and will reply shortly.',
      model: 'error',
      config
    };
  }
}

module.exports = {
  generateGroqTicketResponse,
  isHumanHandoffRequested,
  getAiConfig,
  getKnowledgeBase
};
