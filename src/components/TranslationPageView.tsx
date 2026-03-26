"use client";

import { useEffect, useState } from "react";
import { getVersesForPage, type PageVerse } from "@/lib/quranApi";

interface TranslationPageViewProps {
  pageNumber: number;
}

export default function TranslationPageView({
  pageNumber,
}: TranslationPageViewProps) {
  const [verses, setVerses] = useState<PageVerse[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setError(false);

    getVersesForPage(pageNumber)
      .then((data) => {
        if (!cancelled) {
          setVerses(data);
          setLoading(false);
        }
      })
      .catch(() => {
        if (!cancelled) {
          setError(true);
          setLoading(false);
        }
      });

    return () => {
      cancelled = true;
    };
  }, [pageNumber]);

  if (loading) {
    return (
      <div className="flex-1 flex items-center justify-center">
        <div className="font-[family-name:var(--font-nunito)] text-sm text-olive-muted animate-pulse">
          Loading translations...
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex-1 flex items-center justify-center px-6">
        <p className="font-[family-name:var(--font-nunito)] text-sm text-charcoal-faint text-center">
          Unable to load translations. Please try again.
        </p>
      </div>
    );
  }

  // Group verses by surah name
  const groups: { surahName: string; verses: PageVerse[] }[] = [];
  for (const v of verses) {
    const last = groups[groups.length - 1];
    if (last && last.surahName === v.surahName) {
      last.verses.push(v);
    } else {
      groups.push({ surahName: v.surahName, verses: [v] });
    }
  }

  return (
    <div className="flex-1 overflow-auto px-6 py-4">
      {groups.map((group) => (
        <div key={group.surahName + group.verses[0].verseKey} className="mb-6 last:mb-0">
          {groups.length > 1 && (
            <p className="font-[family-name:var(--font-nunito)] text-[0.65rem] font-semibold tracking-[0.15em] uppercase text-olive-muted/60 mb-3">
              {group.surahName}
            </p>
          )}
          {group.verses.map((v) => (
            <div key={v.verseKey} className="mb-4 last:mb-0">
              <span className="font-[family-name:var(--font-nunito)] text-[0.65rem] font-semibold text-olive-muted/50 tracking-wide">
                {v.verseKey}
              </span>
              <p className="font-[family-name:var(--font-nunito)] text-[0.88rem] text-charcoal-light leading-relaxed mt-0.5">
                {v.text}
              </p>
            </div>
          ))}
        </div>
      ))}
    </div>
  );
}
