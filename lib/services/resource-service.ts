export type ResourceCategory = 'crisis' | 'housing' | 'education' | 'legal'

export type Resource = {
    id: string
    name: string
    description: string
    phone?: string
    link?: string
    address?: string
    actionLabel: string
    isEmergency?: boolean
    icon?: any // Lucide icon
}

export const RESOURCES_DATA: Record<ResourceCategory, Resource[]> = {
    crisis: [
        {
            id: 'c1',
            name: 'Philadelphia Crisis Line',
            description: '24/7 mental health mobile crisis units available.',
            phone: '215-686-4420',
            actionLabel: 'Call Now',
            isEmergency: true
        },
        {
            id: 'c2',
            name: 'Suicide & Crisis Lifeline',
            description: 'Confidential support for distress. Text or call.',
            phone: '988',
            actionLabel: 'Call 988',
            isEmergency: true
        },
        {
            id: 'c3',
            name: 'Prevention Point',
            description: 'Harm reduction, medical care, and shelter referrals.',
            address: '2913 Kensington Ave',
            phone: '215-634-5272',
            link: 'https://ppponline.org',
            actionLabel: 'Visit Site'
        },
        {
            id: 'c4',
            name: 'Valley Youth House',
            description: 'Emergency shelter and housing for youth 18-24.',
            address: '1500 Sansom St',
            phone: '215-925-3180',
            link: 'https://www.valleyyouthhouse.org',
            actionLabel: 'Get Help'
        }
    ],
    housing: [
        {
            id: 'h1',
            name: 'Office of Homeless Services',
            description: 'Central intake for emergency shelter.',
            address: 'Appletree Family Center',
            phone: '215-686-7177',
            actionLabel: 'Call Intake'
        },
        {
            id: 'h2',
            name: 'Project HOME',
            description: 'Supportive housing and employment services.',
            address: '1515 Fairmount Ave',
            phone: '215-232-7272',
            link: 'https://projecthome.org',
            actionLabel: 'Learn More'
        },
        {
            id: 'h3',
            name: 'Utility Assistance (LIHEAP)',
            description: 'Grants to help pay heating bills.',
            link: 'https://www.heap.pa.gov',
            actionLabel: 'Apply Online'
        },
        {
            id: 'h4',
            name: 'Turner House',
            description: 'Transitional housing for men.',
            phone: '215-555-0123',
            actionLabel: 'Check Availability'
        }
    ],
    education: [
        {
            id: 'e1',
            name: 'PowerCorpsPHL',
            description: 'Paid career training in green infrastructure for ages 18-30.',
            link: 'https://powercorpsphl.org',
            actionLabel: 'Apply Now'
        },
        {
            id: 'e2',
            name: 'Community College of Philadelphia',
            description: 'Reentry Support Project - Scholarships and record clearing.',
            address: '1700 Spring Garden St',
            link: 'https://ccp.edu',
            actionLabel: 'Reentry Info'
        },
        {
            id: 'e3',
            name: 'Philadelphia OIC',
            description: 'Free job training: Hospitality, Smart Energy, Banking.',
            address: '1231 N Broad St',
            link: 'https://www.phila-oic.org',
            actionLabel: 'View Courses'
        },
        {
            id: 'e4',
            name: 'Year Up Philadelphia',
            description: 'Tuition-free job training in Tech and Business.',
            link: 'https://www.yearup.org',
            actionLabel: 'Apply'
        }
    ],
    legal: [
        {
            id: 'l1',
            name: 'Community Legal Services',
            description: 'Free legal help for records, housing, and employment.',
            address: '1424 Chestnut St',
            phone: '215-981-3700',
            actionLabel: 'Get Legal Help'
        },
        {
            id: 'l2',
            name: 'Philadelphia Bail Fund',
            description: 'Assistance posting bail for those who cannot afford it.',
            link: 'https://www.phillybailfund.org',
            actionLabel: 'Request Help'
        },
        {
            id: 'l3',
            name: 'The Pardon Project',
            description: 'Free pardon coaches to help clear your record completely.',
            link: 'https://www.pardonmepa.org',
            actionLabel: 'Find Coach'
        },
        {
            id: 'l4',
            name: 'Defender Association',
            description: 'Public defense and participatory defense hubs.',
            phone: '215-568-3190',
            actionLabel: 'Contact'
        }
    ]
}

export const ResourceService = {
    getResources: (category: ResourceCategory) => {
        return RESOURCES_DATA[category] || []
    },

    trackAccess: (resource: Resource, category: string) => {
        const eventData = {
            resource_id: resource.id,
            resource_name: resource.name,
            category,
            timestamp: new Date().toISOString()
        }

        try {
            const storedEvents = JSON.parse(localStorage.getItem('analytics_events') || '[]')
            storedEvents.push(eventData)
            localStorage.setItem('analytics_events', JSON.stringify(storedEvents))
            console.log('[ResourceService] Access Tracked:', eventData)
        } catch (e) {
            console.error('Failed to track analytics event', e)
        }
    }
}
