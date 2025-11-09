import React from 'react';
import WarehouseTransactionForm from '@/components/warehouse/WarehouseTransactionForm';
import { useParams } from 'react-router-dom';

const WarehouseIncoming: React.FC = () => {
  const { type } = useParams<{ type: string }>();
  
  return (
    <WarehouseTransactionForm 
      transactionType="incoming"
      warehouseTypeFilter={type}
    />
  );
};

export default WarehouseIncoming;