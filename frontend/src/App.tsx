import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { LanguageProvider } from "@/contexts/LanguageContext";
import { MainLayout } from "@/components/MainLayout";
import { AuthGuard } from "@/components/AuthGuard";
 
// Page Imports
import Dashboard from "./pages/Dashboard";
import AddTransaction from "./pages/AddTransaction";
import Transactions from "./pages/Transactions";
import Budget from "./pages/Budget";
import Insights from "./pages/Insights";
import AIAssistant from "./pages/AIAssistant";
import Settings from "./pages/Settings";
import NotFound from "./pages/NotFound";
// --- 1. IMPORT THE NEW PROFILE PAGE ---
import Profile from "./pages/Profile";
import VerificationPage from './pages/VerificationPage';
const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <LanguageProvider>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
        
          <AuthGuard>
            <MainLayout>
              <Routes>
                <Route path="/" element={<Dashboard />} />
                <Route path="/add-transaction" element={<AddTransaction />} />

                {/* Route for the "Transactions" list page */}
                <Route path="/transactions" element={<Transactions />} />

                {/* Route for editing a transaction (handled inside TransactionsPage) */}
                <Route path="/transactions/edit/:id" element={<Transactions />} />
                <Route path="/budget" element={<Budget />} />
                <Route path="/insights" element={<Insights />} />
                <Route path="/ai-assistant" element={<AIAssistant />} />
                <Route path="/settings" element={<Settings />} />
                <Route path="/verify-email/:token" element={<VerificationPage />} />
                {/* --- 2. ADD THE ROUTE FOR THE PROFILE PAGE --- */}
                <Route path="/profile" element={<Profile />} />

                {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
                <Route path="*" element={<NotFound />} />
              </Routes>
            </MainLayout>
          </AuthGuard>
          
        </BrowserRouter>
      </TooltipProvider>
    </LanguageProvider>
  </QueryClientProvider>
);

export default App;