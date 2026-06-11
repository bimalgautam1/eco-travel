const aiService = require('../services/aiService');
const Travel = require('../models/Travel');

// ─────────────────────────────────────────────
// Helper: safely load authenticated user's trips
// ─────────────────────────────────────────────
async function getUserHistory(userId) {
  if (!userId) return [];
  try {
    const rows = await Travel.findAll({
      where: { userId },
      order: [['createdAt', 'DESC']],
      limit: 12,
    });
    return rows.map((r) => r.dataValues);
  } catch (_) {
    return [];
  }
}

// ─────────────────────────────────────────────
// POST /api/ai/chat  — streaming SSE endpoint
// ─────────────────────────────────────────────
exports.chat = async (req, res) => {
  const { messages, context = {} } = req.body;

  if (!Array.isArray(messages) || messages.length === 0) {
    return res.status(400).json({ error: 'No messages provided.' });
  }

  // Enrich context with travel history when user is logged in
  const travelHistory = await getUserHistory(req.user?.id);
  const enrichedContext = { ...context, travelHistory };

  // Set SSE headers
  res.setHeader('Content-Type', 'text/event-stream');
  res.setHeader('Cache-Control', 'no-cache');
  res.setHeader('Connection', 'keep-alive');
  res.setHeader('X-Accel-Buffering', 'no'); // Disable nginx buffering

  try {
    const stream = await aiService.streamChat(messages, enrichedContext);

    for await (const chunk of stream) {
      const text = chunk.choices[0]?.delta?.content || '';
      if (text) {
        res.write(`data: ${JSON.stringify({ text })}\n\n`);
      }
    }

    res.write('data: [DONE]\n\n');
    res.end();
  } catch (err) {
    console.error('[AIController] streamChat error:', err.message);
    res.write(`data: ${JSON.stringify({ error: 'AI service unavailable.' })}\n\n`);
    res.end();
  }
};

// ─────────────────────────────────────────────────────────────────
// GET /api/ai/recommend  — personalized "Today's Smart Pick" card
// ─────────────────────────────────────────────────────────────────
exports.recommend = async (req, res) => {
  const { city = 'Delhi', aqi } = req.query;
  const userId = req.user?.id;

  const history = await getUserHistory(userId);

  // Aggregate: find favourite mode and CO₂ saved
  const modeCounts = {};
  let totalCO2Saved = 0;

  history.forEach((t) => {
    modeCounts[t.mode] = (modeCounts[t.mode] || 0) + 1;
    totalCO2Saved += parseFloat(t.co2Saved || 0);
  });

  const sortedModes = Object.entries(modeCounts).sort((a, b) => b[1] - a[1]);
  const favouriteMode = sortedModes[0]?.[0] || 'metro';
  const aqiNum = parseInt(aqi, 10) || 0;

  const historySnippet = history.length
    ? history
        .slice(0, 4)
        .map((t) => `${t.mode} (${t.distance} km, ₹${t.cost}, ${t.co2} kg CO₂)`)
        .join(', ')
    : 'no prior trips';

  const prompt = `
The user lives in ${city}. Current outdoor AQI is ${aqiNum || 'unknown'}.
Their most used commute mode is "${favouriteMode}".
They have saved ${totalCO2Saved.toFixed(2)} kg of CO₂ across ${history.length} logged trips.
Recent trips: ${historySnippet}.

${aqiNum > 150 ? '⚠️ AQI is unhealthy (>150). Strongly advise against outdoor cycling or walking.' : ''}
${aqiNum > 100 && aqiNum <= 150 ? '⚠️ AQI is moderate (100–150). Sensitive groups should avoid prolonged outdoor activity.' : ''}

Suggest ONE specific commute mode for today with a concise 2-sentence reason (max 40 words total). 
Start with the mode name in bold like "**Metro**:" or "**Bus**:".
`;

  const systemPrompt =
    'You are EcoRoute AI, a friendly Indian smart commute advisor. Be specific, warm, and brief. Prioritize eco-friendly options.';

  try {
    const recommendation = await aiService.complete(prompt, systemPrompt, 120);
    return res.json({
      recommendation,
      favouriteMode,
      totalCO2Saved: parseFloat(totalCO2Saved.toFixed(3)),
      tripCount: history.length,
      city,
      aqi: aqiNum,
    });
  } catch (err) {
    console.error('[AIController] recommend error:', err.message);
    return res.status(500).json({ error: 'AI recommendation service unavailable.' });
  }
};

// ─────────────────────────────────────────────────────────────────
// POST /api/ai/carbon-story  — vivid eco impact narrative
// ─────────────────────────────────────────────────────────────────
exports.carbonStory = async (req, res) => {
  const { mode, distance, co2, co2Saved, city } = req.body;

  if (!mode || distance === undefined || co2Saved === undefined) {
    return res.status(400).json({ error: 'Required: mode, distance, co2Saved.' });
  }

  const co2SavedNum = parseFloat(co2Saved);
  const co2Num = parseFloat(co2);
  const distNum = parseFloat(distance);

  // Derived equivalents
  const treeDays = Math.round(co2SavedNum / 0.060); // tree absorbs ~22kg/yr ≈ 0.06kg/day
  const kmAvoided = (co2SavedNum / 0.21).toFixed(1); // avg petrol car ~210g/km
  const lightBulbHours = Math.round((co2SavedNum / 0.0005)); // ~0.5g per Wh

  const prompt = `
The user just took a "${mode}" for ${distNum} km in ${city || 'India'}.
They emitted only ${co2Num} kg CO₂ and SAVED ${co2SavedNum} kg CO₂ compared to a solo petrol car.
Equivalents: ${treeDays} tree-days of CO₂ absorption, ${kmAvoided} km of car driving avoided, ${lightBulbHours} LED bulb-hours of power.

Write ONE vivid, celebratory sentence (max 35 words) about this eco win.
- Use a nature or planet metaphor.
- Make it emotionally resonant.
- Mention the specific mode ("metro", "bus", "walk", etc.) naturally.
- Start with an emoji.
`;

  const systemPrompt =
    'You are EcoRoute AI. Write warm, creative, celebratory eco impact messages. No disclaimers. No hashtags. Just one powerful sentence.';

  try {
    const story = await aiService.complete(prompt, systemPrompt, 80);
    return res.json({
      story,
      treeDays,
      kmAvoided,
      lightBulbHours,
      co2Saved: co2SavedNum,
      mode,
    });
  } catch (err) {
    console.error('[AIController] carbonStory error:', err.message);
    return res.status(500).json({ error: 'AI story service unavailable.' });
  }
};
