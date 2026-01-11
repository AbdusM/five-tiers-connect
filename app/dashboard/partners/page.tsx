'use client'

import { useState, useEffect, useMemo, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { Card, CardContent } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import { createClient } from '@/lib/supabase/client'
import { isDemoMode } from '@/lib/demo-mode'
import { demoBusinesses } from '@/lib/demo-data'
import {
  Search,
  MapPin,
  Phone,
  X,
  AlertCircle,
  RefreshCw,
  Building2,
  Share2,
  Heart
} from 'lucide-react'
import type { Business, BusinessHours as BusinessHoursType } from '@/types/database'
import { formatPhoneNumber, formatAddress, getMapsUrl } from '@/lib/utils'
import { BusinessHours } from '@/components/business-hours'

// Debounce hook with proper cleanup
function useDebounce<T>(value: T, delay: number): T {
  const [debouncedValue, setDebouncedValue] = useState<T>(value)

  useEffect(() => {
    // Set timeout to update debounced value
    const handler = setTimeout(() => {
      setDebouncedValue(value)
    }, delay)

    // Cleanup: cancel timeout if value changes or component unmounts
    return () => {
      clearTimeout(handler)
    }
  }, [value, delay])

  return debouncedValue
}

export default function PartnersPage() {
  const router = useRouter()
  const [businesses, setBusinesses] = useState<Business[]>([])
  const [searchTerm, setSearchTerm] = useState('')
  const [filterType, setFilterType] = useState<'all' | 'barbershop' | 'salon' | 'Legal' | 'Employment' | 'Health' | 'Housing' | 'Education' | 'favorites'>('all')
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [errorType, setErrorType] = useState<'network' | 'permission' | 'unknown'>('unknown')
  const [favorites, setFavorites] = useState<string[]>([])
  const [demoEnabled, setDemoEnabled] = useState(false)

  const supabase = createClient()
  const debouncedSearchTerm = useDebounce(searchTerm, 300)

  const loadBusinesses = useCallback(async () => {
    try {
      setLoading(true)
      setError(null)
      setErrorType('unknown')

      // Demo mode: show canned partners, skip Supabase
      const { data: { session } } = await supabase.auth.getSession()
      if ((typeof window !== 'undefined' && isDemoMode()) || !session) {
        console.log('Using demo data (No session or Demo Mode active)')
        setBusinesses(demoBusinesses)
        setLoading(false)
        return
      }

      const { data, error: fetchError } = await supabase
        .from('businesses')
        .select('*')
        .eq('is_active', true)
        .order('name')

      if (fetchError) {
        // DEV MODE: Mock data on permission error
        if (process.env.NODE_ENV === 'development' && (fetchError.message.includes('permission') || fetchError.message.includes('policy'))) {
          const mockBusinesses: Business[] = [
            // Barbershops/Salons
            { id: '1', name: 'Fresh Cuts Barbershop', type: 'barbershop', address: '123 Main St', city: 'Philadelphia', state: 'PA', zip: '19104', phone: '215-555-0101', is_active: true, is_youth_friendly: true, hours: {} },
            { id: '2', name: 'Elite Styles Salon', type: 'salon', address: '456 Market St', city: 'Philadelphia', state: 'PA', zip: '19106', phone: '215-555-0102', is_active: true, is_youth_friendly: true, hours: {} },
            { id: '3', name: 'Community Barber', type: 'barbershop', address: '789 Broad St', city: 'Philadelphia', state: 'PA', zip: '19107', phone: '215-555-0103', is_active: true, is_youth_friendly: true, hours: {} },
            // Service Partners (Recovered from Widget)
            { id: '4', name: 'Legal Aid Society', type: 'Legal', address: '1400 JFK Blvd', city: 'Philadelphia', state: 'PA', zip: '19107', phone: '215-555-LEGL', is_active: true, is_youth_friendly: false, hours: {} },
            { id: '5', name: 'Second Chance Jobs', type: 'Employment', address: 'Online Portal', city: 'Philadelphia', state: 'PA', zip: '19100', is_active: true, is_youth_friendly: true, hours: {} },
            { id: '6', name: 'Community Health Corps', type: 'Health', address: '500 S Broad St', city: 'Philadelphia', state: 'PA', zip: '19146', phone: '215-555-WELL', is_active: true, is_youth_friendly: true, hours: {} },
            // Expanded Typical Partners
            { id: '7', name: 'Housing First Initiative', type: 'Housing', address: '1234 Market St', city: 'Philadelphia', state: 'PA', zip: '19107', phone: '215-555-HOME', is_active: true, is_youth_friendly: true, hours: {} },
            { id: '8', name: 'City Tech Training', type: 'Education', address: '1900 Arch St', city: 'Philadelphia', state: 'PA', zip: '19103', phone: '215-555-CODE', is_active: true, is_youth_friendly: true, hours: {} },
          ] as any
          setBusinesses(mockBusinesses)
          setLoading(false)
          return
        }

        // Determine error type
        if (fetchError.message.includes('permission') || fetchError.message.includes('policy')) {
          setErrorType('permission')
          setError('You don\'t have permission to view partners. Please contact support if you believe this is an error.')
        } else if (fetchError.message.includes('network') || fetchError.message.includes('fetch')) {
          setErrorType('network')
          setError('Couldn\'t load partners. Check your connection and try again.')
        } else {
          setErrorType('unknown')
          setError('Couldn\'t load partners. Please try again.')
        }
        throw fetchError
      }

      if (data) {
        setBusinesses(data)
        // Cache in localStorage for offline fallback
        try {
          localStorage.setItem('partners_cache', JSON.stringify({ data, timestamp: Date.now() }))
        } catch (e) {
          // Ignore localStorage errors
        }
      }
    } catch (err) {
      // Try to load from cache if available
      try {
        const cached = localStorage.getItem('partners_cache')
        if (cached) {
          const parsed = JSON.parse(cached)
          const { data: cachedData, timestamp } = parsed

          // Validate cache structure
          if (!cachedData || !Array.isArray(cachedData)) {
            localStorage.removeItem('partners_cache')
            return
          }

          // Validate cache age (1 hour)
          if (Date.now() - timestamp < 3600000) {
            // Validate each business has required fields
            const isValid = cachedData.every((b: unknown) => {
              if (typeof b !== 'object' || b === null) return false
              const business = b as Record<string, unknown>
              return (
                typeof business.id === 'string' &&
                typeof business.name === 'string' &&
                typeof business.type === 'string' &&
                typeof business.address === 'string' &&
                typeof business.is_active === 'boolean'
              )
            })

            if (isValid) {
              setBusinesses(cachedData as Business[])
              setError('Showing cached partners. Some information may be outdated.')
              setErrorType('network')
            } else {
              // Invalid cache data - clear it
              localStorage.removeItem('partners_cache')
            }
          } else {
            // Cache expired - clear it
            localStorage.removeItem('partners_cache')
          }
        }
      } catch (e) {
        // Invalid cache - clear it
        localStorage.removeItem('partners_cache')
      }
    } finally {
      setLoading(false)
    }
  }, [supabase])

  useEffect(() => {
    loadBusinesses()
  }, [loadBusinesses])

  useEffect(() => {
    if (typeof window === 'undefined') return
    const stored = localStorage.getItem('partners_favorites')
    if (stored) setFavorites(JSON.parse(stored))
    setDemoEnabled(isDemoMode())
  }, [])

  useEffect(() => {
    if (typeof window === 'undefined') return
    localStorage.setItem('partners_favorites', JSON.stringify(favorites))
  }, [favorites])

  const filteredBusinesses = useMemo(() => {
    let filtered = businesses

    if (filterType === 'favorites') {
      filtered = filtered.filter(b => favorites.includes(b.id))
    } else if (filterType !== 'all') {
      filtered = filtered.filter(b => b.type === filterType)
    }

    if (debouncedSearchTerm.trim()) {
      const searchLower = debouncedSearchTerm.toLowerCase()
      filtered = filtered.filter(b =>
        b.name.toLowerCase().includes(searchLower) ||
        b.address.toLowerCase().includes(searchLower) ||
        b.city.toLowerCase().includes(searchLower) ||
        (b.phone && b.phone.toLowerCase().includes(searchLower))
      )
    }

    return filtered
  }, [businesses, filterType, debouncedSearchTerm])

  const barbershopCount = businesses.filter(b => b.type === 'barbershop').length
  const salonCount = businesses.filter(b => b.type === 'salon').length

  const clearSearch = () => {
    setSearchTerm('')
  }

  const clearFilters = () => {
    setFilterType('all')
    setSearchTerm('')
  }

  const toggleFavorite = (id: string) => {
    setFavorites((prev) =>
      prev.includes(id) ? prev.filter((f) => f !== id) : [...prev, id]
    )
  }

  const isFavorite = (id: string) => favorites.includes(id)

  const hasActiveFilters = filterType !== 'all' || searchTerm.trim() !== ''

  // Loading state with skeletons
  if (loading && businesses.length === 0) {
    return (
      <div className="space-y-6 pb-8">
        <div>
          <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-2">Partner Directory</h1>
          <p className="text-base md:text-lg text-gray-600">Find trusted barbershops and salons in Philadelphia</p>
        </div>

        {/* Search skeleton */}
        <div className="space-y-4">
          <Skeleton className="h-14 w-full" />
          <div className="flex gap-3">
            <Skeleton className="h-14 w-20" />
            <Skeleton className="h-14 w-32" />
            <Skeleton className="h-14 w-24" />
          </div>
        </div>

        {/* Card skeletons */}
        <div className="space-y-4">
          {[1, 2, 3].map((i) => (
            <Card key={i} className="p-6">
              <div className="space-y-4">
                <div className="flex items-start justify-between">
                  <Skeleton className="h-7 w-48" />
                  <Skeleton className="h-6 w-24" />
                </div>
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-3/4" />
                <Skeleton className="h-4 w-1/2" />
                <Skeleton className="h-12 w-full mt-4" />
              </div>
            </Card>
          ))}
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-8 animate-fade-up pb-20">
      {/* HUD Header */}
      <div className="sticky top-0 z-30 pt-4 pb-6 -mx-4 px-4 md:-mx-8 md:px-8 bg-zinc-950/80 backdrop-blur-md border-b border-white/5 shadow-2xl space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-xs font-mono text-zinc-500 uppercase tracking-widest">Growth Network</h2>
            <h1 className="text-3xl font-serif text-white tracking-tight">Partner Directory</h1>
          </div>
          {demoEnabled && (
            <div className="text-[10px] font-mono uppercase tracking-wide text-amber-500 bg-amber-950/30 border border-amber-500/20 px-2 py-1 rounded">
              Demo Mode
            </div>
          )}
        </div>

        <div className="flex flex-col md:flex-row gap-3">
          {/* Search */}
          <div className="relative flex-1 group">
            <Search className="absolute left-3 top-2.5 h-4 w-4 text-zinc-500 group-focus-within:text-emerald-500 transition-colors" />
            <Input
              placeholder="Search network..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-9 bg-zinc-900/50 border-white/10 text-white placeholder:text-zinc-600 focus-visible:ring-emerald-500/50 h-10"
            />
            {searchTerm && (
              <button onClick={clearSearch} className="absolute right-3 top-2.5 text-zinc-500 hover:text-white"><X className="w-4 h-4" /></button>
            )}
          </div>

          {/* Simple Scrollable Filters */}
          <div className="flex gap-2 overflow-x-auto no-scrollbar pb-1 md:pb-0">
            {(['all', 'barbershop', 'salon', 'Legal', 'Employment', 'Health', 'favorites'] as const).map(type => (
              <Button
                key={type}
                variant="ghost"
                onClick={() => setFilterType(type)}
                className={`h-10 border rounded-full text-xs font-mono uppercase tracking-wide min-w-fit ${filterType === type
                  ? 'bg-emerald-500/10 border-emerald-500/50 text-emerald-400'
                  : 'bg-zinc-900/50 border-white/10 text-zinc-500 hover:text-zinc-300'
                  }`}
              >
                {type === 'favorites' ? 'Saved' : type}
              </Button>
            ))}
          </div>
        </div>
      </div>

      {/* Error State */}
      {error && (
        <div className="glass-panel border-red-500/30 bg-red-950/10 p-4 rounded-xl flex items-center gap-3">
          <AlertCircle className="w-5 h-5 text-red-400" />
          <p className="text-red-300 text-sm">{error}</p>
          {errorType !== 'network' && (
            <Button size="sm" variant="outline" className="ml-auto border-red-500/30 text-red-400 hover:bg-red-950/50" onClick={loadBusinesses}>Retry</Button>
          )}
        </div>
      )}

      {/* Grid Feed */}
      {!loading && (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
          {filteredBusinesses.length === 0 && !error ? (
            <div className="col-span-full py-20 text-center">
              <div className="inline-flex p-4 rounded-full bg-zinc-900/50 border border-white/5 mb-4">
                {hasActiveFilters ? <Search className="w-8 h-8 text-zinc-600" /> : <Building2 className="w-8 h-8 text-zinc-600" />}
              </div>
              <h3 className="text-zinc-300 font-medium">No Signal Found</h3>
              <p className="text-zinc-500 text-sm mt-1 max-w-xs mx-auto">
                {hasActiveFilters ? 'Adjust your scan parameters.' : 'Network is currently quiet.'}
              </p>
              {hasActiveFilters && (
                <Button variant="link" onClick={clearFilters} className="text-emerald-400 mt-2">Reset Scanners</Button>
              )}
            </div>
          ) : (
            filteredBusinesses.map((business) => {
              const saved = isFavorite(business.id)
              const mapsUrl = getMapsUrl(business.address, business.city, business.state, business.zip)

              return (
                <div key={business.id} className="glass-panel group rounded-xl hover:border-emerald-500/30 transition-all duration-300 flex flex-col h-full">
                  {/* Card Header */}
                  <div className="p-5 pb-0 flex items-start justify-between gap-3">
                    <div className="flex-1 min-w-0">
                      <Badge className="mb-2 bg-zinc-900 text-zinc-500 border-white/10 font-mono text-[10px] uppercase tracking-wider">{business.type}</Badge>
                      <Link href={`/dashboard/partners/${business.id}`}>
                        <h3 className="text-xl font-serif text-zinc-100 leading-tight group-hover:text-emerald-400 transition-colors cursor-pointer">
                          {business.name}
                        </h3>
                      </Link>
                    </div>
                    <Button
                      size="icon"
                      variant="ghost"
                      onClick={() => toggleFavorite(business.id)}
                      className="h-8 w-8 -mr-2 text-zinc-600 hover:text-white"
                    >
                      <Heart className={`w-4 h-4 ${saved ? 'fill-emerald-500 text-emerald-500' : ''}`} />
                    </Button>
                  </div>

                  {/* Content */}
                  <div className="p-5 flex-1 space-y-4">
                    <a href={mapsUrl} target="_blank" className="flex items-start gap-2 text-sm text-zinc-400 hover:text-zinc-200 transition-colors">
                      <MapPin className="w-4 h-4 mt-0.5 text-zinc-600" />
                      <span className="line-clamp-2">{business.address}, {business.city}</span>
                    </a>

                    {business.is_youth_friendly && (
                      <div className="inline-flex items-center gap-1.5 px-2 py-1 rounded bg-emerald-500/10 border border-emerald-500/20 text-[10px] text-emerald-400 font-medium uppercase tracking-wide">
                        <Share2 className="w-3 h-3" /> Youth Friendly
                      </div>
                    )}
                  </div>

                  {/* Actions Footer */}
                  <div className="p-4 border-t border-white/5 bg-zinc-950/30 flex gap-2 mt-auto rounded-b-xl">
                    <Button asChild className="flex-1 bg-white/5 hover:bg-white/10 text-white border-0">
                      <Link href={`/dashboard/schedule?business=${business.id}`}>Book Now</Link>
                    </Button>
                    <Button asChild variant="outline" className="flex-1 border-white/10 hover:bg-white/5 text-zinc-400">
                      <Link href={`/dashboard/partners/${business.id}`}>Details</Link>
                    </Button>
                  </div>
                </div>
              )
            })
          )}
        </div>
      )}
    </div>
  )
}
