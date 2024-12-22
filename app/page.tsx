'use client'

import { SiteHeader } from "@/components/site-header"
import { InvoiceForm } from "@/components/invoice-form"
import { useEffect, useState } from "react"
import { InvoiceData } from "@/lib/utils"
import { useQRCode } from "@/context/qrCodeContext"

export default function Page() {

  const { selectedInvoice, qrCode } = useQRCode()

  // console.log('selected', selectedInvoice)

  useEffect(() => {
    async function fetchInvoiceCount() {
      try {
        const response = await fetch('/api/invoice');
        const data = await response.json();
        const invoiceCount = data.invoices.length;
        setInvoiceData(prevData => ({
          ...prevData,
          invoiceNumber: (invoiceCount + 1).toString()
        }));
      } catch (error) {
        console.error("Error fetching invoice count:", error);
        setInvoiceData(prevData => ({
          ...prevData,
          invoiceNumber: ""
        }));
      }
    }

    fetchInvoiceCount();

  }, []);

  const [invoiceData, setInvoiceData] = useState<InvoiceData>({
    invoiceNumber: "",
    invoiceDate: new Date().toISOString().split('T')[0],
    dueDate: new Date().toISOString().split('T')[0],
    salesRep: "",
    seller: {
      name: "شركة الحب والسعادة للاغذية Love & Happiness Food Company LTD",
      country: "المملكة العربية السعودية بودة KSAJED",
      vatNumber: "310953029600003",
      address: "النابغة الذبياني 23434",
      phone: "+966 50 636 5746",
      email: "Mansoor.jamjoom@lahfood.com"
    },
    client: {
      name: "",
      country: "",
      vatNumber: "",
      address: "",
      phone: "",
      email: ""
    },
    items: [],
    totals: {
      subtotal: 0,
      vat: 15,
      total: 0
    }
  })

  // Update the invoiceData when a new invoice is selected
  useEffect(() => {
    if (selectedInvoice) {
      setInvoiceData(prevData => ({
        ...prevData,
        invoiceNumber: selectedInvoice.invoiceNumber,
        invoiceDate: selectedInvoice.invoiceDate,
        dueDate: selectedInvoice.dueDate,
        salesRep: selectedInvoice.salesRep,
        client: {
          name: selectedInvoice.client.name,
          country: selectedInvoice.client.country,
          vatNumber: selectedInvoice.client.vatNumber,
          address: selectedInvoice.client.address,
          phone: selectedInvoice.client.phone,
          email: selectedInvoice.client.email
        },
        items: selectedInvoice.items,
        totals: selectedInvoice.totals
      }))
    }
  }, [selectedInvoice])

  // console.log('invoiceData', invoiceData)

  return (
    <div className="min-h-screen flex flex-col w-full max-w-[90rem] mx-auto p-4">
      <SiteHeader invoiceData={invoiceData} setInvoiceData={setInvoiceData} />
      <main className="flex-1 p-5">
        <InvoiceForm invoiceData={invoiceData} setInvoiceData={setInvoiceData} />
      </main>
    </div>
  )
}

