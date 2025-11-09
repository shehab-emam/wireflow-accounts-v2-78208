import React, { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { Package, Plus, Edit, Settings, ChevronDown } from 'lucide-react';
import AddProductForm from './AddProductForm';
import EditDeleteProducts from './EditDeleteProducts';
import ProductSettings from './ProductSettings';

const ProductsDropdownMenu: React.FC = () => {
  const [activeView, setActiveView] = useState<'add' | 'addMaterials' | 'edit' | 'settings'>('add');
  const [selectedOption, setSelectedOption] = useState('إضافة الأصناف');

  const menuOptions = [
    { value: 'add', label: 'إضافة الأصناف', icon: Plus },
    { value: 'addMaterials', label: 'إضافة الخامات والمستلزمات', icon: Plus },
    { value: 'edit', label: 'تعديل وحذف الأصناف', icon: Edit },
    { value: 'settings', label: 'إعدادات أولية للأصناف', icon: Settings }
  ];

  const handleOptionSelect = (value: 'add' | 'addMaterials' | 'edit' | 'settings', label: string) => {
    setActiveView(value);
    setSelectedOption(label);
  };

  return (
    <div className="container mx-auto p-6 rtl" dir="rtl">
      <Card className="accounting-card">
        <CardContent className="p-6">
          <div className="flex items-center gap-3 mb-6">
            <Package className="h-6 w-6 text-primary" />
            <h1 className="text-2xl font-bold text-foreground">إدارة الأصناف والمنتجات</h1>
          </div>

          {/* Dropdown Menu */}
          <div className="mb-6">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" className="w-full justify-between h-12">
                  <span className="flex items-center gap-2">
                    {menuOptions.find(opt => opt.value === activeView)?.icon && 
                      React.createElement(menuOptions.find(opt => opt.value === activeView)!.icon, { className: "h-4 w-4" })
                    }
                    {selectedOption}
                  </span>
                  <ChevronDown className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent className="w-full min-w-[400px]" align="start">
                {menuOptions.map((option) => (
                  <DropdownMenuItem
                    key={option.value}
                    onClick={() => handleOptionSelect(option.value as 'add' | 'addMaterials' | 'edit' | 'settings', option.label)}
                    className="flex items-center gap-2 p-3 cursor-pointer"
                  >
                    <option.icon className="h-4 w-4" />
                    {option.label}
                  </DropdownMenuItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>
          </div>

          {/* Action Buttons */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
            <Button
              variant={activeView === 'add' ? 'default' : 'outline'}
              onClick={() => handleOptionSelect('add', 'إضافة الأصناف')}
              className="flex items-center gap-2 h-12"
            >
              <Plus className="h-4 w-4" />
              إضافة الأصناف
            </Button>
            <Button
              variant={activeView === 'addMaterials' ? 'default' : 'outline'}
              onClick={() => handleOptionSelect('addMaterials', 'إضافة الخامات والمستلزمات')}
              className="flex items-center gap-2 h-12"
            >
              <Plus className="h-4 w-4" />
              إضافة الخامات والمستلزمات
            </Button>
            <Button
              variant={activeView === 'edit' ? 'default' : 'outline'}
              onClick={() => handleOptionSelect('edit', 'تعديل وحذف الأصناف')}
              className="flex items-center gap-2 h-12"
            >
              <Edit className="h-4 w-4" />
              تعديل وحذف الأصناف
            </Button>
            <Button
              variant={activeView === 'settings' ? 'default' : 'outline'}
              onClick={() => handleOptionSelect('settings', 'إعدادات أولية للأصناف')}
              className="flex items-center gap-2 h-12"
            >
              <Settings className="h-4 w-4" />
              إعدادات أولية
            </Button>
          </div>

          {/* Content based on active view */}
          <div className="space-y-6">
            {activeView === 'add' && (
              <AddProductForm onProductAdded={() => {
                // Optionally refresh data or show success message
              }} />
            )}

            {activeView === 'addMaterials' && (
              <AddProductForm onProductAdded={() => {
                // Optionally refresh data or show success message
              }} />
            )}

            {activeView === 'edit' && (
              <EditDeleteProducts />
            )}

            {activeView === 'settings' && (
              <ProductSettings />
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default ProductsDropdownMenu;