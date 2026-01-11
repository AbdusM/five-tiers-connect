'use client'

import { useState } from 'react'
import { PauseCircle } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { PauseOverlay } from '@/features/cognitive-support/components/PauseOverlay'

export function CognitiveSupportWrapper({ children }: { children: React.ReactNode }) {
    const [isPauseOpen, setIsPauseOpen] = useState(false)

    return (
        <>
            {children}

            {/* Global Pause Button (Bottom Right FAB) */}
            <div className="fixed bottom-6 right-6 z-50 print:hidden">
                <Button
                    size="lg"
                    className="h-16 w-16 rounded-full bg-red-600 hover:bg-red-700 text-white shadow-xl border-4 border-white dark:border-gray-950 animate-in zoom-in duration-300 hover:scale-110 transition-transform"
                    onClick={() => setIsPauseOpen(true)}
                >
                    <PauseCircle className="h-8 w-8" />
                    <span className="sr-only">Panic / Pause</span>
                </Button>
            </div>

            <PauseOverlay isOpen={isPauseOpen} onClose={() => setIsPauseOpen(false)} />
        </>
    )
}
