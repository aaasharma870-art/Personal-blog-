import type { EntryOf, SectionType } from "@/lib/page";

/** Props every registered section component receives from app/page.tsx. */
export type SectionProps<K extends SectionType = SectionType> = {
  entry: EntryOf<K>;
  /** Derived "01"…"NN" when the entry is `numbered`, else undefined. */
  number?: string;
};
