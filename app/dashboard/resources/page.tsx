'use client'

import { useState } from 'react'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Button } from '@/components/ui/button'
import { Heart, Home, GraduationCap, Scale, AlertTriangle } from 'lucide-react'
import { ResourceService, ResourceCategory } from '@/lib/services/resource-service'
import { ResourceCard } from '@/features/resources/components/ResourceCard'
import { TriageDialog } from '@/features/resources/components/TriageDialog'

export default function ResourcesPage() {
    const [activeTab, setActiveTab] = useState<ResourceCategory>('housing')

    const handleTriageComplete = (category: ResourceCategory) => {
        setActiveTab(category)
    }

    return (
        <div className="space-y-6 pb-8">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
                <div>
                    <h1 className="text-3xl md:text-4xl font-bold text-zinc-50 mb-2">Community Resources</h1>
                    <p className="text-base md:text-lg text-zinc-300 max-w-2xl">
                        Connect with trusted organizations for housing, legal aid, mental health, and career support.
                    </p>
                </div>
                <TriageDialog onTriageComplete={handleTriageComplete} />
            </div>

            {/* Tabs Interface */}
            <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as ResourceCategory)} className="w-full">
                <TabsList className="grid w-full grid-cols-2 md:grid-cols-4 h-auto md:h-12 mb-8 gap-2 bg-zinc-900/70 border border-white/10">
                    <TabsTrigger value="housing" className="py-3 md:py-2 text-sm md:text-base data-[state=active]:border data-[state=active]:border-emerald-300/50 data-[state=active]:bg-emerald-500/15 data-[state=active]:text-emerald-100 text-zinc-200">
                        <Home className="w-4 h-4 mr-2" />
                        Housing & Food
                    </TabsTrigger>
                    <TabsTrigger value="education" className="py-3 md:py-2 text-sm md:text-base data-[state=active]:border data-[state=active]:border-emerald-300/50 data-[state=active]:bg-emerald-500/15 data-[state=active]:text-emerald-100 text-zinc-200">
                        <GraduationCap className="w-4 h-4 mr-2" />
                        Jobs & Education
                    </TabsTrigger>
                    <TabsTrigger value="legal" className="py-3 md:py-2 text-sm md:text-base data-[state=active]:border data-[state=active]:border-emerald-300/50 data-[state=active]:bg-emerald-500/15 data-[state=active]:text-emerald-100 text-zinc-200">
                        <Scale className="w-4 h-4 mr-2" />
                        Legal & Rights
                    </TabsTrigger>
                    <TabsTrigger value="crisis" className="py-3 md:py-2 text-sm md:text-base data-[state=active]:border data-[state=active]:border-emerald-300/50 data-[state=active]:bg-emerald-500/15 data-[state=active]:text-emerald-100 text-zinc-200">
                        <Heart className="w-4 h-4 mr-2" />
                        Crisis & Health
                    </TabsTrigger>
                </TabsList>

                {/* Tab Content: Crisis */}
                <TabsContent value="crisis" className="space-y-6">
                    <div className="bg-zinc-900/85 border border-red-400/40 rounded-lg p-6 flex flex-col md:flex-row items-start gap-4 text-zinc-100">
                        <AlertTriangle className="w-6 h-6 text-red-300 flex-shrink-0 mt-1" />
                        <div className="flex-1">
                            <h3 className="text-lg font-bold text-zinc-50">In Immediate Danger?</h3>
                            <p className="text-sm text-zinc-200 mb-4">
                                If you or someone else is in immediate danger, please call 911 or go to the nearest emergency room.
                            </p>
                            <Button variant="destructive" asChild className="w-full md:w-auto bg-red-500 hover:bg-red-400 text-white border border-red-300/50">
                                <a href="tel:911">Call 911 Immediately</a>
                            </Button>
                        </div>
                    </div>

                    <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
                        {ResourceService.getResources('crisis').map((resource) => (
                            <ResourceCard key={resource.id} resource={resource} category="crisis" />
                        ))}
                    </div>
                </TabsContent>

                {/* Tab Content: Housing */}
                <TabsContent value="housing" className="space-y-6">
                    <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
                        {ResourceService.getResources('housing').map((resource) => (
                            <ResourceCard key={resource.id} resource={resource} category="housing" />
                        ))}
                    </div>
                </TabsContent>

                {/* Tab Content: Education */}
                <TabsContent value="education" className="space-y-6">
                    <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
                        {ResourceService.getResources('education').map((resource) => (
                            <ResourceCard key={resource.id} resource={resource} category="education" />
                        ))}
                    </div>
                </TabsContent>

                {/* Tab Content: Legal */}
                <TabsContent value="legal" className="space-y-6">
                    <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
                        {ResourceService.getResources('legal').map((resource) => (
                            <ResourceCard key={resource.id} resource={resource} category="legal" />
                        ))}
                    </div>
                </TabsContent>

            </Tabs>
        </div>
    )
}

