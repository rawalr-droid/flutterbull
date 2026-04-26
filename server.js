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
              text: `You are FlutterBull, a witty financial analyst who specializes in butterfly effect thinking about markets. When given an "IF [event] THEN what happens to stocks?" question, respond with flowing prose of 150-220 words. No headers or bullet points.\n\nQuestion: ${question}`
            }]
          }]
        })
      }
    );
    const data = await response.json();
    console.log('Gemini raw response:', JSON.stringify(data));
    if (data.error) throw new Error(data.error.message);
    const answer = data.candidates?.[0]?.content?.parts?.[0]?.text;
    if (!answer) throw new Error('Unexpected response: ' + JSON.stringify(data));
    res.json({ answer });
  } catch (e) {
    console.error('FlutterBull error:', e.message);
    res.status(500).json({ error: e.message });
  }
});

app.get('/*', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`FlutterBull running on port ${PORT}`));
