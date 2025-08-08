import React, { createContext, useContext, useState, useEffect } from "react";

export type Language = "en" | "kn";

interface LanguageContextType {
  language: Language;
  setLanguage: (language: Language) => void;
  t: (key: string) => string;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

// Translation dictionary
const translations: Record<Language, Record<string, string>> = {
  en: {
    // Navigation
    "dashboard": "Dashboard",
    "add_transaction": "Add Transaction",
    "transactions": "Transactions",
    "budget_manager": "Budget Manager",
    "insights": "Insights",
    "ai_assistant": "AI Assistant",
    "settings": "Settings",
    
    // Dashboard
    "welcome_back": "Welcome back",
    "total_income": "Total Income",
    "total_expenses": "Total Expenses",
    "total_investments": "Total Investments",
    "total_savings": "Total Savings",
    "this_month": "This Month",
    "recent_transactions": "Recent Transactions",
    "expense_breakdown": "Expense Breakdown",
    "income_trends": "Income Trends",
    
    // Transaction Types
    "income": "Income",
    "expense": "Expense",
    "investment": "Investment",
    "saving": "Saving",
    
    // Common
    "amount": "Amount",
    "category": "Category",
    "description": "Description",
    "date": "Date",
    "type": "Type",
    "add": "Add",
    "save": "Save",
    "cancel": "Cancel",
    "delete": "Delete",
    "edit": "Edit",
    "search": "Search",
    "filter": "Filter",
    "loading": "Loading...",
    
    // Categories
    "food": "Food",
    "transport": "Transport",
    "utilities": "Utilities",
    "entertainment": "Entertainment",
    "healthcare": "Healthcare",
    "shopping": "Shopping",
    "education": "Education",
    "business": "Business",
    "other": "Other",
  },
  kn: {
    // Navigation
    "dashboard": "ಡ್ಯಾಶ್‌ಬೋರ್ಡ್",
    "add_transaction": "ವ್ಯವಹಾರ ಸೇರಿಸಿ",
    "transactions": "ವ್ಯವಹಾರಗಳು",
    "budget_manager": "ಬಜೆಟ್ ನಿರ್ವಾಹಕ",
    "insights": "ಅಂತರ್ದೃಷ್ಟಿಗಳು",
    "ai_assistant": "AI ಸಹಾಯಕ",
    "settings": "ಸೆಟ್ಟಿಂಗ್‌ಗಳು",
    
    // Dashboard
    "welcome_back": "ಮರಳಿ ಸ್ವಾಗತ",
    "total_income": "ಒಟ್ಟು ಆದಾಯ",
    "total_expenses": "ಒಟ್ಟು ವೆಚ್ಚಗಳು",
    "total_investments": "ಒಟ್ಟು ಹೂಡಿಕೆಗಳು",
    "total_savings": "ಒಟ್ಟು ಉಳಿತಾಯಗಳು",
    "this_month": "ಈ ತಿಂಗಳು",
    "recent_transactions": "ಇತ್ತೀಚಿನ ವ್ಯವಹಾರಗಳು",
    "expense_breakdown": "ವೆಚ್ಚದ ವಿಭಜನೆ",
    "income_trends": "ಆದಾಯ ಪ್ರವೃತ್ತಿಗಳು",
    
    // Transaction Types
    "income": "ಆದಾಯ",
    "expense": "ವೆಚ್ಚ",
    "investment": "ಹೂಡಿಕೆ",
    "saving": "ಉಳಿತಾಯ",
    
    // Common
    "amount": "ಮೊತ್ತ",
    "category": "ವರ್ಗ",
    "description": "ವಿವರಣೆ",
    "date": "ದಿನಾಂಕ",
    "type": "ಪ್ರಕಾರ",
    "add": "ಸೇರಿಸಿ",
    "save": "ಉಳಿಸಿ",
    "cancel": "ರದ್ದುಗೊಳಿಸಿ",
    "delete": "ಅಳಿಸಿ",
    "edit": "ಸಂಪಾದಿಸಿ",
    "search": "ಹುಡುಕಿ",
    "filter": "ಫಿಲ್ಟರ್",
    "loading": "ಲೋಡ್ ಆಗುತ್ತಿದೆ...",
    
    // Categories
    "food": "ಆಹಾರ",
    "transport": "ಸಾರಿಗೆ",
    "utilities": "ಉಪಯೋಗಿತೆಗಳು",
    "entertainment": "ಮನರಂಜನೆ",
    "healthcare": "ಆರೋಗ್ಯ ಸೇವೆ",
    "shopping": "ಶಾಪಿಂಗ್",
    "education": "ಶಿಕ್ಷಣ",
    "business": "ವ್ಯಾಪಾರ",
    "other": "ಇತರೆ",
  },
};

export function LanguageProvider({ children }: { children: React.ReactNode }) {
  const [language, setLanguage] = useState<Language>(() => {
    const saved = localStorage.getItem("vendor-language");
    return (saved as Language) || "en";
  });

  useEffect(() => {
    localStorage.setItem("vendor-language", language);
  }, [language]);

  const t = (key: string): string => {
    return translations[language][key] || key;
  };

  return (
    <LanguageContext.Provider value={{ language, setLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  const context = useContext(LanguageContext);
  if (context === undefined) {
    throw new Error("useLanguage must be used within a LanguageProvider");
  }
  return context;
}