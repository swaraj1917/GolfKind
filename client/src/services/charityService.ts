import { supabase } from '../lib/supabase'

export interface Charity {
  id: string
  name: string
  description: string | null
  image_url: string | null
  website_url: string | null
  upcoming_event: string | null
  is_featured: boolean
  is_active: boolean
}

export async function getCharities() {
  const { data, error } = await supabase
    .from('charities')
    .select('*')
    .eq('is_active', true)
    .order('is_featured', { ascending: false })
    .order('name', { ascending: true })

  if (error) {
    throw error
  }

  return data as Charity[]
}

export async function getUserProfile(userId: string) {
  const { data, error } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', userId)
    .single()

  if (error) {
    throw error
  }

  return data
}

export async function updateUserCharity(
  userId: string,
  charityId: string,
  charityPercentage: number,
) {
  if (charityPercentage < 10 || charityPercentage > 100) {
    throw new Error('Charity contribution must be between 10% and 100%.')
  }

  const { data, error } = await supabase
    .from('profiles')
    .update({
      charity_id: charityId,
      charity_percentage: charityPercentage,
      updated_at: new Date().toISOString(),
    })
    .eq('id', userId)
    .select()
    .single()

  if (error) {
    throw error
  }

  return data
}