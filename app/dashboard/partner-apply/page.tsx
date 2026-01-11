'use client'

import { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Textarea } from '@/components/ui/textarea'
import { createClient } from '@/lib/supabase/client'
import { CheckCircle2, Building2 } from 'lucide-react'

export default function PartnerApplyPage() {
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState(false)
  const [formData, setFormData] = useState({
    business_name: '',
    business_type: '' as 'barbershop' | 'salon' | '',
    owner_name: '',
    owner_email: '',
    owner_phone: '',
    address: '',
    city: '',
    state: 'PA',
    zip: '',
  })

  const supabase = createClient()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    const { error } = await supabase
      .from('partner_applications')
      .insert({
        ...formData,
        business_type: formData.business_type as 'barbershop' | 'salon',
      })

    if (error) {
      alert('Error submitting application: ' + error.message)
      setLoading(false)
    } else {
      setSuccess(true)
      setFormData({
        business_name: '',
        business_type: '',
        owner_name: '',
        owner_email: '',
        owner_phone: '',
        address: '',
        city: '',
        state: 'PA',
        zip: '',
      })
      setTimeout(() => {
        setSuccess(false)
      }, 5000)
      setLoading(false)
    }
  }

  return (
    <div className="max-w-3xl mx-auto space-y-8">
      <div>
        <h1 className="text-4xl font-bold text-gray-900">Become a Partner</h1>
        <p className="text-gray-600 mt-2">
          Join Five Tiers Connect as a trusted community partner
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Building2 className="w-6 h-6" />
            <span>Partner Application</span>
          </CardTitle>
          <CardDescription>
            We'll review your application and get back to you within 3-5 business days
          </CardDescription>
        </CardHeader>
        <CardContent>
          {success ? (
            <div className="text-center py-12">
              <CheckCircle2 className="w-16 h-16 text-green-600 mx-auto mb-4" />
              <h3 className="text-2xl font-bold text-gray-900 mb-2">Application Submitted!</h3>
              <p className="text-gray-600">
                Thank you for your interest. We'll review your application and contact you soon.
              </p>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label className="text-base">Business Name *</Label>
                  <Input
                    value={formData.business_name}
                    onChange={(e) => setFormData({ ...formData, business_name: e.target.value })}
                    placeholder="Your Business Name"
                    className="h-12 text-base"
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label className="text-base">Business Type *</Label>
                  <Select
                    value={formData.business_type}
                    onValueChange={(value: 'barbershop' | 'salon') =>
                      setFormData({ ...formData, business_type: value })
                    }
                  >
                    <SelectTrigger className="h-12 text-base">
                      <SelectValue placeholder="Select type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="barbershop">Barbershop</SelectItem>
                      <SelectItem value="salon">Salon</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="space-y-2">
                <Label className="text-base">Business Address *</Label>
                <Input
                  value={formData.address}
                  onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                  placeholder="Street address"
                  className="h-12 text-base"
                  required
                />
              </div>

              <div className="grid md:grid-cols-3 gap-6">
                <div className="space-y-2">
                  <Label className="text-base">City *</Label>
                  <Input
                    value={formData.city}
                    onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                    placeholder="Philadelphia"
                    className="h-12 text-base"
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label className="text-base">State *</Label>
                  <Input
                    value={formData.state}
                    onChange={(e) => setFormData({ ...formData, state: e.target.value })}
                    className="h-12 text-base"
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label className="text-base">ZIP Code *</Label>
                  <Input
                    value={formData.zip}
                    onChange={(e) => setFormData({ ...formData, zip: e.target.value })}
                    placeholder="19104"
                    className="h-12 text-base"
                    required
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label className="text-base">Owner/Manager Name *</Label>
                <Input
                  value={formData.owner_name}
                  onChange={(e) => setFormData({ ...formData, owner_name: e.target.value })}
                  placeholder="Your full name"
                  className="h-12 text-base"
                  required
                />
              </div>

              <div className="grid md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label className="text-base">Email *</Label>
                  <Input
                    type="email"
                    value={formData.owner_email}
                    onChange={(e) => setFormData({ ...formData, owner_email: e.target.value })}
                    placeholder="your@email.com"
                    className="h-12 text-base"
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label className="text-base">Phone *</Label>
                  <Input
                    type="tel"
                    value={formData.owner_phone}
                    onChange={(e) => setFormData({ ...formData, owner_phone: e.target.value })}
                    placeholder="(215) 555-1234"
                    className="h-12 text-base"
                    required
                  />
                </div>
              </div>

              <Button
                type="submit"
                className="w-full h-14 text-lg"
                disabled={loading}
              >
                {loading ? 'Submitting...' : 'Submit Application'}
              </Button>
            </form>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
