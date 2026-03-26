"use client";

import { useState } from "react";
import { getMushafPageImageUrl } from "@/lib/quranApi";

interface MushafPageViewProps {
  pageNumber: number;
  onPageChange: (page: number) => void;
}

export default function MushafPageView({
  pageNumber,
  onPageChange,
}: MushafPageViewProps) {
  const [loading, setLoading] = useState(true);

  return (
    <div className="flex flex-col h-full">
      {/* Image area */}
      <div className="flex-1 flex items-center justify-center overflow-hidden px-2 py-3 relative">
        {loading && (
          <div className="absolute inset-0 flex items-center justify-center">
            <div
              className="w-[85%] h-[80%] rounded-xl animate-pulse"
              style={{ backgroundColor: "rgba(250, 247, 242, 0.8)" }}
            />
          </div>
        )}
        <img
          key={pageNumber}
          src={getMushafPageImageUrl(pageNumber)}
          alt={`Qur'an page ${pageNumber}`}
          className="max-h-full max-w-full object-contain"
          style={{ opacity: loading ? 0 : 1, transition: "opacity 300ms ease" }}
          onLoad={() => setLoading(false)}
          onError={() => setLoading(false)}
        />
      </div>

      {/* Prev / Next controls */}
      <div className="flex items-center justify-between px-6 py-3 flex-shrink-0">
        <button
          onClick={() => {
            if (pageNumber > 1) {
              setLoading(true);
              onPageChange(pageNumber - 1);
            }
          }}
          disabled={pageNumber <= 1}
          className="px-4 py-1.5 rounded-full border border-olive/15 font-[family-name:var(--font-nunito)] text-[0.78rem] font-medium text-olive disabled:opacity-30 disabled:cursor-not-allowed hover:bg-olive hover:text-cream transition-all duration-300"
        >
          Prev
        </button>

        <span className="font-[family-name:var(--font-nunito)] text-[0.72rem] text-olive-muted font-medium tabular-nums">
          {pageNumber} / 604
        </span>

        <button
          onClick={() => {
            if (pageNumber < 604) {
              setLoading(true);
              onPageChange(pageNumber + 1);
            }
          }}
          disabled={pageNumber >= 604}
          className="px-4 py-1.5 rounded-full border border-olive/15 font-[family-name:var(--font-nunito)] text-[0.78rem] font-medium text-olive disabled:opacity-30 disabled:cursor-not-allowed hover:bg-olive hover:text-cream transition-all duration-300"
        >
          Next
        </button>
      </div>
    </div>
  );
}
