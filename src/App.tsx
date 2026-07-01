import { HashRouter, Routes, Route, Navigate, Outlet, useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";

import "./index.css";
import { ThemeProvider } from "./contexts/ThemeContext";
import { AppDataProvider, useAppData } from "./contexts/AppDataContext";
import Sidebar from "./Components/Sidebar";
import AddTransaction from "./Pages/AddTransaction";
import Transactions from "./Pages/Transactions";
import Budgets from "./Pages/Budgets";
import Goals from "./Pages/Goals";
import Dashboard from "./Pages/Dashboard";
import LoginPage from "./Pages/LoginPage";
import SparkConnect from "./Pages/SparkConnect";
import Connections from "./Pages/Connections";
import LandingPage from "./Pages/LandingPage";
import "./App.css";
import { setApiAuthToken } from "./lib/api";

function decodeTokenUsername(token: string) {
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
}

function AppInner() {
    const [isLoggedIn, setIsLoggedIn] = useState<boolean>(false);
    const [isLoading, setIsLoading] = useState<boolean>(true);
    const navigate = useNavigate();
    const { fetchTransactions, fetchBudgets, fetchGoals, onLogout, setUsername, setGlobalError } = useAppData();

    useEffect(() => {
        const token = localStorage.getItem("token");
        const validToken = token && token !== "undefined" && token !== "null" ? token : null;
        const savedUsername = localStorage.getItem("username") || (validToken ? decodeTokenUsername(validToken) : "");
        setApiAuthToken(validToken);
        setIsLoggedIn(Boolean(validToken));
        if (savedUsername) setUsername(savedUsername);
        if (!validToken) {
            localStorage.removeItem("token");
        }
        setIsLoading(false);
    }, [setUsername]);

    useEffect(() => {
        if (!isLoggedIn) return;
        void Promise.all([fetchTransactions(), fetchBudgets(), fetchGoals()]);
    }, [isLoggedIn]);

    useEffect(() => {
        const handleUnauthorized = (e: Event) => {
            const detail = (e as CustomEvent)?.detail;
            onLogout();
            setGlobalError(detail?.message || "Session expired. Please login.");
            setIsLoggedIn(false);
            navigate("/login", { replace: true });
        };
        window.addEventListener("auth:unauthorized", handleUnauthorized as EventListener);
        return () =>
            window.removeEventListener("auth:unauthorized", handleUnauthorized as EventListener);
    }, [navigate, onLogout, setGlobalError]);

    if (isLoading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-slate-950">
                <div className="text-slate-400">Loading...</div>
            </div>
        );
    }

    return (
        <Routes>
            <Route path="/landing" element={<LandingPage />} />
            <Route
                path="/login"
                element={
                    isLoggedIn ? (
                        <Navigate to="/" replace />
                    ) : (
                        <LoginPage
                            setIsLoggedIn={setIsLoggedIn}
                            setUsername={setUsername}
                        />
                    )
                }
            />
            <Route
                path="/"
                element={
                    isLoggedIn ? (
                        <AppLayout />
                    ) : (
                        <Navigate to="/landing" replace />
                    )
                }
            >
                <Route index element={<Dashboard />} />
                <Route path="transactions" element={<Transactions />} />
                <Route path="add" element={<AddTransaction />} />
                <Route path="budgets" element={<Budgets />} />
                <Route path="goals" element={<Goals />} />
                <Route path="spark-connect" element={<SparkConnect />} />
                <Route path="connections" element={<Connections />} />
            </Route>
            <Route path="*" element={<Navigate to="/landing" replace />} />
        </Routes>
    );
}

function AppLayout() {
    return (
        <div className="app-shell">
            <Sidebar />
            <main className="flex-1 bg-slate-50 dark:bg-slate-950 transition-colors duration-300">
                <div className="mx-auto min-h-[calc(100vh-0px)] max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
                    <Outlet />
                </div>
            </main>
        </div>
    );
}

function App() {
    return (
        <ThemeProvider>
            <HashRouter>
                <AppDataProvider>
                    <AppInner />
                </AppDataProvider>
            </HashRouter>
        </ThemeProvider>
    );
}

export default App;