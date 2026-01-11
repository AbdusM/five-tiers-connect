'use client'

import { RoadmapBoard } from '@/features/roadmap/components/RoadmapBoard'
import { Map } from 'lucide-react'

export default function RoadmapPage() {
    return (
        <div className="h-[calc(100vh-6rem)] flex flex-col space-y-6">
            <div>
                <h1 className="text-3xl font-bold text-white flex items-center gap-3">
                    <Map className="w-8 h-8 text-indigo-400" />
                    My Roadmap
                </h1>
                <p className="text-zinc-300 mt-2 max-w-2xl">
                    You are the CEO of your own success. Use this board to track your goals, build your strength score, and create your own path forward.
                </p>
            </div>

            <div className="flex-1 min-h-0">
                <RoadmapBoard />
            </div>
        </div>
    )
}
