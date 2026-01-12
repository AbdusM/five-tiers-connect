import { Phone, Mail, Trash2, Users, Star, AlertCircle, CheckCircle, Bell, ShieldCheck } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Contact } from '@/lib/services/contact-service'
import { differenceInDays, parseISO } from 'date-fns'

interface ContactCardProps {
    contact: Contact
    onDelete: (id: string) => void
    onCall: (id: string) => void
}

export function ContactCard({ contact, onDelete, onCall }: ContactCardProps) {

    // --- GUILTY REMINDER LOGIC ---
    const getFrequencyDays = (freq?: string) => {
        switch (freq) {
            case 'weekly': return 7
            case 'monthly': return 30
            case 'quarterly': return 90
            case 'yearly': return 365
            default: return 30 // Default to monthly if undefined
        }
    }

    const lastContactDate = contact.last_contact ? parseISO(contact.last_contact) : new Date(0)
    const daysSince = differenceInDays(new Date(), lastContactDate)
    const freqDays = getFrequencyDays(contact.frequency)
    const isOverdue = daysSince > freqDays
    const daysOverdue = daysSince - freqDays
    const isToday = daysSince === 0
    const statusLine = isOverdue
        ? `Overdue by ${daysOverdue} days — send a quick nudge`
        : isToday
            ? 'Touched base today'
            : daysSince <= 7
                ? `Last contact ${daysSince} day${daysSince === 1 ? '' : 's'} ago — on track`
                : `Last contact ${daysSince} days ago — check in soon`

    // Prime Feed Tags (Mock Logic)
    // In real app, these would link to news feeds
    // ----------------------------

    return (
        <div
            className={`glass-panel p-5 rounded-xl transition-all duration-300 group hover:shadow-xl hover:-translate-y-1 relative overflow-hidden ${contact.is_primary
                ? 'border-amber-500/30 hover:border-amber-400/50 hover:shadow-[0_0_20px_rgba(245,158,11,0.15)]'
                : isOverdue
                    ? 'border-amber-500/20 hover:border-amber-500/40'
                    : 'border-white/10 hover:border-emerald-500/30'
                }`}
        >
            <div className="flex gap-4">
                {/* Icon / Avatar Column */}
                <div className="flex-shrink-0">
                    <div className={`p-4 rounded-full flex items-center justify-center relative transition-colors ${contact.is_primary
                        ? 'bg-amber-500/10 border border-amber-500/30 group-hover:bg-amber-500/20'
                        : 'bg-zinc-800/50 border border-white/5 group-hover:bg-zinc-800 group-hover:border-white/10'
                        }`}>
                        {contact.is_primary ? (
                            <Star className="w-8 h-8 text-amber-400 fill-amber-400/20" />
                        ) : (
                            <Users className="w-8 h-8 text-indigo-200" />
                        )}
                    </div>
                </div>

                {/* Content Column */}
                <div className="flex-1 space-y-3">
                    {/* Header */}
                    <div>
                        <div className="flex justify-between items-start pr-2">
                            <div className="flex items-center gap-1.5">
                                <h3 className="text-xl font-bold text-zinc-50 leading-tight">{contact.name}</h3>
                                {contact.verified && (
                                    <div className="text-blue-400" title="Verified Partner">
                                        <ShieldCheck className="w-5 h-5 fill-blue-500/20" />
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Origin Story */}
                        {contact.origin && (
                            <p className="text-xs text-zinc-400 mt-0.5 mb-2 truncate">
                                <span className="font-medium text-zinc-300">Origin:</span> {contact.origin}
                            </p>
                        )}

                        <div className="flex flex-wrap gap-2 items-center">
                            <Badge variant="secondary" className="text-[11px] font-semibold bg-indigo-500/20 text-indigo-100 border border-indigo-300/40">
                                {contact.role}
                            </Badge>
                            {/* Frequency Badge */}
                            <div className={`flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] uppercase font-bold tracking-wider border ${isOverdue ? 'border-amber-300 bg-amber-500/15 text-amber-200' : 'border-zinc-700 bg-zinc-800 text-zinc-200'}`}>
                                {isOverdue && <AlertCircle className="w-3 h-3" />}
                                {contact.frequency || 'Monthly'}
                            </div>
                        </div>
                    </div>

                    {/* Prime Feed Tags */}
                    {contact.tags && contact.tags.length > 0 && (
                        <div className="flex flex-wrap gap-1.5 py-1">
                            {contact.tags.slice(0, 3).map(tag => (
                                <span key={tag} className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-semibold bg-indigo-500/15 text-indigo-100 border border-indigo-300/30">
                                    #{tag}
                                </span>
                            ))}
                            {contact.tags.length > 3 && (
                                <span className="text-[10px] text-zinc-400">+{contact.tags.length - 3} more</span>
                            )}
                        </div>
                    )}

                    {/* Insight line */}
                    <div className={`text-xs font-medium ${isOverdue ? 'text-amber-300' : 'text-zinc-300'}`}>
                        {statusLine}
                    </div>

                    {/* Actions */}
                    <div className="flex gap-2 pt-2">
                        <Button
                            onClick={() => onCall(contact.id)}
                            className={`flex-1 h-10 text-sm shadow-sm ${contact.is_primary
                                ? 'bg-emerald-500 text-white hover:bg-emerald-400'
                                : isOverdue
                                    ? 'bg-amber-500 text-white hover:bg-amber-400'
                                    : 'bg-zinc-800 text-zinc-100 border border-white/10 hover:bg-zinc-700'
                                }`}
                        >
                            <Phone className="w-3.5 h-3.5 mr-2" />
                            {isOverdue && !contact.is_primary ? 'Reconnect' : 'Call'}
                        </Button>

                        <Button
                            variant="outline"
                            className="h-10 px-3 text-sm border-white/10 text-zinc-200 hover:border-emerald-400/40 hover:text-emerald-200"
                        >
                            <Bell className="w-4 h-4 mr-2" />
                            Nudge
                        </Button>

                        <Button
                            variant="ghost"
                            size="icon"
                            className="h-10 w-10 text-zinc-400 hover:text-red-400 hover:bg-red-500/10"
                            onClick={() => onDelete(contact.id)}
                        >
                            <Trash2 className="w-4 h-4" />
                        </Button>
                    </div>

                    {/* Condensed contact info row */}
                    <div className="flex items-center gap-3 text-xs text-zinc-500 pt-1">
                        <div className="flex items-center gap-1.5">
                            <Phone className="w-3.5 h-3.5" />
                            <span>{contact.phone}</span>
                        </div>
                        {contact.email && (
                            <div className="flex items-center gap-1.5 truncate">
                                <Mail className="w-3.5 h-3.5" />
                                <span className="truncate max-w-[180px]">{contact.email}</span>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    )
}
