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
    const colorClass = CaseloadService.getScoreColor(score)

    return (
        <Card className="overflow-hidden cursor-pointer hover:bg-muted/50 transition-colors border-l-4" style={{
            borderLeftColor: score >= 80 ? '#9333ea' : score >= 50 ? '#3b82f6' : '#9ca3af'
        }}>
            <CardContent className="p-4">
                <div className="flex items-start justify-between gap-4">
                    {/* Avatar with Stability Ring */}
                    <div className={`relative p-1 rounded-full border-2 ${colorClass}`}>
                        <Avatar className="h-12 w-12">
                            <AvatarImage src={mentee.avatar} />
                            <AvatarFallback>{mentee.name.charAt(0)}</AvatarFallback>
                        </Avatar>
                    </div>

                    {/* Main Info */}
                    <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between mb-1">
                            <h3 className="font-semibold text-lg truncate">{mentee.name}</h3>
                            <Badge variant={mentee.status === 'Crisis' ? 'destructive' : 'secondary'} className="text-xs">
                                {mentee.status}
                            </Badge>
                        </div>

                        <div className="flex items-center gap-4 text-sm text-muted-foreground">
                            <div className="flex items-center gap-1">
                                <MapPin className="w-3 h-3" />
                                {mentee.location}
                            </div>
                            <div className="flex items-center gap-1">
                                <Clock className="w-3 h-3" />
                                {new Date(mentee.lastContact).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}
                            </div>
                        </div>
                    </div>

                    {/* Actions */}
                    <div className="flex flex-col gap-2">
                        <Button size="icon" variant="ghost" className="h-8 w-8 rounded-full bg-green-50 text-green-600 hover:bg-green-100">
                            <Phone className="w-4 h-4" />
                        </Button>
                        <Button size="icon" variant="ghost" className="h-8 w-8 rounded-full bg-blue-50 text-blue-600 hover:bg-blue-100">
                            <MessageSquare className="w-4 h-4" />
                        </Button>
                    </div>
                </div>

                {/* Encouragement / Context Line */}
                {score < 50 && (
                    <div className="mt-3 flex items-center gap-2 text-xs font-medium text-gray-500 bg-gray-50 px-3 py-1.5 rounded-md">
                        <AlertCircle className="w-3 h-3 text-gray-400" />
                        Reach out to build momentum
                    </div>
                )}
            </CardContent>
        </Card>
    )
}
