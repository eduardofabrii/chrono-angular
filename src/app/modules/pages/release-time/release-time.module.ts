import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';

import { ReleaseTimeFormComponent } from './components/release-time-form/release-time-form.component';
import { ReleaseTimeHomeComponent } from './page/release-time-home/release-time-home.component';
import { LaunchComponent } from './page/launch/launch.component';
import { SharedModule } from '../../../shared/shared.module';

import { ToastModule } from 'primeng/toast';
import { ButtonModule } from 'primeng/button';
import { DialogModule } from 'primeng/dialog';
import { DropdownModule } from 'primeng/dropdown';
import { InputTextModule } from 'primeng/inputtext';
import { CalendarModule } from 'primeng/calendar';

@NgModule({
  declarations: [
    ReleaseTimeHomeComponent,
    ReleaseTimeFormComponent,
    LaunchComponent,
  ],
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    RouterModule,
    ToastModule,
    ButtonModule,
    DialogModule,
    DropdownModule,
    InputTextModule,
    CalendarModule,

    SharedModule
  ]
})
export class ReleaseTimeModule { }
