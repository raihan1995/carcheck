type AuthDividerProps = {
  label?: string;
};

export function AuthDivider({ label = "or" }: AuthDividerProps) {
  return (
    <div className="relative py-1">
      <div className="absolute inset-0 flex items-center">
        <div className="w-full border-t border-hairline" />
      </div>
      <div className="relative flex justify-center">
        <span className="kicker bg-background px-3 text-muted/70">{label}</span>
      </div>
    </div>
  );
}
