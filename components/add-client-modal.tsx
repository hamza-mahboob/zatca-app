'use client'

import { useState } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"

interface AddClientModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onClientAdd?: (client: {
    name:string
    country: string
    vatNumber: string
    address: string
    phone: string
    email: string
  }) => void
}

export function AddClientModal({
  open,
  onOpenChange,
  onClientAdd
}: AddClientModalProps) {
  const [clientData, setClientData] = useState({
    name:"",
    country: "",
    vatNumber: "",
    address: "",
    phone: "",
    email: ""
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    try {
      const response = await fetch('/api/client', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(clientData),
      });

      if (!response.ok) {
        throw new Error('Failed to add client');
      }

      const data = await response.json();
      console.log('Client added successfully:', data);
    if (onClientAdd) {
      onClientAdd(data.client);
    }
    } catch (error) {
      console.error('Error adding client:', error);
    }
    
    setClientData({
      name:"",
      country: "",
      vatNumber: "",
      address: "",
      phone: "",
      email: ""
    })
    onOpenChange(false)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Add New Client</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
        <div className="space-y-2">
            <Label htmlFor="Clientname">Name</Label>
            <Input
              id="Clientname"
              value={clientData.name}
              onChange={(e) => setClientData(prev => ({ ...prev, name: e.target.value }))}
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="country">Country/City</Label>
            <Input
              id="country"
              value={clientData.country}
              onChange={(e) => setClientData(prev => ({ ...prev, country: e.target.value }))}
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="vatNumber">VAT Number</Label>
            <Input
              id="vatNumber"
              value={clientData.vatNumber}
              onChange={(e) => setClientData(prev => ({ ...prev, vatNumber: e.target.value }))}
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="address">Address</Label>
            <Input
              id="address"
              value={clientData.address}
              onChange={(e) => setClientData(prev => ({ ...prev, address: e.target.value }))}
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="phone">Phone</Label>
            <Input
              id="phone"
              type="tel"
              value={clientData.phone}
              onChange={(e) => setClientData(prev => ({ ...prev, phone: e.target.value }))}
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              type="email"
              value={clientData.email}
              onChange={(e) => setClientData(prev => ({ ...prev, email: e.target.value }))}
              required
            />
          </div>
          <div className="flex justify-end">
            <Button type="submit">Add Client</Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}

