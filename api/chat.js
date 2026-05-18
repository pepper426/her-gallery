export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  try {
    const { system, messages = [] } = req.body;
    const aiMessages = [];

    if (system) aiMessages.push({ role: 'system', content: system });
    for (const msg of messages) aiMessages.push({ role: msg.role, content: msg.content });

    const apiKey = process.env.ZHIPU_API_KEY;
    const url = 'https://open.bigmodel.cn/api/paas/v4/chat/completions';

    const response = await fetch(url, {
      method: 'POST',
      headers: { 
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json' 
      },
      body: JSON.stringify({
        model: 'glm-4-flash', 
        messages: aiMessages,
        temperature: 0.7
      }),
    });

    const data = await response.json();
    
    if (data.error) {
      return res.status(200).json({ content: [{ type: 'text', text: 'API报错: ' + JSON.stringify(data.error) }] });
    }

    const text = data.choices?.[0]?.message?.content || '抱歉，没有返回内容。';
    res.status(200).json({ content: [{ type: 'text', text: text }] });

  } catch (error) {
    res.status(500).json({ content: [{ type: 'text', text: '后端网络错误，请重试。' }] });
  }
}
