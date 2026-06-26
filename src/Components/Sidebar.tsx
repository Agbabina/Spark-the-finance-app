import { useMemo, useState, useEffect } from "react";
import { LuBadgeCheck, LuBrainCircuit, LuMenu, LuSend, LuSparkles, LuTriangleAlert, LuWifiOff, LuUsers } from "react-icons/lu";
import { MdBalance, MdTrendingDown, MdTrendingUp } from "react-icons/md";
import { GrTransaction } from "react-icons/gr";
import { useLocation, useNavigate, Outlet } from "react-router-dom";
import { BiPlus, BiWallet, BiCreditCard } from "react-icons/bi";
import { MdAccountBalanceWallet } from "react-icons/md";
import { BsBullseye } from "react-icons/bs";

import type { Transaction } from "../types.ts";
import { useAppData } from "../contexts/AppDataContext";
import { useTheme } from "../contexts/ThemeContext";

interface SmartInsight {
    title: string;
    value: string;
    detail: string;
    tone: "blue" | "emerald" | "amber" | "rose" | "slate";
}

const daysInCurrentMonth = () => {
    const now = new Date();
    return new Date(now.getFullYear(), now.getMonth() + 1, 0).getDate();
};

const normalize = (value: string) => value.trim().toLowerCase();

const categoryHints: Array<{ category: string; keywords: string[] }> = [
    { category: "Food", keywords: ["restaurant", "meal", "lunch", "dinner", "kfc", "chicken", "pizza", "cafe"] },
    { category: "Groceries", keywords: ["grocery", "supermarket", "shoprite", "market", "mart", "store"] },
    { category: "Transport", keywords: ["uber", "bolt", "bus", "taxi", "fuel", "petrol", "transport"] },
    { category: "Bills", keywords: ["electric", "power", "internet", "airtime", "data", "water", "bill"] },
    { category: "Subscriptions", keywords: ["netflix", "spotify", "apple", "prime", "subscription", "youtube"] },
    { category: "Health", keywords: ["pharmacy", "hospital", "clinic", "doctor", "medicine"] },
    { category: "Education", keywords: ["school", "course", "book", "tuition", "udemy"] },
    { category: "Debt", keywords: ["loan", "debt", "repay", "repayment"] },
    { category: "Savings", keywords: ["save", "savings", "investment", "deposit"] }
];

const guessCategory = (title: string) => {
    const text = normalize(title);
    return categoryHints.find((hint) => hint.keywords.some((keyword) => text.includes(keyword)))?.category ?? "Other";
};

const sameMonth = (date: string) => {
    const parsed = new Date(date);
    const now = new Date();
    return parsed.getMonth() === now.getMonth() && parsed.getFullYear() === now.getFullYear();
};

function Sidebar() {
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);
    const [mounted, setMounted] = useState(false);
    const { theme, toggleTheme } = useTheme();
    const { transactions, budgets, goals, username, globalError, onLogout } = useAppData();
    const navigate = useNavigate();
    const location = useLocation();

    useEffect(() => {
        setMounted(true);
    }, []);

    const navItems = [
        { name: "Dashboard", icon: MdBalance, path: "/" },
        { name: "Transactions", icon: GrTransaction, path: "/transactions" },
        { name: "Budgets", icon: MdAccountBalanceWallet, path: "/budgets" },
        { name: "Goals", icon: BsBullseye, path: "/goals" },
        { name: "Spark Connect", icon: BiCreditCard, path: "/spark-connect" },
        { name: "Connections", icon: LuUsers, path: "/connections" },
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

    const currentMonth = new Date().getMonth() + 1;
    const currentBudgets = budgets.filter((budget) => budget.month === currentMonth && budget.year === new Date().getFullYear());
    const currentBudgetLimit = currentBudgets.reduce((sum, budget) => sum + budget.limit, 0);
    const currentBudgetSpent = currentBudgets.reduce((sum, budget) => {
        const spent = transactions
            .filter(
                (transaction) =>
                    transaction.type === "expense" &&
                    transaction.category === budget.category &&
                    new Date(transaction.date).getMonth() + 1 === budget.month &&
                    new Date(transaction.date).getFullYear() === budget.year
            )
            .reduce((transactionSum, transaction) => transactionSum + transaction.amount, 0);
        return sum + spent;
    }, 0);

    const totalGoalTarget = goals.reduce((sum, goal) => sum + goal.targetAmount, 0);
    const totalGoalSaved = goals.reduce((sum, goal) => sum + goal.currentAmount, 0);
    const currentMonthExpenses = transactions
        .filter((transaction) => transaction.type === "expense" && sameMonth(transaction.date))
        .reduce((sum, transaction) => sum + transaction.amount, 0);
    const currentMonthIncome = transactions
        .filter((transaction) => transaction.type === "income" && sameMonth(transaction.date))
        .reduce((sum, transaction) => sum + transaction.amount, 0);
    const elapsedDays = Math.max(new Date().getDate(), 1);
    const monthProgress = elapsedDays / daysInCurrentMonth();
    const projectedMonthExpenses = monthProgress > 0 ? currentMonthExpenses / monthProgress : currentMonthExpenses;
    const projectedBalance = currentMonthIncome - projectedMonthExpenses;
    const savingsRate = currentMonthIncome > 0 ? ((currentMonthIncome - currentMonthExpenses) / currentMonthIncome) * 100 : 0;

    const COLORS = ["#2563eb", "#7c3aed", "#10b981", "#f59e0b", "#ef4444"];

    const smartInsights = useMemo<SmartInsight[]>(() => {
        const topCategory = pieData
            .slice()
            .sort((a, b) => b.value - a.value)[0];
        const overBudget = currentBudgets
            .map((budget) => {
                const spent = transactions
                    .filter(
                        (transaction) =>
                            transaction.type === "expense" &&
                            transaction.category === budget.category &&
                            sameMonth(transaction.date)
                    )
                    .reduce((sum, transaction) => sum + transaction.amount, 0);
                return { budget, spent };
            })
            .filter(({ budget, spent }) => spent > budget.limit)
            .sort((a, b) => b.spent - b.budget.limit - (a.spent - a.budget.limit));

        const nearestGoal = goals
            .filter((goal) => goal.targetAmount > goal.currentAmount)
            .slice()
            .sort((a, b) => {
                if (!a.targetDate) return 1;
                if (!b.targetDate) return -1;
                return new Date(a.targetDate).getTime() - new Date(b.targetDate).getTime();
            })[0];

        return [
            {
                title: "Offline forecast",
                value: formatCurrency(Math.max(projectedMonthExpenses, 0)),
                detail: `At your current pace, this month may end near ${formatCurrency(Math.max(projectedMonthExpenses, 0))} in expenses.`,
                tone: projectedBalance >= 0 ? "emerald" : "rose"
            },
            {
                title: "Savings rate",
                value: `${Math.round(savingsRate)}%`,
                detail: savingsRate >= 20
                    ? "You are above a strong 20% savings target."
                    : "Try moving money to goals before flexible spending grows.",
                tone: savingsRate >= 20 ? "emerald" : "amber"
            },
            {
                title: "Top category",
                value: topCategory?.name ?? "None yet",
                detail: topCategory
                    ? `${topCategory.name} is taking the biggest share at ${formatCurrency(topCategory.value)}.`
                    : "Add categorized expenses to unlock better pattern detection.",
                tone: topCategory ? "blue" : "slate"
            },
            {
                title: "Budget watch",
                value: overBudget.length > 0 ? `${overBudget.length} over` : "On track",
                detail: overBudget.length > 0
                    ? `${overBudget[0].budget.category} is over by ${formatCurrency(overBudget[0].spent - overBudget[0].budget.limit)}.`
                    : "No active monthly budget has crossed its limit.",
                tone: overBudget.length > 0 ? "rose" : "emerald"
            },
            {
                title: "Goal planner",
                value: nearestGoal?.title ?? "Add goal",
                detail: nearestGoal
                    ? `${formatCurrency(nearestGoal.targetAmount - nearestGoal.currentAmount)} left to reach ${nearestGoal.title}.`
                    : "Create one goal so Spark can calculate a savings path.",
                tone: nearestGoal ? "amber" : "slate"
            }
        ];
    }, [currentBudgets, goals, pieData, projectedBalance, projectedMonthExpenses, savingsRate, transactions]);

    const toneClasses: Record<SmartInsight["tone"], string> = {
        blue: "border-blue-200 bg-blue-50 text-blue-900 dark:border-blue-500/20 dark:bg-blue-500/10 dark:text-blue-100",
        emerald: "border-emerald-200 bg-emerald-50 text-emerald-900 dark:border-emerald-500/20 dark:bg-emerald-500/10 dark:text-emerald-100",
        amber: "border-amber-200 bg-amber-50 text-amber-900 dark:border-amber-500/20 dark:bg-amber-500/10 dark:text-amber-100",
        rose: "border-rose-200 bg-rose-50 text-rose-900 dark:border-rose-500/20 dark:bg-rose-500/10 dark:text-rose-100",
        slate: "border-slate-200 bg-slate-50 text-slate-900 dark:border-slate-700 dark:bg-slate-900/50 dark:text-slate-100"
    };

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
                                onClick={toggleTheme}
                                className="btn-secondary w-auto px-4 py-2 text-sm transition-all duration-300 hover:shadow-md"
                            >
                                {theme === "dark" ? "Light mode" : "Dark mode"}
                            </button>
                        </div>

                        <div className={`mt-6 rounded-[1.75rem] border border-slate-200/70 bg-slate-100/80 p-5 shadow-xl transition-all duration-300 hover:shadow-2xl dark:border-slate-800 dark:bg-slate-950/90 ${mounted ? 'animate-slide-in-left stagger-1' : 'opacity-0'}`}>
                            <p className="text-xs uppercase tracking-[0.25em] text-slate-500 dark:text-slate-400">
                                Welcome back
                            </p>
                            <h3 className="mt-2 text-xl font-black tracking-tight text-slate-900 dark:text-white">
                                {username || "Valued user"}
                            </h3>
                            <p className="mt-1 text-sm leading-6 text-slate-500 dark:text-slate-400">
                                Your personal finance command center is ready.
                            </p>
                        </div>

                        <div className={`mt-6 rounded-[1.75rem] border border-slate-200/70 bg-blue-50/90 p-5 shadow-xl transition-all duration-300 hover:shadow-2xl dark:border-slate-800 dark:bg-slate-950/85 ${mounted ? 'animate-slide-in-left stagger-2' : 'opacity-0'}`}>
                            <div className="flex items-center justify-between gap-3">
                                <div>
                                    <p className="text-xs uppercase tracking-[0.2em] text-blue-700 dark:text-blue-300">
                                        Dev panel
                                    </p>
                                    <p className="mt-2 text-sm font-semibold text-slate-900 dark:text-white">
                                        Live status & logout
                                    </p>
                                </div>
                                <button
                                    onClick={onLogout}
                                    className="btn-secondary w-auto px-3 py-2 text-sm"
                                >
                                    Logout
                                </button>
                            </div>

                            <div className="mt-4 rounded-2xl border border-slate-200 bg-white p-4 text-sm text-slate-700 dark:border-slate-700 dark:bg-slate-900/60 dark:text-slate-200">
                                {globalError ? (
                                    <div>
                                        <p className="font-semibold text-rose-600 dark:text-rose-300">Last error</p>
                                        <p className="mt-2 break-words text-xs leading-5">{globalError}</p>
                                    </div>
                                ) : (
                                    <p className="text-slate-500 dark:text-slate-400">No errors detected.</p>
                                )}
                            </div>
                        </div>
                    </div>

                    <nav className="flex-1 space-y-2 p-4">
                        {navItems.map((item, index) => {
                            const Icon = item.icon;
                            const active = location.pathname === item.path;

                            return (
                                <button
                                    key={item.name}
                                    onClick={() => {
                                        navigate(item.path);
                                        setIsSidebarOpen(false);
                                    }}
                                    className={`nav-item flex w-full items-center gap-3 rounded-2xl px-4 py-3 text-left transition-all duration-200 ${mounted ? 'animate-slide-in-left' : 'opacity-0'} ${active ? "active bg-blue-600 text-white shadow-lg shadow-blue-600/20" : "text-slate-700 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-900/60 hover:translate-x-1"}`}
                                    style={{ animationDelay: `${0.1 + index * 0.05}s` }}
                                >
                                    <Icon className={`${active ? "text-white" : "text-blue-600 dark:text-blue-400"} transition-transform duration-200 ${active ? "scale-110" : ""}`} />
                                    <span className="font-medium">{item.name}</span>
                                </button>
                            );
                        })}
                    </nav>

                    <div className="border-t border-slate-200/70 p-5 dark:border-slate-800">
                        <div className={`rounded-[1.75rem] bg-slate-900 p-5 text-white shadow-2xl transition-all duration-300 hover:shadow-cyan-500/20 dark:bg-slate-900 ${mounted ? 'animate-slide-in-left stagger-3' : 'opacity-0'}`}>
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
                                <div className="rounded-2xl bg-white/10 p-3 transition-all duration-200 hover:bg-white/15 hover:scale-[1.02]">
                                    <p className="text-white/50">Income</p>
                                    <p className="mt-1 font-semibold text-emerald-300">
                                        {formatCurrency(totalIncome)}
                                    </p>
                                </div>
                                <div className="rounded-2xl bg-white/10 p-3 transition-all duration-200 hover:bg-white/15 hover:scale-[1.02]">
                                    <p className="text-white/50">Expenses</p>
                                    <p className="mt-1 font-semibold text-rose-300">
                                        {formatCurrency(totalExpenses)}
                                    </p>
                                </div>
                            </div>

                            <div className="mt-3 rounded-2xl bg-white/10 p-3 text-sm transition-all duration-200 hover:bg-white/15">
                                <p className="text-white/50">Monthly budgets</p>
                                <p className="mt-1 font-semibold text-blue-200">
                                    {currentBudgets.length} active
                                </p>
                                <p className="mt-1 text-xs text-white/60">
                                    {formatCurrency(currentBudgetSpent)} spent of {formatCurrency(currentBudgetLimit)}
                                </p>
                            </div>

                            <div className="mt-3 rounded-2xl bg-white/10 p-3 text-sm transition-all duration-200 hover:bg-white/15">
                                <p className="text-white/50">Savings goals</p>
                                <p className="mt-1 font-semibold text-amber-200">
                                    {goals.length} active
                                </p>
                                <p className="mt-1 text-xs text-white/60">
                                    {formatCurrency(totalGoalSaved)} saved of {formatCurrency(totalGoalTarget)}
                                </p>
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
                            className="btn-primary w-auto px-4 py-3 text-sm transition-all duration-200 hover:scale-105 active:scale-95"
                        >
                            <BiPlus />
                            Add Transaction
                        </button>
                    </div>
                </header>

                <main className="flex-1 px-4 py-6 sm:px-6 lg:px-8">
                    <Outlet />
                </main>
            </div>

            {isSidebarOpen && (
                <div
                    className="fixed inset-0 z-40 bg-slate-950/50 backdrop-blur-sm lg:hidden animate-fade-in"
                    onClick={() => setIsSidebarOpen(false)}
                />
            )}
        </div>
    );
}

export default Sidebar;