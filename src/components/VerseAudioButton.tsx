"use client";

import { useCallback } from "react";

type AudioState = "idle" | "loading" | "playing" | "paused" | "error";

interface VerseAudioButtonProps {
  state: AudioState;
  onTap: () => void;
}

function SpinnerIcon() {
  return (
    <svg className="w-4 h-4 animate-spin" viewBox="0 0 16 16" fill="none">
      <circle
        cx="8" cy="8" r="6.5"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeDasharray="32"
        strokeDashoffset="10"
      />
    </svg>
  );
}

function SpeakerIcon() {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.5"
      className="w-4 h-4"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M19.114 5.636a9 9 0 010 12.728M16.463 8.288a5.25 5.25 0 010 7.424M6.75 8.25l4.72-4.72a.75.75 0 011.28.53v15.88a.75.75 0 01-1.28.53l-4.72-4.72H4.51c-.88 0-1.704-.507-1.938-1.354A9.01 9.01 0 012.25 12c0-.83.112-1.633.322-2.396C2.806 8.756 3.63 8.25 4.51 8.25H6.75z"
      />
    </svg>
  );
}

function PlayIcon() {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="currentColor"
      className="w-3.5 h-3.5 ml-[1px]"
    >
      <path
        fillRule="evenodd"
        d="M4.5 5.653c0-1.426 1.529-2.33 2.779-1.643l11.54 6.348c1.295.712 1.295 2.573 0 3.285L7.28 19.991c-1.25.687-2.779-.217-2.779-1.643V5.653z"
        clipRule="evenodd"
      />
    </svg>
  );
}

function PauseIcon() {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="currentColor"
      className="w-3.5 h-3.5"
    >
      <path
        fillRule="evenodd"
        d="M6.75 5.25a.75.75 0 01.75.75v12a.75.75 0 01-1.5 0V6a.75.75 0 01.75-.75zm10.5 0a.75.75 0 01.75.75v12a.75.75 0 01-1.5 0V6a.75.75 0 01.75-.75z"
        clipRule="evenodd"
      />
    </svg>
  );
}

export default function VerseAudioButton({ state, onTap }: VerseAudioButtonProps) {
  const handleClick = useCallback(
    (e: React.MouseEvent) => {
      e.stopPropagation();
      onTap();
    },
    [onTap]
  );

  const isActive = state === "playing";

  return (
    <button
      onClick={handleClick}
      aria-label={
        state === "playing" ? "Pause recitation" :
        state === "paused" ? "Resume recitation" :
        state === "loading" ? "Loading recitation" :
        "Play recitation"
      }
      className="p-1.5 rounded-full transition-all duration-300"
      style={{
        color: isActive ? "var(--olive)" : state === "error" ? "rgba(180, 100, 80, 0.6)" : "var(--olive-muted)",
        backgroundColor: isActive ? "rgba(107, 127, 94, 0.1)" : "transparent",
        opacity: state === "loading" ? 0.6 : 1,
      }}
    >
      {state === "loading" && <SpinnerIcon />}
      {state === "idle" && <SpeakerIcon />}
      {state === "playing" && <PauseIcon />}
      {state === "paused" && <PlayIcon />}
      {state === "error" && <SpeakerIcon />}
    </button>
  );
}
