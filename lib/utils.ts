import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"
import { Noto_Sans_Arabic } from 'next/font/google'; // Adjust the path as necessary

export const notoSansArabic = Noto_Sans_Arabic({
  subsets: ['arabic'], // Ensure the Arabic subset is loaded
  weight: ['100', '400', '700', '900'], // Add desired font weights
  display: 'swap', // Matches your desired CSS `font-display`
});

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export interface InvoiceItem {
  description: string
  quantity: number
  price: number
  total: number
}
export interface InvoiceData {
  invoiceNumber: string
  invoiceDate: string
  dueDate: string
  salesRep: string
  seller: {
    name: string
    country: string
    vatNumber: string
    address: string
    phone: string
    email: string
  }
  client: {
    name: string
    country: string
    vatNumber: string
    address: string
    phone: string
    email: string
  }
  items: InvoiceItem[]
  totals: {
    subtotal: number
    vat: number
    total: number
  }
  // @ts-nocheck
  qrCodeDataUrl?: any
}

