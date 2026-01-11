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
    legal: 'bg-red-100 text-red-800 border-red-200',
    employment: 'bg-blue-100 text-blue-800 border-blue-200',
    education: 'bg-indigo-100 text-indigo-800 border-indigo-200',
    health: 'bg-green-100 text-green-800 border-green-200',
    housing: 'bg-orange-100 text-orange-800 border-orange-200',
    financial: 'bg-emerald-100 text-emerald-800 border-emerald-200'
}

export function GoalCard({ goal, onMove }: GoalCardProps) {
    return (
        <Card className="mb-3 hover:shadow-md transition-shadow group animate-in fade-in zoom-in duration-300">
            <CardContent className="p-4">
                <div className="flex justify-between items-start mb-2">
                    <Badge variant="outline" className={`${CATEGORY_COLORS[goal.category] || 'bg-gray-100'} text-xs font-semibold uppercase tracking-wider`}>
                        {goal.category}
                    </Badge>
                    <span className="text-xs font-medium text-gray-500">+{goal.points} pts</span>
                </div>

                <h4 className="font-semibold text-gray-900 mb-2">{goal.title}</h4>
                {goal.description && (
                    <p className="text-sm text-gray-500 mb-4 line-clamp-2">
                        {goal.description}
                    </p>
                )}

                <div className="flex justify-between items-center opacity-0 group-hover:opacity-100 transition-opacity">
                    {/* Left Action */}
                    {goal.status === 'in-progress' && (
                        <Button
                            variant="ghost"
                            size="sm"
                            className="h-8 -ml-2 text-gray-400 hover:text-gray-700"
                            onClick={() => onMove(goal.id, 'todo')}
                        >
                            <ArrowLeft className="w-4 h-4 mr-1" /> To Do
                        </Button>
                    )}

                    {goal.status === 'done' && (
                        <Button
                            variant="ghost"
                            size="sm"
                            className="h-8 -ml-2 text-gray-400 hover:text-gray-700"
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
                            className="h-8 -mr-2 text-blue-600 hover:bg-blue-50"
                            onClick={() => onMove(goal.id, 'in-progress')}
                        >
                            Start <ArrowRight className="w-4 h-4 ml-1" />
                        </Button>
                    )}

                    {goal.status === 'in-progress' && (
                        <Button
                            variant="ghost"
                            size="sm"
                            className="h-8 -mr-2 text-green-600 hover:bg-green-50"
                            onClick={() => onMove(goal.id, 'done')}
                        >
                            Complete <CheckCircle2 className="w-4 h-4 ml-1" />
                        </Button>
                    )}
                </div>
            </CardContent>
        </Card>
    )
}
