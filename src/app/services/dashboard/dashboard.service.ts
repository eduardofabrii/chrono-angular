import { HttpClient, HttpHeaders } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { CookieService } from 'ngx-cookie-service';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment.prod';
import { GetDashboardResponse } from '../../models/interfaces/dashboard/response/GetDashboardResponse';

@Injectable({
  providedIn: 'root'
})
export class DashboardService {
  private readonly cookie = inject(CookieService);
  private readonly http = inject(HttpClient);
  private readonly API_URL = environment.API_URL;

  private getHttpOptions() {
    const JWT_TOKEN = this.cookie.get('token');
    return {
      headers: new HttpHeaders({
        'Content-Type': 'application/json',
        Authorization: `Bearer ${JWT_TOKEN}`,
      }),
    };
  }

  getDashboardDatas(): Observable<GetDashboardResponse> {
    return this.http.get<GetDashboardResponse>(`${this.API_URL}/v1/dashboard`, this.getHttpOptions());
  }
}
