import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { ActivitiesFormComponent } from './components/activities-form/activities-form.component';
import { ActivitiesHomeComponent } from './page/activities-home/activities-home.component';

import { ToolbarModule } from 'primeng/toolbar';
import { TabViewModule } from 'primeng/tabview';
import { CardModule } from 'primeng/card';
import { TableModule } from 'primeng/table';
import { ButtonModule } from 'primeng/button';
import { DynamicDialogModule } from 'primeng/dynamicdialog';

@NgModule({
  declarations: [
    ActivitiesHomeComponent,
    ActivitiesFormComponent
  ],
  imports: [
    CommonModule,
    // PrimeNg
    ToolbarModule,
    TabViewModule,
    CardModule,
    TableModule,
    ButtonModule,
    DynamicDialogModule,
  ]
})
export class ActivitiesModule { }
