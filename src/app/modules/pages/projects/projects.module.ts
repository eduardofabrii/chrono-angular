import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { CommonModule, DatePipe } from '@angular/common';
import { NgModule } from '@angular/core';

import { ProjectsService } from '../../../services/projects/projects.service';
import { UserService } from '../../../services/user/user.service';
import { SharedModule } from '../../../shared/shared.module';

import { InputTextModule } from 'primeng/inputtext';
import { DropdownModule } from 'primeng/dropdown';
import { CalendarModule } from 'primeng/calendar';
import { ToolbarModule } from 'primeng/toolbar';
import { MessageModule } from 'primeng/message';
import { ButtonModule } from 'primeng/button';
import { DialogModule } from 'primeng/dialog';
import { CardModule } from 'primeng/card';
import { ProjectsHomeComponent } from './projects-home/projects-home.component';
import { ToastModule } from 'primeng/toast';
import { TooltipModule } from 'primeng/tooltip';

@NgModule({
  declarations: [
    ProjectsHomeComponent,
  ],
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    CardModule,
    ButtonModule,
    DialogModule,
    InputTextModule,
    CalendarModule,
    DropdownModule,
    ToolbarModule,
    MessageModule,
    InputTextModule,
    SharedModule,
    ToastModule,
    TooltipModule,
  ],
  providers: [ProjectsService, UserService, DatePipe],
  exports: [],
})
export class ProjectsModule {}
