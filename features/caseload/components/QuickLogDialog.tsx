import { useState } from 'react'
import { Plus } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from '@/components/ui/dialog'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { Mentee, CaseloadService } from '@/lib/services/caseload-service'

interface QuickLogDialogProps {
    mentees: Mentee[]
    onLogSuccess: (menteeId: string) => void
}

export function QuickLogDialog({ mentees, onLogSuccess }: QuickLogDialogProps) {
    const [isOpen, setIsOpen] = useState(false)
    const [logWho, setLogWho] = useState('')
    const [logType, setLogType] = useState('call')
    const [logNote, setLogNote] = useState('')

    const handleQuickLog = async () => {
        if (!logWho || !logNote) return

        await CaseloadService.logInteraction(logWho, logType, logNote)
        onLogSuccess(logWho)

        // Reset & Close
        setLogWho('')
        setLogType('call')
        setLogNote('')
        setIsOpen(false)
    }

    return (
        <Dialog open={isOpen} onOpenChange={setIsOpen}>
            <DialogTrigger asChild>
                <Button size="icon" className="h-14 w-14 rounded-full shadow-xl bg-indigo-600 hover:bg-indigo-700 text-white">
                    <Plus className="h-6 w-6" />
                </Button>
            </DialogTrigger>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>Quick Interaction Log</DialogTitle>
                    <DialogDescription>
                        Record a touchpoint with a mentee.
                    </DialogDescription>
                </DialogHeader>
                <div className="py-4 space-y-4">
                    <div className="space-y-2">
                        <Label>Who?</Label>
                        <Select value={logWho} onValueChange={setLogWho}>
                            <SelectTrigger className="h-12 text-lg">
                                <SelectValue placeholder="Select Mentee" />
                            </SelectTrigger>
                            <SelectContent>
                                {mentees.map(m => (
                                    <SelectItem key={m.id} value={m.id}>{m.name}</SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>

                    <div className="space-y-2">
                        <Label>Type</Label>
                        <div className="flex gap-2">
                            {['Call', 'Meet', 'Text', 'Note'].map(type => (
                                <Button
                                    key={type}
                                    variant={logType === type.toLowerCase() ? 'default' : 'outline'}
                                    onClick={() => setLogType(type.toLowerCase())}
                                    className="flex-1"
                                >
                                    {type}
                                </Button>
                            ))}
                        </div>
                    </div>

                    <div className="space-y-2">
                        <Label>Fast Note</Label>
                        <Textarea
                            placeholder="Quick summary..."
                            value={logNote}
                            onChange={(e) => setLogNote(e.target.value)}
                            className="min-h-[100px] text-lg"
                        />
                    </div>
                </div>
                <DialogFooter>
                    <Button size="lg" onClick={handleQuickLog} className="w-full text-lg h-12">Log Interaction</Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    )
}
