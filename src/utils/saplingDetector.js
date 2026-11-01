const { fetch } = require('undici');
require('dotenv').config();

/**
 * Sapling AI Writing Detector
 * Scans candidate answers for AI generation (ChatGPT, Claude, etc.)
 * Returns AI probability score (0% - 100%) and flagged boolean.
 */
async function checkAnswersForAI(answers) {
  const apiKey = process.env.SAPLING_API_KEY;

  // Combine long-form answers to get an accurate statistical sample for Sapling
  const combinedText = answers
    .map(a => `${a.question}: ${a.answer}`)
    .join('\n\n');

  if (!apiKey) {
    // If no API key provided, perform heuristic pattern check (typical AI formatting/length)
    const aiPhrases = [
      'as an ai',
      'delve into',
      'furthermore, it is crucial',
      'in conclusion, i believe',
      'crucial aspect of maintaining',
      'paramount importance',
      'foster a welcoming environment'
    ];
    let detectedMatches = 0;
    const lower = combinedText.toLowerCase();
    for (const phrase of aiPhrases) {
      if (lower.includes(phrase)) detectedMatches++;
    }

    const estimatedScore = detectedMatches > 1 ? 0.85 : detectedMatches === 1 ? 0.45 : 0.05;
    return {
      score: estimatedScore,
      percentage: (estimatedScore * 100).toFixed(1),
      isFlagged: estimatedScore >= 0.50,
      source: 'heuristic-local'
    };
  }

  try {
    const res = await fetch('https://api.sapling.ai/api/v1/aidetect', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        key: apiKey,
        text: combinedText
      })
    });

    if (!res.ok) {
      console.error('[Sapling API Error]', res.status, await res.text());
      return { score: 0, percentage: '0.0', isFlagged: false, source: 'error-fallback' };
    }

    const data = await res.json();
    const score = typeof data.score === 'number' ? data.score : 0;
    const percentage = (score * 100).toFixed(1);

    return {
      score,
      percentage,
      isFlagged: score >= 0.50, // Flag if 50%+ likelihood of AI generation
      sentenceScores: data.sentence_scores || [],
      source: 'sapling-api'
    };
  } catch (err) {
    console.error('[Sapling Exception]', err);
    return { score: 0, percentage: '0.0', isFlagged: false, source: 'exception' };
  }
}

module.exports = { checkAnswersForAI };
