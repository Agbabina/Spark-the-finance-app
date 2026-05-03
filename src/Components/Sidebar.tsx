import "../App.css";
import { FaReact } from "react-icons/fa6";
import { LuChevronFirst } from "react-icons/lu";
import {IoMdToday} from "react-icons/io"
import {MdMoreVert} from "react-icons/md"
import {LuChevronLast} from "react-icons/lu"
import {createContext, useState} from "react";

const SideBarContext= createContext();
export default function Sidebar({children}) {

    const [expanded , setExpanded] = useState<boolean>(true);

    return (
        <aside className="h-screen">
            <nav className="h-full flex flex-col bg-white border-r shadow-sm">

                <div className="p-4 pb-2 flex justify-between items-center">
                    <FaReact className={`text-2xl text-blue-500 overflow-hidden transition-all ${
                        expanded ? "w-32": "w-0"
                    }`}></FaReact>
                    <button className="p-1.5 rounded-lg bg-gray-50 hover:bg-gray-100" onClick={()=> setExpanded((curr: boolean)=> !curr)}>
                        {expanded ? <LuChevronFirst/> : <LuChevronLast/>}
                    </button>
                </div>

                <SideBarContext.Provider value={expanded}>
                    <ul className={"flex-1 px-3"}>{children}</ul>
                </SideBarContext.Provider>
                <ul className={"flex-1 px-3"}>{children}</ul>
                <div className={"border-t flex p-3"}>
                    <IoMdToday className="w-10 h-10 rounded-md" />
                    <div className={
                        `flex justify-between items-center 
                        overflow-hidden transition-all ${expanded ? "w-52 ml-3": "w-0"}`} >
                        <div className={"leading-4"}>
                            {/*TODO: Do the Backend so that does names will be replaced by actual real ones*/}
                            <h4 className={"font-semibold"}>John Doe</h4>
                            <span className={"text-xs text-gray-600"}>johndoe@gmail.com</span>
                        </div>
                        <MdMoreVert size={20}></MdMoreVert>
                    </div>
                </div>
            </nav>
        </aside>
    );
}

export function SidebarItem({icon, text, active, alert}){
    const [expanded, setExpanded] =
    return (
        <li className={
            `relative flex items-center py-2 px-3 my-1
            font-medium rounded-md cursor-pointer transition-colors
            ${
                active ? "bg-gradient-to-tr from-indigo-200 to -indigo-100 text-indigo-800"
                    : "hover:bg-indigo-50 text-gray-600"
            }`
        }>{icon}
        <span className={"w-52 ml-3"}>{text}</span>
            {alert && (
                <div className={'absolute right-2 w-2 h-2 rounded bg-indigo-400'}></div>
            )}
        </li>
    )
}