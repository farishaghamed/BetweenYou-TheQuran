export interface Emotion {
  label: string;
  slug: string;
}

export interface EmotionSection {
  title: string;
  emotions: Emotion[];
}

export const emotions: Emotion[] = [
  { label: "Seeking comfort", slug: "seeking-comfort" },
  { label: "Seeking calm", slug: "seeking-calm" },
  { label: "Seeking reassurance", slug: "seeking-reassurance" },
  { label: "Seeking forgiveness", slug: "seeking-forgiveness" },
  { label: "Seeking closeness", slug: "seeking-closeness" },
  { label: "Seeking clarity", slug: "seeking-clarity" },
  { label: "Seeking strength", slug: "seeking-strength" },
];

// Single section wrapper kept for EmotionPageContent compatibility
export const emotionSections: EmotionSection[] = [
  { title: "", emotions },
];

export function findEmotion(slug: string): { emotion: Emotion; section: EmotionSection } | null {
  const section = emotionSections[0];
  const emotion = section.emotions.find((e) => e.slug === slug);
  if (emotion) return { emotion, section };
  return null;
}
