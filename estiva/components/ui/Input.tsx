import { useTheme } from "@/contexts/ThemeContext";

type InputProps = {
  label: string;
  type?: string;
  name: string;
  placeholder?: string;
  className?: string;
};

export default function Input({
  label,
  type = "text",
  name,
  placeholder,
  className = "",
}: InputProps) {
  const { theme } = useTheme();
  const isDark = theme === "dark";
  const labelColor = isDark ? "text-white/80" : "text-[#47376d]";
  const baseInput = isDark
    ? "border-white/10 bg-white/5 text-white placeholder:text-white/50 focus:border-white/40 focus:bg-white/10 focus:ring-white/30"
    : "border-[#d9cef4] bg-white text-[#1d1233] placeholder:text-[#73619d] focus:border-[#a18ddc] focus:bg-white focus:ring-[#b79df1]/60";

  return (
    <div className="space-y-2">
      <label className={`block text-sm font-medium ${labelColor}`}>
        {label}
      </label>
      <input
        type={type}
        name={name}
        placeholder={placeholder}
        className={`w-full rounded-2xl px-4 py-3 shadow-sm transition focus:ring-2 ${baseInput} ${className}`}
      />
    </div>
  );
}
