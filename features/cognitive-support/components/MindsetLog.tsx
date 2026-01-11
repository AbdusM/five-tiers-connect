'use client'

import { useState } from 'react'
import { BrainCircuit, BookOpen, CheckCircle, ArrowRight } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Textarea } from '@/components/ui/textarea'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'

export function MindsetLog() {
    const [step, setStep] = useState(0) // 0: Start, 1: Trigger, 2: Thought, 3: Reframe, 4: Done

    // Form State
    const [trigger, setTrigger] = useState('')
    const [thought, setThought] = useState('')
    const [reframe, setReframe] = useState('')

    const handleNext = () => setStep(prev => prev + 1)

    const handleSubmit = () => {
        // In real app, save to Thinking for a Change log in DB
        console.log('CBT Log:', { trigger, thought, reframe })
        setStep(4)
        setTimeout(() => {
            // Reset after delay
            setStep(0)
            setTrigger('')
            setThought('')
            setReframe('')
        }, 3000)
    }

    if (step === 4) {
        return (
            <Card className="bg-green-50 border-green-200">
                <CardContent className="h-64 flex flex-col items-center justify-center text-center p-6 space-y-4">
                    <div className="h-16 w-16 bg-green-100 rounded-full flex items-center justify-center">
                        <CheckCircle className="h-8 w-8 text-green-600" />
                    </div>
                    <h3 className="text-xl font-bold text-green-800">Mindset Shifted!</h3>
                    <p className="text-green-700">You successfully reframed a negative thought. This builds new neural pathways.</p>
                </CardContent>
            </Card>
        )
    }

    return (
        <Card className="h-full border-none shadow-lg bg-white/80 backdrop-blur-sm relative overflow-hidden group hover:shadow-xl transition-all duration-300">
            {/* Decorative Gradient Blob */}
            <div className="absolute top-0 right-0 -mt-16 -mr-16 w-32 h-32 bg-indigo-100 rounded-full blur-3xl opacity-50 group-hover:opacity-100 transition-opacity" />

            <CardHeader className="relative pb-2">
                <div className="flex items-start justify-between">
                    <div>
                        <CardTitle className="flex items-center gap-2.5 text-xl font-bold tracking-tight text-gray-900">
                            <div className="p-2 bg-indigo-50 rounded-lg">
                                <BrainCircuit className="h-5 w-5 text-indigo-600" />
                            </div>
                            Mindset Check-in
                        </CardTitle>
                        <CardDescription className="pl-[2.85rem] pt-1 text-base">Practice "Thinking for a Change"</CardDescription>
                    </div>
                </div>
            </CardHeader>

            <CardContent className="space-y-4">
                {step === 0 && (
                    <div className="text-center py-4 space-y-4 px-4">
                        <p className="text-gray-600 text-base leading-relaxed max-w-sm mx-auto italic">
                            "Catching a negative thought before it becomes an action is the key to freedom."
                        </p>
                        <Button
                            onClick={handleNext}
                            className="w-full max-w-xs h-10 text-sm font-medium shadow-md hover:shadow-lg hover:-translate-y-0.5 transition-all"
                        >
                            Start New Entry <ArrowRight className="w-4 h-4 ml-2" />
                        </Button>
                    </div>
                )}

                {step === 1 && (
                    <div className="space-y-4 animate-in slide-in-from-right">
                        <div className="space-y-2">
                            <Label>What happened? (The Trigger)</Label>
                            <Input
                                placeholder="e.g., My boss yelled at me."
                                value={trigger}
                                onChange={(e) => setTrigger(e.target.value)}
                                autoFocus
                            />
                        </div>
                        <Button onClick={handleNext} disabled={!trigger} className="w-full">Next</Button>
                    </div>
                )}

                {step === 2 && (
                    <div className="space-y-4 animate-in slide-in-from-right">
                        <div className="space-y-2">
                            <Label>What did you think? (The Distortion)</Label>
                            <Textarea
                                placeholder="e.g., He hates me. I'm going to get fired. I should quit now."
                                value={thought}
                                onChange={(e) => setThought(e.target.value)}
                                autoFocus
                                className="min-h-[100px]"
                            />
                        </div>
                        <Button onClick={handleNext} disabled={!thought} className="w-full">Next</Button>
                    </div>
                )}

                {step === 3 && (
                    <div className="space-y-4 animate-in slide-in-from-right">
                        <div className="space-y-2">
                            <Label className="text-indigo-700 font-semibold">Now, Re-frame it. (The Truth)</Label>
                            <Textarea
                                placeholder="e.g., He is stressed about the deadline. It's not personal. I can ask for feedback later."
                                value={reframe}
                                onChange={(e) => setReframe(e.target.value)}
                                autoFocus
                                className="min-h-[100px] border-indigo-200 bg-indigo-50/50 focus-visible:ring-indigo-500"
                            />
                        </div>
                        <Button onClick={handleSubmit} disabled={!reframe} className="w-full bg-indigo-600 hover:bg-indigo-700">Save Reframe</Button>
                    </div>
                )}

                {step > 0 && (
                    <div className="flex justify-center gap-1 mt-4">
                        {[1, 2, 3].map(i => (
                            <div key={i} className={`h-1.5 w-1.5 rounded-full transition-colors ${step >= i ? 'bg-indigo-600' : 'bg-gray-200'}`} />
                        ))}
                    </div>
                )}
            </CardContent>
        </Card>
    )
}
