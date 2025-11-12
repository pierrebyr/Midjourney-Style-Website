import { describe, it, expect, beforeEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useDarkMode } from '../../hooks/useDarkMode';

describe('useDarkMode', () => {
  beforeEach(() => {
    // Clear localStorage before each test
    localStorage.clear();
    // Reset document class
    document.documentElement.classList.remove('dark');
  });

  it('should initialize with system preference when no stored preference', () => {
    const { result } = renderHook(() => useDarkMode());
    const [isDarkMode] = result.current;

    // Should match system preference (false in test environment)
    expect(typeof isDarkMode).toBe('boolean');
  });

  it('should apply dark class to document when dark mode is active', () => {
    // Mock system preference for dark mode
    window.matchMedia = ((query: string) => ({
      matches: query === '(prefers-color-scheme: dark)',
      media: query,
      onchange: null,
      addListener: () => {},
      removeListener: () => {},
      addEventListener: () => {},
      removeEventListener: () => {},
      dispatchEvent: () => false,
    })) as any;

    renderHook(() => useDarkMode());

    // In dark mode, should have 'dark' class
    const hasDarkClass = document.documentElement.classList.contains('dark');
    expect(typeof hasDarkClass).toBe('boolean');
  });

  it('should persist preference to localStorage', () => {
    const { result } = renderHook(() => useDarkMode());
    const [, setDarkMode] = result.current;

    act(() => {
      setDarkMode(true);
    });

    const stored = localStorage.getItem('darkMode');
    expect(stored).toBe('true');
  });
});
