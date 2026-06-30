"use client";

import { useCallback, useState } from "react";

const EMAIL = "support@revveal.co.uk";

export function EmailWithCopy() {
  const [copied, setCopied] = useState(false);

  const copy = useCallback(async () => {
    try {
      await navigator.clipboard.writeText(EMAIL);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 2000);
    } catch {
      setCopied(false);
    }
  }, []);

  return (
    <div className="mt-4 flex flex-wrap items-center gap-3 sm:gap-5">
      <a
        href={`mailto:${EMAIL}`}
        className="font-display text-2xl sm:text-3xl text-accent hover:text-accent-soft break-all min-w-0 transition-colors"
      >
        {EMAIL}
      </a>
      <button
        type="button"
        onClick={copy}
        aria-label={copied ? "Copied" : "Copy email address"}
        className="shrink-0 inline-flex items-center gap-1.5 rounded-md border border-hairline px-3 py-1.5 text-sm font-medium text-muted-strong hover:border-foreground/30 hover:text-foreground transition-colors touch-manipulation"
      >
        {copied ? (
          <>
            <svg className="w-4 h-4 text-emerald-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden>
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
            Copied
          </>
        ) : (
          <>
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden>
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z"
              />
            </svg>
            Copy
          </>
        )}
      </button>
    </div>
  );
}
