import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule } from '@angular/forms';

import { ActivitiesTableComponent } from './components/activities-table/activities-table.component';
import { ActivitiesFormComponent } from './components/activities-form/activities-form.component';
import { ActivitiesHomeComponent } from './page/activities-home/activities-home.component';
import { SharedModule } from '../../../shared/shared.module';

import { DynamicDialogModule } from 'primeng/dynamicdialog';
import { TieredMenuModule } from 'primeng/tieredmenu';
import { DropdownModule } from 'primeng/dropdown';
import { CalendarModule } from 'primeng/calendar';
import { TabViewModule } from 'primeng/tabview';
import { ToolbarModule } from 'primeng/toolbar';
import { ButtonModule } from 'primeng/button';
import { DialogModule } from 'primeng/dialog';
import { TableModule } from 'primeng/table';
import { CardModule } from 'primeng/card';
import { ToastModule } from 'primeng/toast';

@NgModule({
  declarations: [
    ActivitiesHomeComponent,
    ActivitiesFormComponent,
    ActivitiesTableComponent,
  ],
  imports: [
    CommonModule,
    SharedModule,
    ReactiveFormsModule,
    // PrimeNg
    ToolbarModule,
    TabViewModule,
    CardModule,
    TableModule,
    ButtonModule,
    DynamicDialogModule,
    DropdownModule,
    DialogModule,
    CalendarModule,
    TieredMenuModule,
    BrowserAnimationsModule,
    ToastModule,
  ]
})
export class ActivitiesModule { }
