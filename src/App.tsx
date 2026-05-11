import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { useState, useEffect } from "react";

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

    useEffect(() => {
        const token = localStorage.getItem('token');
        setApiAuthToken(token);
        setIsLoggedIn(Boolean(token));
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
        } catch (error) {
            console.error('Error fetching transactions:', error);
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
                                <LoginPage setIsLoggedIn={setIsLoggedIn} />
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
                                />
                            ) : (
                                <LoginPage setIsLoggedIn={setIsLoggedIn} />
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
