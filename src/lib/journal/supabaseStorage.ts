// Required Supabase table schema (run once):
//
// create table journal_entries (
//   id uuid primary key default gen_random_uuid(),
//   user_id uuid references auth.users not null,
//   content text not null,
//   emotion_slug text,
//   emotion_label text,
//   verse_key text,
//   verse_arabic text,
//   verse_translation text,
//   created_at timestamptz default now() not null,
//   updated_at timestamptz default now() not null
// );
// alter table journal_entries enable row level security;
// create policy "Users manage own entries" on journal_entries
//   for all using (auth.uid() = user_id);

import type { User } from "@supabase/supabase-js";
import { supabase } from "@/lib/supabase";
import type { JournalEntry, JournalEntryContext, JournalStorage } from "./types";

export class SupabaseJournalStorage implements JournalStorage {
  constructor(private readonly user: User) {}

  async load(): Promise<JournalEntry[]> {
    const { data, error } = await supabase
      .from("journal_entries")
      .select("*")
      .eq("user_id", this.user.id)
      .order("created_at", { ascending: false });

    if (error || !data) return [];

    return data.map((row) => ({
      id: row.id as string,
      content: (row.content ?? "") as string,
      createdAt: row.created_at as string,
      updatedAt: (row.updated_at ?? row.created_at) as string,
      emotionSlug: (row.emotion_slug ?? null) as string | null,
      emotionLabel: (row.emotion_label ?? null) as string | null,
      verseKey: (row.verse_key ?? null) as string | null,
      verseArabic: (row.verse_arabic ?? null) as string | null,
      verseTranslation: (row.verse_translation ?? null) as string | null,
      sourceType: "account" as const,
      userId: row.user_id as string,
    }));
  }

  async save(content: string, context?: JournalEntryContext): Promise<JournalEntry> {
    const { data, error } = await supabase
      .from("journal_entries")
      .insert({
        user_id: this.user.id,
        content,
        emotion_slug: context?.emotionSlug ?? null,
        emotion_label: context?.emotionLabel ?? null,
        verse_key: context?.verseKey ?? null,
        verse_arabic: context?.verseArabic ?? null,
        verse_translation: context?.verseTranslation ?? null,
      })
      .select()
      .single();

    if (error || !data) throw new Error(error?.message ?? "Failed to save entry");

    return {
      id: data.id as string,
      content: data.content as string,
      createdAt: data.created_at as string,
      updatedAt: (data.updated_at ?? data.created_at) as string,
      emotionSlug: (data.emotion_slug ?? null) as string | null,
      emotionLabel: (data.emotion_label ?? null) as string | null,
      verseKey: (data.verse_key ?? null) as string | null,
      verseArabic: (data.verse_arabic ?? null) as string | null,
      verseTranslation: (data.verse_translation ?? null) as string | null,
      sourceType: "account",
      userId: data.user_id as string,
    };
  }

  async delete(id: string): Promise<void> {
    await supabase
      .from("journal_entries")
      .delete()
      .eq("id", id)
      .eq("user_id", this.user.id);
  }
}
