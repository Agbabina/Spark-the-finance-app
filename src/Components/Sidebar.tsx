import { useState } from "react";
import { LuMenu } from "react-icons/lu";
import { MdBalance, MdTrendingDown, MdTrendingUp } from "react-icons/md";
import { GrTransaction } from "react-icons/gr";
import { useLocation, useNavigate } from "react-router-dom";
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
    const location = useLocation();

    const navItems = [
        { name: "Dashboard", icon: MdBalance, path: "/" },
        { name: "Transactions", icon: GrTransaction, path: "/transactions" },
        { name: "Add Transaction", icon: BiPlus, path: "/add" }
    ];

    const formatCurrency = (value: number) => `NGN ${value.toLocaleString()}`;

    const totalIncome = transactions
        .filter(t => t.type === "income")
        .reduce((sum, t) => sum + t.amount, 0);

    const totalExpenses = transactions
        .filter(t => t.type === "expense")
        .reduce((sum, t) => sum + t.amount, 0);

    const balance = totalIncome - totalExpenses;

    const lineData = transactions
        .slice(-7)
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

    const COLORS = ["#2563eb", "#7c3aed", "#10b981", "#f59e0b", "#ef4444"];

    return (
        <div className="min-h-screen lg:flex">
            <aside
                className={`fixed inset-y-0 left-0 z-50 w-72 transform overflow-y-auto border-r border-slate-200/70 bg-white/85 backdrop-blur-xl transition-transform duration-300 dark:border-slate-800 dark:bg-slate-950/85 lg:sticky lg:top-0 lg:translate-x-0 ${
                    isSidebarOpen ? "translate-x-0" : "-translate-x-full"
                }`}
            >
                <div className="flex h-full flex-col">
                    <div className="border-b border-slate-200/70 p-6 dark:border-slate-800">
                        <div className="flex items-start justify-between gap-4">
                            <div>
                                <p className="text-xs font-semibold uppercase tracking-[0.35em] text-blue-600 dark:text-blue-400">
                                    Finance hub
                                </p>
                                <h1 className="mt-2 text-2xl font-black tracking-tight text-slate-900 dark:text-white">
                                    Spark
                                </h1>
                                <p className="mt-2 text-sm leading-6 text-slate-500 dark:text-slate-400">
                                    Simple cash flow tracking with a cleaner view.
                                </p>
                            </div>

                            <button
                                onClick={() => setDarkMode(!darkMode)}
                                className="btn-secondary w-auto px-4 py-2 text-sm"
                            >
                                {darkMode ? "Light mode" : "Dark mode"}
                            </button>
                        </div>
                    </div>

                    <nav className="flex-1 space-y-2 p-4">
                        {navItems.map((item) => {
                            const Icon = item.icon;
                            const active = location.pathname === item.path;

                            return (
                                <button
                                    key={item.name}
                                    onClick={() => {
                                        navigate(item.path);
                                        setIsSidebarOpen(false);
                                    }}
                                    className={`flex w-full items-center gap-3 rounded-2xl px-4 py-3 text-left transition-all ${
                                        active
                                            ? "bg-blue-600 text-white shadow-lg shadow-blue-600/20"
                                            : "text-slate-700 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-900/60"
                                    }`}
                                >
                                    <Icon className={active ? "text-white" : "text-blue-600 dark:text-blue-400"} />
                                    <span className="font-medium">{item.name}</span>
                                </button>
                            );
                        })}
                    </nav>

                    <div className="border-t border-slate-200/70 p-5 dark:border-slate-800">
                        <div className="rounded-[1.75rem] bg-slate-900 p-5 text-white shadow-2xl dark:bg-slate-900">
                            <div className="flex items-center gap-3">
                                <div className="rounded-2xl bg-white/10 p-3">
                                    <BiWallet className="text-xl" />
                                </div>
                                <div>
                                    <p className="text-xs uppercase tracking-[0.3em] text-white/50">
                                        Current balance
                                    </p>
                                    <p className="mt-1 text-xl font-black">
                                        {formatCurrency(Math.abs(balance))}
                                    </p>
                                </div>
                            </div>

                            <div className="mt-5 grid grid-cols-2 gap-3 text-sm">
                                <div className="rounded-2xl bg-white/10 p-3">
                                    <p className="text-white/50">Income</p>
                                    <p className="mt-1 font-semibold text-emerald-300">
                                        {formatCurrency(totalIncome)}
                                    </p>
                                </div>
                                <div className="rounded-2xl bg-white/10 p-3">
                                    <p className="text-white/50">Expenses</p>
                                    <p className="mt-1 font-semibold text-rose-300">
                                        {formatCurrency(totalExpenses)}
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </aside>

            <div className="flex min-h-screen flex-1 flex-col">
                <header className="sticky top-0 z-40 border-b border-slate-200/70 bg-white/80 backdrop-blur-xl dark:border-slate-800 dark:bg-slate-950/80">
                    <div className="flex items-center justify-between gap-4 px-4 py-4 sm:px-6 lg:px-8">
                        <div className="flex items-center gap-3">
                            <button
                                onClick={() => setIsSidebarOpen(true)}
                                className="rounded-2xl border border-slate-200/70 bg-white/80 p-3 text-slate-700 shadow-sm transition hover:bg-slate-100 dark:border-slate-700 dark:bg-slate-900/80 dark:text-slate-200 lg:hidden"
                            >
                                <LuMenu className="text-xl" />
                            </button>

                            <div>
                                <p className="text-xs font-semibold uppercase tracking-[0.3em] text-blue-600 dark:text-blue-400">
                                    Overview
                                </p>
                                <h2 className="text-xl font-bold tracking-tight text-slate-900 dark:text-white sm:text-2xl">
                                    Dashboard
                                </h2>
                            </div>
                        </div>

                        <button
                            onClick={() => navigate("/add")}
                            className="btn-primary w-auto px-4 py-3 text-sm"
                        >
                            <BiPlus />
                            Add Transaction
                        </button>
                    </div>
                </header>

                <main className="flex-1 px-4 py-6 sm:px-6 lg:px-8">
                    <div className="mx-auto max-w-7xl space-y-6">
                        <section className="grid gap-4 sm:grid-cols-3">
                            <div className="card border-l-4 border-l-blue-500 p-6">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <p className="text-sm font-medium text-slate-500 dark:text-slate-400">
                                            Total Balance
                                        </p>
                                        <p className={`mt-2 text-2xl font-black ${balance >= 0 ? "text-emerald-600 dark:text-emerald-300" : "text-rose-600 dark:text-rose-300"}`}>
                                            {formatCurrency(Math.abs(balance))}
                                        </p>
                                    </div>
                                    <BiWallet className="text-3xl text-blue-600 dark:text-blue-400" />
                                </div>
                            </div>

                            <div className="card border-l-4 border-l-emerald-500 p-6">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <p className="text-sm font-medium text-slate-500 dark:text-slate-400">
                                            Total Income
                                        </p>
                                        <p className="mt-2 text-2xl font-black text-emerald-600 dark:text-emerald-300">
                                            {formatCurrency(totalIncome)}
                                        </p>
                                    </div>
                                    <MdTrendingUp className="text-3xl text-emerald-600 dark:text-emerald-300" />
                                </div>
                            </div>

                            <div className="card border-l-4 border-l-rose-500 p-6">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <p className="text-sm font-medium text-slate-500 dark:text-slate-400">
                                            Total Expenses
                                        </p>
                                        <p className="mt-2 text-2xl font-black text-rose-600 dark:text-rose-300">
                                            {formatCurrency(totalExpenses)}
                                        </p>
                                    </div>
                                    <MdTrendingDown className="text-3xl text-rose-600 dark:text-rose-300" />
                                </div>
                            </div>
                        </section>

                        <section className="grid gap-6 xl:grid-cols-[1.15fr_0.85fr]">
                            <div className="card p-6">
                                <div className="mb-4 flex items-center justify-between gap-4">
                                    <div>
                                        <h3 className="text-lg font-bold text-slate-900 dark:text-white">
                                            Income vs Expenses
                                        </h3>
                                        <p className="text-sm text-slate-500 dark:text-slate-400">
                                            The last seven entries at a glance.
                                        </p>
                                    </div>
                                </div>

                                <ResponsiveContainer width="100%" height={320}>
                                    <LineChart data={lineData}>
                                        <XAxis dataKey="day" stroke="currentColor" />
                                        <YAxis stroke="currentColor" tickFormatter={(value) => value.toLocaleString()} />
                                        <Tooltip formatter={(value) => [formatCurrency(Number(value)), ""]} />
                                        <Line
                                            type="monotone"
                                            dataKey="income"
                                            stroke="#10b981"
                                            strokeWidth={3}
                                            dot={false}
                                            name="Income"
                                        />
                                        <Line
                                            type="monotone"
                                            dataKey="spending"
                                            stroke="#ef4444"
                                            strokeWidth={3}
                                            dot={false}
                                            name="Expenses"
                                        />
                                    </LineChart>
                                </ResponsiveContainer>
                            </div>

                            <div className="card p-6">
                                <div className="mb-4">
                                    <h3 className="text-lg font-bold text-slate-900 dark:text-white">
                                        Expense Categories
                                    </h3>
                                    <p className="text-sm text-slate-500 dark:text-slate-400">
                                        See where most spending is happening.
                                    </p>
                                </div>

                                {pieData.length > 0 ? (
                                    <div className="flex flex-col items-center">
                                        <PieChart width={260} height={260}>
                                            <Pie
                                                data={pieData}
                                                dataKey="value"
                                                outerRadius={86}
                                                innerRadius={46}
                                                paddingAngle={4}
                                            >
                                                {pieData.map((_, i) => (
                                                    <Cell key={i} fill={COLORS[i % COLORS.length]} />
                                                ))}
                                            </Pie>
                                            <Tooltip formatter={(value) => [formatCurrency(Number(value)), ""]} />
                                        </PieChart>

                                        <div className="mt-4 grid w-full gap-2">
                                            {pieData.map((item, i) => (
                                                <div key={item.name} className="flex items-center justify-between rounded-2xl bg-slate-50 px-3 py-2 dark:bg-slate-900/50">
                                                    <div className="flex items-center gap-3">
                                                        <div
                                                            className="h-3 w-3 rounded-full"
                                                            style={{ backgroundColor: COLORS[i % COLORS.length] }}
                                                        />
                                                        <span className="text-sm font-medium text-slate-700 dark:text-slate-300">
                                                            {item.name}
                                                        </span>
                                                    </div>
                                                    <span className="text-sm text-slate-500 dark:text-slate-400">
                                                        {formatCurrency(item.value)}
                                                    </span>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                ) : (
                                    <div className="flex h-64 items-center justify-center rounded-3xl border border-dashed border-slate-300 bg-slate-50 text-center text-slate-500 dark:border-slate-700 dark:bg-slate-900/40 dark:text-slate-400">
                                        <div>
                                            <BiCreditCard className="mx-auto mb-3 text-4xl opacity-50" />
                                            <p>No expense data available yet.</p>
                                        </div>
                                    </div>
                                )}
                            </div>
                        </section>

                        <section className="card p-6">
                            <div className="mb-4 flex items-center justify-between gap-4">
                                <div>
                                    <h3 className="text-lg font-bold text-slate-900 dark:text-white">
                                        Recent Transactions
                                    </h3>
                                    <p className="text-sm text-slate-500 dark:text-slate-400">
                                        Your latest activity, kept compact and easy to scan.
                                    </p>
                                </div>

                                <button
                                    onClick={() => navigate("/transactions")}
                                    className="text-sm font-semibold text-blue-600 transition-colors hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300"
                                >
                                    View all
                                </button>
                            </div>

                            {transactions.length === 0 ? (
                                <div className="rounded-[1.75rem] border border-dashed border-slate-300 bg-slate-50 px-6 py-14 text-center dark:border-slate-700 dark:bg-slate-900/40">
                                    <BiCreditCard className="mx-auto text-4xl text-slate-400" />
                                    <p className="mt-4 text-lg font-semibold text-slate-900 dark:text-white">
                                        No transactions yet
                                    </p>
                                    <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">
                                        Add your first entry to bring the dashboard to life.
                                    </p>
                                    <button
                                        onClick={() => navigate("/add")}
                                        className="btn-primary mx-auto mt-6 w-auto px-5 py-3 text-sm"
                                    >
                                        Add your first transaction
                                    </button>
                                </div>
                            ) : (
                                <div className="space-y-3">
                                    {transactions.slice(-5).reverse().map((t) => (
                                        <div
                                            key={t.id}
                                            className="flex flex-col gap-4 rounded-3xl border border-slate-200/70 bg-slate-50 px-4 py-4 transition-colors hover:bg-white dark:border-slate-700 dark:bg-slate-900/50 dark:hover:bg-slate-900 sm:flex-row sm:items-center sm:justify-between"
                                        >
                                            <div className="flex items-center gap-3">
                                                <div className={`flex h-12 w-12 items-center justify-center rounded-2xl ${t.type === "income" ? "bg-emerald-100 text-emerald-600 dark:bg-emerald-500/10 dark:text-emerald-300" : "bg-rose-100 text-rose-600 dark:bg-rose-500/10 dark:text-rose-300"}`}>
                                                    {t.type === "income" ? "+" : "-"}
                                                </div>
                                                <div>
                                                    <p className="font-semibold text-slate-900 dark:text-white">
                                                        {t.title}
                                                    </p>
                                                    <p className="text-sm text-slate-500 dark:text-slate-400">
                                                        {t.category ? `${t.category} • ` : ""}
                                                        {t.date}
                                                    </p>
                                                </div>
                                            </div>

                                            <p className={`text-lg font-bold sm:text-right ${t.type === "income" ? "text-emerald-600 dark:text-emerald-300" : "text-rose-600 dark:text-rose-300"}`}>
                                                {t.type === "income" ? "+" : "-"}
                                                {formatCurrency(t.amount)}
                                            </p>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </section>
                    </div>
                </main>
            </div>

            {isSidebarOpen && (
                <div
                    className="fixed inset-0 z-40 bg-slate-950/50 backdrop-blur-sm lg:hidden"
                    onClick={() => setIsSidebarOpen(false)}
                />
            )}
        </div>
    );
}

export default Sidebar;
