import { useState, useEffect } from "react";
import { useLanguage } from "@/contexts/LanguageContext";

// UI Components
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Separator } from "@/components/ui/separator";

// Icons
import { Palette, BrainCircuit, IndianRupee } from "lucide-react";

export default function Settings() {
  const { t } = useLanguage();

  // ✅ FIX: Initialize state from localStorage to remember the user's choice.
  // This function runs only once when the component first loads.
  const [isDarkMode, setIsDarkMode] = useState(() => {
    const savedTheme = localStorage.getItem('theme');
    // If a theme is saved in localStorage, use it.
    if (savedTheme) {
      return savedTheme === 'dark';
    }
    // Otherwise, respect the user's OS-level preference.
    return window.matchMedia('(prefers-color-scheme: dark)').matches;
  });

  // ✅ FIX: This effect now also saves the theme choice to localStorage whenever it changes.
  useEffect(() => {
    const root = window.document.documentElement;
    if (isDarkMode) {
      root.classList.add('dark');
      localStorage.setItem('theme', 'dark'); // Save preference
    } else {
      root.classList.remove('dark');
      localStorage.setItem('theme', 'light'); // Save preference
    }
  }, [isDarkMode]);

  return (
    <div className="space-y-6 max-w-2xl mx-auto">
      <h1 className="text-3xl font-bold">{t("settings")}</h1>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Palette className="w-5 h-5 text-primary" />
            Appearance
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between">
            <Label htmlFor="dark-mode" className="font-medium">
              Dark Mode
            </Label>
            <Switch
              id="dark-mode"
              checked={isDarkMode}
              onCheckedChange={setIsDarkMode}
            />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BrainCircuit className="w-5 h-5 text-primary" />
            AI Assistant
          </CardTitle>
        </CardHeader>
        <CardContent>
            <div className="flex items-center justify-between text-sm">
                <p className="text-muted-foreground">AI Model Status</p>
                <div className="flex items-center gap-2">
                    <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></div>
                    <p className="font-medium">Gemini 1.5 Flash: <span className="text-green-500">Operational</span></p>
                </div>
            </div>
        </CardContent>
      </Card>
      
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
             <IndianRupee className="w-5 h-5 text-primary" />
             Localization
          </CardTitle>
        </CardHeader>
        <CardContent>
             <div className="flex items-center justify-between text-sm">
                <p className="text-muted-foreground">Detected Local Currency</p>
                <p className="font-medium">Indian Rupee (INR)</p>
             </div>
        </CardContent>
      </Card>

    </div>
  );
}
