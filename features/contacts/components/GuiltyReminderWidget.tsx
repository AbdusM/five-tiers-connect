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
        <Card className="mb-8 border-none bg-white shadow-sm ring-1 ring-gray-200/50">
            <CardHeader className="pb-3 border-b border-gray-100 flex flex-row items-center justify-between">
                <div className="flex items-center gap-2.5">
                    <div className="p-2 bg-amber-50 rounded-lg">
                        <Clock className="w-5 h-5 text-amber-600" />
                    </div>
                    <div>
                        <CardTitle className="text-base font-semibold text-gray-900">Relationship Maintenance</CardTitle>
                        <p className="text-sm text-gray-500 font-normal">
                            {overdueContacts.length} contacts due for a catch-up
                        </p>
                    </div>
                </div>
                <Link href="/dashboard/contacts">
                    <Button variant="ghost" size="sm" className="text-gray-500 hover:text-indigo-600">
                        View All <ArrowRight className="w-4 h-4 ml-1" />
                    </Button>
                </Link>
            </CardHeader>
            <CardContent className="p-0">
                <div className="divide-y divide-gray-50">
                    {overdueContacts.slice(0, 3).map((contact) => (
                        <div key={contact.id} className="p-4 flex items-center justify-between hover:bg-gray-50/50 transition-colors group">
                            <div className="flex items-center gap-4">
                                <div className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center text-gray-500 font-semibold text-sm">
                                    {contact.name.charAt(0)}
                                </div>
                                <div>
                                    <h4 className="font-semibold text-sm text-gray-900 group-hover:text-indigo-700 transition-colors">
                                        {contact.name}
                                    </h4>
                                    <div className="flex items-center gap-2 mt-0.5">
                                        <span className="text-xs text-amber-600 font-medium bg-amber-50 px-1.5 py-0.5 rounded">
                                            {contact.daysOverdue} days since last chat
                                        </span>
                                        {contact.origin && (
                                            <span className="text-xs text-gray-400 truncate max-w-[150px]">
                                                • {contact.origin}
                                            </span>
                                        )}
                                    </div>
                                </div>
                            </div>
                            <Link href="/dashboard/contacts">
                                <Button size="sm" variant="outline" className="h-9 border-gray-200 text-gray-700 hover:border-indigo-200 hover:bg-indigo-50 hover:text-indigo-700">
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
