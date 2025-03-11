import { NgModule } from '@angular/core';
import { CommonModule, DatePipe } from '@angular/common';
import { ReactiveFormsModule, FormsModule } from '@angular/forms';

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
import { DialogModule } from 'primeng/dialog';
import { TableModule } from 'primeng/table';
import { ConfirmDialogModule } from 'primeng/confirmdialog';
import { ConfirmationService } from 'primeng/api';
import { InputSwitchModule } from 'primeng/inputswitch';

import { RegisterHomeComponent } from './page/register-home/register-home.component';

@NgModule({
  declarations: [
    RegisterHomeComponent
  ],
  imports: [
    CommonModule,
    ReactiveFormsModule,
    FormsModule,
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
    TooltipModule,
    DialogModule,
    TableModule,
    ConfirmDialogModule,
    InputSwitchModule
  ],
  providers: [ConfirmationService, DatePipe]
})
export class RegisterModule { }
