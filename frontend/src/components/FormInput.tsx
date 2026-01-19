import { useState } from "react";
import { Eye, EyeOff } from "lucide-react";

interface FormInputProps {
  id: string;
  label: string;
  type?: "text" | "email" | "password";
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  error?: string;
  autoComplete?: string;
  required?: boolean;
}

export default function FormInput({
  id,
  label,
  type = "text",
  value,
  onChange,
  placeholder,
  error,
  autoComplete,
  required = false,
}: FormInputProps) {
  const [showPassword, setShowPassword] = useState(false);
  const isPassword = type === "password";
  const inputType = isPassword && showPassword ? "text" : type;

  return (
    <div>
      <label
        htmlFor={id}
        className="block text-sm font-medium text-text-secondary mb-2"
      >
        {label}
      </label>
      <div className="relative">
        <input
          type={inputType}
          id={id}
          name={id}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          required={required}
          autoComplete={autoComplete}
          aria-invalid={!!error}
          aria-describedby={error ? `${id}-error` : undefined}
          className={`w-full px-4 py-3 bg-bg-base border rounded-lg text-text-primary placeholder:text-text-muted focus:outline-none focus:ring-1 transition-default ${
            error
              ? "border-error-500 focus:border-error-500 focus:ring-error-500"
              : "border-border-subtle focus:border-primary-500 focus:ring-primary-500"
          } ${isPassword ? "pr-12" : ""}`}
          placeholder={placeholder}
        />
        {isPassword && (
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-text-muted hover:text-text-secondary transition-default"
            tabIndex={-1}
            aria-label={showPassword ? "Hide password" : "Show password"}
          >
            {showPassword ? (
              <EyeOff className="w-5 h-5" />
            ) : (
              <Eye className="w-5 h-5" />
            )}
          </button>
        )}
      </div>
      {error && (
        <p id={`${id}-error`} className="mt-2 text-sm text-error-500" role="alert">
          {error}
        </p>
      )}
    </div>
  );
}
