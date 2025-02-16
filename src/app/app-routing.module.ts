import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

import { ProjectsHomeComponent } from './modules/pages/projects/components/projects-home/projects-home.component';
import { ActivitiesComponent } from './modules/pages/activities/components/activities.component';
import { LoginComponent } from './modules/pages/login/login.component';
import { LayoutComponent } from './shared/layout/layout.component';
import { authGuard } from './guards/auth.guard';

const routes: Routes = [
  { path: '', component: LoginComponent },
  {
    path: '',
    component: LayoutComponent,
    canMatch: [authGuard],
    children: [
      { path: 'projects', component: ProjectsHomeComponent },
      { path: 'activities', component: ActivitiesComponent }
    ]
  }
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
