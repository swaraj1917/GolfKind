import { useState, type FormEvent } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { registerUser } from '../services/authService'

function Register() {
  const navigate = useNavigate()

  const [fullName, setFullName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')

  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [loading, setLoading] = useState(false)

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()

    setError('')
    setSuccess('')

    if (!fullName.trim()) {
      setError('Please enter your full name.')
      return
    }

    if (!email.trim()) {
      setError('Please enter your email.')
      return
    }

    if (password.length < 6) {
      setError('Password must be at least 6 characters.')
      return
    }

    if (password !== confirmPassword) {
      setError('Passwords do not match.')
      return
    }

    try {
      setLoading(true)

      const data = await registerUser(
        fullName.trim(),
        email.trim(),
        password,
      )

      if (!data.user) {
        throw new Error('Registration failed. Please try again.')
      }

      if (!data.session) {
        setSuccess(
          'Account created successfully. Please check your email to verify your account.',
        )
      } else {
        navigate('/dashboard')
      }
    } catch (err) {
      if (err instanceof Error) {
        setError(err.message)
      } else {
        setError('Something went wrong. Please try again.')
      }
    } finally {
      setLoading(false)
    }
  }

  return (
    <main>
      <div>
        <h1>GolfKind</h1>

        <h2>Create your account</h2>

        <p>
          Track your golf performance, support charities, and participate in
          monthly draws.
        </p>

        <form onSubmit={handleSubmit}>
          <div>
            <label htmlFor="fullName">Full Name</label>
            <input
              id="fullName"
              type="text"
              value={fullName}
              onChange={(event) => setFullName(event.target.value)}
              placeholder="Enter your full name"
              autoComplete="name"
            />
          </div>

          <div>
            <label htmlFor="email">Email</label>
            <input
              id="email"
              type="email"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              placeholder="Enter your email"
              autoComplete="email"
            />
          </div>

          <div>
            <label htmlFor="password">Password</label>
            <input
              id="password"
              type="password"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              placeholder="Create a password"
              autoComplete="new-password"
            />
          </div>

          <div>
            <label htmlFor="confirmPassword">Confirm Password</label>
            <input
              id="confirmPassword"
              type="password"
              value={confirmPassword}
              onChange={(event) => setConfirmPassword(event.target.value)}
              placeholder="Confirm your password"
              autoComplete="new-password"
            />
          </div>

          {error && <p>{error}</p>}

          {success && <p>{success}</p>}

          <button type="submit" disabled={loading}>
            {loading ? 'Creating account...' : 'Create Account'}
          </button>
        </form>

        <p>
          Already have an account? <Link to="/login">Log in</Link>
        </p>
      </div>
    </main>
  )
}

export default Register