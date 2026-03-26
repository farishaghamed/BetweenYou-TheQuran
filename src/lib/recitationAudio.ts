const QF_BASE = "https://api.quran.com/api/v4";
const AUDIO_CDN = "https://verses.quran.com/";

let cachedRecitationId: number | null = null;
const audioUrlCache = new Map<string, string>();

/**
 * Resolve the recitation_id for Mishari Rashid al-`Afasy
 * from the Quran Foundation recitations list.
 */
export async function resolveMishariRecitationId(): Promise<number> {
  if (cachedRecitationId !== null) return cachedRecitationId;

  const res = await fetch(`${QF_BASE}/resources/recitations`);
  if (!res.ok) throw new Error("Failed to fetch recitations list");
  const json = await res.json();

  const entry = (json.recitations as { id: number; reciter_name: string }[]).find(
    (r) => r.reciter_name.includes("Mishari")
  );
  if (!entry) throw new Error("Mishari recitation not found");

  cachedRecitationId = entry.id;
  return entry.id;
}

/**
 * Normalize a verse key for audio.
 * Ranges like "94:5-6" become "94:5" (first ayah).
 */
export function normalizeVerseKeyForAudio(verseKey: string): string {
  const [surah, ayahPart] = verseKey.split(":");
  const firstAyah = ayahPart.split("-")[0];
  return `${surah}:${firstAyah}`;
}

/**
 * Fetch the audio URL for a specific ayah from Quran Foundation.
 */
export async function fetchAyahAudioUrl(
  verseKey: string,
  recitationId: number
): Promise<string> {
  const normalized = normalizeVerseKeyForAudio(verseKey);

  const cached = audioUrlCache.get(normalized);
  if (cached) return cached;

  const res = await fetch(
    `${QF_BASE}/recitations/${recitationId}/by_ayah/${normalized}`
  );
  if (!res.ok) throw new Error("Failed to fetch ayah audio");
  const json = await res.json();

  const files = json.audio_files as { url: string }[];
  if (!files || files.length === 0) throw new Error("No audio file found");

  const url = `${AUDIO_CDN}${files[0].url}`;
  audioUrlCache.set(normalized, url);
  return url;
}
