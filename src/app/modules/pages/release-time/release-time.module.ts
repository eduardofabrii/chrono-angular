import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReleaseTimeHomeComponent } from './page/release-time-home/release-time-home.component';
import { CardModule } from 'primeng/card';
import { ToastModule } from 'primeng/toast';
import { ToolbarModule } from 'primeng/toolbar';
import { ReleaseTimeFormComponent } from './components/release-time-form/release-time-form.component';
import { ReleaseTimeTableComponent } from './components/release-time-table/release-time-table.component';



@NgModule({
  declarations: [
    ReleaseTimeHomeComponent,
    ReleaseTimeFormComponent,
    ReleaseTimeTableComponent,
  ],
  imports: [
    CommonModule,
    CardModule,
    ToastModule,
    ToolbarModule
  ]
})
export class ReleaseTimeModule { }
