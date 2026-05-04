import {LuMenu} from "react-icons/lu";
import {useState} from "react";
import {MdBalance} from "react-icons/md";
import {BiMoney} from "react-icons/bi";
import {GrTransaction} from "react-icons/gr";
import {
    LineChart,
    Line,
    XAxis,
    YAxis,
    Tooltip,
    ResponsiveContainer,
    Cell
} from "recharts"
import {PieChart, Pie, } from "recharts"
function Sidebar(){
    const [isSidebarOpen, setIsSidebarOpen] = useState<boolean>(false);
    const data=[
        {day:"Mon", spending: 4000},
        {day: "Tue", spending: 3000},
        {day: "Wed", spending: 5000},
        {day: "Thu",spending: 7000},
        {day: "Fri", spending: 6000},
    ]
    const navItems= [
        {name: "Balance", icon: MdBalance },
        {name: "Transactions", icon: GrTransaction},
        {name: "Budgets", icon: BiMoney}
    ]
    const types=[
        {name:"Food", value: 400},
        {name: "Bills", value: 300},
        {name: "Transport", value: 200}
    ]
    const COLORS = ["#3b82f6", "#10b981", "#f59e0b"]
    return (
        <>
            <div className={"flex bg-gray-100 h-screen"}>
                {/*Sidebar */}
                <div className={`fixed bg-white w-64 h-screen shadow ${isSidebarOpen ? "translate-x-0": "-translate-x-64"} lg:translate-x-0 lg:static`}>
                    <div className={"p-4 flex justify-between border-b "}>
                        <div className={"text-xl font-bold "}>
                            Logo
                        </div>
                        <button onClick={()=>setIsSidebarOpen(false)} className={"lg:hidden"}>X</button>
                    </div>
                    <div className={"p-4 space-y-2"}>
                        {navItems.map((item)=>{
                            return (
                                <div className={"flex p-2 items-center gap-3 px-4 py-2 transition-all duration-200 hover:bg-gray-100 hover:translate-x-1"}>
                                    <div className={"text-xl"}>{item.name}</div>
                                    
                                </div>
                            )
                        })}
                    </div>
                </div>
                <main className={"flex-1"}>
                    <header className={"bg-white flex justify-between p-4"}>
                        <button className={"p-2 text-xl font-bold lg:hidden"} onClick={() => setIsSidebarOpen(true)}>
                            <LuMenu />
                        </button>
                        <h1 className={"text-2xl font-bold mb-2"}>Dashboard</h1>
                        <div className={"bg-gray-300 w-10 h-10 rounded-full"}></div>

                    </header>
                    <h1>This Week</h1>
                    <div className={"w-full h-64 bg-white p-4 rounded-xl shadow"}>
                        <ResponsiveContainer width={"100%"} height={"100%"}>
                            <LineChart data={data}>
                                <XAxis dataKey={"day"}></XAxis>
                                <YAxis />
                                <Tooltip />
                                <Line type={"monotone"} dataKey={"spending"} stroke={"#3b82f6"} strokeWidth={3}/>
                            </LineChart>
                        </ResponsiveContainer>
                    </div>
                    <h1>Categories</h1>
                    <div>
                        <PieChart width={300} height={300}>
                            <Pie data={types} dataKey={"value"}>
                                {data.map((_entry,index)=>(
                                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]}></Cell>
                                ))}
                            </Pie>
                            <Tooltip />
                        </PieChart>
                    </div>
                </main>
            </div>
        </>
        )
}

export default Sidebar;