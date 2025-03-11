import { inject, Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { tap } from 'rxjs/operators';

import { AuthResponse } from '../../models/interfaces/auth/AuthResponse';
import { AuthRequest } from '../../models/interfaces/auth/AuthRequest';
import { environment } from '../../../environments/environment.prod';
import { CookieService } from 'ngx-cookie-service';
import { User } from '../../models/interfaces/register/User';

import jwt_decode from 'jwt-decode';
import { Router } from '@angular/router';

interface DecodedToken {
  iss: string;
  sub: string;
  role: string;
  id: string;
  exp: number;
}

interface UserApiResponse {
  id: number;
  name: string;
  email: string;
  role?: string;
  active?: boolean;
  lastLogin?: string;
}

@Injectable({
  providedIn: 'root'
})
export class UserService {
  private readonly API_URL = environment.API_URL;
  private readonly http = inject(HttpClient);
  private readonly cookie = inject(CookieService);
  private readonly router = inject(Router);

  // Helper method to get auth headers
  private getAuthHeaders(): HttpHeaders {
    return new HttpHeaders({
      Authorization: `Bearer ${this.cookie.get('token')}`
    });
  }

  auth(authRequest: AuthRequest): Observable<AuthResponse> {
    return this.http.post<AuthResponse>(`${this.API_URL}/auth/login`, authRequest);
  }

  getUsers(): Observable<UserApiResponse[]> {
    return this.http.get<UserApiResponse[]>(
      `${this.API_URL}/v1/user`,
      { headers: this.getAuthHeaders() }
    ).pipe(
      tap(users => {
        users.forEach(user => {
          console.log(`API Response - User ${user.name} (${user.id}):`, {
            active: user.active,
            lastLogin: user.lastLogin,
            role: user.role
          });
        });
      })
    );
  }

  registerUser(user: User): Observable<User> {
    return this.http.post<User>(
      `${this.API_URL}/v1/user`,
      user,
      { headers: this.getAuthHeaders() }
    );
  }

  toggleUserActiveStatus(userId: string | number, isActive: boolean): Observable<any> {
    const endpoint = isActive
      ? `${this.API_URL}/v1/user/restore/${userId}` // Activate
      : `${this.API_URL}/v1/user/soft/${userId}`;   // Deactivate

    const method = isActive
      ? this.http.put.bind(this.http)
      : this.http.delete.bind(this.http);

    return method(
      endpoint,
      isActive ? {} : null,
      {
        headers: this.getAuthHeaders(),
        responseType: 'text'
      }
    );
  }

  getUserRoles(): { label: string, value: string }[] {
    return [
      { label: 'Usuário', value: 'USER' },
      { label: 'Administrador', value: 'ADMIN' }
    ];
  }

  getUsername(): string | null {
    return this.getTokenValue('sub');
  }

  getRole(): string | null {
    return this.getTokenValue('role');
  }

  isAdmin(): boolean {
    const role = this.getRole();
    return role === 'ADMIN' || role === 'admin';
  }

  getUsersAdmin(): Observable<{ id: number, name: string, email: string }[]> {
    return this.http.get<{ id: number, name: string, email: string }[]>(
      `${this.API_URL}/v1/user/admin_users`,
      { headers: this.getAuthHeaders() }
    );
  }

  isAuthenticated(): boolean {
    return Boolean(this.cookie.get('token'));
  }

  putUserById(id: string, user: Partial<User>): Observable<User> {
    return this.http.put<User>(
      `${this.API_URL}/v1/user/${id}`,
      user,
      { headers: this.getAuthHeaders() }
    );
  }

  getUserById(id: string): Observable<User> {
    return this.http.get<User>(
      `${this.API_URL}/v1/user/${id}`,
      { headers: this.getAuthHeaders() }
    );
  }

  logout() {
    this.cookie.delete('token');
    void this.router.navigate(['']);
  }

  getCurrentUserId(): string | null {
    return this.getTokenValue('id');
  }

  // Helper to extract values from token
  private getTokenValue(key: keyof DecodedToken): string | null {
    const token = this.cookie.get('token');
    if (!token) return null;

    try {
      const decodedToken = jwt_decode<DecodedToken>(token);
      const value = decodedToken[key];
      return value ? String(value) : null;
    } catch (error) {
      return null;
    }
  }
}
