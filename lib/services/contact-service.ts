export type Contact = {
    id: string
    name: string
    role: 'Mentor' | 'Parole Officer' | 'Family' | 'Peer Support' | 'Therapist' | 'Employer'
    phone: string
    email?: string
    is_primary: boolean
    last_contact?: string
    goal_tag?: 'legal' | 'employment' | 'education' | 'health' | 'housing' | 'financial' | 'general'
    frequency: 'weekly' | 'monthly' | 'quarterly' | 'yearly' | 'on-demand'
    tags: string[]
    origin?: string
    notes?: string
    verified?: boolean
}

const MOCK_CONTACTS: Contact[] = [
    {
        id: '1',
        name: 'Sarah Jenkins',
        role: 'Mentor',
        phone: '(555) 123-4567',
        email: 'sarah.j@mentors.org',
        is_primary: true,
        last_contact: '2025-10-15T10:00:00Z',
        frequency: 'weekly',
        tags: ['Tech', 'Career', 'Resume'],
        origin: 'Philly Tech Meetup',
        verified: true
    },
    {
        id: '2',
        name: 'Officer Miller',
        role: 'Parole Officer',
        phone: '(555) 987-6543',
        email: 'm.miller@doc.state.pa.us',
        is_primary: false,
        last_contact: '2025-10-10T14:30:00Z',
        frequency: 'monthly',
        tags: ['Legal', 'Compliance'],
        origin: 'Assigned PO'
    },
    {
        id: '3',
        name: 'Mom',
        role: 'Family',
        phone: '(555) 555-5555',
        is_primary: true,
        last_contact: '2025-09-18T18:00:00Z',
        frequency: 'weekly',
        tags: ['Family', 'Support', 'Groceries'],
        origin: 'Family'
    },
    {
        id: '4',
        name: 'Carlos Estrada',
        role: 'Employer',
        phone: '1-800-763-9999',
        email: 'carlos@startups.com',
        is_primary: false,
        last_contact: '2025-08-01T09:00:00Z',
        frequency: 'monthly',
        tags: ['3 Day Startup', 'TexMex Food Trucks', 'Investing'],
        origin: '3 Day Startup Event'
    }
]

export const ContactService = {
    getContacts: async (): Promise<Contact[]> => {
        if (typeof window !== 'undefined') {
            const stored = localStorage.getItem('contacts_data_prime_v2')
            if (stored) return JSON.parse(stored)
            localStorage.setItem('contacts_data_prime_v2', JSON.stringify(MOCK_CONTACTS))
        }
        return MOCK_CONTACTS
    },

    addContact: async (contact: Omit<Contact, 'id'>): Promise<Contact> => {
        const newContact = {
            ...contact,
            id: Math.random().toString(36).substr(2, 9)
        }

        if (typeof window !== 'undefined') {
            const stored = localStorage.getItem('contacts_data_prime_v2') || JSON.stringify(MOCK_CONTACTS)
            const current = JSON.parse(stored)
            const updated = [...current, newContact]
            localStorage.setItem('contacts_data_prime_v2', JSON.stringify(updated))
        }

        return newContact
    },

    deleteContact: async (id: string): Promise<boolean> => {
        if (typeof window !== 'undefined') {
            const stored = localStorage.getItem('contacts_data_prime_v2') || JSON.stringify(MOCK_CONTACTS)
            const current: Contact[] = JSON.parse(stored)
            const updated = current.filter(c => c.id !== id)
            localStorage.setItem('contacts_data_prime_v2', JSON.stringify(updated))
        }
        return true
    },

    setLifeline: async (id: string): Promise<boolean> => {
        if (typeof window !== 'undefined') {
            const stored = localStorage.getItem('contacts_data_prime_v2') || JSON.stringify(MOCK_CONTACTS)
            const current: Contact[] = JSON.parse(stored)
            const updated = current.map(c => ({
                ...c,
                is_primary: c.id === id
            }))
            localStorage.setItem('contacts_data_prime_v2', JSON.stringify(updated))
        }
        return true
    }
}
