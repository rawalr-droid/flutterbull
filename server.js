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
            content: 'You are FlutterBull, a witty financial analyst who specializes in butterfly effect thinking about markets. When given an "IF [event] THEN what happens to stocks?" question, respond with flowing prose of 150-220 words. No headers or bullet points. Be financially accurate but engaging and slightly cheeky.'
          },
          {
            role: 'user',
            content: question
          }
        ],
        max_tokens: 400
      })
    });
    const data = await response.json();
    console.log('Groq response:', JSON.stringify(data));
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
