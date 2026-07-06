"use client";

import { useCallback, useEffect, useMemo, useState } from "react";

import type { SpecCandidate } from "@/lib/car-specs-lookup";
import {
  applyRefinementFilters,
  clearRefinementPrefs,
  getBodyShapeOptions,
  getTransmissionOptions,
  getTrimOptions,
  loadRefinementPrefs,
  resolveRefinementStep,
  resolveSpecFromRefinement,
  sanitizeRefinementPrefs,
  saveRefinementPrefs,
  type SpecRefinementPrefs,
  type TransmissionChoice,
} from "@/lib/spec-refinement";

type SpecRefinementWizardProps = {
  registration: string;
  candidates: SpecCandidate[];
  suggestedId: string | null | undefined;
  onSelectionChange: (spec: SpecCandidate) => void;
};

type WizardMode = "idle" | "active";

function ChoiceButton({
  children,
  onClick,
}: {
  children: React.ReactNode;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="rounded-full border border-hairline bg-white px-4 py-2 text-sm font-medium text-muted-strong transition-colors touch-manipulation hover:border-accent-text hover:text-accent-text"
    >
      {children}
    </button>
  );
}

function RefineMatchIdleControls({ onRefine }: { onRefine: () => void }) {
  const tooltipId = "refine-match-hint";

  return (
    <div className="mt-4 flex justify-end items-center gap-2">
      <button
        type="button"
        onClick={onRefine}
        className="rounded-md border border-hairline bg-white px-3 py-1.5 text-sm font-semibold text-accent-text transition-colors touch-manipulation hover:border-accent-text hover:bg-accent-soft focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent-text focus-visible:ring-offset-2"
      >
        Refine match
      </button>
      <div className="relative group">
        <button
          type="button"
          aria-label="About refine match"
          aria-describedby={tooltipId}
          className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full border border-hairline bg-white text-muted transition-colors touch-manipulation hover:border-accent-text hover:text-accent-text focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent-text focus-visible:ring-offset-2"
        >
          <svg
            className="h-3.5 w-3.5"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth={2}
            aria-hidden
          >
            <circle cx="12" cy="12" r="10" />
            <path strokeLinecap="round" d="M12 16v-4M12 8h.01" />
          </svg>
        </button>
        <div
          id={tooltipId}
          role="tooltip"
          className="pointer-events-none absolute bottom-full right-0 z-10 mb-2 w-52 rounded-md border border-hairline bg-white px-3 py-2 text-xs font-normal normal-case tracking-normal text-muted-strong opacity-0 shadow-sm transition-opacity group-hover:opacity-100 group-focus-within:opacity-100 sm:w-60"
        >
          Doesn&apos;t seem correct? try to refine details manually
        </div>
      </div>
    </div>
  );
}

export function SpecRefinementWizard({
  registration,
  candidates,
  suggestedId,
  onSelectionChange,
}: SpecRefinementWizardProps) {
  const [prefs, setPrefs] = useState<SpecRefinementPrefs>({});
  const [mode, setMode] = useState<WizardMode>("idle");
  const [hydrated, setHydrated] = useState(false);

  const sanitizedPrefs = useMemo(
    () => sanitizeRefinementPrefs(candidates, prefs),
    [candidates, prefs]
  );

  const filtered = useMemo(
    () => applyRefinementFilters(candidates, sanitizedPrefs),
    [candidates, sanitizedPrefs]
  );

  const step = useMemo(
    () => resolveRefinementStep(candidates, sanitizedPrefs),
    [candidates, sanitizedPrefs]
  );

  const resolvedSpec = useMemo(
    () => resolveSpecFromRefinement(candidates, sanitizedPrefs, suggestedId),
    [candidates, sanitizedPrefs, suggestedId]
  );

  const defaultSpec = useMemo(
    () => resolveSpecFromRefinement(candidates, {}, suggestedId),
    [candidates, suggestedId]
  );

  const persistPrefs = useCallback(
    (next: SpecRefinementPrefs) => {
      setPrefs(next);
      saveRefinementPrefs(registration, next);
    },
    [registration]
  );

  const restoreDefault = useCallback(() => {
    if (defaultSpec) onSelectionChange(defaultSpec);
  }, [defaultSpec, onSelectionChange]);

  const cancelRefinement = useCallback(() => {
    clearRefinementPrefs(registration);
    setPrefs({});
    setMode("idle");
    restoreDefault();
  }, [registration, restoreDefault]);

  const startRefinement = useCallback(() => {
    persistPrefs({});
    setMode("active");
  }, [persistPrefs]);

  const handleTransmission = useCallback(
    (choice: TransmissionChoice) => {
      const next: SpecRefinementPrefs = {
        transmission: choice,
        bodyShape: null,
        trimId: null,
      };
      const pool = applyRefinementFilters(candidates, next);
      persistPrefs(next);
      if (pool.length <= 1) setMode("idle");
    },
    [candidates, persistPrefs]
  );

  const handleBodyShape = useCallback(
    (key: string) => {
      const next: SpecRefinementPrefs = {
        ...sanitizedPrefs,
        bodyShape: key,
        trimId: null,
      };
      const pool = applyRefinementFilters(candidates, next);
      persistPrefs(next);
      if (pool.length <= 1) setMode("idle");
    },
    [candidates, sanitizedPrefs, persistPrefs]
  );

  const handleTrim = useCallback(
    (id: string) => {
      const next: SpecRefinementPrefs = {
        ...sanitizedPrefs,
        trimId: id,
      };
      persistPrefs(next);
      setMode("idle");
    },
    [sanitizedPrefs, persistPrefs]
  );

  useEffect(() => {
    const stored = loadRefinementPrefs(registration);
    const clean = sanitizeRefinementPrefs(candidates, stored);
    setPrefs(clean);
    setHydrated(true);
  }, [registration, candidates]);

  useEffect(() => {
    if (!hydrated || !resolvedSpec) return;
    if (Object.keys(sanitizedPrefs).length === 0) return;
    if (mode === "active" && filtered.length > 1) return;
    onSelectionChange(resolvedSpec);
  }, [hydrated, resolvedSpec, sanitizedPrefs, mode, filtered.length, onSelectionChange]);

  useEffect(() => {
    if (!hydrated || mode !== "active") return;
    if (step === "complete" || filtered.length <= 1) {
      setMode("idle");
    }
  }, [hydrated, mode, step, filtered.length]);

  const transmissionPool =
    sanitizedPrefs.transmission != null
      ? applyRefinementFilters(candidates, {
          transmission: sanitizedPrefs.transmission,
          bodyShape: null,
          trimId: null,
        })
      : candidates;

  const shapePool =
    sanitizedPrefs.bodyShape != null
      ? applyRefinementFilters(candidates, {
          ...sanitizedPrefs,
          trimId: null,
        })
      : transmissionPool;

  const showTransmissionStep = mode === "active" && step === "transmission";
  const showBodyShapeStep = mode === "active" && step === "bodyShape";
  const showTrimStep = mode === "active" && step === "trim";

  if (!hydrated || candidates.length === 0) return null;

  if (mode === "idle") {
    return <RefineMatchIdleControls onRefine={startRefinement} />;
  }

  return (
    <div className="mt-4 flex flex-col gap-4">
      <div className="flex justify-end">
        <button
          type="button"
          onClick={cancelRefinement}
          className="text-xs font-medium text-muted hover:text-accent-text touch-manipulation"
        >
          Cancel
        </button>
      </div>

      {showTransmissionStep && (
        <div>
          <p className="text-sm font-semibold text-foreground mb-3">
            Is the transmission automatic or manual?
          </p>
          <div className="flex flex-wrap gap-2">
            {getTransmissionOptions(candidates).includes("automatic") && (
              <ChoiceButton onClick={() => handleTransmission("automatic")}>
                Automatic
              </ChoiceButton>
            )}
            {getTransmissionOptions(candidates).includes("manual") && (
              <ChoiceButton onClick={() => handleTransmission("manual")}>
                Manual
              </ChoiceButton>
            )}
            <ChoiceButton onClick={() => handleTransmission("unknown")}>
              Not sure
            </ChoiceButton>
          </div>
        </div>
      )}

      {showBodyShapeStep && (
        <div>
          <p className="text-sm font-semibold text-foreground mb-3">Which Body type?</p>
          <div className="flex flex-wrap gap-2">
            {getBodyShapeOptions(transmissionPool).map(({ key, label }) => (
              <ChoiceButton key={key} onClick={() => handleBodyShape(key)}>
                {label}
              </ChoiceButton>
            ))}
          </div>
        </div>
      )}

      {showTrimStep && (
        <div>
          <p className="text-sm font-semibold text-foreground mb-3">Pick matching trim</p>
          <div className="flex flex-col gap-2">
            {getTrimOptions(shapePool).map(({ id, label }) => (
              <button
                key={id}
                type="button"
                onClick={() => handleTrim(id)}
                className="rounded-lg border border-hairline bg-white px-4 py-3 text-left text-sm text-muted-strong hover:border-accent-text hover:text-accent-text transition-colors touch-manipulation"
              >
                {label}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
