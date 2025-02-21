import { Component, inject, OnInit } from '@angular/core';
import { MenuItem } from 'primeng/api';
import { UserService } from '../../../services/user/user.service';

@Component({
  selector: 'app-side-menu',
  templateUrl: './side-menu.component.html',
  styleUrl: './side-menu.component.scss'
})
export class SideMenuComponent implements OnInit {
  username: string | null = null;
  items: MenuItem[] | undefined;
  isCollapsed = true;

  private readonly userService = inject(UserService);

  ngOnInit(): void {
    this.username = this.userService.getUsername();
  }

  toggleMenu() {
    this.isCollapsed = !this.isCollapsed;
  }
}
