"use client";

import { useEffect, useRef, useCallback, useMemo, useState } from "react";
import type { JournalEntryContext } from "@/lib/journal/types";

type SaveStatus = "idle" | "saving" | "saved" | "error";

interface JournalSheetProps {
  open: boolean;
  onClose: () => void;
  context?: JournalEntryContext;
  onSave: (content: string, context?: JournalEntryContext) => Promise<void>;
}

function formatJournalDate(): string {
  const now = new Date();
  const day = now.toLocaleDateString("en-US", { weekday: "long" });
  const month = now.toLocaleDateString("en-US", { month: "long" });
  const date = now.getDate();
  return `${day}, ${month} ${date}`;
}

export default function JournalSheet({ open, onClose, context, onSave }: JournalSheetProps) {
  const sheetRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const closeTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const bubbleTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const dateString = useMemo(() => formatJournalDate(), []);
  const [text, setText] = useState("");
  const [saveStatus, setSaveStatus] = useState<SaveStatus>("idle");
  const [showBubble, setShowBubble] = useState(false);

  const clearTimers = useCallback(() => {
    if (closeTimerRef.current) clearTimeout(closeTimerRef.current);
    if (bubbleTimerRef.current) clearTimeout(bubbleTimerRef.current);
  }, []);

  const handleClose = useCallback(() => {
    clearTimers();
    onClose();
  }, [onClose, clearTimers]);

  // Reset state when opened
  useEffect(() => {
    if (open) {
      setText("");
      setSaveStatus("idle");
      setShowBubble(false);
    }
  }, [open]);

  // Clean up timers on unmount
  useEffect(() => () => clearTimers(), [clearTimers]);

  // ESC to close (not while saving)
  useEffect(() => {
    if (!open) return;
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === "Escape" && saveStatus !== "saving") handleClose();
    };
    document.addEventListener("keydown", handleKey);
    return () => document.removeEventListener("keydown", handleKey);
  }, [open, saveStatus, handleClose]);

  // Focus textarea when opened
  useEffect(() => {
    if (open && textareaRef.current) {
      setTimeout(() => textareaRef.current?.focus(), 650);
    }
  }, [open]);

  const handleTextChange = useCallback((e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setText(e.target.value);
    setSaveStatus((prev) => (prev === "saved" || prev === "error" ? "idle" : prev));
  }, []);

  const handleSave = useCallback(async () => {
    const trimmed = text.trim();
    if (!trimmed || saveStatus === "saving") return;
    setSaveStatus("saving");
    try {
      await onSave(trimmed, context);
      setSaveStatus("saved");

      // Show the bubble immediately as the sheet begins closing
      setShowBubble(true);
      closeTimerRef.current = setTimeout(() => onClose(), 80);

      // Fade bubble out after it has had time to be noticed
      bubbleTimerRef.current = setTimeout(() => setShowBubble(false), 1200);
    } catch {
      setSaveStatus("error");
    }
  }, [text, saveStatus, context, onSave, onClose]);

  const isSaving = saveStatus === "saving";
  const canSave = text.trim().length > 0 && !isSaving;

  return (
    <>
      {/* Overlay */}
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

      {/* Sheet — has transform, so position:fixed children are re-parented to it.
          The bubble must live outside this div. */}
      <div
        ref={sheetRef}
        role="dialog"
        aria-modal="true"
        aria-label="Journal"
        className="fixed inset-x-0 bottom-0 z-50 max-w-[430px] mx-auto"
        style={{
          height: "78dvh",
          transform: open ? "translateY(0)" : "translateY(100%)",
          transition: "transform 600ms cubic-bezier(0.32, 0.72, 0, 1)",
          pointerEvents: open ? "auto" : "none",
        }}
      >
        <div
          className="h-full flex flex-col rounded-t-[20px] overflow-hidden"
          style={{
            backgroundColor: "#f7f2ea",
            boxShadow: "0 -8px 60px rgba(0, 0, 0, 0.1), 0 -2px 20px rgba(0, 0, 0, 0.04)",
          }}
        >
          {/* Drag handle */}
          <div className="flex justify-center pt-3 pb-2 flex-shrink-0">
            <div className="w-9 h-[3px] rounded-full bg-title-brown/15" />
          </div>

          {/* Header */}
          <div className="px-7 pt-2 pb-4 flex-shrink-0">
            <div className="flex items-start justify-between">
              <div>
                <h2 className="font-[family-name:var(--font-dm-serif)] text-[1.25rem] text-title-brown leading-tight">
                  A quiet note
                </h2>
                <p className="font-[family-name:var(--font-nunito)] text-[0.72rem] font-medium text-olive-muted mt-1 tracking-wide">
                  {dateString}
                </p>
              </div>
              <button
                onClick={handleClose}
                className="p-1 mt-0.5 text-olive-muted/60 hover:text-olive transition-colors duration-300"
                aria-label="Close journal"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.5"
                  className="w-[18px] h-[18px]"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            {/* Entry label + divider */}
            <div className="mt-4">
              <p className="font-[family-name:var(--font-nunito)] text-[0.6rem] font-semibold tracking-[0.18em] uppercase text-olive-muted/50 mb-2">
                Entry
              </p>
              <div className="h-px bg-olive/8" />
            </div>
          </div>

          {/* Writing area */}
          <div
            className="flex-1 mx-5 mb-4 rounded-xl overflow-hidden"
            style={{ backgroundColor: "#faf7f0" }}
          >
            <div className="h-full px-5 pt-5 pb-3 overflow-auto">
              <textarea
                ref={textareaRef}
                value={text}
                onChange={handleTextChange}
                placeholder="Write what&#39;s on your heart..."
                className="
                  w-full h-full resize-none
                  bg-transparent border-none outline-none
                  font-[family-name:var(--font-nunito)] text-[0.92rem] font-normal
                  text-title-brown/85 placeholder:text-olive-muted/40
                  leading-[1.75]
                "
                style={{
                  backgroundImage: "repeating-linear-gradient(transparent, transparent 27px, rgba(107, 127, 94, 0.06) 27px, rgba(107, 127, 94, 0.06) 28px)",
                  backgroundSize: "100% 28px",
                  backgroundPositionY: "27px",
                }}
              />
            </div>
          </div>

          {/* Footer */}
          <div className="flex items-center justify-between px-7 py-3.5 flex-shrink-0">
            <button
              onClick={handleClose}
              className="px-4 py-1.5 rounded-full font-[family-name:var(--font-nunito)] text-[0.78rem] font-medium text-olive-muted/70 hover:text-olive transition-colors duration-300"
            >
              Close
            </button>

            {/* Inline error — only shown on failure */}
            <span
              className="font-[family-name:var(--font-nunito)] text-[0.7rem] transition-opacity duration-300"
              style={{
                opacity: saveStatus === "error" ? 1 : 0,
                color: "rgba(180, 120, 100, 0.75)",
              }}
              aria-live="polite"
            >
              {saveStatus === "error" && "Couldn\u2019t save right now"}
            </span>

            <button
              onClick={handleSave}
              disabled={!canSave}
              className="px-5 py-1.5 rounded-full border border-olive/15 font-[family-name:var(--font-nunito)] text-[0.78rem] font-medium text-olive hover:bg-olive hover:text-cream hover:border-olive transition-all duration-400 disabled:opacity-30 disabled:cursor-not-allowed"
            >
              {isSaving ? "Saving\u2026" : "Save"}
            </button>
          </div>
        </div>
      </div>

      {/* Saved bubble — sibling of the sheet, outside its transform context,
          so position:fixed is relative to the viewport. */}
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
            boxShadow:
              "0 8px 40px rgba(0, 0, 0, 0.1), 0 2px 12px rgba(0, 0, 0, 0.06)",
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
