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
        <Routes>
         <Route path="/verify-email/:token" element={<VerificationPage />} />
          <AuthGuard>
            <MainLayout>
                <Route path="/" element={<Dashboard />} />
                <Route path="/add-transaction" element={<AddTransaction />} />

               
                <Route path="/transactions" element={<Transactions />} />

              
                <Route path="/transactions/edit/:id" element={<Transactions />} />
                <Route path="/budget" element={<Budget />} />
                <Route path="/insights" element={<Insights />} />
                <Route path="/ai-assistant" element={<AIAssistant />} />
                <Route path="/settings" element={<Settings />} />
                
                
                <Route path="/profile" element={<Profile />} />

                
                <Route path="*" element={<NotFound />} />
              
            </MainLayout>
          </AuthGuard>
          </Routes>
        </BrowserRouter>
      </TooltipProvider>
    </LanguageProvider>
  </QueryClientProvider>
);

export default App;