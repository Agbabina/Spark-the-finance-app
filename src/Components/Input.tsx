import { useId } from "react";
import type { InputHTMLAttributes } from "react";

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
    label?: string;
    hint?: string;
    error?: string;
    wrapperClassName?: string;
}

function Input({ label, hint, error, className = "", wrapperClassName = "", id, ...props }: InputProps) {
    const generatedId = useId();
    const inputId = id || `input-${generatedId}`;

    return (
        <div className={`space-y-2 ${wrapperClassName}`}>
            {label && (
                <label htmlFor={inputId} className="text-sm font-semibold text-slate-700 dark:text-slate-200">
                    {label}
                </label>
            )}
            <input
                {...props}
                id={inputId}
                aria-invalid={Boolean(error)}
                autoComplete={props.autoComplete || (props.type === "password" ? "current-password" : props.type === "email" ? "email" : "username")}
                className={`input-field ${error ? "border-rose-400 focus:border-rose-500 focus:ring-rose-500" : ""} ${className}`}
            />
            {(hint || error) && (
                <p className={`text-xs ${error ? "text-rose-500" : "text-slate-500 dark:text-slate-400"}`}>
                    {error || hint}
                </p>
            )}
        </div>
    );
}

export default Input;
