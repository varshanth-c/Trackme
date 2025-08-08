import { useState, useMemo } from "react";
import { format, parseISO, subDays, startOfMonth, endOfMonth, startOfYear, endOfYear, subMonths, endOfDay, startOfDay } from "date-fns";

// UI Components
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";

// Icons
import { TrendingUp, TrendingDown, Landmark, Briefcase, Wallet, Target, Bot, AlertTriangle, PieChart as PieIcon, Loader2, BarChart3, LineChart as LineChartIcon, Sigma } from "lucide-react";

// Charting Library
import { Bar, BarChart, CartesianGrid, Legend, Line, LineChart as RechartsLineChart, Pie, PieChart as RechartsPieChart, ResponsiveContainer, Tooltip, XAxis, YAxis, Cell, ComposedChart, Sector } from "recharts";

// Custom Hooks
import { useLanguage } from "@/contexts/LanguageContext";
import { useGetTransactions, Transaction } from "@/hooks/useTransactions";
import { useIsMobile } from "@/hooks/use-mobile"; // Import the mobile hook

// --- Custom Hook for Centralized Data Logic ---
const useDashboardData = ({ transactions, period }: { transactions: Transaction[] | undefined; period: string }) => {
  return useMemo(() => {
    if (!transactions || transactions.length === 0) return null;

    const now = new Date();
    let startDate: Date;
    let endDate: Date = endOfDay(now);

    switch (period) {
        case 'last_7_days':
            startDate = startOfDay(subDays(now, 6));
            break;
        case 'last_30_days':
            startDate = startOfDay(subDays(now, 29));
            break;
        case 'this_month':
            startDate = startOfMonth(now);
            endDate = endOfMonth(now);
            break;
        case 'last_month':
            const lastMonthStart = startOfMonth(subMonths(now, 1));
            startDate = lastMonthStart;
            endDate = endOfMonth(lastMonthStart);
            break;
        default: // 'this_year'
            startDate = startOfYear(now);
            endDate = endOfYear(now);
    }

    const filteredTx = transactions.filter(tx => {
        const txDate = parseISO(tx.date as string);
        return txDate >= startDate && txDate <= endDate;
    });

    if (filteredTx.length < 3) return { isEmpty: true };

    const isShortPeriod = period === 'last_7_days' || period === 'last_30_days';
    const timeFormat = isShortPeriod ? 'MMM d' : 'MMM';
    const groupedData = filteredTx.reduce((acc, tx) => {
      const key = format(parseISO(tx.date as string), timeFormat);
      if (!acc[key]) {
        acc[key] = { name: key, income: 0, expense: 0, investment: 0 };
      }
      const amount = parseFloat(tx.amount as string);
      if (tx.type === 'income') acc[key].income += amount;
      if (tx.type === 'expense') acc[key].expense += amount;
      if (tx.type === 'investment') acc[key].investment += amount;
      return acc;
    }, {} as Record<string, { name: string; income: number; expense: number; investment: number }>);
    
    const chartData = Object.values(groupedData).map(d => {
        const revenue = d.income - d.expense;
        const profitMargin = d.income > 0 ? (revenue / d.income) * 100 : 0;
        return { ...d, revenue, profitMargin };
    });

    const totalIncome = chartData.reduce((sum, d) => sum + d.income, 0);
    const totalExpense = chartData.reduce((sum, d) => sum + d.expense, 0);
    const totalInvestment = chartData.reduce((sum, d) => sum + d.investment, 0);
    const totalRevenue = totalIncome - totalExpense;
    const netSavings = totalRevenue - totalInvestment;
    
    const expenseByCategory = filteredTx
      .filter(tx => tx.type === 'expense')
      .reduce((acc, tx) => {
        const amount = parseFloat(tx.amount as string);
        acc[tx.category] = (acc[tx.category] || 0) + amount;
        return acc;
      }, {} as Record<string, number>);

    return { totalIncome, totalExpense, totalInvestment, totalRevenue, netSavings, chartData, expenseByCategory, isEmpty: false };
  }, [transactions, period]);
};


// --- Main Dashboard Component ---
export default function VendorAnalyticsDashboard() {
  const { t } = useLanguage();
  const { data: transactions, isLoading } = useGetTransactions();
  const isMobile = useIsMobile();

  const [period, setPeriod] = useState('this_year');
  const [chartView, setChartView] = useState('cashflow_trend');

  const dashboardData = useDashboardData({ transactions, period });

  if (isLoading) return <div className="flex items-center justify-center h-96"><Loader2 className="w-8 h-8 animate-spin text-primary" /></div>;
  
  return (
    <div className="space-y-6 p-4 md:p-0">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold">{t("vendor_analytics")}</h1>
          <p className="text-muted-foreground">{t("deep_dive_into_your_business_performance")}</p>
        </div>
        <div className="flex gap-2">
            <Select value={period} onValueChange={setPeriod}>
                <SelectTrigger className="w-full md:w-48"><SelectValue placeholder="Select Period" /></SelectTrigger>
                <SelectContent>
                    <SelectItem value="last_7_days">Last 7 Days</SelectItem>
                    <SelectItem value="last_30_days">Last 30 Days</SelectItem>
                    <SelectItem value="this_month">This Month</SelectItem>
                    <SelectItem value="last_month">Last Month</SelectItem>
                    <SelectItem value="this_year">This Year</SelectItem>
                </SelectContent>
            </Select>
        </div>
      </div>
      
      {!dashboardData || dashboardData.isEmpty ? (
          <NoDataForPeriod />
      ) : (
        <>
          <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-4">
              <StatCard title="Total Revenue" value={dashboardData.totalRevenue} icon={TrendingUp} />
              <StatCard title="Total Investment" value={dashboardData.totalInvestment} icon={Briefcase} />
              <StatCard title="Net Savings" value={dashboardData.netSavings} icon={Landmark} />
              <StatCard title="Total Expenses" value={dashboardData.totalExpense} icon={TrendingDown} isSubtle />
          </div>

          {/* ✅ RESPONSIVE CHART LAYOUT */}
          <div className={`grid gap-6 ${isMobile ? 'grid-cols-1' : 'lg:grid-cols-3'}`}>
              <Card className={isMobile ? '' : 'lg:col-span-2'}>
                  <CardHeader>
                      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2">
                          <div>
                              <CardTitle>Financial Analysis</CardTitle>
                              <CardDescription>Select a view to analyze your data.</CardDescription>
                          </div>
                          <Select value={chartView} onValueChange={setChartView}>
                              <SelectTrigger className="w-full sm:w-[200px]"><SelectValue placeholder="Select Chart" /></SelectTrigger>
                              <SelectContent>
                                  <SelectItem value="cashflow_trend">Cash Flow Trend</SelectItem>
                                  <SelectItem value="income_vs_expense">Income vs. Expense</SelectItem>
                                  <SelectItem value="profitability_trend">Profitability Trend</SelectItem>
                              </SelectContent>
                          </Select>
                      </div>
                  </CardHeader>
                  <CardContent className="pl-2">
                    {chartView === 'cashflow_trend' && <CashflowLineChart data={dashboardData.chartData} />}
                    {chartView === 'income_vs_expense' && <IncomeExpenseBarChart data={dashboardData.chartData} />}
                    {chartView === 'profitability_trend' && <ProfitabilityLineChart data={dashboardData.chartData} />}
                  </CardContent>
              </Card>
              <Card>
                  <CardHeader>
                      <CardTitle>Expense Breakdown</CardTitle>
                      <CardDescription>Spending by category for the period.</CardDescription>
                  </CardHeader>
                  <CardContent>
                      <ExpenseDonutChart data={dashboardData.expenseByCategory} />
                  </CardContent>
              </Card>
          </div>
        </>
      )}
    </div>
  );
}

// --- Chart Sub-components for Clarity ---

const ChartTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    return (
      <div className="rounded-lg border bg-background p-2 shadow-sm">
        <p className="text-sm font-bold mb-1">{label}</p>
        {payload.map((entry: any, index: number) => (
          <p key={index} style={{ color: entry.color }} className="text-xs">
            {`${entry.name}: ${entry.unit === '%' ? '' : '₹'}${entry.value.toLocaleString()}${entry.unit || ''}`}
          </p>
        ))}
      </div>
    );
  }
  return null;
};

function CashflowLineChart({ data }: { data: any[] }) {
    return(
        <ResponsiveContainer width="100%" height={350}>
            <RechartsLineChart data={data}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" stroke="#888888" fontSize={12} />
                <YAxis stroke="#888888" fontSize={12} tickFormatter={(value) => `₹${(value/1000).toFixed(0)}k`} />
                <Tooltip content={<ChartTooltip />} />
                <Legend />
                <Line type="monotone" name="Income" dataKey="income" stroke="hsl(var(--chart-1))" strokeWidth={2} />
                <Line type="monotone" name="Expenses" dataKey="expense" stroke="hsl(var(--chart-2))" strokeWidth={2} />
                <Line type="monotone" name="Investment" dataKey="investment" stroke="hsl(var(--chart-3))" strokeWidth={2} />
            </RechartsLineChart>
        </ResponsiveContainer>
    );
}

function IncomeExpenseBarChart({ data }: { data: any[] }) {
    return(
        <ResponsiveContainer width="100%" height={350}>
            <BarChart data={data}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" stroke="#888888" fontSize={12} />
                <YAxis stroke="#888888" fontSize={12} tickFormatter={(value) => `₹${(value/1000).toFixed(0)}k`} />
                <Tooltip content={<ChartTooltip />} />
                <Legend />
                <Bar name="Income" dataKey="income" fill="hsl(var(--chart-1))" radius={[4, 4, 0, 0]} />
                <Bar name="Expenses" dataKey="expense" fill="hsl(var(--chart-2))" radius={[4, 4, 0, 0]} />
            </BarChart>
        </ResponsiveContainer>
    );
}

function ProfitabilityLineChart({ data }: { data: any[] }) {
    return(
        <ResponsiveContainer width="100%" height={350}>
            <ComposedChart data={data}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" stroke="#888888" fontSize={12} />
                <YAxis yAxisId="left" stroke="hsl(var(--chart-4))" tickFormatter={(value) => `₹${(value/1000).toFixed(0)}k`} />
                <YAxis yAxisId="right" orientation="right" stroke="hsl(var(--chart-5))" tickFormatter={(value) => `${value.toFixed(0)}%`} />
                <Tooltip content={<ChartTooltip />} />
                <Legend />
                <Bar yAxisId="left" name="Investment" dataKey="investment" fill="hsl(var(--chart-4))" />
                <Line yAxisId="right" type="monotone" name="Profit Margin" dataKey="profitMargin" stroke="hsl(var(--chart-5))" strokeWidth={2} unit="%" />
            </ComposedChart>
        </ResponsiveContainer>
    );
}

// ✅ FIX: A more robust custom label renderer for the Pie Chart
const renderCustomizedLabel = (props: any) => {
    const { cx, cy, midAngle, outerRadius, fill, percent, name } = props;
    const RADIAN = Math.PI / 180;
    // This is a bit of math to calculate the position of the label line
    const sin = Math.sin(-RADIAN * midAngle);
    const cos = Math.cos(-RADIAN * midAngle);
    const sx = cx + (outerRadius + 10) * cos;
    const sy = cy + (outerRadius + 10) * sin;
    const mx = cx + (outerRadius + 30) * cos;
    const my = cy + (outerRadius + 30) * sin;
    const ex = mx + (cos >= 0 ? 1 : -1) * 22;
    const ey = my;
    const textAnchor = cos >= 0 ? 'start' : 'end';

    return (
        <g>
            <path d={`M${sx},${sy}L${mx},${my}L${ex},${ey}`} stroke={fill} fill="none" />
            <circle cx={sx} cy={sy} r={2} fill={fill} stroke="none" />
            <text x={ex + (cos >= 0 ? 1 : -1) * 12} y={ey} textAnchor={textAnchor} fill="hsl(var(--foreground))" fontSize={12}>
                {`${name} (${(percent * 100).toFixed(0)}%)`}
            </text>
        </g>
    );
};

function ExpenseDonutChart({ data }: { data: Record<string, number> }) {
    const chartData = useMemo(() => Object.entries(data).map(([name, value]) => ({ name, value })), [data]);
    const COLORS = Array.from({ length: chartData.length }, (_, i) => `hsl(var(--chart-${i + 1}))`);
    return(
        <ResponsiveContainer width="100%" height={350}>
  <RechartsPieChart margin={{ top: 20, right: 80, bottom: 20, left: 20 }}>
    <Pie 
      data={chartData} 
      dataKey="value" 
      nameKey="name" 
      cx="50%" 
      cy="50%" 
      innerRadius={70} 
      outerRadius={90} 
      paddingAngle={5} 
      // labelLine
      // label={renderCustomizedLabel}
    >
      {chartData.map((entry, index) => (
        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
      ))}
    </Pie>
    <Tooltip formatter={(value: number) => `₹${value.toLocaleString()}`} />
  </RechartsPieChart>
</ResponsiveContainer>
    );
}


// --- Helper UI Components ---
function StatCard({ title, value, icon: Icon, isSubtle = false }: { title: string; value: number; icon: React.ElementType; isSubtle?: boolean }) {
    const colorClass = value >= 0 ? 'text-green-600' : 'text-red-600';
    return (
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className={`text-sm font-medium ${isSubtle ? 'text-muted-foreground' : ''}`}>{title}</CardTitle>
          <Icon className={`h-4 w-4 text-muted-foreground`} />
        </CardHeader>
        <CardContent>
          <div className={`text-2xl font-bold ${isSubtle ? '' : colorClass}`}>
             {value < 0 ? `-₹${Math.abs(value).toLocaleString()}` : `₹${value.toLocaleString()}`}
          </div>
        </CardContent>
      </Card>
    );
}

function NoDataForPeriod() {
    return (
        <Card className="flex flex-col items-center justify-center text-center py-16">
            <CardContent>
                <Sigma className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
                <h3 className="text-xl font-semibold mb-2">Not Enough Data</h3>
                <p className="text-muted-foreground">There are no transactions for the selected period. Please choose another or add new data.</p>
            </CardContent>
        </Card>
    );
}