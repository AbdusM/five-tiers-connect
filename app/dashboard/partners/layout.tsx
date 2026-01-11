'use client'

import { ErrorBoundary } from '@/components/error-boundary'

export default function PartnersLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <ErrorBoundary>
      {children}
    </ErrorBoundary>
  )
}
