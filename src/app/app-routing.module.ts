import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

import { LoginComponent } from './modules/pages/login/login.component';
import { LayoutComponent } from './shared/layout/layout.component';
import { authGuard } from './guards/auth.guard';
import { ProjectsHomeComponent } from './modules/pages/projects/projects-home/projects-home.component';
import { ActivitiesHomeComponent } from './modules/pages/activities/page/activities-home/activities-home.component';
import { ReleaseTimeHomeComponent } from './modules/pages/release-time/page/release-time-home/release-time-home.component';
import { DashboardHomeComponent } from './modules/pages/dashboard/page/dashboard-home/dashboard-home.component';

const routes: Routes = [
  { path: '', component: LoginComponent },
  {
    path: '',
    component: LayoutComponent,
    canMatch: [authGuard],
    children: [
      { path: 'dashboard', component: DashboardHomeComponent, title: 'Chrono | Dashboard' },
      { path: 'projects', component: ProjectsHomeComponent, title: 'Chrono | Projetos'},
      { path: 'projects/activities/:id', component: ActivitiesHomeComponent, title: 'Chrono | Atividades' },
      { path: 'hours', component: ReleaseTimeHomeComponent, title: 'Chrono | Lançamento de Horas' },
    ]
  },
  { path: '**', redirectTo: 'dashboard' }
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
