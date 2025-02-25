import { NgModule } from '@angular/core';

import { SideMenuComponent } from './components/side-menu/side-menu-complete/side-menu.component';
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
import { ReleaseTimeComponent } from './components/side-menu/release-time/release-time.component';

import { DialogModule } from 'primeng/dialog';
import { CalendarModule } from 'primeng/calendar';
import { InputTextModule } from 'primeng/inputtext';
import { ButtonModule } from 'primeng/button';
import { ReactiveFormsModule } from '@angular/forms';

@NgModule({
  declarations: [
    SideMenuComponent,
    BottomMenuComponent,
    LayoutComponent,
    ShortenPipe,
    ReleaseTimeComponent
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
    DialogModule,
    CalendarModule,
    InputTextModule,
    ButtonModule,
    ReactiveFormsModule,
  ],
  exports: [
    LayoutComponent, ShortenPipe
  ],
  providers: [],
})
export class SharedModule {}
