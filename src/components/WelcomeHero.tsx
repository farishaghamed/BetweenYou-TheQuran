"use client";

import Link from "next/link";
import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence, LayoutGroup } from "framer-motion";
import JournalListSheet from "./JournalListSheet";
import QuranOverlay from "./QuranOverlay";
import ProfileButton from "./ProfileButton";
import AccountSheet from "./AccountSheet";

const layoutTransition = {
  duration: 0.6,
  ease: [0.25, 0.1, 0.25, 1] as [number, number, number, number],
};

export default function WelcomeHero() {
  const [phase, setPhase] = useState(0);
  const hasAnimated = useRef(false);
  const [journalOpen, setJournalOpen] = useState(false);
  const [mushafOpen, setMushafOpen] = useState(false);
  const [journalPressed, setJournalPressed] = useState(false);
  const [mushafPressed, setMushafPressed] = useState(false);
  const [accountOpen, setAccountOpen] = useState(false);

  useEffect(() => {
    if (hasAnimated.current) return;
    hasAnimated.current = true;

    // Phase 1: title + subline fade in
    setPhase(1);

    // Phase 2: CTA button enters (triggers layout shift)
    const t2 = setTimeout(() => setPhase(2), 1500);

    return () => {
      clearTimeout(t2);
    };
  }, []);

  // Secondary buttons appear ~350ms after phase 2 starts,
  // but are always in the DOM — animated via CSS only.
  const showSecondary = phase >= 2;

  return (
    <>
      <section className="h-dvh relative overflow-hidden flex items-center justify-center px-6">
        {/* Profile icon — top right */}
        <div
          className="absolute top-[max(env(safe-area-inset-top),12px)] right-4 z-20"
          style={{
            opacity: phase >= 1 ? 1 : 0,
            transition: "opacity 1s ease-in-out 0.5s",
          }}
        >
          <ProfileButton onClick={() => setAccountOpen(true)} />
        </div>

        <LayoutGroup>
          <motion.div
            layout
            transition={layoutTransition}
            className="flex flex-col items-center"
          >
            {/* ── Title group ── */}
            <motion.div layout transition={layoutTransition} className="text-center">
              <h1
                className="font-[family-name:var(--font-dm-serif)] text-[2.85rem] font-normal tracking-[0.015em] text-title-brown leading-[1.1]"
                style={{
                  opacity: phase >= 1 ? 1 : 0,
                  transition: "opacity 1.2s ease-in-out",
                }}
              >
                <span className="block">Between You &amp;</span>
                <span className="block">The Qur&rsquo;an</span>
              </h1>
              <p
                className="mt-3 text-olive-muted font-[family-name:var(--font-nunito)] text-[0.8rem] tracking-[0.18em] uppercase font-semibold"
                style={{
                  opacity: phase >= 1 ? 1 : 0,
                  transition: "opacity 1.2s ease-in-out 0.3s",
                }}
              >
                Come as you are.
              </p>
            </motion.div>

            {/* ── Spacer + CTA ──
                Only mounts at phase 2 so it takes up real layout space,
                pushing the title upward via Framer layout animation. */}
            <AnimatePresence>
              {phase >= 2 && (
                <motion.div
                  layout
                  transition={layoutTransition}
                  initial={{ opacity: 0, y: 24 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="mt-8 flex-shrink-0"
                  style={{ pointerEvents: phase >= 2 ? "auto" : "none" }}
                >
                  <Link
                    href="/carry"
                    className="group inline-flex items-center gap-2 px-7 py-3.5 font-[family-name:var(--font-nunito)] text-[0.95rem] font-semibold text-olive border border-olive/40 rounded-full hover:bg-olive hover:text-cream transition-all duration-500 ease-in-out"
                  >
                    <span>What are you seeking today?</span>
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="1.5"
                      className="w-4 h-4 transition-transform duration-500 ease-in-out group-hover:translate-x-1"
                    >
                      <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" />
                    </svg>
                  </Link>

                  {/* ── Secondary buttons ──
                      Always in the DOM (no dynamic mount), animated via CSS
                      opacity + translateY only — no layout shift. */}
                  <div
                    className="mt-5 flex items-center justify-center"
                    style={{
                      gap: "32px",
                      opacity: showSecondary ? 1 : 0,
                      transform: showSecondary ? "translateY(0)" : "translateY(12px)",
                      transition: "opacity 450ms cubic-bezier(0.22, 1, 0.36, 1) 350ms, transform 450ms cubic-bezier(0.22, 1, 0.36, 1) 350ms",
                      pointerEvents: showSecondary ? "auto" : "none",
                    }}
                  >
                    <button
                      onClick={() => setJournalOpen(true)}
                      onPointerDown={() => setJournalPressed(true)}
                      onPointerUp={() => setJournalPressed(false)}
                      onPointerLeave={() => setJournalPressed(false)}
                      className="px-5 py-2 rounded-full border border-olive/15 font-[family-name:var(--font-nunito)] text-[0.78rem] font-medium text-olive-muted hover:text-olive hover:border-olive/25 active:text-olive"
                      style={{
                        transform: journalPressed ? "scale(0.96)" : "scale(1)",
                        transition: journalPressed
                          ? "transform 120ms ease-out, color 500ms ease-in-out, border-color 500ms ease-in-out"
                          : "transform 160ms ease-out, color 500ms ease-in-out, border-color 500ms ease-in-out",
                      }}
                    >
                      Journal
                    </button>
                    <button
                      onClick={() => setMushafOpen(true)}
                      onPointerDown={() => setMushafPressed(true)}
                      onPointerUp={() => setMushafPressed(false)}
                      onPointerLeave={() => setMushafPressed(false)}
                      className="px-5 py-2 rounded-full border border-olive/15 font-[family-name:var(--font-nunito)] text-[0.78rem] font-medium text-olive-muted hover:text-olive hover:border-olive/25 active:text-olive"
                      style={{
                        transform: mushafPressed ? "scale(0.96)" : "scale(1)",
                        transition: mushafPressed
                          ? "transform 120ms ease-out, color 500ms ease-in-out, border-color 500ms ease-in-out"
                          : "transform 160ms ease-out, color 500ms ease-in-out, border-color 500ms ease-in-out",
                      }}
                    >
                      Mushaf
                    </button>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
        </LayoutGroup>

        {/* Bottom flourish */}
        <div className="absolute bottom-8 inset-x-0 flex justify-center">
          <div
            className="w-12 h-px bg-olive/20"
            style={{
              opacity: phase >= 2 ? 1 : 0,
              transition: "opacity 1s ease-in-out 0.5s",
            }}
          />
        </div>
      </section>

      {/* Journal list overlay */}
      <JournalListSheet open={journalOpen} onClose={() => setJournalOpen(false)} />

      {/* Mushaf overlay */}
      <QuranOverlay open={mushafOpen} onClose={() => setMushafOpen(false)} />

      {/* Account sheet */}
      <AccountSheet open={accountOpen} onClose={() => setAccountOpen(false)} />
    </>
  );
}
