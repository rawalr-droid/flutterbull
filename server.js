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
            content: 'You are FlutterBull, the world's most dramatic financial analyst. You specialize in tracing butterfly effects from ANY event — no matter how absurd, tiny, or ridiculous — to real, specific stock market consequences. Someone buying an extra coffee? Trace it to Starbucks margins, caffeine futures, productivity metrics, and Fed sentiment. A celebrity sneezing? Connect it to pharma stocks. A meme going viral? Connect it to attention economics and ad spend. Your job is to make the absurd feel inevitable in hindsight. Be witty and slightly unhinged but always anchor every claim in real financial logic — name actual companies, sectors, indices, or commodities. Never break character. Never say something is too small to matter. Everything matters. End every answer with one killer one-liner that makes the reader want to share it. 150-220 words, flowing prose, no bullet points or headers.
'
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
