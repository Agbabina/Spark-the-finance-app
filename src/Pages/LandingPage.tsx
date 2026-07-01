import { useTheme } from "../contexts/ThemeContext";
import { useNavigate } from "react-router-dom";
import { LuWallet, LuSparkles, LuLock, LuCreditCard, LuTrendingUp, LuActivity, LuSun, LuMoon } from "react-icons/lu";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import SparkLightning from "../Components/SparkLightning";

function LandingPage() {
    const navigate = useNavigate();
    const { theme, toggleTheme } = useTheme();

    const features = [
        { icon: LuWallet, title: "Track every naira", description: "Log income and expenses in seconds with clean, distraction-free forms." },
        { icon: LuActivity, title: "Budgets that breathe", description: "Set monthly caps per category and see progress bars update in real time." },
        { icon: LuSparkles, title: "AI coach built in", description: "Get offline forecasts, savings tips, and smart alerts without third-party logins." },
        { icon: LuCreditCard, title: "Connect accounts", description: "Link bank accounts and share transactions with trusted contacts." },
        { icon: LuLock, title: "Private by default", description: "JWT-based sessions keep your data locked to your device until you choose to share." },
        { icon: LuTrendingUp, title: "Goals with momentum", description: "Set targets, track progress, and celebrate milestones as you reach them." }
    ];

    const chartData = [
        { month: "Jan", income: 4200, expenses: 3100 },
        { month: "Feb", income: 4800, expenses: 2900 },
        { month: "Mar", income: 4500, expenses: 3200 },
        { month: "Apr", income: 5200, expenses: 2800 },
        { month: "May", income: 4900, expenses: 3500 },
        { month: "Jun", income: 5600, expenses: 3000 },
    ];

    const isDark = theme === "dark";

    return (
        <div className="animate-fade-in" style={{ minHeight: "100vh", background: isDark ? "#020617" : "#f8fafc", color: isDark ? "#ffffff" : "#0f172a", transition: "background 300ms ease, color 300ms ease" }}>
            <nav style={{ position: "fixed", top: 0, left: 0, right: 0, zIndex: 50, borderBottom: isDark ? "1px solid rgba(255,255,255,0.1)" : "1px solid rgba(0,0,0,0.08)", background: isDark ? "rgba(2,6,23,0.8)" : "rgba(255,255,255,0.8)", backdropFilter: "blur(12px)" }}>
                <div style={{ maxWidth: "1280px", margin: "0 auto", padding: "16px", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                    <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                        <SparkLightning compact className="landing-logo" />
                        <span style={{ borderRadius: "9999px", background: "#2563eb", padding: "2px 8px", fontSize: "12px", fontWeight: 700, color: "#ffffff" }}>Finance</span>
                    </div>
                    <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                        <button type="button" onClick={toggleTheme} style={{ background: isDark ? "rgba(255,255,255,0.1)" : "rgba(0,0,0,0.05)", border: "none", borderRadius: "12px", padding: "8px", cursor: "pointer", color: isDark ? "#e2e8f0" : "#334155", display: "flex", alignItems: "center", justifyContent: "center" }}>
                            {isDark ? <LuSun style={{ width: 20, height: 20 }} /> : <LuMoon style={{ width: 20, height: 20 }} />}
                        </button>
                        <button type="button" onClick={() => navigate("/login")} style={{ background: "linear-gradient(135deg, #2563eb, #7c3aed)", color: "#ffffff", border: "none", borderRadius: "16px", padding: "10px 20px", fontSize: "14px", fontWeight: 700, cursor: "pointer" }}>Sign in</button>
                    </div>
                </div>
            </nav>

            <section style={{ position: "relative", overflow: "hidden", paddingTop: "192px", paddingBottom: "80px" }}>
                <div style={{ position: "absolute", inset: 0, background: isDark ? "radial-gradient(circle at top right, rgba(59,130,246,0.25), transparent 32%)" : "radial-gradient(circle at top right, rgba(37,99,235,0.15), transparent 32%)" }} />
                <div style={{ position: "absolute", left: "-96px", top: "80px", height: "256px", width: "256px", borderRadius: "9999px", background: isDark ? "rgba(59,130,246,0.2)" : "rgba(37,99,235,0.1)", filter: "blur(64px)" }} />
                <div style={{ position: "absolute", right: "-64px", bottom: "40px", height: "288px", width: "288px", borderRadius: "9999px", background: isDark ? "rgba(124,58,237,0.2)" : "rgba(124,58,237,0.1)", filter: "blur(64px)" }} />

                <div style={{ maxWidth: "1280px", margin: "0 auto", padding: "0 16px", textAlign: "center" }}>
                    <p style={{ fontSize: "14px", fontWeight: 600, letterSpacing: "0.2em", textTransform: "uppercase", color: "#2563eb" }}>Personal finance, reimagined</p>
                    <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: "12px", flexWrap: "wrap", marginTop: "24px" }}>
                        <h1 style={{ margin: 0, fontSize: "clamp(36px, 5vw, 48px)", fontWeight: 900, lineHeight: 1.1, color: isDark ? "#ffffff" : "#0f172a" }}>
                            Track money with a <span style={{ background: "linear-gradient(135deg, #2563eb, #7c3aed)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>calmer, sharper</span> dashboard.
                        </h1>
                        <div style={{ minWidth: "92px" }}>
                            <SparkLightning />
                        </div>
                    </div>
                    <p style={{ margin: "24px auto 0", maxWidth: "672px", fontSize: "18px", lineHeight: 1.7, color: isDark ? "#cbd5e1" : "#475569" }}>
                        Capture income, watch spending, and read your finances at a glance — no noise, no clutter, just clarity.
                    </p>
                    <div style={{ marginTop: "40px", display: "flex", flexDirection: "column", gap: "16px", alignItems: "center", justifyContent: "center" }}>
                        <button type="button" onClick={() => navigate("/login")} style={{ background: "linear-gradient(135deg, #2563eb, #7c3aed)", color: "#ffffff", border: "none", borderRadius: "16px", padding: "14px 32px", fontSize: "16px", fontWeight: 700, cursor: "pointer", minWidth: "200px" }}>Get started free</button>
                        <button type="button" onClick={() => navigate("/login")} style={{ background: isDark ? "rgba(255,255,255,0.08)" : "rgba(0,0,0,0.04)", color: isDark ? "#e2e8f0" : "#334155", border: isDark ? "1px solid rgba(255,255,255,0.12)" : "1px solid rgba(0,0,0,0.08)", borderRadius: "16px", padding: "14px 32px", fontSize: "16px", fontWeight: 600, cursor: "pointer", minWidth: "200px" }}>View demo</button>
                    </div>
                </div>
            </section>

            <section style={{ borderTop: isDark ? "1px solid rgba(255,255,255,0.1)" : "1px solid rgba(0,0,0,0.08)", background: isDark ? "rgba(15,23,42,0.5)" : "rgba(255,255,255,0.5)", padding: "80px 0", transition: "background 300ms ease" }}>
                <div style={{ maxWidth: "1280px", margin: "0 auto", padding: "0 16px" }}>
                    <div style={{ display: "grid", gap: "24px", gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))" }}>
                        {features.map((feature) => (
                            <div key={feature.title} style={{ borderRadius: "24px", border: isDark ? "1px solid rgba(255,255,255,0.1)" : "1px solid rgba(0,0,0,0.08)", background: isDark ? "rgba(15,23,42,0.8)" : "#ffffff", padding: "24px", transition: "background 200ms ease" }}>
                                <div style={{ display: "flex", height: "48px", width: "48px", alignItems: "center", justifyContent: "center", borderRadius: "16px", background: "rgba(37,99,235,0.1)", color: "#2563eb" }}>
                                    <feature.icon style={{ fontSize: "20px" }} />
                                </div>
                                <h3 style={{ marginTop: "16px", fontSize: "18px", fontWeight: 700, color: isDark ? "#ffffff" : "#0f172a" }}>{feature.title}</h3>
                                <p style={{ marginTop: "8px", fontSize: "14px", lineHeight: 1.6, color: isDark ? "#94a3b8" : "#475569" }}>{feature.description}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            <section style={{ padding: "80px 0", background: isDark ? "transparent" : "#ffffff", transition: "background 300ms ease" }}>
                <div style={{ maxWidth: "896px", margin: "0 auto", padding: "0 16px", textAlign: "center" }}>
                    <h2 style={{ fontSize: "clamp(30px, 4vw, 36px)", fontWeight: 900, color: isDark ? "#ffffff" : "#0f172a", margin: 0 }}>Built for people who prefer a calm, clutter-free experience.</h2>
                    <p style={{ margin: "16px auto 0", maxWidth: "672px", fontSize: "18px", lineHeight: 1.7, color: isDark ? "#cbd5e1" : "#475569" }}>
                        Most finance apps feel like a spreadsheet dressed in neon. Spark keeps the interface calm so you can focus on what matters: your money.
                    </p>
                    <div style={{ marginTop: "40px", borderRadius: "24px", border: isDark ? "1px solid rgba(255,255,255,0.1)" : "1px solid rgba(0,0,0,0.08)", background: isDark ? "rgba(15,23,42,0.6)" : "#ffffff", padding: "24px", boxShadow: isDark ? "0 25px 80px rgba(0,0,0,0.35)" : "0 25px 80px rgba(15,23,42,0.08)", transition: "background 300ms ease" }}>
                        <ResponsiveContainer width="100%" height={280}>
                            <LineChart data={chartData}>
                                <CartesianGrid strokeDasharray="3 3" stroke={isDark ? "rgba(255,255,255,0.08)" : "rgba(0,0,0,0.06)"} />
                                <XAxis dataKey="month" stroke={isDark ? "#94a3b8" : "#475569"} style={{ fill: isDark ? "#94a3b8" : "#475569", fontSize: 12 }} />
                                <YAxis stroke={isDark ? "#94a3b8" : "#475569"} style={{ fill: isDark ? "#94a3b8" : "#475569", fontSize: 12 }} />
                                <Tooltip
                                    contentStyle={{ background: isDark ? "#0f172a" : "#ffffff", border: isDark ? "1px solid rgba(255,255,255,0.1)" : "1px solid rgba(0,0,0,0.08)", borderRadius: "12px", color: isDark ? "#ffffff" : "#0f172a" }}
                                />
                                <Line type="monotone" dataKey="income" stroke="#10b981" strokeWidth={3} dot={{ fill: "#10b981", strokeWidth: 2 }} activeDot={{ r: 6 }} />
                                <Line type="monotone" dataKey="expenses" stroke="#f43f5e" strokeWidth={3} dot={{ fill: "#f43f5e", strokeWidth: 2 }} activeDot={{ r: 6 }} />
                            </LineChart>
                        </ResponsiveContainer>
                    </div>
                </div>
            </section>

            <section style={{ borderTop: isDark ? "1px solid rgba(255,255,255,0.1)" : "1px solid rgba(0,0,0,0.08)", background: isDark ? "rgba(15,23,42,0.5)" : "rgba(248,250,252,1)", padding: "64px 0", transition: "background 300ms ease" }}>
                <div style={{ maxWidth: "896px", margin: "0 auto", padding: "0 16px", textAlign: "center" }}>
                    <h2 style={{ fontSize: "clamp(30px, 4vw, 36px)", fontWeight: 900, color: isDark ? "#ffffff" : "#0f172a", margin: 0 }}>Ready to take control?</h2>
                    <p style={{ margin: "16px auto 0", maxWidth: "672px", fontSize: "18px", lineHeight: 1.7, color: isDark ? "#cbd5e1" : "#475569" }}>
                        Join thousands who have already simplified their finances with Spark.
                    </p>
                    <button type="button" onClick={() => navigate("/login")} style={{ marginTop: "32px", background: "linear-gradient(135deg, #2563eb, #7c3aed)", color: "#ffffff", border: "none", borderRadius: "16px", padding: "16px 40px", fontSize: "16px", fontWeight: 700, cursor: "pointer" }}>Start tracking now</button>
                </div>
            </section>

            <footer style={{ borderTop: isDark ? "1px solid rgba(255,255,255,0.1)" : "1px solid rgba(0,0,0,0.08)", padding: "40px 0", background: isDark ? "#020617" : "#ffffff", transition: "background 300ms ease" }}>
                <div style={{ maxWidth: "1280px", margin: "0 auto", padding: "0 16px", display: "flex", flexDirection: "column", gap: "16px", alignItems: "center", justifyContent: "space-between" }}>
                    <p style={{ fontSize: "14px", color: isDark ? "#64748b" : "#64748b" }}>Spark Finance. All rights reserved.</p>
                    <div style={{ display: "flex", gap: "24px", fontSize: "14px", color: isDark ? "#64748b" : "#64748b" }}>
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
