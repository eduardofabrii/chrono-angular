import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';

// PrimeNG
import { InputTextModule } from 'primeng/inputtext';
import { ButtonModule } from 'primeng/button';

import { EditUserComponent } from './page/edit-user/edit-user.component';
import { SharedModule } from '../../../shared/shared.module';

@NgModule({
  declarations: [
    EditUserComponent
  ],
  imports: [
    CommonModule,
    ReactiveFormsModule,
    RouterModule,
    InputTextModule,
    ButtonModule,
    SharedModule,
  ]
})
export class EditUserModule { }
