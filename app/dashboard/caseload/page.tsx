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
    const stats = useMemo(() => {
        const total = caseload.length
        const atRisk = caseload.filter(m => (m.score || 0) < 50).length
        const stable = caseload.filter(m => (m.score || 0) >= 80).length
        const crisis = caseload.filter(m => m.status?.toLowerCase() === 'crisis').length
        return { total, atRisk, stable, crisis }
    }, [caseload])

    const filteredCaseload = useMemo(() => {
        return caseload
            .filter(m => m.name.toLowerCase().includes(searchQuery.toLowerCase()))
            .sort((a, b) => (a.score || 0) - (b.score || 0))
    }, [caseload, searchQuery])

    // Optimistic Update Handler
    const handleLogSuccess = (menteeId: string) => {
        setCaseload(prev => prev.map(m => {
            if (m.id === menteeId) {
                const updated = { ...m, lastContact: new Date().toISOString() }
                updated.score = CaseloadService.calculateStrengthScore(updated)
                return updated
            }
            return m
        }))
    }

    if (isLoading) return <div className="p-8 text-center text-zinc-500 font-mono text-sm animate-pulse">Loading dossiers...</div>

    return (
        <div className="relative min-h-[calc(100vh-4rem)] pb-20 animate-fade-up">
            {/* Glass Header / Search */}
            <div className="sticky top-0 z-30 pt-4 pb-6 -mx-4 px-4 md:-mx-8 md:px-8 bg-zinc-950/85 backdrop-blur-md border-b border-white/10 shadow-2xl">
                <div className="flex items-center justify-between mb-4">
                    <div>
                        <h2 className="text-xs font-mono text-emerald-400 uppercase tracking-[0.25em]">Active Monitoring</h2>
                        <h1 className="text-3xl font-serif text-white tracking-tight">My Caseload</h1>
                    </div>
                    <div className="flex items-center gap-2 text-xs font-mono text-zinc-200 bg-zinc-900/80 border border-white/10 px-3 py-1.5 rounded-full">
                        <Clock className="w-3.5 h-3.5 text-emerald-400" />
                        <span className="text-emerald-200">{filteredCaseload.length} ACTIVE</span>
                    </div>
                </div>

                <div className="flex gap-3">
                    <div className="relative flex-1 group">
                        <Search className="absolute left-3 top-2.5 h-4 w-4 text-zinc-500 group-focus-within:text-emerald-500 transition-colors" />
                        <Input
                            type="search"
                            placeholder="Search by name or code..."
                            className="pl-9 bg-zinc-900/50 border-white/10 text-white placeholder:text-zinc-600 focus-visible:ring-emerald-500/50 focus-visible:border-emerald-500/50 h-10"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                        />
                    </div>
                    <Button variant="outline" size="icon" className="shrink-0 border-white/10 bg-zinc-900/50 text-zinc-400 hover:text-white hover:bg-zinc-800">
                        <Filter className="w-4 h-4" />
                    </Button>
                </div>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mt-4">
                    <div className="glass-panel border-white/10 rounded-xl p-3">
                        <p className="text-[11px] uppercase text-zinc-400 font-mono">Total</p>
                        <p className="text-2xl font-bold text-white">{stats.total}</p>
                    </div>
                    <div className="glass-panel border-white/10 rounded-xl p-3">
                        <p className="text-[11px] uppercase text-amber-300 font-mono">At Risk</p>
                        <p className="text-2xl font-bold text-amber-300">{stats.atRisk}</p>
                    </div>
                    <div className="glass-panel border-white/10 rounded-xl p-3">
                        <p className="text-[11px] uppercase text-emerald-300 font-mono">Stable</p>
                        <p className="text-2xl font-bold text-emerald-300">{stats.stable}</p>
                    </div>
                    <div className={`glass-panel border-white/10 rounded-xl p-3 ${stats.crisis > 0 ? 'animate-border-marquee relative overflow-hidden' : ''}`}>
                        <p className="text-[11px] uppercase text-red-300 font-mono">Crisis</p>
                        <p className="text-2xl font-bold text-red-300">{stats.crisis}</p>
                    </div>
                </div>
            </div>

            {/* Dossier Grid */}
            <div className="grid md:grid-cols-2 lg:grid-cols-2 xl:grid-cols-3 gap-6 mt-6">
                {filteredCaseload.map((mentee) => (
                    <CaseloadCard key={mentee.id} mentee={mentee} />
                ))}
            </div>

            {/* Floating Action Button - Modernized */}
            <div className="fixed bottom-8 right-8 z-50">
                <div className="absolute inset-0 bg-emerald-500 blur-xl opacity-20 rounded-full animate-pulse" />
                <QuickLogDialog mentees={caseload} onLogSuccess={handleLogSuccess} />
            </div>
        </div>
    )
}
