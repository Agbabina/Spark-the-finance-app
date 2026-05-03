import "../App.css";
import { FaReact } from "react-icons/fa6";
import { LuChevronFirst } from "react-icons/lu";

export default function Sidebar() {
    return (
        <aside className="h-screen">
            <nav className="h-full flex flex-col bg-white border-r shadow-sm">

                {/* Header */}
                <div className="p-4 pb-2 flex justify-between items-center">
                    <FaReact className="text-2xl text-blue-500" />

                    <button className="p-1.5 rounded-lg bg-gray-50 hover:bg-gray-100">
                        <LuChevronFirst />
                    </button>
                </div>

            </nav>
        </aside>
    );
}