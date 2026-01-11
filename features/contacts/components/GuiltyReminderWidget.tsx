'use client'

import { useEffect, useState } from 'react'
import { Contact, ContactService } from '@/lib/services/contact-service'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Phone, ArrowRight, Clock, Users } from 'lucide-react'
import Link from 'next/link'
import { differenceInDays, parseISO } from 'date-fns'

export function GuiltyReminderWidget() {
    const [overdueContacts, setOverdueContacts] = useState<any[]>([])
    const [isLoading, setIsLoading] = useState(true)

    const getFrequencyDays = (freq?: string) => {
        switch (freq) {
            case 'weekly': return 7
            case 'monthly': return 30
            case 'quarterly': return 90
            case 'yearly': return 365
            default: return 30
        }
    }

    useEffect(() => {
        const load = async () => {
            const contacts = await ContactService.getContacts()
            const overdue = contacts.map(c => {
                const lastContactDate = c.last_contact ? parseISO(c.last_contact) : new Date(0)
                const daysSince = differenceInDays(new Date(), lastContactDate)
                const freqDays = getFrequencyDays(c.frequency)
                const isOverdue = daysSince > freqDays
                const daysOverdue = daysSince - freqDays
                return { ...c, isOverdue, daysOverdue }
            })
                .filter(c => c.isOverdue)
                .sort((a, b) => b.daysOverdue - a.daysOverdue) // Most overdue first

            setOverdueContacts(overdue)
            setIsLoading(false)
        }
        load()
    }, [])

    if (isLoading) return null // Prevent layout shift or show skeleton

    if (overdueContacts.length === 0) {
        return null // Don't show if nothing to do, keep dashboard clean
    }

    return (
        <Card className="mb-8 border border-white/10 bg-zinc-900/90 text-zinc-100 shadow-lg">
            <CardHeader className="pb-3 border-b border-white/10 flex flex-row items-center justify-between">
                <div className="flex items-center gap-2.5">
                    <div className="p-2 bg-emerald-500/15 rounded-lg border border-emerald-300/30">
                        <Clock className="w-5 h-5 text-emerald-300" />
                    </div>
                    <div>
                        <CardTitle className="text-base font-semibold text-zinc-50">Relationship Maintenance</CardTitle>
                        <p className="text-sm text-zinc-300 font-normal">
                            {overdueContacts.length} contact{overdueContacts.length === 1 ? '' : 's'} due for a catch-up
                        </p>
                    </div>
                </div>
                <Link href="/dashboard/contacts">
                    <Button variant="ghost" size="sm" className="text-zinc-200 hover:text-white hover:bg-white/5">
                        View All <ArrowRight className="w-4 h-4 ml-1" />
                    </Button>
                </Link>
            </CardHeader>
            <CardContent className="p-0">
                <div className="divide-y divide-white/5">
                    {overdueContacts.slice(0, 3).map((contact) => (
                        <div key={contact.id} className="p-4 flex items-center justify-between hover:bg-white/5 transition-colors group">
                            <div className="flex items-center gap-4">
                                <div className="w-10 h-10 rounded-full bg-zinc-800 border border-white/10 flex items-center justify-center text-zinc-200 font-semibold text-sm">
                                    {contact.name.charAt(0)}
                                </div>
                                <div>
                                    <h4 className="font-semibold text-sm text-zinc-50 group-hover:text-emerald-200 transition-colors">
                                        {contact.name}
                                    </h4>
                                    <div className="flex items-center gap-2 mt-0.5">
                                        <span className="text-xs text-amber-200 font-semibold bg-amber-500/20 px-1.5 py-0.5 rounded border border-amber-300/40">
                                            {contact.daysOverdue} days since last chat
                                        </span>
                                        {contact.origin && (
                                            <span className="text-xs text-zinc-400 truncate max-w-[150px]">
                                                • {contact.origin}
                                            </span>
                                        )}
                                    </div>
                                </div>
                            </div>
                            <Link href="/dashboard/contacts">
                                <Button size="sm" variant="outline" className="h-9 border-white/15 text-zinc-100 hover:border-emerald-300/60 hover:bg-emerald-500/15">
                                    <Phone className="w-3.5 h-3.5 mr-2" />
                                    Connect
                                </Button>
                            </Link>
                        </div>
                    ))}
                </div>
            </CardContent>
        </Card>
    )
}
