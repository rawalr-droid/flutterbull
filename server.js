const express = require('express');
const path = require('path');
const app = express();

app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

app.post('/api/ask', async (req, res) => {
  const { question } = req.body;
  if (!question) return res.status(400).json({ error: 'No question provided' });

  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) return res.status(500).json({ error: 'API key not configured' });

  try {
    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [{
            parts: [{
              text: `You are FlutterBull, a witty financial analyst who specializes in butterfly effect thinking about markets. When given an "IF [event] THEN what happens to stocks?" question, respond with: 1. A punchy 1-sentence summary of the overall market direction. 2. 2-3 short paragraphs covering: immediate market reaction, which sectors get hit or benefit, and one surprising second-order effect most people miss. 3. End with a one-liner that is slightly cheeky but true. Keep it financially accurate but engaging. Use real market logic. Reference actual companies or sectors. Total response: 150-220 words. No headers or bullet points, flowing prose only.\n\nQuestion: ${question}`
            }]
          }]
        })
      }
    );
    const data = await response.json();
    const answer = data.candidates?.[0]?.content?.parts?.[0]?.text;
    if (!answer) throw new Error('No response from Gemini');
    res.json({ answer });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`FlutterBull running on port ${PORT}`));
