export default async function handler(req, res) {
  // 设置允许跨域
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
    const { system, messages = [] } = req.body;
    const aiMessages = [];

    // 载入你的人设
    if (system) {
      aiMessages.push({ 
        role: 'system', 
        content: '你的人设和规则如下，请严格遵守：\n\n' + system 
      });
    }

    // 载入聊天记录
    for (const msg of messages) {
      aiMessages.push({
        role: msg.role === 'user' ? 'user' : 'assistant',
        content: msg.content
      });
    }

    // 调用 DeepSeek
    const apiKey = process.env.DEEPSEEK_API_KEY;
    const url = 'https://api.deepseek.com/chat/completions';

    const response = await fetch(url, {
      method: 'POST',
      headers: { 
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json' 
      },
      body: JSON.stringify({
        model: 'deepseek-chat', 
        messages: aiMessages,
        temperature: 0.7
      }),
    });

    const data = await response.json();
    
    // 如果报错，直接把错误打印出来方便排查
    if (data.error) {
      return res.status(200).json({ content: [{ type: 'text', text: JSON.stringify(data.error) }] });
    }

    const text = data.choices?.[0]?.message?.content || '抱歉，API没有返回内容。';

    res.status(200).json({
      content: [{ type: 'text', text: text }]
    });

  } catch (error) {
    console.error('API Error:', error);
    res.status(500).json({
      content: [{ type: 'text', text: '后端网络抖动了，请重试。' }]
    });
  }
}
