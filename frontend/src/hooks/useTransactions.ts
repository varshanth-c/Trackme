import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/useAuth"; // Import your custom auth hook

// The base URL of your backend API
const API_BASE_URL = 'http://localhost:5000/api';

// --- 1. Interfaces matching your backend schema ---
export interface Transaction {
  id: string;
  user_id: string;
  amount: number | string; // The database returns decimal as string
  date: string;
  description: string;
  category: string;
  type: string;
  subcategory?: string | null;
  notes?: string | null;
  receipt_photo_url?: string | null;
  created_at: string;
  updated_at: string;
}

// Data needed to create a transaction (user_id will be added from the auth hook)
export type NewTransaction = Omit<Transaction, 'id' | 'user_id' | 'created_at' | 'updated_at'>;

// Data needed to update a transaction (id is separate, user_id from auth hook)
export type UpdateTransactionPayload = Partial<NewTransaction>;


// The key used by react-query to cache transaction data
const TRANSACTIONS_QUERY_KEY = ["transactions"];


/**
 * HOOK: useGetTransactions
 * Fetches all transactions for the currently logged-in user.
 */
export const useGetTransactions = () => {
  const { user, token } = useAuth();

  return useQuery<Transaction[], Error>({
    queryKey: [TRANSACTIONS_QUERY_KEY, user?.id], // Query key is now user-specific
    queryFn: async () => {
      if (!user || !token) throw new Error("User not authenticated.");

      const response = await fetch(`${API_BASE_URL}/transactions?user_id=${user.id}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });
      
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || "Failed to fetch transactions.");
      
      return data.transactions || [];
    },
    // Only run the query if the user and token are available
    enabled: !!user && !!token,
  });
};

/**
 * HOOK: useAddTransaction
 * Adds a new transaction for the logged-in user.
 */
export const useAddTransaction = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const { user, token } = useAuth();

  return useMutation<any, Error, NewTransaction>({
    mutationFn: async (transactionData) => {
      if (!user || !token) throw new Error("User not authenticated.");

      const payload = {
        ...transactionData,
        user_id: user.id, // Add the user_id to the payload
      };

      const response = await fetch(`${API_BASE_URL}/transactions`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify(payload),
      });

      const data = await response.json();
      if (!response.ok) throw new Error(data.error || "Failed to add transaction.");
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [TRANSACTIONS_QUERY_KEY, user?.id] });
      toast({
        title: "Success",
        description: "Transaction added successfully!",
      });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    },
  });
};

/**
 * HOOK: useUpdateTransaction
 * Updates an existing transaction.
 */
export const useUpdateTransaction = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const { user, token } = useAuth();

  return useMutation<any, Error, { id: string; payload: UpdateTransactionPayload }>({
    mutationFn: async ({ id, payload }) => {
      if (!user || !token) throw new Error("User not authenticated.");
      
      const updatePayload = {
        ...payload,
        user_id: user.id, // Your backend requires user_id for security
      };

      const response = await fetch(`${API_BASE_URL}/transactions/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify(updatePayload),
      });

      const data = await response.json();
      if (!response.ok) throw new Error(data.error || "Failed to update transaction.");
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [TRANSACTIONS_QUERY_KEY, user?.id] });
      toast({
        title: "Success",
        description: "Transaction updated successfully!",
      });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    },
  });
};


/**
 * HOOK: useDeleteTransaction
 * Deletes a transaction by its ID.
 */
export const useDeleteTransaction = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const { user, token } = useAuth();

  return useMutation<any, Error, string>({ // The third type is the transaction ID (string)
    mutationFn: async (id: string) => {
      if (!user || !token) throw new Error("User not authenticated.");

      const response = await fetch(`${API_BASE_URL}/transactions/${id}`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        // Your backend requires the user_id in the body for secure deletion
        body: JSON.stringify({ user_id: user.id }),
      });

      const data = await response.json();
      if (!response.ok) throw new Error(data.error || "Failed to delete transaction.");
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [TRANSACTIONS_QUERY_KEY, user?.id] });
      toast({
        title: "Success",
        description: "Transaction deleted successfully!",
      });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    },
  });
};