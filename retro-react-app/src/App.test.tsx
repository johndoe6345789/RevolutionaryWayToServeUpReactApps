import React from 'react';
import { render, screen } from '@testing-library/react';
import App from './App';

// Mock the string service
jest.mock('../string/string-service', () => ({
  getStringService: () => ({
    getLabel: (key: string) => key,
    getConsole: (key: string) => key,
  }),
}));

// Mock all Material-UI components and custom components
jest.mock('@mui/material/CssBaseline', () => ({
  __esModule: true,
  default: () => <div data-testid='css-baseline' />,
}));

jest.mock('@mui/material/Box', () => ({
  __esModule: true,
  default: ({ children }: any) => <div data-testid='box'>{children}</div>,
}));

jest.mock('@mui/material/Container', () => ({
  __esModule: true,
  default: ({ children }: any) => <div data-testid='container'>{children}</div>,
}));

jest.mock('@mui/material/Stack', () => ({
  __esModule: true,
  default: ({ children }: any) => <div data-testid='stack'>{children}</div>,
}));

jest.mock('@mui/material/Typography', () => ({
  __esModule: true,
  default: ({ children }: any) => <div data-testid='typography'>{children}</div>,
}));

jest.mock('@mui/material/Button', () => ({
  __esModule: true,
  default: ({ children, onClick }: any) => (
    <button data-testid='button' onClick={onClick}>
      {children}
    </button>
  ),
}));

jest.mock('@mui/material/Divider', () => ({
  __esModule: true,
  default: () => <div data-testid='divider' />,
}));

jest.mock('./components/HeroSection', () => ({
  __esModule: true,
  default: () => <div data-testid='hero-section'>Hero Section</div>,
}));

jest.mock('./components/FeaturedGames', () => ({
  __esModule: true,
  default: () => <div data-testid='featured-games'>Featured Games</div>,
}));

jest.mock('./components/FooterStrip', () => ({
  __esModule: true,
  default: () => <div data-testid='footer-strip'>Footer Strip</div>,
}));

describe('App', () => {
  it('renders without crashing', () => {
    render(<App />);

    // Just check that the app renders something
    expect(document.body).toBeInTheDocument();
  });

  it('renders the main application components', () => {
    render(<App />);

    // Check that main components are rendered
    expect(screen.getByTestId('css-baseline')).toBeInTheDocument();
    expect(screen.getByTestId('box')).toBeInTheDocument();
    expect(screen.getByTestId('container')).toBeInTheDocument();
    expect(screen.getByTestId('hero-section')).toBeInTheDocument();
    expect(screen.getByTestId('featured-games')).toBeInTheDocument();
    expect(screen.getByTestId('footer-strip')).toBeInTheDocument();
  });

  it('renders the header with title and buttons', () => {
    render(<App />);

    // Check that header elements are present
    expect(screen.getByText('retro_deck')).toBeInTheDocument();
    expect(screen.getByText('settings')).toBeInTheDocument();
    expect(screen.getByText('sync')).toBeInTheDocument();
  });
});
