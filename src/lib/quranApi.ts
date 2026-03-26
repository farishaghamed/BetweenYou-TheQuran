export async function getPageForVerse(verseKey: string): Promise<number> {
  const [surah, ayah] = verseKey.split(":");
  const res = await fetch(
    `https://api.alquran.cloud/v1/ayah/${surah}:${ayah}`
  );
  if (!res.ok) throw new Error("Failed to fetch verse page");
  const json = await res.json();
  return json.data.page as number;
}

export interface PageVerse {
  verseKey: string;
  surahName: string;
  text: string;
}

export async function getVersesForPage(
  pageNumber: number
): Promise<PageVerse[]> {
  const res = await fetch(
    `https://api.alquran.cloud/v1/page/${pageNumber}/en.sahih`
  );
  if (!res.ok) throw new Error("Failed to fetch page translations");
  const json = await res.json();
  return (json.data.ayahs as Array<{
    surah: { englishName: string; number: number };
    numberInSurah: number;
    text: string;
  }>).map((a) => ({
    verseKey: `${a.surah.number}:${a.numberInSurah}`,
    surahName: a.surah.englishName,
    text: a.text,
  }));
}

export function getMushafPageImageUrl(pageNumber: number): string {
  const padded = String(pageNumber).padStart(3, "0");
  return `https://www.mp3quran.net/api/quran_pages_svg/${padded}.svg`;
}
