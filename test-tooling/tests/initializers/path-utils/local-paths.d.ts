export function isLocalModule(name: string): boolean;
export function normalizeDir(dir?: string): string;
export function makeAliasKey(name: string, baseDir?: string): string;
export function resolveLocalModuleBase(
  name: string,
  baseDir?: string,
  currentHref?: string
): string;
export function getModuleDir(filePath: string): string;
export function hasKnownExtension(path: string): boolean;
export function getCandidateLocalPaths(basePath: string): string[];
