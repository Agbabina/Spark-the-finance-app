import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { useState, useEffect } from "react";

import "./index.css";
import Sidebar from "./Components/Sidebar.tsx";
import AddTransaction from "./Pages/AddTransaction";
import Transactions from "./Pages/Transactions";
import LoginPage from "./Pages/LoginPage";
import "./App.css"
import type {Transaction} from "./types";
import { api, setApiAuthToken } from "./lib/api";

function App() {
    const [transactions, setTransactions] = useState<Transaction[]>([]);
    const [darkMode, setDarkMode] = useState<boolean>(false);
    const [isLoggedIn, setIsLoggedIn] = useState<boolean>(false);
    const [username, setUsername] = useState<string>("");
    const [globalError, setGlobalError] = useState<string>("");

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
            fetchTransactions();
        }
    }, [isLoggedIn]);

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

    return (
        <div className={`${darkMode ? "dark" : ""} app-shell`}>
            <BrowserRouter>
                <Routes>
                    <Route
                        path="/login"
                        element={
                            isLoggedIn ? (
                                <Navigate to="/" replace />
                            ) : (
                                <LoginPage setIsLoggedIn={setIsLoggedIn} setUsername={setUsername} />
                            )
                        }
                    />
                    <Route
                        path="/"
                        element={
                            isLoggedIn ? (
                                <Sidebar
                                    transactions={transactions}
                                    darkMode={darkMode}
                                    setDarkMode={setDarkMode}
                                    username={username}
                                    devError={globalError}
                                    onLogout={logout}
                                />
                            ) : (
                                <LoginPage setIsLoggedIn={setIsLoggedIn} setUsername={setUsername} />
                            )
                        }
                    />
                    <Route
                        path="/add"
                        element={
                            isLoggedIn ? (
                                <AddTransaction
                                    setTransactions={setTransactions}
                                    darkMode={darkMode}
                                    username={username}
                                    setGlobalError={setGlobalError}
                                />
                            ) : (
                                <Navigate to="/login" replace />
                            )
                        }
                    />
                    <Route
                        path="/transactions"
                        element={
                            isLoggedIn ? (
                                <Transactions
                                    transactions={transactions}
                                    username={username}
                                />
                            ) : (
                                <Navigate to="/login" replace />
                            )
                        }
                    />
                </Routes>
            </BrowserRouter>
        </div>
    );
}

export default App;
