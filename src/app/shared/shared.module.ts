import { NgModule } from '@angular/core';
import { CommonModule, DatePipe } from '@angular/common';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';

import { SideMenuComponent } from './components/side-menu/side-menu-complete/side-menu.component';
import { ReleaseTimeComponent } from './components/side-menu/release-time/release-time.component';
import { SkeletonLoaderComponent } from './components/skeleton-loader/skeleton-loader.component';
import { BottomMenuComponent } from './components/bottom-menu/bottom-menu.component';
import { LayoutComponent } from './layout/layout.component';
import { ShortenPipe } from './pipes/shorten/shorten.pipe';

import { AvatarModule } from 'primeng/avatar';
import { StyleClassModule } from 'primeng/styleclass';
import { MenuModule } from 'primeng/menu';
import { MenubarModule } from 'primeng/menubar';
import { PanelMenuModule } from 'primeng/panelmenu';
import { SidebarModule } from 'primeng/sidebar';

import { DialogModule } from 'primeng/dialog';
import { CalendarModule } from 'primeng/calendar';
import { InputTextModule } from 'primeng/inputtext';
import { ButtonModule } from 'primeng/button';
import { ReactiveFormsModule } from '@angular/forms';
import { DropdownModule } from 'primeng/dropdown';
import { BrDateFormatPipe, BrDateOnlyPipe } from './pipes/date-format.pipe';
import { DateUtilsService } from './services/date-utils.service';

@NgModule({
  declarations: [
    SideMenuComponent,
    BottomMenuComponent,
    LayoutComponent,
    ShortenPipe,
    ReleaseTimeComponent,
    BrDateFormatPipe,
    BrDateOnlyPipe,
    SkeletonLoaderComponent,
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
    DropdownModule,
  ],
  exports: [
    LayoutComponent, ShortenPipe, BrDateFormatPipe, BrDateOnlyPipe, SkeletonLoaderComponent,
  ],
  providers: [
    DateUtilsService,
    DatePipe
  ],
})
export class SharedModule { }
