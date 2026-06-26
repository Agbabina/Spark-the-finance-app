import { useMemo } from "react";
import { LuBadgeCheck, LuBrainCircuit, LuSend, LuSparkles, LuTriangleAlert, LuWifiOff } from "react-icons/lu";
import { BiPlus, BiWallet, BiCreditCard } from "react-icons/bi";
import { useNavigate } from "react-router-dom";
import {
    LineChart,
    Line,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer,
    PieChart,
    Pie,
    Cell
} from "recharts";

import type { Transaction } from "../types.ts";
import { useAppData } from "../contexts/AppDataContext";

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

const sameMonth = (date: string) => {
    const parsed = new Date(date);
    const now = new Date();
    return parsed.getMonth() === now.getMonth() && parsed.getFullYear() === now.getFullYear();
};

function Dashboard() {
    const navigate = useNavigate();
    const { transactions, budgets, goals, username } = useAppData();

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
                const key = `${transaction.title.toLowerCase().trim()}-${transaction.amount}-${transaction.date}`;
                seen.set(key, [...(seen.get(key) ?? []), transaction]);
            });

        return Array.from(seen.values()).filter((group) => group.length > 1).slice(0, 3);
    }, [transactions]);

    const subscriptionHints = useMemo(() => {
        const groups = new Map<string, Transaction[]>();
        transactions
            .filter((transaction) => transaction.type === "expense")
            .forEach((transaction) => {
                const title = transaction.title.toLowerCase().trim();
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

    const toneClasses: Record<SmartInsight["tone"], string> = {
        blue: "border-blue-200 bg-blue-50 text-blue-900 dark:border-blue-500/20 dark:bg-blue-500/10 dark:text-blue-100",
        emerald: "border-emerald-200 bg-emerald-50 text-emerald-900 dark:border-emerald-500/20 dark:bg-emerald-500/10 dark:text-emerald-100",
        amber: "border-amber-200 bg-amber-50 text-amber-900 dark:border-amber-500/20 dark:bg-amber-500/10 dark:text-amber-100",
        rose: "border-rose-200 bg-rose-50 text-rose-900 dark:border-rose-500/20 dark:bg-rose-500/10 dark:text-rose-100",
        slate: "border-slate-200 bg-slate-50 text-slate-900 dark:border-slate-700 dark:bg-slate-900/50 dark:text-slate-100"
    };

    return (
        <div className="mx-auto max-w-7xl space-y-6">
            <section className="grid gap-4 sm:grid-cols-3">
                <div className="card border-l-4 border-l-blue-500 p-6 transition-all duration-300 hover:shadow-lg hover:shadow-blue-500/10 hover:-translate-y-0.5">
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

                <div className="card border-l-4 border-l-emerald-500 p-6 transition-all duration-300 hover:shadow-lg hover:shadow-emerald-500/10 hover:-translate-y-0.5">
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

                <div className="card border-l-4 border-l-rose-500 p-6 transition-all duration-300 hover:shadow-lg hover:shadow-rose-500/10 hover:-translate-y-0.5">
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

                        <form onSubmit={(e) => e.preventDefault()} className="mt-5 flex flex-col gap-3 sm:flex-row">
                            <input
                                placeholder="Ask: forecast this month, what can I cut, any duplicates..."
                                className="input-field min-h-12 transition-all duration-200 focus:scale-[1.01]"
                            />
                            <button className="btn-primary w-full px-5 py-3 text-sm sm:w-auto transition-all duration-200 active:scale-95">
                                <LuSend />
                                Ask
                            </button>
                        </form>

                        <div className="mt-4 rounded-2xl border border-cyan-200 bg-cyan-50 px-4 py-3 text-sm leading-6 text-cyan-950 transition-all duration-300 hover:shadow-sm dark:border-cyan-500/20 dark:bg-cyan-500/10 dark:text-cyan-100">
                            Ask about spending, budgets, subscriptions, forecasts, goals, or categories. This assistant works offline.
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
                        <div key={insight.title} className={`rounded-2xl border p-4 transition-all duration-300 hover:shadow-lg hover:-translate-y-0.5 ${toneClasses[insight.tone]}`}>
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
                        <div className="mt-3 text-sm text-slate-600 dark:text-slate-300">
                            Add categorized expenses for budget suggestions and category ideas.
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
                            <p className="mt-2">Use this only when you want a richer cloud AI explanation.</p>
                        </div>
                    </div>
                </div>
            </section>

            <section className="grid gap-6 xl:grid-cols-[1.15fr_0.85fr]">
                <div className="card p-6 transition-all duration-300 hover:shadow-lg">
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

                    {lineData.length > 0 ? (
                        <ResponsiveContainer width="100%" height={320}>
                            <LineChart data={lineData}>
                                <CartesianGrid strokeDasharray="3 3" stroke="rgba(0,0,0,0.06)" />
                                <XAxis dataKey="day" stroke="#475569" style={{ fill: "#475569", fontSize: 12 }} />
                                <YAxis stroke="#475569" style={{ fill: "#475569", fontSize: 12 }} tickFormatter={(value) => value.toLocaleString()} />
                                <Tooltip formatter={(value) => [formatCurrency(Number(value)), ""]} />
                                <Line
                                    type="monotone"
                                    dataKey="income"
                                    stroke="#10b981"
                                    strokeWidth={3}
                                    dot={{ fill: "#10b981", strokeWidth: 2 }}
                                />
                                <Line
                                    type="monotone"
                                    dataKey="spending"
                                    stroke="#ef4444"
                                    strokeWidth={3}
                                    dot={{ fill: "#ef4444", strokeWidth: 2 }}
                                />
                            </LineChart>
                        </ResponsiveContainer>
                    ) : (
                        <div className="flex h-80 items-center justify-center">
                            <p className="text-slate-500">No data available yet.</p>
                        </div>
                    )}
                </div>

                <div className="card p-6 transition-all duration-300 hover:shadow-lg">
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
                        <div className="flex h-64 items-center justify-center rounded-3xl border border-dashed border-slate-300 bg-slate-50 text-center dark:border-slate-700 dark:bg-slate-900/40">
                            <div className="space-y-3">
                                <BiCreditCard className="mx-auto text-4xl text-slate-400" />
                                <p className="text-sm text-slate-500 dark:text-slate-400">No expense data available yet.</p>
                            </div>
                        </div>
                    )}
                </div>
            </section>

            <section className="card p-6 transition-all duration-300 hover:shadow-lg">
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
                        <BiCreditCard className="mx-auto text-4xl text-slate-400" />
                        <p className="mt-4 text-lg font-semibold text-slate-900 dark:text-white">
                            No transactions yet
                        </p>
                        <p className="mt-2 max-w-md text-sm leading-6 text-slate-500 dark:text-slate-400">
                            Add an expense or income entry to bring this view to life.
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
                                className="flex flex-col gap-4 rounded-3xl border border-slate-200/70 bg-slate-50 px-4 py-4 transition-all duration-200 hover:bg-white hover:shadow-md hover:-translate-y-0.5 dark:border-slate-700 dark:bg-slate-900/50 dark:hover:bg-slate-900 sm:flex-row sm:items-center sm:justify-between"
                            >
                                <div className="flex items-center gap-3">
                                    <div className={`flex h-12 w-12 items-center justify-center rounded-2xl font-bold ${t.type === "income" ? "bg-emerald-100 text-emerald-600 dark:bg-emerald-500/10 dark:text-emerald-300" : "bg-rose-100 text-rose-600 dark:bg-rose-500/10 dark:text-rose-300"}`}>
                                        {t.type === "income" ? "+" : "-"}
                                    </div>
                                    <div>
                                        <p className="font-semibold text-slate-900 dark:text-white">
                                            {t.title}
                                        </p>
                                        <p className="mt-1 text-sm text-slate-500 dark:text-slate-400 md:hidden">
                                            {t.category || "No category"} • {t.date}
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
    );
}

export default Dashboard;