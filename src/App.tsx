import { BrowserRouter, Routes, Route, Navigate, Outlet } from "react-router-dom";
import { useState, useEffect } from "react";

import "./index.css";
import { ThemeProvider, useTheme } from "./contexts/ThemeContext";
import { AppDataProvider, useAppData } from "./contexts/AppDataContext";
import Sidebar from "./Components/Sidebar";
import AddTransaction from "./Pages/AddTransaction";
import Transactions from "./Pages/Transactions";
import Budgets from "./Pages/Budgets";
import Goals from "./Pages/Goals";
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
    const { fetchTransactions, fetchBudgets, fetchGoals, onLogout, setUsername, setGlobalError } = useAppData();

    useEffect(() => {
        const token = localStorage.getItem("token");
        const savedUsername = localStorage.getItem("username") || (token ? decodeTokenUsername(token) : "");
        setApiAuthToken(token);
        setIsLoggedIn(Boolean(token));
        if (savedUsername) setUsername(savedUsername);
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
        };
        window.addEventListener("auth:unauthorized", handleUnauthorized as EventListener);
        return () =>
            window.removeEventListener("auth:unauthorized", handleUnauthorized as EventListener);
    }, [onLogout, setGlobalError]);

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
                <Route index element={<Navigate to="/transactions" replace />} />
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
    const { theme } = useTheme();

    return (
        <div className={`${theme === "dark" ? "dark" : ""} app-shell`}>
            <Sidebar />
            <Outlet />
        </div>
    );
}

function App() {
    return (
        <ThemeProvider>
            <BrowserRouter>
                <AppDataProvider>
                    <AppInner />
                </AppDataProvider>
            </BrowserRouter>
        </ThemeProvider>
    );
}

export default App;