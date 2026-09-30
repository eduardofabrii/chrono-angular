import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';

import { ReportsHomeComponent } from './reports-home/reports-home.component';
import { SharedModule } from '../../../shared/shared.module';

import { ButtonModule } from 'primeng/button';
import { CalendarModule } from 'primeng/calendar';

@NgModule({
  declarations: [
    ReportsHomeComponent
  ],
  imports: [
    CommonModule,
    FormsModule,
    RouterModule,
    SharedModule,
    ButtonModule,
    CalendarModule,
  ]
})
export class ReportsModule { }
