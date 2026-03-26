import type { JournalEntry, JournalEntryContext, JournalStorage } from "./types";

const STORAGE_KEY = "byq_journal_v2";

function generateId(): string {
  return Date.now().toString(36) + Math.random().toString(36).slice(2, 6);
}

function readRaw(): JournalEntry[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    return JSON.parse(raw) as JournalEntry[];
  } catch {
    return [];
  }
}

export class LocalJournalStorage implements JournalStorage {
  async load(): Promise<JournalEntry[]> {
    const entries = readRaw();
    return entries.sort(
      (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );
  }

  async save(content: string, context?: JournalEntryContext): Promise<JournalEntry> {
    const now = new Date().toISOString();
    const entry: JournalEntry = {
      id: generateId(),
      content,
      createdAt: now,
      updatedAt: now,
      emotionSlug: context?.emotionSlug ?? null,
      emotionLabel: context?.emotionLabel ?? null,
      verseKey: context?.verseKey ?? null,
      verseArabic: context?.verseArabic ?? null,
      verseTranslation: context?.verseTranslation ?? null,
      sourceType: "guest",
      userId: null,
    };
    const existing = readRaw();
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify([entry, ...existing]));
    } catch {}
    return entry;
  }

  async delete(id: string): Promise<void> {
    const existing = readRaw();
    try {
      localStorage.setItem(
        STORAGE_KEY,
        JSON.stringify(existing.filter((e) => e.id !== id))
      );
    } catch {}
  }
}
