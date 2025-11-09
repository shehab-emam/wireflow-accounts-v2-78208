import React, { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import AddCustomerForm from '@/components/customers/AddCustomerForm';
import EditDeleteCustomers from '@/components/customers/EditDeleteCustomers';
import CustomerSettings from '@/components/customers/CustomerSettings';

const Customers: React.FC = () => {
  return (
    <div className="container mx-auto p-6 space-y-6">
      <h1 className="text-3xl font-bold text-right">إدارة العملاء والموردين</h1>
      
      <Tabs defaultValue="add" className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="add" className="text-right">إضافة عميل جديد</TabsTrigger>
          <TabsTrigger value="manage" className="text-right">تعديل وحذف العملاء</TabsTrigger>
          <TabsTrigger value="settings" className="text-right">الإعدادات الأولية</TabsTrigger>
        </TabsList>
        
        <TabsContent value="add" className="space-y-6">
          <AddCustomerForm />
        </TabsContent>
        
        <TabsContent value="manage" className="space-y-6">
          <EditDeleteCustomers />
        </TabsContent>
        
        <TabsContent value="settings" className="space-y-6">
          <CustomerSettings />
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default Customers;