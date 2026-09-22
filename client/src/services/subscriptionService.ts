import { supabase } from '../lib/supabase'

export interface Subscription {
  id: string
  user_id: string
  plan_type: 'monthly' | 'yearly'
  status: 'active' | 'inactive' | 'cancelled' | 'past_due'
  amount: number
  charity_amount: number
  prize_pool_amount: number
  current_period_start: string | null
  current_period_end: string | null
}

export async function getUserSubscription(userId: string) {
  const { data, error } = await supabase
    .from('subscriptions')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: false })
    .limit(1)
    .maybeSingle()

  if (error) {
    throw error
  }

  return data as Subscription | null
}

export async function createDemoSubscription(
  userId: string,
  planType: 'monthly' | 'yearly',
  charityPercentage: number,
) {
  const amount = planType === 'monthly' ? 20 : 200

  const charityAmount = amount * (charityPercentage / 100)

  const prizePoolAmount = amount * 0.4

  const start = new Date()

  const end = new Date(start)

  if (planType === 'monthly') {
    end.setMonth(end.getMonth() + 1)
  } else {
    end.setFullYear(end.getFullYear() + 1)
  }

  const { data, error } = await supabase
    .from('subscriptions')
    .insert({
      user_id: userId,
      plan_type: planType,
      status: 'active',
      amount,
      charity_amount: charityAmount,
      prize_pool_amount: prizePoolAmount,
      current_period_start: start.toISOString(),
      current_period_end: end.toISOString(),
    })
    .select()
    .single()

  if (error) {
    throw error
  }

  return data as Subscription
}

export async function cancelSubscription(subscriptionId: string) {
  const { data, error } = await supabase
    .from('subscriptions')
    .update({
      status: 'cancelled',
      updated_at: new Date().toISOString(),
    })
    .eq('id', subscriptionId)
    .select()
    .single()

  if (error) {
    throw error
  }

  return data as Subscription
}