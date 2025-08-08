import { useState } from "react";
import { useNavigate } from "react-router-dom";

// UI Components
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

// Icons
import { Plus, TrendingUp, TrendingDown, Wallet, ArrowLeft } from "lucide-react";

// Custom Hooks and Contexts
import { useLanguage } from "@/contexts/LanguageContext";
import { useToast } from "@/hooks/use-toast";
import { useAddTransaction, Transaction, NewTransaction } from "@/hooks/useTransactions";
// ✅ 1. IMPORT THE HOOK
import { useIsMobile } from "@/hooks/use-mobile";


// --- Constants ---
const transactionTypes = [
  { value: "income", label: "income", icon: TrendingUp, color: "text-green-500" },
  { value: "expense", label: "expense", icon: TrendingDown, color: "text-red-500" },
  { value: "investment", label: "investment", icon: Wallet, color: "text-blue-500" },
];

const categories = {
  income: ["sales", "services", "additional_income", "other"],
  expense: ["rent", "utilities", "supplies", "marketing", "salaries", "transport", "other"],
  investment: ["product_cost", "equipment", "shop_setup", "other"],
};

const initialFormData = {
  type: "" as Transaction['type'] | "",
  amount: "",
  category: "",
  subcategory: "",
  description: "",
  notes: "",
  date: new Date().toISOString().split("T")[0],
};

// =================================================================
// MAIN ADD TRANSACTION PAGE COMPONENT
// =================================================================
export default function AddTransaction() {
  const { t } = useLanguage();
  const { toast } = useToast();
  const navigate = useNavigate();
  const addTransaction = useAddTransaction();
  
  // ✅ 2. INITIALIZE THE HOOK
  const isMobile = useIsMobile();

  const [formData, setFormData] = useState(initialFormData);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { id, value } = e.target;
    setFormData((prev) => ({ ...prev, [id]: value }));
  };

  const handleSelectChange = (name: 'type' | 'category', value: string) => {
    if (name === 'type') {
      setFormData((prev) => ({ ...prev, type: value as Transaction['type'], category: '' }));
    } else {
      setFormData((prev) => ({ ...prev, [name]: value }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.type || !formData.amount || !formData.category || !formData.description) {
      toast({
        title: "Missing Fields",
        description: "Please fill in Type, Amount, Category, and Description.",
        variant: "destructive",
      });
      return;
    }

    const transactionData: NewTransaction = {
      amount: parseFloat(formData.amount),
      date: formData.date,
      description: formData.description,
      category: formData.category,
      type: formData.type as Transaction['type'],
      subcategory: formData.subcategory || null,
      notes: formData.notes || null,
      receipt_photo_url: null,
    };

    try {
      await addTransaction.mutateAsync(transactionData);
      toast({ title: "Success!", description: "Transaction added successfully." });
      navigate("/transactions");
    } catch (error) {
      console.error("Failed to add transaction:", error);
      toast({
        title: "Submission Failed",
        description: "There was an error while adding the transaction.",
        variant: "destructive",
      });
    }
  };
  
  // ✅ 3. USE THE HOOK'S VALUE TO CHANGE THE UI
  // On mobile, the button will just say "Add". On desktop, it will be more descriptive, like "Add Income".
  const getButtonText = () => {
    const baseText = t("add");
    if (isMobile) {
      return baseText;
    }
    return formData.type ? `${baseText} ${t(formData.type)}` : baseText;
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6 p-4 sm:p-6">
      <div className="flex items-center gap-4">
        <Button variant="outline" size="icon" className="flex-shrink-0" onClick={() => navigate(-1)}>
            <ArrowLeft className="h-4 w-4" />
        </Button>
        <div>
            <h1 className="text-2xl font-bold">{t("add_transaction")}</h1>
            <p className="text-sm text-muted-foreground">Add a new financial transaction to your records.</p>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-lg">
            <Plus className="w-5 h-5 text-primary" />
            New Transaction Details
          </CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-3">
              <Label>{t("type")} *</Label>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                {transactionTypes.map((type) => (
                  <div
                    key={type.value}
                    className={`p-3 border-2 rounded-lg cursor-pointer transition-all ${formData.type === type.value ? "border-primary bg-primary/5" : "border-border hover:border-primary/50"}`}
                    onClick={() => handleSelectChange("type", type.value)}
                  >
                    <div className="text-center space-y-2">
                      <type.icon className={`w-6 h-6 mx-auto ${type.color}`} />
                      <p className="text-sm font-medium">{t(type.label)}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-6">
              <div className="space-y-2">
                <Label htmlFor="amount">{t("amount")} *</Label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground">₹</span>
                  <Input id="amount" type="number" placeholder="0.00" className="pl-8" value={formData.amount} onChange={handleInputChange} required />
                </div>
              </div>
              {formData.type && (
                <div className="space-y-2">
                  <Label htmlFor="category">{t("category")} *</Label>
                  <Select value={formData.category} onValueChange={(value) => handleSelectChange("category", value)} required>
                    <SelectTrigger><SelectValue placeholder="Select a category" /></SelectTrigger>
                    <SelectContent>
                      {categories[formData.type as keyof typeof categories]?.map((item) => (
                        <SelectItem key={item} value={item}>{t(item)}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">{t("description")} *</Label>
              <Input id="description" placeholder="e.g., Sales for the week, Shop rent" value={formData.description} onChange={handleInputChange} required />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-6">
              <div className="space-y-2">
                <Label htmlFor="subcategory">{t("subcategory")} (Optional)</Label>
                <Input id="subcategory" placeholder="e.g., Raw materials, Specific product" value={formData.subcategory} onChange={handleInputChange} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="date">{t("date")} *</Label>
                <Input id="date" type="date" value={formData.date} onChange={handleInputChange} required />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="notes">{t("notes")} (Optional)</Label>
              <Textarea id="notes" placeholder="Add any extra details here..." value={formData.notes} onChange={handleInputChange} />
            </div>

            <div className="flex flex-col sm:flex-row-reverse gap-3 pt-4">
              <Button type="submit" className="sm:flex-1" disabled={addTransaction.isPending}>
                <Plus className="w-4 h-4 mr-2" />
                {/* The dynamic button text is rendered here */}
                {getButtonText()}
              </Button>
              <Button type="button" variant="outline" className="sm:flex-1" onClick={() => navigate("/transactions")}>
                {t("cancel")}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}