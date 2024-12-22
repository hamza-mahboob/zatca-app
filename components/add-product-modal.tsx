'use client'

import { useState } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"

interface AddProductModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onProductAdd: (product: { description: string; price: number }) => void
}

export function AddProductModal({
  open,
  onOpenChange,
  onProductAdd
}: AddProductModalProps) {
  const [productData, setProductData] = useState({
    description: "",
    price: ""
  })

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    onProductAdd({
      description: productData.description,
      price: Number(productData.price)
    })
    setProductData({ description: "", price: "" })
    onOpenChange(false)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Add New Product</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Input
              id="description"
              value={productData.description}
              onChange={(e) => setProductData(prev => ({ ...prev, description: e.target.value }))}
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="price">Price</Label>
            <Input
              id="price"
              type="number"
              step="0.01"
              value={productData.price}
              onChange={(e) => setProductData(prev => ({ ...prev, price: e.target.value }))}
              required
            />
          </div>
          <div className="flex justify-end">
            <Button type="submit">Add Product</Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}

