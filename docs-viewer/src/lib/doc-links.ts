import { DOCS_STRUCTURE } from "@/lib/docs-structure";
import type { DocFile } from "@/types/docs";

export interface DocLinkTarget {
  sectionId: string;
  fileId: string;
  title: string;
}

export interface AdjacentDocs {
  previous?: DocFile;
  next?: DocFile;
}

export function findDocLink(label: string): DocLinkTarget | undefined {
  const normalized = label.trim().toLowerCase();

  for (const section of DOCS_STRUCTURE) {
    for (const file of section.files) {
      const titleMatch = file.title.toLowerCase() === normalized;
      const idMatch = file.id.toLowerCase() === normalized;
      const compositeMatch = `${section.title.toLowerCase()} / ${file.title.toLowerCase()}` === normalized;

      if (titleMatch || idMatch || compositeMatch) {
        return {
          sectionId: section.id,
          fileId: file.id,
          title: file.title,
        };
      }
    }
  }

  return undefined;
}

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
