import { unified } from "unified";
import remarkParse from "remark-parse";
import GithubSlugger from "github-slugger";
import { visit } from "unist-util-visit";
import type { Heading, PhrasingContent } from "mdast";

export interface HeadingItem {
  id: string;
  title: string;
  level: number;
}

const TEXT_NODES = new Set([
  "text",
  "inlineCode",
  "emphasis",
  "strong",
  "link",
  "delete",
]);

function extractTextFromChildren(children: PhrasingContent[]): string {
  return children
    .map((child) => {
      if (child.type === "text" || child.type === "inlineCode") {
        return child.value;
      }

      if (TEXT_NODES.has(child.type)) {
        return extractTextFromChildren((child as any).children ?? []);
      }

      return "";
    })
    .join(" ")
    .trim();
}

export function extractHeadings(markdown: string): HeadingItem[] {
  const tree = unified().use(remarkParse).parse(markdown);
  const slugger = new GithubSlugger();
  const headings: HeadingItem[] = [];

  visit(tree, "heading", (node: Heading) => {
    if (node.depth > 4) return;

    const title = extractTextFromChildren(node.children);
    if (!title) return;

    headings.push({
      id: slugger.slug(title),
      title,
      level: node.depth,
    });
  });

  return headings;
}
