import { supabase } from '../lib/supabase'

export interface GolfScore {
  id: string
  user_id: string
  score: number
  played_at: string
  created_at: string
  updated_at: string
}

export async function getUserScores(userId: string) {
  const { data, error } = await supabase
    .from('scores')
    .select('*')
    .eq('user_id', userId)
    .order('played_at', { ascending: false })

  if (error) {
    throw error
  }

  return data as GolfScore[]
}

export async function addScore(
  userId: string,
  score: number,
  playedAt: string,
) {
  if (score < 1 || score > 45) {
    throw new Error('Stableford score must be between 1 and 45.')
  }

  const { data: existingScore, error: existingError } = await supabase
    .from('scores')
    .select('id')
    .eq('user_id', userId)
    .eq('played_at', playedAt)
    .maybeSingle()

  if (existingError) {
    throw existingError
  }

  if (existingScore) {
    throw new Error('You already have a score for this date.')
  }

  const { data, error } = await supabase
    .from('scores')
    .insert({
      user_id: userId,
      score,
      played_at: playedAt,
    })
    .select()
    .single()

  if (error) {
    throw error
  }

  const { data: allScores, error: fetchError } = await supabase
    .from('scores')
    .select('id, played_at')
    .eq('user_id', userId)
    .order('played_at', { ascending: false })

  if (fetchError) {
    throw fetchError
  }

  if (allScores.length > 5) {
    const oldestScores = allScores.slice(5)

    const oldestIds = oldestScores.map((item) => item.id)

    const { error: deleteError } = await supabase
      .from('scores')
      .delete()
      .in('id', oldestIds)

    if (deleteError) {
      throw deleteError
    }
  }

  return data as GolfScore
}

export async function updateScore(
  scoreId: string,
  score: number,
  playedAt: string,
) {
  if (score < 1 || score > 45) {
    throw new Error('Stableford score must be between 1 and 45.')
  }

  const { data, error } = await supabase
    .from('scores')
    .update({
      score,
      played_at: playedAt,
      updated_at: new Date().toISOString(),
    })
    .eq('id', scoreId)
    .select()
    .single()

  if (error) {
    throw error
  }

  return data as GolfScore
}

export async function deleteScore(scoreId: string) {
  const { error } = await supabase
    .from('scores')
    .delete()
    .eq('id', scoreId)

  if (error) {
    throw error
  }
}