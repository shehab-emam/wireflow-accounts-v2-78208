import React from 'react';
import { PurchaseReturnForm } from '@/components/purchases/PurchaseReturnForm';

const PurchaseReturn: React.FC = () => {
  return (
    <div className="min-h-screen bg-background">
      <PurchaseReturnForm />
    </div>
  );
};

export default PurchaseReturn;