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

// ─── Layout that wraps all authenticated pages ──────────────────
function AppLayout({
  children,
  transactions,
  budgets,
  goals,
  darkMode,
  setDarkMode,
  username,
  globalError,
  onLogout,
}: {
  children: React.ReactNode;
  transactions: Transaction[];
  budgets: Budget[];
  goals: Goal[];
  darkMode: boolean;
  setDarkMode: React.Dispatch<React.SetStateAction<boolean>>;
  username: string;
  globalError: string;
  onLogout: () => void;
}) {
  return (
    <div className={`${darkMode ? "dark" : ""} app-shell`}>
      <Sidebar
        transactions={transactions}
        budgets={budgets}
        goals={goals}
        darkMode={darkMode}
        setDarkMode={setDarkMode}
        username={username}
        devError={globalError}
        onLogout={onLogout}
      />
      {children}
    </div>
  );
}

function App() {
  // ─── All your existing state and functions (unchanged) ──────
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

  // ─── Loading indicator (used once) ─────────────────────────────
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-950">
        <div className="text-slate-400">Loading...</div>
      </div>
    );
  }

  // ─── Routes ──────────────────────────────────────────────────────
  return (
    <ThemeProvider>
      <BrowserRouter>
        <Routes>
          {/* Public routes */}
          <Route path="/landing" element={<LandingPage />} />
          <Route
            path="/login"
            element={
              isLoggedIn ? (
                <Navigate to="/transactions" replace />
              ) : (
                <LoginPage setIsLoggedIn={setIsLoggedIn} setUsername={setUsername} />
              )
            }
          />

          {/* Protected routes with Sidebar layout */}
          <Route
            path="/"
            element={
              isLoggedIn ? (
                <Navigate to="/transactions" replace />
              ) : (
                <Navigate to="/landing" replace />
              )
            }
          />

          <Route
            path="/transactions"
            element={
              isLoggedIn ? (
                <AppLayout
                  transactions={transactions}
                  budgets={budgets}
                  goals={goals}
                  darkMode={darkMode}
                  setDarkMode={setDarkMode}
                  username={username}
                  globalError={globalError}
                  onLogout={logout}
                >
                  <Transactions transactions={transactions} username={username} />
                </AppLayout>
              ) : (
                <Navigate to="/login" replace />
              )
            }
          />

          <Route
            path="/add"
            element={
              isLoggedIn ? (
                <AppLayout
                  transactions={transactions}
                  budgets={budgets}
                  goals={goals}
                  darkMode={darkMode}
                  setDarkMode={setDarkMode}
                  username={username}
                  globalError={globalError}
                  onLogout={logout}
                >
                  <AddTransaction
                    setTransactions={setTransactions}
                    darkMode={darkMode}
                    username={username}
                    setGlobalError={setGlobalError}
                  />
                </AppLayout>
              ) : (
                <Navigate to="/login" replace />
              )
            }
          />

          <Route
            path="/budgets"
            element={
              isLoggedIn ? (
                <AppLayout
                  transactions={transactions}
                  budgets={budgets}
                  goals={goals}
                  darkMode={darkMode}
                  setDarkMode={setDarkMode}
                  username={username}
                  globalError={globalError}
                  onLogout={logout}
                >
                  <Budgets
                    budgets={budgets}
                    transactions={transactions}
                    username={username}
                    setBudgets={setBudgets}
                    setGlobalError={setGlobalError}
                  />
                </AppLayout>
              ) : (
                <Navigate to="/login" replace />
              )
            }
          />

          <Route
            path="/goals"
            element={
              isLoggedIn ? (
                <AppLayout
                  transactions={transactions}
                  budgets={budgets}
                  goals={goals}
                  darkMode={darkMode}
                  setDarkMode={setDarkMode}
                  username={username}
                  globalError={globalError}
                  onLogout={logout}
                >
                  <Goals
                    goals={goals}
                    setGoals={setGoals}
                    setGlobalError={setGlobalError}
                    username={username}
                  />
                </AppLayout>
              ) : (
                <Navigate to="/login" replace />
              )
            }
          />

          <Route
            path="/spark-connect"
            element={
              isLoggedIn ? (
                <AppLayout
                  transactions={transactions}
                  budgets={budgets}
                  goals={goals}
                  darkMode={darkMode}
                  setDarkMode={setDarkMode}
                  username={username}
                  globalError={globalError}
                  onLogout={logout}
                >
                  <SparkConnect />
                </AppLayout>
              ) : (
                <Navigate to="/login" replace />
              )
            }
          />

          <Route
            path="/connections"
            element={
              isLoggedIn ? (
                <AppLayout
                  transactions={transactions}
                  budgets={budgets}
                  goals={goals}
                  darkMode={darkMode}
                  setDarkMode={setDarkMode}
                  username={username}
                  globalError={globalError}
                  onLogout={logout}
                >
                  <Connections />
                </AppLayout>
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