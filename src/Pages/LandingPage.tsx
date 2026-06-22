import { useNavigate } from "react-router-dom";
import { LuBarChart3, LuWallet, LuSparkles, LuLock, LuCreditCard, LuTrendingUp } from "react-icons/lu";

function LandingPage() {
    const navigate = useNavigate();

    const features = [
        { icon: LuWallet, title: "Track every naira", description: "Log income and expenses in seconds with clean, distraction-free forms." },
        { icon: LuBarChart3, title: "Budgets that breathe", description: "Set monthly caps per category and see progress bars update in real time." },
        { icon: LuSparkles, title: "AI coach built in", description: "Get offline forecasts, savings tips, and smart alerts without third-party logins." },
        { icon: LuCreditCard, title: "Connect accounts", description: "Link bank accounts and share transactions with trusted contacts." },
        { icon: LuLock, title: "Private by default", description: "JWT-based sessions keep your data locked to your device until you choose to share." },
        { icon: LuTrendingUp, title: "Goals with momentum", description: "Set targets, track progress, and celebrate milestones as you reach them." }
    ];

    return (
        <div style={{ minHeight: "100vh", background: "#020617", color: "#ffffff" }}>
            <nav style={{ position: "fixed", top: 0, left: 0, right: 0, zIndex: 50, borderBottom: "1px solid rgba(255,255,255,0.1)", background: "rgba(2,6,23,0.8)", backdropFilter: "blur(12px)" }}>
                <div style={{ maxWidth: "1280px", margin: "0 auto", padding: "16px", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                    <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                        <span style={{ fontSize: "20px", fontWeight: 900, color: "#ffffff" }}>Spark</span>
                        <span style={{ borderRadius: "9999px", background: "#2563eb", padding: "2px 8px", fontSize: "12px", fontWeight: 700, color: "#ffffff" }}>Finance</span>
                    </div>
                    <button type="button" onClick={() => navigate("/login")} style={{ background: "linear-gradient(135deg, #2563eb, #7c3aed)", color: "#ffffff", border: "none", borderRadius: "16px", padding: "10px 20px", fontSize: "14px", fontWeight: 700, cursor: "pointer" }}>Sign in</button>
                </div>
            </nav>

            <section style={{ position: "relative", overflow: "hidden", paddingTop: "192px", paddingBottom: "80px" }}>
                <div style={{ position: "absolute", inset: 0, background: "radial-gradient(circle at top right, rgba(59,130,246,0.25), transparent 32%)" }} />
                <div style={{ position: "absolute", left: "-96px", top: "80px", height: "256px", width: "256px", borderRadius: "9999px", background: "rgba(59,130,246,0.2)", filter: "blur(64px)" }} />
                <div style={{ position: "absolute", right: "-64px", bottom: "40px", height: "288px", width: "288px", borderRadius: "9999px", background: "rgba(124,58,237,0.2)", filter: "blur(64px)" }} />

                <div style={{ maxWidth: "1280px", margin: "0 auto", padding: "0 16px", textAlign: "center" }}>
                    <p style={{ fontSize: "14px", fontWeight: 600, letterSpacing: "0.2em", textTransform: "uppercase", color: "#60a5fa" }}>Personal finance, reimagined</p>
                    <h1 style={{ marginTop: "24px", fontSize: "clamp(36px, 5vw, 48px)", fontWeight: 900, lineHeight: 1.1 }}>
                        Track money with a <span style={{ background: "linear-gradient(135deg, #60a5fa, #c084fc)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>calmer, sharper</span> dashboard.
                    </h1>
                    <p style={{ margin: "24px auto 0", maxWidth: "672px", fontSize: "18px", lineHeight: 1.7, color: "#cbd5e1" }}>
                        Capture income, watch spending, and read your finances at a glance — no noise, no clutter, just clarity.
                    </p>
                    <div style={{ marginTop: "40px", display: "flex", flexDirection: "column", gap: "16px", alignItems: "center", justifyContent: "center" }}>
                        <button type="button" onClick={() => navigate("/login")} style={{ background: "linear-gradient(135deg, #2563eb, #7c3aed)", color: "#ffffff", border: "none", borderRadius: "16px", padding: "14px 32px", fontSize: "16px", fontWeight: 700, cursor: "pointer", minWidth: "200px" }}>Get started free</button>
                        <button type="button" onClick={() => navigate("/login")} style={{ background: "rgba(255,255,255,0.08)", color: "#e2e8f0", border: "1px solid rgba(255,255,255,0.12)", borderRadius: "16px", padding: "14px 32px", fontSize: "16px", fontWeight: 600, cursor: "pointer", minWidth: "200px" }}>View demo</button>
                    </div>
                </div>
            </section>

            <section style={{ borderTop: "1px solid rgba(255,255,255,0.1)", background: "rgba(15,23,42,0.5)", padding: "80px 0" }}>
                <div style={{ maxWidth: "1280px", margin: "0 auto", padding: "0 16px" }}>
                    <div style={{ display: "grid", gap: "24px", gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))" }}>
                        {features.map((feature) => (
                            <div key={feature.title} style={{ borderRadius: "24px", border: "1px solid rgba(255,255,255,0.1)", background: "rgba(15,23,42,0.8)", padding: "24px", transition: "background 200ms ease" }}>
                                <div style={{ display: "flex", height: "48px", width: "48px", alignItems: "center", justifyContent: "center", borderRadius: "16px", background: "rgba(59,130,246,0.1)", color: "#60a5fa" }}>
                                    <feature.icon style={{ fontSize: "20px" }} />
                                </div>
                                <h3 style={{ marginTop: "16px", fontSize: "18px", fontWeight: 700, color: "#ffffff" }}>{feature.title}</h3>
                                <p style={{ marginTop: "8px", fontSize: "14px", lineHeight: 1.6, color: "#94a3b8" }}>{feature.description}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            <section style={{ padding: "80px 0" }}>
                <div style={{ maxWidth: "896px", margin: "0 auto", padding: "0 16px", textAlign: "center" }}>
                    <h2 style={{ fontSize: "clamp(30px, 4vw, 36px)", fontWeight: 900 }}>Built for people who hate visual noise.</h2>
                    <p style={{ margin: "16px auto 0", maxWidth: "672px", fontSize: "18px", lineHeight: 1.7, color: "#cbd5e1" }}>
                        Most finance apps feel like a spreadsheet dressed in neon. Spark keeps the interface calm so you can focus on what matters: your money.
                    </p>
                </div>
            </section>

            <section style={{ borderTop: "1px solid rgba(255,255,255,0.1)", background: "rgba(15,23,42,0.5)", padding: "64px 0" }}>
                <div style={{ maxWidth: "896px", margin: "0 auto", padding: "0 16px", textAlign: "center" }}>
                    <h2 style={{ fontSize: "clamp(30px, 4vw, 36px)", fontWeight: 900 }}>Ready to take control?</h2>
                    <p style={{ margin: "16px auto 0", maxWidth: "672px", fontSize: "18px", lineHeight: 1.7, color: "#cbd5e1" }}>
                        Join thousands who have already simplified their finances with Spark.
                    </p>
                    <button type="button" onClick={() => navigate("/login")} style={{ marginTop: "32px", background: "linear-gradient(135deg, #2563eb, #7c3aed)", color: "#ffffff", border: "none", borderRadius: "16px", padding: "16px 40px", fontSize: "16px", fontWeight: 700, cursor: "pointer" }}>Start tracking now</button>
                </div>
            </section>

            <footer style={{ borderTop: "1px solid rgba(255,255,255,0.1)", padding: "40px 0" }}>
                <div style={{ maxWidth: "1280px", margin: "0 auto", padding: "0 16px", display: "flex", flexDirection: "column", gap: "16px", alignItems: "center", justifyContent: "space-between" }}>
                    <p style={{ fontSize: "14px", color: "#64748b" }}>Spark Finance. All rights reserved.</p>
                    <div style={{ display: "flex", gap: "24px", fontSize: "14px", color: "#64748b" }}>
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
