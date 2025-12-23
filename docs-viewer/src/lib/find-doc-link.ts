import { DOCS_STRUCTURE } from "@/lib/docs-structure";

import type { DocLinkTarget } from "./doc-link-types";

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
