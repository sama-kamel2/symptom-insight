import { useSyncExternalStore } from "react";

export interface HistoryEntry {
  id: string;
  at: string;
  symptoms: string[];
  prediction: string;
  confidence: number;
}

let entries: HistoryEntry[] = [];
const listeners = new Set<() => void>();

const emit = () => listeners.forEach((l) => l());

export function addHistory(entry: Omit<HistoryEntry, "id" | "at">) {
  entries = [
    { ...entry, id: crypto.randomUUID(), at: new Date().toISOString() },
    ...entries,
  ].slice(0, 20);
  emit();
}

export function clearHistory() {
  entries = [];
  emit();
}

export function useHistory() {
  return useSyncExternalStore(
    (l) => {
      listeners.add(l);
      return () => listeners.delete(l);
    },
    () => entries,
    () => entries,
  );
}
