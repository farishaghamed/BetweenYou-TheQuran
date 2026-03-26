"use client";

import { useEffect, useState, useCallback } from "react";
import { getPageForVerse } from "@/lib/quranApi";
import SegmentedToggle from "./SegmentedToggle";
import MushafPageView from "./MushafPageView";
import TranslationPageView from "./TranslationPageView";

interface QuranOverlayProps {
  open: boolean;
  onClose: () => void;
  verseKey?: string;
  initialPage?: number;
}

const modeOptions = [
  { value: "mushaf", label: "Mushaf" },
  { value: "translation", label: "Translation" },
];

const LAST_PAGE_KEY = "lastMushafPage";

export default function QuranOverlay({
  open,
  onClose,
  verseKey,
  initialPage,
}: QuranOverlayProps) {
  const [currentPage, setCurrentPage] = useState<number | null>(null);
  const [mode, setMode] = useState<"mushaf" | "translation">("mushaf");
  const [error, setError] = useState(false);

  const handleClose = useCallback(() => {
    onClose();
  }, [onClose]);

  // Persist last viewed page
  const handlePageChange = useCallback((page: number) => {
    setCurrentPage(page);
    try { localStorage.setItem(LAST_PAGE_KEY, String(page)); } catch {}
  }, []);

  // Resolve starting page on open
  useEffect(() => {
    if (!open) return;
    setCurrentPage(null);
    setError(false);
    setMode("mushaf");

    if (verseKey) {
      getPageForVerse(verseKey)
        .then((page) => {
          setCurrentPage(page);
          try { localStorage.setItem(LAST_PAGE_KEY, String(page)); } catch {}
        })
        .catch(() => setError(true));
    } else if (initialPage) {
      setCurrentPage(initialPage);
    } else {
      // Default: last visited page or page 1 (Al-Fatihah)
      let saved = 1;
      try {
        const raw = localStorage.getItem(LAST_PAGE_KEY);
        if (raw) saved = parseInt(raw, 10) || 1;
      } catch {}
      setCurrentPage(saved);
    }
  }, [open, verseKey, initialPage]);

  // ESC to close
  useEffect(() => {
    if (!open) return;
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") handleClose();
    };
    document.addEventListener("keydown", handleKey);
    return () => document.removeEventListener("keydown", handleKey);
  }, [open, handleClose]);

  // Body scroll lock
  useEffect(() => {
    if (open) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [open]);

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 z-40"
        style={{
          backgroundColor: "rgba(45, 45, 45, 0.3)",
          opacity: open ? 1 : 0,
          transition: "opacity 500ms ease-in-out",
          pointerEvents: open ? "auto" : "none",
        }}
        onClick={handleClose}
        aria-hidden="true"
      />

      {/* Full-screen sheet */}
      <div
        role="dialog"
        aria-modal="true"
        aria-label="Qur'an reader"
        className="fixed inset-x-0 bottom-0 z-50 max-w-[430px] mx-auto flex flex-col"
        style={{
          height: "100dvh",
          transform: open ? "translateY(0)" : "translateY(100%)",
          transition: "transform 650ms cubic-bezier(0.32, 0.72, 0, 1)",
          pointerEvents: open ? "auto" : "none",
          backgroundColor: "var(--cream)",
        }}
      >
        {/* Top bar */}
        <div className="flex-shrink-0 px-5 pt-[max(env(safe-area-inset-top),12px)] pb-2">
          <div className="flex items-center justify-between mb-2">
            {/* Close button */}
            <button
              onClick={handleClose}
              className="p-1.5 -ml-1.5 text-olive-muted/70 hover:text-olive transition-colors duration-300"
              aria-label="Close Qur'an reader"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.5"
                className="w-5 h-5"
              >
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>

            {/* Center title */}
            <div className="text-center">
              <p className="font-[family-name:var(--font-dm-serif)] text-[1rem] text-title-brown leading-tight">
                Qur&rsquo;an
              </p>
              {currentPage && (
                <p className="font-[family-name:var(--font-nunito)] text-[0.65rem] text-olive-muted font-medium mt-0.5">
                  Page {currentPage}
                </p>
              )}
            </div>

            {/* Spacer to balance close button */}
            <div className="w-5" />
          </div>

          {/* Segmented toggle */}
          <div className="flex justify-center pb-2">
            <SegmentedToggle
              value={mode}
              onChange={(v) => setMode(v as "mushaf" | "translation")}
              options={modeOptions}
            />
          </div>

          {/* Divider */}
          <div className="h-px bg-olive/8" />
        </div>

        {/* Content area */}
        <div className="flex-1 flex flex-col min-h-0">
          {error ? (
            <div className="flex-1 flex items-center justify-center px-6">
              <p className="font-[family-name:var(--font-nunito)] text-sm text-charcoal-faint text-center">
                Unable to load this page. Please try again.
              </p>
            </div>
          ) : !currentPage ? (
            <div className="flex-1 flex items-center justify-center">
              <div className="font-[family-name:var(--font-nunito)] text-sm text-olive-muted animate-pulse">
                Loading...
              </div>
            </div>
          ) : mode === "mushaf" ? (
            <MushafPageView
              pageNumber={currentPage}
              onPageChange={handlePageChange}
            />
          ) : (
            <TranslationPageView pageNumber={currentPage} />
          )}
        </div>
      </div>
    </>
  );
}
