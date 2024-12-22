'use client'

import { useEffect, useState } from "react"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Search } from 'lucide-react'

interface Product {
  id: string
  description: string
  price: number
}

// Temporary mock data - replace with actual database data later
const mockProducts: Product[] = [
  {
    id: "1",
    description: "Product 1",
    price: 99.99
  },
  // Add more mock products as needed
]

interface ProductSelectModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onProductSelect: (product: Product) => void
}

export function ProductSelectModal({
  open,
  onOpenChange,
  onProductSelect
}: ProductSelectModalProps) {
  const [searchQuery, setSearchQuery] = useState("")


  const [items, setItems] = useState<Product[]>([])
  const filteredProducts = items.filter(product =>
    product.description.toLowerCase().includes(searchQuery.toLowerCase())
  )

  useEffect(() => {
    const fetchItems = async () => {
      try {
        const response = await fetch('/api/items');
        const data = await response.json();
        setItems(data.items);
        console.log('Items fetched:', data.items);
      } catch (error) {
        console.error('Error fetching items:', error);
      }
    };

    if (open) {
      fetchItems();
    }
  }, [open])

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Select Product</DialogTitle>
        </DialogHeader>
        <div className="relative">
          <Search className="absolute left-2 top-2.5 h-4 w-4 text-neutral-500 dark:text-neutral-400" />
          <Input
            placeholder="Search products..."
            className="pl-8"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
        <ScrollArea className="h-[400px] w-full rounded-md border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Description</TableHead>
                <TableHead>Price</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredProducts.map((product) => (
                <TableRow
                  key={product.id}
                  className="cursor-pointer hover:bg-neutral-100 dark:hover:bg-neutral-800"
                  onClick={() => {
                    onProductSelect(product)
                    onOpenChange(false)
                  }}
                >
                  <TableCell>{product.description}</TableCell>
                  <TableCell>{product.price.toFixed(2)}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </ScrollArea>
      </DialogContent>
    </Dialog>
  )
}

