import { NgModule, LOCALE_ID } from '@angular/core';
import { CookieService } from 'ngx-cookie-service';
import { ReactiveFormsModule } from '@angular/forms';
import { BrowserModule } from '@angular/platform-browser';
import { HttpClientModule, provideHttpClient, withFetch } from '@angular/common/http';
import { registerLocaleData } from '@angular/common';
import localePt from '@angular/common/locales/pt';

import { LoginComponent } from './modules/pages/login/login.component';
import { AppRoutingModule } from './app-routing.module';
import { SharedModule } from './shared/shared.module';
import { AppComponent } from './app.component';

import { ButtonModule } from 'primeng/button';
import { MessageService } from 'primeng/api';
import { ToastModule } from 'primeng/toast';
import { CardModule } from 'primeng/card';
import { ProjectsModule } from './modules/pages/projects/projects.module';
import { ActivitiesModule } from './modules/pages/activities/activities.module';
import { ReleaseTimeModule } from './modules/pages/release-time/release-time.module';
import { DashboardModule } from './modules/pages/dashboard/dashboard.module';
import { RegisterModule } from './modules/pages/register/register.module';
import { EditUserModule } from './modules/pages/edit-user/edit-user.module';

// Registrar o locale pt-BR
registerLocaleData(localePt, 'pt-BR');

@NgModule({
  declarations: [
    AppComponent,
    LoginComponent,
  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    ReactiveFormsModule,
    HttpClientModule,
    SharedModule,

    // PrimeNg
    ButtonModule,
    ToastModule,
    CardModule,

    ProjectsModule,
    ActivitiesModule,
    ReleaseTimeModule,
    RegisterModule,
    EditUserModule,
],
  providers: [
    CookieService,
    MessageService,
    provideHttpClient(withFetch()),
    { provide: LOCALE_ID, useValue: 'pt-BR' }
  ],
  bootstrap: [AppComponent]
})
export class AppModule { }
