

// @ts-ignore
function Input({label}, ...props){
    return(
        <div className={"space-y-1"}>
            {label && <label className={"text-sm"}>{label}</label>}
            <input
                {...props}
            className={"w-full border p-2 rounded"}/>
        </div>
    )
}

export default Input;