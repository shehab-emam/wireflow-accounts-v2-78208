import React from 'react';
import { useParams } from 'react-router-dom';
import { QuotationForm } from '@/components/sales/QuotationForm';

const EditQuotation = () => {
  const { id } = useParams<{ id: string }>();
  
  return <QuotationForm quotationId={id} />;
};

export default EditQuotation;