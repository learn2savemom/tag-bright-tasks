import { Tag, IMPORTANT_TAG_ID } from "./types";

/** "Importante" primeiro; demais em ordem alfabética (pt-BR). */
export function compareTagsImportantFirstThenName(a: Tag, b: Tag): number {
  const aImp = a.id === IMPORTANT_TAG_ID;
  const bImp = b.id === IMPORTANT_TAG_ID;
  if (aImp !== bImp) return aImp ? -1 : 1;
  return a.name.localeCompare(b.name, "pt-BR");
}
