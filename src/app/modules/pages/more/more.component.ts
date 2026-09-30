import { Component, NgZone, OnInit, PLATFORM_ID, inject } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { Router } from '@angular/router';
import { CookieService } from 'ngx-cookie-service';
import { MessageService } from 'primeng/api';
import { UserService } from '../../../services/user/user.service';

/** Evento do navegador que permite instalar o PWA. */
interface InstallPromptEvent extends Event {
  prompt(): Promise<void>;
}

@Component({
  selector: 'app-more',
  templateUrl: './more.component.html',
  styleUrl: './more.component.scss'
})
export class MoreComponent implements OnInit {
  private readonly userService = inject(UserService);
  private readonly router = inject(Router);
  private readonly cookie = inject(CookieService);
  private readonly zone = inject(NgZone);
  private readonly messageService = inject(MessageService);
  private readonly isBrowser = isPlatformBrowser(inject(PLATFORM_ID));

  username = '';
  isAdmin = false;
  installPrompt: InstallPromptEvent | null = null;
  isInstalled = false;

  get initials(): string {
    return this.username.split(' ').filter(Boolean).slice(0, 2).map(part => part[0]).join('').toUpperCase();
  }

  ngOnInit(): void {
    this.username = this.userService.getUsername() ?? '';
    this.isAdmin = this.userService.isAdmin();
    if (this.isBrowser) {
      this.isInstalled = window.matchMedia('(display-mode: standalone)').matches;
      window.addEventListener('beforeinstallprompt', event => {
        event.preventDefault();
        this.zone.run(() => this.installPrompt = event as InstallPromptEvent);
      });
    }
  }

  async install(): Promise<void> {
    if (this.installPrompt) {
      await this.installPrompt.prompt();
      this.installPrompt = null;
      return;
    }
    this.messageService.add({
      severity: 'info',
      summary: 'Instalar o Chrono',
      detail: 'No menu do navegador, toque em Compartilhar e depois em Adicionar à Tela de Início.',
      life: 6000,
    });
  }

  logout(): void {
    this.cookie.delete('token');
    void this.router.navigate(['']);
  }
}
