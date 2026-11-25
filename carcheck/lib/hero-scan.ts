export const HERO_SCAN_DURATION_MS = 9000;

export const HERO_SCAN_AREAS = {
  engine: { x: 28, y: 44, labelPosition: "above-right" },
  brakes: { x: 55, y: 68, labelPosition: "above-left" },
  tyres: { x: 91, y: 61, labelPosition: "above-left" },
  lights: { x: 11, y: 50, labelPosition: "above-right" },
  windscreen: { x: 55, y: 31, labelPosition: "above-left" },
  body: { x: 83, y: 48, labelPosition: "below-left" },
} as const;

export type HeroScanArea = keyof typeof HERO_SCAN_AREAS;
export type HeroScanIssue = {
  id: string;
  label: string;
  area: HeroScanArea;
  tone: "warning" | "danger";
};

// Decorative examples for the homepage illustration, never lookup results.
export const HERO_SCAN_ISSUES: readonly HeroScanIssue[] = [
  { id: "oil-leak", label: "Oil leak", area: "engine", tone: "warning" },
  { id: "fuel-leak", label: "Fuel leak", area: "engine", tone: "danger" },
  { id: "fluid-leak", label: "Fluid leak", area: "engine", tone: "warning" },
  { id: "emissions", label: "Emissions", area: "engine", tone: "warning" },
  {
    id: "bonnet-fault",
    label: "Bonnet fault",
    area: "engine",
    tone: "warning",
  },
  { id: "brake-wear", label: "Brake wear", area: "brakes", tone: "danger" },
  { id: "worn-discs", label: "Worn discs", area: "brakes", tone: "warning" },
  { id: "brake-pipes", label: "Brake pipes", area: "brakes", tone: "danger" },
  {
    id: "suspension-wear",
    label: "Suspension wear",
    area: "brakes",
    tone: "warning",
  },
  {
    id: "steering-play",
    label: "Steering play",
    area: "brakes",
    tone: "danger",
  },
  { id: "tyre-wear", label: "Tyre wear", area: "tyres", tone: "warning" },
  { id: "tyre-damage", label: "Tyre damage", area: "tyres", tone: "danger" },
  { id: "low-tread", label: "Low tread", area: "tyres", tone: "danger" },
  { id: "uneven-wear", label: "Uneven wear", area: "tyres", tone: "warning" },
  { id: "light-fault", label: "Light fault", area: "lights", tone: "warning" },
  {
    id: "headlamp-aim",
    label: "Headlamp aim",
    area: "lights",
    tone: "warning",
  },
  { id: "dim-lights", label: "Dim lights", area: "lights", tone: "warning" },
  {
    id: "windscreen-chip",
    label: "Windscreen chip",
    area: "windscreen",
    tone: "warning",
  },
  {
    id: "wiper-wear",
    label: "Wiper wear",
    area: "windscreen",
    tone: "warning",
  },
  {
    id: "washer-fault",
    label: "Washer fault",
    area: "windscreen",
    tone: "warning",
  },
  { id: "corrosion", label: "Corrosion", area: "body", tone: "warning" },
  { id: "exhaust-leak", label: "Exhaust leak", area: "body", tone: "danger" },
  {
    id: "loose-exhaust",
    label: "Loose exhaust",
    area: "body",
    tone: "warning",
  },
  { id: "body-damage", label: "Body damage", area: "body", tone: "warning" },
];

// These combinations keep labels apart even on the smallest hero layout.
const SCAN_LAYOUTS: readonly (readonly HeroScanArea[])[] = [
  ["engine", "brakes", "tyres"],
  ["lights", "windscreen", "body"],
  ["lights", "brakes", "body"],
  ["engine", "brakes", "body"],
  ["windscreen", "brakes", "tyres"],
];

export function pickHeroScanIssues(
  previousIds: readonly string[] = [],
  random: () => number = Math.random,
): HeroScanIssue[] {
  const areas = [...SCAN_LAYOUTS[Math.floor(random() * SCAN_LAYOUTS.length)]];
  for (let index = areas.length - 1; index > 0; index--) {
    const swap = Math.floor(random() * (index + 1));
    [areas[index], areas[swap]] = [areas[swap], areas[index]];
  }
  const count = 1 + Math.floor(random() * 3);
  return areas.slice(0, count).map((area) => {
    const options = HERO_SCAN_ISSUES.filter((issue) => issue.area === area);
    const fresh = options.filter((issue) => !previousIds.includes(issue.id));
    const choices = fresh.length ? fresh : options;
    return choices[Math.floor(random() * choices.length)];
  });
}

export function heroScanTiming(area: HeroScanArea) {
  // Match the beam moving from -6% at 8% of its cycle to 106% at 78%.
  const revealAt = 0.08 + ((HERO_SCAN_AREAS[area].x + 6) / 112) * 0.7 - 0.02;
  return {
    delay: revealAt * HERO_SCAN_DURATION_MS,
    duration: (0.99 - revealAt) * HERO_SCAN_DURATION_MS,
  };
}
