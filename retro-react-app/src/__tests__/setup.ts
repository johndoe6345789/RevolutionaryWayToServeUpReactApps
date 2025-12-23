import '@testing-library/jest-dom';
import { vi } from 'vitest';

// Mock next/navigation
vi.mock('next/navigation', () => ({
  useRouter: () => ({
    push: vi.fn(),
    replace: vi.fn(),
    back: vi.fn(),
    forward: vi.fn(),
    refresh: vi.fn(),
    prefetch: vi.fn(),
  }),
  usePathname: () => '/',
  useSearchParams: () => new URLSearchParams(),
}));

// Mock next-intl
vi.mock('next-intl', () => ({
  useTranslations: (namespace?: string) => {
    const translations: Record<string, any> = {
      hero: {
        retro_gaming_hub: 'Retro Gaming Hub',
        press_start: 'Press Start',
        to_continue: 'To Continue',
        hero_description: 'Discover the ultimate retro gaming experience...',
        launch_arcade_mode: 'Launch Arcade Mode',
        browse_rom_library: 'Browse ROM Library',
        insert_coin: 'Insert Coin',
      },
      games: {
        featured_games: 'Featured Games',
        popular_games: 'Popular Games',
        all_games: 'View All Games',
      },
      games_data: {
        featured: [
          {
            id: '1',
            title: 'Super Mario Bros',
            platform: 'NES',
            year: '1985',
            description: 'Classic platformer game',
            image: '/mario.jpg',
            rating: 4.5,
          },
        ],
        systemTags: ['NES', 'SNES', 'Genesis', 'PlayStation', 'Arcade', 'DOS'],
      },
      game: {
        play: 'Play',
        description: 'Details',
      },
      settings: {
        language: 'Language',
      },
    };

    const translator = (key: string) => {
      if (namespace && translations[namespace]) {
        return translations[namespace][key] || key;
      }

      // Fallback for keys without namespace
      for (const ns of Object.values(translations)) {
        if (typeof ns === 'object' && ns[key]) {
          return ns[key];
        }
      }

      return key;
    };

    // Add the raw method for accessing raw translation objects
    translator.raw = (key: string) => {
      if (namespace && translations[namespace]) {
        return translations[namespace][key] || {};
      }
      return translations[key] || {};
    };

    return translator;
  },
  useLocale: () => 'en',
}));

// Mock next-themes
vi.mock('next-themes', () => ({
  useTheme: () => ({
    theme: 'dark',
    setTheme: vi.fn(),
    themes: ['light', 'dark', 'system'],
    systemTheme: 'dark',
  }),
  ThemeProvider: ({ children }: { children: React.ReactNode }) => children,
}));

// Mock Material-UI icons
vi.mock('@mui/icons-material', () => ({
  Brightness4: () => 'Brightness4',
  Brightness7: () => 'Brightness7',
}));

// Mock dangerouslySetInnerHTML for SVG content
Object.defineProperty(window.Element.prototype, 'innerHTML', {
  set: vi.fn(),
});
