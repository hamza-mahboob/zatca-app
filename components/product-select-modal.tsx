'use client'

import { useEffect, useState } from "react"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Search, Trash2 } from 'lucide-react'
import { TailSpin } from 'react-loader-spinner'

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
  const [loadingProductId, setLoadingProductId] = useState<string | null>(null)
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
                  <TableCell>
                    <button
                      onClick={async (e) => {
                        e.stopPropagation();
                        setLoadingProductId(product.id);
                        try {
                          const response = await fetch('/api/items', {
                            method: 'DELETE',
                            headers: {
                              'Content-Type': 'application/json',
                            },
                            body: JSON.stringify({ description: product.description }),
                          });

                          if (response.ok) {
                            setItems((prevItems) => prevItems.filter((item) => item.id !== product.id));
                            console.log('Item deleted successfully');
                          } else {
                            console.error('Failed to delete item');
                          }
                        } catch (error) {
                          console.error('Error deleting item:', error);
                        } finally {
                          setLoadingProductId(null);
                        }
                      }}
                    >
                      {loadingProductId === product.id ? (
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

