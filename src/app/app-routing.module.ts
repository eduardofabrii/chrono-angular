import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

import { LoginComponent } from './modules/pages/login/login.component';
import { LayoutComponent } from './shared/layout/layout.component';
import { authGuard } from './guards/auth.guard';
import { ProjectsHomeComponent } from './modules/pages/projects/projects-home/projects-home.component';

const routes: Routes = [
  { path: '', component: LoginComponent },
  {
    path: '',
    component: LayoutComponent,
    canMatch: [authGuard],
    children: [
      { path: 'projects', component: ProjectsHomeComponent }
    ]
  }
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
