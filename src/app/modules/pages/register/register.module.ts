import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RegisterHomeComponent } from './page/register-home/register-home.component';
import { ToolbarModule } from 'primeng/toolbar';



@NgModule({
  declarations: [
    RegisterHomeComponent
  ],
  imports: [
    CommonModule,

    // PrimeNg
    ToolbarModule,
  ]
})
export class RegisterModule { }
