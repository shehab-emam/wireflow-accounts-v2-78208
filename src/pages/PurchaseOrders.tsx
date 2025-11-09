import React from 'react';
import PurchaseOrderForm from '@/components/inventory/PurchaseOrderForm';

const PurchaseOrders: React.FC = () => {
  return (
    <div className="min-h-screen bg-background">
      <PurchaseOrderForm />
    </div>
  );
};

export default PurchaseOrders;