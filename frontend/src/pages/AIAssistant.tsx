import { useState, useRef, useEffect, useCallback } from "react";
import { Bar, BarChart, CartesianGrid, Legend, Pie, PieChart, Cell, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";

// UI Components
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";

// Icons
import { Bot, Send, User as UserIcon, Loader2, History, RefreshCw, ArrowLeft } from "lucide-react";

// Custom Hooks
import { useAuth } from "@/hooks/useAuth";
import { useIsMobile } from "@/hooks/use-mobile"; // Import the mobile detection hook

const API_BASE_URL = 'http://localhost:5000/api';

// --- Types ---
interface Message {
  id: string;
  content: string | { type: 'chart', chartType: 'bar' | 'pie', data: any[] };
  isUser: boolean;
  timestamp: Date;
}

interface QueryHistoryItem {
    id: string;
    question: string;
    sql_query: string;
    user_id: string;
}

// --- Initial Message ---
const initialMessage: Message = {
  id: "initial",
  content: "Hello! As your AI financial assistant, I can answer complex questions about your data. Try asking 'What were my top 5 expenses this month?' or 'Show my total income vs expense for the last 3 months'.",
  isUser: false,
  timestamp: new Date(),
};

// --- Main Component ---
export default function AIAssistant() {
  const { toast } = useToast();
  const { user, token } = useAuth();
  const isMobile = useIsMobile(); // Hook to check for mobile screen size
  
  const [messages, setMessages] = useState<Message[]>([initialMessage]);
  const [inputMessage, setInputMessage] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [history, setHistory] = useState<QueryHistoryItem[]>([]);
  const [mobileView, setMobileView] = useState<'chat' | 'history'>('chat'); // State to manage mobile view
  
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const fetchHistory = useCallback(async () => {
    if (!user || !token) return;
    try {
        const response = await fetch(`${API_BASE_URL}/ai/history`, {
            headers: { 'Authorization': `Bearer ${token}` }
        });
        if (!response.ok) throw new Error("Failed to fetch history.");
        const data = await response.json();
        setHistory(data.history || []);
    } catch (error) {
        console.error("Error fetching history:", error);
    }
  }, [user, token]);

  useEffect(() => {
    fetchHistory();
  }, [fetchHistory]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleSendMessage = async (question: string, rerunSql?: string) => {
    if (!question.trim() || isLoading || !user || !token) {
        if (!user) toast({ title: "Authentication Error", description: "You must be logged in.", variant: "destructive" });
        return;
    }

    if (isMobile) setMobileView('chat'); // Switch back to chat view on sending a message

    const userMessage: Message = { id: Date.now().toString(), content: question, isUser: true, timestamp: new Date() };
    setMessages((prev) => [...prev, userMessage]);
    setInputMessage("");
    setIsLoading(true);

    try {
        let sqlQuery = rerunSql;

        if (!sqlQuery) {
            const genResponse = await fetch(`${API_BASE_URL}/ai/generate-sql`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
                body: JSON.stringify({ question }),
            });
            if (!genResponse.ok) {
                const errorData = await genResponse.json();
                throw new Error(errorData.error || 'Failed to generate SQL.');
            }
            const data = await genResponse.json();
            sqlQuery = data.sql;
        }
        
        if (!sqlQuery) throw new Error("The AI could not generate a valid SQL query.");

        const execResponse = await fetch(`${API_BASE_URL}/ai/execute-sql`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
            body: JSON.stringify({ sqlQuery }),
        });
        if (!execResponse.ok) {
            const errorData = await execResponse.json();
            throw new Error(errorData.error || 'Failed to execute query.');
        }
        const queryResult = await execResponse.json();
        const finalData = queryResult.data || [];

        let aiResponseContent: Message['content'];

        if (finalData.length === 0) {
            aiResponseContent = "I couldn't find any data for your question.";
        } else if (finalData.length === 1 && finalData[0].value && !finalData[0].name) {
            aiResponseContent = `The result is: ${Object.values(finalData[0])[0]}`;
        } else if (finalData.length > 0 && finalData[0].name && finalData[0].value) {
            aiResponseContent = { type: 'chart', chartType: finalData.length > 5 ? 'bar' : 'pie', data: finalData };
        } else {
            aiResponseContent = `Here is the data I found:\n${JSON.stringify(finalData, null, 2)}`;
        }

        const aiMessage: Message = { id: (Date.now() + 1).toString(), content: aiResponseContent, isUser: false, timestamp: new Date() };
        setMessages((prev) => [...prev, aiMessage]);

        fetchHistory();

    } catch (error: any) {
        const errorMessage = `Sorry, an error occurred: ${error.message}`;
        setMessages((prev) => [...prev, { id: 'error', content: errorMessage, isUser: false, timestamp: new Date() }]);
        toast({ title: "AI Assistant Error", description: error.message, variant: "destructive" });
    } finally {
        setIsLoading(false);
    }
  };

  const ChatPanel = () => (
    <Card className="h-[85vh] lg:h-[80vh] flex flex-col">
        <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="flex items-center gap-2"><Bot className="w-5 h-5 text-primary" /> NL-to-SQL Assistant</CardTitle>
            {isMobile && (
                <Button variant="ghost" size="icon" onClick={() => setMobileView('history')}>
                    <History className="w-5 h-5" />
                </Button>
            )}
        </CardHeader>
        <CardContent className="flex-1 flex flex-col overflow-hidden">
            <div className="flex-1 overflow-y-auto space-y-4 p-4 bg-muted/50 rounded-lg">
                {messages.map((message) => <ChatMessage key={message.id} message={message} />)}
                {isLoading && <LoadingMessage />}
                <div ref={messagesEndRef} />
            </div>
            <div className="flex gap-2 pt-4 border-t">
                <Input placeholder="Ask a question..." value={inputMessage} onChange={(e) => setInputMessage(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && handleSendMessage(inputMessage)} disabled={isLoading} />
                <Button onClick={() => handleSendMessage(inputMessage)} disabled={!inputMessage.trim() || isLoading}><Send className="w-4 h-4" /></Button>
            </div>
        </CardContent>
    </Card>
  );

  const HistoryPanel = () => (
    <Card className="h-[85vh] lg:h-[80vh] flex flex-col">
        <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="flex items-center gap-2"><History className="w-5 h-5 text-primary" /> Query History</CardTitle>
            {isMobile && (
                <Button variant="ghost" size="icon" onClick={() => setMobileView('chat')}>
                    <ArrowLeft className="w-5 h-5" />
                </Button>
            )}
        </CardHeader>
        <CardContent className="flex-1 overflow-y-auto">
            <div className="space-y-2">
                {history.length > 0 ? history.map(item => (
                    <div key={item.id} className="text-sm p-3 border rounded-lg hover:bg-muted/50 transition-colors">
                        <p className="font-medium truncate">{item.question}</p>
                        <Button size="sm" variant="link" className="p-0 h-auto mt-1" onClick={() => handleSendMessage(item.question, item.sql_query)} disabled={isLoading}>
                            <RefreshCw className="w-3 h-3 mr-1" /> Rerun Query
                        </Button>
                    </div>
                )) : <p className="text-sm text-muted-foreground text-center py-4">Your recent queries will appear here.</p>}
            </div>
        </CardContent>
    </Card>
  );

  if (isMobile) {
    return (
        <div className="max-w-7xl mx-auto p-4">
            {mobileView === 'chat' ? <ChatPanel /> : <HistoryPanel />}
        </div>
    );
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 max-w-7xl mx-auto">
        <div className="lg:col-span-2">
            <ChatPanel />
        </div>
        <div>
            <HistoryPanel />
        </div>
    </div>
  );
}


// --- Sub-components (ChatMessage, DynamicChart, LoadingMessage) ---
function ChatMessage({ message }: { message: Message }) {
    const renderContent = () => {
        if (typeof message.content === 'string') {
            return <p className="whitespace-pre-wrap text-sm">{message.content}</p>;
        }
        if (message.content?.type === 'chart') {
            return <DynamicChart chartData={message.content} />;
        }
        return <p className="whitespace-pre-wrap text-sm">Sorry, I received a response I can't display.</p>;
    };

    return(
        <div className={`flex items-start gap-3 max-w-full ${message.isUser ? 'justify-end' : 'justify-start'}`}>
            {!message.isUser && <div className="flex-shrink-0 p-2 rounded-full bg-background border"><Bot className="w-5 h-5" /></div>}
            <div className={`max-w-[85%]`}>
                <div className={`p-3 rounded-lg ${message.isUser ? 'bg-primary text-primary-foreground' : 'bg-background border'}`}>
                    {renderContent()}
                </div>
                <p className={`text-xs text-muted-foreground mt-1 ${message.isUser ? 'text-right' : 'text-left'}`}>{message.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</p>
            </div>
            {message.isUser && <div className="flex-shrink-0 p-2 rounded-full bg-primary/10 border"><UserIcon className="w-5 h-5 text-primary" /></div>}
        </div>
    );
}

function DynamicChart({ chartData }: { chartData: { chartType: string, data: any[] } }) {
    const COLORS = Array.from({ length: 10 }, (_, i) => `hsl(var(--chart-${i + 1}))`);

    // ✅ FIX: Make chart width responsive for mobile, but fixed on desktop
    const chartWidth = useIsMobile() ? 300 : 400;

    if (chartData.chartType === 'bar') {
        return (
            <BarChart width={chartWidth} height={300} data={chartData.data} layout="vertical" margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis type="number" hide />
                <YAxis dataKey="name" type="category" width={100} stroke="#888888" fontSize={12} interval={0} />
                <Tooltip formatter={(value: number) => new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR' }).format(value)} cursor={{ fill: 'transparent' }}/>
                <Bar dataKey="value" fill="hsl(var(--chart-1))" radius={[0, 4, 4, 0]} />
            </BarChart>
        );
    }
    if (chartData.chartType === 'pie') {
        return (
            <PieChart width={chartWidth} height={300}>
                <Pie data={chartData.data} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={100} label>
                    {chartData.data.map((entry, index) => <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />)}
                </Pie>
                <Tooltip formatter={(value: number) => new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR' }).format(value)} />
                <Legend />
            </PieChart>
        );
    }
    return <p>Unsupported chart type: {chartData.chartType}</p>;
}

function LoadingMessage() {
    return(
        <div className="flex items-start gap-3 justify-start">
            <div className="flex-shrink-0 p-2 rounded-full bg-background border"><Bot className="w-5 h-5" /></div>
            <div className="bg-background border p-3 rounded-lg"><Loader2 className="w-5 h-5 animate-spin" /></div>
        </div>
    );
}
