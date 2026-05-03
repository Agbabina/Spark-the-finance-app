export default function SidebarItem({
                                icon,
                                text,
                                active,
                                alert,
                            }: {
    icon: ReactNode;
    text: string;
    active?: boolean;
    alert?: boolean;
}) {
    const context = useContext(SidebarContext);
    if (!context) return null;

    const { expanded } = context;

    return (
        <div
            className={`
        flex items-center gap-3 px-3 py-2 rounded-lg cursor-pointer
        transition-all
        ${
                active
                    ? "bg-indigo-50 text-indigo-600 font-medium"
                    : "text-gray-600 hover:bg-gray-100"
            }
      `}
        >
            <div className="text-lg">{icon}</div>

            {expanded && <span className="text-sm">{text}</span>}

            {alert && (
                <span className="ml-auto w-2 h-2 bg-indigo-500 rounded-full"></span>
            )}
        </div>
    );
}