export type Mentee = {
    id: string
    name: string
    avatar?: string
    lastContact: string // ISO Date
    status: 'Stable' | 'At Risk' | 'Crisis' | 'On Track'
    checkInsMissed: number
    resourcesUsed: number
    nextCourtDate?: string
    location?: string
    score?: number // Computed field
}

const INITIAL_CASELOAD: Mentee[] = [
    {
        id: '1',
        name: 'Damon S.',
        lastContact: new Date(Date.now() - 1000 * 60 * 60 * 24 * 2).toISOString(), // 2 days ago
        status: 'On Track',
        checkInsMissed: 0,
        resourcesUsed: 5,
        location: 'North Philly'
    },
    {
        id: '2',
        name: 'Marcus J.',
        lastContact: new Date(Date.now() - 1000 * 60 * 60 * 24 * 14).toISOString(), // 14 days ago
        status: 'At Risk',
        checkInsMissed: 2,
        resourcesUsed: 1,
        location: 'West Philly',
        nextCourtDate: '2024-03-15'
    },
    {
        id: '3',
        name: 'Sarah L.',
        lastContact: new Date(Date.now() - 1000 * 60 * 60 * 24 * 1).toISOString(), // 1 day ago
        status: 'Stable',
        checkInsMissed: 0,
        resourcesUsed: 8,
        location: 'Center City'
    },
    {
        id: '4',
        name: 'Tyrell P.',
        lastContact: new Date(Date.now() - 1000 * 60 * 60 * 24 * 5).toISOString(), // 5 days ago
        status: 'Crisis',
        checkInsMissed: 1,
        resourcesUsed: 12,
        location: 'South Philly'
    }
]

export const CaseloadService = {
    // Determine Strength Score (0-100) - Positive Reinforcement Model
    calculateStrengthScore: (mentee: Mentee): number => {
        let score = 20 // Base score for being enrolled

        // Engagement Points (Positive actions build score)
        score += (mentee.resourcesUsed * 5) // Using resources = taking action

        // Recent Contact Bonus
        const daysSinceContact = Math.floor((Date.now() - new Date(mentee.lastContact).getTime()) / (1000 * 60 * 60 * 24))
        if (daysSinceContact < 3) score += 15
        else if (daysSinceContact < 7) score += 10
        else if (daysSinceContact < 14) score += 5

        // Consistency Bonus (Inverse of missed check-ins)
        if (mentee.checkInsMissed === 0) score += 20 // Perfect streak
        else if (mentee.checkInsMissed < 3) score += 10

        // Status Bonus
        if (mentee.status === 'On Track') score += 15
        if (mentee.status === 'Stable') score += 10

        // Cap at 100
        return Math.min(100, Math.max(0, score))
    },

    getScoreColor: (score: number) => {
        if (score >= 80) return 'text-purple-600 border-purple-600' // High Strength (Thriving)
        if (score >= 50) return 'text-blue-500 border-blue-500' // Building Strength
        return 'text-gray-400 border-gray-300' // Just Starting / Low Engagement
    },

    // Mock Fetch
    getCaseload: async (): Promise<Mentee[]> => {
        // In real app: await db.query...
        return INITIAL_CASELOAD.map(m => ({
            ...m,
            score: CaseloadService.calculateStrengthScore(m)
        })).sort((a, b) => (b.score || 0) - (a.score || 0)) // Sort by highest strength first
    },

    // Mock Log Interaction
    logInteraction: async (menteeId: string, type: string, note: string) => {
        console.log(`[CaseloadService] Interaction Logged: ${menteeId} - ${type} - ${note}`)
        // In real app: Insert into 'interactions' table
        return { success: true, timestamp: new Date().toISOString() }
    }
}
