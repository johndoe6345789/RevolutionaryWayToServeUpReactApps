import type { DocSection } from "@/types/docs";
import { DOCS_STRUCTURE } from "./docs-structure-data";

/**
 * getSection - Finds a documentation section by ID
 */
export function getSection(sectionId: string): DocSection | undefined {
  return DOCS_STRUCTURE.find((s) => s.id === sectionId);
}
