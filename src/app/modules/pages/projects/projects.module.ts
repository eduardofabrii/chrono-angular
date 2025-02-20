import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { CommonModule, DatePipe } from '@angular/common';
import { NgModule } from '@angular/core';

import { ProjectsHomeComponent } from './page/projects-home/projects-home.component';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { ProjectsService } from '../../../services/projects/projects.service';
import { ShortenPipe } from '../../../shared/pipes/shorten/shorten.pipe';
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

@NgModule({
  declarations: [
    ProjectsHomeComponent,
    ShortenPipe,
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
    BrowserAnimationsModule
  ],
  providers: [ProjectsService, UserService, DatePipe],
  exports: [],
})
export class ProjectsModule {}
