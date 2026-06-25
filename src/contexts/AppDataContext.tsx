import { createContext, useContext, useState, useEffect, type ReactNode } from "react";
import type { Budget, Goal, Transaction } from "../types";
import { api, setApiAuthToken } from "../lib/api";

interface AppDataContextValue {
    transactions: Transaction[];
    budgets: Budget[];
    goals: Goal[];
    setTransactions: React.Dispatch<React.SetStateAction<Transaction[]>>;
    setBudgets: React.Dispatch<React.SetStateAction<Budget[]>>;
    setGoals: React.Dispatch<React.SetStateAction<Goal[]>>;
    setGlobalError: React.Dispatch<React.SetStateAction<string>>;
    globalError: string;
    username: string;
    onLogout: () => void;
    fetchTransactions: () => Promise<void>;
    fetchBudgets: () => Promise<void>;
    fetchGoals: () => Promise<void>;
}

const AppDataContext = createContext<AppDataContextValue | undefined>(undefined);

export function AppDataProvider({ children }: { children: ReactNode }) {
    const [transactions, setTransactions] = useState<Transaction[]>([]);
    const [budgets, setBudgets] = useState<Budget[]>([]);
    const [goals, setGoals] = useState<Goal[]>([]);
    const [globalError, setGlobalError] = useState<string>("");
    const [username, setUsername] = useState<string>("");

    const logout = () => {
        localStorage.removeItem("token");
        localStorage.removeItem("username");
        setApiAuthToken(null);
        setUsername("");
        setGlobalError("");
    };

    const fetchTransactions = async () => {
        try {
            const response = await api.get("/api/transactions");
            setTransactions(response.data);
            setGlobalError("");
        } catch (error: unknown) {
            console.error("Error fetching transactions:", error);
            const message = error instanceof Error ? error.message : "Failed to fetch transactions";
            setGlobalError(message);
        }
    };

    const fetchBudgets = async () => {
        try {
            const response = await api.get("/api/budgets");
            setBudgets(response.data);
            setGlobalError("");
        } catch (error: unknown) {
            console.error("Error fetching budgets:", error);
            const message = error instanceof Error ? error.message : "Failed to fetch budgets";
            setGlobalError(message);
        }
    };

    const fetchGoals = async () => {
        try {
            const response = await api.get("/api/goals");
            setGoals(response.data);
            setGlobalError("");
        } catch (error: unknown) {
            console.error("Error fetching goals:", error);
            const message = error instanceof Error ? error.message : "Failed to fetch goals";
            setGlobalError(message);
        }
    };

    const fetchAppData = async () => {
        await Promise.all([fetchTransactions(), fetchBudgets(), fetchGoals()]);
    };

    useEffect(() => {
        const token = localStorage.getItem("token");
        const savedUsername = localStorage.getItem("username");
        setApiAuthToken(token);
        if (savedUsername) setUsername(savedUsername);
        if (token) {
            fetchAppData();
        }
    }, []);

    return (
        <AppDataContext.Provider
            value={{
                transactions,
                budgets,
                goals,
                setTransactions,
                setBudgets,
                setGoals,
                setGlobalError,
                globalError,
                username,
                onLogout: logout,
                fetchTransactions,
                fetchBudgets,
                fetchGoals,
            }}
        >
            {children}
        </AppDataContext.Provider>
    );
}

export function useAppData() {
    const ctx = useContext(AppDataContext);
    if (!ctx) {
        throw new Error("useAppData must be used within AppDataProvider");
    }
    return ctx;
}