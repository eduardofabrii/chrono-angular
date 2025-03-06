import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule } from '@angular/forms';

// PrimeNG
import { ToolbarModule } from 'primeng/toolbar';
import { InputTextModule } from 'primeng/inputtext';
import { ButtonModule } from 'primeng/button';
import { DropdownModule } from 'primeng/dropdown';
import { ToastModule } from 'primeng/toast';
import { CardModule } from 'primeng/card';
import { DividerModule } from 'primeng/divider';
import { RippleModule } from 'primeng/ripple';
import { InputGroupModule } from 'primeng/inputgroup';
import { InputGroupAddonModule } from 'primeng/inputgroupaddon';
import { TooltipModule } from 'primeng/tooltip';
import { EditUserComponent } from './page/edit-user/edit-user.component';


@NgModule({
  declarations: [
    EditUserComponent
  ],
  imports: [
    CommonModule,
    ReactiveFormsModule,
    ToolbarModule,
    InputTextModule,
    ButtonModule,
    DropdownModule,
    ToastModule,
    CardModule,
    DividerModule,
    RippleModule,
    InputGroupModule,
    InputGroupAddonModule,
    TooltipModule
  ]
})
export class EditUserModule { }
