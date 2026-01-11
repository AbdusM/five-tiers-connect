import { Phone, MessageSquare, MapPin, Clock, AlertCircle } from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Mentee, CaseloadService } from '@/lib/services/caseload-service'

interface CaseloadCardProps {
    mentee: Mentee
}

export function CaseloadCard({ mentee }: CaseloadCardProps) {
    const score = mentee.score || CaseloadService.calculateStrengthScore(mentee)

    // Lux Status Colors
    let statusColor = 'border-zinc-600' // Default
    let glowClass = ''
    if (score >= 80) {
        statusColor = 'border-emerald-500'
        glowClass = 'hover:shadow-[0_0_20px_rgba(16,185,129,0.2)] hover:border-emerald-500/50'
    } else if (score >= 50) {
        statusColor = 'border-blue-500'
        glowClass = 'hover:shadow-[0_0_20px_rgba(59,130,246,0.2)] hover:border-blue-500/50'
    } else {
        statusColor = 'border-orange-500' // Needs attention
        glowClass = 'hover:shadow-[0_0_20px_rgba(249,115,22,0.2)] hover:border-orange-500/50'
    }

    const progressWidth = Math.min(Math.max(score, 0), 100)

    return (
        <div className={`glass-panel p-5 rounded-xl transition-all duration-300 group ${glowClass} border border-white/10`}>
            <div className="flex items-start gap-4">
                {/* Avatar with Status Ring */}
                <div className={`relative p-0.5 rounded-full border-2 ${statusColor} shadow-lg`}>
                    <Avatar className="h-14 w-14">
                        <AvatarImage src={mentee.avatar} />
                        <AvatarFallback className="bg-zinc-800 text-zinc-400">{mentee.name.charAt(0)}</AvatarFallback>
                    </Avatar>
                </div>

                {/* Main Info */}
                <div className="flex-1 min-w-0 pt-0.5">
                    <div className="flex items-center justify-between mb-1">
                        <h3 className="font-serif text-lg text-zinc-100 group-hover:text-white transition-colors truncate">{mentee.name}</h3>
                        <Badge variant="outline" className={`text-[10px] uppercase tracking-wide border-white/10 ${mentee.status === 'Crisis' ? 'text-red-300 bg-red-500/10' : 'text-zinc-300 bg-zinc-800/70'}`}>
                            {mentee.status}
                        </Badge>
                    </div>

                    <div className="mt-1">
                        <p className={`text-xs font-medium font-mono flex items-center gap-2 ${(mentee.score || 0) < 50 ? 'text-amber-400' : 'text-emerald-400'
                            }`}>
                            <Clock className="w-3 h-3" />
                            {(() => {
                                const days = Math.floor((new Date().getTime() - new Date(mentee.lastContact).getTime()) / (1000 * 3600 * 24))
                                if (days > 30) return `Overdue by ${days} days — nudge needed`
                                if (days > 14) return `Last contact ${days} days ago`
                                if (days === 0) return `Contacted today`
                                return `On track — ${days}d since last touch`
                            })()}
                        </p>
                    </div>
                </div>
            </div>

            {/* Micro Actions and score */}
            <div className="mt-5 pt-4 border-t border-white/5 space-y-3">
                <div className="flex items-center justify-between">
                    <div className="text-xs font-mono text-zinc-400">
                        RES: <span className={score < 50 ? 'text-amber-300' : score >= 80 ? 'text-emerald-300' : 'text-blue-300'}>{score}%</span>
                    </div>
                    <div className="flex gap-2">
                        <Button size="icon" variant="ghost" className="h-8 w-8 rounded-md text-zinc-300 hover:text-emerald-300 hover:bg-emerald-400/10">
                            <Phone className="w-3.5 h-3.5" />
                        </Button>
                        <Button size="icon" variant="ghost" className="h-8 w-8 rounded-md text-zinc-300 hover:text-blue-300 hover:bg-blue-400/10">
                            <MessageSquare className="w-3.5 h-3.5" />
                        </Button>
                    </div>
                </div>
                <div className="w-full h-2 bg-zinc-800 rounded-full overflow-hidden border border-white/5">
                    <div
                        className={`h-full ${score < 50 ? 'bg-amber-400' : score >= 80 ? 'bg-emerald-400' : 'bg-blue-400'}`}
                        style={{ width: `${progressWidth}%` }}
                    />
                </div>
            </div>

            {/* Encouragement / Context Line */}
            {score < 50 && (
                <div className="mt-3 flex items-center gap-2 text-[10px] font-medium text-orange-400/80 bg-orange-500/10 px-3 py-1.5 rounded border border-orange-500/20">
                    <AlertCircle className="w-3 h-3" />
                    INTERVENTION REQUIRED
                </div>
            )}
        </div>
    )
}
