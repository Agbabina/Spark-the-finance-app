import { type FormEvent, useMemo, useState, useEffect } from "react";
import { LuBadgeCheck, LuBrainCircuit, LuMenu, LuSend, LuSparkles, LuTriangleAlert, LuWifiOff, LuUsers } from "react-icons/lu";
import { MdBalance, MdTrendingDown, MdTrendingUp } from "react-icons/md";
import { GrTransaction } from "react-icons/gr";
import { useLocation, useNavigate } from "react-router-dom";
import { BiPlus, BiWallet, BiCreditCard } from "react-icons/bi";
import { MdAccountBalanceWallet } from "react-icons/md";
import { BsBullseye } from "react-icons/bs";
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
import type { AiInsight, AiQuestionResponse, Budget, Goal } from "../types.ts";
import { api } from "../lib/api.ts";

interface SmartInsight {
    title: string;
    value: string;
    detail: string;
    tone: "blue" | "emerald" | "amber" | "rose" | "slate";
}

interface Props {
    transactions: Transaction[];
    budgets: Budget[];
    goals: Goal[];
    darkMode: boolean;
    setDarkMode: (value: boolean) => void;
    username: string;
    devError: string;
    onLogout: () => void;
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

function Sidebar({ transactions, budgets, goals, darkMode, setDarkMode, username, devError, onLogout }: Props) {
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);
    const [aiInsight, setAiInsight] = useState<AiInsight | null>(null);
    const [aiLoading, setAiLoading] = useState(false);
    const [aiError, setAiError] = useState("");
    const [onlineQuestion, setOnlineQuestion] = useState("");
    const [onlineAnswer, setOnlineAnswer] = useState("");
    const [onlineQuestionLoading, setOnlineQuestionLoading] = useState(false);
    const [mounted, setMounted] = useState(false);
    const navigate = useNavigate();
    const location = useLocation();

    useEffect(() => {
        setMounted(true);
    }, []);
    //I love react router
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

    const duplicateCharges = useMemo(() => {
        const seen = new Map<string, Transaction[]>();
        transactions
            .filter((transaction) => transaction.type === "expense")
            .forEach((transaction) => {
                const key = `${normalize(transaction.title)}-${transaction.amount}-${transaction.date}`;
                seen.set(key, [...(seen.get(key) ?? []), transaction]);
            });

        return Array.from(seen.values()).filter((group) => group.length > 1).slice(0, 3);
    }, [transactions]);

    const subscriptionHints = useMemo(() => {
        const groups = new Map<string, Transaction[]>();
        transactions
            .filter((transaction) => transaction.type === "expense")
            .forEach((transaction) => {
                const title = normalize(transaction.title);
                const looksRecurring = ["subscription", "netflix", "spotify", "internet", "prime", "youtube", "apple"]
                    .some((keyword) => title.includes(keyword));
                if (looksRecurring || transaction.category === "Subscriptions" || transaction.category === "Bills") {
                    groups.set(title, [...(groups.get(title) ?? []), transaction]);
                }
            });

        return Array.from(groups.values())
            .filter((group) => group.length >= 1)
            .sort((a, b) => b.length - a.length)
            .slice(0, 4);
    }, [transactions]);

    const categorySuggestions = useMemo(() => (
        transactions
            .filter((transaction) => transaction.type === "expense" && (!transaction.category || transaction.category === "Other"))
            .slice(-5)
            .map((transaction) => ({
                transaction,
                suggestion: guessCategory(transaction.title)
            }))
            .filter(({ suggestion }) => suggestion !== "Other")
    ), [transactions]);

    const budgetSuggestions = useMemo(() => {
        const monthlyByCategory = new Map<string, number[]>();
        transactions
            .filter((transaction) => transaction.type === "expense" && transaction.category)
            .forEach((transaction) => {
                const date = new Date(transaction.date);
                const key = `${date.getFullYear()}-${date.getMonth() + 1}`;
                const categoryKey = `${transaction.category}|${key}`;
                const current = monthlyByCategory.get(categoryKey)?.[0] ?? 0;
                monthlyByCategory.set(categoryKey, [current + transaction.amount]);
            });

        const categoryTotals = new Map<string, number[]>();
        monthlyByCategory.forEach((totals, key) => {
            const category = key.split("|")[0];
            categoryTotals.set(category, [...(categoryTotals.get(category) ?? []), totals[0]]);
        });

        return Array.from(categoryTotals.entries())
            .map(([category, totals]) => ({
                category,
                amount: Math.ceil((totals.reduce((sum, value) => sum + value, 0) / totals.length) * 1.05)
            }))
            .sort((a, b) => b.amount - a.amount)
            .slice(0, 4);
    }, [transactions]);

    const [coachQuestion, setCoachQuestion] = useState("");
    const [coachAnswer, setCoachAnswer] = useState("Ask about spending, budgets, subscriptions, forecasts, goals, or categories. This assistant works offline.");

    const generateAiInsight = async () => {
        setAiLoading(true);
        setAiError("");

        try {
            const response = await api.post<AiInsight>("/api/ai/insights");
            setAiInsight(response.data);
        } catch (error: unknown) {
            console.error("Error generating AI insight:", error);
            setAiError("AI insight could not be generated right now.");
        } finally {
            setAiLoading(false);
        }
    };

    const answerOfflineQuestion = (question: string) => {
        const text = normalize(question);
        const topCategory = pieData.slice().sort((a, b) => b.value - a.value)[0];

        if (!text) {
            return "Type a finance question first. I can answer offline without touching your data plan.";
        }

        if (text.includes("forecast") || text.includes("end") || text.includes("month")) {
            return `Offline forecast: you have spent ${formatCurrency(currentMonthExpenses)} this month. At this pace, expenses may land around ${formatCurrency(projectedMonthExpenses)}, leaving an estimated balance of ${formatCurrency(Math.abs(projectedBalance))}${projectedBalance >= 0 ? "." : " short."}`;
        }

        if (text.includes("cut") || text.includes("reduce") || text.includes("save")) {
            return topCategory
                ? `Start with ${topCategory.name}. A 20% reduction there would free about ${formatCurrency(topCategory.value * 0.2)} based on recorded spending.`
                : "Add a few categorized expenses first, then I can show the easiest category to cut.";
        }

        if (text.includes("budget")) {
            return budgetSuggestions.length > 0
                ? `Suggested next budgets: ${budgetSuggestions.map((item) => `${item.category} ${formatCurrency(item.amount)}`).join(", ")}. These are calculated locally from your past category totals.`
                : "I need categorized expenses before I can suggest reliable budgets.";
        }

        if (text.includes("subscription") || text.includes("recurring")) {
            return subscriptionHints.length > 0
                ? `Possible recurring charges: ${subscriptionHints.map((group) => `${group[0].title} (${formatCurrency(group[0].amount)})`).join(", ")}.`
                : "I did not find obvious subscriptions yet. Label subscriptions or bills to improve detection.";
        }

        if (text.includes("duplicate") || text.includes("double")) {
            return duplicateCharges.length > 0
                ? `Possible duplicates: ${duplicateCharges.map((group) => `${group[0].title} on ${group[0].date}`).join(", ")}.`
                : "No same-day duplicate charges found offline.";
        }

        if (text.includes("goal")) {
            const nextGoal = goals.find((goal) => goal.targetAmount > goal.currentAmount);
            return nextGoal
                ? `${nextGoal.title} needs ${formatCurrency(nextGoal.targetAmount - nextGoal.currentAmount)} more. Your current balance is ${formatCurrency(Math.abs(balance))}${balance >= 0 ? ", so consider moving a fixed amount after each income entry." : ", so stabilize cash flow before adding more."}`
                : "Add a savings goal and I can calculate the remaining amount and monthly pace.";
        }

        if (text.includes("category") || text.includes("categor")) {
            return categorySuggestions.length > 0
                ? `Category ideas: ${categorySuggestions.map(({ transaction, suggestion }) => `${transaction.title} -> ${suggestion}`).join(", ")}.`
                : topCategory
                    ? `${topCategory.name} is currently your largest expense category.`
                    : "No category suggestions yet.";
        }

        return topCategory
            ? `Quick offline read: balance is ${formatCurrency(Math.abs(balance))}${balance >= 0 ? "" : " short"}, top spending is ${topCategory.name}, and projected monthly expenses are ${formatCurrency(projectedMonthExpenses)}.`
            : `Quick offline read: balance is ${formatCurrency(Math.abs(balance))}. Add categorized transactions for sharper answers.`;
    };

    const handleCoachSubmit = (event: FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        setCoachAnswer(answerOfflineQuestion(coachQuestion));
    };

    const handleOnlineQuestionSubmit = async (event: FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        const question = onlineQuestion.trim();
        if (!question) {
            setOnlineAnswer("Ask a question first.");
            return;
        }

        setOnlineQuestionLoading(true);
        setAiError("");

        try {
            const response = await api.post<AiQuestionResponse>("/api/ai/ask", { question });
            setOnlineAnswer(response.data.answer);
        } catch (error: unknown) {
            console.error("Error asking online AI:", error);
            setAiError("Online AI could not answer right now.");
        } finally {
            setOnlineQuestionLoading(false);
        }
    };

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
                                onClick={() => setDarkMode(!darkMode)}
                                className="btn-secondary w-auto px-4 py-2 text-sm transition-all duration-300 hover:shadow-md"
                            >
                                {darkMode ? "Light mode" : "Dark mode"}
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
                                {devError ? (
                                    <div>
                                        <p className="font-semibold text-rose-600 dark:text-rose-300">Last error</p>
                                        <p className="mt-2 break-words text-xs leading-5">{devError}</p>
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
                            <div className={`card border-l-4 border-l-blue-500 p-6 transition-all duration-300 hover:shadow-lg hover:shadow-blue-500/10 hover:-translate-y-0.5 ${mounted ? 'animate-slide-up stagger-1' : 'opacity-0'}`}>
                                <div className="flex items-center justify-between">
                                    <div>
                                        <p className="text-sm font-medium text-slate-500 dark:text-slate-400">
                                            Total Balance
                                        </p>
                                        <p className={`mt-2 text-2xl font-black transition-colors duration-200 ${balance >= 0 ? "text-emerald-600 dark:text-emerald-300" : "text-rose-600 dark:text-rose-300"}`}>
                                            {formatCurrency(Math.abs(balance))}
                                        </p>
                                    </div>
                                    <BiWallet className="text-3xl text-blue-600 dark:text-blue-400 transition-transform duration-300 group-hover:scale-110" />
                                </div>
                            </div>

                            <div className={`card border-l-4 border-l-emerald-500 p-6 transition-all duration-300 hover:shadow-lg hover:shadow-emerald-500/10 hover:-translate-y-0.5 ${mounted ? 'animate-slide-up stagger-2' : 'opacity-0'}`}>
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

                            <div className={`card border-l-4 border-l-rose-500 p-6 transition-all duration-300 hover:shadow-lg hover:shadow-rose-500/10 hover:-translate-y-0.5 ${mounted ? 'animate-slide-up stagger-3' : 'opacity-0'}`}>
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

                        <section className="card border-l-4 border-l-cyan-500 p-6">
                            <div className="flex flex-col gap-5 xl:flex-row xl:items-start xl:justify-between">
                                <div className="max-w-4xl">
                                    <div className="flex items-center gap-3">
                                        <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-cyan-100 text-cyan-700 dark:bg-cyan-500/10 dark:text-cyan-300">
                                            <LuBrainCircuit className="text-xl" />
                                        </div>
                                        <div>
                                            <p className="text-sm font-semibold uppercase tracking-[0.25em] text-cyan-700 dark:text-cyan-300">
                                                Offline smart coach
                                            </p>
                                            <h3 className="text-lg font-bold text-slate-900 dark:text-white">
                                                Ask Spark without using internet
                                            </h3>
                                        </div>
                                    </div>

                                    <form onSubmit={handleCoachSubmit} className="mt-5 flex flex-col gap-3 sm:flex-row">
                                        <input
                                            value={coachQuestion}
                                            onChange={(event) => setCoachQuestion(event.target.value)}
                                            className="input-field min-h-12 transition-all duration-200 focus:scale-[1.01]"
                                            placeholder="Ask: forecast this month, what can I cut, any duplicates..."
                                        />
                                        <button className="btn-primary w-full px-5 py-3 text-sm sm:w-auto transition-all duration-200 active:scale-95">
                                            <LuSend />
                                            Ask
                                        </button>
                                    </form>

                                    <div className="mt-4 rounded-2xl border border-cyan-200 bg-cyan-50 px-4 py-3 text-sm leading-6 text-cyan-950 transition-all duration-300 hover:shadow-sm dark:border-cyan-500/20 dark:bg-cyan-500/10 dark:text-cyan-100">
                                        {coachAnswer}
                                    </div>
                                </div>

                                <div className="rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm font-semibold text-emerald-800 dark:border-emerald-500/20 dark:bg-emerald-500/10 dark:text-emerald-100 transition-all duration-300 hover:shadow-md hover:scale-[1.01]">
                                    <div className="flex items-center gap-2">
                                        <LuWifiOff className="animate-bounce-soft" />
                                        Data saver on
                                    </div>
                                    <p className="mt-2 text-xs font-normal leading-5">
                                        Local answers use data already loaded in Spark.
                                    </p>
                                </div>
                            </div>

                            <div className="mt-6 grid gap-3 md:grid-cols-2 xl:grid-cols-5">
                                {smartInsights.map((insight, index) => (
                                    <div key={insight.title} className={`rounded-2xl border p-4 transition-all duration-300 hover:shadow-lg hover:-translate-y-0.5 ${toneClasses[insight.tone]} animate-slide-up stagger-${Math.min(index + 1, 6)}`}>
                                        <p className="text-xs font-semibold uppercase tracking-[0.18em] opacity-70">
                                            {insight.title}
                                        </p>
                                        <p className="mt-2 text-xl font-black">
                                            {insight.value}
                                        </p>
                                        <p className="mt-2 text-sm leading-5 opacity-80">
                                            {insight.detail}
                                        </p>
                                    </div>
                                ))}
                            </div>

                            <div className="mt-6 grid gap-4 lg:grid-cols-2">
                                <div className="rounded-2xl border border-slate-200 bg-white/70 p-4 transition-all duration-300 hover:shadow-md dark:border-slate-700 dark:bg-slate-900/40">
                                    <div className="flex items-center gap-2 text-sm font-bold text-slate-900 dark:text-white">
                                        <LuTriangleAlert className="text-amber-500" />
                                        Smart alerts
                                    </div>
                                    <div className="mt-3 space-y-2 text-sm text-slate-600 dark:text-slate-300">
                                        {duplicateCharges.length > 0 ? (
                                            duplicateCharges.map((group) => (
                                                <p key={`${group[0].title}-${group[0].date}`}>
                                                    Possible duplicate: {group[0].title} for {formatCurrency(group[0].amount)} on {group[0].date}.
                                                </p>
                                            ))
                                        ) : (
                                            <p>No duplicate same-day charges found.</p>
                                        )}
                                        {subscriptionHints.length > 0 ? (
                                            <p>
                                                Recurring watch: {subscriptionHints.map((group) => group[0].title).join(", ")}.
                                            </p>
                                        ) : (
                                            <p>No obvious subscriptions found yet.</p>
                                        )}
                                    </div>
                                </div>

                                <div className="rounded-2xl border border-slate-200 bg-white/70 p-4 transition-all duration-300 hover:shadow-md dark:border-slate-700 dark:bg-slate-900/40">
                                    <div className="flex items-center gap-2 text-sm font-bold text-slate-900 dark:text-white">
                                        <LuBadgeCheck className="text-emerald-500" />
                                        Offline recommendations
                                    </div>
                                    <div className="mt-3 grid gap-2 text-sm text-slate-600 dark:text-slate-300 sm:grid-cols-2">
                                        <div>
                                            <p className="font-semibold text-slate-900 dark:text-white">Budget ideas</p>
                                            {budgetSuggestions.length > 0 ? (
                                                budgetSuggestions.map((item) => (
                                                    <p key={item.category}>{item.category}: {formatCurrency(item.amount)}</p>
                                                ))
                                            ) : (
                                                <p>Add categorized expenses for suggestions.</p>
                                            )}
                                        </div>
                                        <div>
                                            <p className="font-semibold text-slate-900 dark:text-white">Category ideas</p>
                                            {categorySuggestions.length > 0 ? (
                                                categorySuggestions.map(({ transaction, suggestion }) => (
                                                    <p key={transaction.id}>{transaction.title}: {suggestion}</p>
                                                ))
                                            ) : (
                                                <p>No uncategorized matches right now.</p>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <div className="mt-6 rounded-2xl border border-violet-200 bg-violet-50 p-4 transition-all duration-300 hover:shadow-lg dark:border-violet-500/20 dark:bg-violet-500/10">
                                <div className="flex flex-col gap-4">
                                    <div className="text-sm leading-6 text-violet-950 dark:text-violet-100">
                                        <div className="flex items-center gap-2 font-bold">
                                            <LuSparkles />
                                            Optional online coach
                                        </div>
                                        {aiLoading ? (
                                            <p className="mt-2">Reviewing your latest finance data online...</p>
                                        ) : aiInsight ? (
                                            <div className="mt-2 space-y-3">
                                                <p>{aiInsight.summary}</p>
                                                {aiInsight.actions.length > 0 && (
                                                    <div className="grid gap-2 sm:grid-cols-3">
                                                        {aiInsight.actions.map((action, index) => (
                                                            <div
                                                                key={action}
                                                                className="rounded-2xl border border-violet-200 bg-white/70 px-4 py-3 text-sm font-medium transition-all duration-300 hover:shadow-md hover:-translate-y-0.5 dark:border-violet-500/20 dark:bg-slate-950/30"
                                                                style={{ animationDelay: `${index * 0.05}s` }}
                                                            >
                                                                {action}
                                                            </div>
                                                        ))}
                                                    </div>
                                                )}
                                            </div>
                                        ) : aiError ? (
                                            <p className="mt-2 text-rose-600 dark:text-rose-300">{aiError}</p>
                                        ) : (
                                            <p className="mt-2">Use this only when you want a richer cloud AI explanation.</p>
                                        )}
                                    </div>

                                    <form onSubmit={handleOnlineQuestionSubmit} className="grid gap-3 lg:grid-cols-[1fr_auto_auto]">
                                        <input
                                            value={onlineQuestion}
                                            onChange={(event) => setOnlineQuestion(event.target.value)}
                                            className="input-field min-h-12"
                                            placeholder="Ask online AI: why did I overspend, what should I budget..."
                                        />
                                        <button
                                            disabled={onlineQuestionLoading}
                                            className="btn-primary w-full px-5 py-3 text-sm disabled:cursor-not-allowed disabled:opacity-60 lg:w-auto"
                                        >
                                            <LuSend />
                                            {onlineQuestionLoading ? "Asking..." : "Ask online"}
                                        </button>
                                        <button
                                            type="button"
                                            onClick={generateAiInsight}
                                            disabled={aiLoading}
                                            className="btn-secondary w-full px-5 py-3 text-sm disabled:cursor-not-allowed disabled:opacity-60 lg:w-auto"
                                        >
                                            <LuSparkles />
                                            {aiLoading ? "Thinking..." : "Full insight"}
                                        </button>
                                    </form>

                                    {onlineAnswer && (
                                        <div className="rounded-2xl border border-violet-200 bg-white/70 px-4 py-3 text-sm leading-6 text-violet-950 dark:border-violet-500/20 dark:bg-slate-950/30 dark:text-violet-100">
                                            {onlineAnswer}
                                        </div>
                                    )}
                                </div>
                            </div>
                        </section>

                        <section className="grid gap-6 xl:grid-cols-[1.15fr_0.85fr]">
                            <div className={`card p-6 transition-all duration-300 hover:shadow-lg ${mounted ? 'animate-slide-up stagger-4' : 'opacity-0'}`}>
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

                            <div className={`card p-6 transition-all duration-300 hover:shadow-lg ${mounted ? 'animate-slide-up stagger-5' : 'opacity-0'}`}>
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

                        <section className={`card p-6 transition-all duration-300 hover:shadow-lg ${mounted ? 'animate-slide-up stagger-6' : 'opacity-0'}`}>
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
                                    className="text-sm font-semibold text-blue-600 transition-all duration-200 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300 hover:underline underline-offset-4"
                                >
                                    View all
                                </button>
                            </div>

                            {transactions.length === 0 ? (
                                <div className="rounded-[1.75rem] border border-dashed border-slate-300 bg-slate-50 px-6 py-14 text-center transition-all duration-300 dark:border-slate-700 dark:bg-slate-900/40">
                                    <BiCreditCard className="mx-auto text-4xl text-slate-400 transition-transform duration-300 hover:scale-110" />
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
                                    {transactions.slice(-5).reverse().map((t, index) => (
                                        <div
                                            key={t.id}
                                            className={`flex flex-col gap-4 rounded-3xl border border-slate-200/70 bg-slate-50 px-4 py-4 transition-all duration-200 hover:bg-white hover:shadow-md hover:-translate-y-0.5 dark:border-slate-700 dark:bg-slate-900/50 dark:hover:bg-slate-900 sm:flex-row sm:items-center sm:justify-between ${mounted ? 'animate-slide-up' : 'opacity-0'}`}
                                            style={{ animationDelay: `${index * 0.06}s` }}
                                        >
                                            <div className="flex items-center gap-3">
                                                <div className={`flex h-12 w-12 items-center justify-center rounded-2xl transition-transform duration-200 hover:scale-110 ${t.type === "income" ? "bg-emerald-100 text-emerald-600 dark:bg-emerald-500/10 dark:text-emerald-300" : "bg-rose-100 text-rose-600 dark:bg-rose-500/10 dark:text-rose-300"}`}>
                                                    {t.type === "income" ? "+" : "-"}
                                                </div>
                                                <div>
                                                    <p className="font-semibold text-slate-900 dark:text-white">
                                                        {t.title}
                                                    </p>
                                                    <p className="text-sm text-slate-500 dark:text-slate-400">
                                                        {t.category ? `${t.category} | ` : ""}
                                                        {t.date}
                                                    </p>
                                                </div>
                                            </div>

                                            <p className={`text-lg font-bold sm:text-right transition-all duration-200 ${t.type === "income" ? "text-emerald-600 dark:text-emerald-300" : "text-rose-600 dark:text-rose-300"}`}>
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
                    className="fixed inset-0 z-40 bg-slate-950/50 backdrop-blur-sm lg:hidden animate-fade-in"
                    onClick={() => setIsSidebarOpen(false)}
                />
            )}
        </div>
    );
}

export default Sidebar;
