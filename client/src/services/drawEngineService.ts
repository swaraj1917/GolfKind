import { supabase } from '../lib/supabase'

export type DrawType = 'random' | 'algorithmic'

export interface DrawSimulationResult {
  drawMonth: string
  drawType: DrawType
  winningNumbers: number[]
  subscriberCount: number
  totalPrizePool: number
  entriesCreated: number
}

export interface DrawEntry {
  id: string
  draw_id: string
  user_id: string
  numbers: number[]
}

export interface MatchResult {
  userId: string
  entryId: string
  numbers: number[]
  matchCount: number
}

export interface PrizeCalculation {
  matchType: 3 | 4 | 5
  poolPercentage: number
  poolAmount: number
  winnerCount: number
  prizePerWinner: number
  rolloverAmount: number
}

const MIN_NUMBER = 1
const MAX_NUMBER = 45
const NUMBERS_PER_ENTRY = 5
const MONTHLY_PRIZE_CONTRIBUTION = 8

const FIVE_MATCH_PERCENTAGE = 0.40
const FOUR_MATCH_PERCENTAGE = 0.35
const THREE_MATCH_PERCENTAGE = 0.25

function getMonthStart(date = new Date()) {
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, '0')

  return `${year}-${month}-01`
}

function normalizeDrawMonth(drawMonth?: string) {
  if (!drawMonth) {
    return getMonthStart()
  }

  if (/^\d{4}-\d{2}$/.test(drawMonth)) {
    return `${drawMonth}-01`
  }

  return drawMonth
}

function generateRandomNumbers(): number[] {
  const numbers: number[] = []

  while (numbers.length < NUMBERS_PER_ENTRY) {
    const number =
      Math.floor(
        Math.random() * (MAX_NUMBER - MIN_NUMBER + 1),
      ) + MIN_NUMBER

    if (!numbers.includes(number)) {
      numbers.push(number)
    }
  }

  return numbers.sort((a, b) => a - b)
}

function generateWeightedNumbers(
  scores: number[],
): number[] {
  const frequency = new Map<number, number>()

  for (const score of scores) {
    frequency.set(
      score,
      (frequency.get(score) || 0) + 1,
    )
  }

  const weightedPool: number[] = []

  for (
    let number = MIN_NUMBER;
    number <= MAX_NUMBER;
    number++
  ) {
    const weight = frequency.get(number) || 1

    for (let i = 0; i < weight; i++) {
      weightedPool.push(number)
    }
  }

  const selected: number[] = []

  while (selected.length < NUMBERS_PER_ENTRY) {
    const randomIndex = Math.floor(
      Math.random() * weightedPool.length,
    )

    const number = weightedPool[randomIndex]

    if (!selected.includes(number)) {
      selected.push(number)
    }
  }

  return selected.sort((a, b) => a - b)
}

function generateNumbers(
  drawType: DrawType,
  scores: number[],
): number[] {
  if (drawType === 'algorithmic') {
    return generateWeightedNumbers(scores)
  }

  return generateRandomNumbers()
}

export async function getActiveSubscriberIds() {
  const { data, error } = await supabase
    .from('subscriptions')
    .select('user_id')
    .eq('status', 'active')

  if (error) throw error

  return [
    ...new Set(
      (data || []).map(
        (subscription) => subscription.user_id,
      ),
    ),
  ]
}

export async function getUserLatestScores(
  userId: string,
) {
  const { data, error } = await supabase
    .from('scores')
    .select('score, played_at')
    .eq('user_id', userId)
    .order('played_at', { ascending: false })
    .limit(5)

  if (error) throw error

  return data || []
}

export function generateWinningNumbers(
  drawType: DrawType,
  allScores: number[],
) {
  return generateNumbers(drawType, allScores)
}

/* -------------------------------------------------------
   CREATE MONTHLY DRAW
------------------------------------------------------- */

export async function createMonthlyDraw(
  drawType: DrawType,
  drawMonth = getMonthStart(),
  winningNumbers?: number[],
) {
  const normalizedDrawMonth =
    normalizeDrawMonth(drawMonth)

  const existingDraw = await supabase
    .from('draws')
    .select('id, status')
    .eq('draw_month', normalizedDrawMonth)
    .maybeSingle()

  if (existingDraw.error) {
    throw existingDraw.error
  }

  if (existingDraw.data) {
    throw new Error(
      `A draw already exists for ${normalizedDrawMonth}.`,
    )
  }

  const subscriberIds =
    await getActiveSubscriberIds()

  if (subscriberIds.length === 0) {
    throw new Error(
      'There are no active subscribers for this draw.',
    )
  }

  const allScores: number[] = []

  for (const userId of subscriberIds) {
    const scores =
      await getUserLatestScores(userId)

    for (const item of scores) {
      allScores.push(item.score)
    }
  }

  const finalWinningNumbers =
    winningNumbers?.length === NUMBERS_PER_ENTRY
      ? [...winningNumbers].sort((a, b) => a - b)
      : generateWinningNumbers(
          drawType,
          allScores,
        )

  const totalPrizePool =
    subscriberIds.length *
    MONTHLY_PRIZE_CONTRIBUTION

  const { data: draw, error: drawError } =
    await supabase
      .from('draws')
      .insert({
        draw_month: normalizedDrawMonth,
        draw_type: drawType,
        status: 'simulated',
        winning_numbers: finalWinningNumbers,
        subscriber_count: subscriberIds.length,
        total_prize_pool: totalPrizePool,
        jackpot_rollover: 0,
        simulation_result: {
          generated_at: new Date().toISOString(),
          winning_numbers: finalWinningNumbers,
          subscriber_count: subscriberIds.length,
          total_prize_pool: totalPrizePool,
        },
      })
      .select()
      .single()

  if (drawError) throw drawError

  return {
    draw,
    entries: [],
    subscriberCount: subscriberIds.length,
    totalPrizePool,
    winningNumbers: finalWinningNumbers,
  }
}

/* -------------------------------------------------------
   SIMULATE MONTHLY DRAW
------------------------------------------------------- */

export async function simulateMonthlyDraw(
  drawType: DrawType,
  drawMonth = getMonthStart(),
) {
  const normalizedDrawMonth =
    normalizeDrawMonth(drawMonth)

  const subscriberIds =
    await getActiveSubscriberIds()

  if (subscriberIds.length === 0) {
    throw new Error(
      'There are no active subscribers to simulate a draw.',
    )
  }

  const allScores: number[] = []

  for (const userId of subscriberIds) {
    const scores =
      await getUserLatestScores(userId)

    for (const item of scores) {
      allScores.push(item.score)
    }
  }

  const winningNumbers =
    generateWinningNumbers(
      drawType,
      allScores,
    )

  const totalPrizePool =
    subscriberIds.length *
    MONTHLY_PRIZE_CONTRIBUTION

  return {
    drawMonth: normalizedDrawMonth,
    drawType,
    winningNumbers,
    subscriberCount: subscriberIds.length,
    totalPrizePool,
    entriesCreated: 0,
  } satisfies DrawSimulationResult
}

/* -------------------------------------------------------
   MATCH CALCULATION
------------------------------------------------------- */

export function calculateMatches(
  entryNumbers: number[],
  winningNumbers: number[],
) {
  return entryNumbers.filter((number) =>
    winningNumbers.includes(number),
  ).length
}

export function calculateEntryMatches(
  entries: DrawEntry[],
  winningNumbers: number[],
): MatchResult[] {
  return entries.map((entry) => ({
    userId: entry.user_id,
    entryId: entry.id,
    numbers: entry.numbers,
    matchCount: calculateMatches(
      entry.numbers,
      winningNumbers,
    ),
  }))
}

/* -------------------------------------------------------
   PREVIOUS JACKPOT / ROLLOVER
------------------------------------------------------- */

export async function getPreviousJackpotRollover(
  drawMonth: string,
) {
  const { data, error } = await supabase
    .from('draws')
    .select('jackpot_rollover, draw_month')
    .lt('draw_month', drawMonth)
    .eq('status', 'published')
    .order('draw_month', { ascending: false })
    .limit(1)
    .maybeSingle()

  if (error) throw error

  return Number(data?.jackpot_rollover || 0)
}

/* -------------------------------------------------------
   PRIZE CALCULATION
------------------------------------------------------- */

export function calculatePrizeDistribution(
  totalPrizePool: number,
  jackpotRollover: number,
  matchResults: MatchResult[],
): PrizeCalculation[] {
  const fiveMatchWinners = matchResults.filter(
    (result) => result.matchCount === 5,
  )

  const fourMatchWinners = matchResults.filter(
    (result) => result.matchCount === 4,
  )

  const threeMatchWinners = matchResults.filter(
    (result) => result.matchCount === 3,
  )

  const fiveMatchPool =
    totalPrizePool * FIVE_MATCH_PERCENTAGE

  const fourMatchPool =
    totalPrizePool * FOUR_MATCH_PERCENTAGE

  const threeMatchPool =
    totalPrizePool * THREE_MATCH_PERCENTAGE

  const fiveMatchAvailable =
    fiveMatchPool + jackpotRollover

  const fiveMatchRollover =
    fiveMatchWinners.length === 0
      ? fiveMatchAvailable
      : 0

  const fivePrizePerWinner =
    fiveMatchWinners.length > 0
      ? fiveMatchAvailable /
        fiveMatchWinners.length
      : 0

  const fourPrizePerWinner =
    fourMatchWinners.length > 0
      ? fourMatchPool /
        fourMatchWinners.length
      : 0

  const threePrizePerWinner =
    threeMatchWinners.length > 0
      ? threeMatchPool /
        threeMatchWinners.length
      : 0

  return [
    {
      matchType: 5,
      poolPercentage: 40,
      poolAmount: fiveMatchAvailable,
      winnerCount: fiveMatchWinners.length,
      prizePerWinner: fivePrizePerWinner,
      rolloverAmount: fiveMatchRollover,
    },
    {
      matchType: 4,
      poolPercentage: 35,
      poolAmount: fourMatchPool,
      winnerCount: fourMatchWinners.length,
      prizePerWinner: fourPrizePerWinner,
      rolloverAmount: 0,
    },
    {
      matchType: 3,
      poolPercentage: 25,
      poolAmount: threeMatchPool,
      winnerCount: threeMatchWinners.length,
      prizePerWinner: threePrizePerWinner,
      rolloverAmount: 0,
    },
  ]
}

/* -------------------------------------------------------
   FINALIZE DRAW
------------------------------------------------------- */

export async function finalizeDraw(
  drawId: string,
) {
  const { data: draw, error: drawError } =
    await supabase
      .from('draws')
      .select('*')
      .eq('id', drawId)
      .single()

  if (drawError) throw drawError

  if (!draw) {
    throw new Error('Draw not found.')
  }

  if (draw.status === 'published') {
    throw new Error(
      'This draw has already been published.',
    )
  }

  const { data: entries, error: entriesError } =
    await supabase
      .from('draw_entries')
      .select('*')
      .eq('draw_id', drawId)

  if (entriesError) throw entriesError

  if (!entries || entries.length === 0) {
    throw new Error(
      'This draw has no entries.',
    )
  }

  const matchResults =
    calculateEntryMatches(
      entries as DrawEntry[],
      draw.winning_numbers,
    )

  const previousJackpot =
    await getPreviousJackpotRollover(
      draw.draw_month,
    )

  const prizeCalculations =
    calculatePrizeDistribution(
      Number(draw.total_prize_pool),
      previousJackpot,
      matchResults,
    )

  const { error: deletePrizesError } =
    await supabase
      .from('prizes')
      .delete()
      .eq('draw_id', drawId)

  if (deletePrizesError) {
    throw deletePrizesError
  }

  const prizeRows = prizeCalculations.map(
    (prize) => ({
      draw_id: drawId,
      match_type: prize.matchType,
      pool_percentage:
        prize.poolPercentage,
      pool_amount: prize.poolAmount,
      winner_count:
        prize.winnerCount,
      prize_per_winner:
        prize.prizePerWinner,
      rollover_amount:
        prize.rolloverAmount,
    }),
  )

  const { data: createdPrizes, error: prizesError } =
    await supabase
      .from('prizes')
      .insert(prizeRows)
      .select()

  if (prizesError) throw prizesError

  if (!createdPrizes) {
    throw new Error(
      'Unable to create prize records.',
    )
  }

  const { error: deleteWinnersError } =
    await supabase
      .from('winners')
      .delete()
      .eq('draw_id', drawId)

  if (deleteWinnersError) {
    throw deleteWinnersError
  }

  const winnerRows: {
    draw_id: string
    prize_id: string
    user_id: string
    match_count: number
    prize_amount: number
    verification_status: 'pending'
    payment_status: 'pending'
  }[] = []

  for (const prize of prizeCalculations) {
    if (prize.winnerCount === 0) {
      continue
    }

    const matchingResults =
      matchResults.filter(
        (result) =>
          result.matchCount ===
          prize.matchType,
      )

    const createdPrize =
      createdPrizes.find(
        (item) =>
          item.match_type ===
          prize.matchType,
      )

    if (!createdPrize) {
      throw new Error(
        `Prize record for ${prize.matchType}-match was not created.`,
      )
    }

    for (const result of matchingResults) {
      winnerRows.push({
        draw_id: drawId,
        prize_id: createdPrize.id,
        user_id: result.userId,
        match_count: prize.matchType,
        prize_amount:
          prize.prizePerWinner,
        verification_status: 'pending',
        payment_status: 'pending',
      })
    }
  }

  if (winnerRows.length > 0) {
    const { error: winnersError } =
      await supabase
        .from('winners')
        .insert(winnerRows)

    if (winnersError) {
      throw winnersError
    }
  }

  const fiveMatchPrize =
    prizeCalculations.find(
      (prize) => prize.matchType === 5,
    )

  const { data: updatedDraw, error: updateError } =
    await supabase
      .from('draws')
      .update({
        status: 'published',
        jackpot_rollover:
          fiveMatchPrize?.rolloverAmount || 0,
        published_at:
          new Date().toISOString(),
        simulation_result: {
          winning_numbers:
            draw.winning_numbers,
          subscriber_count:
            draw.subscriber_count,
          total_prize_pool:
            draw.total_prize_pool,
          previous_jackpot_rollover:
            previousJackpot,
          prize_calculations:
            prizeCalculations,
          winners_created:
            winnerRows.length,
          finalized_at:
            new Date().toISOString(),
        },
      })
      .eq('id', drawId)
      .select()
      .single()

  if (updateError) throw updateError

  return {
    draw: updatedDraw,
    matchResults,
    prizes: prizeCalculations,
    winnersCreated: winnerRows.length,
  }
}