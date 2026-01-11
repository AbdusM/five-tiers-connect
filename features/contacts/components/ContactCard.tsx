import { Phone, Mail, Trash2, Users, Star, Siren, RefreshCw, AlertCircle, CheckCircle } from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'
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

    // Prime Feed Tags (Mock Logic)
    // In real app, these would link to news feeds
    // ----------------------------

    return (
        <Card
            className={`transition-all duration-200 hover:shadow-xl hover:-translate-y-1 active:scale-[0.98] relative overflow-hidden ${contact.is_primary ? 'border-2 border-yellow-400 bg-yellow-50/30' : ''
                }`}
        >
            {/* Status Strip (Subtle) */}
            {isOverdue && (
                <div className="absolute left-0 top-0 bottom-0 w-1 bg-amber-400" />
            )}

            <CardContent className="p-6 pl-7"> {/* Logic to offset padding for strip */}
                <div className="flex gap-4">
                    {/* Icon / Avatar Column */}
                    <div className="flex-shrink-0">
                        <div className={`p-4 rounded-full flex items-center justify-center relative ${contact.is_primary ? 'bg-yellow-100' : 'bg-gray-100'
                            }`}>
                            {contact.is_primary ? (
                                <Star className="w-8 h-8 text-yellow-600 fill-yellow-600" />
                            ) : (
                                <Users className="w-8 h-8 text-indigo-600/80" />
                            )}
                        </div>
                    </div>

                    {/* Content Column */}
                    <div className="flex-1 space-y-4">
                        {/* Header */}
                        <div>
                            <div className="flex justify-between items-start pr-2">
                                <h3 className="text-xl font-bold text-gray-900 leading-tight">{contact.name}</h3>
                            </div>

                            {/* Origin Story */}
                            {contact.origin && (
                                <p className="text-xs text-gray-400 mt-0.5 mb-2 truncate">
                                    <span className="font-medium">Origin:</span> {contact.origin}
                                </p>
                            )}

                            <div className="flex flex-wrap gap-2 items-center">
                                <Badge variant="secondary" className="text-xs font-medium bg-gray-100 text-gray-600 hover:bg-gray-200">
                                    {contact.role}
                                </Badge>
                                {/* Frequency Badge */}
                                <div className={`flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] uppercase font-bold tracking-wider border ${isOverdue ? 'border-amber-200 bg-amber-50 text-amber-700' : 'border-gray-100 text-gray-400'}`}>
                                    {isOverdue && <AlertCircle className="w-3 h-3" />}
                                    {contact.frequency || 'Monthly'}
                                </div>
                            </div>
                        </div>

                        {/* Prime Feed Tags */}
                        {contact.tags && contact.tags.length > 0 && (
                            <div className="flex flex-wrap gap-1.5 py-1">
                                {contact.tags.map(tag => (
                                    <span key={tag} className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-medium bg-indigo-50 text-indigo-600">
                                        #{tag}
                                    </span>
                                ))}
                            </div>
                        )}

                        {/* Details */}
                        <div className="space-y-1.5 pt-1">
                            <div className="flex items-center text-gray-700 text-sm">
                                <Phone className="w-4 h-4 mr-2 text-gray-400" />
                                <span className="font-medium text-gray-600">{contact.phone}</span>
                            </div>
                            {contact.email && (
                                <div className="flex items-center text-gray-600 text-sm">
                                    <Mail className="w-4 h-4 mr-2 text-gray-400" />
                                    <span>{contact.email}</span>
                                </div>
                            )}
                        </div>

                        {/* Actions */}
                        <div className="flex gap-2 pt-2">
                            <Button
                                onClick={() => onCall(contact.id)}
                                className={`flex-1 h-9 text-sm shadow-sm ${contact.is_primary
                                    ? 'bg-gray-900 text-white hover:bg-gray-800'
                                    : isOverdue
                                        ? 'bg-amber-100 text-amber-900 hover:bg-amber-200 border border-amber-200'
                                        : 'bg-white border border-gray-200 text-gray-700 hover:bg-gray-50'
                                    }`}
                            >
                                <Phone className="w-3.5 h-3.5 mr-2" />
                                {isOverdue && !contact.is_primary ? 'Reconnect' : 'Call'}
                            </Button>

                            <Button
                                variant="ghost"
                                size="icon"
                                className="h-9 w-9 text-gray-400 hover:text-red-600 hover:bg-red-50"
                                onClick={() => onDelete(contact.id)}
                            >
                                <Trash2 className="w-4 h-4" />
                            </Button>
                        </div>
                    </div>
                </div>
            </CardContent>
        </Card>
    )
}
