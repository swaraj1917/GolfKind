import Charities from './pages/Charities'
import { useEffect, useState, type FormEvent } from 'react'
import {
  BrowserRouter,
  Routes,
  Route,
  Navigate,
  Link,
} from 'react-router-dom'

import Register from './pages/Register'
import Login from './pages/Login'
import Dashboard from './pages/Dashboard'
import ProtectedRoute from './components/ProtectedRoute'
import AdminRoute from './components/AdminRoute'

import {
  getAllUsers,
  getAllSubscriptions,
  getAllCharities,
  createCharity,
  updateCharityStatus,
  publishDraw,
  getAllDraws,
  calculatePrizeDistribution,
  simulateDraw,
  createAdminDraw,
  finalizeAdminDraw,
} from './services/adminService'

import {
  getAllWinners,
  getProofDownloadUrl,
  reviewWinnerProof,
  markWinnerPaid,
} from './services/winnerService'

import { getCurrentUser } from './services/authService'

function HomePage() {
  const charities = [
    {
      name: 'Golf for Good Foundation',
      description:
        'Supporting youth development and access to sport through community golf programmes.',
    },
    {
      name: 'Green Future Initiative',
      description:
        'Helping communities protect green spaces and build a more sustainable future.',
    },
    {
      name: 'Children First Trust',
      description:
        'Supporting children and young people through education and community programmes.',
    },
  ]

  return (
    <div className="min-h-screen bg-[#f5f7f4] text-[#17231b]">
      {/* Navigation */}
      <nav className="sticky top-0 z-50 border-b border-[#dfe6df] bg-[#f5f7f4]/95 backdrop-blur">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4 lg:px-8">
          <Link
            to="/"
            className="flex items-center gap-3"
          >
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#183d2a] text-lg font-bold text-white">
              G
            </div>

            <div>
              <div className="text-xl font-bold tracking-tight">
                GolfKind
              </div>

              <div className="text-xs text-[#66736a]">
                Play. Give. Win.
              </div>
            </div>
          </Link>

          <div className="hidden items-center gap-8 md:flex">
            <a
              href="#how-it-works"
              className="text-sm font-medium text-[#526057] transition hover:text-[#183d2a]"
            >
              How it works
            </a>

            <a
              href="#charities"
              className="text-sm font-medium text-[#526057] transition hover:text-[#183d2a]"
            >
              Our causes
            </a>

            <a
              href="#draw"
              className="text-sm font-medium text-[#526057] transition hover:text-[#183d2a]"
            >
              Monthly draw
            </a>

            <Link
              to="/login"
              className="text-sm font-semibold text-[#183d2a]"
            >
              Log in
            </Link>

            <Link
              to="/register"
              className="rounded-full bg-[#183d2a] px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-[#28563d]"
            >
              Get started
            </Link>
          </div>

          <Link
            to="/register"
            className="rounded-full bg-[#183d2a] px-4 py-2 text-sm font-semibold text-white md:hidden"
          >
            Join
          </Link>
        </div>
      </nav>

      {/* Hero */}
      <section className="relative overflow-hidden">
        <div className="mx-auto grid max-w-7xl gap-12 px-6 py-20 lg:grid-cols-2 lg:items-center lg:px-8 lg:py-28">
          <div>
            <div className="mb-6 inline-flex items-center rounded-full border border-[#cbd8cd] bg-white px-4 py-2 text-sm font-medium text-[#31533d] shadow-sm">
              <span className="mr-2 h-2 w-2 rounded-full bg-[#5e9b6d]" />
              Golf with a purpose
            </div>

            <h1 className="max-w-3xl text-5xl font-bold leading-[1.05] tracking-tight text-[#183d2a] sm:text-6xl lg:text-7xl">
              Your game can make a difference.
            </h1>

            <p className="mt-7 max-w-xl text-lg leading-8 text-[#5f6d63]">
              GolfKind brings golf performance, charitable giving and
              monthly rewards together. Play your rounds, support causes
              you care about and become part of something bigger.
            </p>

            <div className="mt-9 flex flex-col gap-3 sm:flex-row">
              <Link
                to="/register"
                className="rounded-full bg-[#183d2a] px-7 py-3.5 text-center font-semibold text-white shadow-lg shadow-[#183d2a]/15 transition hover:-translate-y-0.5 hover:bg-[#28563d]"
              >
                Start your GolfKind journey
              </Link>

              <a
                href="#how-it-works"
                className="rounded-full border border-[#cbd5cc] bg-white px-7 py-3.5 text-center font-semibold text-[#294536] transition hover:border-[#183d2a]"
              >
                See how it works
              </a>
            </div>

            <div className="mt-10 flex flex-wrap gap-8 text-sm text-[#66736a]">
              <div>
                <strong className="block text-xl text-[#183d2a]">
                  10%
                </strong>
                minimum charity contribution
              </div>

              <div>
                <strong className="block text-xl text-[#183d2a]">
                  5
                </strong>
                latest scores tracked
              </div>

              <div>
                <strong className="block text-xl text-[#183d2a]">
                  Monthly
                </strong>
                reward draw
              </div>
            </div>
          </div>

          <div className="relative">
            <div className="absolute -right-10 -top-10 h-40 w-40 rounded-full bg-[#d9eadb] blur-3xl" />
            <div className="absolute -bottom-10 -left-10 h-40 w-40 rounded-full bg-[#e5dcc6] blur-3xl" />

            <div className="relative overflow-hidden rounded-[2rem] bg-[#183d2a] p-6 shadow-2xl">
              <div className="rounded-[1.5rem] bg-[#edf3ed] p-7">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-semibold text-[#526057]">
                    YOUR IMPACT
                  </span>

                  <span className="rounded-full bg-white px-3 py-1 text-xs font-semibold text-[#31533d]">
                    MEMBER
                  </span>
                </div>

                <div className="mt-8">
                  <p className="text-sm text-[#66736a]">
                    This month
                  </p>

                  <p className="mt-1 text-5xl font-bold text-[#183d2a]">
                    18%
                  </p>

                  <p className="mt-2 text-sm text-[#66736a]">
                    of your subscription directed toward your chosen cause
                  </p>
                </div>

                <div className="mt-8 h-3 overflow-hidden rounded-full bg-white">
                  <div className="h-full w-[68%] rounded-full bg-[#5e9b6d]" />
                </div>

                <div className="mt-7 grid grid-cols-2 gap-3">
                  <div className="rounded-2xl bg-white p-4">
                    <p className="text-xs text-[#718078]">
                      Latest score
                    </p>

                    <p className="mt-1 text-2xl font-bold text-[#183d2a]">
                      37
                    </p>
                  </div>

                  <div className="rounded-2xl bg-white p-4">
                    <p className="text-xs text-[#718078]">
                      Draw status
                    </p>

                    <p className="mt-1 text-2xl font-bold text-[#183d2a]">
                      Active
                    </p>
                  </div>
                </div>
              </div>

              <div className="mt-5 flex items-center justify-between px-2 text-white">
                <span className="text-sm text-[#d5e2d8]">
                  Better golf. Bigger impact.
                </span>

                <span className="text-lg">↗</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* How it works */}
      <section
        id="how-it-works"
        className="border-y border-[#dfe6df] bg-white"
      >
        <div className="mx-auto max-w-7xl px-6 py-20 lg:px-8">
          <div className="max-w-2xl">
            <p className="text-sm font-bold uppercase tracking-[0.2em] text-[#5e9b6d]">
              How it works
            </p>

            <h2 className="mt-3 text-4xl font-bold tracking-tight text-[#183d2a]">
              Three simple ways to make your game count.
            </h2>
          </div>

          <div className="mt-12 grid gap-6 md:grid-cols-3">
            {[
              {
                number: '01',
                title: 'Play & track',
                text: 'Keep your latest Stableford scores organised in one simple member dashboard.',
              },
              {
                number: '02',
                title: 'Choose your cause',
                text: 'Select a charity you care about and decide how much of your subscription you want to contribute.',
              },
              {
                number: '03',
                title: 'Take part',
                text: 'Active members participate in the monthly reward draw while supporting positive impact.',
              },
            ].map((item) => (
              <article
                key={item.number}
                className="rounded-3xl border border-[#e0e7e1] bg-[#f8faf8] p-7 transition hover:-translate-y-1 hover:shadow-lg"
              >
                <span className="text-sm font-bold text-[#6b9b75]">
                  {item.number}
                </span>

                <h3 className="mt-6 text-2xl font-bold text-[#183d2a]">
                  {item.title}
                </h3>

                <p className="mt-3 leading-7 text-[#68756c]">
                  {item.text}
                </p>
              </article>
            ))}
          </div>
        </div>
      </section>

      {/* Charity */}
      <section
        id="charities"
        className="mx-auto max-w-7xl px-6 py-20 lg:px-8"
      >
        <div className="grid gap-12 lg:grid-cols-[0.8fr_1.2fr] lg:items-center">
          <div>
            <p className="text-sm font-bold uppercase tracking-[0.2em] text-[#5e9b6d]">
              Your impact
            </p>

            <h2 className="mt-3 text-4xl font-bold tracking-tight text-[#183d2a]">
              Your subscription can support a cause you believe in.
            </h2>

            <p className="mt-5 leading-8 text-[#68756c]">
              GolfKind puts charitable giving directly into the
              membership experience. Choose your cause, set your
              contribution and see your impact alongside your golf
              journey.
            </p>

            <Link
              to="/register"
              className="mt-7 inline-flex rounded-full bg-[#183d2a] px-6 py-3 font-semibold text-white transition hover:bg-[#28563d]"
            >
              Choose your cause
            </Link>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            {charities.map((charity, index) => (
              <article
                key={charity.name}
                className={`rounded-3xl p-6 ${
                  index === 0
                    ? 'bg-[#183d2a] text-white sm:row-span-2'
                    : 'border border-[#dfe6df] bg-white'
                }`}
              >
                <div
                  className={`flex h-11 w-11 items-center justify-center rounded-2xl ${
                    index === 0
                      ? 'bg-white/15'
                      : 'bg-[#edf3ed]'
                  }`}
                >
                  {index === 0 ? '♥' : '✦'}
                </div>

                <h3 className="mt-7 text-xl font-bold">
                  {charity.name}
                </h3>

                <p
                  className={`mt-3 text-sm leading-6 ${
                    index === 0
                      ? 'text-[#d4e2d7]'
                      : 'text-[#68756c]'
                  }`}
                >
                  {charity.description}
                </p>

                {index === 0 && (
                  <div className="mt-10 rounded-2xl bg-white/10 p-4">
                    <p className="text-xs uppercase tracking-wider text-[#bdd2c2]">
                      Featured cause
                    </p>

                    <p className="mt-2 text-sm text-white">
                      Making every round matter beyond the course.
                    </p>
                  </div>
                )}
              </article>
            ))}
          </div>
        </div>
      </section>

      {/* Draw */}
      <section
        id="draw"
        className="bg-[#183d2a] text-white"
      >
        <div className="mx-auto max-w-7xl px-6 py-20 lg:px-8">
          <div className="grid gap-12 lg:grid-cols-2 lg:items-center">
            <div>
              <p className="text-sm font-bold uppercase tracking-[0.2em] text-[#a7c9ae]">
                Monthly reward draw
              </p>

              <h2 className="mt-3 text-4xl font-bold tracking-tight sm:text-5xl">
                One monthly draw. Multiple ways to win.
              </h2>

              <p className="mt-5 max-w-xl leading-8 text-[#c9d9cc]">
                Active subscribers can participate in GolfKind's
                monthly reward system, with prize pools distributed
                across different match levels.
              </p>

              <Link
                to="/register"
                className="mt-8 inline-flex rounded-full bg-white px-6 py-3 font-semibold text-[#183d2a] transition hover:bg-[#edf3ed]"
              >
                Become a member
              </Link>
            </div>

            <div className="rounded-3xl bg-white/10 p-6 backdrop-blur">
              <div className="mb-5 flex items-center justify-between">
                <span className="font-semibold">
                  Prize structure
                </span>

                <span className="rounded-full bg-white/10 px-3 py-1 text-xs">
                  Monthly
                </span>
              </div>

              {[
                ['5-number match', '40%', 'Jackpot rollover'],
                ['4-number match', '35%', 'Shared prize pool'],
                ['3-number match', '25%', 'Shared prize pool'],
              ].map(([match, percentage, note]) => (
                <div
                  key={match}
                  className="border-t border-white/10 py-5 first:border-0"
                >
                  <div className="flex items-center justify-between">
                    <span className="font-medium">
                      {match}
                    </span>

                    <span className="text-xl font-bold">
                      {percentage}
                    </span>
                  </div>

                  <p className="mt-1 text-sm text-[#b9ccbd]">
                    {note}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Final CTA */}
      <section className="mx-auto max-w-7xl px-6 py-20 lg:px-8">
        <div className="rounded-[2rem] bg-[#e3ece4] px-6 py-14 text-center sm:px-12">
          <p className="text-sm font-bold uppercase tracking-[0.2em] text-[#5e9b6d]">
            Ready to play with purpose?
          </p>

          <h2 className="mx-auto mt-4 max-w-2xl text-4xl font-bold tracking-tight text-[#183d2a]">
            Your next round can be part of something bigger.
          </h2>

          <p className="mx-auto mt-4 max-w-xl text-[#66736a]">
            Join GolfKind and bring your golf, your giving and your
            monthly rewards together.
          </p>

          <Link
            to="/register"
            className="mt-8 inline-flex rounded-full bg-[#183d2a] px-8 py-3.5 font-semibold text-white shadow-lg transition hover:bg-[#28563d]"
          >
            Get started
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-[#dfe6df] bg-white">
        <div className="mx-auto flex max-w-7xl flex-col gap-4 px-6 py-8 text-sm text-[#6a766e] sm:flex-row sm:items-center sm:justify-between lg:px-8">
          <div>
            <span className="font-bold text-[#183d2a]">
              GolfKind
            </span>{' '}
            — Play. Give. Win.
          </div>

          <div className="flex gap-6">
            <Link
              to="/login"
              className="hover:text-[#183d2a]"
            >
              Login
            </Link>

            <Link
              to="/register"
              className="hover:text-[#183d2a]"
            >
              Register
            </Link>
          </div>
        </div>
      </footer>
    </div>
  )
}

function AdminPage() {
  const [users, setUsers] = useState<any[]>([])
  const [subscriptions, setSubscriptions] = useState<any[]>([])
  const [charities, setCharities] = useState<any[]>([])
  const [draws, setDraws] = useState<any[]>([])
  const [winners, setWinners] = useState<any[]>([])

  const [rejectionReasons, setRejectionReasons] = useState<
    Record<string, string>
  >({})

  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')

  const [charityName, setCharityName] = useState('')
  const [charityDescription, setCharityDescription] = useState('')
  const [charityImage, setCharityImage] = useState('')
  const [charityWebsite, setCharityWebsite] = useState('')
  const [charityEvent, setCharityEvent] = useState('')
  const [charityFeatured, setCharityFeatured] = useState(false)

  const [drawMonth, setDrawMonth] = useState('')
  const [drawType, setDrawType] = useState<
    'random' | 'algorithmic'
  >('random')

  const [drawNumbers, setDrawNumbers] = useState<number[]>([])
  const [drawPool, setDrawPool] = useState(0)
  const [drawSubscriberCount, setDrawSubscriberCount] = useState(0)
  const [drawSimulationReady, setDrawSimulationReady] = useState(false)
  const [drawActionLoading, setDrawActionLoading] = useState(false)

  async function loadAdminData() {
    try {
      setLoading(true)
      setError('')

      const [
        usersData,
        subscriptionsData,
        charitiesData,
        drawsData,
        winnersData,
      ] = await Promise.all([
        getAllUsers(),
        getAllSubscriptions(),
        getAllCharities(),
        getAllDraws(),
        getAllWinners(),
      ])

      setUsers(usersData)
      setSubscriptions(subscriptionsData)
      setCharities(charitiesData)
      setDraws(drawsData)
      setWinners(winnersData)
    } catch (err) {
      if (err instanceof Error) {
        setError(err.message)
      } else {
        setError('Unable to load admin dashboard.')
      }
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadAdminData()
  }, [])

  function clearMessages() {
    setError('')
    setSuccess('')
  }

  async function handleCreateCharity(
    event: FormEvent<HTMLFormElement>,
  ) {
    event.preventDefault()
    clearMessages()

    if (!charityName.trim()) {
      setError('Charity name is required.')
      return
    }

    try {
      await createCharity(
        charityName,
        charityDescription,
        charityImage,
        charityWebsite,
        charityEvent,
        charityFeatured,
      )

      setCharityName('')
      setCharityDescription('')
      setCharityImage('')
      setCharityWebsite('')
      setCharityEvent('')
      setCharityFeatured(false)

      setSuccess('Charity created successfully.')

      const updatedCharities = await getAllCharities()
      setCharities(updatedCharities)
    } catch (err) {
      if (err instanceof Error) {
        setError(err.message)
      } else {
        setError('Unable to create charity.')
      }
    }
  }

  async function handleCharityStatus(
    charityId: string,
    isActive: boolean,
  ) {
    clearMessages()

    try {
      await updateCharityStatus(charityId, !isActive)

      setSuccess(
        !isActive
          ? 'Charity activated.'
          : 'Charity deactivated.',
      )

      const updatedCharities = await getAllCharities()
      setCharities(updatedCharities)
    } catch (err) {
      if (err instanceof Error) {
        setError(err.message)
      } else {
        setError('Unable to update charity status.')
      }
    }
  }

  async function prepareDraw() {
    clearMessages()

    if (!drawMonth) {
      setError('Please select a draw month.')
      return
    }

    try {
      setDrawActionLoading(true)

      const result = await simulateDraw(
        drawType,
        drawMonth,
      )

      setDrawNumbers(result.winningNumbers)
      setDrawPool(result.totalPrizePool)
      setDrawSubscriberCount(
        result.subscriberCount,
      )
      setDrawSimulationReady(true)

      setSuccess(
        `Draw simulation generated for ${drawMonth} using ${result.subscriberCount} active subscribers.`,
      )
    } catch (err) {
      if (err instanceof Error) {
        setError(err.message)
      } else {
        setError('Unable to simulate draw.')
      }
    } finally {
      setDrawActionLoading(false)
    }
  }

  async function handleCreateDraw() {
    clearMessages()

    if (!drawMonth) {
      setError('Please select a draw month.')
      return
    }

    if (!drawSimulationReady) {
      setError(
        'Please simulate the draw before creating it.',
      )
      return
    }

    if (drawNumbers.length !== 5) {
      setError(
        'The simulated draw must contain exactly 5 winning numbers.',
      )
      return
    }

    try {
      setDrawActionLoading(true)

      const result = await createAdminDraw(
        drawType,
        drawMonth,
        drawNumbers,
      )

      setSuccess(
        `Draw created successfully for ${result.draw.draw_month}. Subscribers can now submit their 5-number entries.`,
      )

      setDrawMonth('')
      setDrawNumbers([])
      setDrawPool(0)
      setDrawSubscriberCount(0)
      setDrawSimulationReady(false)

      const updatedDraws = await getAllDraws()
      setDraws(updatedDraws)
    } catch (err) {
      if (err instanceof Error) {
        setError(err.message)
      } else {
        setError('Unable to create draw.')
      }
    } finally {
      setDrawActionLoading(false)
    }
  }

  async function handleFinalizeDraw(drawId: string) {
    clearMessages()

    try {
      setDrawActionLoading(true)

      const result =
        await finalizeAdminDraw(drawId)

      setSuccess(
        `Draw finalized. ${result.winnersCreated} winner record(s) were created.`,
      )

      const [
        updatedDraws,
        updatedWinners,
      ] = await Promise.all([
        getAllDraws(),
        getAllWinners(),
      ])

      setDraws(updatedDraws)
      setWinners(updatedWinners)
    } catch (err) {
      if (err instanceof Error) {
        setError(err.message)
      } else {
        setError('Unable to finalize draw.')
      }
    } finally {
      setDrawActionLoading(false)
    }
  }

  async function handlePublishDraw(drawId: string) {
    clearMessages()

    try {
      setDrawActionLoading(true)

      await publishDraw(drawId)

      setSuccess('Draw published successfully.')

      const updatedDraws = await getAllDraws()
      setDraws(updatedDraws)
    } catch (err) {
      if (err instanceof Error) {
        setError(err.message)
      } else {
        setError('Unable to publish draw.')
      }
    } finally {
      setDrawActionLoading(false)
    }
  }

  async function handleViewProof(filePath: string) {
    clearMessages()

    try {
      const signedUrl =
        await getProofDownloadUrl(filePath)

      window.open(
        signedUrl,
        '_blank',
        'noopener,noreferrer',
      )
    } catch (err) {
      if (err instanceof Error) {
        setError(err.message)
      } else {
        setError('Unable to open winner proof.')
      }
    }
  }

  async function handleWinnerVerification(
    winnerId: string,
    status: 'approved' | 'rejected',
  ) {
    clearMessages()

    try {
      const user = await getCurrentUser()

      if (!user) {
        throw new Error('Admin session not found.')
      }

      const rejectionReason =
        rejectionReasons[winnerId]?.trim() ||
        undefined

      if (
        status === 'rejected' &&
        !rejectionReason
      ) {
        setError(
          'Please enter a rejection reason.',
        )
        return
      }

      await reviewWinnerProof(
        winnerId,
        status,
        user.id,
        rejectionReason,
      )

      setSuccess(
        status === 'approved'
          ? 'Winner proof approved successfully.'
          : 'Winner proof rejected successfully.',
      )

      const updatedWinners =
        await getAllWinners()

      setWinners(updatedWinners)

      setRejectionReasons((current) => {
        const updated = { ...current }
        delete updated[winnerId]
        return updated
      })
    } catch (err) {
      if (err instanceof Error) {
        setError(err.message)
      } else {
        setError(
          'Unable to update winner verification.',
        )
      }
    }
  }

  async function handleMarkPaid(winnerId: string) {
    clearMessages()

    try {
      await markWinnerPaid(winnerId)

      setSuccess('Winner marked as paid.')

      const updatedWinners =
        await getAllWinners()

      setWinners(updatedWinners)
    } catch (err) {
      if (err instanceof Error) {
        setError(err.message)
      } else {
        setError('Unable to mark winner as paid.')
      }
    }
  }

  const activeSubscribers =
    subscriptions.filter(
      (subscription) =>
        subscription.status === 'active',
    ).length

  const activeCharities =
    charities.filter(
      (charity) => charity.is_active,
    ).length

  const totalPrizePool =
    subscriptions
      .filter(
        (subscription) =>
          subscription.status === 'active',
      )
      .reduce(
        (total, subscription) =>
          total +
          Number(
            subscription.prize_pool_amount || 0,
          ),
        0,
      )

  const prizeDistribution =
    calculatePrizeDistribution(drawPool)

  if (loading) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-[#f5f7f4]">
        <p className="text-[#526057]">
          Loading GolfKind admin...
        </p>
      </main>
    )
  }

  return (
    <main className="min-h-screen bg-[#f5f7f4] text-[#17231b]">
      <header className="border-b border-[#dfe6df] bg-white">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-5 lg:px-8">
          <div>
            <h1 className="text-2xl font-bold text-[#183d2a]">
              GolfKind Admin
            </h1>

            <p className="text-sm text-[#68756c]">
              Platform management and draw administration
            </p>
          </div>

          <Link
            to="/dashboard"
            className="rounded-full bg-[#183d2a] px-5 py-2.5 text-sm font-semibold text-white"
          >
            Member Dashboard
          </Link>
        </div>
      </header>

      <div className="mx-auto max-w-7xl space-y-8 px-6 py-10 lg:px-8">
        {error && (
          <div className="rounded-2xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">
            {error}
          </div>
        )}

        {success && (
          <div className="rounded-2xl border border-[#c9ddcc] bg-[#edf6ee] p-4 text-sm text-[#315b3b]">
            {success}
          </div>
        )}

        {/* Stats */}
        <section className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {[
            ['Total Users', users.length],
            [
              'Active Subscribers',
              activeSubscribers,
            ],
            ['Active Charities', activeCharities],
            [
              'Prize Pool',
              `£${totalPrizePool.toFixed(2)}`,
            ],
          ].map(([label, value]) => (
            <article
              key={label}
              className="rounded-3xl border border-[#dfe6df] bg-white p-6 shadow-sm"
            >
              <p className="text-sm text-[#718078]">
                {label}
              </p>

              <p className="mt-2 text-3xl font-bold text-[#183d2a]">
                {value}
              </p>
            </article>
          ))}
        </section>

        {/* Create Charity */}
        <section className="rounded-3xl border border-[#dfe6df] bg-white p-7">
          <h2 className="text-2xl font-bold text-[#183d2a]">
            Create Charity
          </h2>

          <form
            onSubmit={handleCreateCharity}
            className="mt-6 grid gap-4 md:grid-cols-2"
          >
            <input
              value={charityName}
              onChange={(event) =>
                setCharityName(event.target.value)
              }
              placeholder="Charity name"
              className="rounded-xl border border-[#d4ddd5] px-4 py-3 outline-none focus:border-[#5e9b6d]"
            />

            <input
              value={charityWebsite}
              onChange={(event) =>
                setCharityWebsite(event.target.value)
              }
              placeholder="Website URL"
              className="rounded-xl border border-[#d4ddd5] px-4 py-3 outline-none focus:border-[#5e9b6d]"
            />

            <textarea
              value={charityDescription}
              onChange={(event) =>
                setCharityDescription(
                  event.target.value,
                )
              }
              placeholder="Charity description"
              className="rounded-xl border border-[#d4ddd5] px-4 py-3 outline-none focus:border-[#5e9b6d] md:col-span-2"
              rows={3}
            />

            <input
              value={charityImage}
              onChange={(event) =>
                setCharityImage(
                  event.target.value,
                )
              }
              placeholder="Image URL"
              className="rounded-xl border border-[#d4ddd5] px-4 py-3 outline-none focus:border-[#5e9b6d]"
            />

            <input
              value={charityEvent}
              onChange={(event) =>
                setCharityEvent(
                  event.target.value,
                )
              }
              placeholder="Upcoming event"
              className="rounded-xl border border-[#d4ddd5] px-4 py-3 outline-none focus:border-[#5e9b6d]"
            />

            <label className="flex items-center gap-2 text-sm text-[#526057]">
              <input
                type="checkbox"
                checked={charityFeatured}
                onChange={(event) =>
                  setCharityFeatured(
                    event.target.checked,
                  )
                }
              />

              Featured charity
            </label>

            <div>
              <button
                type="submit"
                className="rounded-full bg-[#183d2a] px-6 py-3 font-semibold text-white"
              >
                Create Charity
              </button>
            </div>
          </form>
        </section>

        {/* Charities */}
        <section className="rounded-3xl border border-[#dfe6df] bg-white p-7">
          <h2 className="text-2xl font-bold text-[#183d2a]">
            Charities
          </h2>

          <div className="mt-6 grid gap-4 md:grid-cols-2">
            {charities.map((charity) => (
              <article
                key={charity.id}
                className="rounded-2xl border border-[#e1e7e2] p-5"
              >
                <h3 className="font-bold text-[#183d2a]">
                  {charity.name}
                  {charity.is_featured ? ' ★' : ''}
                </h3>

                <p className="mt-2 text-sm leading-6 text-[#68756c]">
                  {charity.description}
                </p>

                <p className="mt-3 text-sm">
                  Status:{' '}
                  <strong>
                    {charity.is_active
                      ? 'Active'
                      : 'Inactive'}
                  </strong>
                </p>

                <button
                  onClick={() =>
                    handleCharityStatus(
                      charity.id,
                      charity.is_active,
                    )
                  }
                  className="mt-4 rounded-full border border-[#cbd8cd] px-4 py-2 text-sm font-semibold text-[#31533d]"
                >
                  {charity.is_active
                    ? 'Deactivate'
                    : 'Activate'}
                </button>
              </article>
            ))}
          </div>
        </section>

        {/* Draw Simulator */}
        <section className="rounded-3xl border border-[#dfe6df] bg-white p-7">
          <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h2 className="text-2xl font-bold text-[#183d2a]">
                Monthly Draw
              </h2>

              <p className="mt-1 text-sm text-[#68756c]">
                Simulate the draw first, then create the
                monthly draw. Subscribers submit their own
                5-number entries.
              </p>
            </div>

            <span className="rounded-full bg-[#edf3ed] px-4 py-2 text-sm font-semibold text-[#31533d]">
              {activeSubscribers} active subscribers
            </span>
          </div>

          <div className="mt-6 grid gap-4 md:grid-cols-3">
            <div>
              <label className="mb-2 block text-sm font-semibold text-[#526057]">
                Draw month
              </label>

              <input
                type="month"
                value={drawMonth}
                onChange={(event) => {
                  setDrawMonth(
                    event.target.value,
                  )
                  setDrawSimulationReady(false)
                  setDrawNumbers([])
                }}
                className="w-full rounded-xl border border-[#d4ddd5] px-4 py-3 outline-none focus:border-[#5e9b6d]"
              />
            </div>

            <div>
              <label className="mb-2 block text-sm font-semibold text-[#526057]">
                Draw method
              </label>

              <select
                value={drawType}
                onChange={(event) => {
                  setDrawType(
                    event.target.value as
                      | 'random'
                      | 'algorithmic',
                  )
                  setDrawSimulationReady(false)
                  setDrawNumbers([])
                }}
                className="w-full rounded-xl border border-[#d4ddd5] px-4 py-3 outline-none focus:border-[#5e9b6d]"
              >
                <option value="random">
                  Random
                </option>

                <option value="algorithmic">
                  Algorithmic
                </option>
              </select>
            </div>

            <div className="flex items-end">
              <button
                onClick={prepareDraw}
                disabled={drawActionLoading}
                className="w-full rounded-xl bg-[#183d2a] px-5 py-3 font-semibold text-white transition hover:bg-[#28563d] disabled:cursor-not-allowed disabled:opacity-50"
              >
                {drawActionLoading
                  ? 'Simulating...'
                  : 'Simulate Draw'}
              </button>
            </div>
          </div>

          {drawNumbers.length > 0 && (
            <div className="mt-6 rounded-2xl bg-[#f2f6f2] p-6">
              <div className="flex flex-col gap-5 lg:flex-row lg:items-start lg:justify-between">
                <div>
                  <p className="text-sm font-semibold text-[#68756c]">
                    Simulated winning numbers
                  </p>

                  <div className="mt-4 flex flex-wrap gap-3">
                    {drawNumbers.map(
                      (number) => (
                        <span
                          key={number}
                          className="flex h-12 w-12 items-center justify-center rounded-full bg-[#183d2a] font-bold text-white shadow-sm"
                        >
                          {number}
                        </span>
                      ),
                    )}
                  </div>
                </div>

                <div className="rounded-2xl bg-white px-5 py-4">
                  <p className="text-xs text-[#718078]">
                    Active subscribers
                  </p>

                  <p className="mt-1 text-2xl font-bold text-[#183d2a]">
                    {drawSubscriberCount}
                  </p>
                </div>
              </div>

              <div className="mt-6 grid gap-3 sm:grid-cols-3">
                <div className="rounded-xl bg-white p-4">
                  <p className="text-xs text-[#718078]">
                    Total prize pool
                  </p>

                  <p className="mt-1 text-xl font-bold text-[#183d2a]">
                    £{drawPool.toFixed(2)}
                  </p>
                </div>

                <div className="rounded-xl bg-white p-4">
                  <p className="text-xs text-[#718078]">
                    5-match pool
                  </p>

                  <p className="mt-1 text-xl font-bold text-[#183d2a]">
                    £
                    {prizeDistribution.fiveMatch.toFixed(
                      2,
                    )}
                  </p>
                </div>

                <div className="rounded-xl bg-white p-4">
                  <p className="text-xs text-[#718078]">
                    4 + 3 match pools
                  </p>

                  <p className="mt-1 text-xl font-bold text-[#183d2a]">
                    £
                    {(
                      prizeDistribution.fourMatch +
                      prizeDistribution.threeMatch
                    ).toFixed(2)}
                  </p>
                </div>
              </div>

              <div className="mt-5 rounded-xl border border-[#d8e4d9] bg-white p-4 text-sm text-[#526057]">
                <strong>Draw method:</strong>{' '}
                {drawType === 'random'
                  ? 'Random number generation'
                  : 'Algorithmic weighting based on subscriber score data'}
              </div>

              <button
                onClick={handleCreateDraw}
                disabled={
                  drawActionLoading ||
                  !drawSimulationReady
                }
                className="mt-6 rounded-full bg-[#5e9b6d] px-6 py-3 font-semibold text-white transition hover:bg-[#4d895c] disabled:cursor-not-allowed disabled:opacity-50"
              >
                {drawActionLoading
                  ? 'Creating Draw...'
                  : 'Create Monthly Draw'}
              </button>
            </div>
          )}

          {!drawNumbers.length && (
            <div className="mt-6 rounded-2xl border border-dashed border-[#cfdacf] bg-[#f8faf8] p-6 text-center">
              <p className="font-medium text-[#526057]">
                No draw simulation yet.
              </p>

              <p className="mt-1 text-sm text-[#7a867e]">
                Select a month and draw method, then click
                Simulate Draw.
              </p>
            </div>
          )}
        </section>

        {/* Draws */}
        <section className="rounded-3xl border border-[#dfe6df] bg-white p-7">
          <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h2 className="text-2xl font-bold text-[#183d2a]">
                Draws
              </h2>

              <p className="mt-1 text-sm text-[#68756c]">
                Manage simulated, finalized and published
                monthly draws.
              </p>
            </div>
          </div>

          <div className="mt-6 space-y-4">
            {draws.length === 0 ? (
              <p className="text-[#68756c]">
                No draws created yet.
              </p>
            ) : (
              draws.map((draw) => {
                const isPublished =
                  draw.status === 'published'

                const isSimulated =
                  draw.status === 'simulated'

                const isDraft =
                  draw.status === 'draft'

                return (
                  <article
                    key={draw.id}
                    className="rounded-2xl border border-[#e1e7e2] p-5"
                  >
                    <div className="flex flex-col gap-5 lg:flex-row lg:items-start lg:justify-between">
                      <div>
                        <div className="flex flex-wrap items-center gap-2">
                          <h3 className="font-bold text-[#183d2a]">
                            {new Date(
                              draw.draw_month,
                            ).toLocaleDateString(
                              undefined,
                              {
                                month: 'long',
                                year: 'numeric',
                              },
                            )}
                          </h3>

                          <span
                            className={`rounded-full px-3 py-1 text-xs font-semibold capitalize ${
                              isPublished
                                ? 'bg-[#edf6ee] text-[#315b3b]'
                                : isSimulated
                                  ? 'bg-[#fff5df] text-[#765f32]'
                                  : 'bg-[#f0f2f1] text-[#526057]'
                            }`}
                          >
                            {draw.status}
                          </span>
                        </div>

                        <p className="mt-1 text-sm capitalize text-[#68756c]">
                          {draw.draw_type} draw
                        </p>

                        <div className="mt-4 flex flex-wrap gap-2">
                          {draw.winning_numbers?.map(
                            (
                              number: number,
                            ) => (
                              <span
                                key={number}
                                className="rounded-full bg-[#edf3ed] px-3 py-1 text-sm font-semibold text-[#31533d]"
                              >
                                {number}
                              </span>
                            ),
                          )}
                        </div>

                        <div className="mt-4 grid gap-3 sm:grid-cols-3">
                          <div className="rounded-xl bg-[#f5f7f4] p-3">
                            <p className="text-xs text-[#718078]">
                              Subscribers
                            </p>

                            <p className="mt-1 font-bold text-[#183d2a]">
                              {
                                draw.subscriber_count
                              }
                            </p>
                          </div>

                          <div className="rounded-xl bg-[#f5f7f4] p-3">
                            <p className="text-xs text-[#718078]">
                              Prize pool
                            </p>

                            <p className="mt-1 font-bold text-[#183d2a]">
                              £
                              {Number(
                                draw.total_prize_pool ||
                                  0,
                              ).toFixed(2)}
                            </p>
                          </div>

                          <div className="rounded-xl bg-[#f5f7f4] p-3">
                            <p className="text-xs text-[#718078]">
                              Jackpot rollover
                            </p>

                            <p className="mt-1 font-bold text-[#183d2a]">
                              £
                              {Number(
                                draw.jackpot_rollover ||
                                  0,
                              ).toFixed(2)}
                            </p>
                          </div>
                        </div>
                      </div>

                      <div className="flex w-full flex-col gap-2 lg:w-auto">
                        {isSimulated && (
                          <button
                            onClick={() =>
                              handleFinalizeDraw(
                                draw.id,
                              )
                            }
                            disabled={
                              drawActionLoading
                            }
                            className="rounded-full bg-[#183d2a] px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-[#28563d] disabled:cursor-not-allowed disabled:opacity-50"
                          >
                            {drawActionLoading
                              ? 'Finalizing...'
                              : 'Finalize & Publish'}
                          </button>
                        )}

                        {isDraft && (
                          <button
                            onClick={() =>
                              handlePublishDraw(
                                draw.id,
                              )
                            }
                            disabled={
                              drawActionLoading
                            }
                            className="rounded-full bg-[#183d2a] px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-[#28563d] disabled:cursor-not-allowed disabled:opacity-50"
                          >
                            {drawActionLoading
                              ? 'Publishing...'
                              : 'Publish'}
                          </button>
                        )}

                        {isPublished && (
                          <div className="rounded-full bg-[#edf6ee] px-5 py-2.5 text-center text-sm font-semibold text-[#315b3b]">
                            ✓ Published
                          </div>
                        )}
                      </div>
                    </div>
                  </article>
                )
              })
            )}
          </div>
        </section>

        {/* Winner Verification */}
        <section className="rounded-3xl border border-[#dfe6df] bg-white p-7">
          <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h2 className="text-2xl font-bold text-[#183d2a]">
                Winner Verification
              </h2>

              <p className="mt-1 text-sm text-[#68756c]">
                Review submitted proof before approving prizes
                for payment.
              </p>
            </div>

            <div className="rounded-full bg-[#edf3ed] px-4 py-2 text-sm font-semibold text-[#31533d]">
              {
                winners.filter(
                  (winner) =>
                    winner.verification_status ===
                    'pending',
                ).length
              }{' '}
              pending
            </div>
          </div>

          <div className="mt-6 space-y-4">
            {winners.length === 0 ? (
              <div className="rounded-2xl bg-[#f5f7f4] p-6 text-center">
                <p className="font-medium text-[#526057]">
                  No winners yet.
                </p>

                <p className="mt-1 text-sm text-[#7a867e]">
                  Winners will appear here after a draw
                  has been processed.
                </p>
              </div>
            ) : (
              winners.map((winner) => {
                const proofs =
                  winner.winner_proofs || []

                const latestProof =
                  proofs[0]

                const profile =
                  winner.profiles ||
                  winner.profile

                return (
                  <article
                    key={winner.id}
                    className="rounded-2xl border border-[#e1e7e2] bg-[#fcfdfc] p-5"
                  >
                    <div className="flex flex-col gap-5 lg:flex-row lg:items-start lg:justify-between">
                      <div className="space-y-3">
                        <div>
                          <p className="text-xs font-semibold uppercase tracking-wider text-[#718078]">
                            Winner
                          </p>

                          <p className="mt-1 font-bold text-[#183d2a]">
                            {profile?.full_name ||
                              'GolfKind Member'}
                          </p>

                          {profile?.email && (
                            <p className="text-sm text-[#68756c]">
                              {profile.email}
                            </p>
                          )}
                        </div>

                        <div className="flex flex-wrap gap-2">
                          <span className="rounded-full bg-[#edf3ed] px-3 py-1 text-sm font-semibold text-[#31533d]">
                            {winner.match_count}
                            -number match
                          </span>

                          <span className="rounded-full bg-[#f2eadb] px-3 py-1 text-sm font-semibold text-[#765f32]">
                            £
                            {Number(
                              winner.prize_amount,
                            ).toFixed(2)}
                          </span>
                        </div>

                        <div className="grid gap-3 sm:grid-cols-2">
                          <div className="rounded-xl bg-[#f5f7f4] p-3">
                            <p className="text-xs text-[#718078]">
                              Verification
                            </p>

                            <p className="mt-1 font-semibold capitalize text-[#183d2a]">
                              {
                                winner.verification_status
                              }
                            </p>
                          </div>

                          <div className="rounded-xl bg-[#f5f7f4] p-3">
                            <p className="text-xs text-[#718078]">
                              Payment
                            </p>

                            <p className="mt-1 font-semibold capitalize text-[#183d2a]">
                              {
                                winner.payment_status
                              }
                            </p>
                          </div>
                        </div>

                        {latestProof ? (
                          <div className="rounded-xl border border-[#dfe6df] bg-white p-4">
                            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                              <div>
                                <p className="font-semibold text-[#183d2a]">
                                  Proof submitted
                                </p>

                                <p className="mt-1 text-xs text-[#718078]">
                                  Uploaded{' '}
                                  {new Date(
                                    latestProof.uploaded_at,
                                  ).toLocaleString()}
                                </p>
                              </div>

                              <button
                                type="button"
                                onClick={() =>
                                  handleViewProof(
                                    latestProof.file_url,
                                  )
                                }
                                className="rounded-full border border-[#cbd8cd] px-4 py-2 text-sm font-semibold text-[#31533d] transition hover:bg-[#edf3ed]"
                              >
                                View Proof
                              </button>
                            </div>

                            {latestProof.rejection_reason && (
                              <div className="mt-3 rounded-xl bg-red-50 p-3 text-sm text-red-700">
                                <strong>
                                  Rejection reason:
                                </strong>{' '}
                                {
                                  latestProof.rejection_reason
                                }
                              </div>
                            )}
                          </div>
                        ) : (
                          <div className="rounded-xl bg-[#fff8e8] p-4 text-sm text-[#765f32]">
                            No proof has been uploaded yet.
                          </div>
                        )}
                      </div>

                      <div className="w-full lg:max-w-xs">
                        {winner.verification_status ===
                          'pending' && (
                          <div className="space-y-3">
                            <textarea
                              value={
                                rejectionReasons[
                                  winner.id
                                ] || ''
                              }
                              onChange={(event) =>
                                setRejectionReasons(
                                  (current) => ({
                                    ...current,
                                    [winner.id]:
                                      event.target
                                        .value,
                                  }),
                                )
                              }
                              placeholder="Rejection reason (required only when rejecting)"
                              rows={3}
                              className="w-full rounded-xl border border-[#d4ddd5] px-4 py-3 text-sm outline-none transition focus:border-[#5e9b6d]"
                            />

                            <div className="flex flex-wrap gap-2">
                              <button
                                type="button"
                                onClick={() =>
                                  handleWinnerVerification(
                                    winner.id,
                                    'approved',
                                  )
                                }
                                disabled={
                                  !latestProof
                                }
                                className="rounded-full bg-[#183d2a] px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-[#28563d] disabled:cursor-not-allowed disabled:opacity-40"
                              >
                                Approve
                              </button>

                              <button
                                type="button"
                                onClick={() =>
                                  handleWinnerVerification(
                                    winner.id,
                                    'rejected',
                                  )
                                }
                                className="rounded-full border border-red-200 px-4 py-2.5 text-sm font-semibold text-red-700 transition hover:bg-red-50"
                              >
                                Reject
                              </button>
                            </div>
                          </div>
                        )}

                        {winner.verification_status ===
                          'approved' &&
                          winner.payment_status ===
                            'pending' && (
                          <button
                            type="button"
                            onClick={() =>
                              handleMarkPaid(
                                winner.id,
                              )
                            }
                            className="w-full rounded-full bg-[#5e9b6d] px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-[#4d895c]"
                          >
                            Mark as Paid
                          </button>
                        )}

                        {winner.payment_status ===
                          'paid' && (
                          <div className="rounded-xl bg-[#edf6ee] p-4 text-center text-sm font-semibold text-[#315b3b]">
                            ✓ Prize paid
                          </div>
                        )}
                      </div>
                    </div>
                  </article>
                )
              })
            )}
          </div>
        </section>

        {/* Users & Subscriptions */}
        <section className="rounded-3xl border border-[#dfe6df] bg-white p-7">
          <h2 className="text-2xl font-bold text-[#183d2a]">
            Users & Subscriptions
          </h2>

          <div className="mt-6 grid gap-4 lg:grid-cols-2">
            <div>
              <h3 className="mb-3 font-semibold">
                Registered Users
              </h3>

              <div className="space-y-3">
                {users.map((user) => (
                  <div
                    key={user.id}
                    className="rounded-xl bg-[#f5f7f4] p-4"
                  >
                    <p className="font-semibold">
                      {user.full_name}
                    </p>

                    <p className="text-sm text-[#68756c]">
                      {user.email}
                    </p>
                  </div>
                ))}
              </div>
            </div>

            <div>
              <h3 className="mb-3 font-semibold">
                Subscriptions
              </h3>

              <div className="space-y-3">
                {subscriptions.map(
                  (subscription) => (
                    <div
                      key={subscription.id}
                      className="rounded-xl bg-[#f5f7f4] p-4"
                    >
                      <p className="font-semibold">
                        {subscription.plan_type}
                      </p>

                      <p className="text-sm text-[#68756c]">
                        Status: {subscription.status}
                      </p>

                      <p className="text-sm text-[#68756c]">
                        Amount: £
                        {Number(
                          subscription.amount,
                        ).toFixed(2)}
                      </p>
                    </div>
                  ),
                )}
              </div>
            </div>
          </div>
        </section>
      </div>
    </main>
  )
}

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route
          path="/"
          element={<HomePage />}
        />

        <Route
          path="/login"
          element={<Login />}
        />

        <Route
          path="/register"
          element={<Register />}
        />

        <Route
          path="/dashboard"
          element={
            <ProtectedRoute>
              <Dashboard />
            </ProtectedRoute>
          }
        />

        <Route
          path="/admin"
          element={
            <AdminRoute>
              <AdminPage />
            </AdminRoute>
          }
        />

        <Route
          path="/charities"
          element={<Charities />}
        />

        <Route
          path="*"
          element={
            <Navigate
              to="/"
              replace
            />
          }
        />
      </Routes>
    </BrowserRouter>
  )
}

export default App