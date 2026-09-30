import { Injectable, PLATFORM_ID, inject } from '@angular/core';
import { DOCUMENT, isPlatformBrowser } from '@angular/common';

/** Aplica o tema claro ou escuro conforme a preferência do sistema. */
@Injectable({ providedIn: 'root' })
export class ThemeService {
  private readonly isBrowser = isPlatformBrowser(inject(PLATFORM_ID));
  private readonly document = inject(DOCUMENT);

  init(): void {
    if (!this.isBrowser) return;
    const media = window.matchMedia('(prefers-color-scheme: dark)');
    media.addEventListener('change', () => this.apply(media.matches));
    this.apply(media.matches);
  }

  private apply(dark: boolean): void {
    this.document.documentElement.setAttribute('data-theme', dark ? 'dark' : 'light');
    this.document.querySelector('meta[name="theme-color"]')?.setAttribute('content', dark ? '#101012' : '#F5F5F7');
  }
}
