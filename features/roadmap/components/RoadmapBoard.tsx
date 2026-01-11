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
            color: 'text-gray-700',
            bg: 'bg-gray-50/80',
            border: 'border-gray-200'
        },
        {
            id: 'in-progress',
            title: 'Action Plan',
            color: 'text-blue-700',
            bg: 'bg-blue-50/50',
            border: 'border-blue-200'
        },
        {
            id: 'done',
            title: 'Achievements',
            color: 'text-green-700',
            bg: 'bg-green-50/50',
            border: 'border-green-200'
        }
    ]

    return (
        <div className="h-full flex flex-col">
            {/* Header / Stats */}
            <div className="flex justify-between items-center mb-6 px-1">
                <div className="flex items-center space-x-2">
                    <div className="p-2 bg-yellow-100 rounded-full shadow-sm">
                        <Trophy className="w-5 h-5 text-yellow-600" />
                    </div>
                    <div>
                        <p className="text-xs text-gray-500 font-bold uppercase tracking-wider">Total Strength</p>
                        <p className="text-2xl font-black text-gray-900 leading-none">{totalPoints} pts</p>
                    </div>
                </div>
                <Button variant="outline" size="sm" onClick={refreshGoals} disabled={isLoading} className="border-gray-200">
                    <RefreshCw className={`w-4 h-4 mr-2 ${isLoading ? 'animate-spin' : ''}`} />
                    Refresh
                </Button>
            </div>

            {/* Board */}
            <div className="flex-1 overflow-x-auto">
                <div className="flex flex-col md:flex-row gap-6 min-w-full md:min-w-[800px] h-full pb-4 px-1">
                    {columns.map(col => {
                        const colGoals = goals.filter(g => g.status === col.id)
                        return (
                            <div key={col.id} className={`flex-1 min-w-0 flex flex-col rounded-xl border ${col.border} ${col.bg} overflow-hidden shadow-sm`}>
                                {/* Column Header */}
                                <div className={`flex justify-between items-center p-4 border-b ${col.border} bg-white/50 backdrop-blur-sm`}>
                                    <h3 className={`font-bold ${col.color} text-lg`}>{col.title}</h3>
                                    <span className={`px-2.5 py-1 rounded-md text-xs font-bold bg-white border ${col.border} ${col.color}`}>
                                        {colGoals.length}
                                    </span>
                                </div>

                                {/* Column Body */}
                                <div className="flex-1 p-3 overflow-y-auto custom-scrollbar">
                                    {colGoals.length === 0 ? (
                                        <div className="h-32 flex flex-col items-center justify-center text-sm text-gray-400 border-2 border-dashed border-gray-200/50 rounded-lg m-2">
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
