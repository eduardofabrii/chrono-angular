import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';

import { MoreComponent } from './more.component';
import { SharedModule } from '../../../shared/shared.module';

@NgModule({
  declarations: [
    MoreComponent
  ],
  imports: [
    CommonModule,
    RouterModule,
    SharedModule,
  ]
})
export class MoreModule { }
