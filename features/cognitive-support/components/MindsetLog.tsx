'use client'

import { useState } from 'react'
import { BrainCircuit, BookOpen, CheckCircle, ArrowRight } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'

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
            <div className="glass-panel border-emerald-500/30 bg-emerald-500/5 h-full flex flex-col items-center justify-center text-center p-6 space-y-4 rounded-xl">
                <div className="h-16 w-16 bg-emerald-500/20 rounded-full flex items-center justify-center border border-emerald-500/30">
                    <CheckCircle className="h-8 w-8 text-emerald-400" />
                </div>
                <h3 className="text-xl font-medium text-emerald-400">Mindset Shifted</h3>
                <p className="text-zinc-400 text-sm">Neural pathway reinforced. System engaged.</p>
            </div>
        )
    }

    return (
        <div className="glass-panel h-full rounded-xl relative overflow-hidden group hover:border-white/10 transition-all duration-300 flex flex-col">
            {/* Header */}
            <div className="p-6 pb-2 border-b border-white/5 bg-zinc-950/30">
                <div className="flex items-start gap-4">
                    <div className="p-2 bg-zinc-900 border border-white/10 rounded-lg">
                        <BrainCircuit className="h-5 w-5 text-emerald-400" />
                    </div>
                    <div>
                        <h3 className="text-lg font-medium text-white tracking-tight">
                            Cognitive Log
                        </h3>
                        <p className="text-xs text-zinc-500 font-mono uppercase tracking-wider">Status: Monitoring</p>
                    </div>
                </div>
            </div>

            <div className="p-6 flex-1 flex flex-col justify-center">
                {step === 0 && (
                    <div className="text-center space-y-6">
                        <p className="text-zinc-400 text-sm leading-relaxed italic border-l-2 border-emerald-500/30 pl-4 text-left">
                            "Catching a negative thought before it becomes an action is the key to freedom."
                        </p>
                        <Button
                            onClick={handleNext}
                            className="w-full bg-emerald-600 hover:bg-emerald-500 text-white border-0 shadow-[0_0_20px_rgba(16,185,129,0.2)]"
                        >
                            Initiate Check-in <ArrowRight className="w-4 h-4 ml-2" />
                        </Button>
                    </div>
                )}

                {step === 1 && (
                    <div className="space-y-4 animate-fade-up">
                        <div className="space-y-2">
                            <Label className="text-zinc-300">New Stimulus (Trigger)</Label>
                            <Input
                                placeholder="What happened?"
                                value={trigger}
                                onChange={(e) => setTrigger(e.target.value)}
                                autoFocus
                                className="bg-zinc-950/50 border-white/10 text-white placeholder:text-zinc-700"
                            />
                        </div>
                        <Button onClick={handleNext} disabled={!trigger} variant="secondary" className="w-full">Next Phase</Button>
                    </div>
                )}

                {step === 2 && (
                    <div className="space-y-4 animate-fade-up">
                        <div className="space-y-2">
                            <Label className="text-zinc-300">Initial Response (Distortion)</Label>
                            <Textarea
                                placeholder="What was your immediate thought?"
                                value={thought}
                                onChange={(e) => setThought(e.target.value)}
                                autoFocus
                                className="min-h-[100px] bg-zinc-950/50 border-white/10 text-white placeholder:text-zinc-700"
                            />
                        </div>
                        <Button onClick={handleNext} disabled={!thought} variant="secondary" className="w-full">Next Phase</Button>
                    </div>
                )}

                {step === 3 && (
                    <div className="space-y-4 animate-fade-up">
                        <div className="space-y-2">
                            <Label className="text-emerald-400 font-medium">Re-Calibration (The Truth)</Label>
                            <Textarea
                                placeholder="Reframe this thought..."
                                value={reframe}
                                onChange={(e) => setReframe(e.target.value)}
                                autoFocus
                                className="min-h-[100px] bg-emerald-900/10 border-emerald-500/30 text-emerald-100 placeholder:text-emerald-700/50 focus-visible:ring-emerald-500/50"
                            />
                        </div>
                        <Button onClick={handleSubmit} disabled={!reframe} className="w-full bg-emerald-600 hover:bg-emerald-500 text-white">Save Logic</Button>
                    </div>
                )}

                {step > 0 && (
                    <div className="flex justify-center gap-2 mt-6">
                        {[1, 2, 3].map(i => (
                            <div key={i} className={`h-1 w-8 rounded-full transition-colors ${step >= i ? 'bg-emerald-500' : 'bg-zinc-800'}`} />
                        ))}
                    </div>
                )}
            </div>
        </div>
    )
}
