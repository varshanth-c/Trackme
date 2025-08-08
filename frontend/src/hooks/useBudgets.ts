import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/useAuth"; // Import your custom auth hook

const API_BASE_URL = 'https://trackme-yeae.onrender.com/api';

// --- Main Interface & Types ---
export interface Budget {
  id: string;
  user_id: string;
  category: string;
  amount: number | string; // Amount can be a string from the API
  month: string; // Format: YYYY-MM
  created_at: string;
  updated_at: string;
}

// Data needed for setting a budget
export type NewBudgetPayload = Omit<Budget, "id" | "user_id" | "created_at" | "updated_at">;

// ✅ NEW: Type for the email alert payload
export interface AlertPayload {
    userEmail: string;
    category: string;
    spentAmount: number;
    budgetAmount: number;
}

const BUDGETS_QUERY_KEY = "budgets";

// --- Data Fetching Hook ---
export function useGetBudgets(month: string) {
  const { user, token } = useAuth();

  return useQuery<Budget[], Error>({
    queryKey: [BUDGETS_QUERY_KEY, user?.id, month],
    queryFn: async () => {
      if (!user || !token || !month) {
        throw new Error("User not authenticated or month not provided.");
      }
      const response = await fetch(`${API_BASE_URL}/budgets?user_id=${user.id}&month=${month}`, {
        headers: { 'Authorization': `Bearer ${token}` },
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || "Failed to fetch budgets.");
      return data.budgets || [];
    },
    enabled: !!user && !!token && !!month,
  });
}

// --- Data Mutation Hooks ---

export function useSetBudget() {
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const { user, token } = useAuth();

  return useMutation<any, Error, NewBudgetPayload>({
    mutationFn: async (budgetData) => {
      if (!user || !token) throw new Error("User not authenticated");
      const payload = { ...budgetData, user_id: user.id };
      const response = await fetch(`${API_BASE_URL}/budgets`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
        body: JSON.stringify(payload),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || "Failed to set budget.");
      return data;
    },
    onSuccess: (data, variables) => {
      queryClient.invalidateQueries({ queryKey: [BUDGETS_QUERY_KEY, user?.id, variables.month] });
      toast({ title: "Success", description: "Budget has been set!" });
    },
    onError: (error: Error) => {
        toast({ title: "Error", description: error.message, variant: "destructive" });
    },
  });
}

export function useDeleteBudget() {
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const { user, token } = useAuth();

  return useMutation<any, Error, { id: string; month: string }>({
    mutationFn: async ({ id }) => {
      if (!user || !token) throw new Error("User not authenticated");
      const response = await fetch(`${API_BASE_URL}/budgets/${id}`, {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
        body: JSON.stringify({ user_id: user.id }),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || "Failed to delete budget.");
      return data;
    },
    onSuccess: (data, variables) => {
      queryClient.invalidateQueries({ queryKey: [BUDGETS_QUERY_KEY, user?.id, variables.month] });
      toast({ title: "Success", description: "Budget deleted." });
    },
    onError: (error: Error) => {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    },
  });
}

/**
 * ✅ NEW HOOK: Sends a POST request to your backend to trigger an email.
 */
export function useSendBudgetAlert() {
  const { toast } = useToast();
  const { token } = useAuth();
  return useMutation<any, Error, AlertPayload>({
    mutationFn: async (payload) => {
      if (!token) throw new Error("User not authenticated.");

      const response = await fetch(`${API_BASE_URL}/notifications/send-budget-alert`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify(payload),
      });

      const responseData = await response.json();
      if (!response.ok) {
        throw new Error(responseData.message || 'Request to email server failed.');
      }
      return responseData;
    },
    onSuccess: (data) => {
      toast({
        title: "Email Sent",
        description: data.message || "The budget alert has been sent successfully.",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Email Error",
        description: error.message,
        variant: "destructive",
      });
    },
  });
}
