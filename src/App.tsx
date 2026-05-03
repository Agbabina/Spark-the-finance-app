import Sidebar, { SidebarItem } from "./Components/Sidebar";

import { FaHome } from "react-icons/fa";

export default function App() {
    return (
        <div style={{ display: "flex", height: "100vh" }}>

            {/* LEFT SIDEBAR */}
            <Sidebar>
                <SidebarItem icon={<FaHome />} text="Home" active />
            </Sidebar>

            {/* RIGHT CONTENT */}
            <div style={{ flex: 1, padding: "20px", background: "#f3f4f6" }}>
                <h1>MAIN CONTENT</h1>
                <p>If you see this on the RIGHT, it is FIXED.</p>
            </div>

        </div>
    );
}