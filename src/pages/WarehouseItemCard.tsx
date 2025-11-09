import React from 'react';
import ItemCardReport from '@/components/warehouse/ItemCardReport';
import { useParams } from 'react-router-dom';

const WarehouseItemCard: React.FC = () => {
  const { type } = useParams<{ type: string }>();
  
  return (
    <ItemCardReport warehouseTypeFilter={type} />
  );
};

export default WarehouseItemCard;