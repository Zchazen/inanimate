import { createClient } from '@supabase/supabase-js'
import OpenAI from 'openai'

const supabase = createClient(
  process.env.SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_KEY!
)
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
    const { userId } = req.body

    if (!userId) {
      return res.status(400).json({ error: 'userId is required' })
    }

    // Get user's personality
    const { data: user } = await supabase
      .from('user_profiles')
      .select('personality_summary, personality_traits')
      .eq('id', userId)
      .single()

    if (!user || !user.personality_summary) {
      return res.status(400).json({ error: 'User profile not found or incomplete' })
    }

    // Get user's embedding
    const userEmbedding = await openai.embeddings.create({
      model: "text-embedding-3-small",
      input: user.personality_summary
    })
    const userVector = userEmbedding.data[0].embedding

    // Get all other users
    const { data: allUsers } = await supabase
      .from('user_profiles')
      .select('id, personality_summary')
      .neq('id', userId)
      .eq('onboarded', true)
      .not('personality_summary', 'is', null)

    if (!allUsers || allUsers.length === 0) {
      return res.status(200).json({ matches: [] })
    }

    // Calculate emotional connection scores
    const scores = await Promise.all(
      allUsers.map(async (otherUser) => {
        const otherEmbedding = await openai.embeddings.create({
          model: "text-embedding-3-small",
          input: otherUser.personality_summary
        })
        const otherVector = otherEmbedding.data[0].embedding

        // Cosine similarity
        const dotProduct = userVector.reduce((sum: number, val: number, i: number) => sum + val * otherVector[i], 0)
        const magnitude1 = Math.sqrt(userVector.reduce((sum: number, val: number) => sum + val * val, 0))
        const magnitude2 = Math.sqrt(otherVector.reduce((sum: number, val: number) => sum + val * val, 0))
        const similarity = dotProduct / (magnitude1 * magnitude2)

        // Emotional connection score: balance between similarity and complementarity
        // Use a "sweet spot" formula: peak connection at ~60-75% similarity
        // This captures shared values while maintaining intrigue from differences
        const optimalSimilarity = 0.675 // Sweet spot for emotional connection
        const connectionScore = 1 - Math.abs(similarity - optimalSimilarity) * 2

        // Normalize to 0-1 range
        const normalizedScore = Math.max(0, Math.min(1, connectionScore))

        return { userId: otherUser.id, score: normalizedScore }
      })
    )

    // Get top 3 highest emotional connection scores
    const topMatches = scores.sort((a, b) => b.score - a.score).slice(0, 3)

    // Save matches
    const today = new Date().toISOString().split('T')[0]
    for (const match of topMatches) {
      await supabase.from('matches').upsert({
        user_id: userId,
        matched_user_id: match.userId,
        created_at: today,
        status: 'pending'
      }, {
        onConflict: 'user_id,matched_user_id,created_at'
      })
    }

    res.status(200).json({ matches: topMatches.map(m => m.userId) })
  } catch (error: any) {
    console.error('Error generating matches:', error)
    res.status(500).json({ error: error.message })
  }
}
