'use client'

import { useState, useEffect } from 'react'
import { Goal, GoalService, GoalStatus } from '@/lib/services/goal-service'
import { GoalCard } from './GoalCard'
import { Trophy, RefreshCw } from 'lucide-react'
import { Button } from '@/components/ui/button'

export function RoadmapBoard() {
    const [goals, setGoals] = useState<Goal[]>([])
    const [isLoading, setIsLoading] = useState(true)

    const refreshGoals = async () => {
        setIsLoading(true)
        const data = await GoalService.getGoals()
        setGoals(data)
        setIsLoading(false)
    }

    useEffect(() => {
        refreshGoals()
    }, [])

    const handleMove = async (id: string, newStatus: GoalStatus) => {
        // Optimistic update
        setGoals(prev => prev.map(g =>
            g.id === id ? { ...g, status: newStatus } : g
        ))

        // In real app, we'd wait for API or revert on error
        await GoalService.updateStatus(id, newStatus)
    }

    const totalPoints = GoalService.calculateTotalPoints(goals)

    // Updated Columns Configuration with stronger visual separation
    const columns: { id: GoalStatus, title: string, color: string, bg: string, border: string }[] = [
        {
            id: 'todo',
            title: 'To Do',
            color: 'text-white',
            bg: 'bg-zinc-900/85',
            border: 'border-white/10'
        },
        {
            id: 'in-progress',
            title: 'Action Plan',
            color: 'text-white',
            bg: 'bg-indigo-950/80',
            border: 'border-indigo-200/40'
        },
        {
            id: 'done',
            title: 'Achievements',
            color: 'text-white',
            bg: 'bg-emerald-950/80',
            border: 'border-emerald-200/40'
        }
    ]

    return (
        <div className="h-full flex flex-col">
            {/* Header / Stats */}
            <div className="flex justify-between items-center mb-6 px-1">
                <div className="flex items-center space-x-3">
                    <div className="p-2.5 bg-amber-500/10 rounded-xl border border-amber-500/20 shadow-[0_0_15px_rgba(245,158,11,0.1)]">
                        <Trophy className="w-5 h-5 text-amber-400" />
                    </div>
                    <div>
                        <p className="text-[10px] text-zinc-400 font-mono font-bold uppercase tracking-widest mb-0.5">Total Strength</p>
                        <p className="text-3xl font-bold text-white font-sans tracking-tight">{totalPoints} <span className="text-sm font-normal text-zinc-500 font-mono">pts</span></p>
                    </div>
                </div>
                <Button variant="outline" size="sm" onClick={refreshGoals} disabled={isLoading} className="border-white/10 bg-zinc-900/50 text-zinc-400 hover:text-white hover:bg-zinc-800 transition-colors">
                    <RefreshCw className={`w-3.5 h-3.5 mr-2 ${isLoading ? 'animate-spin' : ''}`} />
                    Refresh Board
                </Button>
            </div>

            {/* Board */}
            <div className="flex-1 overflow-x-auto">
                <div className="flex flex-col md:flex-row gap-6 min-w-full md:min-w-[800px] h-full pb-4 px-1">
                    {columns.map(col => {
                        const colGoals = goals.filter(g => g.status === col.id)
                        return (
                            <div key={col.id} className={`flex-1 min-w-0 flex flex-col rounded-xl border ${col.border} ${col.bg} overflow-hidden shadow-md`}>
                                {/* Column Header */}
                                <div className={`flex justify-between items-center p-4 border-b ${col.border} bg-white/5 backdrop-blur-sm`}>
                                    <h3 className={`font-bold ${col.color} text-lg`}>{col.title}</h3>
                                    <span className={`px-2.5 py-1 rounded-md text-xs font-bold bg-white/10 border ${col.border} ${col.color}`}>
                                        {colGoals.length}
                                    </span>
                                </div>

                                {/* Column Body */}
                                <div className="flex-1 p-3 overflow-y-auto custom-scrollbar">
                                    {colGoals.length === 0 ? (
                                        <div className="h-32 flex flex-col items-center justify-center text-sm text-zinc-300 border-2 border-dashed border-white/15 rounded-lg m-2">
                                            <p>No items</p>
                                        </div>
                                    ) : (
                                        <div className="space-y-3">
                                            {colGoals.map(goal => (
                                                <GoalCard key={goal.id} goal={goal} onMove={handleMove} />
                                            ))}
                                        </div>
                                    )}
                                </div>
                            </div>
                        )
                    })}
                </div>
            </div>
        </div>
    )
}
