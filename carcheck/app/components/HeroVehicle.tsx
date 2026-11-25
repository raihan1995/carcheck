"use client";

import Image from "next/image";
import {
  useEffect,
  useRef,
  useState,
  type CSSProperties,
  type PointerEvent,
} from "react";
import {
  HERO_SCAN_AREAS,
  HERO_SCAN_DURATION_MS,
  heroScanTiming,
  pickHeroScanIssues,
  type HeroScanIssue,
} from "@/lib/hero-scan";

export function HeroVehicle() {
  const visual = useRef<HTMLDivElement>(null);
  const frame = useRef<number | null>(null);
  const [paused, setPaused] = useState(false);
  const [imageReady, setImageReady] = useState(false);
  const previousIssues = useRef<string[]>([]);
  const [scan, setScan] = useState<{ round: number; issues: HeroScanIssue[] }>({
    round: 0,
    issues: [],
  });

  function nextScan() {
    const issues = pickHeroScanIssues(previousIssues.current);
    previousIssues.current = issues.map((issue) => issue.id);
    setScan((current) => ({ round: current.round + 1, issues }));
  }

  useEffect(() => {
    const element = visual.current;
    if (!element) return;
    const observer = new IntersectionObserver(
      ([entry]) => {
        element.dataset.offscreen = String(!entry.isIntersecting);
      },
      { rootMargin: "100px" },
    );
    observer.observe(element);
    return () => {
      observer.disconnect();
      if (frame.current !== null) cancelAnimationFrame(frame.current);
    };
  }, []);

  function resetPosition() {
    if (frame.current !== null) cancelAnimationFrame(frame.current);
    frame.current = null;
    visual.current?.style.removeProperty("--car-x");
    visual.current?.style.removeProperty("--car-y");
    visual.current?.style.removeProperty("--car-tilt");
  }

  function move(event: PointerEvent<HTMLDivElement>) {
    if (
      paused ||
      event.pointerType !== "mouse" ||
      window.matchMedia("(prefers-reduced-motion: reduce)").matches
    )
      return;
    const element = event.currentTarget;
    const bounds = element.getBoundingClientRect();
    const x = (event.clientX - bounds.left) / bounds.width - 0.5;
    const y = (event.clientY - bounds.top) / bounds.height - 0.5;
    if (frame.current !== null) cancelAnimationFrame(frame.current);
    frame.current = requestAnimationFrame(() => {
      element.style.setProperty("--car-x", `${x * 14}px`);
      element.style.setProperty("--car-y", `${y * 10}px`);
      element.style.setProperty("--car-tilt", `${x * 3}deg`);
      frame.current = null;
    });
  }

  return (
    <div
      className="hero-visual"
      ref={visual}
      data-paused={paused}
      data-ready={imageReady}
      data-scan={scan.round}
      style={
        {
          "--hero-scan-duration": `${HERO_SCAN_DURATION_MS}ms`,
        } as CSSProperties
      }
      onPointerMove={move}
      onPointerLeave={resetPosition}
    >
      <svg
        className="hero-orbits"
        viewBox="0 0 600 480"
        fill="none"
        aria-hidden="true"
        focusable="false"
      >
        <g transform="rotate(-16 300 240)">
          <ellipse
            className="hero-orbit-ring"
            cx="300"
            cy="240"
            rx="247"
            ry="174"
          />
          <ellipse
            className="hero-orbit-inner"
            cx="300"
            cy="240"
            rx="215"
            ry="150"
          />
          <ellipse
            className="hero-orbit-trace"
            cx="300"
            cy="240"
            rx="247"
            ry="174"
            pathLength="100"
          />
        </g>
        <path
          className="hero-road-line"
          d="M20 360C180 275 370 415 580 265M30 379C190 294 380 434 590 284"
        />
      </svg>
      <div className="hero-car-layer">
        <div className="hero-car-float">
          <div className="hero-car-canvas">
            <Image
              src="/img/hero-car-5-1.png"
              alt="Burnt-orange fastback car illustration"
              fill
              priority
              sizes="(max-width: 800px) calc(100vw - 40px), 562px"
              draggable={false}
              onLoad={() => {
                if (!previousIssues.current.length) nextScan();
                setImageReady(true);
              }}
            />
            {scan.issues.map((issue) => {
              const area = HERO_SCAN_AREAS[issue.area];
              const timing = heroScanTiming(issue.area);
              return (
                <div
                  key={`${scan.round}-${issue.id}`}
                  className={`hero-inspection-point${issue.tone === "warning" ? " is-warning" : ""}`}
                  data-area={issue.area}
                  data-issue={issue.id}
                  data-label-position={area.labelPosition}
                  aria-hidden="true"
                  style={
                    {
                      left: `${area.x}%`,
                      top: `${area.y}%`,
                      "--issue-delay": `${timing.delay}ms`,
                      "--issue-duration": `${timing.duration}ms`,
                    } as CSSProperties
                  }
                >
                  <span className="hero-fault-pulse" />
                  <span className="hero-fault-reticle">
                    <svg
                      width="24"
                      height="24"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="1.5"
                      aria-hidden="true"
                      focusable="false"
                    >
                      <circle cx="12" cy="12" r="6" />
                      <path d="M12 2v4M12 18v4M2 12h4M18 12h4" />
                    </svg>
                  </span>
                  <span className="hero-fault-label">{issue.label}</span>
                </div>
              );
            })}
          </div>
        </div>
      </div>
      <div
        className="hero-reveal-scan"
        aria-hidden="true"
        onAnimationIteration={(event) => {
          if (event.animationName === "hero-reveal") nextScan();
        }}
      />
      <button
        type="button"
        className="hero-motion-toggle"
        aria-label={paused ? "Resume car animation" : "Pause car animation"}
        title={paused ? "Resume animation" : "Pause animation"}
        onClick={() => {
          resetPosition();
          setPaused(!paused);
        }}
      >
        <svg
          width="18"
          height="18"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.75"
          strokeLinecap="round"
          strokeLinejoin="round"
          aria-hidden="true"
          focusable="false"
        >
          {paused ? <path d="m8 5 11 7-11 7z" /> : <path d="M8 5v14M16 5v14" />}
        </svg>
      </button>
    </div>
  );
}
