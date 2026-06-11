const Groq = require('groq-sdk');

const client = new Groq({ apiKey: process.env.GROQ_API_KEY });
const MODEL = (process.env.MODEL || 'llama-3.3-70b-versatile').split(',')[0].trim();

/**
 * Builds the AI system prompt injected with live commute context.
 */
function buildSystemPrompt({ city, distance, aqi, modes, travelHistory } = {}) {
  const historySnippet = Array.isArray(travelHistory) && travelHistory.length
    ? travelHistory
        .slice(0, 6)
        .map(t => `  • ${t.mode} | ${t.source} → ${t.destination} | ${t.distance} km | ₹${t.cost} | ${t.co2} kg CO₂`)
        .join('\n')
    : '  No logged trips yet.';

  const modesSnippet = Array.isArray(modes) && modes.length
    ? modes
        .map(m => `  • ${m.mode}: ₹${m.cost}, ${m.duration} min, ${m.co2} kg CO₂`)
        .join('\n')
    : '  No route data available yet.';

  return `You are EcoRoute AI — a smart green commute assistant for Indian cities.
You help users make eco-friendly, cost-effective, and time-efficient travel decisions.

CURRENT CONTEXT:
- City: ${city || 'Not specified'}
- Route distance: ${distance ? distance + ' km' : 'Not searched yet'}
- AQI: ${aqi || 'Unknown'}
- Available commute modes & estimates:
${modesSnippet}

USER'S RECENT TRIPS:
${historySnippet}

GUIDELINES:
- Be concise (2-4 sentences max per response).
- Use ₹ for Indian Rupees. Reference CO₂ savings when relevant.
- If AQI > 150, warn against cycling or walking outdoors.
- If the user hasn't searched a route yet, encourage them to use the Commute Finder.
- Suggest eco-friendly modes (metro, bus, walk, bike) when appropriate.
- Never hallucinate prices, routes, or API data. Stick to the context above.
- Respond in a friendly, helpful, slightly enthusiastic tone.`;
}

/**
 * Streams a chat response from Groq (SSE-compatible).
 * Returns an async iterable of chunk objects.
 */
async function streamChat(messages, context = {}) {
  const stream = await client.chat.completions.create({
    model: MODEL,
    messages: [
      { role: 'system', content: buildSystemPrompt(context) },
      ...messages,
    ],
    stream: true,
    max_tokens: 512,
    temperature: 0.65,
  });
  return stream;
}

/**
 * Non-streaming single completion for recommendations and stories.
 */
async function complete(userPrompt, systemPrompt, maxTokens = 600) {
  const res = await client.chat.completions.create({
    model: MODEL,
    messages: [
      { role: 'system', content: systemPrompt },
      { role: 'user', content: userPrompt },
    ],
    max_tokens: maxTokens,
    temperature: 0.72,
  });
  return res.choices[0].message.content.trim();
}

module.exports = { streamChat, complete, buildSystemPrompt };
