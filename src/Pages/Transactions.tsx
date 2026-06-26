import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { LuShare2 } from "react-icons/lu";
import axios from "axios";

import { api, setApiAuthToken } from "../lib/api";
import { useAppData } from "../contexts/AppDataContext";

type ShareState = {
    transactionId: number;
    connectedUsers: Array<{ id: string; username: string }>;
    selectedUserId: string;
    saving: boolean;
    error: string;
    success: boolean;
};

function Transactions() {
    const navigate = useNavigate();
    const { transactions, username } = useAppData();
    const [openShareId, setOpenShareId] = useState<number | null>(null);
    const [shareState, setShareState] = useState<ShareState | null>(null);

    const totalIncome = transactions
        .filter(t => t.type === "income")
        .reduce((sum, t) => sum + t.amount, 0);

    const totalExpenses = transactions
        .filter(t => t.type === "expense")
        .reduce((sum, t) => sum + t.amount, 0);

    const balance = totalIncome - totalExpenses;

    const openShare = async (transactionId: number) => {
        setOpenShareId(transactionId);
        setShareState(null);

        try {
            const token = localStorage.getItem("token");
            if (!token) {
                navigate("/login");
                return;
            }
            setApiAuthToken(token);

            const response = await api.get("/api/connections/users");
            setShareState({
                transactionId,
                connectedUsers: response.data,
                selectedUserId: "",
                saving: false,
                error: "",
                success: false,
            });
        } catch (error: unknown) {
            let message = "Failed to load connections";
            if (axios.isAxiosError(error)) {
                message = error.response?.data?.message || error.response?.data || error.message || message;
            } else if (error instanceof Error) {
                message = error.message;
            }
            setShareState({
                transactionId,
                connectedUsers: [],
                selectedUserId: "",
                saving: false,
                error: message,
                success: false,
            });
        }
    };

    const closeShare = () => {
        setOpenShareId(null);
        setShareState(null);
    };

    const handleShareSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!shareState || !shareState.selectedUserId) return;

        setShareState((current) => current ? { ...current, saving: true, error: "" } : null);

        try {
            const token = localStorage.getItem("token");
            if (!token) {
                navigate("/login");
                return;
            }
            setApiAuthToken(token);

            await api.post("/api/connections/share-transaction", {
                transactionId: shareState.transactionId,
                sharedWithUserId: shareState.selectedUserId,
            });

            setShareState((current) => current ? { ...current, saving: false, success: true, error: "" } : null);
            setTimeout(closeShare, 600);
        } catch (error: unknown) {
            let message = "Failed to share transaction";
            if (axios.isAxiosError(error)) {
                message = error.response?.data?.message || error.response?.data || error.message || message;
                if (axios.isAxiosError(error) && error.response?.status === 401) {
                    localStorage.removeItem("token");
                    setApiAuthToken(null);
                    navigate("/login");
                    return;
                }
            } else if (error instanceof Error) {
                message = error.message;
            }
            setShareState((current) => current ? { ...current, saving: false, error: message, success: false } : null);
        }
    };

    return (
        <div className="min-h-screen px-4 py-6 sm:px-6 lg:px-8 page-enter">
            <div className="mx-auto max-w-6xl space-y-6">
                <section className="card overflow-hidden p-6 sm:p-8">
                    <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                        <div>
                            <p className="text-xs font-semibold uppercase tracking-[0.3em] text-blue-600 dark:text-blue-400">
                                Ledger
                            </p>
                            <h1 className="mt-2 text-3xl font-black tracking-tight text-slate-900 dark:text-white">
                                {username ? `Hey ${username},` : "Transactions"}
                            </h1>
                            <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-500 dark:text-slate-400">
                                Review everything you have logged so far, check balances, and jump back into adding new entries.
                            </p>
                        </div>

                        <button
                            onClick={() => navigate("/add")}
                            className="btn-primary w-auto px-5 py-3 text-sm"
                        >
                            + Add Transaction
                        </button>
                    </div>

                    <div className="mt-6 grid gap-4 sm:grid-cols-3">
                        <div className="rounded-3xl border border-blue-200/70 bg-blue-50 p-5 dark:border-blue-500/20 dark:bg-blue-500/10">
                            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-blue-600 dark:text-blue-300">
                                Balance
                            </p>
                            <p className={`mt-2 text-2xl font-black ${balance >= 0 ? "text-emerald-600" : "text-rose-600"} dark:${balance >= 0 ? "text-emerald-300" : "text-rose-300"}`}>
                                NGN {Math.abs(balance).toLocaleString()}
                            </p>
                        </div>

                        <div className="rounded-3xl border border-emerald-200/70 bg-emerald-50 p-5 dark:border-emerald-500/20 dark:bg-emerald-500/10">
                            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-emerald-600 dark:text-emerald-300">
                                Income
                            </p>
                            <p className="mt-2 text-2xl font-black text-emerald-600 dark:text-emerald-300">
                                NGN {totalIncome.toLocaleString()}
                            </p>
                        </div>

                        <div className="rounded-3xl border border-rose-200/70 bg-rose-50 p-5 dark:border-rose-500/20 dark:bg-rose-500/10">
                            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-rose-600 dark:text-rose-300">
                                Expenses
                            </p>
                            <p className="mt-2 text-2xl font-black text-rose-600 dark:text-rose-300">
                                NGN {totalExpenses.toLocaleString()}
                            </p>
                        </div>
                    </div>
                </section>

                <section className="card p-4 sm:p-6">
                    {transactions.length === 0 ? (
                        <div className="flex flex-col items-center justify-center rounded-[1.75rem] border border-dashed border-slate-300 bg-slate-50 px-6 py-16 text-center dark:border-slate-700 dark:bg-slate-900/40">
                            <div className="rounded-full bg-blue-100 px-4 py-2 text-sm font-semibold text-blue-700 dark:bg-blue-500/10 dark:text-blue-300 animate-pulse-glow">
                                Nothing here yet
                            </div>
                            <h2 className="mt-4 text-2xl font-bold text-slate-900 dark:text-white">
                                Start with your first transaction
                            </h2>
                            <p className="mt-2 max-w-md text-sm leading-6 text-slate-500 dark:text-slate-400">
                                Add an expense or income entry to bring this view to life and make the dashboard more useful.
                            </p>
                            <button
                                onClick={() => navigate("/add")}
                                className="btn-primary mt-6 w-auto px-5 py-3 text-sm"
                            >
                                Add a transaction
                            </button>
                        </div>
                    ) : (
                        <div className="overflow-hidden rounded-[1.75rem] border border-slate-200/70 dark:border-slate-700">
                            <div className="hidden grid-cols-[1.5fr_0.8fr_0.8fr_0.7fr_auto] gap-4 border-b border-slate-200 bg-slate-50 px-5 py-3 text-xs font-semibold uppercase tracking-[0.2em] text-slate-500 dark:border-slate-700 dark:bg-slate-900/60 dark:text-slate-400 md:grid">
                                <span>Title</span>
                                <span>Category</span>
                                <span>Date</span>
                                <span className="text-right">Amount</span>
                                <span className="text-right">Share</span>
                            </div>

                            <div className="divide-y divide-slate-200 dark:divide-slate-700">
                                {transactions.map((t) => (
                                    <div
                                        key={t.id}
                                        className="grid gap-3 px-5 py-4 transition-colors hover:bg-slate-50 dark:hover:bg-slate-900/40 md:grid-cols-[1.5fr_0.8fr_0.8fr_0.7fr_auto] md:items-center"
                                    >
                                        <div className="flex items-center gap-3">
                                            <div className={`flex h-11 w-11 items-center justify-center rounded-2xl font-bold ${t.type === "income" ? "bg-emerald-100 text-emerald-600 dark:bg-emerald-500/10 dark:text-emerald-300" : "bg-rose-100 text-rose-600 dark:bg-rose-500/10 dark:text-rose-300"}`}>
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

                                        <div className="text-sm text-slate-500 dark:text-slate-400">
                                            {t.category || "No category"}
                                        </div>

                                        <div className="text-sm text-slate-500 dark:text-slate-400">
                                            {t.date}
                                        </div>

                                        <div className={`text-right text-base font-bold ${t.type === "income" ? "text-emerald-600 dark:text-emerald-300" : "text-rose-600 dark:text-rose-300"}`}>
                                            {t.type === "income" ? "+" : "-"}NGN {t.amount.toLocaleString()}
                                        </div>

                                        <div className="text-right">
                                            <button
                                                type="button"
                                                onClick={() => openShare(t.id)}
                                                className="rounded-xl p-2 text-slate-400 transition hover:bg-blue-50 hover:text-blue-600 dark:hover:bg-blue-500/10 dark:hover:text-blue-400"
                                                title="Share transaction"
                                            >
                                                <LuShare2 className="text-lg" />
                                            </button>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}
                </section>
            </div>

            {openShareId !== null && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4 animate-fade-in" onClick={closeShare}>
                    <div className="card w-full max-w-md p-6 sm:p-8 animate-scale-in" onClick={(e) => e.stopPropagation()}>
                        <h3 className="text-lg font-bold text-slate-900 dark:text-white">
                            Share transaction
                        </h3>
                        <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
                            Choose a connected user to share this transaction with.
                        </p>

                        {shareState?.error && (
                            <div className="mt-4 rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700 dark:border-rose-500/30 dark:bg-rose-500/10 dark:text-rose-200 animate-slide-up">
                                {shareState.error}
                            </div>
                        )}

                        {shareState?.success && (
                            <div className="mt-4 rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-700 dark:border-emerald-500/30 dark:bg-emerald-500/10 dark:text-emerald-200 animate-scale-in">
                                Shared successfully
                            </div>
                        )}

                        {shareState && shareState.connectedUsers.length === 0 && !shareState.error ? (
                            <p className="mt-4 text-sm text-slate-500 dark:text-slate-400">
                                No connected users yet. Go to Connections to send a request first.
                            </p>
                        ) : (
                            <form onSubmit={handleShareSubmit} className="mt-6 space-y-4">
                                <div className="space-y-2">
                                    <label className="text-sm font-semibold text-slate-700 dark:text-slate-200">
                                        Share with
                                    </label>
                                    <select
                                        value={shareState?.selectedUserId ?? ""}
                                        onChange={(e) => setShareState((current) => current ? { ...current, selectedUserId: e.target.value } : null)}
                                        className="input-field"
                                        required
                                    >
                                        <option value="">Select a user</option>
                                        {shareState?.connectedUsers.map((user) => (
                                            <option key={user.id} value={user.id}>
                                                {user.username}
                                            </option>
                                        ))}
                                    </select>
                                </div>

                                <div className="flex gap-3">
                                    <button type="submit" className="btn-primary" disabled={shareState?.saving}>
                                        {shareState?.saving ? "Sharing..." : "Share"}
                                    </button>
                                    <button type="button" onClick={closeShare} className="btn-secondary">
                                        Cancel
                                    </button>
                                </div>
                            </form>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
}

export default Transactions;
