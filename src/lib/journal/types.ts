export interface JournalEntry {
  id: string;
  content: string;
  createdAt: string;
  updatedAt: string;
  emotionSlug: string | null;
  emotionLabel: string | null;
  verseKey: string | null;
  verseArabic: string | null;
  verseTranslation: string | null;
  sourceType: "guest" | "account";
  userId: string | null;
}

export interface JournalEntryContext {
  emotionSlug?: string;
  emotionLabel?: string;
  verseKey?: string;
  verseArabic?: string;
  verseTranslation?: string;
}

export interface JournalStorage {
  load(): Promise<JournalEntry[]>;
  save(content: string, context?: JournalEntryContext): Promise<JournalEntry>;
  delete(id: string): Promise<void>;
}
