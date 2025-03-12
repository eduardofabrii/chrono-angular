import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { DashboardHomeComponent } from './page/dashboard-home/dashboard-home.component';
import { SharedModule } from '../../../shared/shared.module';
import { ProjectReportComponent } from '../report/project-report/project-report.component';

import { ProgressBarModule } from 'primeng/progressbar';
import { CheckboxModule } from 'primeng/checkbox';
import { ToolbarModule } from 'primeng/toolbar';
import { ButtonModule } from 'primeng/button';
import { ChartModule } from 'primeng/chart';
import { ToastModule } from 'primeng/toast';
import { CardModule } from 'primeng/card';
import { TagModule } from 'primeng/tag';
import { DropdownModule } from 'primeng/dropdown';
import { DialogModule } from 'primeng/dialog';
import { MultiSelectModule } from 'primeng/multiselect';
import { TooltipModule } from 'primeng/tooltip';
import { ProjectReportModule } from '../report/project-report.module';

@NgModule({
  declarations: [
    DashboardHomeComponent,
  ],
  imports: [
    CommonModule,
    FormsModule,

    // PrimeNG
    ToolbarModule,
    ButtonModule,
    ChartModule,
    CardModule,
    ProgressBarModule,
    TagModule,
    ToastModule,
    DropdownModule,
    DialogModule,
    MultiSelectModule,
    TooltipModule,
    CheckboxModule,

    ProjectReportModule,
    SharedModule
  ]
})
export class DashboardModule { }
