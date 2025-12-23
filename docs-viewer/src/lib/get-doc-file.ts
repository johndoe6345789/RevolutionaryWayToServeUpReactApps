import type { DocFile } from "@/types/docs";
import { DOCS_STRUCTURE } from "./docs-structure-data";

/**
 * getDocFile - Finds a specific documentation file by section and file ID
 */
export function getDocFile(
  sectionId: string,
  fileId: string,
): DocFile | undefined {
  const section = DOCS_STRUCTURE.find((s) => s.id === sectionId);
  return section?.files.find((f) => f.id === fileId);
}
