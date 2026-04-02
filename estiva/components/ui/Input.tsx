import { forwardRef } from "react";
import { useTheme } from "@/contexts/ThemeContext";

type InputProps = {
  label: string;
  type?: string;
  name?: string;
  placeholder?: string;
  className?: string;
  value?: string;
  onChange?: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onBlur?: (e: React.FocusEvent<HTMLInputElement>) => void;
  required?: boolean;
  disabled?: boolean;
  error?: string;
};

const Input = forwardRef<HTMLInputElement, InputProps>(function Input(
  {
    label,
    type = "text",
    name,
    placeholder,
    className = "",
    value,
    onChange,
    onBlur,
    required,
    disabled,
    error,
  },
  ref,
) {
  const { theme } = useTheme();
  const isDark = theme === "dark";
  const labelColor = isDark ? "text-white/80" : "text-[#47376d]";
  const baseInput = isDark
    ? "border-white/15 bg-white/10 text-white/90 placeholder:text-white/30 focus:border-white/30 focus:bg-white/15 focus:ring-white/20"
    : "border-[#d9cef4] bg-white text-[#1d1233] placeholder:text-[#73619d] focus:border-[#a18ddc] focus:bg-white focus:ring-[#b79df1]/60";
  const errorClass = error ? "border-red-500 focus:border-red-500 focus:ring-red-500/30" : "";

  return (
    <div className="space-y-2">
      <label className={`block text-sm font-medium ${labelColor}`}>
        {label}
      </label>
      <input
        ref={ref}
        type={type}
        name={name}
        placeholder={placeholder}
        value={value}
        onChange={onChange}
        onBlur={onBlur}
        required={required}
        disabled={disabled}
        className={`w-full rounded-2xl px-4 py-3 shadow-sm transition focus:ring-2 disabled:opacity-50 ${baseInput} ${errorClass} ${className}`}
      />
      {error && (
        <p className="text-xs text-red-500">{error}</p>
      )}
    </div>
  );
});

export default Input;
