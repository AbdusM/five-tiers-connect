
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { ExternalLink, Building2 } from "lucide-react"

const PARTNERS = [
    {
        name: "Legal Aid Society",
        type: "Legal",
        description: "Free legal services for re-entry.",
        status: "Verified"
    },
    {
        name: "Second Chance Jobs",
        type: "Employment",
        description: "Job board for fair chance employers.",
        status: "Partner"
    },
    {
        name: "Community Health Corps",
        type: "Health",
        description: "Mental health and general wellness.",
        status: "Verified"
    },
]

export function PartnerDirectoryWidget() {
    return (
        <Card className="h-full border-gray-100 shadow-sm transition-shadow hover:shadow-md">
            <CardHeader className="pb-2">
                <CardTitle className="flex items-center text-lg font-bold tracking-tight">
                    <Building2 className="w-5 h-5 mr-2.5 text-gray-400" />
                    Partner Directory
                </CardTitle>
                <CardDescription className="pl-[1.9rem]">Trusted organizations ready to help.</CardDescription>
            </CardHeader>
            <CardContent>
                <div className="space-y-4">
                    {PARTNERS.map((partner, i) => (
                        <div key={i} className="group flex items-start justify-between p-3 -mx-3 rounded-lg hover:bg-gray-50 transition-colors cursor-pointer">
                            <div className="space-y-0.5">
                                <div className="flex items-center space-x-2">
                                    <h4 className="font-semibold text-sm text-gray-900 group-hover:text-indigo-600 transition-colors">{partner.name}</h4>
                                    <span className="text-[10px] uppercase tracking-wider font-medium text-gray-400">
                                        {partner.type}
                                    </span>
                                </div>
                                <p className="text-xs text-gray-500 line-clamp-1 font-medium">{partner.description}</p>
                            </div>
                            <ExternalLink className="w-3.5 h-3.5 text-gray-300 group-hover:text-indigo-600 transition-colors" />
                        </div>
                    ))}
                </div>
            </CardContent>
        </Card>
    )
}
