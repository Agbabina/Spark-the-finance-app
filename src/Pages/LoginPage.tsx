import { useState, useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import axios from "axios";

import Input from "../Components/Input";
import { api, setApiAuthToken } from "../lib/api";

interface Props {
    setIsLoggedIn: React.Dispatch<React.SetStateAction<boolean>>;
    setUsername: React.Dispatch<React.SetStateAction<string>>;
}

function LoginPage({ setIsLoggedIn, setUsername }: Props) {
    const navigate = useNavigate();
    const [searchParams] = useSearchParams();
    const [isRegister, setIsRegister] = useState(false);
    const [form, setForm] = useState({
        username: "",
        email: "",
        password: ""
    });
    const [errorMessage, setErrorMessage] = useState("");
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        const token = searchParams.get("token");
        if (token) {
            try {
                const payload = JSON.parse(atob(token.split(".")[1].replace(/-/g, "+").replace(/_/g, "/")));
                const username = payload.username || payload.sub || "User";
                localStorage.setItem("token", token);
                localStorage.setItem("username", username);
                setApiAuthToken(token);
                setUsername(username);
                setIsLoggedIn(true);
                navigate("/", { replace: true });
            } catch {
                setErrorMessage("Invalid login token");
            }
        }
    }, [searchParams, navigate, setIsLoggedIn, setUsername]);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setForm({ ...form, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setErrorMessage("");
        setLoading(true);

        try {
            if (isRegister) {
                await api.post("/api/auth/register", form);
                setIsRegister(false);
                setForm({ username: "", email: "", password: "" });
            } else {
                const loginData = { username: form.username, password: form.password };
                const response = await api.post("/api/auth/login", loginData);
                localStorage.setItem("token", response.data.token);
                localStorage.setItem("username", form.username);
                setApiAuthToken(response.data.token);
                setUsername(form.username);
                setIsLoggedIn(true);
                navigate("/", { replace: true });
            }
        } catch (error: unknown) {
            const message = axios.isAxiosError(error)
                ? error.response?.data?.message ||
                  error.response?.data?.errors?.[0] ||
                  "An error occurred"
                : "An error occurred";
            setErrorMessage(message);
        } finally {
            setLoading(false);
        }
    };

    const handleGoogleLogin = () => {
        window.location.href = "/api/auth/google";
    };

    const title = isRegister ? "Create your account" : "Welcome back";
    const subtitle = isRegister
        ? "Set up your workspace and start tracking money in minutes."
        : "Sign in to continue where you left off.";

    return (
        <div className="min-h-screen px-4 py-6 sm:px-6 lg:px-8">
            <div className="mx-auto grid min-h-[calc(100vh-3rem)] max-w-6xl items-center gap-8 lg:grid-cols-[1.1fr_0.9fr]">
                <section
                    className="relative overflow-hidden rounded-4xl p-8 text-white shadow-2xl sm:p-10"
                    style={{
                        background:
                            "linear-gradient(135deg, rgba(15,23,42,0.98) 0%, rgba(37,99,235,0.92) 55%, rgba(124,58,237,0.92) 100%)"
                    }}
                >
                    <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(255,255,255,0.2),transparent_28%)]" />
                    <div className="absolute -right-20 top-8 h-40 w-40 rounded-full bg-white/10 blur-3xl" />
                    <div className="absolute -bottom-12 left-4 h-32 w-32 rounded-full bg-cyan-300/20 blur-3xl" />

                    <div className="relative z-10 max-w-xl">
                        <p className="text-sm font-semibold uppercase tracking-[0.35em] text-blue-100/80">
                            Spark Finance
                        </p>
                        <h1 className="mt-6 text-4xl font-black tracking-tight sm:text-5xl">
                            Track money with a calmer, sharper dashboard.
                        </h1>
                        <p className="mt-4 max-w-lg text-sm leading-7 text-blue-50/90 sm:text-base">
                            Capture income, watch spending, and read your finances at a glance without visual noise.
                        </p>

                        <div className="mt-10 grid gap-4 sm:grid-cols-3">
                            <div className="rounded-2xl border border-white/15 bg-white/10 p-4 backdrop-blur">
                                <p className="text-xs uppercase tracking-[0.2em] text-blue-100/70">Fast entry</p>
                                <p className="mt-2 text-sm font-semibold">Log transactions in seconds.</p>
                            </div>
                            <div className="rounded-2xl border border-white/15 bg-white/10 p-4 backdrop-blur">
                                <p className="text-xs uppercase tracking-[0.2em] text-blue-100/70">Clear insight</p>
                                <p className="mt-2 text-sm font-semibold">See income and expenses together.</p>
                            </div>
                            <div className="rounded-2xl border border-white/15 bg-white/10 p-4 backdrop-blur">
                                <p className="text-xs uppercase tracking-[0.2em] text-blue-100/70">Secure access</p>
                                <p className="mt-2 text-sm font-semibold">Your JWT session stays protected.</p>
                            </div>
                        </div>
                    </div>
                </section>

                <section className="surface rounded-4xl p-6 sm:p-8">
                    <div className="flex items-start justify-between gap-4">
                        <div>
                            <p className="text-xs font-semibold uppercase tracking-[0.3em] text-blue-600 dark:text-blue-400">
                                Access
                            </p>
                            <h2 className="mt-2 text-2xl font-bold text-slate-900 dark:text-white">
                                {title}
                            </h2>
                            <p className="mt-2 text-sm leading-6 text-slate-500 dark:text-slate-400">
                                {subtitle}
                            </p>
                        </div>

                        <button
                            type="button"
                            onClick={() => setIsRegister(!isRegister)}
                            className="btn-secondary w-auto shrink-0 px-4 py-2 text-sm"
                        >
                            {isRegister ? "Login" : "Register"}
                        </button>
                    </div>

                    {errorMessage && (
                        <div className="mt-6 rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700 dark:border-rose-500/30 dark:bg-rose-500/10 dark:text-rose-200">
                            {errorMessage}
                        </div>
                    )}

                    <form onSubmit={handleSubmit} className="mt-6 space-y-4">
                        <Input
                            name="username"
                            placeholder="Enter your username"
                            onChange={handleChange}
                            value={form.username}
                            label="Username"
                            required
                        />

                        {isRegister && (
                            <Input
                                name="email"
                                type="email"
                                placeholder="name@example.com"
                                onChange={handleChange}
                                value={form.email}
                                label="Email"
                                required
                            />
                        )}

                        <Input
                            name="password"
                            type="password"
                            placeholder="••••••••"
                            onChange={handleChange}
                            value={form.password}
                            label="Password"
                            required
                        />

                        <button className="btn-primary" disabled={loading}>
                            {loading ? "Please wait..." : isRegister ? "Create account" : "Login"}
                        </button>
                    </form>

                    <div className="my-6 flex items-center gap-4">
                        <div className="h-px flex-1 bg-slate-200 dark:bg-slate-700" />
                        <span className="text-xs font-semibold uppercase tracking-widest text-slate-400">or</span>
                        <div className="h-px flex-1 bg-slate-200 dark:bg-slate-700" />
                    </div>

                    <button
                        type="button"
                        onClick={handleGoogleLogin}
                        className="flex w-full items-center justify-center gap-3 rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm font-semibold text-slate-700 transition hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200 dark:hover:bg-slate-800"
                    >
                        <svg viewBox="0 0 24 24" className="h-5 w-5" aria-hidden="true">
                            <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z" />
                            <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                            <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
                            <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
                        </svg>
                        Continue with Google
                    </button>

                    <button
                        type="button"
                        onClick={() => {
                            setIsRegister(!isRegister);
                            setErrorMessage("");
                        }}
                        className="mt-4 w-full text-sm font-semibold text-blue-600 transition-colors hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300"
                    >
                        {isRegister ? "Already have an account? Login" : "Need an account? Register"}
                    </button>
                </section>
            </div>
        </div>
    );
}

export default LoginPage;
