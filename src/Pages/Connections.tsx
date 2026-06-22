import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";

import { api, setApiAuthToken } from "../lib/api";
import type { ConnectionRequest, SharedTransaction } from "../types";

type Tab = "connected" | "requests" | "share" | "shared";

function Connections() {
    const navigate = useNavigate();
    const [activeTab, setActiveTab] = useState<Tab>("connected");
    const [errorMessage, setErrorMessage] = useState("");
    const [loading, setLoading] = useState(true);

    const [connectedUsers, setConnectedUsers] = useState<Array<{ id: string; username: string; email: string }>>([]);
    const [pendingRequests, setPendingRequests] = useState<ConnectionRequest[]>([]);
    const [sentRequests, setSentRequests] = useState<ConnectionRequest[]>([]);
    const [sharedTransactions, setSharedTransactions] = useState<SharedTransaction[]>([]);

    const [requestForm, setRequestForm] = useState({ usernameOrEmail: "" });
    const [sendingRequest, setSendingRequest] = useState(false);
    const [sharingTransactionId, setSharingTransactionId] = useState<number | null>(null);
    const [sharingWithUserId, setSharingWithUserId] = useState("");
    const [sharing, setSharing] = useState(false);

    const fetchData = async () => {
        try {
            const token = localStorage.getItem("token");
            if (!token) {
                navigate("/login");
                return;
            }
            setApiAuthToken(token);

            const [usersRes, pendingRes, sentRes, sharedRes] = await Promise.all([
                api.get("/api/connections/users"),
                api.get("/api/connections/pending"),
                api.get("/api/connections/sent"),
                api.get("/api/connections/shared-transactions")
            ]);

            setConnectedUsers(usersRes.data);
            setPendingRequests(pendingRes.data);
            setSentRequests(sentRes.data);
            setSharedTransactions(sharedRes.data);
            setErrorMessage("");
        } catch (error: unknown) {
            let message = "Failed to load connections";
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
        void fetchData();
    }, []);

    const handleSendRequest = async (e: React.FormEvent) => {
        e.preventDefault();
        setSendingRequest(true);
        setErrorMessage("");

        try {
            const token = localStorage.getItem("token");
            if (!token) {
                navigate("/login");
                return;
            }
            setApiAuthToken(token);

            await api.post("/api/connections/request", {
                usernameOrEmail: requestForm.usernameOrEmail
            });

            setRequestForm({ usernameOrEmail: "" });
        } catch (error: unknown) {
            let message = "Failed to send connection request";
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
            setSendingRequest(false);
        }
    };

    const handleAccept = async (requestId: number) => {
        try {
            const token = localStorage.getItem("token");
            if (!token) {
                navigate("/login");
                return;
            }
            setApiAuthToken(token);
            await api.post(`/api/connections/accept/${requestId}`);
            setPendingRequests((current) => current.filter((r) => r.id !== requestId));
        } catch (error: unknown) {
            let message = "Failed to accept request";
            if (axios.isAxiosError(error)) {
                message = error.response?.data?.message || error.response?.data || error.message || message;
            } else if (error instanceof Error) {
                message = error.message;
            }
            setErrorMessage(message);
        }
    };

    const handleReject = async (requestId: number) => {
        try {
            const token = localStorage.getItem("token");
            if (!token) {
                navigate("/login");
                return;
            }
            setApiAuthToken(token);
            await api.post(`/api/connections/reject/${requestId}`);
            setPendingRequests((current) => current.filter((r) => r.id !== requestId));
        } catch (error: unknown) {
            let message = "Failed to reject request";
            if (axios.isAxiosError(error)) {
                message = error.response?.data?.message || error.response?.data || error.message || message;
            } else if (error instanceof Error) {
                message = error.message;
            }
            setErrorMessage(message);
        }
    };

    const handleShare = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!sharingTransactionId || !sharingWithUserId) return;

        setSharing(true);
        setErrorMessage("");

        try {
            const token = localStorage.getItem("token");
            if (!token) {
                navigate("/login");
                return;
            }
            setApiAuthToken(token);

            await api.post("/api/connections/share-transaction", {
                transactionId: sharingTransactionId,
                sharedWithUserId: sharingWithUserId
            });

            setSharingTransactionId(null);
            setSharingWithUserId("");
        } catch (error: unknown) {
            let message = "Failed to share transaction";
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
            setSharing(false);
        }
    };

    const tabs: { key: Tab; label: string }[] = [
        { key: "connected", label: "Connected" },
        { key: "requests", label: "Requests" },
        { key: "share", label: "Share" },
        { key: "shared", label: "Shared" },
    ];

    return (
        <div className="min-h-screen px-4 py-6 sm:px-6 lg:px-8">
            <div className="mx-auto max-w-7xl space-y-6">
                <div>
                    <p className="text-xs font-semibold uppercase tracking-[0.3em] text-blue-600 dark:text-blue-400">
                        Social finance
                    </p>
                    <h1 className="mt-2 text-3xl font-black tracking-tight text-slate-900 dark:text-white">
                        Connections
                    </h1>
                    <p className="mt-2 text-sm leading-6 text-slate-500 dark:text-slate-400">
                        Connect with friends and family to share transactions and contribute to shared budgets.
                    </p>
                </div>

                {errorMessage && (
                    <div className="rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700 dark:border-rose-500/30 dark:bg-rose-500/10 dark:text-rose-200">
                        {errorMessage}
                    </div>
                )}

                <div className="flex gap-2 border-b border-slate-200 dark:border-slate-700">
                    {tabs.map((tab) => (
                        <button
                            key={tab.key}
                            onClick={() => setActiveTab(tab.key)}
                            className={`px-4 py-2 text-sm font-semibold transition ${
                                activeTab === tab.key
                                    ? "border-b-2 border-blue-600 text-blue-600 dark:text-blue-400"
                                    : "text-slate-500 hover:text-slate-700 dark:text-slate-400"
                            }`}
                        >
                            {tab.label}
                        </button>
                    ))}
                </div>

                {loading ? (
                    <div className="card flex items-center justify-center p-12">
                        <p className="text-sm text-slate-500 dark:text-slate-400">Loading connections...</p>
                    </div>
                ) : (
                    <div className="space-y-6">
                        {activeTab === "connected" && (
                            <div className="space-y-4">
                                <form onSubmit={handleSendRequest} className="card p-6 sm:p-8">
                                    <h2 className="text-xl font-bold text-slate-900 dark:text-white">
                                        Send a connection request
                                    </h2>
                                    <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
                                        Invite a friend by their username or email.
                                    </p>
                                    <div className="mt-4 flex flex-col gap-3 sm:flex-row">
                                        <input
                                            value={requestForm.usernameOrEmail}
                                            onChange={(e) => setRequestForm({ usernameOrEmail: e.target.value })}
                                            placeholder="Username or email"
                                            className="input-field"
                                            required
                                        />
                                        <button type="submit" className="btn-primary w-auto px-6 py-3 text-sm" disabled={sendingRequest}>
                                            {sendingRequest ? "Sending..." : "Send Request"}
                                        </button>
                                    </div>
                                </form>

                                <div className="card p-6 sm:p-8">
                                    <h2 className="text-xl font-bold text-slate-900 dark:text-white">
                                        Your connections
                                    </h2>
                                    {connectedUsers.length === 0 ? (
                                        <p className="mt-4 text-sm text-slate-500 dark:text-slate-400">
                                            No connections yet. Send a request to get started.
                                        </p>
                                    ) : (
                                        <div className="mt-4 space-y-3">
                                            {connectedUsers.map((user) => (
                                                <div key={user.id} className="flex items-center justify-between rounded-2xl border border-slate-200 bg-slate-50 p-4 dark:border-slate-700 dark:bg-slate-900/50">
                                                    <div>
                                                        <p className="text-sm font-bold text-slate-900 dark:text-white">
                                                            {user.username}
                                                        </p>
                                                        <p className="text-xs text-slate-500 dark:text-slate-400">
                                                            {user.email}
                                                        </p>
                                                    </div>
                                                    <span className="rounded-full bg-emerald-100 px-3 py-1 text-xs font-semibold text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-300">
                                                        Connected
                                                    </span>
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                </div>
                            </div>
                        )}

                        {activeTab === "requests" && (
                            <div className="grid gap-6 lg:grid-cols-2">
                                <div className="card p-6 sm:p-8">
                                    <h2 className="text-xl font-bold text-slate-900 dark:text-white">
                                        Pending requests
                                    </h2>
                                    {pendingRequests.length === 0 ? (
                                        <p className="mt-4 text-sm text-slate-500 dark:text-slate-400">
                                            No pending requests.
                                        </p>
                                    ) : (
                                        <div className="mt-4 space-y-3">
                                            {pendingRequests.map((req) => (
                                                <div key={req.id} className="flex items-center justify-between rounded-2xl border border-slate-200 bg-slate-50 p-4 dark:border-slate-700 dark:bg-slate-900/50">
                                                    <div>
                                                        <p className="text-sm font-bold text-slate-900 dark:text-white">
                                                            {req.requester?.username ?? "Unknown user"}
                                                        </p>
                                                        <p className="text-xs text-slate-500 dark:text-slate-400">
                                                            {new Date(req.createdAt).toLocaleDateString()}
                                                        </p>
                                                    </div>
                                                    <div className="flex gap-2">
                                                        <button
                                                            onClick={() => handleAccept(req.id)}
                                                            className="btn-primary w-auto px-4 py-2 text-xs"
                                                        >
                                                            Accept
                                                        </button>
                                                        <button
                                                            onClick={() => handleReject(req.id)}
                                                            className="btn-secondary w-auto px-4 py-2 text-xs"
                                                        >
                                                            Reject
                                                        </button>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                </div>

                                <div className="card p-6 sm:p-8">
                                    <h2 className="text-xl font-bold text-slate-900 dark:text-white">
                                        Sent requests
                                    </h2>
                                    {sentRequests.length === 0 ? (
                                        <p className="mt-4 text-sm text-slate-500 dark:text-slate-400">
                                            No sent requests.
                                        </p>
                                    ) : (
                                        <div className="mt-4 space-y-3">
                                            {sentRequests.map((req) => (
                                                <div key={req.id} className="rounded-2xl border border-slate-200 bg-slate-50 p-4 dark:border-slate-700 dark:bg-slate-900/50">
                                                    <p className="text-sm font-bold text-slate-900 dark:text-white">
                                                        {req.receiver?.username ?? "Unknown user"}
                                                    </p>
                                                    <p className="text-xs text-slate-500 dark:text-slate-400">
                                                        Sent on {new Date(req.createdAt).toLocaleDateString()} • {req.status}
                                                    </p>
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                </div>
                            </div>
                        )}

                        {activeTab === "share" && (
                            <form onSubmit={handleShare} className="card p-6 sm:p-8">
                                <h2 className="text-xl font-bold text-slate-900 dark:text-white">
                                    Share a transaction
                                </h2>
                                <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
                                    Share one of your transactions with a connected user.
                                </p>
                                <div className="mt-6 grid gap-4 sm:grid-cols-2">
                                    <div className="space-y-2">
                                        <label className="text-sm font-semibold text-slate-700 dark:text-slate-200">
                                            Transaction ID
                                        </label>
                                        <input
                                            type="number"
                                            value={sharingTransactionId ?? ""}
                                            onChange={(e) => setSharingTransactionId(e.target.value ? Number(e.target.value) : null)}
                                            placeholder=""
                                            className="input-field"
                                            required
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-sm font-semibold text-slate-700 dark:text-slate-200">
                                            Share with user ID
                                        </label>
                                        <input
                                            value={sharingWithUserId}
                                            onChange={(e) => setSharingWithUserId(e.target.value)}
                                            placeholder=""
                                            className="input-field"
                                            required
                                        />
                                    </div>
                                </div>
                                <div className="mt-6">
                                    <button type="submit" className="btn-primary" disabled={sharing}>
                                        {sharing ? "Sharing..." : "Share Transaction"}
                                    </button>
                                </div>
                            </form>
                        )}

                        {activeTab === "shared" && (
                            <div className="card p-6 sm:p-8">
                                <h2 className="text-xl font-bold text-slate-900 dark:text-white">
                                    Shared with you
                                </h2>
                                {sharedTransactions.length === 0 ? (
                                    <p className="mt-4 text-sm text-slate-500 dark:text-slate-400">
                                        No transactions have been shared with you yet.
                                    </p>
                                ) : (
                                    <div className="mt-4 space-y-3">
                                        {sharedTransactions.map((st) => (
                                            <div key={st.id} className="rounded-2xl border border-slate-200 bg-slate-50 p-4 dark:border-slate-700 dark:bg-slate-900/50">
                                                <div className="flex items-center justify-between">
                                                    <div>
                                                        <p className="text-sm font-bold text-slate-900 dark:text-white">
                                                            {st.description ?? "Shared transaction"}
                                                        </p>
                                                        <p className="text-xs text-slate-500 dark:text-slate-400">
                                                            {st.category} • {new Date(st.date).toLocaleDateString()}
                                                        </p>
                                                    </div>
                                                    <p className={`text-sm font-black ${st.type === "income" ? "text-emerald-600 dark:text-emerald-300" : "text-rose-600 dark:text-rose-300"}`}>
                                                        {st.type === "income" ? "+" : "-"}NGN {st.amount.toLocaleString()}
                                                    </p>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
}

export default Connections;
