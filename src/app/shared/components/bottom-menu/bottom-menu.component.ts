import { Component } from '@angular/core';
import { MenuItem } from 'primeng/api';

@Component({
  selector: 'app-bottom-menu',
  templateUrl: './bottom-menu.component.html',
  styleUrl: './bottom-menu.component.scss'
})
export class BottomMenuComponent {
  bottomMenuItems: MenuItem[] = [
    // { label: 'Perfil', icon: 'pi pi-fw pi-user', routerLink: ['/'] },
    // { label: 'Notificações', icon: 'pi pi-fw pi-bell', routerLink: ['/notificacoes'] },
    // { label: 'Ajuda', icon: 'pi pi-fw pi-question', routerLink: ['/ajuda'] }
  ];

  toggleTimer() {
    console.log("toggleTimer");
  }

  toggleFocus() {
    console.log("toggleFocus");
  }
}
