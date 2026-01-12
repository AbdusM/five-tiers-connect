'use client'

import { useState, useEffect, useRef } from 'react'
import { useRouter, useParams } from 'next/navigation'
import Link from 'next/link'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'
import { createClient } from '@/lib/supabase/client'
import {
  ArrowLeft,
  Phone,
  Mail,
  MapPin,
  Clock,
  Calendar,
  Navigation,
  Share2,
  AlertCircle,
  RefreshCw,
  Building2,
  CheckCircle2,
  X,
  Star
} from 'lucide-react'
import type { Business, BusinessHours } from '@/types/database'
import { formatPhoneNumber, formatAddress, getMapsUrl } from '@/lib/utils'
import { BusinessHours as BusinessHoursComponent } from '@/components/business-hours'

export default function PartnerDetailPage() {
  const router = useRouter()
  const params = useParams()
  const businessId = params.id as string

  const [business, setBusiness] = useState<Business | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [shareStatus, setShareStatus] = useState<'idle' | 'sharing' | 'success' | 'error'>('idle')
  const [shareMessage, setShareMessage] = useState<string>('')
  const shareTimeoutRef = useRef<NodeJS.Timeout | null>(null)
  const [reviews, setReviews] = useState<Array<{ id: string; rating: number; text?: string; created_at?: string }>>([])
  const [reviewText, setReviewText] = useState('')
  const [reviewRating, setReviewRating] = useState(5)
  const [reviewError, setReviewError] = useState<string | null>(null)
  const [reviewSuccess, setReviewSuccess] = useState(false)

  const supabase = createClient()

  // Cleanup timeout on unmount
  useEffect(() => {
    return () => {
      if (shareTimeoutRef.current) {
        clearTimeout(shareTimeoutRef.current)
      }
    }
  }, [])

  useEffect(() => {
    if (!businessId) return

    const loadBusiness = async () => {
      try {
        setLoading(true)
        setError(null)

        const { data, error: fetchError } = await supabase
          .from('businesses')
          .select('*')
          .eq('id', businessId)
          .eq('is_active', true)
          .single()

        if (fetchError) {
          if (fetchError.code === 'PGRST116') {
            setError('Partner not found. It may have been removed or is no longer active.')
          } else {
            setError('Couldn\'t load partner information. Please try again.')
          }
          throw fetchError
        }

        if (data) {
          setBusiness(data)
        }
      } catch (err) {
        console.error('Error loading business:', err)
      } finally {
        setLoading(false)
      }
    }

    loadBusiness()
  }, [businessId, supabase])

  useEffect(() => {
    const loadReviews = async () => {
      try {
        const { data: { user } } = await supabase.auth.getUser()
        if (typeof window !== 'undefined' && !user) {
          // demo mode fallback if present
          const { demoReviews } = await import('@/lib/demo-data')
          setReviews(demoReviews.filter((r) => r.business_id === businessId))
          return
        }

        const { data, error: fetchError } = await supabase
          .from('reviews')
          .select('id, rating, text, created_at')
          .eq('business_id', businessId)
          .order('created_at', { ascending: false })

        if (fetchError) {
          console.warn('Reviews fetch error (non-blocking):', fetchError.message)
          return
        }
        if (data) setReviews(data as any)
      } catch (err) {
        console.warn('Reviews load skipped:', err)
      }
    }

    loadReviews()
  }, [businessId, supabase])

  const handleShare = async () => {
    if (!business || shareStatus === 'sharing') return

    setShareStatus('sharing')
    setShareMessage('')

    const shareUrl = `${window.location.origin}/dashboard/partners/${business.id}`
    const shareText = `Check out ${business.name} on Five Tiers Connect!`

    try {
      if (navigator.share) {
        try {
          await navigator.share({
            title: business.name,
            text: shareText,
            url: shareUrl,
          })
          setShareStatus('success')
          setShareMessage('Shared successfully!')
          // Auto-hide success message after 3 seconds
          if (shareTimeoutRef.current) clearTimeout(shareTimeoutRef.current)
          shareTimeoutRef.current = setTimeout(() => {
            setShareStatus('idle')
            setShareMessage('')
            shareTimeoutRef.current = null
          }, 3000)
        } catch (err) {
          // User cancelled - don't show error
          if (err instanceof Error && err.name !== 'AbortError') {
            throw err
          }
          setShareStatus('idle')
          return
        }
      } else {
        // Fallback: copy to clipboard
        await navigator.clipboard.writeText(`${shareText} ${shareUrl}`)
        setShareStatus('success')
        setShareMessage('Link copied to clipboard!')
        // Auto-hide success message after 3 seconds
        if (shareTimeoutRef.current) clearTimeout(shareTimeoutRef.current)
        shareTimeoutRef.current = setTimeout(() => {
          setShareStatus('idle')
          setShareMessage('')
          shareTimeoutRef.current = null
        }, 3000)
      }
    } catch (err) {
      setShareStatus('error')
      setShareMessage('Could not share. Please copy the link manually.')
      // Auto-hide error message after 3 seconds
      if (shareTimeoutRef.current) clearTimeout(shareTimeoutRef.current)
      shareTimeoutRef.current = setTimeout(() => {
        setShareStatus('idle')
        setShareMessage('')
        shareTimeoutRef.current = null
      }, 3000)
    }
  }

  const handleSubmitReview = async () => {
    setReviewError(null)
    setReviewSuccess(false)
    if (!reviewText.trim()) {
      setReviewError('Please add a short note (few words is fine).')
      return
    }
    if (reviewRating < 1 || reviewRating > 5) {
      setReviewError('Rating must be between 1 and 5.')
      return
    }
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) {
        setReviewError('Sign in to add a review.')
        return
      }
      const { error: insertError } = await supabase
        .from('reviews')
        .insert({
          business_id: businessId,
          user_id: user.id,
          rating: reviewRating,
          text: reviewText,
        })
      if (insertError) {
        setReviewError(insertError.message)
        return
      }
      setReviewSuccess(true)
      setReviewText('')
      setReviewRating(5)
      // reload reviews
      const { data } = await supabase
        .from('reviews')
        .select('id, rating, text, created_at')
        .eq('business_id', businessId)
        .order('created_at', { ascending: false })
      if (data) setReviews(data as any)
      setTimeout(() => setReviewSuccess(false), 2000)
    } catch (err) {
      setReviewError(err instanceof Error ? err.message : 'Unable to submit review right now.')
    }
  }

  if (loading) {
    return (
      <div className="space-y-6 pb-8">
        <div className="flex items-center gap-4">
          <Skeleton className="h-12 w-12 rounded-full" />
          <Skeleton className="h-8 w-48" />
        </div>
        <Card>
          <CardContent className="p-6 space-y-4">
            <Skeleton className="h-6 w-full" />
            <Skeleton className="h-6 w-3/4" />
            <Skeleton className="h-6 w-1/2" />
            <Skeleton className="h-32 w-full mt-4" />
          </CardContent>
        </Card>
      </div>
    )
  }

  if (error || !business) {
    return (
      <div className="space-y-6 pb-8">
        <Button
          variant="ghost"
          onClick={() => router.back()}
          className="h-12 px-4 mb-4"
        >
          <ArrowLeft className="w-5 h-5 mr-2" />
          Back
        </Button>
        <Card className="border-red-200 bg-red-50">
          <CardContent className="p-6">
            <div className="flex items-start space-x-3">
              <AlertCircle className="w-6 h-6 text-red-600 flex-shrink-0 mt-0.5" />
              <div className="flex-1">
                <h3 className="text-lg font-semibold text-red-900 mb-2">Partner Not Found</h3>
                <p className="text-base text-red-800 mb-4">
                  {error || 'This partner is no longer available.'}
                </p>
                <div className="flex gap-3">
                  <Button
                    variant="outline"
                    size="lg"
                    className="h-12 px-6"
                    onClick={() => router.push('/dashboard/partners')}
                  >
                    View All Partners
                  </Button>
                  <Button
                    variant="outline"
                    size="lg"
                    className="h-12 px-6"
                    onClick={() => router.back()}
                  >
                    Go Back
                  </Button>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  const formattedPhone = formatPhoneNumber(business.phone)
  const mapsUrl = getMapsUrl(business.address, business.city, business.state, business.zip)
  const hoursEntries = business.hours ? Object.entries(business.hours) : []

  return (
    <div className="space-y-6 pb-8">
      {/* Back Button */}
      <Button
        variant="ghost"
        onClick={() => router.back()}
        className="h-12 px-4"
      >
        <ArrowLeft className="w-5 h-5 mr-2" />
        Back to Partners
      </Button>

      {/* Header Card */}
      <Card>
        <CardHeader>
          <div className="flex items-start justify-between gap-4">
            <div className="flex-1">
              <div className="flex items-center gap-3 mb-3">
                <div className="bg-indigo-100 p-3 rounded-lg">
                  <Building2 className="w-6 h-6 text-indigo-600" />
                </div>
                <div>
                  <CardTitle className="text-2xl md:text-3xl mb-2">{business.name}</CardTitle>
                  <div className="flex flex-wrap gap-2">
                    <Badge
                      variant={business.type === 'barbershop' ? 'default' : 'secondary'}
                      className="text-sm px-3 py-1"
                    >
                      {business.type}
                    </Badge>
                    {business.is_youth_friendly && (
                      <Badge
                        variant="outline"
                        className="bg-green-50 text-green-700 border-green-200 text-sm px-3 py-1"
                      >
                        Youth-Friendly
                      </Badge>
                    )}
                  </div>
                </div>
              </div>
            </div>
            <div className="flex flex-col items-end gap-3 relative">
              <div className="flex items-center gap-2">
                <div className="flex items-center gap-1 text-yellow-500">
                  {[1, 2, 3, 4, 5].map((i) => (
                    <Star key={i} className="w-5 h-5 fill-yellow-400 text-yellow-500" />
                  ))}
                </div>
                <div className="text-sm text-gray-600">
                  4.9 · 128 reviews
                </div>
              </div>
              <Button variant="outline" className="h-10 px-4 text-sm">
                Add Review
              </Button>
              <Button
                variant="outline"
                size="lg"
                className="h-12 px-4"
                onClick={handleShare}
                disabled={shareStatus === 'sharing'}
                aria-label="Share this partner"
              >
                {shareStatus === 'sharing' ? (
                  <RefreshCw className="w-5 h-5 animate-spin" />
                ) : (
                  <Share2 className="w-5 h-5" />
                )}
              </Button>
              {shareMessage && (
                <div className={`absolute top-full left-0 mt-2 p-3 rounded-lg shadow-lg z-50 min-w-[200px] ${shareStatus === 'success'
                    ? 'bg-green-50 border border-green-200 text-green-800'
                    : 'bg-red-50 border border-red-200 text-red-800'
                  }`}>
                  <div className="flex items-center gap-2">
                    {shareStatus === 'success' ? (
                      <CheckCircle2 className="w-4 h-4 flex-shrink-0" />
                    ) : (
                      <AlertCircle className="w-4 h-4 flex-shrink-0" />
                    )}
                    <p className="text-sm font-medium">{shareMessage}</p>
                    <button
                      onClick={() => {
                        setShareStatus('idle')
                        setShareMessage('')
                      }}
                      className="ml-2 hover:opacity-70 min-w-[44px] min-h-[44px] flex items-center justify-center"
                      aria-label="Dismiss message"
                      type="button"
                    >
                      <X className="w-4 h-4" aria-hidden="true" />
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </CardHeader>
      </Card>

      {/* Contact Information */}
      <Card>
        <CardHeader>
          <CardTitle className="text-xl">Contact Information</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Address */}
          <div className="flex items-start">
            <MapPin className="w-6 h-6 mr-4 mt-1 flex-shrink-0 text-gray-500" />
            <div className="flex-1">
              <p className="text-sm text-gray-600 mb-1">Address</p>
              <a
                href={mapsUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="text-base text-gray-900 hover:text-indigo-600 transition-colors"
              >
                {business.address}<br />
                {business.city}, {business.state} {business.zip}
              </a>
            </div>
          </div>

          {/* Phone */}
          {business.phone && (
            <div className="flex items-center">
              <Phone className="w-6 h-6 mr-4 flex-shrink-0 text-gray-500" />
              <div className="flex-1">
                <p className="text-sm text-gray-600 mb-1">Phone</p>
                <a
                  href={`tel:${business.phone.replace(/\D/g, '')}`}
                  className="text-lg font-semibold text-indigo-600 hover:text-indigo-700 transition-colors"
                >
                  {formattedPhone}
                </a>
              </div>
            </div>
          )}

          {/* Email */}
          {business.email && (
            <div className="flex items-center">
              <Mail className="w-6 h-6 mr-4 flex-shrink-0 text-gray-500" />
              <div className="flex-1">
                <p className="text-sm text-gray-600 mb-1">Email</p>
                <a
                  href={`mailto:${business.email}`}
                  className="text-base text-indigo-600 hover:text-indigo-700 transition-colors"
                >
                  {business.email}
                </a>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Hours */}
      {business.hours && Object.keys(business.hours).length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-xl flex items-center gap-2">
              <Clock className="w-6 h-6" />
              Hours
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {hoursEntries.map(([day, hours]: [string, BusinessHours]) => (
                <div key={day} className="flex items-center justify-between py-2 border-b last:border-0">
                  <span className="text-base font-medium text-gray-900 capitalize">{day}</span>
                  <span className="text-base text-gray-600">
                    {hours.open} - {hours.close}
                  </span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Quick Actions */}
      <Card>
        <CardHeader>
          <CardTitle className="text-xl">Quick Actions</CardTitle>
          <CardDescription>Get in touch or book an appointment</CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          <Button
            asChild
            size="lg"
            className="w-full h-14 text-base font-semibold"
          >
            <Link href={`/dashboard/schedule?business=${business.id}`}>
              <Calendar className="w-5 h-5 mr-2" />
              Book Appointment
            </Link>
          </Button>

          {business.phone && (
            <Button
              variant="outline"
              size="lg"
              className="w-full h-14 text-base"
              onClick={() => window.location.href = `tel:${business.phone?.replace(/\D/g, '')}`}
            >
              <Phone className="w-5 h-5 mr-2" />
              Call {formattedPhone}
            </Button>
          )}

          <Button
            variant="outline"
            size="lg"
            className="w-full h-14 text-base"
            onClick={() => window.open(mapsUrl, '_blank')}
          >
            <Navigation className="w-5 h-5 mr-2" />
            Get Directions
          </Button>
        </CardContent>
      </Card>

      {/* Reviews */}
      <Card id="reviews">
        <CardHeader>
          <CardTitle className="text-xl">Reviews</CardTitle>
          <CardDescription>What people say about this partner.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {reviews.length === 0 ? (
            <p className="text-gray-600">No reviews yet. Be the first to add one.</p>
          ) : (
            <div className="space-y-4">
              {reviews.slice(0, 4).map((r) => (
                <div key={r.id} className="p-4 border rounded-lg">
                  <div className="flex items-center gap-2 mb-2">
                    <div className="flex items-center gap-1 text-yellow-500">
                      {Array.from({ length: r.rating }).map((_, idx) => (
                        <Star key={idx} className="w-4 h-4 fill-yellow-400 text-yellow-500" />
                      ))}
                    </div>
                    <span className="text-xs text-gray-500">
                      {r.created_at ? new Date(r.created_at).toLocaleDateString() : ''}
                    </span>
                  </div>
                  <p className="text-sm text-gray-800">{r.text}</p>
                </div>
              ))}
            </div>
          )}

          <div className="space-y-3">
            <h4 className="text-lg font-semibold">Add a review</h4>
            {reviewError && (
              <div className="p-3 rounded-lg bg-red-50 border border-red-200 text-red-700 text-sm">
                {reviewError}
              </div>
            )}
            {reviewSuccess && (
              <div className="p-3 rounded-lg bg-green-50 border border-green-200 text-green-700 text-sm">
                Review submitted!
              </div>
            )}
            <div className="space-y-2">
              <label className="text-sm text-gray-700">Rating</label>
              <select
                value={reviewRating}
                onChange={(e) => setReviewRating(Number(e.target.value))}
                className="border rounded-md p-2 text-sm"
              >
                {[5, 4, 3, 2, 1].map((r) => (
                  <option key={r} value={r}>{r} stars</option>
                ))}
              </select>
            </div>
            <div className="space-y-2">
              <label className="text-sm text-gray-700">Your review</label>
              <textarea
                value={reviewText}
                onChange={(e) => setReviewText(e.target.value)}
                className="w-full border rounded-md p-3 text-sm min-h-[100px]"
                placeholder="Share your experience..."
              />
            </div>
            <Button className="w-full h-12" onClick={handleSubmitReview}>
              Submit Review
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
