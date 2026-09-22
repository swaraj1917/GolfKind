import { supabase } from '../lib/supabase'

export async function registerUser(
  fullName: string,
  email: string,
  password: string
) {
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: {
        full_name: fullName,
      },
    },
  })

  if (error) {
    throw error
  }

  return data
}

export async function loginUser(
  email: string,
  password: string
) {
  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  })

  if (error) {
    throw error
  }

  const user = data.user

  if (!user) {
    throw new Error('Unable to retrieve logged-in user.')
  }

  const { data: profile, error: profileError } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', user.id)
    .single()

  if (profileError) {
    throw profileError
  }

  return {
    ...data,
    profile,
  }
}

export async function logoutUser() {
  const { error } = await supabase.auth.signOut()

  if (error) {
    throw error
  }
}

export async function getCurrentUser() {
  const {
    data: { user },
    error,
  } = await supabase.auth.getUser()

  if (error) {
    throw error
  }

  return user
}