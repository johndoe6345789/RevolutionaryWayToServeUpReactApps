import { DOCS_STRUCTURE } from "@/lib/docs-structure";

import type { DocFile } from "@/types/docs";
import type { AdjacentDocs } from "./doc-link-types";

export function getAdjacentDocs(
  sectionId: string,
  fileId: string
): AdjacentDocs {
  const orderedFiles: DocFile[] = [];

  DOCS_STRUCTURE.forEach((section) => {
    orderedFiles.push(...section.files);
  });

  const currentIndex = orderedFiles.findIndex(
    (doc) => doc.section === sectionId && doc.id === fileId
  );

  if (currentIndex === -1) {
    return {};
  }

  return {
    previous: orderedFiles[currentIndex - 1],
    next: orderedFiles[currentIndex + 1],
  };
}
