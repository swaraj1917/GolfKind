import {
  createMonthlyDraw,
  simulateMonthlyDraw,
  finalizeDraw,
} from './drawEngineService'

import { supabase } from '../lib/supabase'

export async function getAllUsers() {
  const { data, error } = await supabase
    .from('profiles')
    .select('*')
    .order('created_at', { ascending: false })

  if (error) throw error

  return data
}

export async function getAllSubscriptions() {
  const { data, error } = await supabase
    .from('subscriptions')
    .select('*')
    .order('created_at', { ascending: false })

  if (error) throw error

  return data
}

export async function getAllCharities() {
  const { data, error } = await supabase
    .from('charities')
    .select('*')
    .order('created_at', { ascending: false })

  if (error) throw error

  return data
}

export async function createCharity(
  name: string,
  description: string,
  imageUrl: string,
  websiteUrl: string,
  upcomingEvent: string,
  isFeatured: boolean,
) {
  const { data, error } = await supabase
    .from('charities')
    .insert({
      name,
      description,
      image_url: imageUrl || null,
      website_url: websiteUrl || null,
      upcoming_event: upcomingEvent || null,
      is_featured: isFeatured,
      is_active: true,
    })
    .select()
    .single()

  if (error) throw error

  return data
}

export async function updateCharityStatus(
  charityId: string,
  isActive: boolean,
) {
  const { data, error } = await supabase
    .from('charities')
    .update({
      is_active: isActive,
      updated_at: new Date().toISOString(),
    })
    .eq('id', charityId)
    .select()
    .single()

  if (error) throw error

  return data
}

export async function createDraw(
  drawMonth: string,
  drawType: 'random' | 'algorithmic',
  winningNumbers: number[],
  subscriberCount: number,
  totalPrizePool: number,
  jackpotRollover: number,
) {
  const { data, error } = await supabase
    .from('draws')
    .insert({
      draw_month: drawMonth,
      draw_type: drawType,
      status: 'draft',
      winning_numbers: winningNumbers,
      subscriber_count: subscriberCount,
      total_prize_pool: totalPrizePool,
      jackpot_rollover: jackpotRollover,
    })
    .select()
    .single()

  if (error) throw error

  return data
}

export async function publishDraw(drawId: string) {
  const { data, error } = await supabase
    .from('draws')
    .update({
      status: 'published',
      published_at: new Date().toISOString(),
    })
    .eq('id', drawId)
    .select()
    .single()

  if (error) throw error

  return data
}

export async function getAllDraws() {
  const { data, error } = await supabase
    .from('draws')
    .select('*')
    .order('draw_month', { ascending: false })

  if (error) throw error

  return data
}

export async function getAllWinners() {
  const { data, error } = await supabase
    .from('winners')
    .select('*')
    .order('created_at', { ascending: false })

  if (error) throw error

  return data
}

export async function updateWinnerVerification(
  winnerId: string,
  verificationStatus: 'approved' | 'rejected',
) {
  const { data, error } = await supabase
    .from('winners')
    .update({
      verification_status: verificationStatus,
      updated_at: new Date().toISOString(),
    })
    .eq('id', winnerId)
    .select()
    .single()

  if (error) throw error

  return data
}

export async function markWinnerPaid(winnerId: string) {
  const { data, error } = await supabase
    .from('winners')
    .update({
      payment_status: 'paid',
      updated_at: new Date().toISOString(),
    })
    .eq('id', winnerId)
    .select()
    .single()

  if (error) throw error

  return data
}

export function generateWinningNumbers() {
  const numbers: number[] = []

  while (numbers.length < 5) {
    const number =
      Math.floor(Math.random() * 45) + 1

    if (!numbers.includes(number)) {
      numbers.push(number)
    }
  }

  return numbers.sort((a, b) => a - b)
}

export function calculatePrizePool(
  subscriberCount: number,
  monthlyContribution = 8,
) {
  return subscriberCount * monthlyContribution
}

export function calculatePrizeDistribution(
  totalPool: number,
) {
  return {
    fiveMatch: totalPool * 0.4,
    fourMatch: totalPool * 0.35,
    threeMatch: totalPool * 0.25,
  }
}

/* -------------------------------------------------------
   DRAW ENGINE ADMIN FUNCTIONS
------------------------------------------------------- */

export async function simulateDraw(
  drawType: 'random' | 'algorithmic',
  drawMonth: string,
) {
  return simulateMonthlyDraw(
    drawType,
    drawMonth,
  )
}

export async function createAdminDraw(
  drawType: 'random' | 'algorithmic',
  drawMonth: string,
  winningNumbers?: number[],
) {
  return createMonthlyDraw(
    drawType,
    drawMonth,
    winningNumbers,
  )
}

export async function finalizeAdminDraw(
  drawId: string,
) {
  return finalizeDraw(drawId)
}