import { BrowserRouter, Routes, Route } from "react-router-dom";
import { useState, useEffect } from "react";
import axios from "axios";

import Sidebar from "./Components/Sidebar.tsx";
import AddTransaction from "./Pages/AddTransaction";
import Transactions from "./Pages/Transactions";
import LoginPage from "./Pages/LoginPage";
import "./App.css"
import type {Transaction} from "./types";

function App() {
    const [transactions, setTransactions] = useState<Transaction[]>([]);
    const [darkMode, setDarkMode] = useState<boolean>(false);
    const [isLoggedIn, setIsLoggedIn] = useState<boolean>(false);

    useEffect(() => {
        const token = localStorage.getItem('token');
        if (token) {
            axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
            setIsLoggedIn(true);
        }
    }, []);

    useEffect(() => {
        if (isLoggedIn) {
            fetchTransactions();
        }
    }, [isLoggedIn]);

    const fetchTransactions = async () => {
        try {
            const response = await axios.get('http://localhost:5219/api/transactions');
            setTransactions(response.data);
        } catch (error) {
            console.error('Error fetching transactions:', error);
        }
    };

    return (
        <div className={darkMode ? "dark" : ""}>
            <BrowserRouter>
                <Routes>
                    <Route
                        path="/login"
                        element={<LoginPage setIsLoggedIn={setIsLoggedIn} />}
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
                                <LoginPage setIsLoggedIn={setIsLoggedIn} />
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
                                <LoginPage setIsLoggedIn={setIsLoggedIn} />
                            )
                        }
                    />
                </Routes>
            </BrowserRouter>
        </div>
    );
}

export default App;