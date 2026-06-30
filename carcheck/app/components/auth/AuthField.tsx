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
      <label htmlFor={id} className="kicker block text-muted mb-2">
        {label}
      </label>
      <input
        id={id}
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        autoComplete={autoComplete}
        disabled={disabled}
        className={`w-full min-h-[48px] border-b bg-transparent px-1 py-2.5 text-foreground placeholder-muted/40 focus:outline-none transition-colors ${
          error ? "border-red-500/70" : "border-foreground/25 focus:border-accent"
        }`}
      />
      {hint && !error && <p className="mt-2 text-xs text-muted">{hint}</p>}
      {error && (
        <p className="mt-2 text-xs text-red-400 font-medium" role="alert">
          {error}
        </p>
      )}
    </div>
  );
}
