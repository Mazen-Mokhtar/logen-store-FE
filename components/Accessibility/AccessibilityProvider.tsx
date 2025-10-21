'use client';

import { createContext, useContext, useEffect, useState, ReactNode, useCallback } from 'react';

interface AccessibilitySettings {
  reducedMotion: boolean;
  highContrast: boolean;
  fontSize: 'small' | 'medium' | 'large' | 'extra-large';
  focusVisible: boolean;
  screenReaderOptimized: boolean;
}

interface AccessibilityContextType {
  settings: AccessibilitySettings;
  updateSettings: (settings: Partial<AccessibilitySettings>) => void;
  announceToScreenReader: (message: string, priority?: 'polite' | 'assertive') => void;
  setHighContrast: (enabled: boolean) => void;
  setReducedMotion: (enabled: boolean) => void;
  setFontSize: (size: 'small' | 'medium' | 'large' | 'extra-large') => void;
}

const AccessibilityContext = createContext<AccessibilityContextType | undefined>(undefined);

const defaultSettings: AccessibilitySettings = {
  reducedMotion: false,
  highContrast: false,
  fontSize: 'medium',
  focusVisible: true,
  screenReaderOptimized: false,
};

interface AccessibilityProviderProps {
  children: ReactNode;
}

export function AccessibilityProvider({ children }: AccessibilityProviderProps) {
  const [settings, setSettings] = useState<AccessibilitySettings>(defaultSettings);
  const [announcer, setAnnouncer] = useState<HTMLDivElement | null>(null);

  // Initialize settings from localStorage and system preferences
  useEffect(() => {
    const savedSettings = localStorage.getItem('accessibility-settings');
    const initialSettings = savedSettings ? JSON.parse(savedSettings) : {};

    // Check system preferences
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const prefersHighContrast = window.matchMedia('(prefers-contrast: high)').matches;

    const newSettings: AccessibilitySettings = {
      ...defaultSettings,
      ...initialSettings,
      reducedMotion: initialSettings.reducedMotion ?? prefersReducedMotion,
      highContrast: initialSettings.highContrast ?? prefersHighContrast,
    };

    setSettings(newSettings);
    applySettingsToDOM(newSettings);

    // Create screen reader announcer
    const announcerElement = document.createElement('div');
    announcerElement.setAttribute('aria-live', 'polite');
    announcerElement.setAttribute('aria-atomic', 'true');
    announcerElement.className = 'sr-only';
    document.body.appendChild(announcerElement);
    setAnnouncer(announcerElement);

    return () => {
      if (document.body.contains(announcerElement)) {
        document.body.removeChild(announcerElement);
      }
    };
  }, []);

  const applySettingsToDOM = (settings: AccessibilitySettings) => {
    const root = document.documentElement;

    // Apply CSS custom properties
    root.style.setProperty('--animation-duration', settings.reducedMotion ? '0ms' : '300ms');
    root.style.setProperty('--transition-duration', settings.reducedMotion ? '0ms' : '150ms');

    // Apply font size
    const fontSizeMap = {
      small: '14px',
      medium: '16px',
      large: '18px',
      'extra-large': '20px',
    };
    root.style.setProperty('--base-font-size', fontSizeMap[settings.fontSize]);

    // Apply classes
    root.classList.toggle('reduced-motion', settings.reducedMotion);
    root.classList.toggle('high-contrast', settings.highContrast);
    root.classList.toggle('focus-visible', settings.focusVisible);
    root.classList.toggle('screen-reader-optimized', settings.screenReaderOptimized);
  };

  const updateSettings = useCallback((newSettings: Partial<AccessibilitySettings>) => {
    setSettings((prev) => {
      const updated = { ...prev, ...newSettings };
      localStorage.setItem('accessibility-settings', JSON.stringify(updated));
      applySettingsToDOM(updated);
      return updated;
    });
  }, []);

  // Listen for system preference changes
  useEffect(() => {
    const motionMediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
    const contrastMediaQuery = window.matchMedia('(prefers-contrast: high)');

    const handleMotionChange = (e: MediaQueryListEvent) => {
      updateSettings({ reducedMotion: e.matches });
    };

    const handleContrastChange = (e: MediaQueryListEvent) => {
      updateSettings({ highContrast: e.matches });
    };

    motionMediaQuery.addEventListener('change', handleMotionChange);
    contrastMediaQuery.addEventListener('change', handleContrastChange);

    return () => {
      motionMediaQuery.removeEventListener('change', handleMotionChange);
      contrastMediaQuery.removeEventListener('change', handleContrastChange);
    };
  }, [updateSettings]);

  const announceToScreenReader = (message: string, priority: 'polite' | 'assertive' = 'polite') => {
    if (announcer) {
      announcer.setAttribute('aria-live', priority);
      announcer.textContent = message;
      
      // Clear after announcement
      setTimeout(() => {
        announcer.textContent = '';
      }, 1000);
    }
  };

  const setHighContrast = (enabled: boolean) => {
    updateSettings({ highContrast: enabled });
  };

  const setReducedMotion = (enabled: boolean) => {
    updateSettings({ reducedMotion: enabled });
  };

  const setFontSize = (size: 'small' | 'medium' | 'large' | 'extra-large') => {
    updateSettings({ fontSize: size });
  };

  return (
    <AccessibilityContext.Provider
      value={{
        settings,
        updateSettings,
        announceToScreenReader,
        setHighContrast,
        setReducedMotion,
        setFontSize,
      }}
    >
      {children}
    </AccessibilityContext.Provider>
  );
}

export function useAccessibility() {
  const context = useContext(AccessibilityContext);
  if (context === undefined) {
    throw new Error('useAccessibility must be used within an AccessibilityProvider');
  }
  return context;
}

// Hook for checking if user prefers reduced motion
export function useReducedMotion() {
  const { settings } = useAccessibility();
  return settings.reducedMotion;
}

// Hook for announcing messages to screen readers
export function useScreenReaderAnnouncer() {
  const { announceToScreenReader } = useAccessibility();
  return announceToScreenReader;
}

// Component for accessibility settings panel
export function AccessibilitySettings() {
  const { settings, updateSettings } = useAccessibility();

  return (
    <div className="accessibility-settings p-4 border rounded-lg">
      <h3 className="text-lg font-semibold mb-4">Accessibility Settings</h3>
      
      <div className="space-y-4">
        <label className="flex items-center space-x-2">
          <input
            type="checkbox"
            checked={settings.reducedMotion}
            onChange={(e) => updateSettings({ reducedMotion: e.target.checked })}
            className="rounded bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <span>Reduce motion and animations</span>
        </label>

        <label className="flex items-center space-x-2">
          <input
            type="checkbox"
            checked={settings.highContrast}
            onChange={(e) => updateSettings({ highContrast: e.target.checked })}
            className="rounded bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <span>High contrast mode</span>
        </label>

        <label className="flex items-center space-x-2">
          <input
            type="checkbox"
            checked={settings.focusVisible}
            onChange={(e) => updateSettings({ focusVisible: e.target.checked })}
            className="rounded bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <span>Show focus indicators</span>
        </label>

        <label className="flex items-center space-x-2">
          <input
            type="checkbox"
            checked={settings.screenReaderOptimized}
            onChange={(e) => updateSettings({ screenReaderOptimized: e.target.checked })}
            className="rounded bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <span>Screen reader optimizations</span>
        </label>

        <div>
          <label className="block text-sm font-medium mb-2">Font Size</label>
          <select
            value={settings.fontSize}
            onChange={(e) => updateSettings({ fontSize: e.target.value as AccessibilitySettings['fontSize'] })}
            className="w-full p-2 border rounded"
          >
            <option value="small">Small</option>
            <option value="medium">Medium</option>
            <option value="large">Large</option>
            <option value="extra-large">Extra Large</option>
          </select>
        </div>
      </div>
    </div>
  );
}