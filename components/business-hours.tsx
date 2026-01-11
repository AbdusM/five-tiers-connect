'use client'

import Link from 'next/link'
import { Clock } from 'lucide-react'
import type { BusinessHours as BusinessHoursType } from '@/types/database'

interface BusinessHoursProps {
  hours: Record<string, BusinessHoursType>
  businessId?: string
  maxDisplay?: number
  className?: string
}

export function BusinessHours({ 
  hours, 
  businessId, 
  maxDisplay = 3,
  className = ''
}: BusinessHoursProps) {
  const hoursEntries = Object.entries(hours)
  
  if (hoursEntries.length === 0) {
    return null
  }

  return (
    <div className={`flex items-start ${className}`}>
      <Clock className="w-5 h-5 mr-3 mt-0.5 flex-shrink-0 text-gray-500" />
      <div className="text-sm text-gray-600 flex-1">
        {hoursEntries.length <= maxDisplay ? (
          // Show all if within limit
          hoursEntries.map(([day, hours]: [string, BusinessHoursType]) => (
            <div key={day} className="capitalize">
              {day}: {hours.open} - {hours.close}
            </div>
          ))
        ) : (
          // Show first (maxDisplay - 1), then "View all hours" link
          <>
            {hoursEntries.slice(0, maxDisplay - 1).map(([day, hours]: [string, BusinessHoursType]) => (
              <div key={day} className="capitalize">
                {day}: {hours.open} - {hours.close}
              </div>
            ))}
            {businessId ? (
              <Link
                href={`/dashboard/partners/${businessId}`}
                className="text-indigo-600 hover:text-indigo-700 font-medium mt-1 inline-block"
              >
                View all hours →
              </Link>
            ) : (
              <div className="text-gray-500 mt-1">
                +{hoursEntries.length - (maxDisplay - 1)} more days
              </div>
            )}
          </>
        )}
      </div>
    </div>
  )
}
