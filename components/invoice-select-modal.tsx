'use client'

import { useEffect, useState } from "react"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Search } from "lucide-react"
import { InvoiceData } from "@/lib/utils"

interface InvoiceSelectModalProps {
    open: boolean
    onOpenChange: (open: boolean) => void
    onInvoiceSelect: (invoice: InvoiceData) => void
}

export function InvoiceSelectModal({
    open,
    onOpenChange,
    onInvoiceSelect
}: InvoiceSelectModalProps) {
    const [searchQuery, setSearchQuery] = useState("")
    const [invoices, setInvoices] = useState<InvoiceData[]>([])

    const filteredInvoices = invoices.filter(invoice =>
        invoice.invoiceNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
        invoice.client.name.toLowerCase().includes(searchQuery.toLowerCase())
    )

    useEffect(() => {
        const fetchInvoices = async () => {
            try {
                const response = await fetch('/api/invoice');
                const data = await response.json();
                const sortedInvoices = data.invoices.sort((a: InvoiceData, b: InvoiceData) => parseInt(a.invoiceNumber) - parseInt(b.invoiceNumber));
                setInvoices(sortedInvoices);
                // console.log('Invoices fetched:', data.invoices);
            } catch (error) {
                console.error('Error fetching invoices:', error);
            }
        };

        if (open) {
            fetchInvoices();
        }
    }, [open])

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="max-w-3xl">
                <DialogHeader>
                    <DialogTitle>Select Invoice</DialogTitle>
                </DialogHeader>
                <div className="relative">
                    <Search className="absolute left-2 top-2.5 h-4 w-4 text-neutral-500 dark:text-neutral-400" />
                    <Input
                        placeholder="Search invoices..."
                        className="pl-8"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                    />
                </div>
                <ScrollArea className="h-[400px] w-full rounded-md border">
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Invoice Number</TableHead>
                                <TableHead>Client Name</TableHead>
                                <TableHead>Invoice Date</TableHead>
                                <TableHead>Total</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {filteredInvoices.map((invoice) => (
                                <TableRow
                                    key={invoice.invoiceNumber}
                                    className="cursor-pointer hover:bg-neutral-100 dark:hover:bg-neutral-800"
                                    onClick={() => {
                                        onInvoiceSelect(invoice)
                                        onOpenChange(false)
                                    }}
                                >
                                    <TableCell>{invoice.invoiceNumber}</TableCell>
                                    <TableCell>{invoice.client.name}</TableCell>
                                    <TableCell>{invoice.invoiceDate}</TableCell>
                                    <TableCell>{invoice.totals.total.toFixed(2)}</TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </ScrollArea>
            </DialogContent>
        </Dialog>
    )
}