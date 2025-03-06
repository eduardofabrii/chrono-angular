import { Component, inject, OnInit, ViewChild } from '@angular/core';
import { MenuItem } from 'primeng/api';
import { UserService } from '../../../../services/user/user.service';
import { Router } from '@angular/router';
import { CookieService } from 'ngx-cookie-service';
import { ReleaseTimeComponent } from '../release-time/release-time.component';

@Component({
  selector: 'app-side-menu',
  templateUrl: './side-menu.component.html',
  styleUrl: './side-menu.component.scss'
})
export class SideMenuComponent implements OnInit {
  @ViewChild(ReleaseTimeComponent) releaseTimeComponent!: ReleaseTimeComponent;
  username: string | null = null;
  items: MenuItem[] | undefined;
  isCollapsed = true;
  isMobileMenuVisible = false;
  isAdmin = false;

  private readonly userService = inject(UserService);
  private readonly router = inject(Router);
  private readonly cookie = inject(CookieService);

  ngOnInit(): void {
    this.username = this.userService.getUsername();
    this.isAdmin = this.userService.isAdmin();
  }

  toggleMenu() {
    // Mobile
    if (window.innerWidth < 768) {
      this.isMobileMenuVisible = !this.isMobileMenuVisible;
    } else {
      // PC
      this.isCollapsed = !this.isCollapsed;
    }
  }

  logout() {
    this.cookie.delete('token');
    void this.router.navigate(['']);
  }

  goToEditUser() {
    void this.router.navigate(['edit-user']);
  }

  openReleaseTimeDialog() {
    this.releaseTimeComponent.openDialog();
  }
}
