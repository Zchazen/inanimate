import OpenAI from 'openai'

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY })

export default async function handler(req: any, res: any) {
  // Set CORS headers for development
  res.setHeader('Access-Control-Allow-Origin', '*')
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS')
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type')

  if (req.method === 'OPTIONS') {
    res.status(200).end()
    return
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  try {
    const { imageUrl } = req.body

    if (!imageUrl) {
      return res.status(400).json({ error: 'imageUrl is required' })
    }

    const response = await openai.chat.completions.create({
      model: "gpt-4-vision-preview",
      messages: [
        {
          role: "user",
          content: [
            {
              type: "text",
              text: `Analyze this object/item and infer personality traits about someone who values this object. Focus on emotional characteristics, values, and how they connect with others.

Consider:
- Emotional depth and expressiveness
- Communication style and openness
- Core values and what drives them
- How they form connections
- Their approach to relationships

Return ONLY valid JSON in this exact format (no markdown, no code blocks):
{"traits": ["trait1", "trait2", "trait3", "trait4", "trait5"], "vibe": "one-word-vibe", "description": "1-sentence description focusing on emotional connection style"}`
            },
            {
              type: "image_url",
              image_url: { url: imageUrl }
            }
          ]
        }
      ],
      max_tokens: 300
    })

    const content = response.choices[0].message.content!
    const analysis = JSON.parse(content)

    res.status(200).json(analysis)
  } catch (error: any) {
    console.error('Error analyzing image:', error)
    res.status(500).json({ error: error.message })
  }
}
