import { Component, OnInit, PLATFORM_ID, inject } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { NavigationEnd, Router } from '@angular/router';
import { filter } from 'rxjs';
import { CookieService } from 'ngx-cookie-service';
import { UserService } from '../../../../services/user/user.service';
import { TimerService } from '../../../services/timer.service';

interface MenuEntry {
  label: string;
  icon: string;
  route: string;
  queryParams?: Record<string, string>;
  adminOnly?: boolean;
}

const OPEN_KEY = 'chrono.sidebar.open';

@Component({
  selector: 'app-side-menu',
  templateUrl: './side-menu.component.html',
  styleUrl: './side-menu.component.scss'
})
export class SideMenuComponent implements OnInit {
  private readonly userService = inject(UserService);
  private readonly router = inject(Router);
  private readonly cookie = inject(CookieService);
  private readonly isBrowser = isPlatformBrowser(inject(PLATFORM_ID));
  readonly timer = inject(TimerService);

  username: string | null = null;
  isAdmin = false;
  isOpen = true;
  isGroupOpen = true;
  currentUrl = '';

  readonly entries: MenuEntry[] = [
    { label: 'Dashboard', icon: 'home', route: '/dashboard' },
    { label: 'Projetos', icon: 'folder', route: '/projects' },
    { label: 'Registro de Horas', icon: 'history', route: '/hours' },
    { label: 'Lançar Horas', icon: 'clock', route: '/hours', queryParams: { lancar: '1' } },
    { label: 'Relatórios', icon: 'chart', route: '/reports' },
    { label: 'Usuários', icon: 'user-plus', route: '/register', adminOnly: true },
  ];

  readonly tabs = [
    { label: 'Início', icon: 'home', route: '/dashboard' },
    { label: 'Projetos', icon: 'folder', route: '/projects' },
    { label: 'Lançar', icon: 'clock', route: '/launch' },
    { label: 'Horas', icon: 'history', route: '/hours' },
    { label: 'Mais', icon: 'grid', route: '/more' },
  ];

  get visibleEntries(): MenuEntry[] {
    return this.entries.filter(entry => !entry.adminOnly || this.isAdmin);
  }

  get initials(): string {
    return (this.username ?? '?')
      .split(/[\s._-]+/)
      .filter(Boolean)
      .slice(0, 2)
      .map(part => part[0].toUpperCase())
      .join('');
  }

  /** Telas acessadas pelo "Mais" continuam marcando a aba "Mais" no celular. */
  isTabActive(route: string): boolean {
    const path = this.currentUrl.split('?')[0];
    if (route === '/more') return ['/more', '/reports', '/register', '/edit-user'].includes(path);
    return path === route || path.startsWith(route + '/');
  }

  get showMiniPlayer(): boolean {
    return !this.currentUrl.startsWith('/launch');
  }

  ngOnInit(): void {
    this.username = this.userService.getUsername();
    this.isAdmin = this.userService.isAdmin();
    this.currentUrl = this.router.url;
    this.router.events
      .pipe(filter((event): event is NavigationEnd => event instanceof NavigationEnd))
      .subscribe(event => this.currentUrl = event.urlAfterRedirects);

    if (this.isBrowser) {
      try {
        this.isOpen = localStorage.getItem(OPEN_KEY) !== 'false';
      } catch {
        this.isOpen = true;
      }
    }
  }

  toggleMenu(): void {
    this.isOpen = !this.isOpen;
    if (this.isBrowser) {
      try {
        localStorage.setItem(OPEN_KEY, String(this.isOpen));
      } catch {
        // sem armazenamento: só não lembra a preferência
      }
    }
  }

  logout(): void {
    this.cookie.delete('token');
    void this.router.navigate(['']);
  }
}
