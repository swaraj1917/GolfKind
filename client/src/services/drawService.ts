import { supabase } from '../lib/supabase'

export interface Draw {
  id: string
  draw_month: string
  draw_type: 'random' | 'algorithmic'
  status: 'draft' | 'simulated' | 'published'
  winning_numbers: number[]
  subscriber_count: number
  total_prize_pool: number
  jackpot_rollover: number
  published_at: string | null
}

export interface Prize {
  id: string
  draw_id: string
  match_type: 3 | 4 | 5
  pool_percentage: number
  pool_amount: number
  winner_count: number
  prize_per_winner: number
  rollover_amount: number
}

export async function getPublishedDraws() {
  const { data, error } = await supabase
    .from('draws')
    .select('*')
    .eq('status', 'published')
    .order('draw_month', { ascending: false })

  if (error) {
    throw error
  }

  return data as Draw[]
}

export async function getLatestPublishedDraw() {
  const { data, error } = await supabase
    .from('draws')
    .select('*')
    .eq('status', 'published')
    .order('draw_month', { ascending: false })
    .limit(1)
    .maybeSingle()

  if (error) {
    throw error
  }

  return data as Draw | null
}

export async function getLatestOpenDraw() {
  const { data, error } = await supabase
    .from('draws')
    .select('*')
    .in('status', ['draft', 'simulated'])
    .order('draw_month', { ascending: false })
    .limit(1)
    .maybeSingle()

  if (error) {
    throw error
  }

  return data as Draw | null
}

export async function getDrawPrizes(drawId: string) {
  const { data, error } = await supabase
    .from('prizes')
    .select('*')
    .eq('draw_id', drawId)
    .order('match_type', { ascending: false })

  if (error) {
    throw error
  }

  return data as Prize[]
}

export function generateWinningNumbers() {
  const numbers: number[] = []

  while (numbers.length < 5) {
    const number = Math.floor(Math.random() * 45) + 1

    if (!numbers.includes(number)) {
      numbers.push(number)
    }
  }

  return numbers.sort((a, b) => a - b)
}

export function calculatePrizePool(
  subscriberCount: number,
  monthlyPrizeContribution = 8,
) {
  return subscriberCount * monthlyPrizeContribution
}

export function calculatePrizeDistribution(totalPool: number) {
  return {
    fiveMatch: totalPool * 0.4,
    fourMatch: totalPool * 0.35,
    threeMatch: totalPool * 0.25,
  }
}

export interface DrawEntry {
  id: string
  draw_id: string
  user_id: string
  numbers: number[]
  created_at: string
}

export async function getUserDrawEntry(
  drawId: string,
  userId: string,
) {
  const { data, error } = await supabase
    .from('draw_entries')
    .select('*')
    .eq('draw_id', drawId)
    .eq('user_id', userId)
    .maybeSingle()

  if (error) {
    throw error
  }

  return data as DrawEntry | null
}

export async function createDrawEntry(
  drawId: string,
  userId: string,
  numbers: number[],
) {
  if (numbers.length !== 5) {
    throw new Error('Please select exactly 5 numbers.')
  }

  const uniqueNumbers = [...new Set(numbers)]

  if (uniqueNumbers.length !== 5) {
    throw new Error('You cannot select the same number more than once.')
  }

  if (uniqueNumbers.some((number) => number < 1 || number > 45)) {
    throw new Error('Draw numbers must be between 1 and 45.')
  }

  const sortedNumbers = [...uniqueNumbers].sort((a, b) => a - b)

  const existingEntry = await getUserDrawEntry(drawId, userId)

  if (existingEntry) {
    throw new Error('You have already submitted your entry for this draw.')
  }

  const { data, error } = await supabase
    .from('draw_entries')
    .insert({
      draw_id: drawId,
      user_id: userId,
      numbers: sortedNumbers,
    })
    .select()
    .single()

  if (error) {
    throw error
  }

  return data as DrawEntry
}