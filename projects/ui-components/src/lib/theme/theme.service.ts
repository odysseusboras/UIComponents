import { Injectable, InjectionToken, effect, inject, signal } from '@angular/core';
import { uiStorage } from '../storage';

export type UiTheme = 'light' | 'dark';

/** localStorage key the theme is remembered under. Override to keep an existing key. */
export const UI_THEME_STORAGE_KEY = new InjectionToken<string>('UI_THEME_STORAGE_KEY', {
  providedIn: 'root',
  factory: () => 'ui.theme',
});

/**
 * Light / dark theme state. Mirrors the active theme to
 * `<html data-theme="light|dark">` (the host's stylesheet keys its dark tokens
 * off that attribute) and persists it; the first value comes from storage,
 * then from `prefers-color-scheme`.
 */
@Injectable({ providedIn: 'root' })
export class UiThemeService {
  private key = inject(UI_THEME_STORAGE_KEY);
  private _theme = signal<UiTheme>(this.initial());
  theme = this._theme.asReadonly();
  isDark = () => this._theme() === 'dark';

  constructor() {
    effect(() => {
      const t = this._theme();
      document.documentElement.setAttribute('data-theme', t);
      uiStorage.set(this.key, t);
    });
  }

  toggle(): void {
    this._theme.update(t => (t === 'dark' ? 'light' : 'dark'));
  }

  set(theme: UiTheme): void {
    this._theme.set(theme);
  }

  private initial(): UiTheme {
    const saved = uiStorage.get(this.key);
    if (saved === 'light' || saved === 'dark') return saved;
    return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
  }
}
