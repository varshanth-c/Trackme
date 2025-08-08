import { useState, useMemo } from "react";
import { format, startOfWeek, endOfWeek, startOfMonth, endOfMonth, startOfYear, endOfYear, subWeeks, subMonths, subYears, parseISO } from "date-fns";
import { useIsMobile } from "@/hooks/use-mobile"; // For mobile-specific logic

// UI Components and Icons
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import { Sigma, Landmark, Wallet, TrendingUp, Loader2, ArrowUpRight, ArrowDownRight } from "lucide-react";

// Recharts for charts - Now using AreaChart
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from "recharts";

// Custom Hooks and Types
import { useLanguage } from "@/contexts/LanguageContext";
import { useGetTransactions, Transaction } from "@/hooks/useTransactions";

// --- Main Dashboard Component ---
export default function SmartDashboard() {
  const { t } = useLanguage();
  const isMobile = useIsMobile();
  
  const [timePeriod, setTimePeriod] = useState<"week" | "month" | "year">("month");
  const { data: transactions, isLoading } = useGetTransactions();

  const dashboardData = useMemo(() => {
    if (!transactions) return null;

    const now = new Date();
    let currentPeriod = { start: now, end: now };
    let previousPeriod = { start: now, end: now };

    if (timePeriod === "week") {
      currentPeriod = { start: startOfWeek(now, { weekStartsOn: 1 }), end: endOfWeek(now, { weekStartsOn: 1 }) };
      previousPeriod = { start: startOfWeek(subWeeks(now, 1)), end: endOfWeek(subWeeks(now, 1)) };
    } else if (timePeriod === "month") {
      currentPeriod = { start: startOfMonth(now), end: endOfMonth(now) };
      previousPeriod = { start: startOfMonth(subMonths(now, 1)), end: endOfMonth(subMonths(now, 1)) };
    } else { // year
      currentPeriod = { start: startOfYear(now), end: endOfYear(now) };
      previousPeriod = { start: startOfYear(subYears(now, 1)), end: endOfYear(subYears(now, 1)) };
    }
    
    const currentTx = transactions.filter(tx => {
      const txDate = parseISO(tx.date as string);
      return txDate >= currentPeriod.start && txDate <= currentPeriod.end;
    });
    const previousTx = transactions.filter(tx => {
      const txDate = parseISO(tx.date as string);
      return txDate >= previousPeriod.start && txDate <= previousPeriod.end;
    });
    
    const calculateStats = (txs: Transaction[]) => {
      const income = txs.filter(t => t.type === 'income').reduce((sum, item) => sum + parseFloat(item.amount as string), 0);
      const expense = txs.filter(t => t.type === 'expense').reduce((sum, item) => sum + parseFloat(item.amount as string), 0);
      const investment = txs.filter(t => t.type === 'investment').reduce((sum, item) => sum + parseFloat(item.amount as string), 0);
      const revenue = income - expense;
      const netSavings = revenue - investment;
      return { income, expense, investment, revenue, netSavings };
    };
    
    const currentStats = calculateStats(currentTx);
    const previousStats = calculateStats(previousTx);

    const getChange = (current: number, previous: number) => {
      if (previous === 0) return current > 0 ? 100 : 0;
      if (current === previous) return 0;
      return ((current - previous) / Math.abs(previous)) * 100;
    };
    
    const groupFormat = timePeriod === 'year' ? 'MMM' : 'MMM d';
    const groupedData = currentTx.reduce((acc, tx) => {
      const key = format(parseISO(tx.date as string), groupFormat);
      if (!acc[key]) acc[key] = { name: key, income: 0, expense: 0 };
      const amount = parseFloat(tx.amount as string);
      if (tx.type === 'income') acc[key].income += amount;
      if (tx.type === 'expense') acc[key].expense += amount;
      return acc;
    }, {} as Record<string, {name: string; income: number; expense: number}>);

    const chartData = Object.values(groupedData).map(d => ({ ...d, revenue: d.income - d.expense })).sort((a, b) => new Date(a.name).getTime() - new Date(b.name).getTime());

    return {
      stats: {
        revenue: { value: currentStats.revenue, change: getChange(currentStats.revenue, previousStats.revenue) },
        netSavings: { value: currentStats.netSavings, change: getChange(currentStats.netSavings, previousStats.netSavings) },
        investment: { value: currentStats.investment, change: getChange(currentStats.investment, previousStats.investment) },
        income: { value: currentStats.income, change: getChange(currentStats.income, previousStats.income) }
      },
      chartData,
      recentTransactions: currentTx.sort((a,b) => parseISO(b.date as string).getTime() - parseISO(a.date as string).getTime()).slice(0, 5)
    };
  }, [transactions, timePeriod]);

  if (isLoading) {
    return <div className="flex items-center justify-center min-h-[400px]"><Loader2 className="w-8 h-8 animate-spin text-primary" /></div>;
  }
  
  return (
    // Responsive spacing for the entire page
    <div className="space-y-4 md:space-y-6">
      {/* Responsive header: stacks on mobile, row on desktop */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold">{t("dashboard")}</h1>
          <p className="text-muted-foreground">{t("your_financial_overview_for_this")} {t(timePeriod)}</p>
        </div>
        <ToggleGroup type="single" value={timePeriod} onValueChange={(value: "week" | "month" | "year") => value && setTimePeriod(value)} aria-label="Select Time Period">
          <ToggleGroupItem value="week" aria-label="This Week">{t('week')}</ToggleGroupItem>
          <ToggleGroupItem value="month" aria-label="This Month">{t('month')}</ToggleGroupItem>
          <ToggleGroupItem value="year" aria-label="This Year">{t('year')}</ToggleGroupItem>
        </ToggleGroup>
      </div>

      {dashboardData ? (
        <>
          {/* Responsive grid for stats: 2 columns on mobile, 4 on desktop */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
            <StatCard title="Revenue" value={dashboardData.stats.revenue.value} change={dashboardData.stats.revenue.change} icon={Sigma} />
            <StatCard title="Net Savings" value={dashboardData.stats.netSavings.value} change={dashboardData.stats.netSavings.change} icon={Landmark} />
            <StatCard title="Investment" value={dashboardData.stats.investment.value} change={dashboardData.stats.investment.change} icon={Wallet} isSubtle />
            <StatCard title="Total Income" value={dashboardData.stats.income.value} change={dashboardData.stats.income.change} icon={TrendingUp} isSubtle />
          </div>

          {/* New AreaChart */}
          <Card>
            <CardHeader>
              <CardTitle>Performance Trend</CardTitle>
              <CardDescription>Income vs. Expense for this {t(timePeriod)}.</CardDescription>
            </CardHeader>
            <CardContent className="pl-2">
              <ResponsiveContainer width="100%" height={350}>
                <AreaChart data={dashboardData.chartData} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
                  {/* Defining gradients for a more beautiful chart fill */}
                  <defs>
                    <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="hsl(var(--chart-1))" stopOpacity={0.8}/>
                      <stop offset="95%" stopColor="hsl(var(--chart-1))" stopOpacity={0}/>
                    </linearGradient>
                    <linearGradient id="colorIncome" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="hsl(var(--chart-2))" stopOpacity={0.8}/>
                      <stop offset="95%" stopColor="hsl(var(--chart-2))" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} />
                  <XAxis dataKey="name" stroke="hsl(var(--muted-foreground))" fontSize={12} tickLine={false} axisLine={false} tickCount={isMobile ? 5 : undefined} />
                  <YAxis stroke="hsl(var(--muted-foreground))" fontSize={12} tickLine={false} axisLine={false} tickFormatter={(value) => `₹${new Intl.NumberFormat('en-IN', { notation: 'compact', compactDisplay: 'short' }).format(value)}`} />
                  <Tooltip content={<CustomTooltip />} />
                  <Legend />
                  <Area type="monotone" name="Income" dataKey="income" stroke="hsl(var(--chart-2))" fill="url(#colorIncome)" strokeWidth={2} />
                  <Area type="monotone" name="Revenue" dataKey="revenue" stroke="hsl(var(--chart-1))" fill="url(#colorRevenue)" strokeWidth={2} />
                </AreaChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Recent Transactions</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {dashboardData.recentTransactions.length > 0 ? dashboardData.recentTransactions.map(tx => (
                  <TransactionRow key={tx.id} transaction={tx} />
                )) : (
                  <p className="text-muted-foreground text-center py-4">No transactions in this period.</p>
                )}
              </div>
            </CardContent>
          </Card>
        </>
      ) : (
        <Card className="flex items-center justify-center h-64"><p className="text-muted-foreground">Add transactions to see your dashboard.</p></Card>
      )}
    </div>
  );
}


// --- Helper and Custom Components ---

// StatCard remains largely the same but is now inside a responsive grid
function StatCard({ title, value, change, icon: Icon, isSubtle = false }: { title: string; value: number; change: number; icon: React.ElementType, isSubtle?: boolean }) {
  const isPositive = change >= 0;
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className={`text-sm font-medium ${isSubtle ? 'text-muted-foreground' : ''}`}>{title}</CardTitle>
        <Icon className="h-4 w-4 text-muted-foreground" />
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold">{new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(value)}</div>
        {isFinite(change) && (
          <p className={`text-xs ${isPositive ? 'text-emerald-500' : 'text-red-500'} flex items-center`}>
            {isPositive ? <TrendingUp className="w-3 h-3 mr-1" /> : <TrendingDown className="w-3 h-3 mr-1" />}
            {isPositive ? '+' : ''}{change.toFixed(1)}% vs last period
          </p>
        )}
      </CardContent>
    </Card>
  );
}

// TransactionRow layout is simple and naturally responsive
function TransactionRow({ transaction: tx }: { transaction: Transaction }) {
  const isIncome = tx.type === 'income';
  const color = isIncome ? 'text-green-500' : tx.type === 'expense' ? 'text-red-500' : 'text-blue-500';
  const Icon = isIncome ? ArrowUpRight : ArrowDownRight;
  const amount = parseFloat(tx.amount as string);
  return (
    <div className="flex items-center gap-4">
      <div className={`p-2 rounded-full ${color}/10 hidden sm:flex`}><Icon className={`w-5 h-5 ${color}`} /></div>
      <div className="flex-grow"><p className="font-semibold">{tx.description}</p><p className="text-sm text-muted-foreground">{tx.category}</p></div>
      <div className="text-right flex-shrink-0"><p className={`font-bold ${color}`}>{isIncome ? '+' : '-'}{new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR' }).format(amount)}</p><p className="text-sm text-muted-foreground">{format(parseISO(tx.date as string), 'MMM d')}</p></div>
    </div>
  );
}

// A custom tooltip for a much better user experience on the chart
function CustomTooltip({ active, payload, label }: any) {
    if (active && payload && payload.length) {
        return (
            <div className="p-4 bg-background border rounded-lg shadow-lg">
                <p className="font-bold text-lg mb-2">{label}</p>
                {payload.map((pld: any) => (
                    <div key={pld.dataKey} className="flex items-center justify-between">
                        <div className="flex items-center">
                            <div className="w-2.5 h-2.5 rounded-full mr-2" style={{ backgroundColor: pld.stroke }}></div>
                            <p className="text-sm text-muted-foreground">{pld.name}:</p>
                        </div>
                        <p className="font-semibold ml-4">{new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR' }).format(pld.value)}</p>
                    </div>
                ))}
            </div>
        );
    }
    return null;
}