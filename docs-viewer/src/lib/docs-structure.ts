import type { DocSection, DocFile } from "@/types/docs";

export const DOCS_STRUCTURE: DocSection[] = [
  {
    id: "architecture",
    title: "Architecture",
    path: "architecture",
    files: [
      {
        id: "lifecycle-builder",
        title: "Lifecycle Builder",
        path: "architecture/lifecycle-builder.md",
        section: "architecture",
      },
      {
        id: "plugin-system",
        title: "Plugin System",
        path: "architecture/plugin-system.md",
        section: "architecture",
      },
    ],
  },
  {
    id: "concepts",
    title: "Concepts",
    path: "concepts",
    files: [
      {
        id: "core-principles",
        title: "Core Principles",
        path: "concepts/core-principles.md",
        section: "concepts",
      },
      {
        id: "developer-persona",
        title: "Developer Persona",
        path: "concepts/developer-persona.md",
        section: "concepts",
      },
      {
        id: "internal-messaging-service",
        title: "Internal Messaging Service",
        path: "concepts/internal-messaging-service.md",
        section: "concepts",
      },
      {
        id: "lifetime-journey",
        title: "Lifetime Journey",
        path: "concepts/lifetime-journey.md",
        section: "concepts",
      },
      {
        id: "platform-architecture",
        title: "Platform Architecture",
        path: "concepts/platform-architecture.md",
        section: "concepts",
      },
      {
        id: "standard-lifecycle",
        title: "Standard Lifecycle",
        path: "concepts/standard-lifecycle.md",
        section: "concepts",
      },
    ],
  },
  {
    id: "interfaces",
    title: "Interfaces",
    path: "interfaces",
    files: [
      {
        id: "cli",
        title: "CLI",
        path: "interfaces/cli.md",
        section: "interfaces",
      },
      {
        id: "webui",
        title: "WebUI",
        path: "interfaces/webui.md",
        section: "interfaces",
      },
    ],
  },
  {
    id: "systems",
    title: "Systems",
    path: "systems",
    files: [
      {
        id: "i18n-system",
        title: "i18n System",
        path: "systems/i18n-system.md",
        section: "systems",
      },
      {
        id: "linting-system",
        title: "Linting System",
        path: "systems/linting-system.md",
        section: "systems",
      },
      {
        id: "security-safety",
        title: "Security & Safety",
        path: "systems/security-safety.md",
        section: "systems",
      },
      {
        id: "testing",
        title: "Testing",
        path: "systems/testing.md",
        section: "systems",
      },
      {
        id: "tooling-system",
        title: "Tooling System",
        path: "systems/tooling-system.md",
        section: "systems",
      },
    ],
  },
];

export function getAllDocFiles(): DocFile[] {
  return DOCS_STRUCTURE.flatMap((section) => section.files);
}

export function getDocFile(
  sectionId: string,
  fileId: string,
): DocFile | undefined {
  const section = DOCS_STRUCTURE.find((s) => s.id === sectionId);
  return section?.files.find((f) => f.id === fileId);
}

export function getSection(sectionId: string): DocSection | undefined {
  return DOCS_STRUCTURE.find((s) => s.id === sectionId);
}
