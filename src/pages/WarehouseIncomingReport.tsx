import React from 'react';
import IncomingReport from '@/components/warehouse/IncomingReport';
import { useParams } from 'react-router-dom';

const WarehouseIncomingReport: React.FC = () => {
  const { type } = useParams<{ type: string }>();
  
  return (
    <IncomingReport warehouseTypeFilter={type} />
  );
};

export default WarehouseIncomingReport;
