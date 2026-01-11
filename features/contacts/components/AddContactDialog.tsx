import { useState } from 'react'
import { Plus } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Contact, ContactService } from '@/lib/services/contact-service'

interface AddContactDialogProps {
    onAdd: (contact: Omit<Contact, 'id'>) => void
}

export function AddContactDialog({ onAdd }: AddContactDialogProps) {
    const [isOpen, setIsOpen] = useState(false)
    const [name, setName] = useState('')
    const [role, setRole] = useState('')
    const [phone, setPhone] = useState('')
    const [email, setEmail] = useState('')
    const [isPrimary, setIsPrimary] = useState(false)

    const [goalTag, setGoalTag] = useState('')

    const handleSubmit = async () => {
        if (!name || !role || !phone) return

        const newContact: Omit<Contact, 'id'> = {
            name,
            role: role as any,
            phone,
            email: email || undefined,
            is_primary: isPrimary,
            goal_tag: goalTag as any,
            frequency: 'weekly', // Default
            tags: [] // Default
        }

        await ContactService.addContact(newContact)
        onAdd(newContact)
        setIsOpen(false)

        // Reset
        setName('')
        setPhone('')
        setEmail('')
        setGoalTag('')
        setIsPrimary(false)
    }

    return (
        <Dialog open={isOpen} onOpenChange={setIsOpen}>
            <DialogTrigger asChild>
                <Button size="lg" className="h-14 px-8 text-lg bg-indigo-600 hover:bg-indigo-700">
                    <Plus className="w-5 h-5 mr-2" />
                    Add to Team
                </Button>
            </DialogTrigger>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>Add to My Team</DialogTitle>
                    <DialogDescription>
                        Who is this person and how do they help you?
                    </DialogDescription>
                </DialogHeader>
                <div className="grid gap-4 py-4">
                    <div className="grid gap-2">
                        <Label htmlFor="name">Name</Label>
                        <Input id="name" value={name} onChange={(e) => setName(e.target.value)} placeholder="e.g., Sarah Jenkins" />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                        <div className="grid gap-2">
                            <Label htmlFor="role">Role</Label>
                            <Select onValueChange={setRole}>
                                <SelectTrigger>
                                    <SelectValue placeholder="Select role..." />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="Family">Family</SelectItem>
                                    <SelectItem value="Mentor">Mentor</SelectItem>
                                    <SelectItem value="Parole Officer">Parole Officer</SelectItem>
                                    <SelectItem value="Peer Support">Peer Support</SelectItem>
                                    <SelectItem value="Therapist">Therapist</SelectItem>
                                    <SelectItem value="Employer">Employer</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                        <div className="grid gap-2">
                            <Label htmlFor="tag">Helps With...</Label>
                            <Select onValueChange={setGoalTag}>
                                <SelectTrigger>
                                    <SelectValue placeholder="Select area..." />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="general">General Support</SelectItem>
                                    <SelectItem value="employment">Employment</SelectItem>
                                    <SelectItem value="housing">Housing</SelectItem>
                                    <SelectItem value="legal">Legal</SelectItem>
                                    <SelectItem value="health">Health</SelectItem>
                                    <SelectItem value="education">Education</SelectItem>
                                    <SelectItem value="financial">Financial</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                    </div>
                    <div className="grid gap-2">
                        <Label htmlFor="phone">Phone Number</Label>
                        <Input id="phone" value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="(555) 555-5555" />
                    </div>
                    <div className="grid gap-2">
                        <Label htmlFor="email">Email (Optional)</Label>
                        <Input id="email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="sarah@example.com" />
                    </div>
                    <div className="flex items-center space-x-2 pt-2">
                        <input
                            type="checkbox"
                            id="primary"
                            checked={isPrimary}
                            onChange={(e) => setIsPrimary(e.target.checked)}
                            className="h-4 w-4 rounded border-gray-300 text-indigo-600 focus:ring-indigo-600"
                        />
                        <Label htmlFor="primary" className="font-medium">Set as Primary Lifeline?</Label>
                    </div>
                </div>
                <DialogFooter>
                    <Button onClick={handleSubmit}>Save Contact</Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    )
}
