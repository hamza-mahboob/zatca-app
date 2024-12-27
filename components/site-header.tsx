// @ts-nocheck
'use client'

import Link from "next/link";
import { FileText, Download, Plus, Eye, Calculator, Loader2 } from 'lucide-react';
import jsPDF from 'jspdf';
import 'jspdf-autotable';
import html2canvas from 'html2canvas';
import { useState } from "react";
import QRCode from 'qrcode';
import { Buffer } from 'buffer'; // Ensure compatibility for Buffer in Next.js
import { Button } from "@/components/ui/button";
import { InvoiceData } from "@/lib/utils";
import { useQRCode } from "../context/qrCodeContext";
import { InvoiceSelectModal } from "./invoice-select-modal";


type HeaderProps = {
  invoiceData: InvoiceData
  setInvoiceData: (data: any) => void
}

export function SiteHeader({ invoiceData, setInvoiceData }: HeaderProps) {

  const { setQRCode, setSelectedInvoice } = useQRCode();

  const [isInvoiceModalOpen, setInvoiceModalOpen] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleInvoiceSelect = (invoice: InvoiceData) => {
    setSelectedInvoice(invoice);
    setQRCode(invoice.qrCodeDataUrl);
    // Populate the invoiceData with the selected invoice
    // You can set the state or context here to update the invoice form
  };



  const handleDownloadPDF = async () => {
    const doc = new jsPDF();

    // Add a heading with the invoice number
    doc.setFontSize(18);
    doc.text(`Invoice# ${invoiceData.invoiceNumber}`, 15, 30);

    // Invoice Info Table
    (doc as any).autoTable({
      head: [['Invoice Number', 'Invoice Date', 'Due Date', 'Sales Rep']],
      body: [[invoiceData.invoiceNumber, invoiceData.invoiceDate, invoiceData.dueDate, invoiceData.salesRep]],
      startY: 40,
    });

    // Seller Info Table using html2canvas
    const sellerInfoElement = document.createElement('div');
    sellerInfoElement.innerHTML = `
      <div>
      <p>Name: ${invoiceData.seller.name}</p>
      <p>Country: ${invoiceData.seller.country}</p>
      <p>VAT Number: ${invoiceData.seller.vatNumber}</p>
      <p>Address: ${invoiceData.seller.address}</p>
      <p>Phone: ${invoiceData.seller.phone}</p>
      <p>Email: ${invoiceData.seller.email}</p>
      <p>&nbsp;</p>
      </div>
    `;
    document.body.appendChild(sellerInfoElement);

    // Wait for html2canvas to finish before proceeding
    const canvas = await html2canvas(sellerInfoElement, { scale: 2 });
    const imgData = canvas.toDataURL('image/png');

    // Add the seller info image to the PDF
    const imgWidth = doc.internal.pageSize.getWidth() + 200; // Set width for the image to take full width of the screen
    const imgHeight = (canvas.height * imgWidth) / canvas.width; // Maintain aspect ratio
    doc.addImage(imgData, 'PNG', 15, (doc as any).autoTable.previous.finalY + 10, imgWidth, imgHeight);

    // Clean up
    document.body.removeChild(sellerInfoElement);

    // Client Info Table
    (doc as any).autoTable({
      head: [['Client Information']],
      body: [
        [`Name: ${invoiceData.client.name}`],
        [`Country: ${invoiceData.client.country}`],
        [`VAT Number: ${invoiceData.client.vatNumber}`],
        [`Address: ${invoiceData.client.address}`],
        [`Phone Number: ${invoiceData.client.phone}`],
        [`Email: ${invoiceData.client.email}`],
      ],
      startY: (doc as any).autoTable.previous.finalY + 90,
    });

    // Items Table
    const items = invoiceData.items.map(item => [
      item.description,
      item.quantity,
      item.price,
      item.total
    ]);

    (doc as any).autoTable({
      head: [['Description', 'Quantity', 'Price', 'Total']],
      body: items,
      startY: (doc as any).autoTable.previous.finalY + 10,
    });

    // Add totals in a table format on the right side
    const finalY = (doc as any).autoTable.previous.finalY + 10;
    (doc as any).autoTable({
      head: [['', '']],
      body: [
        ['Subtotal:', invoiceData.totals.subtotal],
        ['VAT:', `${invoiceData.totals.vat}%`],
        ['Total:', invoiceData.totals.total.toFixed(2)],
      ],
      startY: finalY,
      margin: { left: doc.internal.pageSize.getWidth() - 50 }, // Adjust the left margin to position it on the right side
      styles: {
        halign: 'right', // Align text to the right
        fillColor: [255, 255, 255], // White background
        textColor: [0, 0, 0], // Black text color
        fontStyle: 'bold',
      },
      tableWidth: 'wrap',
    });

    // Save the PDF
    doc.save('invoice.pdf');
  };

  const handleSaveInvoice = async () => {
    setLoading(true);

    // Fetch the total number of invoices to generate the next invoice number
    try {
      const response = await fetch('/api/invoice');
      const data = await response.json();
      const invoiceCount = data.invoices.length;
      setInvoiceData((prevData: InvoiceData) => ({
        ...prevData,
        invoiceNumber: (invoiceCount + 1).toString()
      }));
    } catch (error) {
      console.error("Error fetching invoice count:", error);
      setInvoiceData((prevData: InvoiceData) => ({
        ...prevData,
        invoiceNumber: ""
      }));
    }

    // Generate QR code only if the data is saved successfully
    const invoiceDataQR = {
      company_name: invoiceData.seller.name.trim(),
      tax_id: invoiceData.seller.vatNumber.trim(),
      invoice_date: new Date(invoiceData.invoiceDate).toISOString(),
      grand_total: invoiceData.totals.total.toFixed(2),
      tax_total: (invoiceData.totals.subtotal * (invoiceData.totals.vat / 100)).toFixed(2), // Calculate VAT amount
    };

    try {
      // TLV Encoding Function
      const encodeTLV = (tag: number, value: string): string => {
        const tagHex = tag.toString(16).padStart(2, '0'); // Tag as 1 byte
        const lengthHex = Buffer.byteLength(value, 'utf8').toString(16).padStart(2, '0'); // Length in UTF-8 bytes
        const valueHex = Buffer.from(value, 'utf8').toString('hex'); // UTF-8 encoded value
        return tagHex + lengthHex + valueHex;
      };

      // Construct TLV Data
      const tlvData =
        encodeTLV(1, invoiceDataQR.company_name) +
        encodeTLV(2, invoiceDataQR.tax_id) +
        encodeTLV(3, invoiceDataQR.invoice_date) +
        encodeTLV(4, invoiceDataQR.grand_total) +
        encodeTLV(5, invoiceDataQR.tax_total);

      // Convert TLV Data to Base64
      const base64TLV = Buffer.from(tlvData, 'hex').toString('base64');

      // Generate QR Code
      const qrCodeDataUrl = await QRCode.toDataURL(base64TLV);

      // Save the invoice data to the database
      try {
        const response = await fetch('/api/invoice', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ ...invoiceData, qrCodeDataUrl }),
        });

        if (!response.ok) {
          throw new Error('Failed to save invoice');
        }

        const result = await response.json();
        console.log('Invoice saved successfully:', result);

        // Set the QR code in the context
        setQRCode(qrCodeDataUrl);

        // Scroll smoothly to the end of the page
        window.scrollTo({
          top: document.body.scrollHeight,
          behavior: 'smooth'
        });

        // Append QR Code Image to DOM
        // let existingImg = document.getElementById('qrCodeImg');
        // if (!existingImg) {
        //   const img = document.createElement('img');
        //   img.id = 'qrCodeImg';
        //   img.src = qrCodeDataUrl;
        //   img.style.width = '300px';
        //   img.style.height = '300px';
        //   img.style.position = 'absolute';
        //   img.style.right = '20px';
        //   img.style.top = '120px';
        //   document.body.appendChild(img);
        // } else {
        //   (existingImg as HTMLImageElement).src = qrCodeDataUrl; // Update the existing QR code image
        // }

        // console.log('QR Code generated successfully:', base64TLV);
      } catch (err) {
        console.error('Error generating QR code:', err);
      }

    } catch (error) {
      console.error('Error saving invoice:', error);
    } finally {
      setLoading(false);
    }
  };



  return (
    <header className="sticky top-0 z-50 w-full border-b bg-white/95 backdrop-blur supports-[backdrop-filter]:bg-white/60 dark:bg-neutral-950/95 dark:supports-[backdrop-filter]:bg-neutral-950/60 px-5 rounded">
      <div className="container flex h-20 items-center">
        <Link href="/" className="flex items-center space-x-2">
          <FileText className="h-6 w-6" />
          <span className="font-bold">VAT Invoice Generator</span>
        </Link>
        <div className="hidden md:flex flex-1 items-center justify-end space-x-2">
          <Button variant="outline" size="sm" onClick={handleDownloadPDF}>
            <Download className="mr-2 h-4 w-4" />
            Download
          </Button>

          <Button variant="outline" size="sm" onClick={() => {
            // Reset QR code context
            setQRCode('');
            setSelectedInvoice(null);

            // Reload the page
            window.location.reload();
            // Scroll to the top of the page
            window.scrollTo({ top: 0 });
          }}>
            <Plus className="mr-2 h-4 w-4" />
            {/* TODO: Create a new invoice */}
            Create New
          </Button>

          <Button variant="outline" size="sm" onClick={() => setInvoiceModalOpen(true)}>
            <Eye className="mr-2 h-4 w-4" />
            {/* TODO: Get all the saved invoices from database */}
            View Saved
          </Button>

          <Button size="sm" onClick={handleSaveInvoice} disabled={loading}>
            <Calculator className="mr-2 h-4 w-4" />
            {loading ? <Loader2 /> : 'Generate Invoice'}
          </Button>
        </div>
      </div>
      <InvoiceSelectModal
        open={isInvoiceModalOpen}
        onOpenChange={setInvoiceModalOpen}
        onInvoiceSelect={handleInvoiceSelect}
      />
    </header>
  )
}

