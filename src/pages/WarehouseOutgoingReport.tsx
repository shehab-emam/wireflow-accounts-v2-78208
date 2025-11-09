import React from 'react';
import OutgoingReport from '@/components/warehouse/OutgoingReport';
import { useParams } from 'react-router-dom';

const WarehouseOutgoingReport: React.FC = () => {
  const { type } = useParams<{ type: string }>();
  
  return (
    <OutgoingReport warehouseTypeFilter={type} />
  );
};

export default WarehouseOutgoingReport;
