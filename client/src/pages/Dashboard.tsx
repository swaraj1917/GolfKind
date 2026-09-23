import { useEffect, useMemo, useState, type FormEvent } from 'react'
import { useSearchParams } from 'react-router-dom'
import {
  Award,
  CalendarDays,
  CheckCircle2,
  CircleDollarSign,
  Clock3,
  CreditCard,
  Heart,
  Loader2,
  LogOut,
  Pencil,
  Save,
  ShieldCheck,
  Target,
  Trash2,
  Trophy,
  Upload,
  XCircle,
} from 'lucide-react'

import { useAuth } from '../context/AuthContext'

import {
  getUserScores,
  addScore,
  updateScore,
  deleteScore,
  type GolfScore,
} from '../services/scoreService'

import {
  getCharities,
  getUserProfile,
  updateUserCharity,
  type Charity,
} from '../services/charityService'

import {
  getUserSubscription,
  createDemoSubscription,
  cancelSubscription,
  type Subscription,
} from '../services/subscriptionService'

import {
  getLatestPublishedDraw,
  getLatestOpenDraw,
  getDrawPrizes,
  getUserDrawEntry,
  createDrawEntry,
  type Draw,
  type Prize,
  type DrawEntry,
} from '../services/drawService'

import {
  getUserWinners,
  getWinnerProof,
  uploadWinnerProof,
  type WinnerProof,
} from '../services/winnerService'

interface Profile {
  id: string
  full_name: string
  email: string
  role: 'subscriber' | 'admin'
  charity_id: string | null
  charity_percentage: number
}

interface Winner {
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
}

function formatMoney(value: number) {
  return `£${Number(value || 0).toFixed(2)}`
}

function formatDate(date: string | null | undefined) {
  if (!date) return '—'

  return new Date(date).toLocaleDateString('en-GB', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  })
}

function formatDrawMonth(date: string) {
  return new Date(date).toLocaleDateString('en-GB', {
    month: 'long',
    year: 'numeric',
  })
}

function getToday() {
  return new Date().toISOString().slice(0, 10)
}

export default function Dashboard() {
  const { user, signOut } = useAuth()
  const [searchParams, setSearchParams] = useSearchParams()

  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)

  const [scores, setScores] = useState<GolfScore[]>([])
  const [charities, setCharities] = useState<Charity[]>([])
  const [profile, setProfile] = useState<Profile | null>(null)
  const [subscription, setSubscription] =
    useState<Subscription | null>(null)

  const [latestDraw, setLatestDraw] = useState<Draw | null>(null)
  const [openDraw, setOpenDraw] = useState<Draw | null>(null)
  const [prizes, setPrizes] = useState<Prize[]>([])

  const [drawEntry, setDrawEntry] = useState<DrawEntry | null>(null)
  const [drawNumbers, setDrawNumbers] = useState<string[]>([
    '',
    '',
    '',
    '',
    '',
  ])
  const [submittingDrawEntry, setSubmittingDrawEntry] = useState(false)

  const [winners, setWinners] = useState<Winner[]>([])
  const [winnerProofs, setWinnerProofs] = useState<
    Record<string, WinnerProof | null>
  >({})

  const [scoreValue, setScoreValue] = useState('')
  const [scoreDate, setScoreDate] = useState(getToday())

  const [editingScoreId, setEditingScoreId] = useState<string | null>(null)

  const [selectedCharity, setSelectedCharity] = useState('')
  const [charityPercentage, setCharityPercentage] = useState('10')

  const [selectedPlan, setSelectedPlan] = useState<'monthly' | 'yearly'>(
    'monthly',
  )

  const [showCheckout, setShowCheckout] = useState(false)

  const [message, setMessage] = useState('')
  const [error, setError] = useState('')

  const [uploadingProof, setUploadingProof] = useState<string | null>(null)

  const activeSubscription =
    subscription?.status === 'active' &&
    (!subscription.current_period_end ||
      new Date(subscription.current_period_end) > new Date())

  const averageScore = useMemo(() => {
    if (scores.length === 0) return 0

    const total = scores.reduce((sum, item) => sum + Number(item.score), 0)

    return Math.round((total / scores.length) * 10) / 10
  }, [scores])

  const highestScore = useMemo(() => {
    if (scores.length === 0) return 0

    return Math.max(...scores.map((item) => Number(item.score)))
  }, [scores])

  const totalWinnings = useMemo(() => {
    return winners.reduce(
      (sum, winner) => sum + Number(winner.prize_amount || 0),
      0,
    )
  }, [winners])

  async function loadDashboard() {
    if (!user) return

    try {
      setLoading(true)
      setError('')

      const [
        userScores,
        charityList,
        userProfile,
        userSubscription,
        publishedDraw,
        currentOpenDraw,
        userWinners,
      ] = await Promise.all([
        getUserScores(user.id),
        getCharities(),
        getUserProfile(user.id),
        getUserSubscription(user.id),
        getLatestPublishedDraw(),
        getLatestOpenDraw(),
        getUserWinners(user.id),
      ])

      setScores(userScores)
      setCharities(charityList)
      setProfile(userProfile as Profile)
      setSubscription(userSubscription)
      setLatestDraw(publishedDraw)
      setOpenDraw(currentOpenDraw)
      setWinners(userWinners as Winner[])

      if (userProfile) {
        const charityFromUrl = searchParams.get('charity')

        setSelectedCharity(
          charityFromUrl || userProfile.charity_id || '',
        )

        setCharityPercentage(
          String(userProfile.charity_percentage || 10),
        )
      }

      if (publishedDraw) {
        const drawPrizes = await getDrawPrizes(publishedDraw.id)
        setPrizes(drawPrizes)
      } else {
        setPrizes([])
      }

      if (currentOpenDraw) {
        try {
          const existingEntry = await getUserDrawEntry(
            currentOpenDraw.id,
            user.id,
          )

          setDrawEntry(existingEntry)

          if (existingEntry) {
            setDrawNumbers(existingEntry.numbers.map(String))
          } else {
            setDrawNumbers(['', '', '', '', ''])
          }
        } catch (entryError) {
          console.error(entryError)

          setDrawEntry(null)
          setDrawNumbers(['', '', '', '', ''])
        }
      } else {
        setDrawEntry(null)
        setDrawNumbers(['', '', '', '', ''])
      }

      const proofEntries = await Promise.all(
        (userWinners as Winner[]).map(async (winner) => {
          try {
            const proof = await getWinnerProof(winner.id)

            return [winner.id, proof] as const
          } catch {
            return [winner.id, null] as const
          }
        }),
      )

      setWinnerProofs(Object.fromEntries(proofEntries))
    } catch (err) {
      console.error(err)

      setError(
        err instanceof Error
          ? err.message
          : 'Unable to load your dashboard.',
      )
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    if (!user) return

    void loadDashboard()
  }, [user])

  async function saveCharityFromUrl() {
    if (!user) return

    const charityId = searchParams.get('charity')

    if (!charityId) return

    const charityExists = charities.some(
      (charity) => charity.id === charityId,
    )

    if (!charityExists) return

    try {
      setSaving(true)
      setError('')

      const percentage = Number(charityPercentage) || 10

      const updatedProfile = await updateUserCharity(
        user.id,
        charityId,
        percentage,
      )

      setProfile(updatedProfile as Profile)
      setSelectedCharity(charityId)

      setMessage('Your selected charity has been saved.')

      setSearchParams({}, { replace: true })
    } catch (err) {
      console.error(err)

      setError(
        err instanceof Error
          ? err.message
          : 'Unable to save your selected charity.',
      )
    } finally {
      setSaving(false)
    }
  }

  useEffect(() => {
    if (!user || loading || charities.length === 0) return

    const charityId = searchParams.get('charity')

    if (!charityId) return

    void saveCharityFromUrl()
  }, [user, loading, charities, searchParams])

  function clearMessages() {
    setMessage('')
    setError('')
  }

  async function handleScoreSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()

    if (!user) return

    clearMessages()

    if (!activeSubscription) {
      setError('An active subscription is required to add or edit scores.')
      return
    }

    const numericScore = Number(scoreValue)

    if (!Number.isInteger(numericScore)) {
      setError('Please enter a whole number between 1 and 45.')
      return
    }

    if (numericScore < 1 || numericScore > 45) {
      setError('Stableford score must be between 1 and 45.')
      return
    }

    if (!scoreDate) {
      setError('Please select the date you played.')
      return
    }

    try {
      setSaving(true)

      if (editingScoreId) {
        await updateScore(editingScoreId, numericScore, scoreDate)

        setMessage('Score updated successfully.')
      } else {
        await addScore(user.id, numericScore, scoreDate)

        setMessage('Score added successfully.')
      }

      setScoreValue('')
      setScoreDate(getToday())
      setEditingScoreId(null)

      await loadDashboard()
    } catch (err) {
      console.error(err)

      setError(
        err instanceof Error ? err.message : 'Unable to save your score.',
      )
    } finally {
      setSaving(false)
    }
  }

  function startEditingScore(score: GolfScore) {
    clearMessages()

    setEditingScoreId(score.id)
    setScoreValue(String(score.score))
    setScoreDate(score.played_at)
  }

  function cancelEditingScore() {
    setEditingScoreId(null)
    setScoreValue('')
    setScoreDate(getToday())
  }

  async function handleDeleteScore(scoreId: string) {
    clearMessages()

    const confirmed = window.confirm(
      'Are you sure you want to delete this score?',
    )

    if (!confirmed) return

    try {
      setSaving(true)

      await deleteScore(scoreId)

      setMessage('Score deleted successfully.')

      if (editingScoreId === scoreId) {
        cancelEditingScore()
      }

      await loadDashboard()
    } catch (err) {
      console.error(err)

      setError(
        err instanceof Error ? err.message : 'Unable to delete the score.',
      )
    } finally {
      setSaving(false)
    }
  }

  async function handleSaveCharity() {
    if (!user) return

    clearMessages()

    if (!selectedCharity) {
      setError('Please select a charity.')
      return
    }

    const percentage = Number(charityPercentage)

    if (!Number.isFinite(percentage)) {
      setError('Please enter a valid charity percentage.')
      return
    }

    if (percentage < 10 || percentage > 100) {
      setError('Charity contribution must be between 10% and 100%.')
      return
    }

    try {
      setSaving(true)

      const updatedProfile = await updateUserCharity(
        user.id,
        selectedCharity,
        percentage,
      )

      setProfile(updatedProfile as Profile)

      setMessage('Your charity preference has been saved.')
    } catch (err) {
      console.error(err)

      setError(
        err instanceof Error
          ? err.message
          : 'Unable to save your charity preference.',
      )
    } finally {
      setSaving(false)
    }
  }

  function randomizeDrawNumbers() {
    const numbers: number[] = []

    while (numbers.length < 5) {
      const number = Math.floor(Math.random() * 45) + 1

      if (!numbers.includes(number)) {
        numbers.push(number)
      }
    }

    numbers.sort((a, b) => a - b)

    setDrawNumbers(numbers.map(String))
    clearMessages()
  }

  async function handleDrawEntrySubmit(
    event: FormEvent<HTMLFormElement>,
  ) {
    event.preventDefault()

    if (!user || !openDraw) return

    clearMessages()

    const numbers = drawNumbers.map((number) => Number(number))

    if (
      numbers.length !== 5 ||
      numbers.some((number) => !Number.isInteger(number))
    ) {
      setError('Please select exactly 5 numbers.')
      return
    }

    if (numbers.some((number) => number < 1 || number > 45)) {
      setError('Each number must be between 1 and 45.')
      return
    }

    if (new Set(numbers).size !== 5) {
      setError('You cannot select the same number more than once.')
      return
    }

    try {
      setSubmittingDrawEntry(true)

      const entry = await createDrawEntry(
        openDraw.id,
        user.id,
        numbers,
      )

      setDrawEntry(entry)
      setDrawNumbers(entry.numbers.map(String))

      setMessage('Your draw entry has been submitted successfully.')
    } catch (err) {
      console.error(err)

      setError(
        err instanceof Error
          ? err.message
          : 'Unable to submit your draw entry.',
      )
    } finally {
      setSubmittingDrawEntry(false)
    }
  }

  function handleSubscribe() {
    if (!user) return

    clearMessages()

    setShowCheckout(true)
  }

  async function handleTestPayment() {
    if (!user) return

    clearMessages()

    try {
      setSaving(true)

      await createDemoSubscription(
        user.id,
        selectedPlan,
        Number(charityPercentage) || 10,
      )

      setShowCheckout(false)

      setMessage(
        `Your ${selectedPlan} subscription has been activated successfully in test mode.`,
      )

      await loadDashboard()
    } catch (err) {
      console.error(err)

      setError(
        err instanceof Error
          ? err.message
          : 'Unable to complete the test checkout.',
      )
    } finally {
      setSaving(false)
    }
  }

  async function handleCancelSubscription() {
    if (!subscription) return

    clearMessages()

    const confirmed = window.confirm(
      'Are you sure you want to cancel your subscription?',
    )

    if (!confirmed) return

    try {
      setSaving(true)

      await cancelSubscription(subscription.id)

      setMessage('Your subscription has been cancelled.')

      await loadDashboard()
    } catch (err) {
      console.error(err)

      setError(
        err instanceof Error
          ? err.message
          : 'Unable to cancel your subscription.',
      )
    } finally {
      setSaving(false)
    }
  }

  async function handleProofUpload(
    winnerId: string,
    file: File | undefined,
  ) {
    if (!user || !file) return

    clearMessages()

    try {
      setUploadingProof(winnerId)

      await uploadWinnerProof(winnerId, user.id, file)

      const proof = await getWinnerProof(winnerId)

      setWinnerProofs((previous) => ({
        ...previous,
        [winnerId]: proof,
      }))

      setMessage('Your proof has been uploaded successfully.')
    } catch (err) {
      console.error(err)

      setError(
        err instanceof Error
          ? err.message
          : 'Unable to upload your proof.',
      )
    } finally {
      setUploadingProof(null)
    }
  }

  async function handleLogout() {
    try {
      await signOut()
    } catch (err) {
      console.error(err)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-[#f5f7f4] flex items-center justify-center">
        <div className="flex items-center gap-3 text-[#36513e]">
          <Loader2 className="h-6 w-6 animate-spin" />
          <span className="font-medium">Loading your dashboard...</span>
        </div>
      </div>
    )
  }

  const selectedCharityObject = charities.find(
    (charity) => charity.id === selectedCharity,
  )

  return (
    <div className="min-h-screen bg-[#f5f7f4] text-[#17231b]">
      {/* Header */}
      <header className="sticky top-0 z-40 border-b border-[#dfe6df] bg-white/95 backdrop-blur">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-5 py-4 lg:px-8">
          <a href="/" className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#244d32] text-white">
              <Target className="h-5 w-5" />
            </div>

            <div>
              <div className="text-lg font-bold tracking-tight text-[#244d32]">
                GolfKind
              </div>

              <div className="text-xs text-slate-500">
                Play. Give. Win.
              </div>
            </div>
          </a>

          <div className="flex items-center gap-3">
            <div className="hidden text-right sm:block">
              <p className="text-sm font-semibold text-[#17231b]">
                {profile?.full_name || user?.email}
              </p>

              <p className="text-xs text-slate-500">
                {activeSubscription ? 'Active subscriber' : 'Not subscribed'}
              </p>
            </div>

            <button
              type="button"
              onClick={handleLogout}
              className="flex items-center gap-2 rounded-lg border border-[#d9e0da] px-3 py-2 text-sm font-medium text-slate-700 transition hover:bg-slate-50"
            >
              <LogOut className="h-4 w-4" />
              <span className="hidden sm:inline">Logout</span>
            </button>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-7xl px-5 py-8 lg:px-8">
        {/* Greeting */}
        <section className="mb-8">
          <p className="mb-2 text-sm font-semibold uppercase tracking-wider text-[#62836b]">
            Member dashboard
          </p>

          <h1 className="text-3xl font-bold tracking-tight text-[#17231b] sm:text-4xl">
            Welcome back, {profile?.full_name?.split(' ')[0] || 'Golfer'}.
          </h1>

          <p className="mt-2 max-w-2xl text-slate-600">
            Keep your golf scores updated, support a cause you care about,
            and stay ready for the next GolfKind draw.
          </p>
        </section>

        {/* Messages */}
        {message && (
          <div className="mb-6 flex items-start gap-3 rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-800">
            <CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0" />
            <span>{message}</span>
          </div>
        )}

        {error && (
          <div className="mb-6 flex items-start gap-3 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800">
            <XCircle className="mt-0.5 h-5 w-5 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {/* Stats */}
        <section className="mb-8 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          <div className="rounded-2xl border border-[#dfe6df] bg-white p-5 shadow-sm">
            <div className="mb-4 flex items-center justify-between">
              <span className="text-sm font-medium text-slate-500">
                Scores recorded
              </span>

              <div className="rounded-xl bg-[#edf4ee] p-2 text-[#356442]">
                <Target className="h-5 w-5" />
              </div>
            </div>

            <p className="text-3xl font-bold text-[#17231b]">
              {scores.length}
            </p>

            <p className="mt-1 text-xs text-slate-500">
              Maximum 5 recent scores
            </p>
          </div>

          <div className="rounded-2xl border border-[#dfe6df] bg-white p-5 shadow-sm">
            <div className="mb-4 flex items-center justify-between">
              <span className="text-sm font-medium text-slate-500">
                Average score
              </span>

              <div className="rounded-xl bg-[#edf4ee] p-2 text-[#356442]">
                <Award className="h-5 w-5" />
              </div>
            </div>

            <p className="text-3xl font-bold text-[#17231b]">
              {averageScore || '—'}
            </p>

            <p className="mt-1 text-xs text-slate-500">
              Stableford points
            </p>
          </div>

          <div className="rounded-2xl border border-[#dfe6df] bg-white p-5 shadow-sm">
            <div className="mb-4 flex items-center justify-between">
              <span className="text-sm font-medium text-slate-500">
                Best score
              </span>

              <div className="rounded-xl bg-[#edf4ee] p-2 text-[#356442]">
                <Trophy className="h-5 w-5" />
              </div>
            </div>

            <p className="text-3xl font-bold text-[#17231b]">
              {highestScore || '—'}
            </p>

            <p className="mt-1 text-xs text-slate-500">
              Highest recent Stableford score
            </p>
          </div>

          <div className="rounded-2xl border border-[#dfe6df] bg-white p-5 shadow-sm">
            <div className="mb-4 flex items-center justify-between">
              <span className="text-sm font-medium text-slate-500">
                Total winnings
              </span>

              <div className="rounded-xl bg-[#edf4ee] p-2 text-[#356442]">
                <CircleDollarSign className="h-5 w-5" />
              </div>
            </div>

            <p className="text-3xl font-bold text-[#17231b]">
              {formatMoney(totalWinnings)}
            </p>

            <p className="mt-1 text-xs text-slate-500">
              Across recorded wins
            </p>
          </div>
        </section>

        <div className="grid gap-8 lg:grid-cols-[1.5fr_1fr]">
          {/* LEFT COLUMN */}
          <div className="space-y-8">
            {/* Scores */}
            <section className="rounded-2xl border border-[#dfe6df] bg-white shadow-sm">
              <div className="border-b border-[#e7ece7] px-6 py-5">
                <div className="flex items-center justify-between gap-4">
                  <div>
                    <h2 className="text-xl font-bold text-[#17231b]">
                      Your golf scores
                    </h2>

                    <p className="mt-1 text-sm text-slate-500">
                      Keep your latest five Stableford scores here.
                    </p>
                  </div>

                  <div className="hidden rounded-full bg-[#edf4ee] px-3 py-1.5 text-xs font-semibold text-[#356442] sm:block">
                    {scores.length}/5 scores
                  </div>
                </div>
              </div>

              <div className="p-6">
                {!activeSubscription ? (
                  <div className="mb-6 rounded-xl border border-amber-200 bg-amber-50 p-4">
                    <p className="text-sm font-semibold text-amber-900">
                      Active subscription required
                    </p>

                    <p className="mt-1 text-sm text-amber-800">
                      Please activate a GolfKind subscription before adding
                      or editing scores.
                    </p>

                    <button
                      type="button"
                      onClick={handleSubscribe}
                      className="mt-3 rounded-lg bg-[#244d32] px-4 py-2 text-sm font-semibold text-white transition hover:bg-[#1d4029]"
                    >
                      Subscribe now
                    </button>
                  </div>
                ) : (
                  <form
                    onSubmit={handleScoreSubmit}
                    className="mb-6 grid gap-4 sm:grid-cols-[1fr_1fr_auto]"
                  >
                    <div>
                      <label
                        htmlFor="score"
                        className="mb-2 block text-sm font-medium text-slate-700"
                      >
                        Stableford score
                      </label>

                      <input
                        id="score"
                        type="number"
                        min="1"
                        max="45"
                        value={scoreValue}
                        onChange={(event) =>
                          setScoreValue(event.target.value)
                        }
                        placeholder="e.g. 34"
                        className="w-full rounded-xl border border-[#d8e0d9] bg-white px-4 py-3 outline-none transition focus:border-[#356442] focus:ring-2 focus:ring-[#356442]/10"
                      />
                    </div>

                    <div>
                      <label
                        htmlFor="played-date"
                        className="mb-2 block text-sm font-medium text-slate-700"
                      >
                        Played on
                      </label>

                      <input
                        id="played-date"
                        type="date"
                        value={scoreDate}
                        max={getToday()}
                        onChange={(event) =>
                          setScoreDate(event.target.value)
                        }
                        className="w-full rounded-xl border border-[#d8e0d9] bg-white px-4 py-3 outline-none transition focus:border-[#356442] focus:ring-2 focus:ring-[#356442]/10"
                      />
                    </div>

                    <div className="flex items-end gap-2">
                      <button
                        type="submit"
                        disabled={saving}
                        className="flex min-h-[48px] items-center justify-center gap-2 rounded-xl bg-[#244d32] px-5 py-3 text-sm font-semibold text-white transition hover:bg-[#1d4029] disabled:cursor-not-allowed disabled:opacity-60"
                      >
                        {saving ? (
                          <Loader2 className="h-4 w-4 animate-spin" />
                        ) : editingScoreId ? (
                          <Save className="h-4 w-4" />
                        ) : (
                          <Target className="h-4 w-4" />
                        )}

                        {editingScoreId ? 'Update' : 'Add score'}
                      </button>

                      {editingScoreId && (
                        <button
                          type="button"
                          onClick={cancelEditingScore}
                          className="min-h-[48px] rounded-xl border border-[#d8e0d9] px-4 text-sm font-semibold text-slate-700 hover:bg-slate-50"
                        >
                          Cancel
                        </button>
                      )}
                    </div>
                  </form>
                )}

                {scores.length === 0 ? (
                  <div className="rounded-xl border border-dashed border-[#d8e0d9] bg-[#fafcf9] px-6 py-10 text-center">
                    <Target className="mx-auto mb-3 h-8 w-8 text-[#7a9a81]" />

                    <p className="font-semibold text-[#34473a]">
                      No scores yet
                    </p>

                    <p className="mt-1 text-sm text-slate-500">
                      Add your latest Stableford score to get started.
                    </p>
                  </div>
                ) : (
                  <div className="overflow-hidden rounded-xl border border-[#e2e8e3]">
                    <div className="hidden grid-cols-[1fr_1fr_auto] bg-[#f7f9f7] px-4 py-3 text-xs font-semibold uppercase tracking-wide text-slate-500 sm:grid">
                      <span>Date</span>
                      <span>Score</span>
                      <span>Actions</span>
                    </div>

                    {scores.map((score) => (
                      <div
                        key={score.id}
                        className="grid gap-3 border-t border-[#e8ece8] px-4 py-4 sm:grid-cols-[1fr_1fr_auto] sm:items-center"
                      >
                        <div>
                          <p className="text-xs text-slate-500 sm:hidden">
                            Date
                          </p>

                          <p className="font-medium text-[#26362b]">
                            {formatDate(score.played_at)}
                          </p>
                        </div>

                        <div>
                          <p className="text-xs text-slate-500 sm:hidden">
                            Score
                          </p>

                          <p className="font-bold text-[#244d32]">
                            {score.score} pts
                          </p>
                        </div>

                        <div className="flex gap-2">
                          {activeSubscription && (
                            <button
                              type="button"
                              onClick={() => startEditingScore(score)}
                              className="inline-flex items-center gap-1.5 rounded-lg border border-[#d8e0d9] px-3 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50"
                            >
                              <Pencil className="h-3.5 w-3.5" />
                              Edit
                            </button>
                          )}

                          <button
                            type="button"
                            onClick={() => handleDeleteScore(score.id)}
                            className="inline-flex items-center gap-1.5 rounded-lg border border-red-200 px-3 py-2 text-xs font-semibold text-red-600 hover:bg-red-50"
                          >
                            <Trash2 className="h-3.5 w-3.5" />
                            Delete
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </section>

            {/* Monthly Draw */}
            <section className="rounded-2xl border border-[#dfe6df] bg-white shadow-sm">
              <div className="border-b border-[#e7ece7] px-6 py-5">
                <div className="flex items-center gap-3">
                  <div className="rounded-xl bg-[#edf4ee] p-2 text-[#356442]">
                    <Trophy className="h-5 w-5" />
                  </div>

                  <div>
                    <h2 className="text-xl font-bold text-[#17231b]">
                      Monthly draw
                    </h2>

                    <p className="mt-1 text-sm text-slate-500">
                      View the latest result and enter the next open draw.
                    </p>
                  </div>
                </div>
              </div>

              <div className="p-6">
                {/* Latest Published Draw */}
                {latestDraw ? (
                  <>
                    <div className="mb-6 rounded-2xl bg-[#244d32] p-6 text-white">
                      <div className="flex flex-col justify-between gap-5 sm:flex-row sm:items-center">
                        <div>
                          <div className="mb-2 inline-flex items-center rounded-full bg-white/10 px-3 py-1 text-xs font-semibold text-white/80">
                            Published result
                          </div>

                          <p className="text-sm font-medium text-white/70">
                            Draw month
                          </p>

                          <p className="mt-1 text-2xl font-bold">
                            {formatDrawMonth(latestDraw.draw_month)}
                          </p>

                          <p className="mt-2 text-sm text-white/75">
                            {latestDraw.draw_type === 'algorithmic'
                              ? 'Algorithmic draw'
                              : 'Random draw'}
                          </p>
                        </div>

                        <div className="sm:text-right">
                          <p className="text-sm text-white/70">
                            Prize pool
                          </p>

                          <p className="text-3xl font-bold">
                            {formatMoney(latestDraw.total_prize_pool)}
                          </p>
                        </div>
                      </div>

                      <div className="mt-6">
                        <p className="mb-3 text-sm font-medium text-white/70">
                          Winning numbers
                        </p>

                        <div className="flex flex-wrap gap-2">
                          {latestDraw.winning_numbers.length > 0 ? (
                            latestDraw.winning_numbers.map((number) => (
                              <span
                                key={number}
                                className="flex h-10 w-10 items-center justify-center rounded-full bg-white text-sm font-bold text-[#244d32]"
                              >
                                {number}
                              </span>
                            ))
                          ) : (
                            <span className="text-sm text-white/70">
                              Numbers have not been published yet.
                            </span>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Published Draw Prize Breakdown */}
                    <div className="mb-8">
                      <h3 className="mb-4 font-bold text-[#26362b]">
                        Prize breakdown
                      </h3>

                      {prizes.length === 0 ? (
                        <div className="rounded-xl border border-dashed border-[#d8e0d9] px-5 py-6 text-center text-sm text-slate-500">
                          Prize breakdown will appear when the draw prize
                          structure is configured.
                        </div>
                      ) : (
                        <div className="grid gap-3 sm:grid-cols-3">
                          {prizes.map((prize) => (
                            <div
                              key={prize.id}
                              className="rounded-xl border border-[#e1e7e2] bg-[#fafcf9] p-4"
                            >
                              <p className="text-sm font-semibold text-slate-500">
                                {prize.match_type}-number match
                              </p>

                              <p className="mt-1 text-xl font-bold text-[#244d32]">
                                {formatMoney(prize.prize_per_winner)}
                              </p>

                              <p className="mt-1 text-xs text-slate-500">
                                {prize.winner_count} winner
                                {prize.winner_count === 1 ? '' : 's'}
                              </p>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  </>
                ) : (
                  <div className="mb-8 rounded-xl border border-dashed border-[#d8e0d9] bg-[#fafcf9] px-6 py-10 text-center">
                    <CalendarDays className="mx-auto mb-3 h-8 w-8 text-[#7a9a81]" />

                    <p className="font-semibold text-[#34473a]">
                      No published draw yet
                    </p>

                    <p className="mt-1 text-sm text-slate-500">
                      Published draw results will appear here once an
                      administrator publishes a draw.
                    </p>
                  </div>
                )}

                {/* Open Draw */}
                {openDraw ? (
                  <div className="rounded-2xl border-2 border-[#dfe6df] bg-[#fafcf9] p-5">
                    <div className="mb-5">
                      <div className="mb-3 flex flex-wrap items-center justify-between gap-3">
                        <div>
                          <span className="inline-flex items-center rounded-full bg-[#edf4ee] px-3 py-1 text-xs font-semibold text-[#356442]">
                            Next draw
                          </span>

                          <h3 className="mt-2 text-xl font-bold text-[#26362b]">
                            {formatDrawMonth(openDraw.draw_month)}
                          </h3>
                        </div>

                        <div className="text-left sm:text-right">
                          <p className="text-xs font-medium uppercase tracking-wide text-slate-500">
                            Prize pool
                          </p>

                          <p className="text-xl font-bold text-[#244d32]">
                            {formatMoney(openDraw.total_prize_pool)}
                          </p>
                        </div>
                      </div>

                      <p className="text-sm leading-6 text-slate-600">
                        Select five unique numbers between 1 and 45 for the
                        upcoming draw. Winning numbers will only be revealed
                        after the draw is published.
                      </p>
                    </div>

                    {/* Draw Entry */}
                    <div className="rounded-xl border border-[#dfe6df] bg-white p-5">
                      <div className="mb-5">
                        <h3 className="text-lg font-bold text-[#26362b]">
                          Your draw entry
                        </h3>

                        <p className="mt-1 text-sm text-slate-500">
                          Choose 5 unique numbers between 1 and 45.
                        </p>
                      </div>

                      {drawEntry ? (
                        <div>
                          <div className="flex flex-wrap gap-2">
                            {drawEntry.numbers.map((number) => (
                              <span
                                key={number}
                                className="flex h-11 w-11 items-center justify-center rounded-full bg-[#244d32] text-sm font-bold text-white"
                              >
                                {number}
                              </span>
                            ))}
                          </div>

                          <div className="mt-4 flex items-center gap-2 text-sm font-medium text-emerald-700">
                            <CheckCircle2 className="h-4 w-4" />
                            Your entry has been submitted.
                          </div>
                        </div>
                      ) : !activeSubscription ? (
                        <div className="rounded-xl border border-amber-200 bg-amber-50 p-4">
                          <p className="text-sm font-semibold text-amber-900">
                            Active subscription required
                          </p>

                          <p className="mt-1 text-sm text-amber-800">
                            Please activate a GolfKind subscription before
                            submitting a draw entry.
                          </p>
                        </div>
                      ) : (
                        <form onSubmit={handleDrawEntrySubmit}>
                          <div className="grid grid-cols-5 gap-2 sm:gap-3">
                            {drawNumbers.map((number, index) => (
                              <input
                                key={index}
                                type="number"
                                min="1"
                                max="45"
                                value={number}
                                onChange={(event) => {
                                  const updated = [...drawNumbers]

                                  updated[index] = event.target.value

                                  setDrawNumbers(updated)
                                }}
                                placeholder={`${index + 1}`}
                                className="w-full rounded-xl border border-[#d8e0d9] bg-white px-2 py-3 text-center font-semibold outline-none transition focus:border-[#356442] focus:ring-2 focus:ring-[#356442]/10"
                              />
                            ))}
                          </div>

                          <div className="mt-4 flex flex-col gap-3 sm:flex-row">
                            <button
                              type="button"
                              onClick={randomizeDrawNumbers}
                              disabled={submittingDrawEntry}
                              className="rounded-xl border border-[#d8e0d9] bg-white px-4 py-3 text-sm font-semibold text-slate-700 transition hover:bg-slate-50 disabled:opacity-60"
                            >
                              Randomize numbers
                            </button>

                            <button
                              type="submit"
                              disabled={submittingDrawEntry}
                              className="flex flex-1 items-center justify-center gap-2 rounded-xl bg-[#244d32] px-4 py-3 text-sm font-semibold text-white transition hover:bg-[#1d4029] disabled:cursor-not-allowed disabled:opacity-60"
                            >
                              {submittingDrawEntry && (
                                <Loader2 className="h-4 w-4 animate-spin" />
                              )}

                              {submittingDrawEntry
                                ? 'Submitting...'
                                : 'Submit draw entry'}
                            </button>
                          </div>

                          <p className="mt-3 text-xs text-slate-500">
                            You can submit only one entry for this draw.
                          </p>
                        </form>
                      )}
                    </div>
                  </div>
                ) : (
                  <div className="rounded-2xl border border-dashed border-[#d8e0d9] bg-[#fafcf9] px-6 py-10 text-center">
                    <CalendarDays className="mx-auto mb-3 h-8 w-8 text-[#7a9a81]" />

                    <p className="font-semibold text-[#34473a]">
                      No upcoming draw is open yet
                    </p>

                    <p className="mt-1 text-sm text-slate-500">
                      The next draw entry will appear here once an
                      administrator creates an upcoming draw.
                    </p>
                  </div>
                )}
              </div>
            </section>

            {/* Winner Verification */}
            <section className="rounded-2xl border border-[#dfe6df] bg-white shadow-sm">
              <div className="border-b border-[#e7ece7] px-6 py-5">
                <div className="flex items-center gap-3">
                  <div className="rounded-xl bg-[#edf4ee] p-2 text-[#356442]">
                    <ShieldCheck className="h-5 w-5" />
                  </div>

                  <div>
                    <h2 className="text-xl font-bold text-[#17231b]">
                      Winner verification
                    </h2>

                    <p className="mt-1 text-sm text-slate-500">
                      Upload proof if you have been selected as a winner.
                    </p>
                  </div>
                </div>
              </div>

              <div className="p-6">
                {winners.length === 0 ? (
                  <div className="rounded-xl border border-dashed border-[#d8e0d9] bg-[#fafcf9] px-6 py-10 text-center">
                    <Trophy className="mx-auto mb-3 h-8 w-8 text-[#7a9a81]" />

                    <p className="font-semibold text-[#34473a]">
                      No winnings yet
                    </p>

                    <p className="mt-1 text-sm text-slate-500">
                      If you win a published draw, your verification request
                      will appear here.
                    </p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {winners.map((winner) => {
                      const proof = winnerProofs[winner.id]
                      const uploading = uploadingProof === winner.id

                      return (
                        <div
                          key={winner.id}
                          className="rounded-xl border border-[#e0e7e1] bg-[#fafcf9] p-5"
                        >
                          <div className="flex flex-col justify-between gap-4 sm:flex-row">
                            <div>
                              <p className="text-sm font-semibold text-slate-500">
                                {winner.match_count}-number match
                              </p>

                              <p className="mt-1 text-2xl font-bold text-[#244d32]">
                                {formatMoney(winner.prize_amount)}
                              </p>
                            </div>

                            <div className="sm:text-right">
                              <span
                                className={`inline-flex items-center rounded-full px-3 py-1 text-xs font-semibold ${
                                  winner.verification_status === 'approved'
                                    ? 'bg-emerald-100 text-emerald-700'
                                    : winner.verification_status ===
                                        'rejected'
                                      ? 'bg-red-100 text-red-700'
                                      : 'bg-amber-100 text-amber-700'
                                }`}
                              >
                                {winner.verification_status === 'approved'
                                  ? 'Verified'
                                  : winner.verification_status === 'rejected'
                                    ? 'Rejected'
                                    : 'Pending verification'}
                              </span>

                              <p className="mt-2 text-xs text-slate-500">
                                Payment:{' '}
                                {winner.payment_status === 'paid'
                                  ? 'Paid'
                                  : 'Pending'}
                              </p>
                            </div>
                          </div>

                          <div className="mt-5 border-t border-[#e2e8e3] pt-5">
                            {proof ? (
                              <div className="space-y-4">
                                <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                                  <div>
                                    <p className="text-sm font-semibold text-[#34473a]">
                                      Proof uploaded
                                    </p>

                                    <p className="text-xs text-slate-500">
                                      {formatDate(proof.uploaded_at)}
                                    </p>
                                  </div>

                                  <label className="inline-flex cursor-pointer items-center justify-center gap-2 rounded-lg border border-[#d8e0d9] bg-white px-4 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50">
                                    {uploading ? (
                                      <Loader2 className="h-4 w-4 animate-spin" />
                                    ) : (
                                      <Upload className="h-4 w-4" />
                                    )}

                                    Upload new proof

                                    <input
                                      type="file"
                                      accept=".jpg,.jpeg,.png,.webp,.pdf"
                                      className="hidden"
                                      disabled={uploading}
                                      onChange={(event) => {
                                        const file =
                                          event.target.files?.[0]

                                        void handleProofUpload(
                                          winner.id,
                                          file,
                                        )

                                        event.target.value = ''
                                      }}
                                    />
                                  </label>
                                </div>

                                {proof.rejection_reason && (
                                  <div className="rounded-lg border border-red-200 bg-red-50 p-3">
                                    <p className="text-xs font-semibold text-red-700">
                                      Admin feedback
                                    </p>

                                    <p className="mt-1 text-sm text-red-700">
                                      {proof.rejection_reason}
                                    </p>
                                  </div>
                                )}
                              </div>
                            ) : (
                              <div>
                                <p className="mb-3 text-sm text-slate-600">
                                  Please upload a screenshot or document
                                  showing the relevant proof for your winning
                                  entry.
                                </p>

                                <label className="flex cursor-pointer items-center justify-center gap-2 rounded-xl border-2 border-dashed border-[#cbd8cd] bg-white px-5 py-4 text-sm font-semibold text-[#356442] transition hover:border-[#7a9a81] hover:bg-[#f7faf7]">
                                  {uploading ? (
                                    <Loader2 className="h-5 w-5 animate-spin" />
                                  ) : (
                                    <Upload className="h-5 w-5" />
                                  )}

                                  {uploading
                                    ? 'Uploading...'
                                    : 'Upload proof'}

                                  <input
                                    type="file"
                                    accept=".jpg,.jpeg,.png,.webp,.pdf"
                                    className="hidden"
                                    disabled={uploading}
                                    onChange={(event) => {
                                      const file =
                                        event.target.files?.[0]

                                      void handleProofUpload(
                                        winner.id,
                                        file,
                                      )

                                      event.target.value = ''
                                    }}
                                  />
                                </label>

                                <p className="mt-2 text-xs text-slate-500">
                                  JPG, PNG, WEBP or PDF. Maximum size: 5 MB.
                                </p>
                              </div>
                            )}
                          </div>
                        </div>
                      )
                    })}
                  </div>
                )}
              </div>
            </section>
          </div>

          {/* RIGHT COLUMN */}
          <div className="space-y-8">
            {/* Subscription */}
            <section className="rounded-2xl border border-[#dfe6df] bg-white shadow-sm">
              <div className="border-b border-[#e7ece7] px-6 py-5">
                <div className="flex items-center gap-3">
                  <div className="rounded-xl bg-[#edf4ee] p-2 text-[#356442]">
                    <CreditCard className="h-5 w-5" />
                  </div>

                  <div>
                    <h2 className="text-xl font-bold text-[#17231b]">
                      Subscription
                    </h2>

                    <p className="mt-1 text-sm text-slate-500">
                      Your GolfKind membership.
                    </p>
                  </div>
                </div>
              </div>

              <div className="p-6">
                {activeSubscription ? (
                  <div>
                    <div className="mb-5 rounded-xl border border-emerald-200 bg-emerald-50 p-4">
                      <div className="flex items-center gap-2">
                        <CheckCircle2 className="h-5 w-5 text-emerald-600" />

                        <span className="font-semibold text-emerald-800">
                          Active subscription
                        </span>
                      </div>

                      <div className="mt-4 grid grid-cols-2 gap-4">
                        <div>
                          <p className="text-xs text-emerald-700/70">
                            Plan
                          </p>

                          <p className="mt-1 font-bold capitalize text-emerald-900">
                            {subscription?.plan_type}
                          </p>
                        </div>

                        <div>
                          <p className="text-xs text-emerald-700/70">
                            Amount
                          </p>

                          <p className="mt-1 font-bold text-emerald-900">
                            {formatMoney(subscription?.amount || 0)}
                          </p>
                        </div>

                        <div>
                          <p className="text-xs text-emerald-700/70">
                            Started
                          </p>

                          <p className="mt-1 font-medium text-emerald-900">
                            {formatDate(
                              subscription?.current_period_start,
                            )}
                          </p>
                        </div>

                        <div>
                          <p className="text-xs text-emerald-700/70">
                            Renews
                          </p>

                          <p className="mt-1 font-medium text-emerald-900">
                            {formatDate(
                              subscription?.current_period_end,
                            )}
                          </p>
                        </div>
                      </div>
                    </div>

                    <div className="mb-5 rounded-xl border border-[#e1e7e2] bg-[#fafcf9] p-4">
                      <div className="flex items-start gap-3">
                        <Heart className="mt-0.5 h-5 w-5 shrink-0 text-[#4f7658]" />

                        <div>
                          <p className="text-sm font-semibold text-[#34473a]">
                            Your charity contribution
                          </p>

                          <p className="mt-1 text-sm text-slate-600">
                            {subscription
                              ? formatMoney(subscription.charity_amount)
                              : '£0.00'}{' '}
                            from this subscription is allocated to charity.
                          </p>
                        </div>
                      </div>
                    </div>

                    <button
                      type="button"
                      onClick={handleCancelSubscription}
                      disabled={saving}
                      className="w-full rounded-xl border border-red-200 px-4 py-3 text-sm font-semibold text-red-600 transition hover:bg-red-50 disabled:opacity-60"
                    >
                      Cancel subscription
                    </button>
                  </div>
                ) : (
                  <div>
                    <div className="mb-5 rounded-xl border border-[#dfe6df] bg-[#fafcf9] p-4">
                      <div className="flex items-center gap-2">
                        <Clock3 className="h-5 w-5 text-amber-600" />

                        <span className="font-semibold text-[#34473a]">
                          No active subscription
                        </span>
                      </div>

                      <p className="mt-2 text-sm leading-6 text-slate-600">
                        Choose a membership plan to participate in GolfKind.
                      </p>
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                      <button
                        type="button"
                        onClick={() => setSelectedPlan('monthly')}
                        className={`rounded-xl border p-4 text-left transition ${
                          selectedPlan === 'monthly'
                            ? 'border-[#356442] bg-[#edf4ee]'
                            : 'border-[#dfe6df] bg-white hover:bg-slate-50'
                        }`}
                      >
                        <p className="text-sm font-semibold text-slate-600">
                          Monthly
                        </p>

                        <p className="mt-1 text-xl font-bold text-[#244d32]">
                          £20
                        </p>
                      </button>

                      <button
                        type="button"
                        onClick={() => setSelectedPlan('yearly')}
                        className={`rounded-xl border p-4 text-left transition ${
                          selectedPlan === 'yearly'
                            ? 'border-[#356442] bg-[#edf4ee]'
                            : 'border-[#dfe6df] bg-white hover:bg-slate-50'
                        }`}
                      >
                        <p className="text-sm font-semibold text-slate-600">
                          Yearly
                        </p>

                        <p className="mt-1 text-xl font-bold text-[#244d32]">
                          £200
                        </p>
                      </button>
                    </div>

                    <button
                      type="button"
                      onClick={handleSubscribe}
                      disabled={saving}
                      className="mt-4 flex w-full items-center justify-center gap-2 rounded-xl bg-[#244d32] px-4 py-3 text-sm font-semibold text-white transition hover:bg-[#1d4029] disabled:opacity-60"
                    >
                      Continue to checkout
                    </button>

                    <p className="mt-3 text-center text-xs text-slate-400">
                      Test checkout. No real payment is processed.
                    </p>
                  </div>
                )}
              </div>
            </section>

            {/* Charity */}
            <section className="rounded-2xl border border-[#dfe6df] bg-white shadow-sm">
              <div className="border-b border-[#e7ece7] px-6 py-5">
                <div className="flex items-center gap-3">
                  <div className="rounded-xl bg-[#edf4ee] p-2 text-[#356442]">
                    <Heart className="h-5 w-5" />
                  </div>

                  <div>
                    <h2 className="text-xl font-bold text-[#17231b]">
                      Your charity
                    </h2>

                    <p className="mt-1 text-sm text-slate-500">
                      Choose where your charitable contribution goes.
                    </p>
                  </div>
                </div>
              </div>

              <div className="p-6">
                <label
                  htmlFor="charity"
                  className="mb-2 block text-sm font-medium text-slate-700"
                >
                  Select charity
                </label>

                <select
                  id="charity"
                  value={selectedCharity}
                  onChange={(event) =>
                    setSelectedCharity(event.target.value)
                  }
                  className="w-full rounded-xl border border-[#d8e0d9] bg-white px-4 py-3 outline-none focus:border-[#356442] focus:ring-2 focus:ring-[#356442]/10"
                >
                  <option value="">Choose a charity</option>

                  {charities.map((charity) => (
                    <option key={charity.id} value={charity.id}>
                      {charity.name}
                    </option>
                  ))}
                </select>

                {selectedCharityObject && (
                  <div className="mt-4 rounded-xl border border-[#e0e7e1] bg-[#fafcf9] p-4">
                    <p className="font-semibold text-[#34473a]">
                      {selectedCharityObject.name}
                    </p>

                    {selectedCharityObject.description && (
                      <p className="mt-1 text-sm leading-6 text-slate-600">
                        {selectedCharityObject.description}
                      </p>
                    )}

                    {selectedCharityObject.upcoming_event && (
                      <p className="mt-3 text-xs font-medium text-[#356442]">
                        Upcoming: {selectedCharityObject.upcoming_event}
                      </p>
                    )}
                  </div>
                )}

                <div className="mt-5">
                  <label
                    htmlFor="charity-percentage"
                    className="mb-2 block text-sm font-medium text-slate-700"
                  >
                    Charity contribution
                  </label>

                  <div className="flex items-center gap-3">
                    <input
                      id="charity-percentage"
                      type="number"
                      min="10"
                      max="100"
                      value={charityPercentage}
                      onChange={(event) =>
                        setCharityPercentage(event.target.value)
                      }
                      className="w-full rounded-xl border border-[#d8e0d9] bg-white px-4 py-3 outline-none focus:border-[#356442] focus:ring-2 focus:ring-[#356442]/10"
                    />

                    <span className="font-semibold text-slate-600">
                      %
                    </span>
                  </div>

                  <p className="mt-2 text-xs text-slate-500">
                    Minimum contribution is 10%.
                  </p>
                </div>

                <button
                  type="button"
                  onClick={handleSaveCharity}
                  disabled={saving}
                  className="mt-5 flex w-full items-center justify-center gap-2 rounded-xl bg-[#244d32] px-4 py-3 text-sm font-semibold text-white transition hover:bg-[#1d4029] disabled:opacity-60"
                >
                  {saving ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <Save className="h-4 w-4" />
                  )}

                  Save charity preference
                </button>
              </div>
            </section>

            {/* Impact */}
            <section className="overflow-hidden rounded-2xl bg-[#244d32] p-6 text-white shadow-sm">
              <Heart className="mb-4 h-7 w-7 text-white/80" />

              <h2 className="text-xl font-bold">
                Your game can make a difference.
              </h2>

              <p className="mt-3 text-sm leading-6 text-white/75">
                GolfKind connects your love of golf with charitable giving.
                Every membership helps create a positive impact beyond the
                course.
              </p>

              <div className="mt-6 grid grid-cols-2 gap-4 border-t border-white/15 pt-5">
                <div>
                  <p className="text-2xl font-bold">
                    {profile?.charity_percentage || 10}%
                  </p>

                  <p className="mt-1 text-xs text-white/60">
                    Your selected contribution
                  </p>
                </div>

                <div>
                  <p className="text-2xl font-bold">
                    {activeSubscription ? 'Active' : '—'}
                  </p>

                  <p className="mt-1 text-xs text-white/60">
                    Membership status
                  </p>
                </div>
              </div>
            </section>
          </div>
        </div>
      </main>

      {/* Test Checkout Modal */}
      {showCheckout && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 px-4">
          <div
            className="w-full max-w-md rounded-2xl bg-white p-6 shadow-2xl"
            role="dialog"
            aria-modal="true"
            aria-labelledby="checkout-title"
          >
            <div className="mb-6 flex items-start justify-between">
              <div>
                <p className="text-sm font-semibold uppercase tracking-wide text-[#62836b]">
                  Test checkout
                </p>

                <h2
                  id="checkout-title"
                  className="mt-1 text-2xl font-bold text-[#17231b]"
                >
                  Complete your membership
                </h2>
              </div>

              <button
                type="button"
                onClick={() => setShowCheckout(false)}
                disabled={saving}
                aria-label="Close checkout"
                className="rounded-lg p-2 text-slate-500 transition hover:bg-slate-100 disabled:opacity-50"
              >
                <XCircle className="h-5 w-5" />
              </button>
            </div>

            <div className="rounded-xl border border-[#dfe6df] bg-[#fafcf9] p-4">
              <div className="flex items-center justify-between">
                <span className="text-sm text-slate-500">
                  Membership
                </span>

                <span className="font-semibold capitalize text-[#244d32]">
                  {selectedPlan}
                </span>
              </div>

              <div className="mt-3 flex items-center justify-between">
                <span className="text-sm text-slate-500">
                  Amount
                </span>

                <span className="text-xl font-bold text-[#17231b]">
                  {formatMoney(selectedPlan === 'monthly' ? 20 : 200)}
                </span>
              </div>

              <div className="mt-3 flex items-center justify-between">
                <span className="text-sm text-slate-500">
                  Charity contribution
                </span>

                <span className="font-semibold text-[#356442]">
                  {charityPercentage}%
                </span>
              </div>
            </div>

            <div className="mt-4 rounded-xl border border-amber-200 bg-amber-50 p-4">
              <div className="flex gap-3">
                <CreditCard className="mt-0.5 h-5 w-5 shrink-0 text-amber-600" />

                <div>
                  <p className="text-sm font-semibold text-amber-900">
                    Test payment mode
                  </p>

                  <p className="mt-1 text-xs leading-5 text-amber-800">
                    This is a demonstration checkout for the assignment.
                    No real payment will be processed.
                  </p>
                </div>
              </div>
            </div>

            <button
              type="button"
              onClick={handleTestPayment}
              disabled={saving}
              className="mt-6 flex w-full items-center justify-center gap-2 rounded-xl bg-[#244d32] px-4 py-3 text-sm font-semibold text-white transition hover:bg-[#1d4029] disabled:cursor-not-allowed disabled:opacity-60"
            >
              {saving && (
                <Loader2 className="h-4 w-4 animate-spin" />
              )}

              {saving ? 'Processing...' : 'Confirm test payment'}
            </button>

            <button
              type="button"
              onClick={() => setShowCheckout(false)}
              disabled={saving}
              className="mt-3 w-full rounded-xl border border-[#d8e0d9] px-4 py-3 text-sm font-semibold text-slate-700 transition hover:bg-slate-50 disabled:opacity-60"
            >
              Cancel
            </button>

            <p className="mt-4 text-center text-xs text-slate-400">
              Production payment processing can be connected to Stripe or
              another PCI-compliant provider.
            </p>
          </div>
        </div>
      )}
    </div>
  )
}