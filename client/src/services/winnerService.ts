import { supabase } from '../lib/supabase'

export interface WinnerProof {
  id: string
  winner_id: string
  file_url: string
  uploaded_at: string
  reviewed_at: string | null
  reviewed_by: string | null
  rejection_reason: string | null
}

export interface Winner {
  id: string
  draw_id: string
  prize_id: string
  user_id: string
  match_count: 3 | 4 | 5
  prize_amount: number
  verification_status: 'pending' | 'approved' | 'rejected'
  payment_status: 'pending' | 'paid'
  created_at: string
  updated_at: string
  winner_proofs?: WinnerProof[]
  profile?: {
    full_name: string
    email: string
  }
}

export async function getUserWinners(userId: string) {
  const { data, error } = await supabase
    .from('winners')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: false })

  if (error) throw error

  return data || []
}

export async function getWinnerProof(winnerId: string) {
  const { data, error } = await supabase
    .from('winner_proofs')
    .select('*')
    .eq('winner_id', winnerId)
    .order('uploaded_at', { ascending: false })
    .limit(1)
    .maybeSingle()

  if (error) throw error

  return data as WinnerProof | null
}

export async function uploadWinnerProof(
  winnerId: string,
  userId: string,
  file: File,
) {
  if (!file) {
    throw new Error('Please select a file.')
  }

  const allowedTypes = [
    'image/jpeg',
    'image/png',
    'image/webp',
    'application/pdf',
  ]

  if (!allowedTypes.includes(file.type)) {
    throw new Error(
      'Please upload a JPG, PNG, WEBP image or PDF.',
    )
  }

  const maxSize = 5 * 1024 * 1024

  if (file.size > maxSize) {
    throw new Error('Proof file must be smaller than 5 MB.')
  }

  const extension =
    file.name.split('.').pop()?.toLowerCase() || 'file'

  const filePath = `${userId}/${winnerId}-${Date.now()}.${extension}`

  const { error: uploadError } = await supabase.storage
    .from('winner-proofs')
    .upload(filePath, file, {
      upsert: false,
      contentType: file.type,
    })

  if (uploadError) {
    throw uploadError
  }

  const { data: existingProof, error: existingProofError } =
    await supabase
      .from('winner_proofs')
      .select('id')
      .eq('winner_id', winnerId)
      .maybeSingle()

  if (existingProofError) {
    throw existingProofError
  }

  if (existingProof) {
    const { error: updateError } = await supabase
      .from('winner_proofs')
      .update({
        file_url: filePath,
        uploaded_at: new Date().toISOString(),
        reviewed_at: null,
        reviewed_by: null,
        rejection_reason: null,
      })
      .eq('id', existingProof.id)

    if (updateError) {
      throw updateError
    }

    return
  }

  const { error: insertError } = await supabase
    .from('winner_proofs')
    .insert({
      winner_id: winnerId,
      file_url: filePath,
    })

  if (insertError) {
    throw insertError
  }
}

export async function getProofDownloadUrl(filePath: string) {
  const { data, error } = await supabase.storage
    .from('winner-proofs')
    .createSignedUrl(filePath, 60 * 10)

  if (error) {
    throw error
  }

  return data.signedUrl
}

/*
 * ADMIN FUNCTIONS
 */

export async function getAllWinners() {
  const { data, error } = await supabase
    .from('winners')
    .select(`
      *,
      profiles:user_id (
        full_name,
        email
      ),
      winner_proofs (
        id,
        winner_id,
        file_url,
        uploaded_at,
        reviewed_at,
        reviewed_by,
        rejection_reason
      )
    `)
    .order('created_at', { ascending: false })

  if (error) {
    throw error
  }

  return data as Winner[]
}

export async function reviewWinnerProof(
  winnerId: string,
  status: 'approved' | 'rejected',
  adminId: string,
  rejectionReason?: string,
) {
  const { data: winner, error: winnerError } = await supabase
    .from('winners')
    .update({
      verification_status: status,
      updated_at: new Date().toISOString(),
    })
    .eq('id', winnerId)
    .select()
    .single()

  if (winnerError) {
    throw winnerError
  }

  const { data: proof, error: proofError } = await supabase
    .from('winner_proofs')
    .select('id')
    .eq('winner_id', winnerId)
    .order('uploaded_at', { ascending: false })
    .limit(1)
    .maybeSingle()

  if (proofError) {
    throw proofError
  }

  if (proof) {
    const { error: updateProofError } = await supabase
      .from('winner_proofs')
      .update({
        reviewed_at: new Date().toISOString(),
        reviewed_by: adminId,
        rejection_reason:
          status === 'rejected'
            ? rejectionReason || 'Proof was rejected.'
            : null,
      })
      .eq('id', proof.id)

    if (updateProofError) {
      throw updateProofError
    }
  }

  return winner as Winner
}

export async function markWinnerPaid(winnerId: string) {
  const { data: winner, error } = await supabase
    .from('winners')
    .update({
      payment_status: 'paid',
      updated_at: new Date().toISOString(),
    })
    .eq('id', winnerId)
    .eq('verification_status', 'approved')
    .select()
    .single()

  if (error) {
    throw error
  }

  return winner as Winner
}