'use client'

import { useState, useEffect } from 'react'
import { X, BatteryWarning, HeartHandshake, Footprints, Phone, Zap } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { DecisionEngine, Emotion, ActionRecommendation } from '@/lib/services/decision-engine'

interface PauseOverlayProps {
    isOpen: boolean
    onClose: () => void
}

export function PauseOverlay({ isOpen, onClose }: PauseOverlayProps) {
    const [step, setStep] = useState<'breathe' | 'assess' | 'plan'>('breathe')
    const [secondsLeft, setSecondsLeft] = useState(5) // Quick 5s reset for demo
    const [selectedEmotion, setSelectedEmotion] = useState<Emotion | null>(null)
    const [recommendations, setRecommendations] = useState<ActionRecommendation[]>([])

    // Reset on open
    useEffect(() => {
        if (isOpen) {
            setStep('breathe')
            setSecondsLeft(5)
            setSelectedEmotion(null)
        }
    }, [isOpen])

    // Breathing Timer
    useEffect(() => {
        if (!isOpen || step !== 'breathe') return

        const timer = setInterval(() => {
            setSecondsLeft((prev) => {
                if (prev <= 1) {
                    clearInterval(timer)
                    // Auto-advance after breath
                    // In real app, we might wait for user to click "I'm ready"
                    return 0
                }
                return prev - 1
            })
        }, 1000)

        return () => clearInterval(timer)
    }, [isOpen, step])

    const handleEmotionSelect = async (emotion: Emotion) => {
        setSelectedEmotion(emotion)
        const recs = await DecisionEngine.getNextBestAction(emotion)
        setRecommendations(recs)
        setStep('plan')
    }

    if (!isOpen) return null

    return (
        <div className="fixed inset-0 z-50 bg-background/95 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in duration-200">
            {/* Close Button - Enhanced Visibility */}
            <Button
                variant="ghost"
                size="icon"
                className="absolute top-6 right-6 h-12 w-12 rounded-full bg-neutral-100 dark:bg-neutral-800 hover:bg-neutral-200 dark:hover:bg-neutral-700 shadow-sm z-50 text-neutral-900 dark:text-neutral-100"
                onClick={onClose}
            >
                <X className="w-6 h-6" />
                <span className="sr-only">Close</span>
            </Button>

            <div className="max-w-md w-full space-y-8 text-center pt-10">

                {/* STEP 1: BREATHE */}
                {step === 'breathe' && (
                    <div className="space-y-8 animate-in zoom-in duration-500">
                        <h2 className="text-3xl font-bold tracking-tight">Pause. Just breathe.</h2>

                        <div className="relative flex items-center justify-center h-48 w-48 mx-auto">
                            <div className="absolute inset-0 rounded-full bg-indigo-100 animate-ping opacity-75 duration-[3000ms]" />
                            <div className="relative bg-indigo-600 rounded-full h-32 w-32 flex items-center justify-center text-4xl font-bold text-white shadow-2xl">
                                {secondsLeft}
                            </div>
                        </div>

                        {secondsLeft === 0 ? (
                            <Button size="lg" className="w-full text-lg h-14 animate-in fade-in slide-in-from-bottom-4" onClick={() => setStep('assess')}>
                                I'm Ready
                            </Button>
                        ) : (
                            <p className="text-lg text-muted-foreground">Inhale deeply...</p>
                        )}
                    </div>
                )}

                {/* STEP 2: ASSESS */}
                {step === 'assess' && (
                    <div className="space-y-6 animate-in slide-in-from-right-8 duration-300">
                        <h2 className="text-2xl font-bold">What is happening right now?</h2>

                        <div className="grid grid-cols-2 gap-4">
                            <EmotionButton
                                icon={Zap}
                                label="Anger"
                                color="bg-red-100 text-red-700 hover:bg-red-200 hover:border-red-400"
                                onClick={() => handleEmotionSelect('anger')}
                            />
                            <EmotionButton
                                icon={BatteryWarning}
                                label="Urge / Craving"
                                color="bg-orange-100 text-orange-700 hover:bg-orange-200 hover:border-orange-400"
                                onClick={() => handleEmotionSelect('urge')}
                            />
                            <EmotionButton
                                icon={Footprints}
                                label="Anxiety"
                                color="bg-blue-100 text-blue-700 hover:bg-blue-200 hover:border-blue-400"
                                onClick={() => handleEmotionSelect('anxiety')}
                            />
                            <EmotionButton
                                icon={HeartHandshake}
                                label="Conflict"
                                color="bg-purple-100 text-purple-700 hover:bg-purple-200 hover:border-purple-400"
                                onClick={() => handleEmotionSelect('conflict')}
                            />
                        </div>

                        <Button variant="ghost" className="w-full text-muted-foreground hover:text-foreground" onClick={onClose}>
                            Cancel & Return to Dashboard
                        </Button>
                    </div>
                )}

                {/* STEP 3: PLAN (NBA) */}
                {step === 'plan' && (
                    <div className="space-y-6 animate-in slide-in-from-right-8 duration-300">
                        <div className="text-left">
                            <h2 className="text-2xl font-bold">Your Next Best Action</h2>
                            <p className="text-muted-foreground">Choose the path that keeps you safe.</p>
                        </div>

                        <div className="space-y-4">
                            {recommendations.map((rec) => (
                                <Card key={rec.id} className={`border-l-4 cursor-pointer transition-all hover:scale-[1.02] ${rec.priority === 0 ? 'border-l-green-500 shadow-md ring-1 ring-green-100' : 'border-l-indigo-500'
                                    }`}>
                                    <CardContent className="p-4 flex items-center justify-between">
                                        <div className="text-left">
                                            <h4 className="font-semibold text-lg">{rec.label}</h4>
                                            <p className="text-sm text-muted-foreground">{rec.description}</p>
                                        </div>
                                        <Button size="sm" variant={rec.priority === 0 ? 'default' : 'secondary'} asChild>
                                            {rec.type === 'contact' ? (
                                                <a href={`tel:${rec.targetId}`}>Call</a>
                                            ) : (
                                                <span>{rec.actionLabel}</span>
                                            )}
                                        </Button>
                                    </CardContent>
                                </Card>
                            ))}
                        </div>

                        <div className="flex flex-col gap-3 pt-4">
                            <Button size="lg" className="w-full" onClick={onClose}>
                                Return to Dashboard
                            </Button>
                            <Button variant="ghost" className="w-full text-muted-foreground" onClick={() => setStep('assess')}>
                                Go Back
                            </Button>
                        </div>
                    </div>
                )}
            </div>
        </div>
    )
}

function EmotionButton({ icon: Icon, label, color, onClick }: { icon: any, label: string, color: string, onClick: () => void }) {
    return (
        <button
            onClick={onClick}
            className={`p-6 rounded-xl border-2 border-transparent transition-all flex flex-col items-center justify-center gap-3 ${color}`}
        >
            <Icon className="w-8 h-8" />
            <span className="font-semibold text-lg">{label}</span>
        </button>
    )
}
