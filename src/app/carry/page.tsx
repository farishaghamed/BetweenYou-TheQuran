import Link from "next/link";
import { emotions } from "@/data/emotions";
import EmotionCard from "@/components/EmotionCard";

export const metadata = {
  title: "What are you seeking? | Between You & The Qur'an",
};

export default function CarryPage() {
  return (
    <section className="h-dvh flex flex-col px-5 pt-10 pb-6 overflow-hidden">
      {/* Back link */}
      <div className="animate-fade-in mb-4 flex-shrink-0">
        <Link
          href="/"
          className="inline-flex items-center gap-1.5 text-olive-muted hover:text-olive transition-colors duration-300 font-[family-name:var(--font-nunito)] text-sm font-medium tracking-wide"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.5"
            className="w-3.5 h-3.5"
          >
            <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 19.5L3 12m0 0l7.5-7.5M3 12h18" />
          </svg>
          Return
        </Link>
      </div>

      {/* Center wrapper */}
      <div className="flex-1 flex flex-col justify-center min-h-0" style={{ transform: "translateY(-4vh)" }}>
        {/* Heading */}
        <div className="animate-reveal text-center mb-8" style={{ animationDelay: "100ms" }}>
          <h1 className="font-[family-name:var(--font-dm-serif)] text-[1.65rem] font-normal text-title-brown tracking-[0.01em] leading-[1.15]">
            What are you seeking today?
          </h1>
        </div>

        {/* Emotion pills — flat, centered wrap */}
        <div className="flex flex-wrap justify-center gap-2.5">
          {emotions.map((emotion, i) => (
            <EmotionCard key={emotion.slug} emotion={emotion} index={i} />
          ))}
        </div>
      </div>

      {/* Bottom flourish */}
      <div className="flex justify-center flex-shrink-0">
        <div className="w-12 h-px bg-olive/20 animate-fade-in" style={{ animationDelay: "1.2s" }} />
      </div>
    </section>
  );
}
