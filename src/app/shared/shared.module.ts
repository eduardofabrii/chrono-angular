import { NgModule } from '@angular/core';

import { SideMenuComponent } from './components/side-menu/side-menu.component';
import { BottomMenuComponent } from './components/bottom-menu/bottom-menu.component';
import { LayoutComponent } from './layout/layout.component';

import { AvatarModule } from 'primeng/avatar';
import { StyleClassModule } from 'primeng/styleclass';
import { MenuModule } from 'primeng/menu';
import { MenubarModule } from 'primeng/menubar';
import { PanelMenuModule } from 'primeng/panelmenu';
import { SidebarModule } from 'primeng/sidebar';
import { CommonModule } from '@angular/common';

@NgModule({
  declarations: [
    SideMenuComponent,
    BottomMenuComponent,
    LayoutComponent,
  ],
  imports: [
    CommonModule,
    // PrimeNg
    AvatarModule,
    StyleClassModule,
    MenuModule,
    MenubarModule,
    PanelMenuModule,
    SidebarModule,
  ],
  exports: [
    LayoutComponent,
  ],
  providers: [],
})
export class SharedModule {}
