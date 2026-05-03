import { MdMoreVert } from "react-icons/md";
import { FaChevronLeft, FaChevronRight } from "react-icons/fa";
import { createContext, useContext, useState, type ReactNode } from "react";

type SidebarContextType = { expanded: boolean };
const SidebarContext = createContext<SidebarContextType | null>(null);

export default function Sidebar({ children }: { children: ReactNode }) {
    const [expanded, setExpanded] = useState(true);

    return (
        // Changed h-1 to h-screen and added dynamic width w-64 / w-20
        <aside className="w-[240px] h-screen bg-white border-r">
            {/* HEADER */}
            <div className="h-16 flex items-center justify-between px-4 border-b">
                {/* Hide text when collapsed */}
                {expanded && <h1 className="text-lg font-semibold text-gray-800">My Dashboard</h1>}

                <button
                    onClick={() => setExpanded((v) => !v)}
                    className={`p-2 rounded-md hover:bg-gray-100 transition ${!expanded && "mx-auto"}`}
                >
                    {expanded ? <FaChevronLeft size={14} /> : <FaChevronRight size={14} />}
                </button>
            </div>

            {/* NAV */}
            <SidebarContext.Provider value={{ expanded }}>
                <nav className="flex-1 px-3 py-4 space-y-1">
                    {children}
                </nav>
            </SidebarContext.Provider>

            {/* FOOTER */}
            <div className="border-t p-4 flex items-center gap-3">
                <div className="w-10 h-10 min-w-[40px] rounded-full bg-indigo-500 text-white flex items-center justify-center font-semibold">
                    JD
                </div>

                {expanded && (
                    <div className="flex-1 flex items-center justify-between overflow-hidden">
                        <div className="leading-4">
                            <p className="text-sm font-medium truncate">John Doe</p>
                            <p className="text-xs text-gray-500 truncate">Product Manager</p>
                        </div>
                        <MdMoreVert />
                    </div>
                )}
            </div>
        </aside>
    );
}

export function SidebarItem({ icon, text, active, alert }: { icon: ReactNode; text: string; active?: boolean; alert?: boolean; }) {
    const context = useContext(SidebarContext);
    if (!context) return null;
    const { expanded } = context;

    return (
        <div className={`
            flex items-center gap-3 px-3 py-2 rounded-lg cursor-pointer transition-all mb-1
            ${active ? "bg-indigo-50 text-indigo-600 font-medium" : "text-gray-600 hover:bg-gray-100"}
            ${!expanded && "justify-center px-2"}
        `}>
            <div className="text-lg">{icon}</div>

            {expanded && <span className="text-sm whitespace-nowrap">{text}</span>}

            {/* Tooltip-style alert when collapsed, or dot when expanded */}
            {alert && (
                <span className={`bg-indigo-500 rounded-full ${expanded ? "ml-auto w-2 h-2" : "absolute right-2 w-2 h-2"}`} />
            )}
        </div>
    );
}
