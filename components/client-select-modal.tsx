'use client'

import { useEffect, useState } from "react"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Search, Trash2 } from "lucide-react"
import { TailSpin } from 'react-loader-spinner'

interface Client {
  id: string
  name: string
  country: string
  vatNumber: string
  address: string
  phone: string
  email: string
}

// Temporary mock data - replace with actual database data later
// const mockClients: Client[] = [
//   {
//     id: "'1'",
//     name: "Hamza",
//     country: "'Saudi Arabia, Riyadh'",
//     vatNumber: "'123456789'",
//     address: "'123 Main St'",
//     phone: "'+966 123 4567'",
//     email: "'client1@example.com'"
//   },
//   // Add more mock clients as needed
// ]

interface ClientSelectModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onClientSelect: (client: Client) => void
}

export function ClientSelectModal({
  open,
  onOpenChange,
  onClientSelect
}: ClientSelectModalProps) {
  const [searchQuery, setSearchQuery] = useState("")

  const [clients, setClients] = useState<Client[]>([])
  const [loadingClientId, setLoadingClientId] = useState<string | null>(null)
  const filteredClients = clients.filter(client =>
    client.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    client.vatNumber.includes(searchQuery) || client.country.toLowerCase().includes(searchQuery.toLowerCase())
  )

  useEffect(() => {
    const fetchClients = async () => {
      try {
        const response = await fetch('/api/client');
        const data = await response.json();
        setClients(data.clients);
        console.log('Clients fetched:', data.clients);
      } catch (error) {
        console.error('Error fetching clients:', error);
      }
    };

    if (open) {
      fetchClients();
    }
  }, [open])

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl">
        <DialogHeader>
          <DialogTitle>Select Client</DialogTitle>
        </DialogHeader>
        <div className="relative">
          <Search className="absolute left-2 top-2.5 h-4 w-4 text-neutral-500 dark:text-neutral-400" />
          <Input
            placeholder="Search clients..."
            className="pl-8"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
        <ScrollArea className="h-[400px] w-full rounded-md border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Country/City</TableHead>
                <TableHead>VAT Number</TableHead>
                <TableHead>Address</TableHead>
                <TableHead>Contact</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredClients.map((client) => (
                <TableRow
                  key={client.id}
                  className="cursor-pointer hover:bg-neutral-100 dark:hover:bg-neutral-800"
                  onClick={() => {
                    onClientSelect(client)
                    onOpenChange(false)
                  }}
                >
                  <TableCell>{client.name}</TableCell>
                  <TableCell>{client.country}</TableCell>
                  <TableCell>{client.vatNumber}</TableCell>
                  <TableCell>{client.address}</TableCell>
                  <TableCell className="break-words max-w-60">
                    {client.phone}<br />
                    {client.email}
                  </TableCell>
                  <TableCell>
                    <button
                      onClick={async (e) => {
                        e.stopPropagation();
                        setLoadingClientId(client.id);
                        try {
                          const response = await fetch('/api/client', {
                            method: 'DELETE',
                            headers: {
                              'Content-Type': 'application/json',
                            },
                            body: JSON.stringify({ vatNumber: client.vatNumber }),
                          });

                          if (response.ok) {
                            setClients((prevItems) => prevItems.filter((item) => item.id !== client.id));
                            console.log('Client deleted successfully');
                          } else {
                            console.error('Failed to delete client');
                          }
                        } catch (error) {
                          console.error('Error deleting client:', error);
                        } finally {
                          setLoadingClientId(null);
                        }
                      }}
                    >
                      {loadingClientId === client.id ? (
                        <TailSpin
                          height="20"
                          width="20"
                          color="#ff0000"
                          ariaLabel="loading"
                        />
                      ) : (
                        <Trash2 className="h-4 w-4 text-red-500" />
                      )}
                    </button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </ScrollArea>
      </DialogContent>
    </Dialog>
  )
}

