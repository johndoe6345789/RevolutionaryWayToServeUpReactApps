export interface StringService {
  getLabel(key: string): string;
  getConsole(key: string): string;
}

export function getStringService(): StringService {
  return {
    getLabel: (key: string) => key,
    getConsole: (key: string) => key,
  };
}
