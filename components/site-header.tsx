// @ts-nocheck
"use client";

import Link from "next/link";
import {
  FileText,
  Download,
  Plus,
  Eye,
  Calculator,
  Loader2,
} from "lucide-react";
import jsPDF from "jspdf";
import "jspdf-autotable";
import html2canvas from "html2canvas";
import { useState } from "react";
import QRCode from "qrcode";
import { Buffer } from "buffer"; // Ensure compatibility for Buffer in Next.js
import { Button } from "@/components/ui/button";
import { InvoiceData } from "@/lib/utils";
import { useQRCode } from "../context/qrCodeContext";
import { InvoiceSelectModal } from "./invoice-select-modal";
// import fontData from '../lib/NotoSansArabic_Condensed-ExtraLight.ttf';

type HeaderProps = {
  invoiceData: InvoiceData;
  setInvoiceData: (data: any) => void;
};

const keyMappings = {
  name: "Name",
  country: "Country",
  vatNumber: "VAT Number",
  address: "Address",
  city: "City",
  phone: "Phone",
  email: "Email",
};

export function SiteHeader({ invoiceData, setInvoiceData }: HeaderProps) {
  const { setQRCode, setSelectedInvoice, qrCode, includeVAT } = useQRCode();

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

    const invoiceContainer = document.createElement("div");
    // const itemsAndTotalContainer = document.createElement("div");
    Object.assign(invoiceContainer.style, {
      width: "800px",
      padding: "40px 20px",
      margin: "20px auto",
      backgroundColor: "#ffffff",
      fontFamily: "Arial, sans-serif",
      fontSize: "13px",
    });

    // Add logo
    const logoContainer = document.createElement("div");
    logoContainer.style.marginBottom = "30px";

    const logo = new Image();
    logo.src = "/logo_invoice.jpg";
    logo.style.width = "100%";
    logo.style.objectFit = "contain";

    logoContainer.appendChild(logo);
    invoiceContainer.appendChild(logoContainer);
    // itemsAndTotalContainer.appendChild(invoiceContainer);

    // Add invoice details
    //   invoiceContainer.innerHTML += `
    //   <div style="display: flex; width: 100%;">
    //     <div style="width: 50%;">
    //       <table style="width: 100%; border-collapse: collapse;">
    //         <tr>
    //           <td style="padding: 8px; border: 1px solid #d3d3d3; width: 50%; background-color: #f8f8f8;">رقم الفاتورة | Invoice No:</td>
    //           <td style="padding: 8px; border: 1px solid #d3d3d3; width: 50%;">${
    //             invoiceData.invoiceNumber
    //           }</td>
    //         </tr>
    //         <tr>
    //           <td style="padding: 8px; border: 1px solid #d3d3d3; width: 50%; background-color: #f8f8f8;">تاريخ الفاتورة | Invoice Date:</td>
    //           <td style="padding: 8px; border: 1px solid #d3d3d3; width: 50%;">${
    //             invoiceData.invoiceDate
    //           }</td>
    //         </tr>
    //         <tr>
    //           <td style="padding: 8px; border: 1px solid #d3d3d3; width: 50%; background-color: #f8f8f8;">تاريخ الاستحقاق | Due Date:</td>
    //           <td style="padding: 8px; border: 1px solid #d3d3d3; width: 50%;">${
    //             invoiceData.dueDate
    //           }</td>
    //         </tr>
    //         <tr>
    //           <td style="padding: 8px; border: 1px solid #d3d3d3; width: 50%; background-color: #f8f8f8;">ممثل المبيعات | Sales Rep:</td>
    //           <td style="padding: 8px; border: 1px solid #d3d3d3; width: 50%;">${
    //             invoiceData.salesRep
    //           }</td>
    //         </tr>
    //       </table>
    //     </div>

    //     <div style="width: 50%; display: flex; justify-content: center; align-items: center;">
    //       <h1 style="font-size: 34px; margin: 0; font-weight: bold; text-align: center;">فاتورة ضريبية <br> VAT INVOICE</h1>
    //     </div>
    //   </div>

    //   <table style="width: 100%; border-collapse: collapse; margin-bottom: 30px; margin-top: 30px">
    //   <tr>
    //     <th style="width: 50%; padding: 15px; border: 1px solid #d3d3d3; background-color: #f8f8f8; text-align: center;">البائع | Seller</th>
    //     <th style="width: 50%; padding: 15px; border: 1px solid #d3d3d3; background-color: #f8f8f8; text-align: center;">العميل | Client</th>
    //   </tr>
    //   <tr>
    //     <td style="width: 50%; padding: 0; border: 1px solid #d3d3d3;">
    //       <table style="width: 100%; border-collapse: collapse;">
    //         ${Object.entries(invoiceData.seller)
    //           .map(
    //             ([key, value], index, array) => `
    //             <tr style="height: 55px;">
    //               <td style="padding: 8px; border-right: 1px solid #d3d3d3; width: 30%; vertical-align: middle; background-color: #f8f8f8;">
    //                 <strong>${keyMappings[key] || key}:</strong>
    //               </td>
    //               <td style="padding: 8px; width: 70%; vertical-align: middle;">${value}</td>
    //             </tr>
    //             ${
    //               index !== array.length - 1
    //                 ? '<tr><td colspan="2" style="border-bottom: 1px solid #d3d3d3;"></td></tr>'
    //                 : ""
    //             }
    //           `
    //           )
    //           .join("")}
    //       </table>
    //     </td>
    //     <td style="width: 50%; padding: 0; border: 1px solid #d3d3d3;">
    //       <table style="width: 100%; border-collapse: collapse;">
    //         ${Object.entries(invoiceData.client)
    //           .map(
    //             ([key, value], index, array) => `
    //             <tr style="height: 55px;">
    //               <td style="padding: 8px; border-right: 1px solid #d3d3d3; width: 30%; vertical-align: middle; background-color: #f8f8f8;"><strong>${
    //                 keyMappings[key] || key
    //               }:</strong></td>
    //               <td style="padding: 8px; width: 70%; vertical-align: middle;">${value}</td>
    //             </tr>
    //             ${
    //               index !== array.length - 1
    //                 ? '<tr><td colspan="2" style="border-bottom: 1px solid #d3d3d3;"></td></tr>'
    //                 : ""
    //             }
    //           `
    //           )
    //           .join("")}
    //       </table>
    //     </td>
    //   </tr>
    // </table>

    //   <table style="width: 100%; border-collapse: collapse; margin-bottom: 30px;">
    //     <thead>
    //       <tr>
    //         <th style="border: 1px solid #d3d3d3; padding: 12px; background-color: #f8f8f8;">الوصف | Description</th>
    //         <th style="border: 1px solid #d3d3d3; padding: 12px; background-color: #f8f8f8;">الكمية | Quantity</th>
    //         <th style="border: 1px solid #d3d3d3; padding: 12px; background-color: #f8f8f8;">السعر | Price</th>
    //         <th style="border: 1px solid #d3d3d3; padding: 12px; background-color: #f8f8f8;">المجموع | Total</th>
    //       </tr>
    //     </thead>
    //     <tbody>
    //       ${invoiceData.items
    //         .map(
    //           (item, index) => `
    //           <tr>
    //             <td style="border: 1px solid #d3d3d3; padding: 12px;">${item.description}</td>
    //             <td style="border: 1px solid #d3d3d3; padding: 12px; text-align: center;">${item.quantity}</td>
    //             <td style="border: 1px solid #d3d3d3; padding: 12px; text-align: right;">${item.price}</td>
    //             <td style="border: 1px solid #d3d3d3; padding: 12px; text-align: right;">${item.total}</td>
    //           </tr>`
    //         )
    //         .join("")}
    //     </tbody>
    //   </table>

    //    <div style="display: flex; justify-content: space-between; align-items: start; margin-bottom: 20px;">
    //     <div style="width: 200px;"> <!-- QR code container -->
    //       <img src=${qrCode} style="width: 200px; height: 200px;">
    //     </div>
    //     ${
    //       includeVAT
    //         ? `<table style="width: 50%; border-collapse: collapse;">
    //       <tr>
    //         <td style="padding: 8px; border: 1px solid #d3d3d3;">المجموع بدون الضريبة | Total Without VAT</td>
    //         <td style="padding: 8px; border: 1px solid #d3d3d3; text-align: right;">${invoiceData.totals.subtotal.toFixed(
    //           2
    //         )} SAR</td>
    //       </tr>
    //       <tr>
    //         <td style="padding: 8px; border: 1px solid #d3d3d3;">ضريبة القيمة المضافة | VAT</td>
    //         <td style="padding: 8px; border: 1px solid #d3d3d3; text-align: right;">${
    //           invoiceData.totals.vat
    //         }%</td>
    //       </tr>
    //       <tr>
    //         <td style="padding: 8px; border: 1px solid #d3d3d3;">المجموع شامل الضريبة | Total with VAT</td>
    //         <td style="padding: 8px; border: 1px solid #d3d3d3; text-align: right;">${invoiceData.totals.total.toFixed(
    //           2
    //         )} SAR</td>
    //       </tr>
    //     </table>`
    //         : `<table style="width: 50%; border-collapse: collapse;">
    //         <tr>
    //         <td style="padding: 8px; border: 1px solid #d3d3d3;">المجموع بدون الضريبة | Total Without VAT</td>
    //         <td style="padding: 8px; border: 1px solid #d3d3d3; text-align: right;">${invoiceData.totals.subtotal} SAR</td>
    //       </tr>
    //       </table>
    //       `
    //     }
    //   </div>
    //   `;

    // Seller details

    const sellerDetails = `
      <table style="width: 100%; border-collapse: collapse;">
        ${Object.entries(invoiceData.seller)
          .map(
            ([key, value], index, array) => `
            <tr style="height: 55px;">
              <td style="padding: 8px; border-right: 1px solid #d3d3d3; width: 30%; vertical-align: middle; background-color: #f8f8f8;">
                <strong>${keyMappings[key] || key}:</strong>
              </td>
              <td style="padding: 8px; width: 70%; vertical-align: middle;">${value}</td>
            </tr>
            ${
              index !== array.length - 1
                ? '<tr><td colspan="2" style="border-bottom: 1px solid #d3d3d3;"></td></tr>'
                : ""
            }
          `
          )
          .join("")}
      </table>
      `;

    // Client details
    const clientDetails = `
      <table style="width: 100%; border-collapse: collapse;">
        ${Object.entries(invoiceData.client)
          .map(
            ([key, value], index, array) => `
            <tr style="height: 55px;">
              <td style="padding: 8px; border-right: 1px solid #d3d3d3; width: 30%; vertical-align: middle; background-color: #f8f8f8;">
                <strong>${keyMappings[key] || key}:</strong>
              </td>
              <td style="padding: 8px; width: 70%; vertical-align: middle;">${value}</td>
            </tr>
            ${
              index !== array.length - 1
                ? '<tr><td colspan="2" style="border-bottom: 1px solid #d3d3d3;"></td></tr>'
                : ""
            }
          `
          )
          .join("")}
      </table>
      `;

    // Items table
    const itemsTable = `
      <table style="width: 100%; border-collapse: collapse;">
        <thead>
          <tr>
            <th style="border: 1px solid #d3d3d3; padding: 12px; background-color: #f8f8f8;">الوصف | Description</th>
            <th style="border: 1px solid #d3d3d3; padding: 12px; background-color: #f8f8f8;">الكمية | Quantity</th>
            <th style="border: 1px solid #d3d3d3; padding: 12px; background-color: #f8f8f8;">السعر | Price</th>
            <th style="border: 1px solid #d3d3d3; padding: 12px; background-color: #f8f8f8;">المجموع | Total</th>
          </tr>
        </thead>
        <tbody>
          ${invoiceData.items
            .map(
              (item) => `
              <tr>
                <td style="border: 1px solid #d3d3d3; padding: 12px;">${item.description}</td>
                <td style="border: 1px solid #d3d3d3; padding: 12px; text-align: center;">${item.quantity}</td>
                <td style="border: 1px solid #d3d3d3; padding: 12px; text-align: right;">${item.price}</td>
                <td style="border: 1px solid #d3d3d3; padding: 12px; text-align: right;">${item.total}</td>
              </tr>`
            )
            .join("")}
        </tbody>
      </table>
      `;

    // Total calculations table (VAT included or not)
    const totalsTable = includeVAT
      ? `
        <table style="width: 50%; border-collapse: collapse;">
          <tr>
            <td style="padding: 8px; border: 1px solid #d3d3d3;">المجموع بدون الضريبة | Total Without VAT</td>
            <td style="padding: 8px; border: 1px solid #d3d3d3; text-align: right;">${invoiceData.totals.subtotal.toFixed(
              2
            )} SAR</td>
          </tr>
          <tr>
            <td style="padding: 8px; border: 1px solid #d3d3d3;">ضريبة القيمة المضافة | VAT</td>
            <td style="padding: 8px; border: 1px solid #d3d3d3; text-align: right;">${
              invoiceData.totals.vat
            }%</td>
          </tr>
          <tr>
            <td style="padding: 8px; border: 1px solid #d3d3d3;">المجموع شامل الضريبة | Total with VAT</td>
            <td style="padding: 8px; border: 1px solid #d3d3d3; text-align: right; font-weight: bold;">${invoiceData.totals.total.toFixed(
              2
            )} SAR</td>
          </tr>
        </table>
      `
      : `
        <table style="width: 50%; border-collapse: collapse;">
          <tr>
            <td style="padding: 8px; border: 1px solid #d3d3d3;">المجموع بدون الضريبة | Total Without VAT</td>
            <td style="padding: 8px; border: 1px solid #d3d3d3; text-align: right;">${invoiceData.totals.subtotal} SAR</td>
          </tr>
        </table>
      `;

    // QR code container
    const qrCodeContainer = `
      <div style="width: 170px;"> 
        <img src="${qrCode}" style="width: 170px; height: 170px;">
      </div>
      `;

    // Invoice details (header)
    const invoiceHeader = `
      <div style="display: flex; width: 100%;">
        <div style="width: 50%;">
          <table style="width: 100%; border-collapse: collapse;">
            <tr>
              <td style="padding: 8px; border: 1px solid #d3d3d3; width: 50%; background-color: #f8f8f8;">رقم الفاتورة | Invoice No:</td>
              <td style="padding: 8px; border: 1px solid #d3d3d3; width: 50%;">${invoiceData.invoiceNumber}</td>
            </tr>
            <tr>
              <td style="padding: 8px; border: 1px solid #d3d3d3; width: 50%; background-color: #f8f8f8;">تاريخ الفاتورة | Invoice Date:</td>
              <td style="padding: 8px; border: 1px solid #d3d3d3; width: 50%;">${invoiceData.invoiceDate}</td>
            </tr>
            <tr>
              <td style="padding: 8px; border: 1px solid #d3d3d3; width: 50%; background-color: #f8f8f8;">تاريخ الاستحقاق | Due Date:</td>
              <td style="padding: 8px; border: 1px solid #d3d3d3; width: 50%;">${invoiceData.dueDate}</td>
            </tr>
            <tr>
              <td style="padding: 8px; border: 1px solid #d3d3d3; width: 50%; background-color: #f8f8f8;">ممثل المبيعات | Sales Rep:</td>
              <td style="padding: 8px; border: 1px solid #d3d3d3; width: 50%;">${invoiceData.salesRep}</td>
            </tr>
          </table>
        </div>
        
        <div style="width: 50%; display: flex; justify-content: center; align-items: center;">
          <h1 style="font-size: 34px; margin: 0; font-weight: bold; text-align: center;">فاتورة ضريبية <br> VAT INVOICE</h1>
        </div>
      </div>
      `;

    // Final result
    const invoiceInitial = `
            ${invoiceHeader}
            <table style="width: 100%; border-collapse: collapse; margin-top: 30px">
              <tr>
                <th style="width: 50%; padding: 15px; border: 1px solid #d3d3d3; background-color: #f8f8f8; text-align: center;">البائع | Seller</th>
                <th style="width: 50%; padding: 15px; border: 1px solid #d3d3d3; background-color: #f8f8f8; text-align: center;">العميل | Client</th>
              </tr>
              <tr>
                <td style="width: 50%; padding: 0; border: 1px solid #d3d3d3;">${sellerDetails}</td>
                <td style="width: 50%; padding: 0; border: 1px solid #d3d3d3;">${clientDetails}</td>
              </tr>
            </table>
      `;

    const invoiceItems = `${itemsTable}`;

    const invoiceTotal = `
              <div style="display: flex; justify-content: space-between; align-items: start;">
                ${qrCodeContainer}
                ${totalsTable}
              </div>
            `;

    // if (invoiceData.items.length > 1)
    invoiceContainer.innerHTML += invoiceInitial;
    // else invoiceContainer.innerHTML += invoiceInitial + invoiceItems;

    // Temporarily append to body for rendering
    document.body.appendChild(invoiceContainer);

    try {
      let yPosition = 0; // Current position on the page
      const pageHeight = doc.internal.pageSize.getHeight();
      const pageWidth = doc.internal.pageSize.getWidth();

      // Add the header (client/seller details)
      let canvasInvoice = await html2canvas(invoiceContainer, { scale: 2 });
      const imgDataInvoice = canvasInvoice.toDataURL("image/png");
      let imgHeight = (canvasInvoice.height * pageWidth) / canvasInvoice.width;
      doc.addImage(imgDataInvoice, "PNG", 0, yPosition, pageWidth, imgHeight);
      yPosition += imgHeight - 10;

      // Split items into chunks for pagination
      const items = invoiceData.items;
      const firstPageItems = items.slice(0, 5);
      const remainingItems = items.slice(5);
      const itemChunks = chunkArray(remainingItems, 20);

      // Helper function to render tables
      const renderTableToCanvas = async (tableHTML) => {
        invoiceContainer.innerHTML = tableHTML;
        return await html2canvas(invoiceContainer, { scale: 2 });
      };

      // Add the first two items to the same page as the header
      if (firstPageItems.length > 0) {
        const firstTableHTML = generateTableHTML(firstPageItems);
        canvasInvoice = await renderTableToCanvas(firstTableHTML);
        const imgDataFirstTable = canvasInvoice.toDataURL("image/png");
        imgHeight = (canvasInvoice.height * pageWidth) / canvasInvoice.width;

        if (yPosition + imgHeight > pageHeight) {
          doc.addPage();
          yPosition = 0;
        }

        doc.addImage(
          imgDataFirstTable,
          "PNG",
          0,
          yPosition,
          pageWidth,
          imgHeight
        );
        yPosition += imgHeight;
      }

      // Add remaining items with pagination
      for (const chunk of itemChunks) {
        const tableHTML = generateTableHTML(chunk);
        canvasInvoice = await renderTableToCanvas(tableHTML);
        const imgDataChunk = canvasInvoice.toDataURL("image/png");
        imgHeight = (canvasInvoice.height * pageWidth) / canvasInvoice.width;

        doc.addPage(); // Start a new page for each chunk
        yPosition = 0;
        doc.addImage(imgDataChunk, "PNG", 0, yPosition, pageWidth, imgHeight);
        yPosition += imgHeight;
      }

      // Add the invoice total
      canvasInvoice = await renderTableToCanvas(invoiceTotal);
      const imgDataTotal = canvasInvoice.toDataURL("image/png");
      imgHeight = (canvasInvoice.height * pageWidth) / canvasInvoice.width;

      if (yPosition + imgHeight > pageHeight + 20) {
        doc.addPage();
        yPosition = 0;
      }
      doc.addImage(imgDataTotal, "PNG", 0, yPosition, pageWidth, imgHeight);

      // Save the PDF
      doc.save(`invoice_${invoiceData.invoiceNumber}.pdf`);
    } finally {
      document.body.removeChild(invoiceContainer);
    }

    /**
     * Helper function to split an array into chunks of a specified size.
     */
    function chunkArray(array, chunkSize) {
      const chunks = [];
      for (let i = 0; i < array.length; i += chunkSize) {
        chunks.push(array.slice(i, i + chunkSize));
      }
      return chunks;
    }

    /**
     * Generate HTML for a table with the given items.
     */
    function generateTableHTML(items) {
      return `
        <table style="width: 100%; border-collapse: collapse;">
          <thead>
            <tr>
              <th style="border: 1px solid #d3d3d3; padding: 8px; background-color: #f8f8f8;">الوصف | Description</th>
              <th style="border: 1px solid #d3d3d3; padding: 8px; background-color: #f8f8f8;">الكمية | Quantity</th>
              <th style="border: 1px solid #d3d3d3; padding: 8px; background-color: #f8f8f8;">السعر | Price</th>
              <th style="border: 1px solid #d3d3d3; padding: 8px; background-color: #f8f8f8;">المجموع | Total</th>
            </tr>
          </thead>
          <tbody>
            ${items
              .map(
                (item) => `
                <tr>
                  <td style="border: 1px solid #d3d3d3; padding: 8px;">${item.description}</td>
                  <td style="border: 1px solid #d3d3d3; padding: 8px; text-align: center;">${item.quantity}</td>
                  <td style="border: 1px solid #d3d3d3; padding: 8px; text-align: right;">${item.price}</td>
                  <td style="border: 1px solid #d3d3d3; padding: 8px; text-align: right;">${item.total}</td>
                </tr>`
              )
              .join("")}
          </tbody>
        </table>
      `;
    }
  };

  // const handleDownloadPDF = async () => {
  //   // Create new PDF document
  //   const doc = new jsPDF();

  //   // Load and add the font to the virtual file system
  //   try {
  //     // Read the font file
  //     const fontBase64 = fontData;

  //     // Add to virtual file system
  //     doc.addFileToVFS('NotoSansArabic.ttf', fontBase64);

  //     // Now add the font
  //     doc.addFont('NotoSansArabic.ttf', 'NotoSansArabic', 'normal');

  //   } catch (error) {
  //     console.error('Error loading font:', error);
  //     // Fallback to standard font if Arabic font loading fails
  //     doc.setFont('helvetica', 'normal');
  //   }

  //   // Function to write bilingual text with fallback
  //   const writeBilingualText = (enText: string, arText: string, x: number, y: number, align: 'left' | 'right' = 'left') => {
  //     // English text
  //     doc.setFont('helvetica', 'normal');
  //     doc.text(enText, x, y, { align });

  //     try {
  //       // Arabic text
  //       doc.setFont('NotoSansArabic', 'normal');
  //       const arX = align === 'right' ? doc.internal.pageSize.getWidth() - x : x;
  //       doc.text(arText, arX, y + 5, { align });
  //     } catch (error) {
  //       console.warn('Error rendering Arabic text:', error);
  //       // Fallback to rendering Arabic in helvetica if there's an error
  //       doc.setFont('helvetica', 'normal');
  //       const arX = align === 'right' ? doc.internal.pageSize.getWidth() - x : x;
  //       doc.text(arText, arX, y + 5, { align });
  //     }
  //   };

  //   // Rest of your PDF generation code remains the same...

  //   // Add logos at the top
  //   const lhfLogo = 'path_to_lhf_logo.png';
  //   const jamjoomLogo = 'path_to_jamjoom_logo.png';

  //   doc.addImage(lhfLogo, 'PNG', 15, 15, 40, 20);
  //   doc.addImage(jamjoomLogo, 'PNG', doc.internal.pageSize.getWidth() - 55, 15, 40, 20);

  //   // Add VAT Invoice heading
  //   doc.setFontSize(24);
  //   doc.setTextColor(0, 0, 0);
  //   writeBilingualText(
  //     'VAT INVOICE',
  //     'فاتورة ضريبية',
  //     doc.internal.pageSize.getWidth() - 55,
  //     50,
  //     'right'
  //   );

  //   // Save the PDF
  //   doc.save('invoice.pdf');
  // };

  const handleSaveInvoice = async () => {
    setLoading(true);

    // Fetch the total number of invoices to generate the next invoice number
    try {
      const response = await fetch("/api/invoice");
      const data = await response.json();
      const invoiceCount = data.invoices.length;
      setInvoiceData((prevData: InvoiceData) => ({
        ...prevData,
        invoiceNumber: (invoiceCount + 1).toString(),
      }));
    } catch (error) {
      console.error("Error fetching invoice count:", error);
      setInvoiceData((prevData: InvoiceData) => ({
        ...prevData,
        invoiceNumber: "",
      }));
    }

    // Generate QR code only if the data is saved successfully
    const invoiceDataQR = {
      company_name: invoiceData.seller.name.trim(),
      tax_id: invoiceData.seller.vatNumber.trim(),
      invoice_date: new Date(invoiceData.invoiceDate).toISOString(),
      grand_total: invoiceData.totals.total.toFixed(2),
      tax_total: (
        invoiceData.totals.subtotal *
        (invoiceData.totals.vat / 100)
      ).toFixed(2), // Calculate VAT amount
    };

    try {
      // TLV Encoding Function
      const encodeTLV = (tag: number, value: string): string => {
        const tagHex = tag.toString(16).padStart(2, "0"); // Tag as 1 byte
        const lengthHex = Buffer.byteLength(value, "utf8")
          .toString(16)
          .padStart(2, "0"); // Length in UTF-8 bytes
        const valueHex = Buffer.from(value, "utf8").toString("hex"); // UTF-8 encoded value
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
      const base64TLV = Buffer.from(tlvData, "hex").toString("base64");

      // Generate QR Code
      const qrCodeDataUrl = await QRCode.toDataURL(base64TLV);

      // Save the invoice data to the database
      try {
        const response = await fetch("/api/invoice", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ ...invoiceData, qrCodeDataUrl }),
        });

        if (!response.ok) {
          throw new Error("Failed to save invoice");
        }

        const result = await response.json();
        console.log("Invoice saved successfully:", result);

        // Set the QR code in the context
        setQRCode(qrCodeDataUrl);

        // Scroll smoothly to the end of the page
        window.scrollTo({
          top: document.body.scrollHeight,
          behavior: "smooth",
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
        console.error("Error generating QR code:", err);
      }
    } catch (error) {
      console.error("Error saving invoice:", error);
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

          <Button
            variant="outline"
            size="sm"
            onClick={() => {
              // Reset QR code context
              setQRCode("");
              setSelectedInvoice(null);

              // Reload the page
              window.location.reload();
              // Scroll to the top of the page
              window.scrollTo({ top: 0 });
            }}
          >
            <Plus className="mr-2 h-4 w-4" />
            Create New
          </Button>

          <Button
            variant="outline"
            size="sm"
            onClick={() => setInvoiceModalOpen(true)}
          >
            <Eye className="mr-2 h-4 w-4" />
            View Saved
          </Button>

          <Button size="sm" onClick={handleSaveInvoice} disabled={loading}>
            <Calculator className="mr-2 h-4 w-4" />
            {loading ? <Loader2 /> : "Generate Invoice"}
          </Button>
        </div>
      </div>
      <InvoiceSelectModal
        open={isInvoiceModalOpen}
        onOpenChange={setInvoiceModalOpen}
        onInvoiceSelect={handleInvoiceSelect}
      />
    </header>
  );
}
