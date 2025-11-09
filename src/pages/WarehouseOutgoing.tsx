import React from 'react';
import WarehouseTransactionForm from '@/components/warehouse/WarehouseTransactionForm';
import { useParams } from 'react-router-dom';

const WarehouseOutgoing: React.FC = () => {
  const { type } = useParams<{ type: string }>();
  
  return (
    <WarehouseTransactionForm 
      transactionType="outgoing"
      warehouseTypeFilter={type}
    />
  );
};

export default WarehouseOutgoing;