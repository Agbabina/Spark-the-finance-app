import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";

import Input from "../Components/Input";
import TrophyAnimation from "../Components/TrophyAnimation";
import { api, setApiAuthToken } from "../lib/api";
import { useAppData } from "../contexts/AppDataContext";
import type { Goal } from "../types";

function formatCurrency(value: number) {
    return `NGN ${value.toLocaleString()}`;
}

function Goals() {
    const navigate = useNavigate();
    const { goals, setGoals, setGlobalError, username } = useAppData();
    const [loading, setLoading] = useState(false);
    const [errorMessage, setErrorMessage] = useState("");
    const [completedGoalTitle, setCompletedGoalTitle] = useState<string | null>(null);
    const [showTrophy, setShowTrophy] = useState(false);
    const [form, setForm] = useState({
        title: "",
        targetAmount: "",
        currentAmount: "",
        targetDate: ""
    });
    const prevGoalsRef = useRef<Goal[]>([]);

    useEffect(() => {
        const prevGoals = prevGoalsRef.current;
        for (const goal of goals) {
            const prevGoal = prevGoals.find(g => g.id === goal.id);
            if (prevGoal && prevGoal.currentAmount < prevGoal.targetAmount && goal.currentAmount >= goal.targetAmount) {
                setCompletedGoalTitle(goal.title);
                setShowTrophy(true);
                break;
            }
        }
        prevGoalsRef.current = goals;
    }, [goals]);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setForm((current) => ({ ...current, [name]: value }));
    };

    const totalTarget = goals.reduce((sum, goal) => sum + goal.targetAmount, 0);
    const totalSaved = goals.reduce((sum, goal) => sum + goal.currentAmount, 0);
    const totalRemaining = totalTarget - totalSaved;

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

            const response = await api.post("/api/goals", {
                title: form.title,
                targetAmount: Number(form.targetAmount),
                currentAmount: Number(form.currentAmount || 0),
                targetDate: form.targetDate ? new Date(form.targetDate + "T00:00:00").toISOString() : null
            });

            setGoals((current) => [...current, response.data]);
            setForm({
                title: "",
                targetAmount: "",
                currentAmount: "",
                targetDate: ""
            });
        } catch (error: unknown) {
            const message = axios.isAxiosError(error)
                ? error.response?.data?.message ||
                  error.response?.data ||
                  error.message ||
                  "Failed to save goal"
                : error instanceof Error
                    ? error.message
                    : "Failed to save goal";

            const displayMessage = typeof message === "string" ? message : "Failed to save goal";
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

            await api.delete(`/api/goals/${id}`);
            setGoals((current) => current.filter((goal) => goal.id !== id));
        } catch (error: unknown) {
            const message = axios.isAxiosError(error)
                ? error.response?.data?.message ||
                  error.response?.data ||
                  error.message ||
                  "Failed to delete goal"
                : error instanceof Error
                    ? error.message
                    : "Failed to delete goal";

            const displayMessage = typeof message === "string" ? message : "Failed to delete goal";
            setErrorMessage(displayMessage);
            setGlobalError(displayMessage);
        }
    };

    const handleProgressChange = async (goal: Goal, nextAmount: number) => {
        try {
            const token = localStorage.getItem("token");
            if (token) {
                setApiAuthToken(token);
            }

            const wasCompleted = goal.currentAmount < goal.targetAmount && nextAmount >= goal.targetAmount;
            const response = await api.put(`/api/goals/${goal.id}`, {
                ...goal,
                currentAmount: Math.max(0, nextAmount)
            });

            setGoals((current) => current.map((item) => (item.id === goal.id ? response.data : item)));
            
            if (wasCompleted) {
                setCompletedGoalTitle(goal.title);
                setShowTrophy(true);
            }
        } catch (error: unknown) {
            const message = axios.isAxiosError(error)
                ? error.response?.data?.message ||
                  error.response?.data ||
                  error.message ||
                  "Failed to update goal"
                : error instanceof Error
                    ? error.message
                    : "Failed to update goal";

            const displayMessage = typeof message === "string" ? message : "Failed to update goal";
            setErrorMessage(displayMessage);
            setGlobalError(displayMessage);
        }
    };

    return (
        <div className="min-h-screen px-4 py-6 sm:px-6 lg:px-8 page-enter">
            {showTrophy && completedGoalTitle && (
                <div className="fixed inset-0 z-50">
                    <TrophyAnimation 
                        isOpen={showTrophy} 
                        goalTitle={completedGoalTitle} 
                        onClose={() => setShowTrophy(false)} 
                    />
                </div>
            )}
            <div className="mx-auto grid max-w-7xl gap-6 xl:grid-cols-[360px_1fr]">
                <form onSubmit={handleSubmit} className="card p-6 sm:p-8">
                    <p className="text-xs font-semibold uppercase tracking-[0.3em] text-blue-600 dark:text-blue-400">
                        Future plan
                    </p>
                    <h1 className="mt-2 text-3xl font-black tracking-tight text-slate-900 dark:text-white">
                        Goals
                    </h1>
                    <p className="mt-2 text-sm leading-6 text-slate-500 dark:text-slate-400">
                        {username ? `Hi ${username}, define what you want to save toward.` : "Define what you want to save toward."}
                    </p>

                    <div className="mt-6 space-y-4">
                        {errorMessage && (
                            <div className="rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700 dark:border-rose-500/30 dark:bg-rose-500/10 dark:text-rose-200">
                                {errorMessage}
                            </div>
                        )}

                        <Input
                            name="title"
                            placeholder="e.g. Emergency fund"
                            onChange={handleChange}
                            value={form.title}
                            label="Goal title"
                            required
                        />

                        <Input
                            name="targetAmount"
                            type="number"
                            min="0.01"
                            step="0.01"
                            placeholder="0.00"
                            onChange={handleChange}
                            value={form.targetAmount}
                            label="Target amount"
                            required
                        />

                        <Input
                            name="currentAmount"
                            type="number"
                            min="0"
                            step="0.01"
                            placeholder="0.00"
                            onChange={handleChange}
                            value={form.currentAmount}
                            label="Already saved"
                        />

                        <Input
                            name="targetDate"
                            type="date"
                            onChange={handleChange}
                            value={form.targetDate}
                            label="Target date"
                        />

                        <div className="flex flex-col gap-3 sm:flex-row">
                            <button className="btn-primary" disabled={loading}>
                                {loading ? "Saving..." : "Save Goal"}
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
                        <div className="card p-6 transition-all duration-300 hover:shadow-lg hover:-translate-y-0.5" style={{ animationDelay: '0.05s' }}>
                            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-blue-600 dark:text-blue-400">
                                Target
                            </p>
                            <p className="mt-2 text-2xl font-black text-slate-900 dark:text-white">
                                {formatCurrency(totalTarget)}
                            </p>
                        </div>
                        <div className="card p-6 transition-all duration-300 hover:shadow-lg hover:-translate-y-0.5" style={{ animationDelay: '0.1s' }}>
                            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-emerald-600 dark:text-emerald-300">
                                Saved
                            </p>
                            <p className="mt-2 text-2xl font-black text-slate-900 dark:text-white">
                                {formatCurrency(totalSaved)}
                            </p>
                        </div>
                        <div className="card p-6 transition-all duration-300 hover:shadow-lg hover:-translate-y-0.5" style={{ animationDelay: '0.15s' }}>
                            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-rose-600 dark:text-rose-300">
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
                                Goal progress
                            </h2>
                            <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
                                Track every goal and update the amount you have already saved.
                            </p>
                        </div>

                        {goals.length === 0 ? (
                            <div className="rounded-[1.75rem] border border-dashed border-slate-300 bg-slate-50 px-6 py-14 text-center transition-all duration-300 hover:border-amber-300 dark:border-slate-700 dark:bg-slate-900/40 dark:hover:border-amber-500/30">
                                <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-amber-50 text-2xl font-black text-amber-600 dark:bg-amber-500/10 dark:text-amber-400 animate-float">
                                    🎯
                                </div>
                                <p className="text-lg font-semibold text-slate-900 dark:text-white">
                                    No goals yet
                                </p>
                                <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">
                                    Add a goal to start tracking your progress toward something bigger.
                                </p>
                            </div>
                        ) : (
                            <div className="space-y-4">
                                {goals.map((goal) => {
                                    const progress = goal.targetAmount > 0 ? Math.min(100, (goal.currentAmount / goal.targetAmount) * 100) : 0;
                                    const remaining = goal.targetAmount - goal.currentAmount;

                                    return (
                                        <div key={goal.id} className="rounded-3xl border border-slate-200/70 bg-slate-50 p-5 transition-all duration-300 hover:shadow-md hover:-translate-y-0.5 dark:border-slate-700 dark:bg-slate-900/50">
                                            <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                                                <div>
                                                    <p className="text-sm font-semibold text-slate-900 dark:text-white">
                                                        {goal.title}
                                                    </p>
                                                    <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
                                                        Target {formatCurrency(goal.targetAmount)}
                                                        {goal.targetDate ? ` • ${new Date(goal.targetDate).toLocaleDateString()}` : ""}
                                                    </p>
                                                </div>

                                                <button
                                                    type="button"
                                                    onClick={() => handleDelete(goal.id)}
                                                    className="btn-secondary w-auto px-3 py-2 text-sm"
                                                >
                                                    Delete
                                                </button>
                                            </div>

                                            <div className="mt-4">
                                                <div className="mb-2 flex items-center justify-between text-sm">
                                                    <span className="text-slate-500 dark:text-slate-400">
                                                        Saved {formatCurrency(goal.currentAmount)}
                                                    </span>
                                                    <span className={remaining >= 0 ? "text-emerald-600 dark:text-emerald-300" : "text-rose-600 dark:text-rose-300"}>
                                                        {remaining >= 0 ? `Remaining ${formatCurrency(remaining)}` : `Over by ${formatCurrency(Math.abs(remaining))}`}
                                                    </span>
                                                </div>
                                                <div className="h-3 overflow-hidden rounded-full bg-slate-200 dark:bg-slate-800">
                                                    <div
                                                        className={`h-full rounded-full progress-bar ${remaining >= 0 ? "bg-blue-500" : "bg-rose-500"} ${remaining < 0 ? "progress-striped" : ""}`}
                                                        style={{ width: `${Math.min(progress, 100)}%` }}
                                                    />
                                                </div>
                                            </div>

                                            <div className="mt-4 flex flex-wrap gap-2">
                                                <button
                                                    type="button"
                                                    onClick={() => handleProgressChange(goal, goal.currentAmount + 5000)}
                                                    className="btn-secondary w-auto px-3 py-2 text-sm"
                                                >
                                                    + NGN 5,000
                                                </button>
                                                <button
                                                    type="button"
                                                    onClick={() => handleProgressChange(goal, goal.currentAmount + 10000)}
                                                    className="btn-secondary w-auto px-3 py-2 text-sm"
                                                >
                                                    + NGN 10,000
                                                </button>
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        )}
                    </div>
                </section>
            </div>
        </div>
    );
}

export default Goals;
