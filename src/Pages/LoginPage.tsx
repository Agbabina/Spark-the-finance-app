import { useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";

import Input from "../Components/Input";
import { api, setApiAuthToken } from "../lib/api";

interface Props {
    setIsLoggedIn: React.Dispatch<React.SetStateAction<boolean>>;
    setUsername: React.Dispatch<React.SetStateAction<string>>;
}

function LoginPage({ setIsLoggedIn, setUsername }: Props) {
    const navigate = useNavigate();
    const [isRegister, setIsRegister] = useState(false);
    const [form, setForm] = useState({
        username: "",
        email: "",
        password: ""
    });
    const [errorMessage, setErrorMessage] = useState("");
    const [loading, setLoading] = useState(false);

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

    const title = isRegister ? "Create your account" : "Welcome back";
    const subtitle = isRegister
        ? "Set up your workspace and start tracking money in minutes."
        : "Sign in to continue where you left off.";

    return (
        <div className="min-h-screen px-4 py-6 sm:px-6 lg:px-8">
            <div className="mx-auto grid min-h-[calc(100vh-3rem)] max-w-6xl items-center gap-8 lg:grid-cols-[1.1fr_0.9fr]">
                <section
                    className="relative overflow-hidden rounded-[2rem] p-8 text-white shadow-2xl sm:p-10"
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

                <section className="surface rounded-[2rem] p-6 sm:p-8">
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
