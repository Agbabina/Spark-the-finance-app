import { LuMenu } from "react-icons/lu";
import { useState } from "react";
import { MdBalance, MdTrendingUp, MdTrendingDown } from "react-icons/md";
import { GrTransaction } from "react-icons/gr";
import { useNavigate } from "react-router-dom";
import { BiPlus, BiWallet, BiCreditCard } from "react-icons/bi";
import {
    LineChart,
    Line,
    XAxis,
    YAxis,
    Tooltip,
    ResponsiveContainer,
    PieChart,
    Pie,
    Cell
} from "recharts";

import type { Transaction } from "../types.ts";

interface Props {
    transactions: Transaction[];
    darkMode: boolean;
    setDarkMode: (value: boolean) => void;
}

function Sidebar({ transactions, darkMode, setDarkMode }: Props) {
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);
    const navigate = useNavigate();

    const navItems = [
        { name: "Dashboard", icon: MdBalance, path: "/" },
        { name: "Transactions", icon: GrTransaction, path: "/transactions" },
        { name: "Add Transaction", icon: BiPlus, path: "/add" }
    ];

    // Calculate summary statistics
    const totalIncome = transactions
        .filter(t => t.type === "income")
        .reduce((sum, t) => sum + t.amount, 0);

    const totalExpenses = transactions
        .filter(t => t.type === "expense")
        .reduce((sum, t) => sum + t.amount, 0);

    const balance = totalIncome - totalExpenses;

    // Prepare chart data
    const lineData = transactions
        .slice(-7) // Last 7 transactions
        .map((t, i) => ({
            day: `Day ${i + 1}`,
            spending: t.type === "expense" ? t.amount : 0,
            income: t.type === "income" ? t.amount : 0
        }));

    const categoryMap: Record<string, number> = {};
    transactions.forEach(t => {
        if (t.category && t.type === "expense") {
            categoryMap[t.category] = (categoryMap[t.category] || 0) + t.amount;
        }
    });

    const pieData = Object.keys(categoryMap).map(key => ({
        name: key,
        value: categoryMap[key]
    }));

    const COLORS = ["#3b82f6", "#8c0bf5", "#10b981", "#f59e0b", "#ef4444"];

    return (
        <div className="flex min-h-screen bg-gray-50 dark:bg-gray-900">

            {/* Sidebar */}
            <div className={`
                fixed lg:static w-64 h-full bg-white dark:bg-gray-800 shadow-lg
                transform transition-transform duration-300 ease-in-out
                ${isSidebarOpen ? "translate-x-0" : "-translate-x-full"}
                lg:translate-x-0 z-50
            `}>

                <div className="p-6 border-b border-gray-200 dark:border-gray-700">
                    <div className="flex justify-between items-center">
                        <h1 className="font-bold text-2xl text-blue-600 dark:text-blue-400">
                             Spark
                        </h1>
                        <button 
                            onClick={() => setDarkMode(!darkMode)}
                            className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                        >
                            {darkMode ? "☀️" : "🌙"}
                        </button>
                    </div>
                </div>

                <div className="p-4 space-y-2">
                    {navItems.map((item, i) => {
                        const Icon = item.icon;
                        return (
                            <div
                                key={i}
                                onClick={() => navigate(item.path)}
                                className="flex items-center gap-3 p-3 cursor-pointer hover:bg-blue-50 dark:hover:bg-gray-700 rounded-lg transition-colors"
                            >
                                <Icon className="text-blue-600 dark:text-blue-400" />
                                <span className="text-gray-700 dark:text-gray-300 font-medium">
                                    {item.name}
                                </span>
                            </div>
                        );
                    })}
                </div>
            </div>

            {/* Main Content */}
            <main className="flex-1 w-full">

                {/* Header */}
                <header className="bg-white dark:bg-gray-800 shadow-sm p-4 lg:p-6 border-b border-gray-200 dark:border-gray-700">
                    <div className="flex justify-between items-center">
                        <button 
                            onClick={() => setIsSidebarOpen(true)} 
                            className="lg:hidden p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700"
                        >
                            <LuMenu className="text-xl" />
                        </button>

                        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
                            Spark Dashboard
                        </h1>

                        <button
                            onClick={() => navigate("/add")}
                            className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-medium transition-colors flex items-center gap-2"
                        >
                            <BiPlus />
                            Add Transaction
                        </button>
                    </div>
                </header>

                {/* Dashboard Content */}
                <div className="p-4 lg:p-6 space-y-6 max-w-7xl mx-auto">

                    {/* Summary Cards */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Total Balance</p>
                                    <p className={`text-2xl font-bold ${balance >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                                        ₦{Math.abs(balance).toLocaleString()}
                                    </p>
                                </div>
                                <BiWallet className="text-3xl text-blue-600 dark:text-blue-400" />
                            </div>
                        </div>

                        <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Total Income</p>
                                    <p className="text-2xl font-bold text-green-600">
                                        ₦{totalIncome.toLocaleString()}
                                    </p>
                                </div>
                                <MdTrendingUp className="text-3xl text-green-600" />
                            </div>
                        </div>

                        <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Total Expenses</p>
                                    <p className="text-2xl font-bold text-red-600">
                                        ₦{totalExpenses.toLocaleString()}
                                    </p>
                                </div>
                                <MdTrendingDown className="text-3xl text-red-600" />
                            </div>
                        </div>
                    </div>

                    {/* Charts Row */}
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

                        {/* Income vs Expenses Chart */}
                        <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700">
                            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                                Income vs Expenses Trend
                            </h3>
                            <ResponsiveContainer width="100%" height={300}>
                                <LineChart data={lineData}>
                                    <XAxis dataKey="day" />
                                    <YAxis />
                                    <Tooltip formatter={(value) => [`₦${value}`, '']} />
                                    <Line 
                                        type="monotone" 
                                        dataKey="income" 
                                        stroke="#10b981" 
                                        strokeWidth={3}
                                        name="Income"
                                    />
                                    <Line 
                                        type="monotone" 
                                        dataKey="spending" 
                                        stroke="#ef4444" 
                                        strokeWidth={3}
                                        name="Expenses"
                                    />
                                </LineChart>
                            </ResponsiveContainer>
                        </div>

                        {/* Expense Categories */}
                        <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700">
                            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                                Expense Categories
                            </h3>
                            {pieData.length > 0 ? (
                                <div className="flex flex-col items-center">
                                    <PieChart width={250} height={250}>
                                        <Pie 
                                            data={pieData} 
                                            dataKey="value" 
                                            outerRadius={80}
                                            innerRadius={40}
                                        >
                                            {pieData.map((_, i) => (
                                                <Cell key={i} fill={COLORS[i % COLORS.length]} />
                                            ))}
                                        </Pie>
                                        <Tooltip formatter={(value) => [`₦${value}`, '']} />
                                    </PieChart>
                                    <div className="mt-4 space-y-2">
                                        {pieData.map((item, i) => (
                                            <div key={i} className="flex items-center gap-2">
                                                <div 
                                                    className="w-3 h-3 rounded-full" 
                                                    style={{ backgroundColor: COLORS[i % COLORS.length] }}
                                                ></div>
                                                <span className="text-sm text-gray-600 dark:text-gray-400">
                                                    {item.name}: ₦{item.value}
                                                </span>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            ) : (
                                <div className="flex items-center justify-center h-64 text-gray-500 dark:text-gray-400">
                                    <p>No expense data available</p>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Recent Transactions */}
                    <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700">
                        <div className="flex justify-between items-center mb-4">
                            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                                Recent Transactions
                            </h3>
                            <button
                                onClick={() => navigate("/transactions")}
                                className="text-blue-600 hover:text-blue-700 dark:text-blue-400 font-medium"
                            >
                                View All
                            </button>
                        </div>

                        {transactions.length === 0 ? (
                            <div className="text-center py-8 text-gray-500 dark:text-gray-400">
                                <BiCreditCard className="text-4xl mx-auto mb-2 opacity-50" />
                                <p>No transactions yet</p>
                                <button
                                    onClick={() => navigate("/add")}
                                    className="mt-2 text-blue-600 hover:text-blue-700 dark:text-blue-400 font-medium"
                                >
                                    Add your first transaction
                                </button>
                            </div>
                        ) : (
                            <div className="space-y-3">
                                {transactions.slice(-5).reverse().map((t, i) => (
                                    <div key={i} className="flex justify-between items-center p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                                        <div className="flex items-center gap-3">
                                            <div className={`p-2 rounded-full ${t.type === "income" ? "bg-green-100 text-green-600" : "bg-red-100 text-red-600"}`}>
                                                {t.type === "income" ? "+" : "-"}
                                            </div>
                                            <div>
                                                <p className="font-medium text-gray-900 dark:text-white">{t.title}</p>
                                                <p className="text-sm text-gray-500 dark:text-gray-400">
                                                    {t.category && `${t.category} • `}{t.date}
                                                </p>
                                            </div>
                                        </div>
                                        <p className={`font-semibold ${t.type === "income" ? "text-green-600" : "text-red-600"}`}>
                                            {t.type === "income" ? "+" : "-"}₦{t.amount.toLocaleString()}
                                        </p>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </div>
            </main>

            {/* Mobile Overlay */}
            {isSidebarOpen && (
                <div 
                    className="fixed inset-0 bg-black bg-opacity-50 z-40 lg:hidden"
                    onClick={() => setIsSidebarOpen(false)}
                ></div>
            )}
        </div>
    );
}

export default Sidebar;