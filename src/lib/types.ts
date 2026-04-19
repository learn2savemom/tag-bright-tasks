// Domain types for the task manager
export interface Tag {
  id: string;
  name: string;
  /** HSL color stored as "H S% L%" string so it works directly with hsl() */
  color: string;
}

export interface Task {
  id: string;
  title: string;
  description?: string;
  /** ISO date string (YYYY-MM-DD) */
  date?: string;
  tagIds: string[];
  completed: boolean;
  createdAt: number;
}

export const IMPORTANT_TAG_ID = "tag-important";

export const DEFAULT_TAGS: Tag[] = [
  { id: IMPORTANT_TAG_ID, name: "Importante", color: "0 84% 55%" },
];

/** Curated palette (HSL triplets) for new user tags */
export const TAG_PALETTE: string[] = [
  "0 84% 55%",     // red
  "24 95% 53%",    // orange
  "45 95% 50%",    // amber
  "142 70% 42%",   // green
  "175 70% 40%",   // teal
  "200 90% 50%",   // sky
  "230 80% 60%",   // indigo
  "270 75% 60%",   // violet
  "320 75% 55%",   // pink
  "230 10% 45%",   // slate
];
