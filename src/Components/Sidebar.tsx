import { useState, useEffect } from "react";
import { LuMenu, LuLogOut, LuUsers } from "react-icons/lu";
import { MdBalance } from "react-icons/md";
import { GrTransaction } from "react-icons/gr";
import { BiPlus, BiWallet } from "react-icons/bi";
import { MdAccountBalanceWallet } from "react-icons/md";
import { BsBullseye } from "react-icons/bs";
import { Outlet, useLocation, useNavigate } from "react-router-dom";

import { useAppData } from "../contexts/AppDataContext";
import { useTheme } from "../contexts/ThemeContext";

function Sidebar() {
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);
    const [mounted, setMounted] = useState(false);
    const { theme, toggleTheme } = useTheme();
    const { username, onLogout } = useAppData();
    const navigate = useNavigate();
    const location = useLocation();

    useEffect(() => {
        setMounted(true);
    }, []);

    const navItems = [
        { name: "Dashboard", icon: MdBalance, path: "/" },
        { name: "Transactions", icon: GrTransaction, path: "/transactions" },
        { name: "Budgets", icon: MdAccountBalanceWallet, path: "/budgets" },
        { name: "Goals", icon: BsBullseye, path: "/goals" },
        { name: "Spark Connect", icon: BiWallet, path: "/spark-connect" },
        { name: "Connections", icon: LuUsers, path: "/connections" },
        { name: "Add Transaction", icon: BiPlus, path: "/add" }
    ];

    return (
        <div className="min-h-screen lg:flex">
            <aside
                className={`fixed inset-y-0 left-0 z-50 w-72 transform overflow-y-auto border-r border-slate-200/70 bg-white/85 backdrop-blur-xl transition-transform duration-300 dark:border-slate-800 dark:bg-slate-950/85 lg:sticky lg:top-0 lg:translate-x-0 ${
                    isSidebarOpen ? "translate-x-0" : "-translate-x-full"
                }`}
            >
                <div className="flex h-full flex-col">
                    <div className="border-b border-slate-200/70 p-6 dark:border-slate-800">
                        <div className="flex items-start justify-between gap-4">
                            <div>
                                <p className="text-xs font-semibold uppercase tracking-[0.35em] text-blue-600 dark:text-blue-400">
                                    Finance hub
                                </p>
                                <div className="mt-2 flex items-center gap-2">
                                    <div className="relative inline-flex h-12 items-center justify-center rounded-3xl bg-slate-950 px-4 text-center shadow-[0_0_40px_rgba(56,189,248,0.18)]">
                                        <span className="text-2xl font-black tracking-tight text-cyan-300 drop-shadow-[0_0_12px_rgba(56,189,248,0.75)]">
                                            Spark
                                        </span>
                                        <svg viewBox="0 0 500 150" className="spark-lightning__svg absolute inset-0 h-full w-full" preserveAspectRatio="none">
                                            <path d="M120 25 L140 60 L130 75 L150 110 L135 130" className="spark-lightning__bolt spark-lightning__bolt--delay0" />
                                            <path d="M245 20 L230 55 L250 85 L235 120" className="spark-lightning__bolt spark-lightning__bolt--delay1" />
                                            <path d="M360 35 L345 70 L365 95 L348 130" className="spark-lightning__bolt spark-lightning__bolt--delay2" />
                                        </svg>
                                    </div>
                                </div>
                            </div>

                            <button
                                onClick={toggleTheme}
                                className="btn-secondary w-auto px-4 py-2 text-sm transition-all duration-300 hover:shadow-md"
                            >
                                {theme === "dark" ? "Light mode" : "Dark mode"}
                            </button>
                        </div>

                        <div className={`mt-6 rounded-[1.75rem] border border-slate-200/70 bg-slate-100/80 p-5 shadow-xl transition-all duration-300 hover:shadow-2xl dark:border-slate-800 dark:bg-slate-950/90 ${mounted ? 'animate-slide-in-left stagger-1' : 'opacity-0'}`}>
                            <p className="text-xs uppercase tracking-[0.25em] text-slate-500 dark:text-slate-400">
                                Welcome back
                            </p>
                            <h3 className="mt-2 text-xl font-black tracking-tight text-slate-900 dark:text-white">
                                {username || "Valued user"}
                            </h3>
                            <p className="mt-1 text-sm leading-6 text-slate-500 dark:text-slate-400">
                                Your personal finance command center is ready.
                            </p>
                        </div>
                    </div>

                    <nav className="flex-1 space-y-2 p-4">
                        {navItems.map((item, index) => {
                            const Icon = item.icon;
                            const active = location.pathname === item.path;

                            return (
                                <button
                                    key={item.name}
                                    onClick={() => {
                                        navigate(item.path);
                                        setIsSidebarOpen(false);
                                    }}
                                    className={`nav-item flex w-full items-center gap-3 rounded-2xl px-4 py-3 text-left transition-all duration-200 ${mounted ? 'animate-slide-in-left' : 'opacity-0'} ${active ? "active bg-blue-600 text-white shadow-lg shadow-blue-600/20" : "text-slate-700 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-900/60 hover:translate-x-1"}`}
                                    style={{ animationDelay: `${0.1 + index * 0.05}s` }}
                                >
                                    <Icon className={`${active ? "text-white" : "text-blue-600 dark:text-blue-400"} transition-transform duration-200 ${active ? "scale-110" : ""}`} />
                                    <span className="font-medium">{item.name}</span>
                                </button>
                            );
                        })}
                    </nav>

                    <div className="border-t border-slate-200/70 p-5 dark:border-slate-800">
                        <button
                            onClick={onLogout}
                            className="flex w-full items-center justify-center gap-2 rounded-2xl bg-rose-500 px-4 py-3 text-sm font-semibold text-white transition-all duration-200 hover:bg-rose-600"
                        >
                            <LuLogOut />
                            Logout
                        </button>
                    </div>
                </div>
        </aside>
            <div className="flex min-h-screen flex-1 flex-col">
                <header className="sticky top-0 z-40 border-b border-slate-200/70 bg-white/80 backdrop-blur-xl dark:border-slate-800 dark:bg-slate-950/80">
                    <div className="flex items-center justify-between gap-4 px-4 py-4 sm:px-6 lg:px-8">
                        <div className="flex items-center gap-3">
                            <button
                                onClick={() => setIsSidebarOpen(true)}
                                className="rounded-2xl border border-slate-200/70 bg-white/80 p-3 text-slate-700 shadow-sm transition hover:bg-slate-100 dark:border-slate-700 dark:bg-slate-900/80 dark:text-slate-200 lg:hidden"
                            >
                                <LuMenu className="text-xl" />
                            </button>

                            <div>
                                <p className="text-xs font-semibold uppercase tracking-[0.3em] text-blue-600 dark:text-blue-400">
                                    Overview
                                </p>
                                <h2 className="text-xl font-bold tracking-tight text-slate-900 dark:text-white sm:text-2xl">
                                    Dashboard
                                </h2>
                            </div>
                        </div>
                    </div>
                </header>

                <main className="flex-1 px-4 py-6 sm:px-6 lg:px-8">
                    <Outlet />
                </main>
            </div>

            {isSidebarOpen && (
                <div
                    className="fixed inset-0 z-40 bg-slate-950/50 backdrop-blur-sm lg:hidden animate-fade-in"
                    onClick={() => setIsSidebarOpen(false)}
                />
            )}
        </div>
    );
}

export default Sidebar;