import type { DocFile } from "@/types/docs";
import { DOCS_STRUCTURE } from "./docs-structure-data";

/**
 * getAllDocFiles - Returns all documentation files from all sections
 */
export function getAllDocFiles(): DocFile[] {
  return DOCS_STRUCTURE.flatMap((section) => section.files);
}
