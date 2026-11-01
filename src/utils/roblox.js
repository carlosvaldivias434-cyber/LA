const { fetch } = require('undici');

function generateVerificationCode(userId) {
  const words = ['angel', 'sunset', 'hollywood', 'venice', 'metro', 'pacific', 'beverly', 'roleplay', 'carlos'];
  const randWord = words[Math.floor(Math.random() * words.length)];
  const randNum = Math.floor(1000 + Math.random() * 9000);
  return `LARP-${randWord}-${randNum}-${userId.slice(-4)}`;
}

async function getRobloxUserByUsername(username) {
  try {
    const res = await fetch('https://users.roblox.com/v1/usernames/users', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ usernames: [username], excludeBannedUsers: false })
    });
    const data = await res.json();
    return data.data && data.data.length > 0 ? data.data[0] : null;
  } catch {
    return null;
  }
}

async function verifyRobloxProfileCode(robloxId, expectedCode) {
  try {
    const res = await fetch(`https://users.roblox.com/v1/users/${robloxId}`);
    const data = await res.json();
    if (!data || !data.description) return false;
    return data.description.includes(expectedCode);
  } catch {
    return false;
  }
}

module.exports = {
  generateVerificationCode,
  getRobloxUserByUsername,
  verifyRobloxProfileCode
};
