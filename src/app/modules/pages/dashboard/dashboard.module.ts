import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { DashboardHomeComponent } from './page/dashboard-home/dashboard-home.component';
import { SharedModule } from '../../../shared/shared.module';
import { ProjectReportComponent } from '../../components/project-report/project-report.component';

import { ProgressBarModule } from 'primeng/progressbar';
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

@NgModule({
  declarations: [
    DashboardHomeComponent,
    ProjectReportComponent
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

    SharedModule
  ]
})
export class DashboardModule { }
