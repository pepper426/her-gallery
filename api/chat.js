export default async function handler(req, res) {
  // 设置 CORS
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { system, messages } = req.body;

    // 把消息转换成 Gemini 格式
    const geminiMessages = [];

    // 系统提示词作为第一条
    if (system) {
      geminiMessages.push({
        role: 'user',
        parts: [{ text: '你的人设和规则如下，请严格遵守：\n\n' + system }]
      });
      geminiMessages.push({
        role: 'model',
        parts: [{ text: '我理解了，我会严格按照这个人设来回答。' }]
      });
    }

    // 转换对话消息
    for (const msg of messages) {
      geminiMessages.push({
        role: msg.role === 'user' ? 'user' : 'model',
        parts: [{ text: msg.content }]
      });
    }

    const apiKey = process.env.GEMINI_API_KEY;
    const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${apiKey}`;

    const response = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: geminiMessages,
        generationConfig: {
          maxOutputTokens: 500,
          temperature: 0.8,
        },
      }),
    });

    const data = await response.json();

    // 把 Gemini 的返回格式转换成前端期望的格式
    const text = data?.candidates?.[0]?.content?.parts?.[0]?.text || '……';

    res.status(200).json({
      content: [{ type: 'text', text: text }]
    });

  } catch (error) {
    console.error('API Error:', error);
    res.status(500).json({
      content: [{ type: 'text', text: '抱歉，我刚才走神了。再说一次？' }]
    });
  }
}
