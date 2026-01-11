'use client'

import { useState, useEffect } from 'react'
import { Shield, HeartHandshake } from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'
import { Contact, ContactService } from '@/lib/services/contact-service'
import { ContactCard } from '@/features/contacts/components/ContactCard'
import { AddContactDialog } from '@/features/contacts/components/AddContactDialog'

export default function ContactsPage() {
  const [contacts, setContacts] = useState<Contact[]>([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const load = async () => {
      const data = await ContactService.getContacts()
      setContacts(data)
      setIsLoading(false)
    }
    load()
  }, [])

  const handleAdd = async (newContact: Omit<Contact, 'id'>) => {
    // Optimistically add to list with temp ID
    const tempId = Math.random().toString(36).substr(2, 9)
    setContacts(prev => [...prev, { ...newContact, id: tempId }])
  }

  const handleDelete = async (id: string) => {
    await ContactService.deleteContact(id)
    setContacts(prev => prev.filter(c => c.id !== id))
  }

  const handleCall = (id: string) => {
    console.log(`Calling contact ${id}...`)
    // Invoke native dialer or VoIP service
  }

  if (isLoading) return <div className="p-8 text-center text-muted-foreground">Loading Support Circle...</div>

  const primaryContacts = contacts.filter(c => c.is_primary)
  const networkContacts = contacts.filter(c => !c.is_primary)

  return (
    <div className="space-y-8 pb-12">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-4xl font-bold text-gray-900 flex items-center gap-3">
            <Shield className="w-10 h-10 text-indigo-600" />
            My Team
          </h1>
          <p className="text-lg text-gray-600 mt-2">
            Your personal board of directors.
          </p>
        </div>
        <AddContactDialog onAdd={handleAdd} />
      </div>

      {contacts.length === 0 ? (
        <Card className="border-dashed border-2 border-gray-200">
          <CardContent className="py-16 text-center text-gray-500">
            <div className="bg-indigo-50 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6">
              <HeartHandshake className="w-10 h-10 text-indigo-500" />
            </div>
            <h3 className="text-xl font-semibold text-gray-900">Build Your Circle</h3>
            <p className="mt-2 mb-6 max-w-sm mx-auto">
              Add mentors, family members, or parole officers who support your success.
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-8">
          {/* Lifelines Section */}
          {primaryContacts.length > 0 && (
            <div className="bg-yellow-50/50 border border-yellow-100 rounded-2xl p-6">
              <h2 className="text-xl font-bold text-yellow-800 mb-4 flex items-center gap-2">
                <span className="bg-yellow-100 p-1.5 rounded-lg">⭐</span>
                My Top 5 Lifelines
              </h2>
              <div className="grid md:grid-cols-2 gap-6">
                {primaryContacts.map((contact) => (
                  <ContactCard
                    key={contact.id}
                    contact={contact}
                    onDelete={handleDelete}
                    onCall={handleCall}
                  />
                ))}
              </div>
            </div>
          )}

          {/* Extended Network Section */}
          {networkContacts.length > 0 && (
            <div>
              <h2 className="text-xl font-bold text-gray-800 mb-4 pl-1">Extended Network</h2>
              <div className="grid md:grid-cols-2 gap-6">
                {networkContacts.map((contact) => (
                  <ContactCard
                    key={contact.id}
                    contact={contact}
                    onDelete={handleDelete}
                    onCall={handleCall}
                  />
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  )
}
