import { NgModule } from '@angular/core';
import { CommonModule, DatePipe } from '@angular/common';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';

import { SideMenuComponent } from './components/side-menu/side-menu-complete/side-menu.component';
import { SkeletonLoaderComponent } from './components/skeleton-loader/skeleton-loader.component';
import { LayoutComponent } from './layout/layout.component';
import { LogoClockComponent } from './components/logo-clock/logo-clock.component';
import { StatusChipComponent } from './components/status-chip/status-chip.component';
import { IconComponent } from './components/icon/icon.component';
import { HoursPipe } from './pipes/hours.pipe';
import { RouterModule } from '@angular/router';
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
    LayoutComponent,
    ShortenPipe,
    BrDateFormatPipe,
    BrDateOnlyPipe,
    SkeletonLoaderComponent,
    LogoClockComponent,
    StatusChipComponent,
    IconComponent,
    HoursPipe,
  ],
  imports: [
    CommonModule,
    RouterModule,
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
    LayoutComponent, ShortenPipe, BrDateFormatPipe, BrDateOnlyPipe, SkeletonLoaderComponent, LogoClockComponent, StatusChipComponent, IconComponent, HoursPipe,
  ],
  providers: [
    DateUtilsService,
    DatePipe
  ],
})
export class SharedModule { }
