import { useState, useMemo, useEffect } from "react";
import { format, parseISO, subMonths, isSameMonth, startOfMonth, endOfMonth, differenceInDays, getDate } from "date-fns";
import { useAuth } from "@/hooks/useAuth";

// UI Components
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Progress } from "@/components/ui/progress";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { useToast } from "@/hooks/use-toast";

// Icons
import { PlusCircle, Target, AlertTriangle, Loader2, Bell, Sparkles, History, Mail, ChevronDown, ChevronUp } from "lucide-react";

// Custom Hooks
import { useLanguage } from "@/contexts/LanguageContext";
import { useGetTransactions, Transaction } from "@/hooks/useTransactions";
import { useGetBudgets, useSetBudget, useDeleteBudget, useSendBudgetAlert, NewBudgetPayload, AlertPayload } from "@/hooks/useBudgets";
import { useIsMobile } from "@/hooks/use-mobile"; // ✅ Import the mobile detection hook

const expenseCategories = ["rent", "utilities", "supplies", "marketing", "salaries", "transport", "other"];

export default function IntelligentBudgetingAssistant() {
  const { t } = useLanguage();
  const { user } = useAuth();
  const isMobile = useIsMobile(); // ✅ Hook to check for mobile screen size
  
  const [showAddForm, setShowAddForm] = useState(false);
  const [selectedMonth, setSelectedMonth] = useState(format(new Date(), 'yyyy-MM'));
  const [showMobileSummary, setShowMobileSummary] = useState(false); // ✅ State for mobile accordion

  const { data: budgets, isLoading: budgetsLoading } = useGetBudgets(selectedMonth);
  const { data: transactions, isLoading: transactionsLoading } = useGetTransactions();
  const setBudget = useSetBudget();
  const deleteBudget = useDeleteBudget();
  const sendEmailAlert = useSendBudgetAlert();

  const analysis = useMemo(() => {
    if (!budgets || !transactions || (budgets.length > 0 && budgets[0].month !== selectedMonth)) {
      return null;
    }

    const currentMonthBudgets = budgets;
    const totalBudgeted = currentMonthBudgets.reduce((sum, b) => sum + parseFloat(b.amount as string), 0);
    const relevantExpenses = transactions.filter(tx => tx.type === 'expense' && (tx.date as string).startsWith(selectedMonth));
    const totalSpent = relevantExpenses.reduce((sum, tx) => sum + parseFloat(tx.amount as string), 0);
    const overallPercentage = totalBudgeted > 0 ? (totalSpent / totalBudgeted) * 100 : 0;
    
    let pacingStatus = 'N/A';
    if (isSameMonth(parseISO(`${selectedMonth}-01`), new Date())) {
        const today = new Date();
        const daysInMonth = differenceInDays(endOfMonth(today), startOfMonth(today)) + 1;
        const dayOfMonth = getDate(today);
        const monthProgress = (dayOfMonth / daysInMonth) * 100;
        const spendingPaceDiff = overallPercentage - monthProgress;
        if (spendingPaceDiff > 10) pacingStatus = "Pacing Fast";
        else if (spendingPaceDiff < -10) pacingStatus = "Doing Great!";
        else pacingStatus = "On Track";
    }

    interface Notification { type: 'warning' | 'over'; message: string; category: string; spent: number; budgetAmount: number; }
    const notifications: Notification[] = [];

    const budgetDetails = currentMonthBudgets.map(budget => {
      const budgetAmount = parseFloat(budget.amount as string);
      const spent = relevantExpenses.filter(tx => tx.category === budget.category).reduce((sum, tx) => sum + parseFloat(tx.amount as string), 0);
      const percentage = budgetAmount > 0 ? (spent / budgetAmount) * 100 : 0;
      const remaining = budgetAmount - spent;

      if (percentage >= 80 && percentage <= 100) {
        notifications.push({ type: 'warning', message: `You've spent ${percentage.toFixed(0)}% of your '${budget.category}' budget.`, category: budget.category, spent, budgetAmount });
      } else if (percentage > 100) {
        notifications.push({ type: 'over', message: `You're ₹${Math.abs(remaining).toLocaleString()} over your '${budget.category}' budget.`, category: budget.category, spent, budgetAmount });
      }

      return { ...budget, spent, remaining, percentage, status: percentage > 100 ? 'over' : percentage > 80 ? 'warning' : 'good' };
    });

    return { totalBudgeted, totalSpent, overallPercentage, pacingStatus, budgetDetails, notifications };
  }, [budgets, transactions, selectedMonth]);

  if (budgetsLoading || transactionsLoading) {
    return <div className="flex items-center justify-center h-96"><Loader2 className="w-8 h-8 animate-spin text-primary" /></div>;
  }

  return (
    <div className="space-y-6 p-4 md:p-0">
      <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-2">
        <div>
          <h1 className="text-3xl font-bold">{t("Budget Manager")}</h1>
          <p className="text-muted-foreground">{t("proactive spending insights and alerts")}</p>
        </div>
        <Button onClick={() => setShowAddForm(!showAddForm)} className="w-full sm:w-auto">
          <PlusCircle className="w-4 h-4 mr-2" />
          {showAddForm ? t("cancel") : t("add budget")}
        </Button>
      </div>

      {showAddForm && <AddBudgetForm transactions={transactions} onSetBudget={setBudget.mutateAsync} isSetting={setBudget.isPending} onCancel={() => setShowAddForm(false)} />}
      
      {/* ✅ RESPONSIVE SUMMARY SECTION */}
      {analysis && (
        isMobile ? (
            <Card>
                <CardHeader className="flex flex-row items-center justify-between cursor-pointer" onClick={() => setShowMobileSummary(!showMobileSummary)}>
                    <CardTitle>Monthly Summary</CardTitle>
                    {showMobileSummary ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
                </CardHeader>
                {showMobileSummary && (
                    <CardContent className="pt-4 space-y-4">
                        <OverallHealthCard analysis={analysis} selectedMonth={selectedMonth} />
                        <NotificationPanel notifications={analysis.notifications} onSendEmail={sendEmailAlert.mutate} isSending={sendEmailAlert.isPending} userEmail={user?.email} />
                    </CardContent>
                )}
            </Card>
        ) : (
            <div className="grid gap-4 md:grid-cols-2">
                <OverallHealthCard analysis={analysis} selectedMonth={selectedMonth} />
                <NotificationPanel notifications={analysis.notifications} onSendEmail={sendEmailAlert.mutate} isSending={sendEmailAlert.isPending} userEmail={user?.email} />
            </div>
        )
      )}

      <div className="flex flex-col sm:flex-row items-center justify-between gap-2">
        <h2 className="text-xl font-semibold">My Budgets</h2>
        <Select value={selectedMonth} onValueChange={setSelectedMonth}>
          <SelectTrigger className="w-full sm:w-48"><History className="w-4 h-4 mr-2"/> <SelectValue /></SelectTrigger>
          <SelectContent>
            {Array.from({length: 6}).map((_, i) => {
                const month = format(subMonths(new Date(), i), 'yyyy-MM');
                const label = format(parseISO(`${month}-01`), 'MMMM yyyy');
                return <SelectItem key={month} value={month}>{label}</SelectItem>
            })}
          </SelectContent>
        </Select>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {!analysis || analysis.budgetDetails.length === 0 ? (
          <NoBudgetsFound onClickAdd={() => setShowAddForm(true)} />
        ) : (
          analysis.budgetDetails.map((budget) => (
            <BudgetCard key={budget.id} budget={budget} onDelete={() => deleteBudget.mutateAsync({ id: budget.id, month: budget.month })} isDeleting={deleteBudget.isPending} />
          ))
        )}
      </div>
    </div>
  );
}

// --- SUB-COMPONENTS ---

function OverallHealthCard({ analysis, selectedMonth }: { analysis: any, selectedMonth: string }) {
    return(
        <Card>
            <CardHeader>
              <CardTitle>Overall Budget Health</CardTitle>
              <CardDescription>{format(parseISO(`${selectedMonth}-01`), 'MMMM yyyy')}</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex justify-between font-medium text-lg">
                <span>Spent: ₹{analysis.totalSpent.toLocaleString()}</span>
                <span>Budget: ₹{analysis.totalBudgeted.toLocaleString()}</span>
              </div>
              <Progress value={Math.min(analysis.overallPercentage, 100)} className="my-2" />
              <div className="text-sm text-muted-foreground">Pacing: <span className="font-semibold text-primary">{analysis.pacingStatus}</span></div>
            </CardContent>
        </Card>
    );
}

function NotificationPanel({ notifications, onSendEmail, isSending, userEmail }: {
  notifications: any[];
  onSendEmail: (payload: AlertPayload) => void;
  isSending: boolean;
  userEmail: string | undefined;
}) {
  const { toast } = useToast();

  const handleSendEmail = (notification: any) => {
    if (!userEmail) {
      toast({ title: "Authentication Error", description: "User email not found.", variant: "destructive" });
      return;
    }
    onSendEmail({
        userEmail: userEmail,
        category: notification.category,
        spentAmount: notification.spent,
        budgetAmount: notification.budgetAmount,
    });
  };

  return (
    <Card>
        <CardHeader>
            <CardTitle className="flex items-center gap-2"><Bell className="w-5 h-5 text-primary"/> Notifications</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2 max-h-40 overflow-y-auto">
            {notifications.length > 0 ? notifications.map((n, i) => (
                <Alert key={i} variant={n.type === 'over' ? 'destructive' : 'default'} className="flex items-center justify-between p-2 pr-1">
                    <div className="flex items-center">
                        <AlertTriangle className="h-4 w-4" />
                        <AlertDescription className="text-xs ml-2">{n.message}</AlertDescription>
                    </div>
                    <Button variant="ghost" size="icon" className="h-7 w-7 flex-shrink-0" onClick={() => handleSendEmail(n)} disabled={isSending || !userEmail}>
                        {isSending ? <Loader2 className="w-4 h-4 animate-spin" /> : <Mail className="w-4 h-4" />}
                    </Button>
                </Alert>
            )) : <p className="text-sm text-muted-foreground">All budgets are on track. Keep it up!</p>}
        </CardContent>
    </Card>
  );
}


// (Other sub-components like AddBudgetForm, BudgetCard, NoBudgetsFound remain the same)
function AddBudgetForm({ transactions, onSetBudget, isSetting, onCancel }: { transactions: Transaction[] | undefined, onSetBudget: (data: NewBudgetPayload) => void, isSetting: boolean, onCancel: () => void }) {
    const [formData, setFormData] = useState({ category: "", amount: "", month: format(new Date(), 'yyyy-MM') });

    const suggestedAmount = useMemo(() => {
        if (!transactions || !formData.category) return null;
        const threeMonthsAgo = format(subMonths(new Date(), 3), 'yyyy-MM-dd');
        const relevantExpenses = transactions.filter(tx => 
            tx.type === 'expense' && 
            tx.category === formData.category &&
            (tx.date as string) >= threeMonthsAgo
        );
        const total = relevantExpenses.reduce((sum, tx) => sum + parseFloat(tx.amount as string), 0);
        return total > 0 ? (total / 3).toFixed(0) : null;
    }, [transactions, formData.category]);
    
    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!formData.category || !formData.amount || !formData.month) return;
        onSetBudget({ category: formData.category, amount: parseFloat(formData.amount), month: formData.month });
        setFormData({ category: "", amount: "", month: format(new Date(), 'yyyy-MM') });
        onCancel();
    };

    return(
        <Card>
            <CardHeader><CardTitle>Create or Update Budget</CardTitle></CardHeader>
            <CardContent>
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div className="space-y-1">
                            <Label htmlFor="category">Category *</Label>
                            <Select value={formData.category} onValueChange={(value) => setFormData({ ...formData, category: value })}>
                                <SelectTrigger><SelectValue placeholder="Select Category" /></SelectTrigger>
                                <SelectContent>{expenseCategories.map((cat) => <SelectItem key={cat} value={cat}>{cat}</SelectItem>)}</SelectContent>
                            </Select>
                        </div>
                        <div className="space-y-1">
                            <Label htmlFor="amount">Budget Amount *</Label>
                             <div className="relative">
                                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">₹</span>
                                <Input id="amount" type="number" placeholder="0.00" className="pl-8" value={formData.amount} onChange={(e) => setFormData({ ...formData, amount: e.target.value })} required />
                            </div>
                            {suggestedAmount && (
                                <Button type="button" variant="link" size="sm" className="p-0 h-auto text-primary" onClick={() => setFormData({...formData, amount: suggestedAmount})}>
                                    <Sparkles className="w-3 h-3 mr-1" /> Suggest: ₹{parseInt(suggestedAmount).toLocaleString()}
                                </Button>
                            )}
                        </div>
                        <div className="space-y-1">
                            <Label htmlFor="month">Month *</Label>
                            <Input id="month" type="month" value={formData.month} onChange={(e) => setFormData({ ...formData, month: e.target.value })} required />
                        </div>
                    </div>
                    <div className="flex gap-2">
                        <Button type="submit" disabled={isSetting}>
                            {isSetting ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Target className="w-4 h-4 mr-2" />}
                            Set Budget
                        </Button>
                        <Button type="button" variant="outline" onClick={onCancel}>Cancel</Button>
                    </div>
                </form>
            </CardContent>
        </Card>
    );
}

function BudgetCard({ budget, onDelete, isDeleting }: { budget: any, onDelete: () => void, isDeleting: boolean }) {
     return(
        <Card className="flex flex-col">
            <CardHeader>
                <div className="flex justify-between items-start">
                    <div>
                        <CardTitle className="text-lg capitalize">{budget.category}</CardTitle>
                        <CardDescription>{format(parseISO(`${budget.month}-02`), 'MMMM yyyy')}</CardDescription>
                    </div>
                    <div className={`p-2 rounded-full ${ budget.status === 'over' ? 'bg-red-100 text-red-600' : budget.status === 'warning' ? 'bg-yellow-100 text-yellow-600' : 'bg-green-100 text-green-600' }`}>
                        {budget.status === 'over' ? <AlertTriangle className="w-5 h-5" /> : <Target className="w-5 h-5" />}
                    </div>
                </div>
            </CardHeader>
            <CardContent className="flex-grow flex flex-col justify-end">
                <div className="space-y-2">
                    <div className="flex justify-between text-sm font-medium">
                        <span>Spent: ₹{budget.spent.toLocaleString()}</span>
                        <span>Budget: ₹{parseFloat(budget.amount).toLocaleString()}</span>
                    </div>
                    <Progress value={Math.min(budget.percentage, 100)} className={`h-2 ${ budget.status === 'over' ? '[&>div]:bg-red-500' : budget.status === 'warning' ? '[&>div]:bg-yellow-500' : '' }`} />
                    <div className="flex justify-between items-center text-sm">
                        <span className={`font-semibold ${budget.remaining < 0 ? 'text-red-600' : 'text-green-600'}`}>
                            {budget.remaining < 0 ? 'Overspent' : 'Remaining'}: ₹{Math.abs(budget.remaining).toLocaleString()}
                        </span>
                        <Button variant="ghost" size="sm" className="text-xs text-red-500 hover:text-red-600" onClick={onDelete} disabled={isDeleting}>Delete</Button>
                    </div>
                </div>
            </CardContent>
        </Card>
    );
}

function NoBudgetsFound({ onClickAdd }: { onClickAdd: () => void }) {
    return (
        <Card className="col-span-full">
            <CardContent className="flex flex-col items-center justify-center text-center py-12">
                <Target className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
                <h3 className="text-xl font-semibold mb-2">No Budgets Found For This Month</h3>
                <p className="text-muted-foreground mb-4 max-w-sm">Set spending targets to gain control over your finances.</p>
                <Button onClick={onClickAdd}>
                    <PlusCircle className="w-4 h-4 mr-2" /> Create Your First Budget
                </Button>
            </CardContent>
        </Card>
    );
}
