import { useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";

import Input from "../Components/Input";
import { api, setApiAuthToken } from "../lib/api";
import { expenseCategories } from "../lib/categories";
import { useAppData } from "../contexts/AppDataContext";
import type { Transaction } from "../types";

// JWT helpers
interface JwtPayload {
    exp?: number;
    [key: string]: unknown;
}

function parseJwt(token: string | null): JwtPayload | null {
    if (!token) return null;
    try {
        const payload = token.split(".")[1];
        const base64 = payload.replace(/-/g, "+").replace(/_/g, "/");
        const decoded = decodeURIComponent(
            atob(base64)
                .split("")
                .map((c) => `%${c.charCodeAt(0).toString(16).padStart(2, "0")}`)
                .join("")
        );
        return JSON.parse(decoded) as JwtPayload;
    } catch {
        return null;
    }
}

function isTokenExpired(token: string | null) {
    const payload = parseJwt(token);
    if (!payload) return false;
    if (typeof payload.exp !== "number") return false;
    const now = Math.floor(Date.now() / 1000);
    return payload.exp < now;
}

function AddTransaction() {
    const navigate = useNavigate();
    const { setTransactions, setGlobalError, username } = useAppData();
    const [loading, setLoading] = useState(false);
    const [errorMessage, setErrorMessage] = useState("");

    const [form, setForm] = useState<Omit<Transaction, "id">>({
        title: "",
        amount: 0,
        type: "expense",
        category: "",
        date: new Date().toISOString().split("T")[0]
    });

    const handleChange = (
        e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
    ) => {
        setForm({
            ...form,
            [e.target.name]:
                e.target.name === "amount"
                    ? Number(e.target.value)
                    : e.target.value
        });
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setErrorMessage("");
        //This token is for getting like the key so that the user does not have to log in again ever
        
        try {
            const token = localStorage.getItem("token");

            if (!token) {
                const msg = "Not authenticated. Please login.";
                setErrorMessage(msg);
                setGlobalError(msg);
                navigate("/login");
                return;
            }

            if (isTokenExpired(token)) {
                const msg = "Session expired. Please login again.";
                setErrorMessage(msg);
                setGlobalError(msg);
                localStorage.removeItem("token");
                setApiAuthToken(null);
                navigate("/login");
                return;
            }

            // Ensure the api instance has the token set
            setApiAuthToken(token);

            const transactionData = {
                ...form,
                date: new Date(form.date + 'T00:00:00').toISOString()
            };

            const response = await api.post("/api/transactions", transactionData);

            setTransactions(prev => [...prev, response.data]);
            navigate("/");
        } catch (error) {
            let message = "Failed to save transaction";
            if (axios.isAxiosError(error)) {
                if (error.response?.status === 401) {
                    message = "Unauthorized. Please login again.";
                    localStorage.removeItem("token");
                    setApiAuthToken(null);
                    navigate("/login");
                } else {
                    message =
                        error.response?.data?.message ||
                        error.response?.data ||
                        error.message ||
                        message;
                }
            } else if (error instanceof Error) {
                message = error.message;
            }
            const displayMessage = typeof message === "string" ? message : "Failed to save transaction";
            setErrorMessage(displayMessage);
            setGlobalError(displayMessage);
            console.error("Error adding transaction:", error);
        } finally {
            setLoading(false);
        }
    };

    const previewAmount = form.amount || 0;

    return (
        <div className="min-h-screen px-4 py-6 sm:px-6 lg:px-8 page-enter">
            <div className="mx-auto grid max-w-6xl gap-6 lg:grid-cols-[1fr_320px]">
                <form
                    onSubmit={handleSubmit}
                    className="card p-6 sm:p-8"
                >
                    
                    <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                        <div>
                            <p className="text-xs font-semibold uppercase tracking-[0.3em] text-blue-600 dark:text-blue-400">
                                New entry
                            </p>
                            <h1 className="mt-2 text-3xl font-black tracking-tight text-slate-900 dark:text-white">
                                Add Transaction
                            </h1>
                            <p className="mt-2 text-sm leading-6 text-slate-500 dark:text-slate-400">
                                {username ? `Hi ${username}, record what came in or went out and keep your dashboard sharp.` : "Record what came in or went out and keep your cash flow dashboard current."}
                            </p>
                        </div>

                        <button
                            type="button"
                            onClick={() => navigate("/")}
                            className="btn-secondary w-auto px-4 py-2 text-sm"
                        >
                            Back to dashboard
                        </button>
                    </div>

                    <div className="mt-8 grid gap-4">
                        {errorMessage && (
                            <div className="rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700 dark:border-rose-500/30 dark:bg-rose-500/10 dark:text-rose-200">
                                {errorMessage}
                            </div>
                        )}

                        <Input
                            name="title"
                            placeholder="e.g. Salary payment"
                            onChange={handleChange}
                            value={form.title}
                            label="Title"
                            required
                        />

                        <Input
                            name="amount"
                            type="number"
                            min="0.01"
                            step="0.01"
                            placeholder="0.00"
                            onChange={handleChange}
                            value={form.amount}
                            label="Amount"
                            required
                        />

                        <div className="grid gap-4 sm:grid-cols-2">
                            <div className="space-y-2">
                                <label className="text-sm font-semibold text-slate-700 dark:text-slate-200">
                                    Type
                                </label>
                                <select
                                    name="type"
                                    value={form.type}
                                    onChange={handleChange}
                                    className="input-field"
                                >
                                    <option value="expense">Expense</option>
                                    <option value="income">Income</option>
                                </select>
                            </div>

                            <div className="space-y-2">
                                <label className="text-sm font-semibold text-slate-700 dark:text-slate-200">
                                    Date
                                </label>
                                <input
                                    type="date"
                                    name="date"
                                    value={form.date}
                                    onChange={handleChange}
                                    className="input-field"
                                    required
                                />
                            </div>
                        </div>

                        {form.type === "expense" && (
                            <div className="space-y-2">
                                <label className="text-sm font-semibold text-slate-700 dark:text-slate-200">
                                    Category
                                </label>
                                <select
                                    name="category"
                                    value={form.category}
                                    onChange={handleChange}
                                    className="input-field"
                                >
                                    <option value="">Select a category</option>
                                    {expenseCategories.map((category) => (
                                        <option key={category} value={category}>
                                            {category}
                                        </option>
                                    ))}
                                </select>
                            </div>
                        )}

                        <button className="btn-primary mt-2" disabled={loading}>
                            {loading ? "Saving..." : "Save Transaction"}
                        </button>
                    </div>
                </form>

                <aside className="surface rounded-4xl p-6 sm:p-8">
                    <p className="text-xs font-semibold uppercase tracking-[0.3em] text-blue-600 dark:text-blue-400">
                        Preview
                    </p>
                    <h2 className="mt-2 text-xl font-bold text-slate-900 dark:text-white">
                        Transaction summary
                    </h2>
                    <div className="mt-6 rounded-3xl bg-slate-900 p-5 text-white shadow-xl dark:bg-slate-950">
                        <div className="flex items-start justify-between gap-4">
                            <div>
                                <p className="text-sm text-white/60">Title</p>
                                <p className="mt-1 text-lg font-semibold">
                                    {form.title || "Untitled transaction"}
                                </p>
                            </div>
                            <span
                                className={`rounded-full px-3 py-1 text-xs font-semibold uppercase tracking-[0.2em] ${
                                    form.type === "income"
                                        ? "bg-emerald-400/15 text-emerald-300"
                                        : "bg-rose-400/15 text-rose-300"
                                }`}
                            >
                                {form.type}
                            </span>
                        </div>

                        <div className="mt-6 flex items-end justify-between">
                            <div>
                                <p className="text-sm text-white/60">Amount</p>
                                <p className="mt-1 text-3xl font-black tracking-tight">
                                    NGN {previewAmount.toLocaleString()}
                                </p>
                            </div>
                            <div className="text-right text-sm text-white/60">
                                <p>Category</p>
                                <p className="mt-1 text-white">
                                    {form.type === "income" ? "Income" : form.category || "Not set"}
                                </p>
                            </div>
                        </div>

                        <div className="mt-6 border-t border-white/10 pt-4 text-sm text-white/70">
                            <p>Date</p>
                            <p className="mt-1 text-white">{form.date}</p>
                        </div>
                    </div>
                </aside>
            </div>
        </div>
    );
}

export default AddTransaction;
