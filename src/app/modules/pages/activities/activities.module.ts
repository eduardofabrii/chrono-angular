import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule } from '@angular/forms';

import { ActivitiesFormComponent } from './components/activities-form/activities-form.component';
import { ActivitiesHomeComponent } from './page/activities-home/activities-home.component';
import { SharedModule } from '../../../shared/shared.module';

import { DynamicDialogModule } from 'primeng/dynamicdialog';
import { DropdownModule } from 'primeng/dropdown';
import { CalendarModule } from 'primeng/calendar';
import { TabViewModule } from 'primeng/tabview';
import { ToolbarModule } from 'primeng/toolbar';
import { ButtonModule } from 'primeng/button';
import { DialogModule } from 'primeng/dialog';
import { TableModule } from 'primeng/table';
import { CardModule } from 'primeng/card';

@NgModule({
  declarations: [
    ActivitiesHomeComponent,
    ActivitiesFormComponent,
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
  ]
})
export class ActivitiesModule { }
