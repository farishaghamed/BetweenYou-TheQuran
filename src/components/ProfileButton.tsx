"use client";

import { useAuth } from "@/context/AuthContext";

interface ProfileButtonProps {
  onClick: () => void;
}

export default function ProfileButton({ onClick }: ProfileButtonProps) {
  const { isGuest } = useAuth();

  return (
    <button
      onClick={onClick}
      className="relative p-1.5 text-olive-muted/50 hover:text-olive-muted transition-colors duration-400"
      aria-label="Account"
    >
      <svg
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.5"
        className="w-[18px] h-[18px]"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          d="M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.118a7.5 7.5 0 0114.998 0A17.933 17.933 0 0112 21.75c-2.676 0-5.216-.584-7.499-1.632z"
        />
      </svg>

      {/* Authenticated indicator dot */}
      {!isGuest && (
        <span
          className="absolute top-1 right-1 w-[5px] h-[5px] rounded-full bg-olive"
        />
      )}
    </button>
  );
}
