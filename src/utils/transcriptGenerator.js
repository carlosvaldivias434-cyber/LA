function generateHtmlTranscript(ticket, messages) {
  const renderedMessages = messages.map(m => `
    <div class="message">
      <div class="meta">
        <span class="author">${escapeHtml(m.author_tag)}</span>
        <span class="time">${new Date(m.timestamp).toLocaleString()}</span>
      </div>
      <div class="content">${escapeHtml(m.content || '')}</div>
      ${m.attachments ? `<div class="attachment"><a href="${escapeHtml(m.attachments)}" target="_blank">Attachment: ${escapeHtml(m.attachments)}</a></div>` : ''}
    </div>
  `).join('');

  return `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <title>Ticket #${ticket.ticket_number} Transcript — Los Angeles Roleplay</title>
  <style>
    body { background-color: #202225; color: #dcddde; font-family: 'Whitney', 'Helvetica Neue', Helvetica, Arial, sans-serif; margin: 0; padding: 20px; }
    .header { border-bottom: 2px solid #2f3136; padding-bottom: 15px; margin-bottom: 20px; }
    .header h1 { color: #ffffff; margin: 0 0 10px 0; font-size: 24px; }
    .info { color: #b9bbbe; font-size: 14px; line-height: 1.6; }
    .message { margin-bottom: 15px; padding: 10px; background: #2f3136; border-radius: 6px; }
    .meta { margin-bottom: 5px; }
    .author { font-weight: bold; color: #00b0f4; margin-right: 10px; }
    .time { font-size: 11px; color: #72767d; }
    .content { font-size: 14px; white-space: pre-wrap; word-break: break-word; }
    .attachment a { color: #00aff4; text-decoration: underline; font-size: 13px; }
  </style>
</head>
<body>
  <div class="header">
    <h1>Los Angeles Roleplay — Assistance Transcript</h1>
    <div class="info">
      <strong>Ticket:</strong> #${ticket.ticket_number}<br>
      <strong>Category:</strong> ${escapeHtml(ticket.category)}<br>
      <strong>Creator ID:</strong> ${ticket.creator_id}<br>
      <strong>Claimed By:</strong> ${ticket.claimed_by || 'Unclaimed'}<br>
      <strong>Opened:</strong> ${ticket.created_at}<br>
      <strong>Closed:</strong> ${new Date().toLocaleString()}
    </div>
  </div>
  <div class="chat-log">
    ${renderedMessages}
  </div>
</body>
</html>
  `;
}

function escapeHtml(str) {
  if (!str) return '';
  return str.replace(/[&<>'"]/g, tag => ({
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    "'": '&#39;',
    '"': '&quot;'
  }[tag] || tag));
}

module.exports = { generateHtmlTranscript };
