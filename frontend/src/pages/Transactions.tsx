import { useState, useMemo, useEffect } from "react";
import { useNavigate, useMatch, useParams } from "react-router-dom";
import { format, isToday, isYesterday, startOfMonth, endOfMonth, subMonths, startOfYear, endOfYear } from "date-fns";

// UI Components
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import {
  Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger, DialogFooter,
} from "@/components/ui/dialog";

// Icons
import { Search, Filter, TrendingUp, TrendingDown, Edit, Trash2, Loader2, Plus, Briefcase, Landmark, Wallet, PackageOpen, Calendar, Tag, FileText, StickyNote } from "lucide-react";

// Custom Hooks and Types
import { useLanguage } from "@/contexts/LanguageContext";
import { useToast } from "@/hooks/use-toast";
import { useGetTransactions, useUpdateTransaction, useDeleteTransaction, Transaction } from "@/hooks/useTransactions";
import { useIsMobile } from "@/hooks/use-mobile";

// --- Constants ---
const typeAttributes = {
  income: { icon: TrendingUp, color: "text-green-500", badge: "bg-green-500/10 text-green-700 border-green-500/20" },
  expense: { icon: TrendingDown, color: "text-red-500", badge: "bg-red-500/10 text-red-700 border-red-500/20" },
  investment: { icon: Briefcase, color: "text-blue-500", badge: "bg-blue-500/10 text-blue-700 border-blue-500/20" },
};
const transactionTypes = [
  { value: "income", label: "income" }, { value: "expense", label: "expense" }, { value: "investment", label: "investment" },
];
const categories = {
  income: ["sales", "services", "additional_income", "other"],
  expense: ["rent", "utilities", "supplies", "marketing", "salaries", "transport", "other"],
  investment: ["product_cost", "equipment", "shop_setup", "other"],
};
const initialEditFormData = {
  type: "" as Transaction['type'] | "", amount: "", category: "", subcategory: "", description: "", notes: "", date: "",
};

// =================================================================
// 1. ROUTE MANAGER COMPONENT (DEFAULT EXPORT)
// =================================================================
export default function TransactionsPage() {
  const editMatch = useMatch("/transactions/edit/:id");
  const isEditMode = Boolean(editMatch);
  const { id: transactionId } = editMatch?.params || {};

  return (
    <div className="max-w-4xl mx-auto space-y-8 p-4 md:p-6">
      {isEditMode ? (
        <TransactionEditForm key={transactionId} transactionId={transactionId!} />
      ) : (
        <TransactionListPage />
      )}
    </div>
  );
}

// =================================================================
// 2. TRANSACTION LIST PAGE COMPONENT
// =================================================================
function TransactionListPage() {
  const { t } = useLanguage();
  const navigate = useNavigate();
  const isMobile = useIsMobile();
  const [searchTerm, setSearchTerm] = useState("");
  const [filterType, setFilterType] = useState<Transaction['type'] | "all">("all");
  const [timePeriod, setTimePeriod] = useState<string>("this_month");
  const { data: transactions, isLoading } = useGetTransactions();
  const deleteTransaction = useDeleteTransaction();

  const filteredTransactions = useMemo(() => {
    if (!transactions) return [];
    const now = new Date();
    let startDate: Date | null = null, endDate: Date | null = null;
    if (timePeriod === 'this_month') { [startDate, endDate] = [startOfMonth(now), endOfMonth(now)]; }
    else if (timePeriod === 'last_month') { const last = subMonths(now, 1); [startDate, endDate] = [startOfMonth(last), endOfMonth(last)]; }
    else if (timePeriod === 'this_year') { [startDate, endDate] = [startOfYear(now), endOfYear(now)]; }
    return transactions.filter(tx => {
      const txDate = new Date(tx.date as string);
      const matchesDate = !startDate || !endDate || (txDate >= startDate && txDate <= endDate);
      const matchesSearch = `${tx.description} ${tx.category} ${tx.subcategory || ""}`.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesType = filterType === "all" || tx.type === filterType;
      return matchesDate && matchesSearch && matchesType;
    });
  }, [transactions, searchTerm, filterType, timePeriod]);

  const summary = useMemo(() => {
    return filteredTransactions.reduce(
      (acc, t) => {
        const amount = parseFloat(t.amount as string);
        if (t.type === "income") acc.income += amount;
        else if (t.type === "expense") acc.expense += amount;
        else if (t.type === "investment") acc.investment += amount;
        acc.revenue = acc.income - acc.expense;
        acc.saving = acc.revenue - acc.investment;
        return acc;
      }, { income: 0, expense: 0, investment: 0, revenue: 0, saving: 0 }
    );
  }, [filteredTransactions]);
  
  const groupedTransactions = useMemo(() => {
    const formatDate = (d: string) => (isToday(new Date(d)) ? "Today" : isYesterday(new Date(d)) ? "Yesterday" : format(new Date(d), "MMMM d, yyyy"));
    return filteredTransactions.reduce((acc, tx) => {
      const key = formatDate(tx.date as string);
      (acc[key] = acc[key] || []).push(tx);
      return acc;
    }, {} as Record<string, Transaction[]>);
  }, [filteredTransactions]);

  if (isLoading) return <div className="flex items-center justify-center min-h-[400px]"><Loader2 className="w-8 h-8 animate-spin text-primary" /></div>;

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div><h1 className="text-3xl font-bold">{t("transactions")}</h1><p className="text-muted-foreground">{t("manage_transactions_subtitle", { defaultValue: "A comprehensive overview of your financial activities." })}</p></div>
        <Button onClick={() => navigate("/add-transaction")}><Plus className="w-4 h-4 mr-2" />{t("add_transaction")}</Button>
      </div>
      <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard title="Total Income" value={summary.income} type="income" icon={TrendingUp} />
        <StatCard title="Revenue (Income - Expense)" value={summary.revenue} type="net" icon={Wallet} />
        <StatCard title="Total Investment" value={summary.investment} type="investment" icon={Briefcase} />
        <StatCard title="Net Savings (Revenue - Invest)" value={summary.saving} type="saving" icon={Landmark} />
      </div>
      <Card>
        <CardHeader><CardTitle className="flex items-center gap-2 text-lg"><Filter className="w-5 h-5 text-primary" />{t("filters_and_search")}</CardTitle></CardHeader>
        <CardContent>
          <div className={`grid gap-4 ${isMobile ? 'grid-cols-1' : 'md:grid-cols-3'}`}>
            <div className="relative"><Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" /><Input placeholder={t("search_description_etc")} className="pl-10" value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} /></div>
            <Select value={filterType} onValueChange={(v) => setFilterType(v as any)}><SelectTrigger><SelectValue/></SelectTrigger><SelectContent>{["all", ...transactionTypes.map(t => t.value)].map(v => <SelectItem key={v} value={v}>{t(v) || "All Types"}</SelectItem>)}</SelectContent></Select>
            <Select value={timePeriod} onValueChange={setTimePeriod}><SelectTrigger><SelectValue/></SelectTrigger><SelectContent>{[{v:"this_month",l:"This Month"},{v:"last_month",l:"Last Month"},{v:"this_year",l:"This Year"},{v:"all_time",l:"All Time"}].map(o=><SelectItem key={o.v} value={o.v}>{o.l}</SelectItem>)}</SelectContent></Select>
          </div>
        </CardContent>
      </Card>
      <div className="space-y-6">
        {!transactions?.length ? <EmptyState /> : Object.keys(groupedTransactions).length === 0 ? <NoResultsState /> :
          Object.entries(groupedTransactions).map(([date, txs]) => (
            <div key={date}>
              <h3 className="text-sm font-semibold text-muted-foreground mb-3 sticky top-0 bg-background/95 backdrop-blur-sm py-2 z-10">{date}</h3>
              <div className="space-y-3">{txs.map(tx => <TransactionItem key={tx.id} transaction={tx} onDelete={deleteTransaction.mutate} isDeleting={deleteTransaction.isPending} />)}</div>
            </div>
          ))
        }
      </div>
    </div>
  );
}

// =================================================================
// 3. TRANSACTION EDIT FORM COMPONENT
// =================================================================
function TransactionEditForm({ transactionId }: { transactionId: string }) {
  const { t } = useLanguage();
  const { toast } = useToast();
  const navigate = useNavigate();
  const { data: transactions } = useGetTransactions();
  const updateTransaction = useUpdateTransaction();
  const [formData, setFormData] = useState(initialEditFormData);

  useEffect(() => {
    const txToEdit = transactions?.find((t) => t.id === transactionId);
    if (txToEdit) {
      setFormData({
        type: txToEdit.type as Transaction['type'], amount: String(txToEdit.amount), category: txToEdit.category,
        subcategory: txToEdit.subcategory || "", description: txToEdit.description, notes: txToEdit.notes || "",
        date: new Date(txToEdit.date as string).toISOString().split("T")[0],
      });
    }
  }, [transactions, transactionId]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement> | { name: string; value: string }) => {
    const name = 'id' in e.target ? e.target.id : e.name;
    const value = 'value' in e.target ? e.target.value : e.value;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSelectChange = (name: 'type' | 'category', value: string) => {
    setFormData(prev => ({ ...prev, [name]: value, ...(name === 'type' && { category: '' }) }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const { amount, date, description, category, type, subcategory, notes } = formData;
    await updateTransaction.mutateAsync({
      id: transactionId,
      payload: { amount: parseFloat(amount), date, description, category, type, subcategory: subcategory || null, notes: notes || null }
    });
    navigate("/transactions");
  };

  return (
    <div>
      <h1 className="text-3xl font-bold">{t("edit_transaction")}</h1><p className="text-muted-foreground">Update the details of your financial transaction.</p>
      <Card className="mt-6">
        <CardHeader><CardTitle className="flex items-center gap-2"><Edit className="w-5 h-5 text-primary" />Edit Transaction</CardTitle></CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2"><Label htmlFor="amount">{t("amount")} *</Label><div className="relative"><span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">₹</span><Input id="amount" type="number" value={formData.amount} onChange={handleChange} required className="pl-8"/></div></div>
              <div className="space-y-2"><Label htmlFor="category">{t("category")} *</Label><Select value={formData.category} onValueChange={(v) => handleSelectChange("category", v)} required><SelectTrigger id="category"><SelectValue /></SelectTrigger><SelectContent>{categories[formData.type as keyof typeof categories]?.map(c => <SelectItem key={c} value={c}>{t(c)}</SelectItem>)}</SelectContent></Select></div>
            </div>
            <div className="space-y-2"><Label htmlFor="description">{t("description")} *</Label><Input id="description" value={formData.description} onChange={handleChange} required /></div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2"><Label htmlFor="subcategory">{t("subcategory")} (Optional)</Label><Input id="subcategory" value={formData.subcategory} onChange={handleChange} /></div>
              <div className="space-y-2"><Label htmlFor="date">{t("date")} *</Label><Input id="date" type="date" value={formData.date} onChange={handleChange} required /></div>
            </div>
            <div className="space-y-2"><Label htmlFor="notes">{t("notes")} (Optional)</Label><Textarea id="notes" value={formData.notes} onChange={handleChange} /></div>
            <div className="flex flex-col sm:flex-row gap-3 pt-4">
              <Button type="submit" className="flex-1" disabled={updateTransaction.isPending}><Edit className="w-4 h-4 mr-2" />{t("update")}</Button>
              <Button type="button" variant="outline" onClick={() => navigate("/transactions")}>{t("cancel")}</Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}

// --- Helper Sub-components ---
const StatCard = ({ title, value, type, icon: Icon }: { title: string, value: number, type: string, icon: React.ElementType }) => {
  const color = type === 'income' ? 'text-green-500' : type === 'investment' ? 'text-blue-500' : value >= 0 ? 'text-green-500' : 'text-red-500';
  return <Card><CardHeader className="flex-row items-center justify-between space-y-0 pb-2"><CardTitle className="text-sm font-medium">{title}</CardTitle><Icon className="h-5 w-5 text-muted-foreground" /></CardHeader><CardContent><div className={`text-2xl font-bold ${color}`}>{value.toLocaleString('en-IN', { style: 'currency', currency: 'INR' })}</div></CardContent></Card>;
};

const TransactionItem = ({ transaction: tx, onDelete, isDeleting }: { transaction: Transaction, onDelete: (id: string) => void, isDeleting: boolean }) => {
  const { t } = useLanguage(); const navigate = useNavigate(); const attr = typeAttributes[tx.type as keyof typeof typeAttributes]; const TypeIcon = attr.icon;
  return (
    <Dialog><DialogTrigger asChild><div className="flex items-center justify-between p-3 rounded-lg border hover:bg-muted/50 cursor-pointer"><div className="flex items-center gap-4 flex-1 overflow-hidden"><div className={`p-2 rounded-full ${attr.badge}`}><TypeIcon className="w-5 h-5" /></div><div className="flex-1 overflow-hidden"><p className="font-semibold truncate">{tx.description}</p><div className="flex items-center gap-2 mt-1 text-xs text-muted-foreground"><Badge variant="outline">{t(tx.category)}</Badge>{tx.subcategory && <><span className="hidden sm:inline">•</span><Badge variant="secondary">{t(tx.subcategory)}</Badge></>}</div></div></div><p className={`font-bold text-base sm:text-lg ${attr.color}`}>{tx.type === 'income' ? '+' : '-'}{parseFloat(tx.amount as string).toLocaleString('en-IN', { style: 'currency', currency: 'INR' })}</p></div></DialogTrigger>
      <DialogContent><DialogHeader><DialogTitle className="capitalize flex items-center gap-2"><TypeIcon className={`w-5 h-5 ${attr.color}`} /> {tx.type} Details</DialogTitle><DialogDescription>{tx.description}</DialogDescription></DialogHeader>
        <div className="space-y-4 py-4">
          <div className="flex items-center"><Calendar className="w-4 h-4 mr-3 text-muted-foreground" /><strong>Date:</strong><span className="ml-auto">{format(new Date(tx.date as string), "MMMM d, yyyy")}</span></div>
          <div className="flex items-center"><Tag className="w-4 h-4 mr-3 text-muted-foreground" /><strong>Category:</strong><span className="ml-auto capitalize">{t(tx.category)}</span></div>
          {tx.subcategory && <div className="flex items-center"><FileText className="w-4 h-4 mr-3 text-muted-foreground" /><strong>Subcategory:</strong><span className="ml-auto capitalize">{t(tx.subcategory)}</span></div>}
          {tx.notes && <div className="flex items-start"><StickyNote className="w-4 h-4 mr-3 mt-1 text-muted-foreground" /><strong>Notes:</strong><p className="ml-auto text-right text-sm">{tx.notes}</p></div>}
        </div>
        <DialogFooter className="sm:justify-between"><AlertDialog><AlertDialogTrigger asChild><Button variant="destructive" disabled={isDeleting}><Trash2 className="w-4 h-4 mr-2" /> Delete</Button></AlertDialogTrigger><AlertDialogContent><AlertDialogHeader><AlertDialogTitle>Are you sure?</AlertDialogTitle><AlertDialogDescription>This will permanently delete this transaction.</AlertDialogDescription></AlertDialogHeader><AlertDialogFooter><AlertDialogCancel>Cancel</AlertDialogCancel><AlertDialogAction onClick={() => onDelete(tx.id)}>Delete</AlertDialogAction></AlertDialogFooter></AlertDialogContent></AlertDialog><Button onClick={() => navigate(`/transactions/edit/${tx.id}`)}><Edit className="w-4 h-4 mr-2" /> Edit</Button></DialogFooter>
      </DialogContent></Dialog>
  );
};

const EmptyState = () => { const navigate = useNavigate(); return <div className="text-center py-12 border-2 border-dashed rounded-lg"><PackageOpen className="mx-auto h-12 w-12 text-muted-foreground" /><h3 className="mt-4 text-lg font-semibold">No Transactions Yet</h3><p className="mt-1 text-sm text-muted-foreground">Get started by adding your first income, expense, or investment.</p><Button className="mt-6" onClick={() => navigate("/add-transaction")}><Plus className="w-4 h-4 mr-2" /> Add First Transaction</Button></div>; };
const NoResultsState = () => <div className="text-center py-12 border-2 border-dashed rounded-lg"><Search className="mx-auto h-12 w-12 text-muted-foreground" /><h3 className="mt-4 text-lg font-semibold">No Matching Transactions</h3><p className="mt-1 text-sm text-muted-foreground">Try adjusting your search or filter criteria.</p></div>;