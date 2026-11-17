import React, { type InputHTMLAttributes, forwardRef, useId } from "react";

export interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  helperText?: string;
  error?: string;
  fullWidth?: boolean;
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
  (
    {
      className = "",
      id,
      label,
      helperText,
      error,
      fullWidth = false,
      disabled,
      required,
      type = "text",
      ...props
    },
    ref,
  ) => {
    const generatedId = useId();
    const inputId = id ?? generatedId;
    const errorId = error ? `${inputId}-error` : undefined;
    const helperId = helperText ? `${inputId}-helper` : undefined;

    return (
      <div className={`flex flex-col gap-1.5 ${fullWidth ? "w-full" : ""}`}>
        {label && (
          <label
            htmlFor={inputId}
            className="text-xs font-semibold text-slate-700 select-none flex items-center gap-1"
          >
            <span id={`${inputId}-label`}>{label}</span>
            {required && (
              <span aria-hidden="true" className="text-red-500 font-bold">
                *
              </span>
            )}
          </label>
        )}

        <input
          ref={ref}
          id={inputId}
          type={type}
          disabled={disabled}
          required={required}
          aria-invalid={Boolean(error)}
          aria-labelledby={label ? `${inputId}-label` : undefined}
          aria-describedby={errorId ?? helperId}
          className={`h-11 px-3 rounded-md border bg-white text-sm text-slate-900 transition-colors shadow-2xs placeholder:text-slate-400 focus:outline-hidden focus:ring-2 focus:ring-offset-1 disabled:bg-slate-50 disabled:text-slate-500 disabled:cursor-not-allowed ${
            error
              ? "border-red-500 focus:border-red-500 focus:ring-red-500"
              : "border-slate-300 focus:border-amber-600 focus:ring-amber-500"
          } ${className}`}
          {...props}
        />

        {error ? (
          <p id={errorId} className="text-xs text-red-600 font-medium">
            {error}
          </p>
        ) : helperText ? (
          <p id={helperId} className="text-xs text-slate-500">
            {helperText}
          </p>
        ) : null}
      </div>
    );
  },
);

Input.displayName = "Input";
