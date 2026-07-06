"use client";

import { useCallback, useEffect, useMemo, useState } from "react";

import type { SpecCandidate } from "@/lib/car-specs-lookup";
import {
  applyRefinementFilters,
  clearRefinementPrefs,
  formatRefinementSummary,
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

type WizardMode = "idle" | "active" | "done";

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
      className="rounded-full border border-hairline bg-white px-4 py-2 text-sm font-medium text-muted-strong transition-colors touch-manipulation hover:border-accent hover:text-accent"
    >
      {children}
    </button>
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

  const summary = useMemo(() => formatRefinementSummary(sanitizedPrefs), [sanitizedPrefs]);

  const persistPrefs = useCallback(
    (next: SpecRefinementPrefs) => {
      setPrefs(next);
      saveRefinementPrefs(registration, next);
    },
    [registration]
  );

  const startRefinement = useCallback(() => {
    persistPrefs({});
    setMode("active");
  }, [persistPrefs]);

  const cancelRefinement = useCallback(() => {
    clearRefinementPrefs(registration);
    setPrefs({});
    setMode("idle");
  }, [registration]);

  const restartRefinement = useCallback(() => {
    clearRefinementPrefs(registration);
    setPrefs({});
    setMode("active");
  }, [registration]);

  const handleTransmission = useCallback(
    (choice: TransmissionChoice) => {
      const next: SpecRefinementPrefs = {
        transmission: choice,
        bodyShape: null,
        trimId: null,
      };
      const pool = applyRefinementFilters(candidates, next);
      persistPrefs(next);
      if (pool.length <= 1) setMode("done");
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
      if (pool.length <= 1) setMode("done");
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
      setMode("done");
    },
    [sanitizedPrefs, persistPrefs]
  );

  useEffect(() => {
    const stored = loadRefinementPrefs(registration);
    const clean = sanitizeRefinementPrefs(candidates, stored);
    setPrefs(clean);
    if (Object.keys(clean).length > 0) {
      setMode("done");
    }
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
      setMode("done");
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

  if (!hydrated || candidates.length <= 1) return null;

  if (mode === "idle") {
    return (
      <div className="mt-4 flex justify-end">
        <button
          type="button"
          onClick={startRefinement}
          className="text-sm font-semibold text-accent hover:underline touch-manipulation"
        >
          Refine match
        </button>
      </div>
    );
  }

  return (
    <div className="mt-4">
      {mode === "done" && (summary.length > 0 || sanitizedPrefs.trimId) && (
        <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
          <div className="flex flex-wrap items-center gap-2">
            <span className="kicker text-muted">Your choices</span>
            {summary.map((part) => (
              <span
                key={part}
                className="rounded-full border border-hairline bg-white px-3 py-1 text-xs font-medium text-muted-strong"
              >
                {part}
              </span>
            ))}
            {sanitizedPrefs.trimId && resolvedSpec?.variantLabel && (
              <span className="rounded-full border border-hairline bg-white px-3 py-1 text-xs font-medium text-muted-strong">
                {resolvedSpec.variantLabel}
              </span>
            )}
          </div>
          <button
            type="button"
            onClick={restartRefinement}
            className="shrink-0 text-sm font-semibold text-accent hover:underline touch-manipulation"
          >
            Start over
          </button>
        </div>
      )}

      {mode === "active" && (
        <div className="rounded-lg border border-hairline bg-muted/30 p-4 sm:p-5 flex flex-col gap-4">
          <div className="flex items-center justify-between gap-3">
            <p className="kicker text-muted">
              Narrow down
              {filtered.length > 1 && (
                <span className="ml-2 font-normal normal-case tracking-normal text-muted">
                  · {filtered.length} matches left
                </span>
              )}
            </p>
            <button
              type="button"
              onClick={cancelRefinement}
              className="text-xs font-medium text-muted hover:text-accent touch-manipulation"
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
              <p className="text-sm font-semibold text-foreground mb-3">
                Which body style is it?
              </p>
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
              <p className="text-sm font-semibold text-foreground mb-3">
                Which trim best matches?
              </p>
              <div className="flex flex-col gap-2">
                {getTrimOptions(shapePool).map(({ id, label }) => (
                  <button
                    key={id}
                    type="button"
                    onClick={() => handleTrim(id)}
                    className="rounded-lg border border-hairline bg-white px-4 py-3 text-left text-sm text-muted-strong hover:border-accent hover:text-accent transition-colors touch-manipulation"
                  >
                    {label}
                  </button>
                ))}
              </div>
            </div>
          )}

          {step === "complete" && filtered.length > 1 && (
            <p className="text-sm text-muted">
              We could not narrow this to one match. Pick the closest trim above, or{" "}
              <button
                type="button"
                onClick={restartRefinement}
                className="font-semibold text-accent hover:underline"
              >
                start over
              </button>
              .
            </p>
          )}
        </div>
      )}

      {mode === "done" && !(summary.length > 0 || sanitizedPrefs.trimId) && (
        <div className="flex justify-end">
          <button
            type="button"
            onClick={restartRefinement}
            className="text-sm font-semibold text-accent hover:underline touch-manipulation"
          >
            Refine match
          </button>
        </div>
      )}
    </div>
  );
}
