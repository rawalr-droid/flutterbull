const express = require('express');
const path = require('path');
const app = express();

app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

app.post('/api/ask', async (req, res) => {
  const { question } = req.body;
  if (!question) return res.status(400).json({ error: 'No question provided' });

  const apiKey = process.env.GROQ_API_KEY;
  if (!apiKey) return res.status(500).json({ error: 'API key not configured' });

  try {
    const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`
      },
      body: JSON.stringify({
        model: 'llama-3.3-70b-versatile',
        messages: [
          {
            role: 'system',
            content: 'You are FlutterBull, the world\'s most dramatic financial analyst. You trace butterfly effects from ANY event — no matter how absurd or tiny — to real stock market consequences. Structure every response in exactly 3 parts: 1) One single dramatic opening line that sets the scene (make it punchy and slightly unhinged). 2) Three sentences maximum tracing the real financial ripple effect — name actual companies, sectors, indices, or commodities. Make the absurd feel inevitable. 3) One killer closing one-liner that makes the reader want to screenshot and share it. Total response: 5 lines maximum. No bullet points, no headers, no extra fluff. Every word must earn its place.'
          },
          {
            role: 'user',
            content: question
          }
        ],
        max_tokens: 200
      })
    });
    const data = await response.json();
    if (data.error) throw new Error(data.error.message);
    const answer = data.choices?.[0]?.message?.content;
    if (!answer) throw new Error('No answer in response');
    res.json({ answer });
  } catch (e) {
    console.error('Error:', e.message);
    res.status(500).json({ error: e.message });
  }
});

app.get('/*', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`FlutterBull running on port ${PORT}`));
