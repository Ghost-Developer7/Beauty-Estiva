import { useTheme } from "@/contexts/ThemeContext";

type InputProps = {
  label: string;
  type?: string;
  name: string;
  placeholder?: string;
  className?: string;
  value?: string;
  onChange?: (e: React.ChangeEvent<HTMLInputElement>) => void;
  required?: boolean;
  disabled?: boolean;
  error?: string;
};

export default function Input({
  label,
  type = "text",
  name,
  placeholder,
  className = "",
  value,
  onChange,
  required,
  disabled,
  error,
}: InputProps) {
  const { theme } = useTheme();
  const isDark = theme === "dark";
  const labelColor = isDark ? "text-white/80" : "text-[#47376d]";
  const baseInput = isDark
    ? "border-white/10 bg-white/5 text-white placeholder:text-white/50 focus:border-white/40 focus:bg-white/10 focus:ring-white/30"
    : "border-[#d9cef4] bg-white text-[#1d1233] placeholder:text-[#73619d] focus:border-[#a18ddc] focus:bg-white focus:ring-[#b79df1]/60";
  const errorClass = error ? "border-red-500 focus:border-red-500 focus:ring-red-500/30" : "";

  return (
    <div className="space-y-2">
      <label className={`block text-sm font-medium ${labelColor}`}>
        {label}
      </label>
      <input
        type={type}
        name={name}
        placeholder={placeholder}
        value={value}
        onChange={onChange}
        required={required}
        disabled={disabled}
        className={`w-full rounded-2xl px-4 py-3 shadow-sm transition focus:ring-2 disabled:opacity-50 ${baseInput} ${errorClass} ${className}`}
      />
      {error && (
        <p className="text-xs text-red-500">{error}</p>
      )}
    </div>
  );
}
