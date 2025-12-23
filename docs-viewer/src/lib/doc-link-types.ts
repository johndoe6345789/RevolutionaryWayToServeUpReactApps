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
