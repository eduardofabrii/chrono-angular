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
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { ShortenPipe } from './pipes/shorten/shorten.pipe';

@NgModule({
  declarations: [
    SideMenuComponent,
    BottomMenuComponent,
    LayoutComponent,
    ShortenPipe,
  ],
  imports: [
    CommonModule,
    BrowserAnimationsModule,
    // PrimeNg
    AvatarModule,
    StyleClassModule,
    MenuModule,
    MenubarModule,
    PanelMenuModule,
    SidebarModule,
  ],
  exports: [
    LayoutComponent, ShortenPipe
  ],
  providers: [],
})
export class SharedModule {}
