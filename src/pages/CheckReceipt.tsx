import { CheckReceiptForm } from "@/components/treasury/CheckReceiptForm";
import { Header } from "@/components/layout/Header";
import { Sidebar } from "@/components/layout/Sidebar";
import { useState } from "react";

export default function CheckReceipt() {
  const [language, setLanguage] = useState<'ar' | 'en'>('ar');
  const [activeItem, setActiveItem] = useState('treasury');
  const [isDarkMode, setIsDarkMode] = useState(false);

  return (
    <div className="min-h-screen bg-background flex">
      <Sidebar 
        language={language} 
        activeItem={activeItem}
        onItemClick={setActiveItem}
      />
      <div className="flex-1">
        <Header 
          language={language} 
          onLanguageChange={setLanguage}
          isDarkMode={isDarkMode}
          onThemeToggle={() => setIsDarkMode(!isDarkMode)}
        />
        <main className="p-6">
          <CheckReceiptForm />
        </main>
      </div>
    </div>
  );
}