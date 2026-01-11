'use client'

import { useState, useMemo, useEffect } from 'react'
import { Search, Filter, Clock } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { CaseloadService, Mentee } from '@/lib/services/caseload-service'
import { CaseloadCard } from '@/features/caseload/components/CaseloadCard'
import { QuickLogDialog } from '@/features/caseload/components/QuickLogDialog'

export default function CaseloadPage() {
    const [caseload, setCaseload] = useState<Mentee[]>([])
    const [searchQuery, setSearchQuery] = useState('')
    const [isLoading, setIsLoading] = useState(true)

    // Load Data
    useEffect(() => {
        const load = async () => {
            const data = await CaseloadService.getCaseload()
            setCaseload(data)
            setIsLoading(false)
        }
        load()
    }, [])

    // Filter Logic
    const filteredCaseload = useMemo(() => {
        return caseload
            .filter(m => m.name.toLowerCase().includes(searchQuery.toLowerCase()))
            // Service already returns sorted, but we re-sort to handle updates if needed
            .sort((a, b) => (a.score || 0) - (b.score || 0))
    }, [caseload, searchQuery])

    // Optimistic Update Handler
    const handleLogSuccess = (menteeId: string) => {
        setCaseload(prev => prev.map(m => {
            if (m.id === menteeId) {
                const updated = { ...m, lastContact: new Date().toISOString() }
                // Re-calculate score on client for instant feedback
                updated.score = CaseloadService.calculateStrengthScore(updated)
                return updated
            }
            return m
        }))
    }

    if (isLoading) return <div className="p-8 text-center text-muted-foreground">Loading caseload...</div>

    return (
        <div className="relative min-h-[calc(100vh-4rem)] pb-20">
            {/* Header / Search */}
            <div className="sticky top-0 z-10 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 pt-4 pb-2 space-y-4">
                <div className="flex items-center justify-between">
                    <h1 className="text-3xl font-bold tracking-tight">My Caseload</h1>
                    <div className="flex items-center gap-2 text-sm text-muted-foreground bg-secondary/50 px-3 py-1 rounded-full">
                        <Clock className="w-4 h-4" />
                        <span>{filteredCaseload.length} Active</span>
                    </div>
                </div>

                <div className="flex gap-2">
                    <div className="relative flex-1">
                        <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                        <Input
                            type="search"
                            placeholder="Search mentees..."
                            className="pl-8 bg-muted/50 border-0"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                        />
                    </div>
                    <Button variant="outline" size="icon" className="shrink-0">
                        <Filter className="w-4 h-4" />
                    </Button>
                </div>
            </div>

            {/* List Feed */}
            <div className="space-y-3 mt-4">
                {filteredCaseload.map((mentee) => (
                    <CaseloadCard key={mentee.id} mentee={mentee} />
                ))}
            </div>

            {/* Floating Action Button */}
            <div className="fixed bottom-6 right-6 z-50">
                <QuickLogDialog mentees={caseload} onLogSuccess={handleLogSuccess} />
            </div>
        </div>
    )
}
