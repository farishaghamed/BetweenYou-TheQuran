import { findEmotion, emotions } from "@/data/emotions";
import { notFound } from "next/navigation";
import EmotionPageContent from "@/components/EmotionPageContent";

interface PageProps {
  params: Promise<{ emotionSlug: string }>;
}

export async function generateStaticParams() {
  return emotions.map((emotion) => ({
    emotionSlug: emotion.slug,
  }));
}

export async function generateMetadata({ params }: PageProps) {
  const { emotionSlug } = await params;
  const result = findEmotion(emotionSlug);
  if (!result) return { title: "Not Found" };
  return {
    title: `${result.emotion.label} | Between You & The Qur'an`,
  };
}

export default async function EmotionPage({ params }: PageProps) {
  const { emotionSlug } = await params;
  const result = findEmotion(emotionSlug);

  if (!result) notFound();

  return <EmotionPageContent emotion={result.emotion} />;
}
