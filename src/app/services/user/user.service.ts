import { inject, Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

import { AuthResponse } from '../../models/interfaces/auth/AuthResponse';
import { AuthRequest } from '../../models/interfaces/auth/AuthRequest';
import { environment } from '../../../environments/environment.prod';
import { CookieService } from 'ngx-cookie-service';

@Injectable({
  providedIn: 'root'
})
export class UserService {
  private readonly API_URL = environment.API_URL;
  private readonly http = inject(HttpClient);
  private readonly cookie = inject(CookieService);

  auth(authRequest: AuthRequest): Observable<AuthResponse> {
    return this.http.post<AuthResponse>(`${this.API_URL}/auth/login`, authRequest);
  }

  // TODO: Implementar rota ou guma maneira de pegar a role de admin :)
  getUsers(): Observable<{ id: number, name: string, email: string }[]> {
    const headers = { Authorization: `Bearer ${this.cookie.get('token')}` };
    return this.http.get<{ id: number, name: string, email: string }[]>(`${this.API_URL}/v1/user`, { headers });
  }

  isAuthenticated(): boolean {
    const jwtToken = this.cookie.get('token');
    return Boolean(jwtToken);
  }
}
