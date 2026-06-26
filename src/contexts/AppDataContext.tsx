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
    setUsername: React.Dispatch<React.SetStateAction<string>>;
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
        setTransactions([]);
        setBudgets([]);
        setGoals([]);
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


    useEffect(() => {
        const token = localStorage.getItem("token");
        const savedUsername = localStorage.getItem("username");
        setApiAuthToken(token);
        if (savedUsername) setUsername(savedUsername);
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
                setUsername,
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
        return {
            transactions: [],
            budgets: [],
            goals: [],
            setTransactions: () => {},
            setBudgets: () => {},
            setGoals: () => {},
            setGlobalError: () => {},
            globalError: "",
            username: "",
            setUsername: () => {},
            onLogout: () => {},
            fetchTransactions: async () => {},
            fetchBudgets: async () => {},
            fetchGoals: async () => {},
        };
    }
    return ctx;
}