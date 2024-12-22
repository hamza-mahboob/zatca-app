'use client'

import { createContext, useContext, useState, ReactNode } from 'react';
import { InvoiceData } from '@/lib/utils';

interface QRCodeContextType {
  qrCode: string | null;
  setQRCode: (qrCode: string) => void;
  selectedInvoice: InvoiceData | null;
  setSelectedInvoice: (invoice: InvoiceData | null) => void;
}

const QRCodeContext = createContext<QRCodeContextType | undefined>(undefined);

export const QRCodeProvider = ({ children }: { children: ReactNode }) => {
  const [qrCode, setQRCode] = useState<string | null>(null);
  const [selectedInvoice, setSelectedInvoice] = useState<InvoiceData | null>(null);

  return (
    <QRCodeContext.Provider value={{ qrCode, setQRCode, selectedInvoice, setSelectedInvoice }}>
      {children}
    </QRCodeContext.Provider>
  );
};

export const useQRCode = () => {
  const context = useContext(QRCodeContext);
  if (!context) {
    throw new Error('useQRCode must be used within a QRCodeProvider');
  }
  return context;
};