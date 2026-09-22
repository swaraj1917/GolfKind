import { useEffect, useMemo, useState } from 'react'
import { Search, Heart, ArrowRight, Star, Calendar, ExternalLink } from 'lucide-react'
import { getCharities } from '../services/charityService'
import type { Charity } from '../services/charityService'

export default function Charities() {
  const [charities, setCharities] = useState<Charity[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [selectedCharity, setSelectedCharity] = useState<Charity | null>(null)

  useEffect(() => {
    loadCharities()
  }, [])

  async function loadCharities() {
    try {
      setLoading(true)
      const data = await getCharities()
      setCharities(data)
    } catch (error) {
      console.error('Failed to load charities:', error)
    } finally {
      setLoading(false)
    }
  }

  const filteredCharities = useMemo(() => {
    const searchTerm = search.trim().toLowerCase()

    if (!searchTerm) {
      return charities
    }

    return charities.filter((charity) => {
      return (
        charity.name.toLowerCase().includes(searchTerm) ||
        charity.description?.toLowerCase().includes(searchTerm) ||
        charity.upcoming_event?.toLowerCase().includes(searchTerm)
      )
    })
  }, [charities, search])

  const featuredCharity = charities.find(
    (charity) => charity.is_featured
  )

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Header */}
      <header className="border-b border-slate-200 bg-white">
        <div className="mx-auto max-w-7xl px-6 py-5">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-600 text-white">
              <Heart size={20} fill="currentColor" />
            </div>

            <div>
              <h1 className="text-xl font-bold text-slate-900">
                Charity Directory
              </h1>
              <p className="text-sm text-slate-500">
                Support causes that matter to you
              </p>
            </div>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-7xl px-6 py-10">
        {/* Intro */}
        <div className="mb-8 max-w-2xl">
          <p className="mb-2 text-sm font-semibold uppercase tracking-wide text-emerald-600">
            Give with purpose
          </p>

          <h2 className="text-4xl font-bold tracking-tight text-slate-900">
            Choose a cause you care about.
          </h2>

          <p className="mt-3 text-slate-600">
            Browse our charity partners and choose where your contribution
            should make an impact.
          </p>
        </div>

        {/* Featured charity */}
        {featuredCharity && (
          <section className="mb-10 overflow-hidden rounded-3xl bg-slate-900 text-white">
            {featuredCharity.image_url && (
              <img
                src={featuredCharity.image_url}
                alt={featuredCharity.name}
                className="h-56 w-full object-cover opacity-80"
              />
            )}

            <div className="p-8">
              <div className="flex flex-col justify-between gap-8 md:flex-row md:items-center">
                <div className="max-w-2xl">
                  <div className="mb-4 flex items-center gap-2 text-sm font-medium text-emerald-300">
                    <Star size={16} fill="currentColor" />
                    Featured charity
                  </div>

                  <h3 className="text-3xl font-bold">
                    {featuredCharity.name}
                  </h3>

                  <p className="mt-3 text-slate-300">
                    {featuredCharity.description ||
                      'Supporting meaningful change in communities.'}
                  </p>

                  {featuredCharity.upcoming_event && (
                    <div className="mt-4 flex items-center gap-2 text-sm text-slate-300">
                      <Calendar size={15} />
                      {featuredCharity.upcoming_event}
                    </div>
                  )}
                </div>

                <button
                  onClick={() => setSelectedCharity(featuredCharity)}
                  className="flex shrink-0 items-center justify-center gap-2 rounded-xl bg-white px-5 py-3 font-semibold text-slate-900 transition hover:bg-slate-100"
                >
                  View charity
                  <ArrowRight size={17} />
                </button>
              </div>
            </div>
          </section>
        )}

        {/* Search */}
        <div className="mb-8">
          <div className="relative">
            <Search
              size={19}
              className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"
            />

            <input
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Search charities..."
              className="w-full rounded-xl border border-slate-200 bg-white py-3 pl-11 pr-4 text-sm outline-none transition focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100"
            />
          </div>
        </div>

        {/* Charity count */}
        <div className="mb-5 text-sm text-slate-500">
          {filteredCharities.length}{' '}
          {filteredCharities.length === 1 ? 'charity' : 'charities'} found
        </div>

        {/* Loading */}
        {loading && (
          <div className="rounded-2xl border border-slate-200 bg-white p-10 text-center">
            <div className="mx-auto h-8 w-8 animate-spin rounded-full border-2 border-slate-200 border-t-emerald-600" />

            <p className="mt-4 text-sm text-slate-500">
              Loading charities...
            </p>
          </div>
        )}

        {/* Empty */}
        {!loading && filteredCharities.length === 0 && (
          <div className="rounded-2xl border border-dashed border-slate-300 bg-white p-12 text-center">
            <Heart className="mx-auto text-slate-300" size={36} />

            <h3 className="mt-4 font-semibold text-slate-900">
              No charities found
            </h3>

            <p className="mt-1 text-sm text-slate-500">
              Try changing your search.
            </p>
          </div>
        )}

        {/* Charity grid */}
        {!loading && filteredCharities.length > 0 && (
          <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-3">
            {filteredCharities.map((charity) => (
              <article
                key={charity.id}
                className="group overflow-hidden rounded-2xl border border-slate-200 bg-white transition hover:-translate-y-1 hover:border-emerald-200 hover:shadow-lg"
              >
                {/* Image */}
                {charity.image_url ? (
                  <img
                    src={charity.image_url}
                    alt={charity.name}
                    className="h-44 w-full object-cover"
                  />
                ) : (
                  <div className="flex h-44 items-center justify-center bg-emerald-50 text-emerald-600">
                    <Heart size={38} />
                  </div>
                )}

                <div className="p-6">
                  <div className="mb-5 flex items-start justify-between gap-4">
                    <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-emerald-50 text-emerald-600">
                      <Heart size={20} />
                    </div>

                    {charity.is_featured && (
                      <span className="flex items-center gap-1 rounded-full bg-amber-50 px-3 py-1 text-xs font-semibold text-amber-700">
                        <Star size={12} fill="currentColor" />
                        Featured
                      </span>
                    )}
                  </div>

                  <h3 className="text-lg font-bold text-slate-900">
                    {charity.name}
                  </h3>

                  <p className="mt-3 line-clamp-3 text-sm leading-6 text-slate-600">
                    {charity.description ||
                      'Supporting positive change through charitable work.'}
                  </p>

                  {charity.upcoming_event && (
                    <div className="mt-4 flex items-start gap-2 text-xs text-slate-500">
                      <Calendar size={14} className="mt-0.5 shrink-0" />
                      <span>{charity.upcoming_event}</span>
                    </div>
                  )}

                  <button
                    onClick={() => setSelectedCharity(charity)}
                    className="mt-6 flex w-full items-center justify-center gap-2 rounded-xl border border-slate-200 px-4 py-3 text-sm font-semibold text-slate-700 transition group-hover:border-emerald-200 group-hover:bg-emerald-50 group-hover:text-emerald-700"
                  >
                    View details
                    <ArrowRight size={16} />
                  </button>
                </div>
              </article>
            ))}
          </div>
        )}
      </main>

      {/* Details modal */}
      {selectedCharity && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/50 p-5">
          <div className="max-h-[90vh] w-full max-w-lg overflow-y-auto rounded-3xl bg-white shadow-2xl">
            {selectedCharity.image_url && (
              <img
                src={selectedCharity.image_url}
                alt={selectedCharity.name}
                className="h-56 w-full rounded-t-3xl object-cover"
              />
            )}

            <div className="p-7">
              <div className="flex items-start justify-between gap-5">
                <div>
                  {!selectedCharity.image_url && (
                    <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-emerald-50 text-emerald-600">
                      <Heart size={22} />
                    </div>
                  )}

                  <h2 className="text-2xl font-bold text-slate-900">
                    {selectedCharity.name}
                  </h2>

                  {selectedCharity.is_featured && (
                    <div className="mt-2 flex items-center gap-1 text-sm font-semibold text-amber-600">
                      <Star size={14} fill="currentColor" />
                      Featured charity
                    </div>
                  )}
                </div>

                <button
                  onClick={() => setSelectedCharity(null)}
                  className="rounded-lg px-3 py-2 text-slate-400 hover:bg-slate-100 hover:text-slate-700"
                >
                  ✕
                </button>
              </div>

              <p className="mt-6 leading-7 text-slate-600">
                {selectedCharity.description ||
                  'This charity is working to create positive change through its programs and initiatives.'}
              </p>

              {selectedCharity.upcoming_event && (
                <div className="mt-5 flex items-start gap-3 rounded-xl bg-slate-50 p-4 text-sm text-slate-600">
                  <Calendar size={17} className="mt-0.5 shrink-0" />
                  <div>
                    <p className="font-semibold text-slate-800">
                      Upcoming event
                    </p>
                    <p className="mt-1">
                      {selectedCharity.upcoming_event}
                    </p>
                  </div>
                </div>
              )}

              <div className="mt-7 flex flex-col gap-3 sm:flex-row">
                <button
                  onClick={() => setSelectedCharity(null)}
                  className="flex-1 rounded-xl border border-slate-200 px-4 py-3 font-semibold text-slate-700 hover:bg-slate-50"
                >
                  Close
                </button>

                {selectedCharity.website_url && (
                  <a
                    href={selectedCharity.website_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex flex-1 items-center justify-center gap-2 rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 font-semibold text-emerald-700 hover:bg-emerald-100"
                  >
                    Visit website
                    <ExternalLink size={16} />
                  </a>
                )}

                <button
                    onClick={() => {
                        const charityId = selectedCharity.id

                        setSelectedCharity(null)

                        window.location.href = `/dashboard?charity=${charityId}`
                    }}
                    className="flex-1 rounded-xl bg-emerald-600 px-4 py-3 font-semibold text-white hover:bg-emerald-700"
                    >
                    Choose charity
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}