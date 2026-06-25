import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { useState, useEffect } from "react";

import "./index.css";
import { ThemeProvider } from "./contexts/ThemeContext";
import Sidebar from "./Components/Sidebar.tsx";
import AddTransaction from "./Pages/AddTransaction";
import Transactions from "./Pages/Transactions";
import Budgets from "./Pages/Budgets";
import Goals from "./Pages/Goals";
import LoginPage from "./Pages/LoginPage";
import SparkConnect from "./Pages/SparkConnect";
import Connections from "./Pages/Connections";
import LandingPage from "./Pages/LandingPage";
import "./App.css";
import type { Budget, Goal, Transaction } from "./types";
import { api, setApiAuthToken } from "./lib/api";

function App() {
    const [transactions, setTransactions] = useState<Transaction[]>([]);
    const [budgets, setBudgets] = useState<Budget[]>([]);
    const [goals, setGoals] = useState<Goal[]>([]);
    const [darkMode, setDarkMode] = useState<boolean>(() => {
        const saved = localStorage.getItem("theme");
        return saved !== "light";
    });
    const [isLoggedIn, setIsLoggedIn] = useState<boolean>(false);
    const [username, setUsername] = useState<string>("");
    const [globalError, setGlobalError] = useState<string>("");
    const [isLoading, setIsLoading] = useState<boolean>(true);

    const decodeTokenUsername = (token: string) => {
        try {
            const payload = token.split(".")[1];
            const base64 = payload.replace(/-/g, "+").replace(/_/g, "/");
            const decoded = decodeURIComponent(
                atob(base64)
                    .split("")
                    .map((c) => `%${c.charCodeAt(0).toString(16).padStart(2, "0")}`)
                    .join("")
            );
            const parsed = JSON.parse(decoded);
            return parsed.username || parsed.sub || "";
        } catch {
            return "";
        }
    };

    const logout = () => {
        localStorage.removeItem("token");
        localStorage.removeItem("username");
        setApiAuthToken(null);
        setIsLoggedIn(false);
        setUsername("");
        setGlobalError("");
    };

    useEffect(() => {
        const token = localStorage.getItem('token');
        const savedUsername = localStorage.getItem('username') || (token ? decodeTokenUsername(token) : "");
        setApiAuthToken(token);
        setIsLoggedIn(Boolean(token));
        if (savedUsername) {
            setUsername(savedUsername);
        }
        setIsLoading(false);
    }, []);

    useEffect(() => {
        const handleUnauthorized = (e: Event) => {
            const detail = (e as CustomEvent)?.detail;
            logout();
            setGlobalError(detail?.message || 'Session expired. Please login.');
        };

        window.addEventListener('auth:unauthorized', handleUnauthorized as EventListener);
        return () => window.removeEventListener('auth:unauthorized', handleUnauthorized as EventListener);
    }, []);

    useEffect(() => {
        if (isLoggedIn) {
            void fetchAppData();
        }
    }, [isLoggedIn]);

    useEffect(() => {
        localStorage.setItem("theme", darkMode ? "dark" : "light");
    }, [darkMode]);

    const fetchTransactions = async () => {
        try {
            const response = await api.get('/api/transactions');
            setTransactions(response.data);
            setGlobalError("");
        } catch (error: unknown) {
            console.error('Error fetching transactions:', error);
            const message = error instanceof Error ? error.message : 'Failed to fetch transactions';
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

    return (
        <ThemeProvider>
            <BrowserRouter>
                <Routes>
                    <Route
                        path="/landing"
                        element={isLoading ? null : <LandingPage />}
                    />
                    <Route
                        path="/"
                        element={
                            isLoading ? (
                                <div className="min-h-screen flex items-center justify-center bg-slate-950">
                                    <div className="text-slate-400">Loading...</div>
                                </div>
                            ) : isLoggedIn ? (
                                <div className={`${darkMode ? "dark" : ""} app-shell`}>
                                    <Sidebar
                                        transactions={transactions}
                                        budgets={budgets}
                                        goals={goals}
                                        darkMode={darkMode}
                                        setDarkMode={setDarkMode}
                                        username={username}
                                        devError={globalError}
                                        onLogout={logout}
                                    />
                                </div>
                            ) : (
                                <Navigate to="/landing" replace />
                            )
                        }
                    />
                    <Route
                        path="/login"
                        element={
                            isLoading ? (
                                <div className="min-h-screen flex items-center justify-center bg-slate-950">
                                    <div className="text-slate-400">Loading...</div>
                                </div>
                            ) : isLoggedIn ? (
                                <Navigate to="/" replace />
                            ) : (
                                <LoginPage setIsLoggedIn={setIsLoggedIn} setUsername={setUsername} />
                            )
                        }
                    />
                    <Route
                        path="/add"
                        element={
                            isLoading ? (
                                <div className="min-h-screen flex items-center justify-center bg-slate-950">
                                    <div className="text-slate-400">Loading...</div>
                                </div>
                            ) : isLoggedIn ? (
                                <div className={`${darkMode ? "dark" : ""} app-shell`}>
                                    <AddTransaction
                                        setTransactions={setTransactions}
                                        darkMode={darkMode}
                                        username={username}
                                        setGlobalError={setGlobalError}
                                    />
                                </div>
                            ) : (
                                <Navigate to="/login" replace />
                            )
                        }
                    />
                    <Route
                        path="/transactions"
                        element={
                            isLoading ? (
                                <div className="min-h-screen flex items-center justify-center bg-slate-950">
                                    <div className="text-slate-400">Loading...</div>
                                </div>
                            ) : isLoggedIn ? (
                                <div className={`${darkMode ? "dark" : ""} app-shell`}>
                                    <Transactions
                                        transactions={transactions}
                                        username={username}
                                    />
                                </div>
                            ) : (
                                <Navigate to="/login" replace />
                            )
                        }
                    />
                    <Route
                        path="/budgets"
                        element={
                            isLoading ? (
                                <div className="min-h-screen flex items-center justify-center bg-slate-950">
                                    <div className="text-slate-400">Loading...</div>
                                </div>
                            ) : isLoggedIn ? (
                                <div className={`${darkMode ? "dark" : ""} app-shell`}>
                                    <Budgets
                                        budgets={budgets}
                                        transactions={transactions}
                                        username={username}
                                        setBudgets={setBudgets}
                                        setGlobalError={setGlobalError}
                                    />
                                </div>
                            ) : (
                                <Navigate to="/login" replace />
                            )
                        }
                    />
                    <Route
                        path="/goals"
                        element={
                            isLoading ? (
                                <div className="min-h-screen flex items-center justify-center bg-slate-950">
                                    <div className="text-slate-400">Loading...</div>
                                </div>
                            ) : isLoggedIn ? (
                                <div className={`${darkMode ? "dark" : ""} app-shell`}>
                                    <Goals
                                        goals={goals}
                                        setGoals={setGoals}
                                        setGlobalError={setGlobalError}
                                        username={username}
                                    />
                                </div>
                            ) : (
                                <Navigate to="/login" replace />
                            )
                        }
                    />
                    <Route
                        path="/spark-connect"
                        element={
                            isLoading ? (
                                <div className="min-h-screen flex items-center justify-center bg-slate-950">
                                    <div className="text-slate-400">Loading...</div>
                                </div>
                            ) : isLoggedIn ? (
                                <div className={`${darkMode ? "dark" : ""} app-shell`}>
                                    <SparkConnect />
                                </div>
                            ) : (
                                <Navigate to="/login" replace />
                            )
                        }
                    />
                    <Route
                        path="/connections"
                        element={
                            isLoading ? (
                                <div className="min-h-screen flex items-center justify-center bg-slate-950">
                                    <div className="text-slate-400">Loading...</div>
                                </div>
                            ) : isLoggedIn ? (
                                <div className={`${darkMode ? "dark" : ""} app-shell`}>
                                    <Connections />
                                </div>
                            ) : (
                                <Navigate to="/login" replace />
                            )
                        }
                    />
                </Routes>
            </BrowserRouter>
        </ThemeProvider>
    );
}

export default App;