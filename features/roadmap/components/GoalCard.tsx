'use client'

import { Goal, GoalStatus } from '@/lib/services/goal-service'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { CheckCircle2, ArrowRight, ArrowLeft } from 'lucide-react'

interface GoalCardProps {
    goal: Goal
    onMove: (id: string, newStatus: GoalStatus) => void
}

const CATEGORY_COLORS: Record<string, string> = {
    legal: 'bg-red-500/10 text-red-400 border-red-500/20',
    employment: 'bg-blue-500/10 text-blue-400 border-blue-500/20',
    education: 'bg-indigo-500/10 text-indigo-400 border-indigo-500/20',
    health: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20',
    housing: 'bg-amber-500/10 text-amber-400 border-amber-500/20',
    financial: 'bg-purple-500/10 text-purple-400 border-purple-500/20'
}

export function GoalCard({ goal, onMove }: GoalCardProps) {
    return (
        <div className="mb-3 glass-panel p-4 rounded-xl transition-all duration-300 hover:shadow-lg hover:-translate-y-0.5 border border-white/10 group">
            <div className="space-y-3">
                <div className="flex justify-between items-start">
                    <Badge variant="outline" className={`${CATEGORY_COLORS[goal.category] || 'bg-zinc-800 text-zinc-400 border-zinc-700'} text-[10px] font-mono font-bold uppercase tracking-wider px-2 py-0.5 border`}>
                        {goal.category}
                    </Badge>
                    <span className="text-xs font-mono font-bold text-zinc-400 group-hover:text-white transition-colors">+{goal.points} pts</span>
                </div>

                <h4 className="font-semibold text-zinc-100 text-base leading-snug">{goal.title}</h4>
                {goal.description && (
                    <p className="text-xs text-zinc-400 mb-2 line-clamp-2 leading-relaxed">
                        {goal.description}
                    </p>
                )}

                <div className="flex justify-between items-center pt-2 border-t border-white/5">
                    {/* Left Action */}
                    {goal.status === 'in-progress' && (
                        <Button
                            variant="ghost"
                            size="sm"
                            className="h-9 -ml-2 text-zinc-200 hover:text-white hover:bg-zinc-800"
                            onClick={() => onMove(goal.id, 'todo')}
                        >
                            <ArrowLeft className="w-4 h-4 mr-1" /> To Do
                        </Button>
                    )}

                    {goal.status === 'done' && (
                        <Button
                            variant="ghost"
                            size="sm"
                            className="h-9 -ml-2 text-zinc-200 hover:text-white hover:bg-zinc-800"
                            onClick={() => onMove(goal.id, 'in-progress')}
                        >
                            <ArrowLeft className="w-4 h-4 mr-1" /> Not Done
                        </Button>
                    )}

                    {/* Spacer if no left action */}
                    {(goal.status === 'todo') && <div />}

                    {/* Right Action */}
                    {goal.status === 'todo' && (
                        <Button
                            variant="ghost"
                            size="sm"
                            className="h-9 -mr-2 text-blue-300 hover:text-white hover:bg-blue-900/40"
                            onClick={() => onMove(goal.id, 'in-progress')}
                        >
                            Start <ArrowRight className="w-4 h-4 ml-1" />
                        </Button>
                    )}

                    {goal.status === 'in-progress' && (
                        <Button
                            variant="ghost"
                            size="sm"
                            className="h-9 -mr-2 text-emerald-300 hover:text-white hover:bg-emerald-900/40"
                            onClick={() => onMove(goal.id, 'done')}
                        >
                            Complete <CheckCircle2 className="w-4 h-4 ml-1" />
                        </Button>
                    )}
                </div>
            </div>
        </div>
    )
}
