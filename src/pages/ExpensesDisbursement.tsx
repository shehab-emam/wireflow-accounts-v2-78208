import { ExpensesDisbursementForm } from "@/components/treasury/ExpensesDisbursementForm";
import { Header } from "@/components/layout/Header";
import { Sidebar } from "@/components/layout/Sidebar";
import { useState } from "react";

export default function ExpensesDisbursement() {
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
          <ExpensesDisbursementForm />
        </main>
      </div>
    </div>
  );
}