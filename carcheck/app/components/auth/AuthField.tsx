type AuthFieldProps = {
  id: string;
  label: string;
  type?: string;
  value: string;
  onChange: (value: string) => void;
  error?: string;
  hint?: string;
  autoComplete?: string;
  disabled?: boolean;
};

export function AuthField({
  id,
  label,
  type = "text",
  value,
  onChange,
  error,
  hint,
  autoComplete,
  disabled,
}: AuthFieldProps) {
  return (
    <div>
      <label htmlFor={id} className="block text-sm font-semibold text-muted mb-1.5">
        {label}
      </label>
      <input
        id={id}
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        autoComplete={autoComplete}
        disabled={disabled}
        className={`w-full min-h-[48px] rounded-xl bg-surface border px-4 py-3 text-foreground placeholder-muted/50 focus:outline-none focus:ring-2 focus:ring-amber-500/40 focus:border-amber-500 transition-all ${
          error ? "border-red-500/60" : "border-card-border"
        }`}
      />
      {hint && !error && <p className="mt-1.5 text-xs text-muted">{hint}</p>}
      {error && (
        <p className="mt-1.5 text-xs text-red-400 font-medium" role="alert">
          {error}
        </p>
      )}
    </div>
  );
}
