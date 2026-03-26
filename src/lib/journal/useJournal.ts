"use client";

import { useState, useCallback, useMemo } from "react";
import { useAuth } from "@/context/AuthContext";
import type { JournalEntry, JournalEntryContext, JournalStorage } from "./types";
import { LocalJournalStorage } from "./localStorage";
import { SupabaseJournalStorage } from "./supabaseStorage";

export interface UseJournalReturn {
  entries: JournalEntry[];
  loading: boolean;
  saving: boolean;
  reload: () => Promise<void>;
  saveEntry: (content: string, context?: JournalEntryContext) => Promise<void>;
  deleteEntry: (id: string) => Promise<void>;
}

export function useJournal(): UseJournalReturn {
  const { user } = useAuth();
  const [entries, setEntries] = useState<JournalEntry[]>([]);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);

  const storage: JournalStorage = useMemo(
    () => (user ? new SupabaseJournalStorage(user) : new LocalJournalStorage()),
    [user]
  );

  const reload = useCallback(async () => {
    setLoading(true);
    try {
      const data = await storage.load();
      setEntries(data);
    } finally {
      setLoading(false);
    }
  }, [storage]);

  const saveEntry = useCallback(
    async (content: string, context?: JournalEntryContext) => {
      setSaving(true);
      try {
        const entry = await storage.save(content, context);
        setEntries((prev) => [entry, ...prev]);
      } finally {
        setSaving(false);
      }
    },
    [storage]
  );

  const deleteEntry = useCallback(
    async (id: string) => {
      await storage.delete(id);
      setEntries((prev) => prev.filter((e) => e.id !== id));
    },
    [storage]
  );

  return { entries, loading, saving, reload, saveEntry, deleteEntry };
}
