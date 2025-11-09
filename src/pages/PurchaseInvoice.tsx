import React from 'react';
import { PurchaseInvoiceForm } from '@/components/purchases/PurchaseInvoiceForm';

const PurchaseInvoice: React.FC = () => {
  return (
    <div className="min-h-screen bg-background">
      <PurchaseInvoiceForm />
    </div>
  );
};

export default PurchaseInvoice;