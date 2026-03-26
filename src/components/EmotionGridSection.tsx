import type { EmotionSection } from "@/data/emotions";
import EmotionCard from "./EmotionCard";

interface EmotionGridSectionProps {
  section: EmotionSection;
  sectionIndex: number;
}

export default function EmotionGridSection({ section, sectionIndex }: EmotionGridSectionProps) {
  const sectionDelay = 300 + sectionIndex * 250;

  return (
    <div className="animate-reveal" style={{ animationDelay: `${sectionDelay}ms` }}>
      <p className="font-[family-name:var(--font-nunito)] text-[0.78rem] font-semibold text-olive-muted tracking-[0.1em] uppercase mb-3 text-center">
        {section.title}
      </p>

      <div className="flex flex-wrap justify-center gap-2">
        {section.emotions.map((emotion, i) => (
          <EmotionCard
            key={emotion.slug}
            emotion={emotion}
            index={sectionIndex * 6 + i}
          />
        ))}
      </div>
    </div>
  );
}
