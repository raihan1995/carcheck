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
  required?: boolean;
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
  required,
}: AuthFieldProps) {
  return (
    <div className="field">
      <label htmlFor={id}>{label}</label>
      <input
        className="auth-input"
        id={id}
        name={id}
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        autoComplete={autoComplete}
        disabled={disabled}
        required={required}
        aria-invalid={!!error}
        aria-describedby={
          error ? `${id}-error` : hint ? `${id}-hint` : undefined
        }
      />
      {hint && !error && (
        <span className="small muted" id={`${id}-hint`}>
          {hint}
        </span>
      )}
      {error && (
        <span className="form-error" role="alert" id={`${id}-error`}>
          {error}
        </span>
      )}
    </div>
  );
}
