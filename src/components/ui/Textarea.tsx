import { cn } from "@/lib/utils";
import { TextareaHTMLAttributes, forwardRef } from "react";

interface TextareaProps extends TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string;
  error?: string;
  helperText?: string;
  showCount?: boolean;
}

export const Textarea = forwardRef<HTMLTextAreaElement, TextareaProps>(
  ({ className, label, error, helperText, showCount, maxLength, value, id, ...props }, ref) => {
    const inputId = id || label?.toLowerCase().replace(/\s+/g, "-");
    const charCount = typeof value === "string" ? value.length : 0;

    return (
      <div className="w-full">
        {label && (
          <label htmlFor={inputId} className="block text-sm font-medium text-gray-700 mb-1">
            {label}
            {props.required && <span className="text-rose-500 ml-1">*</span>}
          </label>
        )}
        <textarea
          ref={ref}
          id={inputId}
          value={value}
          maxLength={maxLength}
          className={cn(
            "block w-full rounded-lg border px-3 py-2.5 text-base sm:text-sm text-gray-900 placeholder-gray-400 resize-y",
            "focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-transparent",
            "transition-colors duration-150",
            error
              ? "border-rose-400 bg-rose-50 focus:ring-rose-400"
              : "border-gray-300 bg-white hover:border-gray-400",
            className
          )}
          {...props}
        />
        <div className="flex justify-between mt-1">
          <span>{error && <p className="text-xs text-rose-600">{error}</p>}</span>
          {showCount && maxLength && (
            <span className="text-xs text-gray-400">
              {charCount}/{maxLength}
            </span>
          )}
        </div>
        {helperText && !error && <p className="text-xs text-gray-500">{helperText}</p>}
      </div>
    );
  }
);

Textarea.displayName = "Textarea";
