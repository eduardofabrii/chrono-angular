import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ProjectReportComponent } from './project-report/project-report.component';
import { DialogModule } from 'primeng/dialog';
import { MultiSelectModule } from 'primeng/multiselect';
import { ButtonModule } from 'primeng/button';
import { CheckboxModule } from 'primeng/checkbox';

@NgModule({
  declarations: [
    ProjectReportComponent
  ],
  imports: [
    CommonModule,
    FormsModule,
    DialogModule,
    MultiSelectModule,
    ButtonModule,
    CheckboxModule
  ],
  exports: [
    ProjectReportComponent
  ]
})
export class ProjectReportModule { }
