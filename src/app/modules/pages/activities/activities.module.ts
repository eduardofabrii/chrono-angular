import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';

import { ActivitiesFormComponent } from './components/activities-form/activities-form.component';
import { ActivitiesHomeComponent } from './page/activities-home/activities-home.component';
import { SharedModule } from '../../../shared/shared.module';

import { InputTextModule } from 'primeng/inputtext';
import { InputTextareaModule } from 'primeng/inputtextarea';
import { DropdownModule } from 'primeng/dropdown';
import { CalendarModule } from 'primeng/calendar';
import { ButtonModule } from 'primeng/button';
import { DialogModule } from 'primeng/dialog';
import { ToastModule } from 'primeng/toast';

@NgModule({
  declarations: [
    ActivitiesHomeComponent,
    ActivitiesFormComponent,
  ],
  imports: [
    CommonModule,
    RouterModule,
    SharedModule,
    FormsModule,
    ReactiveFormsModule,
    // PrimeNg
    InputTextModule,
    InputTextareaModule,
    ButtonModule,
    DropdownModule,
    DialogModule,
    CalendarModule,
    ToastModule,
  ]
})
export class ActivitiesModule { }
