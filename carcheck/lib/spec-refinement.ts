import type { SpecCandidate } from "@/lib/car-specs-lookup";

export type TransmissionChoice = "automatic" | "manual" | "unknown";

export type SpecRefinementPrefs = {
  transmission?: TransmissionChoice;
  bodyShape?: string | null;
  trimId?: string | null;
};

export const SPEC_REFINEMENT_STORAGE_KEY = "revveal_spec_refinement";

const BODY_SHAPES: { key: string; label: string; tokens: string[] }[] = [
  { key: "sportback", label: "Sportback", tokens: ["sportback"] },
  { key: "hatchback", label: "Hatchback", tokens: ["hatchback"] },
  { key: "saloon", label: "Saloon", tokens: ["saloon"] },
  { key: "coupe", label: "Coupe", tokens: ["coupe"] },
  { key: "cabriolet", label: "Cabriolet", tokens: ["cabriolet"] },
  { key: "convertible", label: "Convertible", tokens: ["convertible"] },
  { key: "estate", label: "Estate", tokens: ["estate"] },
  { key: "avant", label: "Avant", tokens: ["avant"] },
  { key: "roadster", label: "Roadster", tokens: ["roadster"] },
  { key: "touring", label: "Touring", tokens: ["touring"] },
  { key: "allroad", label: "Allroad", tokens: ["allroad"] },
  { key: "citycarver", label: "Citycarver", tokens: ["citycarver"] },
];

export function normalizeRegistrationKey(registration: string): string {
  return registration.replace(/\s+/g, "").toUpperCase();
}

export function isAutomaticCandidate(candidate: SpecCandidate): boolean {
  const text = `${candidate.gearbox ?? ""} ${candidate.transmission ?? ""}`.toLowerCase();
  if (!text.trim()) return false;
  if (text.includes("manual")) return false;
  return (
    text.includes("auto") ||
    text.includes("tronic") ||
    text.includes("dct") ||
    text.includes("dsg") ||
    text.includes("cvt") ||
    text.includes("semi")
  );
}

export function extractBodyShapeKey(candidate: SpecCandidate): string | null {
  const sources = [candidate.seriesLabel ?? "", candidate.modelLabel ?? ""].map((s) =>
    s.toLowerCase()
  );

  for (const source of sources) {
    for (const shape of BODY_SHAPES) {
      if (shape.tokens.some((token) => source.includes(token))) {
        return shape.key;
      }
    }
  }
  return null;
}

export function bodyShapeLabel(key: string): string {
  return BODY_SHAPES.find((s) => s.key === key)?.label ?? key;
}

export function applyRefinementFilters(
  candidates: SpecCandidate[],
  prefs: SpecRefinementPrefs
): SpecCandidate[] {
  let pool = candidates;

  if (prefs.transmission && prefs.transmission !== "unknown") {
    pool = pool.filter((candidate) => {
      const automatic = isAutomaticCandidate(candidate);
      return prefs.transmission === "automatic" ? automatic : !automatic;
    });
  }

  if (prefs.bodyShape) {
    pool = pool.filter((candidate) => extractBodyShapeKey(candidate) === prefs.bodyShape);
  }

  if (prefs.trimId) {
    pool = pool.filter((candidate) => candidate.id === prefs.trimId);
  }

  return pool;
}

export function getTransmissionOptions(
  candidates: SpecCandidate[]
): ("automatic" | "manual")[] {
  const options = new Set<"automatic" | "manual">();
  for (const candidate of candidates) {
    options.add(isAutomaticCandidate(candidate) ? "automatic" : "manual");
  }
  return [...options].sort();
}

export function getBodyShapeOptions(
  candidates: SpecCandidate[]
): { key: string; label: string }[] {
  const byKey = new Map<string, string>();
  for (const candidate of candidates) {
    const key = extractBodyShapeKey(candidate);
    if (key && !byKey.has(key)) byKey.set(key, bodyShapeLabel(key));
  }
  return [...byKey.entries()]
    .map(([key, label]) => ({ key, label }))
    .sort((a, b) => a.label.localeCompare(b.label));
}

export function getTrimOptions(
  candidates: SpecCandidate[]
): { id: string; label: string }[] {
  return candidates
    .map((candidate) => ({
      id: candidate.id,
      label: candidate.variantLabel ?? candidate.label,
    }))
    .sort((a, b) => a.label.localeCompare(b.label));
}

export type RefinementStep = "transmission" | "bodyShape" | "trim" | "complete";

export function resolveRefinementStep(
  allCandidates: SpecCandidate[],
  prefs: SpecRefinementPrefs
): RefinementStep {
  const filtered = applyRefinementFilters(allCandidates, prefs);
  if (filtered.length <= 1) return "complete";

  if (prefs.transmission == null && getTransmissionOptions(allCandidates).length > 1) {
    return "transmission";
  }

  const afterTransmission = applyRefinementFilters(allCandidates, {
    transmission: prefs.transmission ?? "unknown",
    bodyShape: null,
    trimId: null,
  });

  if (!prefs.bodyShape && getBodyShapeOptions(afterTransmission).length > 1) {
    return "bodyShape";
  }

  const afterShape = applyRefinementFilters(allCandidates, {
    transmission: prefs.transmission ?? "unknown",
    bodyShape: prefs.bodyShape ?? null,
    trimId: null,
  });

  if (!prefs.trimId && getTrimOptions(afterShape).length > 1) {
    return "trim";
  }

  return "complete";
}

export function resolveSpecFromRefinement(
  candidates: SpecCandidate[],
  prefs: SpecRefinementPrefs,
  suggestedId: string | null | undefined
): SpecCandidate | null {
  if (!candidates.length) return null;

  const filtered = applyRefinementFilters(candidates, prefs);
  if (filtered.length === 1) return filtered[0];

  if (filtered.length > 1) {
    const suggested = suggestedId
      ? filtered.find((candidate) => candidate.id === suggestedId)
      : null;
    return suggested ?? filtered[0];
  }

  const suggested = suggestedId
    ? candidates.find((candidate) => candidate.id === suggestedId)
    : null;
  return suggested ?? candidates[0];
}

export function sanitizeRefinementPrefs(
  candidates: SpecCandidate[],
  prefs: SpecRefinementPrefs
): SpecRefinementPrefs {
  const next: SpecRefinementPrefs = { ...prefs };

  if (next.trimId && !candidates.some((c) => c.id === next.trimId)) {
    next.trimId = null;
  }

  if (next.bodyShape) {
    const pool = applyRefinementFilters(candidates, {
      transmission: next.transmission ?? "unknown",
      bodyShape: null,
      trimId: null,
    });
    const shapes = getBodyShapeOptions(pool).map((s) => s.key);
    if (!shapes.includes(next.bodyShape)) next.bodyShape = null;
  }

  const filtered = applyRefinementFilters(candidates, next);
  if (filtered.length === 0) {
    return {};
  }

  return next;
}

type RefinementStore = Record<string, SpecRefinementPrefs>;

export function loadRefinementPrefs(registration: string): SpecRefinementPrefs {
  if (typeof window === "undefined") return {};
  try {
    const raw = window.localStorage.getItem(SPEC_REFINEMENT_STORAGE_KEY);
    if (!raw) return {};
    const store = JSON.parse(raw) as RefinementStore;
    return store[normalizeRegistrationKey(registration)] ?? {};
  } catch {
    return {};
  }
}

export function saveRefinementPrefs(
  registration: string,
  prefs: SpecRefinementPrefs
): void {
  if (typeof window === "undefined") return;
  const key = normalizeRegistrationKey(registration);
  try {
    const raw = window.localStorage.getItem(SPEC_REFINEMENT_STORAGE_KEY);
    const store: RefinementStore = raw ? JSON.parse(raw) : {};
    if (Object.keys(prefs).length === 0) {
      delete store[key];
    } else {
      store[key] = prefs;
    }
    window.localStorage.setItem(SPEC_REFINEMENT_STORAGE_KEY, JSON.stringify(store));
  } catch {
    // Ignore quota / privacy errors
  }
}

export function clearRefinementPrefs(registration: string): void {
  saveRefinementPrefs(registration, {});
}

export function formatRefinementSummary(prefs: SpecRefinementPrefs): string[] {
  const parts: string[] = [];
  if (prefs.transmission === "automatic") parts.push("Automatic");
  else if (prefs.transmission === "manual") parts.push("Manual");
  if (prefs.bodyShape) parts.push(bodyShapeLabel(prefs.bodyShape));
  return parts;
}
