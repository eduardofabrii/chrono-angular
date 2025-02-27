import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule } from '@angular/forms';

import { ReleaseTimeFormComponent } from './components/release-time-form/release-time-form.component';
import { ReleaseTimeHomeComponent } from './page/release-time-home/release-time-home.component';
import { ReleaseTimeTableComponent } from './components/release-time-table/release-time-table.component';

import { CardModule } from 'primeng/card';
import { ToastModule } from 'primeng/toast';
import { ToolbarModule } from 'primeng/toolbar';
import { ButtonModule } from 'primeng/button';
import { DialogModule } from 'primeng/dialog';
import { DropdownModule } from 'primeng/dropdown';
import { InputTextModule } from 'primeng/inputtext';
import { CalendarModule } from 'primeng/calendar';
import { TableModule } from 'primeng/table';

@NgModule({
  declarations: [
    ReleaseTimeHomeComponent,
    ReleaseTimeFormComponent,
    ReleaseTimeTableComponent,
  ],
  imports: [
    CommonModule,
    ReactiveFormsModule,
    CardModule,
    ToastModule,
    ToolbarModule,
    ButtonModule,
    DialogModule,
    DropdownModule,
    InputTextModule,
    CalendarModule,
    TableModule
  ]
})
export class ReleaseTimeModule { }
