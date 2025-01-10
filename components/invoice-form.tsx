"use client";

import { useState, useEffect } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Plus, Trash2, MousePointer2 } from "lucide-react";
import { ClientSelectModal } from "./client-select-modal";
import { ProductSelectModal } from "./product-select-modal";
import { AddProductModal } from "./add-product-modal";
import { AddClientModal } from "./add-client-modal";
import { Switch } from "@/components/ui/switch";
import { InvoiceData } from "@/lib/utils";
import { useQRCode } from "../context/qrCodeContext";
import Image from "next/image";

type InvoiceProps = {
  invoiceData: InvoiceData;
  setInvoiceData: React.Dispatch<React.SetStateAction<InvoiceData>>;
};

export function InvoiceForm({ invoiceData, setInvoiceData }: InvoiceProps) {
  useEffect(() => {
    console.log("Updated Invoice Data:", invoiceData);
  }, [invoiceData]); // This will log whenever invoiceData changes

  const [clientModalOpen, setClientModalOpen] = useState(false);
  const [productModalOpen, setProductModalOpen] = useState(false);
  const [addProductModalOpen, setAddProductModalOpen] = useState(false);
  const [addClientModalOpen, setAddClientModalOpen] = useState(false); // Added state
  // const [includeVAT, setIncludeVAT] = useState(true)

  const { qrCode, includeVAT, setIncludeVAT } = useQRCode();

  const updateInvoiceField = (field: string, value: string) => {
    setInvoiceData((prev) => ({ ...prev, [field]: value }));
  };

  const updateSellerField = (field: string, value: string) => {
    setInvoiceData((prev) => ({
      ...prev,
      seller: { ...prev.seller, [field]: value },
    }));
  };

  const updateClientField = (field: string, value: string) => {
    setInvoiceData((prev) => ({
      ...prev,
      client: { ...prev.client, [field]: value },
    }));
  };

  const updateInvoiceItem = (
    index: number,
    field: string,
    value: string | number
  ) => {
    setInvoiceData((prev) => {
      const newItems = [...prev.items];

      const updatedItem = {
        ...newItems[index],
        [field]: value,
      };

      // Ensure we use the updated values for calculation
      const updatedQuantity =
        field === "quantity" ? Number(value) : Number(updatedItem.quantity);
      const updatedPrice =
        field === "price" ? Number(value) : Number(updatedItem.price);

      updatedItem.total = updatedQuantity * updatedPrice;

      newItems[index] = updatedItem;

      const subtotal = newItems.reduce((sum, item) => sum + item.total, 0);
      const total = includeVAT
        ? subtotal * (1 + prev.totals.vat / 100)
        : subtotal;

      return {
        ...prev,
        items: newItems,
        totals: {
          ...prev.totals,
          subtotal,
          total,
        },
      };
    });
  };

  const handleClientSelect = (client: any) => {
    setInvoiceData((prev) => ({
      ...prev,
      client: {
        name: client.name,
        country: client.country,
        vatNumber: client.vatNumber,
        address: client.address,
        phone: client.phone,
        email: client.email,
      },
    }));
  };

  // const handleAddClientToDatabase = async (client: {
  //   name: string
  //   country: string
  //   vatNumber: string
  //   address: string
  //   phone: string
  //   email: string
  // }) => {

  // };

  const handleProductSelect = (product: any) => {
    setInvoiceData((prev) => {
      const newItems = [
        ...prev.items,
        {
          description: product.description,
          quantity: 1,
          price: product.price,
          total: product.price,
        },
      ];
      const subtotal = newItems.reduce((sum, item) => sum + item.total, 0);
      const total = includeVAT
        ? subtotal * (1 + prev.totals.vat / 100)
        : subtotal;

      return {
        ...prev,
        items: newItems,
        totals: {
          ...prev.totals,
          subtotal,
          total,
        },
      };
    });
  };

  const handleAddProductToDatabase = async (product: {
    description: string;
    price: number;
  }) => {
    // This function will be connected to your database later    const handleAddProductToDatabase = async (product: { description: string; price: number }) => {
    console.log("Adding product to database:", product);

    try {
      const response = await fetch("/api/items", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(product),
      });

      if (!response.ok) {
        throw new Error("Failed to add product");
      }

      const data = await response.json();
      console.log("Product added successfully:", data);
    } catch (error) {
      console.error("Error adding product:", error);
    }
  };

  useEffect(() => {
    setInvoiceData((prev) => {
      const subtotal = prev.items.reduce((sum, item) => sum + item.total, 0);
      const total = includeVAT
        ? subtotal * (1 + prev.totals.vat / 100)
        : subtotal;
      return {
        ...prev,
        totals: {
          ...prev.totals,
          subtotal,
          total,
        },
      };
    });
  }, [includeVAT, setInvoiceData]);

  return (
    <div className="container py-6 space-y-6" id="invoice">
      {/* Invoice Header */}
      <div className="grid grid-cols-4 gap-4">
        <div className="space-y-2">
          <Label htmlFor="invoice-number">Invoice # فاتورة ضريبية</Label>
          <Input
            id="invoice-number"
            type="number"
            defaultValue={invoiceData.invoiceNumber}
            onChange={(e) =>
              updateInvoiceField("invoiceNumber", e.target.value)
            }
            disabled
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="invoice-date">Invoice Date | تاريخ الفاتورة</Label>
          <Input
            id="invoice-date"
            type="date"
            defaultValue={invoiceData.invoiceDate}
            onChange={(e) => updateInvoiceField("invoiceDate", e.target.value)}
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="due-date">Due Date | تاريخ الاستحقاق</Label>
          <Input
            id="due-date"
            type="date"
            defaultValue={invoiceData.dueDate}
            onChange={(e) => updateInvoiceField("dueDate", e.target.value)}
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="sales-rep">Sales Rep | مندوب مبيعات</Label>
          <Input
            id="sales-rep"
            defaultValue={invoiceData.salesRep}
            onChange={(e) => updateInvoiceField("salesRep", e.target.value)}
          />
        </div>
      </div>

      {/* Seller and Client Information */}
      <div className="grid lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader className="pb-4">
            <div className="font-semibold">Seller Information | بائع</div>
          </CardHeader>
          <CardContent className="space-y-4 font-semibold">
            <div className="space-y-2">
              <Label htmlFor="seller-name">Seller Name</Label>
              <Input
                id="seller-name"
                defaultValue={invoiceData.seller.name}
                onChange={(e) => updateSellerField("name", e.target.value)}
                disabled
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="seller-country">Country/City</Label>
              <Input
                id="seller-country"
                defaultValue={invoiceData.seller.country}
                onChange={(e) => updateSellerField("country", e.target.value)}
                disabled
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="seller-vat">VAT Number</Label>
              <Input
                id="seller-vat"
                defaultValue={invoiceData.seller.vatNumber}
                onChange={(e) => updateSellerField("vatNumber", e.target.value)}
                disabled
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="seller-address">Address</Label>
              <Input
                id="seller-address"
                defaultValue={invoiceData.seller.address}
                onChange={(e) => updateSellerField("address", e.target.value)}
                disabled
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="seller-phone">Phone</Label>
              <Input
                id="seller-phone"
                defaultValue={invoiceData.seller.phone}
                onChange={(e) => updateSellerField("phone", e.target.value)}
                disabled
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="seller-email">Email</Label>
              <Input
                id="seller-email"
                type="email"
                defaultValue={invoiceData.seller.email}
                onChange={(e) => updateSellerField("email", e.target.value)}
                disabled
              />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-4">
            <div className="flex items-center justify-between">
              <div className="font-semibold">Client Information | عميل</div>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setAddClientModalOpen(true)}
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Add Client
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    setClientModalOpen(true);
                  }}
                >
                  <MousePointer2 className="h-4 w-4 mr-2" />
                  Select Client
                </Button>
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="client-name">Client Name</Label>
              <Input
                id="client-name"
                defaultValue={invoiceData.client.name}
                onChange={(e) => updateClientField("name", e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="client-country">Country/City</Label>
              <Input
                id="client-country"
                defaultValue={invoiceData.client.country}
                onChange={(e) => updateClientField("country", e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="client-vat">VAT Number</Label>
              <Input
                id="client-vat"
                defaultValue={invoiceData.client.vatNumber}
                onChange={(e) => updateClientField("vatNumber", e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="client-address">Address</Label>
              <Input
                id="client-address"
                defaultValue={invoiceData.client.address}
                onChange={(e) => updateClientField("address", e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="client-phone">Phone</Label>
              <Input
                id="client-phone"
                defaultValue={invoiceData.client.phone}
                onChange={(e) => updateClientField("phone", e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="client-email">Email</Label>
              <Input
                id="client-email"
                type="email"
                defaultValue={invoiceData.client.email}
                onChange={(e) => updateClientField("email", e.target.value)}
              />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Invoice Items Table */}
      <Card>
        <CardHeader className="pb-4">
          <div className="flex items-center justify-between">
            <div className="font-semibold">Invoice Items</div>
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setAddProductModalOpen(true)}
              >
                <Plus className="h-4 w-4 mr-2" />
                Add Item
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setProductModalOpen(true)}
              >
                <MousePointer2 className="h-4 w-4 mr-2" />
                Select Item
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-[50%]">Description</TableHead>
                <TableHead>Quantity</TableHead>
                <TableHead>Price ($)</TableHead>
                <TableHead className="text-right">Total</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {invoiceData.items.map((item, index) => (
                <TableRow key={index + item.description}>
                  <TableCell>
                    <Input
                      placeholder="Item description"
                      defaultValue={item.description}
                      //readOnly
                    />
                  </TableCell>
                  <TableCell>
                    <Input
                      type="number"
                      placeholder="0"
                      // defaultValue={item.quantity || ''}
                      value={item.quantity || ""}
                      min="1"
                      onChange={(e) => {
                        const value = Math.max(1, Number(e.target.value));
                        updateInvoiceItem(index, "quantity", value);
                      }}
                    />
                  </TableCell>
                  <TableCell>
                    <Input
                      type="number"
                      placeholder="0.00"
                      defaultValue={item.price || ""}
                      onChange={(e) =>
                        updateInvoiceItem(
                          index,
                          "price",
                          Number(e.target.value)
                        )
                      }
                    />
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex items-center justify-end gap-2">
                      <span>{item.total.toFixed(2)}</span>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-8 w-8 p-0"
                        onClick={() => {
                          setInvoiceData((prev) => {
                            const newItems = prev.items.filter(
                              (_, i) => i !== index
                            );
                            const subtotal = newItems.reduce(
                              (sum, item) => sum + item.total,
                              0
                            );
                            const total = includeVAT
                              ? subtotal * (1 + prev.totals.vat / 100)
                              : subtotal;

                            return {
                              ...prev,
                              items: newItems,
                              totals: {
                                ...prev.totals,
                                subtotal,
                                total,
                              },
                            };
                          });
                        }}
                      >
                        <span className="sr-only">Delete item</span>
                        <Trash2 className="h-4 w-4 text-red-500" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <div className="flex">
        <div className="flex-1">
          {qrCode && (
            <div className="flex justify-between items-center ml-5">
              <Image src={qrCode} alt="QR Code" width={240} height={240} />
            </div>
          )}
        </div>
        {/* Totals */}
        <div className="flex justify-end">
          <Card className="w-[300px]">
            <CardContent className="pt-6">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <label className="text-sm font-medium">Include VAT</label>
                    <p className="text-sm text-neutral-500 dark:text-neutral-400">
                      Toggle 15% VAT calculation
                    </p>
                  </div>
                  <Switch
                    checked={includeVAT}
                    onCheckedChange={setIncludeVAT}
                  />
                </div>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span>Total Without VAT</span>
                    <span>{invoiceData.totals.subtotal.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>15% VAT</span>
                    <span>
                      {includeVAT ? invoiceData.totals.vat.toFixed(2) : "0.00"}{" "}
                      %
                    </span>
                  </div>
                  <div className="flex justify-between font-bold">
                    <span>Total {includeVAT ? "with" : "without"} VAT</span>
                    <span>
                      {includeVAT
                        ? invoiceData.totals.total.toFixed(2)
                        : invoiceData.totals.subtotal.toFixed(2)}
                    </span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Add Modals */}
      <ClientSelectModal
        open={clientModalOpen}
        onOpenChange={setClientModalOpen}
        onClientSelect={handleClientSelect}
      />
      <ProductSelectModal
        open={productModalOpen}
        onOpenChange={setProductModalOpen}
        onProductSelect={handleProductSelect}
      />
      <AddProductModal
        open={addProductModalOpen}
        onOpenChange={setAddProductModalOpen}
        onProductAdd={handleAddProductToDatabase}
      />
      <AddClientModal // Added AddClientModal
        open={addClientModalOpen}
        onOpenChange={setAddClientModalOpen}
      />
    </div>
  );
}
