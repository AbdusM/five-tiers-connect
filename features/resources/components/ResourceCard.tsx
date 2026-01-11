import { ExternalLink, Phone, MapPin } from 'lucide-react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Resource, ResourceService } from '@/lib/services/resource-service'

interface ResourceCardProps {
    resource: Resource
    category: string
}

export function ResourceCard({ resource, category }: ResourceCardProps) {
    const Icon = resource.icon || (resource.link ? ExternalLink : Phone)
    const isCrisis = category === 'crisis'

    const handleClick = () => {
        ResourceService.trackAccess(resource, category)
    }

    return (
        <Card className="flex flex-col h-full hover:shadow-lg transition-shadow">
            <CardHeader>
                <div className="flex justify-between items-start">
                    <CardTitle className="text-xl">{resource.name}</CardTitle>
                    {resource.isEmergency && (
                        <Badge variant="destructive">Emergency</Badge>
                    )}
                </div>
                <CardDescription className="text-base mt-2">
                    {resource.description}
                </CardDescription>
            </CardHeader>
            <CardContent className="mt-auto pt-0 space-y-4">
                {resource.address && (
                    <div className="flex items-start text-sm text-gray-600">
                        <MapPin className="w-4 h-4 mr-2 mt-0.5 flex-shrink-0" />
                        {resource.address}
                    </div>
                )}

                <Button
                    className={`w-full h-12 text-base font-semibold ${isCrisis && resource.isEmergency ? 'bg-red-600 hover:bg-red-700 text-white' : ''}`}
                    variant={isCrisis && !resource.isEmergency ? 'outline' : 'default'}
                    asChild
                    onClick={handleClick}
                >
                    <a
                        href={resource.phone ? `tel:${resource.phone}` : resource.link}
                        target={resource.link ? "_blank" : undefined}
                        rel={resource.link ? "noopener noreferrer" : undefined}
                        className="flex items-center justify-center cursor-pointer"
                    >
                        <Icon className="w-4 h-4 mr-2" />
                        {resource.actionLabel}
                    </a>
                </Button>
            </CardContent>
        </Card>
    )
}
