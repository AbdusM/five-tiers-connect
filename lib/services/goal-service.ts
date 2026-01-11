
export type GoalCategory = 'legal' | 'employment' | 'education' | 'health' | 'housing' | 'financial'

export type GoalStatus = 'todo' | 'in-progress' | 'done'

export interface Goal {
    id: string
    title: string
    description?: string
    status: GoalStatus
    category: GoalCategory
    points: number
    dueDate?: string
}

// Initial Mock Data - "The Real World Reentry Checklist"
const MOCK_GOALS: Goal[] = [
    // Legal & ID (Core Foundation)
    {
        id: 'g1',
        title: 'Obtain State ID / License',
        description: 'Visit PennDOT with SSN, Birth Certificate, and Proof of Residency.',
        status: 'done',
        category: 'legal',
        points: 20
    },
    {
        id: 'g2',
        title: 'Clear Bench Warrants',
        description: 'Check status with Philadelphia Bail Fund or Public Defender.',
        status: 'in-progress',
        category: 'legal',
        points: 25
    },
    // Employment (Stability)
    {
        id: 'g3',
        title: 'Create Resume',
        description: 'Update with recent skills; focus on "fair chance" wording.',
        status: 'done',
        category: 'employment',
        points: 15
    },
    {
        id: 'g4',
        title: 'Apply to PowerCorpsPHL',
        description: 'Submit application for next cohort (Green Stormwater Infrastructure).',
        status: 'todo',
        category: 'employment',
        points: 20
    },
    {
        id: 'g5',
        title: 'Obtain Food Handlers Cert',
        description: 'Complete online ServSafe course for kitchen jobs.',
        status: 'todo',
        category: 'education',
        points: 10
    },
    // Housing (Security)
    {
        id: 'g6',
        title: 'Apply for PHA Housing',
        description: 'Submit application for public housing waiting list.',
        status: 'in-progress',
        category: 'housing',
        points: 15
    },
    {
        id: 'g7',
        title: 'Utility Assistance (LIHEAP)',
        description: 'Apply for heating assistance if eligible.',
        status: 'todo',
        category: 'housing',
        points: 10
    },
    // Financial & Health (Wellness)
    {
        id: 'g8',
        title: 'Apply for SNAP/Food Stamps',
        description: 'Complete COMPASS application.',
        status: 'done',
        category: 'financial',
        points: 10
    },
    {
        id: 'g9',
        title: 'Schedule Primary Care Visit',
        description: 'Establish care at City Health Center #4.',
        status: 'todo',
        category: 'health',
        points: 20
    },
    {
        id: 'g10',
        title: 'Open Credit Union Account',
        description: 'Try PFFCU or PFCU (lower fees than big banks).',
        status: 'todo',
        category: 'financial',
        points: 15
    }
]

export const GoalService = {
    getGoals: async (): Promise<Goal[]> => {
        // Simulate network delay
        await new Promise(resolve => setTimeout(resolve, 500))

        if (typeof window !== 'undefined') {
            const stored = localStorage.getItem('goals_data')
            if (stored) {
                return JSON.parse(stored)
            }
            // First time: Save mocks to local storage
            localStorage.setItem('goals_data', JSON.stringify(MOCK_GOALS))
        }

        return [...MOCK_GOALS]
    },

    updateStatus: async (goalId: string, newStatus: GoalStatus): Promise<Goal> => {
        // Read from source of truth (Local Storage or Mock)
        let currentGoals = [...MOCK_GOALS]
        if (typeof window !== 'undefined') {
            const stored = localStorage.getItem('goals_data')
            if (stored) currentGoals = JSON.parse(stored)
        }

        const goalIndex = currentGoals.findIndex(g => g.id === goalId)
        if (goalIndex === -1) throw new Error('Goal not found')

        // Update
        currentGoals[goalIndex].status = newStatus

        // Persist
        if (typeof window !== 'undefined') {
            localStorage.setItem('goals_data', JSON.stringify(currentGoals))
        }

        return currentGoals[goalIndex]
    },

    calculateTotalPoints: (goals: Goal[]): number => {
        return goals
            .filter(g => g.status === 'done')
            .reduce((sum, g) => sum + g.points, 0)
    }
}
