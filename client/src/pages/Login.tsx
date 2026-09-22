import { useState, type FormEvent } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { ArrowRight, LockKeyhole, Mail } from 'lucide-react'
import { loginUser } from '../services/authService'

function Login() {
  const navigate = useNavigate()

  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')

  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()

    setError('')

    if (!email.trim()) {
      setError('Please enter your email.')
      return
    }

    if (!password) {
      setError('Please enter your password.')
      return
    }

    try {
      setLoading(true)

      const result = await loginUser(email.trim(), password)

      if (result.profile.role === 'admin') {
        navigate('/admin')
      } else {
        navigate('/dashboard')
      }
    } catch (err) {
      if (err instanceof Error) {
        setError(err.message)
      } else {
        setError('Unable to log in. Please try again.')
      }
    } finally {
      setLoading(false)
    }
  }

  return (
    <main className="min-h-screen bg-slate-950 flex items-center justify-center px-6 py-12">
      <div className="w-full max-w-md">
        {/* Brand */}
        <div className="text-center mb-8">
          <Link
            to="/"
            className="inline-flex items-center gap-2 text-2xl font-bold text-white"
          >
            <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-500 text-slate-950">
              G
            </span>
            GolfKind
          </Link>

          <p className="mt-3 text-sm text-slate-400">
            Play better. Give more. Win together.
          </p>
        </div>

        {/* Login Card */}
        <div className="rounded-2xl border border-slate-800 bg-slate-900/90 p-8 shadow-2xl">
          <div className="mb-8">
            <h1 className="text-2xl font-bold text-white">
              Welcome back
            </h1>

            <p className="mt-2 text-sm leading-6 text-slate-400">
              Log in to manage your golf performance, charity contribution,
              and monthly draw participation.
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Email */}
            <div>
              <label
                htmlFor="email"
                className="mb-2 block text-sm font-medium text-slate-200"
              >
                Email
              </label>

              <div className="relative">
                <Mail
                  size={18}
                  className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500"
                />

                <input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(event) => setEmail(event.target.value)}
                  placeholder="Enter your email"
                  autoComplete="email"
                  className="w-full rounded-xl border border-slate-700 bg-slate-950 py-3 pl-10 pr-4 text-sm text-white outline-none transition placeholder:text-slate-500 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20"
                />
              </div>
            </div>

            {/* Password */}
            <div>
              <label
                htmlFor="password"
                className="mb-2 block text-sm font-medium text-slate-200"
              >
                Password
              </label>

              <div className="relative">
                <LockKeyhole
                  size={18}
                  className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500"
                />

                <input
                  id="password"
                  type="password"
                  value={password}
                  onChange={(event) => setPassword(event.target.value)}
                  placeholder="Enter your password"
                  autoComplete="current-password"
                  className="w-full rounded-xl border border-slate-700 bg-slate-950 py-3 pl-10 pr-4 text-sm text-white outline-none transition placeholder:text-slate-500 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20"
                />
              </div>
            </div>

            {/* Error */}
            {error && (
              <div className="rounded-xl border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-300">
                {error}
              </div>
            )}

            {/* Submit */}
            <button
              type="submit"
              disabled={loading}
              className="flex w-full items-center justify-center gap-2 rounded-xl bg-emerald-500 px-4 py-3 font-semibold text-slate-950 transition hover:bg-emerald-400 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {loading ? 'Logging in...' : 'Log In'}

              {!loading && <ArrowRight size={18} />}
            </button>
          </form>

          {/* Register */}
          <div className="mt-6 border-t border-slate-800 pt-6 text-center">
            <p className="text-sm text-slate-400">
              Don't have an account?{' '}
              <Link
                to="/register"
                className="font-semibold text-emerald-400 transition hover:text-emerald-300"
              >
                Create an account
              </Link>
            </p>
          </div>
        </div>

        <p className="mt-6 text-center text-xs text-slate-500">
          Golf performance • Charity • Monthly rewards
        </p>
      </div>
    </main>
  )
}

export default Login