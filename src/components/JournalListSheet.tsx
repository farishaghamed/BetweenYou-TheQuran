"use client";

import { useEffect, useState, useCallback, useMemo, useRef } from "react";
import { useJournal } from "@/lib/journal/useJournal";
import { emotions } from "@/data/emotions";
import type { JournalEntry } from "@/lib/journal/types";
import AccountSheet from "./AccountSheet";

type SaveStatus = "idle" | "saving" | "saved" | "error";

interface JournalListSheetProps {
  open: boolean;
  onClose: () => void;
}

function formatDate(iso: string): string {
  const d = new Date(iso);
  return d.toLocaleDateString("en-US", {
    weekday: "long",
    month: "long",
    day: "numeric",
  });
}

function monthKey(iso: string): string {
  const d = new Date(iso);
  return d.toLocaleDateString("en-US", { month: "long", year: "numeric" });
}

function groupByMonth(entries: JournalEntry[]): Array<{ month: string; entries: JournalEntry[] }> {
  const groups = new Map<string, JournalEntry[]>();
  for (const entry of entries) {
    const key = monthKey(entry.createdAt);
    if (!groups.has(key)) groups.set(key, []);
    groups.get(key)!.push(entry);
  }
  return Array.from(groups.entries()).map(([month, items]) => ({ month, entries: items }));
}

export default function JournalListSheet({ open, onClose }: JournalListSheetProps) {
  const { entries, loading, reload, saveEntry } = useJournal();
  const [composing, setComposing] = useState(false);
  const [draftText, setDraftText] = useState("");
  const [saveStatus, setSaveStatus] = useState<SaveStatus>("idle");
  const [showBubble, setShowBubble] = useState(false);
  const [authOpen, setAuthOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [activeFilter, setActiveFilter] = useState<string | null>(null);
  const switchTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const bubbleTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const searchRef = useRef<HTMLInputElement>(null);

  // Load + reset when sheet opens
  useEffect(() => {
    if (open) {
      reload();
      setComposing(false);
      setDraftText("");
      setSaveStatus("idle");
      setShowBubble(false);
      setSearchQuery("");
      setActiveFilter(null);
    }
  }, [open, reload]);

  // Clean up timers on unmount
  useEffect(() => {
    return () => {
      if (switchTimerRef.current) clearTimeout(switchTimerRef.current);
      if (bubbleTimerRef.current) clearTimeout(bubbleTimerRef.current);
    };
  }, []);

  // ESC handling
  useEffect(() => {
    if (!open) return;
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        if (authOpen) return;
        if (composing) { setComposing(false); return; }
        if (searchQuery) { setSearchQuery(""); return; }
        onClose();
      }
    };
    document.addEventListener("keydown", handleKey);
    return () => document.removeEventListener("keydown", handleKey);
  }, [open, composing, authOpen, searchQuery, onClose]);

  // Body scroll lock
  useEffect(() => {
    document.body.style.overflow = open ? "hidden" : "";
    return () => { document.body.style.overflow = ""; };
  }, [open]);

  // ── Save ────────────────────────────────────────────────────────────────────

  const handleSave = useCallback(async () => {
    const text = draftText.trim();
    if (!text || saveStatus === "saving") return;
    setSaveStatus("saving");
    try {
      await saveEntry(text);
      setSaveStatus("saved");
      setShowBubble(true);
      switchTimerRef.current = setTimeout(() => {
        setComposing(false);
        setDraftText("");
        setSaveStatus("idle");
      }, 100);
      bubbleTimerRef.current = setTimeout(() => setShowBubble(false), 1200);
    } catch {
      setSaveStatus("error");
    }
  }, [draftText, saveStatus, saveEntry]);

  // ── Filtering ───────────────────────────────────────────────────────────────

  const filteredEntries = useMemo(() => {
    let result = entries;

    if (activeFilter) {
      result = result.filter((e) => e.emotionSlug === activeFilter);
    }

    const q = searchQuery.trim().toLowerCase();
    if (q) {
      result = result.filter(
        (e) =>
          e.content.toLowerCase().includes(q) ||
          (e.emotionLabel?.toLowerCase() ?? "").includes(q) ||
          (e.verseKey?.toLowerCase() ?? "").includes(q)
      );
    }

    return result;
  }, [entries, activeFilter, searchQuery]);

  const grouped = useMemo(() => groupByMonth(filteredEntries), [filteredEntries]);

  const isFiltering = searchQuery.trim().length > 0 || activeFilter !== null;

  const dateString = useMemo(() => {
    const now = new Date();
    const day = now.toLocaleDateString("en-US", { weekday: "long" });
    const month = now.toLocaleDateString("en-US", { month: "long" });
    const date = now.getDate();
    return `${day}, ${month} ${date}`;
  }, []);

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
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Sheet */}
      <div
        role="dialog"
        aria-modal="true"
        aria-label="Journal"
        className="fixed inset-x-0 bottom-0 z-50 max-w-[430px] mx-auto flex flex-col"
        style={{
          height: "100dvh",
          transform: open ? "translateY(0)" : "translateY(100%)",
          transition: "transform 650ms cubic-bezier(0.32, 0.72, 0, 1)",
          pointerEvents: open ? "auto" : "none",
          backgroundColor: "var(--cream)",
        }}
      >
        {/* ── Header ── */}
        <div className="flex-shrink-0 px-6 pt-[max(env(safe-area-inset-top),12px)] pb-3">
          <div className="flex items-center justify-between mb-1">
            <button
              onClick={onClose}
              className="p-1.5 -ml-1.5 text-olive-muted/70 hover:text-olive transition-colors duration-300"
              aria-label="Close journal"
            >
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="w-5 h-5">
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>

            <p className="font-[family-name:var(--font-dm-serif)] text-[1rem] text-title-brown leading-tight">
              Journal
            </p>

            {!composing ? (
              <button
                onClick={() => { setComposing(true); setDraftText(""); }}
                className="font-[family-name:var(--font-nunito)] text-[0.75rem] font-semibold text-olive hover:text-olive/70 transition-colors duration-300"
              >
                New Entry
              </button>
            ) : (
              <div className="w-16" />
            )}
          </div>
          <div className="h-px bg-olive/8 mt-2" />
        </div>

        {/* ── Compose view ── */}
        {composing ? (
          <div className="flex-1 flex flex-col min-h-0 px-5 pb-4">
            <div className="pt-3 pb-2">
              <p className="font-[family-name:var(--font-nunito)] text-[0.72rem] font-medium text-olive-muted tracking-wide">
                {dateString}
              </p>
            </div>
            <div className="flex-1 rounded-xl overflow-hidden" style={{ backgroundColor: "#faf7f0" }}>
              <div className="h-full px-5 pt-5 pb-3 overflow-auto">
                <textarea
                  autoFocus
                  value={draftText}
                  onChange={(e) => {
                    setDraftText(e.target.value);
                    setSaveStatus((prev) => (prev === "saved" || prev === "error" ? "idle" : prev));
                  }}
                  placeholder="Write what&#39;s on your heart..."
                  className="w-full h-full resize-none bg-transparent border-none outline-none font-[family-name:var(--font-nunito)] text-[0.92rem] font-normal text-title-brown/85 placeholder:text-olive-muted/40 leading-[1.75]"
                  style={{
                    backgroundImage: "repeating-linear-gradient(transparent, transparent 27px, rgba(107, 127, 94, 0.06) 27px, rgba(107, 127, 94, 0.06) 28px)",
                    backgroundSize: "100% 28px",
                    backgroundPositionY: "27px",
                  }}
                />
              </div>
            </div>
            <div className="flex items-center justify-between pt-3">
              <button
                onClick={() => {
                  if (switchTimerRef.current) clearTimeout(switchTimerRef.current);
                  setComposing(false);
                  setSaveStatus("idle");
                }}
                className="px-4 py-1.5 rounded-full font-[family-name:var(--font-nunito)] text-[0.78rem] font-medium text-olive-muted/70 hover:text-olive transition-colors duration-300"
              >
                Cancel
              </button>
              <span
                className="font-[family-name:var(--font-nunito)] text-[0.7rem] transition-opacity duration-300"
                style={{ opacity: saveStatus === "error" ? 1 : 0, color: "rgba(180, 120, 100, 0.75)" }}
                aria-live="polite"
              >
                {saveStatus === "error" && "Couldn\u2019t save right now"}
              </span>
              <button
                onClick={handleSave}
                disabled={!draftText.trim() || saveStatus === "saving"}
                className="px-5 py-1.5 rounded-full border border-olive/15 font-[family-name:var(--font-nunito)] text-[0.78rem] font-medium text-olive hover:bg-olive hover:text-cream hover:border-olive transition-all duration-400 disabled:opacity-30 disabled:cursor-not-allowed"
              >
                {saveStatus === "saving" ? "Saving\u2026" : "Save"}
              </button>
            </div>
          </div>
        ) : (
          /* ── List view ── */
          <div className="flex-1 flex flex-col min-h-0">
            {/* Search + filter — only when entries exist or we're filtering */}
            {(entries.length > 0 || isFiltering) && (
              <div className="flex-shrink-0 px-5 pb-2">
                {/* Search bar */}
                <div className="relative mt-1 mb-3">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="1.75"
                    className="absolute left-3.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 pointer-events-none"
                    style={{ color: "rgba(107, 127, 94, 0.35)" }}
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-4.35-4.35m0 0A7.5 7.5 0 1 0 6.15 6.15a7.5 7.5 0 0 0 10.5 10.5z" />
                  </svg>
                  <input
                    ref={searchRef}
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Search entries\u2026"
                    className="w-full pl-9 pr-9 py-2 rounded-full border font-[family-name:var(--font-nunito)] text-[0.82rem] text-title-brown/85 placeholder:text-olive-muted/35 outline-none transition-colors duration-300"
                    style={{
                      backgroundColor: "rgba(250, 247, 242, 0.7)",
                      borderColor: searchQuery ? "rgba(107, 127, 94, 0.25)" : "rgba(107, 127, 94, 0.12)",
                    }}
                  />
                  {searchQuery && (
                    <button
                      onClick={() => { setSearchQuery(""); searchRef.current?.focus(); }}
                      className="absolute right-3 top-1/2 -translate-y-1/2 p-0.5 text-olive-muted/40 hover:text-olive transition-colors duration-200"
                      aria-label="Clear search"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-3.5 h-3.5">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    </button>
                  )}
                </div>

                {/* Emotion filter chips — horizontal scroll */}
                <div
                  className="-mx-5 px-5 flex gap-2 overflow-x-auto pb-2"
                  style={{ scrollbarWidth: "none", msOverflowStyle: "none" } as React.CSSProperties}
                >
                  {emotions.map((emotion) => {
                    const active = activeFilter === emotion.slug;
                    return (
                      <button
                        key={emotion.slug}
                        onClick={() => setActiveFilter(active ? null : emotion.slug)}
                        className="flex-shrink-0 px-3 py-1 rounded-full border font-[family-name:var(--font-nunito)] text-[0.72rem] font-medium transition-all duration-300"
                        style={{
                          backgroundColor: active ? "rgba(107, 127, 94, 0.9)" : "transparent",
                          borderColor: active ? "rgba(107, 127, 94, 0.9)" : "rgba(107, 127, 94, 0.18)",
                          color: active ? "#f7f2ea" : "rgba(107, 127, 94, 0.7)",
                        }}
                      >
                        {emotion.label}
                      </button>
                    );
                  })}
                </div>

                <div className="h-px bg-olive/8 mt-2" />
              </div>
            )}

            {/* Scrollable entry list */}
            <div className="flex-1 overflow-auto px-5 pb-8">
              {loading ? (
                <div className="flex items-center justify-center h-full">
                  <p className="font-[family-name:var(--font-nunito)] text-[0.82rem] text-olive-muted/50">
                    Loading\u2026
                  </p>
                </div>
              ) : entries.length === 0 ? (
                /* Truly empty — no entries at all */
                <div className="flex flex-col items-center justify-center h-full text-center px-6">
                  <p className="font-[family-name:var(--font-dm-serif)] text-[1.25rem] text-title-brown/55 mb-2">
                    Your journal is empty
                  </p>
                  <p className="font-[family-name:var(--font-nunito)] text-[0.8rem] text-olive-muted/50 leading-relaxed">
                    Reflections you write will appear here.
                  </p>
                </div>
              ) : filteredEntries.length === 0 ? (
                /* Has entries, but search/filter returned nothing */
                <div className="flex flex-col items-center justify-center h-full text-center px-6">
                  <p className="font-[family-name:var(--font-dm-serif)] text-[1.25rem] text-title-brown/55 mb-2">
                    No entries found
                  </p>
                  <p className="font-[family-name:var(--font-nunito)] text-[0.8rem] text-olive-muted/50 leading-relaxed">
                    Try a different search or clear the filter.
                  </p>
                </div>
              ) : (
                <div className="pt-4">
                  {grouped.map(({ month, entries: group }, gi) => (
                    <div key={month} className={gi > 0 ? "mt-7" : ""}>
                      {/* Month heading */}
                      <p className="font-[family-name:var(--font-nunito)] text-[0.63rem] font-semibold tracking-[0.18em] uppercase text-olive-muted/45 mb-3">
                        {month}
                      </p>

                      {/* Entry cards */}
                      <div className="space-y-2.5">
                        {group.map((entry) => (
                          <div
                            key={entry.id}
                            className="rounded-2xl border px-5 py-4"
                            style={{
                              backgroundColor: "rgba(250, 247, 242, 0.65)",
                              borderColor: "rgba(107, 127, 94, 0.1)",
                            }}
                          >
                            {/* Date */}
                            <p className="font-[family-name:var(--font-nunito)] text-[0.68rem] font-medium text-olive-muted/70 tracking-wide mb-2">
                              {formatDate(entry.createdAt)}
                            </p>

                            {/* Content preview */}
                            <p className="font-[family-name:var(--font-nunito)] text-[0.875rem] text-title-brown/80 leading-relaxed line-clamp-2">
                              {entry.content}
                            </p>

                            {/* Metadata row */}
                            {(entry.emotionLabel || entry.verseKey) && (
                              <div className="flex items-center gap-2 mt-3">
                                {entry.emotionLabel && (
                                  <span
                                    className="px-2 py-0.5 rounded-full font-[family-name:var(--font-nunito)] text-[0.6rem] font-semibold tracking-wide"
                                    style={{
                                      backgroundColor: "rgba(107, 127, 94, 0.09)",
                                      color: "rgba(107, 127, 94, 0.75)",
                                    }}
                                  >
                                    {entry.emotionLabel}
                                  </span>
                                )}
                                {entry.verseKey && (
                                  <span
                                    className="font-[family-name:var(--font-nunito)] text-[0.6rem] font-medium"
                                    style={{ color: "rgba(107, 127, 94, 0.45)" }}
                                  >
                                    {entry.verseKey}
                                  </span>
                                )}
                              </div>
                            )}
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Auth sheet */}
      <AccountSheet
        open={authOpen}
        onClose={() => setAuthOpen(false)}
        title="Save this entry"
        subtitle="Create an account or sign in to keep this journal entry and return to it later."
        footnote="Your writing will stay here while this page is open."
      />

      {/* Saved bubble — outside the sheet's transform context */}
      <div
        className="fixed inset-0 z-[60] flex items-center justify-center pointer-events-none"
        style={{
          opacity: showBubble ? 1 : 0,
          transform: showBubble ? "translateY(0px)" : "translateY(10px)",
          transition: showBubble
            ? "opacity 280ms ease-out, transform 280ms ease-out"
            : "opacity 450ms ease-in, transform 450ms ease-in",
        }}
        aria-live="polite"
        aria-atomic="true"
      >
        <div
          className="px-7 py-3.5 rounded-full"
          style={{
            backgroundColor: "#f4efe4",
            border: "1px solid rgba(107, 127, 94, 0.2)",
            boxShadow: "0 8px 40px rgba(0, 0, 0, 0.1), 0 2px 12px rgba(0, 0, 0, 0.06)",
          }}
        >
          <span className="font-[family-name:var(--font-dm-serif)] text-[1.05rem] text-title-brown tracking-[0.01em]">
            Entry saved
          </span>
        </div>
      </div>
    </>
  );
}
