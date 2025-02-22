import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { ActivitiesHomeComponent } from './activities-home/activities-home.component';

import { ToolbarModule } from 'primeng/toolbar';
import { TabViewModule } from 'primeng/tabview';

@NgModule({
  declarations: [
    ActivitiesHomeComponent
  ],
  imports: [
    CommonModule,
    // PrimeNg
    ToolbarModule,
    TabViewModule,
  ]
})
export class ActivitiesModule { }
