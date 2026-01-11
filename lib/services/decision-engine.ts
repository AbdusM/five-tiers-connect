import { Contact, ContactService } from "./contact-service"
import { Resource, ResourceService } from "./resource-service"

export type Emotion = 'anger' | 'anxiety' | 'urge' | 'conflict' | 'depression'

export type ActionRecommendation = {
    id: string
    type: 'contact' | 'resource' | 'activity'
    label: string
    description: string
    actionLabel: string
    targetId?: string // ID of contact or resource
    priority: number
}

// Static "Universal" recommendations
const UNIVERSAL_ACTIONS: Record<Emotion, ActionRecommendation[]> = {
    anger: [
        {
            id: 'act_breathe',
            type: 'activity',
            label: 'Box Breathing',
            description: 'Inhale for 4, hold for 4, exhale for 4. Reset your nervous system.',
            actionLabel: 'Start Breathing',
            priority: 1
        },
        {
            id: 'act_walk',
            type: 'activity',
            label: 'Walk Away',
            description: 'Leave the situation immediately. Go for a 10-minute walk.',
            actionLabel: 'I\'m Walking Away',
            priority: 2
        }
    ],
    anxiety: [
        {
            id: 'act_ground',
            type: 'activity',
            label: '5-4-3-2-1 Grounding',
            description: 'Name 5 things you see, 4 you feel, 3 you hear...',
            actionLabel: 'Start Grounding',
            priority: 1
        }
    ],
    urge: [
        {
            id: 'act_surf',
            type: 'activity',
            label: 'Urge Surfing',
            description: 'Visualize the urge as a wave. It will peak and then crash. wait 15 minutes.',
            actionLabel: 'Start Timer (15m)',
            priority: 1
        }
    ],
    conflict: [
        {
            id: 'act_pause',
            type: 'activity',
            label: 'The "Pause" Button',
            description: 'Say: "I need a moment to think." Step out.',
            actionLabel: 'I Did This',
            priority: 1
        }
    ],
    depression: [
        {
            id: 'act_move',
            type: 'activity',
            label: 'Change Your State',
            description: 'Stand up. Stretch. Put on your favorite song.',
            actionLabel: 'I Did This',
            priority: 2
        }
    ]
}

export const DecisionEngine = {
    /**
     * Algorithm to determine the Next Best Action (NBA)
     * Combines:
     * 1. Clinical best practices (Universal Actions)
     * 2. User's specific "Safety Net" (Contacts)
     * 3. Community Assets (Resources)
     */
    getNextBestAction: async (emotion: Emotion): Promise<ActionRecommendation[]> => {
        const recommendations: ActionRecommendation[] = [...(UNIVERSAL_ACTIONS[emotion] || [])]

        // 1. Fetch Primary Lifeline (Mentor/Family)
        // In a real app, we'd cache this or pass it in to avoid waterfall
        const contacts = await ContactService.getContacts()
        const primaryContact = contacts.find(c => c.is_primary)

        if (primaryContact) {
            recommendations.push({
                id: `cont_${primaryContact.id}`,
                type: 'contact',
                label: `Call ${primaryContact.name}`,
                description: `Your ${primaryContact.role}. They can talk you through this.`,
                actionLabel: 'Call Now',
                targetId: primaryContact.id,
                priority: 0 // Top priority
            })
        }

        // 2. Suggest Safe Places (Resources)
        // If "Depression" or "Anxiety", suggest community connection
        if (emotion === 'depression' || emotion === 'anxiety') {
            const resources = ResourceService.getResources('housing') // Using housing as proxy for 'Safe Places' for now
            const safePlace = resources.find(r => r.name.includes('Project HOME') || r.name.includes('Center'))

            if (safePlace) {
                recommendations.push({
                    id: `res_${safePlace.id}`,
                    type: 'resource',
                    label: `Go to ${safePlace.name}`,
                    description: 'A safe environment with supportive people.',
                    actionLabel: 'Get Directions',
                    targetId: safePlace.id,
                    priority: 3
                })
            }
        }

        // 3. Crisis Check
        if (emotion === 'depression' || emotion === 'urge') {
            const crisisResources = ResourceService.getResources('crisis')
            const lifeline = crisisResources.find(r => r.name.includes('988'))

            if (lifeline) {
                recommendations.push({
                    id: `res_${lifeline.id}`,
                    type: 'resource',
                    label: lifeline.name,
                    description: 'Free, confidential support 24/7.',
                    actionLabel: 'Call 988',
                    targetId: lifeline.id,
                    priority: 0
                })
            }
        }

        return recommendations.sort((a, b) => a.priority - b.priority)
    }
}
