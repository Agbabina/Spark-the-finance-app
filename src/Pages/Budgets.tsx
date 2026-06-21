import { useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";

import Input from "../Components/Input";
import { api, setApiAuthToken } from "../lib/api";
import { expenseCategories } from "../lib/categories";
import type { Budget, Transaction } from "../types";

interface Props {
    budgets: Budget[];
    transactions: Transaction[];
    username: string;
    setBudgets: React.Dispatch<React.SetStateAction<Budget[]>>;
    setGlobalError: React.Dispatch<React.SetStateAction<string>>;
}

const monthOptions = [
    "January",
    "February",
    "March",
    "April",
    "May",
    "June",
    "July",
    "August",
    "September",
    "October",
    "November",
    "December"
];

function formatCurrency(value: number) {
    return `NGN ${value.toLocaleString()}`;
}

function Budgets({ budgets, transactions, username, setBudgets, setGlobalError }: Props) {
    const navigate = useNavigate();
    const now = new Date();
    const [loading, setLoading] = useState(false);
    const [errorMessage, setErrorMessage] = useState("");
    const [form, setForm] = useState({
        category: "",
        limit: "",
        month: now.getMonth() + 1,
        year: now.getFullYear()
    });

    const handleChange = (
        e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
    ) => {
        const { name, value } = e.target;
        setForm((current) => ({
            ...current,
            [name]: name === "month" || name === "year" ? Number(value) : value
        }));
    };

    const getSpent = (budget: Budget) =>
        transactions
            .filter(
                (transaction) =>
                    transaction.type === "expense" &&
                    transaction.category === budget.category &&
                    new Date(transaction.date).getMonth() + 1 === budget.month &&
                    new Date(transaction.date).getFullYear() === budget.year
            )
            .reduce((sum, transaction) => sum + transaction.amount, 0);

    const budgetRows = budgets.map((budget) => {
        const spent = getSpent(budget);
        const remaining = budget.limit - spent;
        const progress = budget.limit > 0 ? Math.min(100, (spent / budget.limit) * 100) : 0;

        return {
            budget,
            spent,
            remaining,
            progress
        };
    });

    const totalLimit = budgetRows.reduce((sum, row) => sum + row.budget.limit, 0);
    const totalSpent = budgetRows.reduce((sum, row) => sum + row.spent, 0);
    const totalRemaining = totalLimit - totalSpent;

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setErrorMessage("");

        try {
            const token = localStorage.getItem("token");
            if (!token) {
                const msg = "Not authenticated. Please login.";
                setErrorMessage(msg);
                setGlobalError(msg);
                navigate("/login");
                return;
            }

            setApiAuthToken(token);

            const response = await api.post("/api/budgets", {
                category: form.category,
                limit: Number(form.limit),
                month: form.month,
                year: form.year
            });

            setBudgets((current) => [...current, response.data]);
            setForm((current) => ({
                ...current,
                limit: "",
                category: ""
            }));
        } catch (error: unknown) {
            let message = "Failed to save budget";
            if (axios.isAxiosError(error)) {
                message =
                    error.response?.data?.message ||
                    error.response?.data ||
                    error.message ||
                    message;
                if (error.response?.status === 401) {
                    localStorage.removeItem("token");
                    setApiAuthToken(null);
                    navigate("/login");
                }
            } else if (error instanceof Error) {
                message = error.message;
            }

            const displayMessage = typeof message === "string" ? message : "Failed to save budget";
            setErrorMessage(displayMessage);
            setGlobalError(displayMessage);
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async (id: number) => {
        try {
            const token = localStorage.getItem("token");
            if (token) {
                setApiAuthToken(token);
            }

            await api.delete(`/api/budgets/${id}`);
            setBudgets((current) => current.filter((budget) => budget.id !== id));
        } catch (error: unknown) {
            const message = axios.isAxiosError(error)
                ? error.response?.data?.message ||
                  error.response?.data ||
                  error.message ||
                  "Failed to delete budget"
                : error instanceof Error
                    ? error.message
                    : "Failed to delete budget";

            const displayMessage = typeof message === "string" ? message : "Failed to delete budget";
            setErrorMessage(displayMessage);
            setGlobalError(displayMessage);
        }
    };

    return (
        <div className="min-h-screen px-4 py-6 sm:px-6 lg:px-8">
            <div className="mx-auto grid max-w-7xl gap-6 xl:grid-cols-[360px_1fr]">
                <form onSubmit={handleSubmit} className="card p-6 sm:p-8">
                    <p className="text-xs font-semibold uppercase tracking-[0.3em] text-blue-600 dark:text-blue-400">
                        Money plan
                    </p>
                    <h1 className="mt-2 text-3xl font-black tracking-tight text-slate-900 dark:text-white">
                        Budgets
                    </h1>
                    <p className="mt-2 text-sm leading-6 text-slate-500 dark:text-slate-400">
                        {username ? `Hi ${username}, define what each category should spend this month.` : "Define what each category should spend this month."}
                    </p>

                    <div className="mt-6 space-y-4">
                        {errorMessage && (
                            <div className="rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700 dark:border-rose-500/30 dark:bg-rose-500/10 dark:text-rose-200">
                                {errorMessage}
                            </div>
                        )}

                        <div className="space-y-2">
                            <label className="text-sm font-semibold text-slate-700 dark:text-slate-200">
                                Category
                            </label>
                            <select
                                name="category"
                                value={form.category}
                                onChange={handleChange}
                                className="input-field"
                                required
                            >
                                <option value="">Select a category</option>
                                {expenseCategories.map((category) => (
                                    <option key={category} value={category}>
                                        {category}
                                    </option>
                                ))}
                            </select>
                        </div>

                        <Input
                            name="limit"
                            type="number"
                            min="0.01"
                            step="0.01"
                            placeholder="0.00"
                            onChange={handleChange}
                            value={form.limit}
                            label="Monthly limit"
                            required
                        />

                        <div className="grid gap-4 sm:grid-cols-2">
                            <div className="space-y-2">
                                <label className="text-sm font-semibold text-slate-700 dark:text-slate-200">
                                    Month
                                </label>
                                <select name="month" value={form.month} onChange={handleChange} className="input-field">
                                    {monthOptions.map((month, index) => (
                                        <option key={month} value={index + 1}>
                                            {month}
                                        </option>
                                    ))}
                                </select>
                            </div>

                            <Input
                                name="year"
                                type="number"
                                min="2000"
                                step="1"
                                placeholder="2026"
                                onChange={handleChange}
                                value={form.year}
                                label="Year"
                                required
                            />
                        </div>

                        <div className="flex flex-col gap-3 sm:flex-row">
                            <button className="btn-primary" disabled={loading}>
                                {loading ? "Saving..." : "Save Budget"}
                            </button>
                            <button
                                type="button"
                                onClick={() => navigate("/")}
                                className="btn-secondary"
                            >
                                Back to dashboard
                            </button>
                        </div>
                    </div>
                </form>

                <section className="space-y-6">
                    <div className="grid gap-4 sm:grid-cols-3">
                        <div className="card p-6">
                            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-blue-600 dark:text-blue-400">
                                Planned
                            </p>
                            <p className="mt-2 text-2xl font-black text-slate-900 dark:text-white">
                                {formatCurrency(totalLimit)}
                            </p>
                        </div>
                        <div className="card p-6">
                            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-rose-600 dark:text-rose-300">
                                Spent
                            </p>
                            <p className="mt-2 text-2xl font-black text-slate-900 dark:text-white">
                                {formatCurrency(totalSpent)}
                            </p>
                        </div>
                        <div className="card p-6">
                            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-emerald-600 dark:text-emerald-300">
                                Remaining
                            </p>
                            <p className={`mt-2 text-2xl font-black ${totalRemaining >= 0 ? "text-emerald-600 dark:text-emerald-300" : "text-rose-600 dark:text-rose-300"}`}>
                                {formatCurrency(Math.abs(totalRemaining))}
                            </p>
                        </div>
                    </div>

                    <div className="card p-6 sm:p-8">
                        <div className="mb-5">
                            <h2 className="text-2xl font-bold text-slate-900 dark:text-white">
                                Budget overview
                            </h2>
                            <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
                                Track each category against its monthly cap.
                            </p>
                        </div>

                        {budgetRows.length === 0 ? (
                            <div className="rounded-[1.75rem] border border-dashed border-slate-300 bg-slate-50 px-6 py-14 text-center dark:border-slate-700 dark:bg-slate-900/40">
                                <p className="text-lg font-semibold text-slate-900 dark:text-white">
                                    No budgets yet
                                </p>
                                <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">
                                    Add a budget to start comparing planned spend with actual spend.
                                </p>
                            </div>
                        ) : (
                            <div className="space-y-4">
                                {budgetRows.map(({ budget, spent, remaining, progress }) => (
                                    <div key={budget.id} className="rounded-3xl border border-slate-200/70 bg-slate-50 p-5 dark:border-slate-700 dark:bg-slate-900/50">
                                        <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                                            <div>
                                                <p className="text-sm font-semibold text-slate-900 dark:text-white">
                                                    {budget.category}
                                                </p>
                                                <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
                                                    {monthOptions[budget.month - 1]} {budget.year}
                                                </p>
                                            </div>

                                            <div className="flex items-center gap-3">
                                                <div className="text-right text-sm text-slate-500 dark:text-slate-400">
                                                    <p>Limit</p>
                                                    <p className="font-semibold text-slate-900 dark:text-white">
                                                        {formatCurrency(budget.limit)}
                                                    </p>
                                                </div>
                                                <button
                                                    type="button"
                                                    onClick={() => handleDelete(budget.id)}
                                                    className="btn-secondary w-auto px-3 py-2 text-sm"
                                                >
                                                    Delete
                                                </button>
                                            </div>
                                        </div>

                                        <div className="mt-4">
                                            <div className="mb-2 flex items-center justify-between text-sm">
                                                <span className="text-slate-500 dark:text-slate-400">
                                                    Spent {formatCurrency(spent)}
                                                </span>
                                                <span className={remaining >= 0 ? "text-emerald-600 dark:text-emerald-300" : "text-rose-600 dark:text-rose-300"}>
                                                    {remaining >= 0 ? `Remaining ${formatCurrency(remaining)}` : `Over by ${formatCurrency(Math.abs(remaining))}`}
                                                </span>
                                            </div>
                                            <div className="h-3 overflow-hidden rounded-full bg-slate-200 dark:bg-slate-800">
                                                <div
                                                    className={`h-full rounded-full ${remaining >= 0 ? "bg-emerald-500" : "bg-rose-500"}`}
                                                    style={{ width: `${progress}%` }}
                                                />
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </section>
            </div>
        </div>
    );
}

export default Budgets;
