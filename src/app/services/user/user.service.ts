import { inject, Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { map, Observable, of } from 'rxjs';

import { AuthResponse } from '../../models/interfaces/auth/AuthResponse';
import { AuthRequest } from '../../models/interfaces/auth/AuthRequest';
import { environment } from '../../../environments/environment.prod';
import { CookieService } from 'ngx-cookie-service';

import jwt_decode from 'jwt-decode';

interface DecodedToken {
  iss: string;
  sub: string;
  role: string;
  id: string;
  exp: number;
}

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

  getUsers(): Observable<{ id: number, name: string, email: string }[]> {
    const headers = { Authorization: `Bearer ${this.cookie.get('token')}` };
    return this.http.get<{ id: number, name: string, email: string }[]>(`${this.API_URL}/v1/user`, { headers });
  }

  getUsername(): string | null {
    const token = this.cookie.get('token');
    if (!token) return null;

    try {
      const decodedToken = jwt_decode<DecodedToken>(token);
      return decodedToken['sub'] || null;
    } catch (error) {
      console.error('Erro ao decodificar o token:', error);
      return null;
    }
  }

   // TODO: Implementar rota ou guma maneira de pegar a role de admin :)
  getRole(): string | null {
    const token = this.cookie.get('token');
    if (token) {
      try {
        const decodedToken = jwt_decode<DecodedToken>(token);
        return decodedToken['role'];
      } catch (error) {
        console.error('Erro ao decodificar o token:', error);
        return null;
      }
    }
    return null;
  }

  getUsersAdmin(): Observable<{ id: number, name: string, email: string }[]> {
    const headers = { Authorization: `Bearer ${this.cookie.get('token')}` };
    return this.http.get<{ id: number, name: string, email: string }[]>(`${this.API_URL}/v1/user/admin_users`, { headers });
  }

  isAuthenticated(): boolean {
    const jwtToken = this.cookie.get('token');
    return Boolean(jwtToken);
  }

  getCurrentUserId(): string | null {
    const token = this.cookie.get('token');

    if (!token) {
      return null;
    }

    try {
      const decodedToken = jwt_decode<DecodedToken>(token);

      if (decodedToken.id) {
        return decodedToken.id;
      } else {
        return null;
      }
    } catch (error) {
      return null;
    }
  }
}
