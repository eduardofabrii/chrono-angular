import { inject, Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';

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
  active: boolean;
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

  // Auth headers
  private getAuthHeaders(): HttpHeaders {
    const token = this.cookie.get('token');
    return new HttpHeaders({
      Authorization: `Bearer ${token}`
    });
  }

  auth(authRequest: AuthRequest): Observable<AuthResponse> {
    return this.http.post<AuthResponse>(`${this.API_URL}/auth/login`, authRequest);
  }

  getUsers(): Observable<UserApiResponse[]> {
    const url = `${this.API_URL}/v1/user?_=${Date.now()}`;
    return this.http.get<UserApiResponse[]>(url, { headers: this.getAuthHeaders() });
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
      ? `${this.API_URL}/v1/user/restore/${userId}`
      : `${this.API_URL}/v1/user/soft/${userId}`;

    const request = isActive
      ? this.http.put(endpoint, {}, { headers: this.getAuthHeaders(), responseType: 'text' })
      : this.http.delete(endpoint, { headers: this.getAuthHeaders(), responseType: 'text' });

    return request.pipe(
      catchError(err => throwError(() => err))
    );
  }

  getUserById(id: string): Observable<User> {
    return this.http.get<User>(
      `${this.API_URL}/v1/user/${id}`,
      { headers: this.getAuthHeaders() }
    );
  }

  putUserById(id: string, user: Partial<User>): Observable<User> {
    return this.http.put<User>(
      `${this.API_URL}/v1/user/${id}`,
      user,
      { headers: this.getAuthHeaders() }
    );
  }

  getUsersAdmin(): Observable<{ id: number, name: string, email: string }[]> {
    return this.http.get<{ id: number, name: string, email: string }[]>(
      `${this.API_URL}/v1/user/admin_users`,
      { headers: this.getAuthHeaders() }
    );
  }

  // Role
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

  isAuthenticated(): boolean {
    return Boolean(this.cookie.get('token'));
  }

  getCurrentUserId(): string | null {
    return this.getTokenValue('id');
  }

  logout(): void {
    this.cookie.delete('token');
    void this.router.navigate(['']);
  }

  // Private helper methods
  private getTokenValue(key: keyof DecodedToken): string | null {
    const token = this.cookie.get('token');
    if (!token) return null;

    try {
      const decodedToken = jwt_decode<DecodedToken>(token);
      return decodedToken[key] ? String(decodedToken[key]) : null;
    } catch {
      return null;
    }
  }
}
