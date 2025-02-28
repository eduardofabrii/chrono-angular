import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ToolbarModule } from 'primeng/toolbar';
import { DashboardHomeComponent } from './page/dashboard-home/dashboard-home.component';



@NgModule({
  declarations: [
    DashboardHomeComponent
  ],
  imports: [
    CommonModule,
    ToolbarModule
  ]
})
export class DashboardModule { }
