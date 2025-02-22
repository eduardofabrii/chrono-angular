import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

import { LoginComponent } from './modules/pages/login/login.component';
import { LayoutComponent } from './shared/layout/layout.component';
import { authGuard } from './guards/auth.guard';
import { ProjectsHomeComponent } from './modules/pages/projects/projects-home/projects-home.component';
import { ActivitiesHomeComponent } from './modules/pages/activities/activities-home/activities-home.component';

const routes: Routes = [
  { path: '', component: LoginComponent },
  {
    path: '',
    component: LayoutComponent,
    canMatch: [authGuard],
    children: [
      { path: 'projects', component: ProjectsHomeComponent },
      { path: 'projects/:id/activities', component: ActivitiesHomeComponent },
    ]
  }
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
