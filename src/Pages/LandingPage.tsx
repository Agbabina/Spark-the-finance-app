import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { LuBarChart3, LuWallet, LuSparkles, LuLock, LuCreditCard, LuTrendingUp } from "react-icons/lu";

function LandingPage() {
    const navigate = useNavigate();

    useEffect(() => {
        const token = localStorage.getItem("token");
        if (token) {
            navigate("/", { replace: true });
        }
    }, [navigate]);

    const features = [
        {
            icon: LuWallet,
            title: "Track every naira",
            description: "Log income and expenses in seconds with clean, distraction-free forms."
        },
        {
            icon: LuBarChart3,
            title: "Budgets that breathe",
            description: "Set monthly caps per category and see progress bars update in real time."
        },
        {
            icon: LuSparkles,
            title: "AI coach built in",
            description: "Get offline forecasts, savings tips, and smart alerts without third-party logins."
        },
        {
            icon: LuCreditCard,
            title: "Connect accounts",
            description: "Link bank accounts and share transactions with trusted contacts."
        },
        {
            icon: LuLock,
            title: "Private by default",
            description: "JWT-based sessions keep your data locked to your device until you choose to share."
        },
        {
            icon: LuTrendingUp,
            title: "Goals with momentum",
            description: "Set targets, track progress, and celebrate milestones as you reach them."
        }
    ];

    return (
        <div className="min-h-screen bg-slate-950 text-white">
            <nav className="fixed top-0 z-50 w-full border-b border-white/10 bg-slate-950/80 backdrop-blur-xl">
                <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-4 sm:px-6 lg:px-8">
                    <div className="flex items-center gap-2">
                        <span className="text-xl font-black tracking-tight text-white">Spark</span>
                        <span className="rounded-full bg-blue-600 px-2 py-0.5 text-xs font-bold text-white">Finance</span>
                    </div>
                    <button
                        onClick={() => navigate("/login")}
                        className="btn-primary w-auto px-5 py-2.5 text-sm"
                    >
                        Sign in
                    </button>
                </div>
            </nav>

            <section className="relative overflow-hidden pt-32 pb-20 sm:pt-40 sm:pb-28">
                <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(59,130,246,0.25),transparent_32%)]" />
                <div className="absolute -left-24 top-20 h-64 w-64 rounded-full bg-blue-500/20 blur-3xl" />
                <div className="absolute -right-16 bottom-10 h-72 w-72 rounded-full bg-violet-500/20 blur-3xl" />

                <div className="mx-auto max-w-5xl px-4 text-center sm:px-6 lg:px-8">
                    <p className="text-sm font-semibold uppercase tracking-[0.35em] text-blue-400">
                        Personal finance, reimagined
                    </p>
                    <h1 className="mt-6 text-4xl font-black tracking-tight sm:text-5xl lg:text-6xl">
                        Track money with a{" "}
                        <span className="bg-linear-to-r from-blue-400 to-violet-400 bg-clip-text text-transparent">
                            calmer, sharper
                        </span>{" "}
                        dashboard.
                    </h1>
                    <p className="mx-auto mt-6 max-w-2xl text-base leading-7 text-slate-300 sm:text-lg">
                        Capture income, watch spending, and read your finances at a glance — no noise, no clutter, just clarity.
                    </p>
                    <div className="mt-10 flex flex-col items-center justify-center gap-4 sm:flex-row">
                        <button
                            onClick={() => navigate("/login")}
                            className="btn-primary w-auto px-8 py-3.5 text-base"
                        >
                            Get started free
                        </button>
                        <button
                            onClick={() => navigate("/login")}
                            className="btn-secondary w-auto px-8 py-3.5 text-base"
                        >
                            View demo
                        </button>
                    </div>
                </div>
            </section>

            <section className="border-y border-white/10 bg-slate-900/50 py-20">
                <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
                    <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                        {features.map((feature) => (
                            <div
                                key={feature.title}
                                className="group rounded-3xl border border-white/10 bg-slate-900/80 p-6 transition hover:border-blue-500/40 hover:bg-slate-900"
                            >
                                <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-blue-500/10 text-blue-400">
                                    <feature.icon className="text-xl" />
                                </div>
                                <h3 className="mt-4 text-lg font-bold text-white">
                                    {feature.title}
                                </h3>
                                <p className="mt-2 text-sm leading-6 text-slate-400">
                                    {feature.description}
                                </p>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            <section className="py-20">
                <div className="mx-auto max-w-4xl px-4 text-center sm:px-6 lg:px-8">
                    <h2 className="text-3xl font-black tracking-tight sm:text-4xl">
                        Built for people who hate visual noise.
                    </h2>
                    <p className="mx-auto mt-4 max-w-2xl text-base leading-7 text-slate-300">
                        Most finance apps feel like a spreadsheet dressed in neon. Spark keeps the interface calm so you can focus on what matters: your money.
                    </p>
                </div>
            </section>

            <section className="border-t border-white/10 bg-slate-900/50 py-16">
                <div className="mx-auto max-w-4xl px-4 text-center sm:px-6 lg:px-8">
                    <h2 className="text-3xl font-black tracking-tight sm:text-4xl">
                        Ready to take control?
                    </h2>
                    <p className="mx-auto mt-4 max-w-2xl text-base leading-7 text-slate-300">
                        Join thousands who have already simplified their finances with Spark.
                    </p>
                    <button
                        onClick={() => navigate("/login")}
                        className="btn-primary mt-8 w-auto px-10 py-4 text-base"
                    >
                        Start tracking now
                    </button>
                </div>
            </section>

            <footer className="border-t border-white/10 py-10">
                <div className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-4 px-4 sm:flex-row sm:px-6 lg:px-8">
                    <p className="text-sm text-slate-500">
                        Spark Finance. All rights reserved.
                    </p>
                    <div className="flex gap-6 text-sm text-slate-500">
                        <span>Privacy</span>
                        <span>Terms</span>
                        <span>Contact</span>
                    </div>
                </div>
            </footer>
        </div>
    );
}

export default LandingPage;
