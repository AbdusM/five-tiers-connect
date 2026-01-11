import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Stethoscope } from 'lucide-react'
import { ResourceCategory } from '@/lib/services/resource-service'

interface TriageDialogProps {
    onTriageComplete: (category: ResourceCategory) => void
}

export function TriageDialog({ onTriageComplete }: TriageDialogProps) {
    const [open, setOpen] = useState(false)
    const [selectedOption, setSelectedOption] = useState<string>('')

    const handleSubmit = () => {
        let category: ResourceCategory = 'crisis' // default

        switch (selectedOption) {
            case 'unsafe':
            case 'health':
                category = 'crisis'
                break
            case 'housing':
                category = 'housing'
                break
            case 'legal':
                category = 'legal'
                break
            case 'job':
                category = 'education'
                break
        }

        onTriageComplete(category)
        setOpen(false)
        setSelectedOption('')
    }

    const options = [
        { id: 'unsafe', label: 'I feel unsafe or I am in crisis', color: 'red' },
        { id: 'housing', label: 'I need a place to sleep or food', color: 'indigo' },
        { id: 'legal', label: 'I need legal help or rights info', color: 'indigo' },
        { id: 'job', label: "I'm looking for a job or training", color: 'indigo' },
    ]

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                <Button size="lg" className="bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700 text-white border-0 shadow-lg">
                    <Stethoscope className="w-5 h-5 mr-2" />
                    Help Me Decide
                </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[500px]">
                <DialogHeader>
                    <DialogTitle>Quick Triage</DialogTitle>
                    <DialogDescription>
                        Answer one question to get matched with the right resource.
                    </DialogDescription>
                </DialogHeader>

                <div className="py-6 space-y-4">
                    {options.map((opt) => (
                        <div
                            key={opt.id}
                            onClick={() => setSelectedOption(opt.id)}
                            className={`flex items-center space-x-3 p-4 rounded-lg border cursor-pointer transition-all ${selectedOption === opt.id
                                    ? opt.color === 'red' ? 'bg-red-100 border-red-300 ring-2 ring-red-200' : 'bg-indigo-100 border-indigo-300 ring-2 ring-indigo-200'
                                    : 'bg-gray-50 border-gray-200 hover:bg-gray-100'
                                }`}
                        >
                            <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${selectedOption === opt.id
                                    ? opt.color === 'red' ? 'border-red-600' : 'border-indigo-600'
                                    : 'border-gray-400'
                                }`}>
                                {selectedOption === opt.id && (
                                    <div className={`w-2.5 h-2.5 rounded-full ${opt.color === 'red' ? 'bg-red-600' : 'bg-indigo-600'}`} />
                                )}
                            </div>
                            <span className={`font-medium w-full text-base ${opt.color === 'red' ? 'text-red-900' : 'text-gray-900'}`}>
                                {opt.label}
                            </span>
                        </div>
                    ))}
                </div>

                <Button
                    className="w-full h-12 text-lg"
                    onClick={handleSubmit}
                    disabled={!selectedOption}
                >
                    Find Resources
                </Button>
            </DialogContent>
        </Dialog>
    )
}
