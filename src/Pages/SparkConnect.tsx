import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";

import { api, setApiAuthToken } from "../lib/api";
import { useAppData } from "../contexts/AppDataContext";
import type { BankAccount } from "../types";

function formatCurrency(value: number) {
    return `NGN ${value.toLocaleString()}`;
}

const bankColors: Record<string, string> = {
    "chase": "bg-blue-600",
    "bank of america": "bg-red-600",
    "wells fargo": "bg-yellow-500",
    "citi": "bg-blue-400",
    "hsbc": "bg-red-500",
    "access": "bg-green-600",
    "gtbank": "bg-orange-500",
    "uba": "bg-indigo-600",
    "zenith": "bg-red-700",
    "first bank": "bg-blue-800",
    "default": "bg-slate-600",
};

function getBankColor(institutionName: string) {
    const key = institutionName.toLowerCase();
    for (const [bank, color] of Object.entries(bankColors)) {
        if (key.includes(bank)) {
            return color;
        }
    }
    return bankColors.default;
}

function getBankInitials(institutionName: string) {
    const words = institutionName.trim().split(/\s+/);
    if (words.length >= 2) {
        return (words[0][0] + words[words.length - 1][0]).toUpperCase();
    }
    return institutionName.slice(0, 2).toUpperCase();
}

const accountTypeLabels: Record<string, string> = {
    checking: "Checking",
    savings: "Savings",
    credit: "Credit Card",
    investment: "Investment",
    loan: "Loan",
};

export default function SparkConnect() {
    const navigate = useNavigate();
    const [accounts, setAccounts] = useState<BankAccount[]>([]);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [errorMessage, setErrorMessage] = useState("");
    const [showForm, setShowForm] = useState(false);

    const [form, setForm] = useState({
        institutionName: "",
        accountType: "checking",
        accountName: "",
        lastFourDigits: "",
        balance: "",
    });

    const fetchAccounts = async () => {
        try {
            const token = localStorage.getItem("token");
            if (!token) {
                navigate("/login");
                return;
            }
            setApiAuthToken(token);
            const response = await api.get("/api/accounts");
            setAccounts(response.data);
            setErrorMessage("");
        } catch (error: unknown) {
            let message = "Failed to load accounts";
            if (axios.isAxiosError(error)) {
                message = error.response?.data?.message || error.response?.data || error.message || message;
                if (error.response?.status === 401) {
                    localStorage.removeItem("token");
                    setApiAuthToken(null);
                    navigate("/login");
                    return;
                }
            } else if (error instanceof Error) {
                message = error.message;
            }
            setErrorMessage(message);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        void fetchAccounts();
    }, []);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        setForm((current) => ({
            ...current,
            [name]: value,
        }));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setSaving(true);
        setErrorMessage("");

        try {
            const token = localStorage.getItem("token");
            if (!token) {
                navigate("/login");
                return;
            }
            setApiAuthToken(token);

            const response = await api.post("/api/accounts/connect", {
                institutionName: form.institutionName,
                accountType: form.accountType,
                accountName: form.accountName,
                lastFourDigits: form.lastFourDigits,
                balance: Number(form.balance),
            });

            setAccounts((current) => [...current, response.data]);
            setForm({
                institutionName: "",
                accountType: "checking",
                accountName: "",
                lastFourDigits: "",
                balance: "",
            });
            setShowForm(false);
        } catch (error: unknown) {
            let message = "Failed to connect account";
            if (axios.isAxiosError(error)) {
                message = error.response?.data?.message || error.response?.data || error.message || message;
                if (error.response?.status === 401) {
                    localStorage.removeItem("token");
                    setApiAuthToken(null);
                    navigate("/login");
                    return;
                }
            } else if (error instanceof Error) {
                message = error.message;
            }
            setErrorMessage(message);
        } finally {
            setSaving(false);
        }
    };

    const handleDisconnect = async (id: number) => {
        try {
            const token = localStorage.getItem("token");
            if (!token) {
                navigate("/login");
                return;
            }
            setApiAuthToken(token);
            await api.delete(`/api/accounts/${id}`);
            setAccounts((current) => current.filter((account) => account.id !== id));
        } catch (error: unknown) {
            let message = "Failed to disconnect account";
            if (axios.isAxiosError(error)) {
                message = error.response?.data?.message || error.response?.data || error.message || message;
            } else if (error instanceof Error) {
                message = error.message;
            }
            setErrorMessage(message);
        }
    };

    const totalBalance = accounts.reduce((sum, account) => sum + account.balance, 0);
    const totalAccounts = accounts.length;

    return (
        <div className="min-h-screen px-4 py-6 sm:px-6 lg:px-8 page-enter">
            <div className="mx-auto max-w-7xl space-y-6">
                <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
                    <div>
                        <p className="text-xs font-semibold uppercase tracking-[0.3em] text-blue-600 dark:text-blue-400">
                            Bank sync
                        </p>
                        <h1 className="mt-2 text-3xl font-black tracking-tight text-slate-900 dark:text-white">
                            Spark Connect
                        </h1>
                        <p className="mt-2 text-sm leading-6 text-slate-500 dark:text-slate-400">
                            Link your bank accounts to import transactions automatically.
                        </p>
                    </div>
                    <button
                        type="button"
                        onClick={() => setShowForm((current) => !current)}
                        className="btn-primary w-auto px-6 py-3 text-sm"
                    >
                        {showForm ? "Cancel" : "+ Connect New Account"}
                    </button>
                </div>

                {errorMessage && (
                    <div className="rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700 dark:border-rose-500/30 dark:bg-rose-500/10 dark:text-rose-200">
                        {errorMessage}
                    </div>
                )}

                <div className="grid gap-4 sm:grid-cols-3">
                    <div className="card p-6">
                        <p className="text-xs font-semibold uppercase tracking-[0.2em] text-blue-600 dark:text-blue-400">
                            Total balance
                        </p>
                        <p className="mt-2 text-2xl font-black text-slate-900 dark:text-white">
                            {formatCurrency(totalBalance)}
                        </p>
                    </div>
                    <div className="card p-6">
                        <p className="text-xs font-semibold uppercase tracking-[0.2em] text-emerald-600 dark:text-emerald-300">
                            Accounts linked
                        </p>
                        <p className="mt-2 text-2xl font-black text-slate-900 dark:text-white">
                            {totalAccounts}
                        </p>
                    </div>
                    <div className="card p-6">
                        <p className="text-xs font-semibold uppercase tracking-[0.2em] text-purple-600 dark:text-purple-300">
                            Status
                        </p>
                        <p className="mt-2 text-2xl font-black text-emerald-600 dark:text-emerald-300">
                            {totalAccounts > 0 ? "Connected" : "No accounts"}
                        </p>
                    </div>
                </div>

                {showForm && (
                    <form onSubmit={handleSubmit} className="card p-6 sm:p-8">
                        <h2 className="text-xl font-bold text-slate-900 dark:text-white">
                            Connect a new account
                        </h2>
                        <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
                            Enter your bank details to link an account.
                        </p>

                        <div className="mt-6 grid gap-4 sm:grid-cols-2">
                            <div className="space-y-2 sm:col-span-2">
                                <label className="text-sm font-semibold text-slate-700 dark:text-slate-200">
                                    Institution name
                                </label>
                                <input
                                    name="institutionName"
                                    value={form.institutionName}
                                    onChange={handleChange}
                                    placeholder="e.g. GTBank, Access Bank"
                                    className="input-field"
                                    required
                                />
                            </div>

                            <div className="space-y-2">
                                <label className="text-sm font-semibold text-slate-700 dark:text-slate-200">
                                    Account type
                                </label>
                                <select
                                    name="accountType"
                                    value={form.accountType}
                                    onChange={handleChange}
                                    className="input-field"
                                >
                                    <option value="checking">Checking</option>
                                    <option value="savings">Savings</option>
                                    <option value="credit">Credit Card</option>
                                    <option value="investment">Investment</option>
                                    <option value="loan">Loan</option>
                                </select>
                            </div>

                            <div className="space-y-2">
                                <label className="text-sm font-semibold text-slate-700 dark:text-slate-200">
                                    Account name
                                </label>
                                <input
                                    name="accountName"
                                    value={form.accountName}
                                    onChange={handleChange}
                                    placeholder="e.g. Main checking"
                                    className="input-field"
                                    required
                                />
                            </div>

                            <div className="space-y-2">
                                <label className="text-sm font-semibold text-slate-700 dark:text-slate-200">
                                    Last 4 digits
                                </label>
                                <input
                                    name="lastFourDigits"
                                    value={form.lastFourDigits}
                                    onChange={handleChange}
                                    placeholder="****"
                                    maxLength={4}
                                    pattern="\d{4}"
                                    className="input-field"
                                    required
                                />
                            </div>

                            <div className="space-y-2">
                                <label className="text-sm font-semibold text-slate-700 dark:text-slate-200">
                                    Opening balance (NGN)
                                </label>
                                <input
                                    name="balance"
                                    type="number"
                                    min="0"
                                    step="0.01"
                                    value={form.balance}
                                    onChange={handleChange}
                                    placeholder="0.00"
                                    className="input-field"
                                    required
                                />
                            </div>
                        </div>

                        <div className="mt-6">
                            <button type="submit" className="btn-primary" disabled={saving}>
                                {saving ? "Connecting..." : "Connect Account"}
                            </button>
                        </div>
                    </form>
                )}

                {loading ? (
                    <div className="card flex items-center justify-center p-12">
                        <p className="text-sm text-slate-500 dark:text-slate-400">Loading accounts...</p>
                    </div>
                ) : accounts.length === 0 ? (
                    <div className="card flex flex-col items-center justify-center p-12 text-center">
                        <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-blue-50 text-2xl font-black text-blue-600 dark:bg-blue-500/10 dark:text-blue-400">
                            +
                        </div>
                        <h3 className="mt-4 text-lg font-bold text-slate-900 dark:text-white">
                            No accounts connected
                        </h3>
                        <p className="mt-2 max-w-md text-sm text-slate-500 dark:text-slate-400">
                            Connect your first bank account to start importing transactions automatically.
                        </p>
                        <button
                            type="button"
                            onClick={() => setShowForm(true)}
                            className="btn-primary mt-6 w-auto px-6 py-3 text-sm"
                        >
                            Connect New Account
                        </button>
                    </div>
                ) : (
                    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                        {accounts.map((account, index) => (
                            <div
                                key={account.id}
                                className="card interactive-card flex flex-col gap-4 p-6"
                                style={{ animationDelay: `${index * 0.06}s` }}
                            >
                                <div className="flex items-start justify-between">
                                    <div className="flex items-center gap-3">
                                        <div
                                            className={`flex h-11 w-11 items-center justify-center rounded-xl text-sm font-black text-white ${getBankColor(account.institutionName)}`}
                                        >
                                            {getBankInitials(account.institutionName)}
                                        </div>
                                        <div>
                                            <p className="text-sm font-bold text-slate-900 dark:text-white">
                                                {account.institutionName}
                                            </p>
                                            <p className="text-xs text-slate-500 dark:text-slate-400">
                                                {accountTypeLabels[account.accountType] ?? account.accountType} •{" "}
                                                ****{account.lastFourDigits}
                                            </p>
                                        </div>
                                    </div>
                                    <button
                                        type="button"
                                        onClick={() => handleDisconnect(account.id)}
                                        className="rounded-xl p-2 text-slate-400 transition hover:bg-rose-50 hover:text-rose-600 dark:hover:bg-rose-500/10 dark:hover:text-rose-400"
                                        title="Disconnect account"
                                    >
                                        <svg
                                            xmlns="http://www.w3.org/2000/svg"
                                            viewBox="0 0 24 24"
                                            fill="none"
                                            stroke="currentColor"
                                            strokeWidth="2"
                                            strokeLinecap="round"
                                            strokeLinejoin="round"
                                            className="h-4 w-4"
                                        >
                                            <path d="M18.36 6.64A9 9 0 1 1 5.64 6.64M12 2v10" />
                                        </svg>
                                    </button>
                                </div>

                                <div className="border-t border-slate-200/60 pt-4 dark:border-slate-700">
                                    <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-500 dark:text-slate-400">
                                        Current balance
                                    </p>
                                    <p className="mt-1 text-xl font-black text-slate-900 dark:text-white">
                                        {formatCurrency(account.balance)}
                                    </p>
                                    {account.accountName && (
                                        <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
                                            {account.accountName}
                                        </p>
                                    )}
                                </div>

                                <div className="flex items-center justify-between text-xs text-slate-500 dark:text-slate-400">
                                    <span className="flex items-center gap-1.5">
                                        <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse-glow" />
                                        <span className="font-medium">Active</span>
                                    </span>
                                    <span>
                                        {new Date(account.connectedAt).toLocaleDateString(undefined, {
                                            month: "short",
                                            day: "numeric",
                                            year: "numeric",
                                        })}
                                    </span>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}
