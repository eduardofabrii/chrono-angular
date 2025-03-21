import { inject } from '@angular/core';
import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

import { LoginComponent } from './modules/pages/login/login.component';
import { LayoutComponent } from './shared/layout/layout.component';
import { authGuard } from './guards/auth.guard';
import { ProjectsHomeComponent } from './modules/pages/projects/projects-home/projects-home.component';
import { ActivitiesHomeComponent } from './modules/pages/activities/page/activities-home/activities-home.component';
import { ReleaseTimeHomeComponent } from './modules/pages/release-time/page/release-time-home/release-time-home.component';
import { DashboardHomeComponent } from './modules/pages/dashboard/page/dashboard-home/dashboard-home.component';
import { RegisterHomeComponent } from './modules/pages/register/page/register-home/register-home.component';
import { UserService } from './services/user/user.service';
import { EditUserComponent } from './modules/pages/edit-user/page/edit-user/edit-user.component';


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
      { path: 'edit-user', component: EditUserComponent, title: 'Chrono | Editar Usuário' },
      {
        path: 'register',
        component: RegisterHomeComponent,
        title: 'Chrono | Registro de Usuários',
        canActivate: [() => {
          const userService = inject(UserService);
          return userService.isAdmin();
        }]
      },
    ]
  },
  { path: '**', redirectTo: 'dashboard' }
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
