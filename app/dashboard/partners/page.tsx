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
import {
  Search,
  MapPin,
  Phone,
  X,
  AlertCircle,
  RefreshCw,
  Building2,
  Share2
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
  const [filterType, setFilterType] = useState<'all' | 'barbershop' | 'salon' | 'Legal' | 'Employment' | 'Health' | 'Housing' | 'Education'>('all')
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [errorType, setErrorType] = useState<'network' | 'permission' | 'unknown'>('unknown')

  const supabase = createClient()
  const debouncedSearchTerm = useDebounce(searchTerm, 300)

  const loadBusinesses = useCallback(async () => {
    try {
      setLoading(true)
      setError(null)
      setErrorType('unknown')

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

  const filteredBusinesses = useMemo(() => {
    let filtered = businesses

    if (filterType !== 'all') {
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
    <div className="space-y-6 pb-8">
      {/* Header */}
      <div>
        <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-2">Partner Directory</h1>
        <p className="text-base md:text-lg text-gray-600">Find trusted barbershops and salons in Philadelphia</p>
      </div>

      {/* Error State */}
      {error && errorType !== 'network' && (
        <Card className="border-red-200 bg-red-50">
          <CardContent className="p-6">
            <div className="flex items-start space-x-3">
              <AlertCircle className="w-6 h-6 text-red-600 flex-shrink-0 mt-0.5" />
              <div className="flex-1">
                <p className="text-base font-semibold text-red-900 mb-1">Something went wrong</p>
                <p className="text-sm text-red-800 mb-4">{error}</p>
                {errorType === 'permission' ? (
                  <Button
                    variant="outline"
                    size="lg"
                    className="h-12 px-6"
                    onClick={() => router.push('/dashboard')}
                  >
                    Go to Dashboard
                  </Button>
                ) : (
                  <Button
                    variant="outline"
                    size="lg"
                    className="h-12 px-6"
                    onClick={loadBusinesses}
                  >
                    <RefreshCw className="w-5 h-5 mr-2" />
                    Try Again
                  </Button>
                )}
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Network Error (with cached data fallback) */}
      {error && errorType === 'network' && businesses.length > 0 && (
        <Card className="border-yellow-200 bg-yellow-50">
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <AlertCircle className="w-5 h-5 text-yellow-600 flex-shrink-0" />
              <p className="text-sm text-yellow-800">{error}</p>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Search Bar */}
      <div className="relative">
        <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" aria-hidden="true" />
        <Input
          placeholder="Search by name, address, or city..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="pl-12 pr-12 h-14 text-base"
          aria-label="Search partners"
        />
        {searchTerm && (
          <button
            onClick={clearSearch}
            className="absolute right-4 top-1/2 transform -translate-y-1/2 p-2 hover:bg-gray-100 rounded-full transition-colors min-w-[44px] min-h-[44px] flex items-center justify-center"
            aria-label="Clear search"
            type="button"
          >
            <X className="w-5 h-5 text-gray-400" aria-hidden="true" />
          </button>
        )}
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3">
        <Button
          variant={filterType === 'all' ? 'default' : 'outline'}
          onClick={() => setFilterType('all')}
          className="h-14 px-6 text-base flex-1 sm:flex-initial"
          aria-label="Show all partners"
        >
          All {businesses.length > 0 && `(${businesses.length})`}
        </Button>
        <Button
          variant={filterType === 'barbershop' ? 'default' : 'outline'}
          onClick={() => setFilterType('barbershop')}
          className="h-14 px-6 text-base flex-1 sm:flex-initial"
          aria-label="Show barbershops only"
        >
          Barbershops {barbershopCount > 0 && `(${barbershopCount})`}
        </Button>
        <Button
          variant={filterType === 'salon' ? 'default' : 'outline'}
          onClick={() => setFilterType('salon')}
          className="h-14 px-6 text-base flex-1 sm:flex-initial"
          aria-label="Show salons only"
        >
          Salons {salonCount > 0 && `(${salonCount})`}
        </Button>
        <Button
          variant={filterType === 'Legal' ? 'default' : 'outline'}
          onClick={() => setFilterType('Legal')}
          className="h-10 px-4 text-sm flex-1 sm:flex-initial"
        >
          Legal
        </Button>
        <Button
          variant={filterType === 'Employment' ? 'default' : 'outline'}
          onClick={() => setFilterType('Employment')}
          className="h-10 px-4 text-sm flex-1 sm:flex-initial"
        >
          Employment
        </Button>
        <Button
          variant={filterType === 'Health' ? 'default' : 'outline'}
          onClick={() => setFilterType('Health')}
          className="h-10 px-4 text-sm flex-1 sm:flex-initial"
        >
          Health
        </Button>
        {hasActiveFilters && (
          <Button
            variant="ghost"
            onClick={clearFilters}
            className="h-14 px-4 text-base"
            aria-label="Clear all filters"
          >
            Clear
          </Button>
        )}
      </div>

      {/* Result Count */}
      {!loading && filteredBusinesses.length > 0 && (
        <p className="text-sm text-gray-600">
          {filteredBusinesses.length} {filteredBusinesses.length === 1 ? 'partner' : 'partners'} found
        </p>
      )}

      {/* Empty State - No Partners */}
      {!loading && businesses.length === 0 && !error && (
        <Card>
          <CardContent className="py-16 text-center">
            <Building2 className="w-16 h-16 mx-auto mb-4 text-gray-400" />
            <h3 className="text-xl font-semibold text-gray-900 mb-2">No Partners Available</h3>
            <p className="text-base text-gray-600 mb-6">
              We're working on adding more partners. Check back soon!
            </p>
            <Button
              variant="outline"
              size="lg"
              className="h-12 px-8"
              onClick={loadBusinesses}
            >
              <RefreshCw className="w-5 h-5 mr-2" />
              Refresh
            </Button>
          </CardContent>
        </Card>
      )}

      {/* Empty State - No Search Results */}
      {!loading && businesses.length > 0 && filteredBusinesses.length === 0 && (
        <Card>
          <CardContent className="py-16 text-center">
            <Search className="w-16 h-16 mx-auto mb-4 text-gray-400" />
            <h3 className="text-xl font-semibold text-gray-900 mb-2">No Partners Found</h3>
            <p className="text-base text-gray-600 mb-6">
              {hasActiveFilters
                ? 'No partners match your search or filters. Try adjusting your search or clearing filters to see all partners.'
                : 'No partners available at this time.'}
            </p>
            {hasActiveFilters && (
              <Button
                variant="default"
                size="lg"
                className="h-12 px-8"
                onClick={clearFilters}
              >
                Clear Filters
              </Button>
            )}
          </CardContent>
        </Card>
      )}

      {/* Partner Cards */}
      {!loading && filteredBusinesses.length > 0 && (
        <div className="space-y-4">
          {filteredBusinesses.map((business) => {
            const formattedPhone = formatPhoneNumber(business.phone)
            const mapsUrl = getMapsUrl(business.address, business.city, business.state, business.zip)
            const hoursEntries = business.hours ? Object.entries(business.hours) : []
            const hasHours = hoursEntries.length > 0

            return (
              <Card
                key={business.id}
                className="hover:shadow-lg transition-shadow border-2 hover:border-indigo-200"
              >
                <CardContent className="p-6 space-y-4">
                  {/* Header with name and badges */}
                  <div className="flex items-start justify-between gap-3">
                    <Link
                      href={`/dashboard/partners/${business.id}`}
                      className="flex-1 min-w-0"
                    >
                      <h3 className="text-xl font-bold text-gray-900 mb-2 hover:text-indigo-600 transition-colors">
                        {business.name}
                      </h3>
                    </Link>
                    <div className="flex flex-wrap gap-2 flex-shrink-0">
                      <Badge
                        variant={business.type === 'barbershop' ? 'default' : 'secondary'}
                        className="text-xs px-2 py-1"
                      >
                        {business.type}
                      </Badge>
                      {business.is_youth_friendly && (
                        <Badge
                          variant="outline"
                          className="bg-green-50 text-green-700 border-green-200 text-xs px-2 py-1"
                        >
                          Youth-Friendly
                        </Badge>
                      )}
                    </div>
                  </div>

                  {/* Address - Clickable */}
                  <div className="flex items-start">
                    <MapPin className="w-5 h-5 mr-3 mt-0.5 flex-shrink-0 text-gray-500" />
                    <a
                      href={mapsUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-base text-gray-700 hover:text-indigo-600 transition-colors flex-1"
                    >
                      {business.address}<br />
                      {business.city}, {business.state} {business.zip}
                    </a>
                  </div>

                  {/* Phone - Large, clickable */}
                  {business.phone && (
                    <div className="flex items-center">
                      <Phone className="w-5 h-5 mr-3 flex-shrink-0 text-gray-500" />
                      <a
                        href={`tel:${business.phone.replace(/\D/g, '')}`}
                        className="text-base font-medium text-indigo-600 hover:text-indigo-700 transition-colors"
                      >
                        {formattedPhone}
                      </a>
                    </div>
                  )}

                  {/* Hours - Expandable or full display */}
                  {hasHours && (
                    <BusinessHours
                      hours={business.hours as Record<string, BusinessHoursType>}
                      businessId={business.id}
                      maxDisplay={3}
                    />
                  )}

                  {/* Action Buttons */}
                  <div className="flex flex-col sm:flex-row gap-3 pt-2">
                    <Button
                      asChild
                      className="flex-1 h-14 text-base font-semibold"
                    >
                      <Link href={`/dashboard/schedule?business=${business.id}`}>
                        Book Appointment
                      </Link>
                    </Button>
                    {business.phone && (
                      <Button
                        variant="outline"
                        className="h-14 px-6 text-base"
                        onClick={() => window.location.href = `tel:${business.phone?.replace(/\D/g, '')}`}
                        aria-label={`Call ${business.name}`}
                      >
                        <Phone className="w-5 h-5 mr-2" />
                        Call
                      </Button>
                    )}
                    <Button
                      variant="outline"
                      className="h-14 px-6 text-base"
                      asChild
                    >
                      <Link href={`/dashboard/partners/${business.id}`}>
                        View Details
                      </Link>
                    </Button>
                  </div>
                </CardContent>
              </Card>
            )
          })}
        </div>
      )}
    </div>
  )
}
