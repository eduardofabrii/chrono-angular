import { Component, OnInit } from '@angular/core';
import { MenuItem } from 'primeng/api';

@Component({
  selector: 'app-side-menu',
  templateUrl: './side-menu.component.html',
  styleUrl: './side-menu.component.scss'
})
export class SideMenuComponent  {
  items: MenuItem[] | undefined;

  isCollapsed = true;

  toggleMenu() {
    this.isCollapsed = !this.isCollapsed;
  }
}
