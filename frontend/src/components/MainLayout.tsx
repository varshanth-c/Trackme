// Import the UserNav component we created
import { UserNav } from "@/components/UserNav"; 
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/AppSidebar";
import { LanguageSelector } from "@/components/LanguageSelector";
import { useLanguage } from "@/contexts/LanguageContext";
import { Bell } from "lucide-react";
import { Button } from "@/components/ui/button";

interface MainLayoutProps {
  children: React.ReactNode;
}

export function MainLayout({ children }: MainLayoutProps) {
  const { language, setLanguage } = useLanguage();

  return (
    <SidebarProvider>
      <div className="min-h-screen flex w-full bg-background">
        <AppSidebar />
        
        <div className="flex-1 flex flex-col">
          {/* Top Header */}
          <header className="h-16 border-b bg-card flex items-center justify-between px-6">
            <div className="flex items-center gap-4">
              <SidebarTrigger className="lg:hidden" />
              {/* --- REMOVED SEARCH BAR --- */}
            </div>
            
            <div className="flex items-center gap-4">
              {/* Notifications Button */}
              <Button variant="ghost" size="icon" className="relative rounded-full">
                {/* <Bell className="w-5 h-5" /> */}
                {/* <span className="absolute top-1.5 right-1.5 flex h-2 w-2">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-destructive opacity-75"></span> */}
                    {/* <span className="relative inline-flex rounded-full h-2 w-2 bg-destructive"></span>
                </span> */}
              </Button>

              {/* Language Selector */}
              <LanguageSelector 
                currentLanguage={language}
                onLanguageChange={setLanguage}
              />
              
              {/* --- ADDED USERNAV PROFILE MENU --- */}
              {/* This component contains the Avatar, links to Profile/Settings, and the Logout option */}
              <UserNav />

              {/* --- REMOVED STANDALONE LOGOUT BUTTON --- */}
            </div>
          </header>

          {/* Main Content */}
          <main className="flex-1 p-4 md:p-6 lg:p-8 overflow-auto">
            {children}
          </main>
        </div>
      </div>
    </SidebarProvider>
  );
}