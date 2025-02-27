import { inject, Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment.prod';
import { CookieService } from 'ngx-cookie-service';
import { GetReleaseTimeResponse } from '../../models/interfaces/release-time/response/GetReleaseTimeResponse';
import { PutReleaseTimeRequest } from '../../models/interfaces/release-time/request/PutReleaseTimeRequest';
import { PutReleaseTimeResponse } from '../../models/interfaces/release-time/response/PutReleaseTimeResponse';
import { PostReleaseTimeResponse } from '../../models/interfaces/release-time/response/PostReleaseTimeResponse';
import { PostReleaseTimeRequest } from '../../models/interfaces/release-time/request/PostReleaseTimeRequest';

@Injectable({
  providedIn: 'root'
})
export class ReleaseTimeService {
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

  getAllReleaseTimes(): Observable<GetReleaseTimeResponse[]> {
    return this.http.get<GetReleaseTimeResponse[]>(`${this.API_URL}/v1/hours`, this.getHttpOptions());
  }

  getReleaseTimesByUserId(userId: string): Observable<GetReleaseTimeResponse[]> {
    return this.http.get<GetReleaseTimeResponse[]>(`${this.API_URL}/v1/hours/user/${userId}`, this.getHttpOptions());
  }

  getReleaseTimeById(id: string): Observable<GetReleaseTimeResponse> {
    return this.http.get<GetReleaseTimeResponse>(`${this.API_URL}/v1/hours/${id}`, this.getHttpOptions());
  }

  postReleaseTime(releaseTime: PostReleaseTimeRequest): Observable<PostReleaseTimeResponse> {
    return this.http.post<PostReleaseTimeResponse>(`${this.API_URL}/v1/hours`, releaseTime, this.getHttpOptions());
  }

  putReleaseTime(id: string, releaseTime: PutReleaseTimeRequest): Observable<PutReleaseTimeResponse> {
    return this.http.put<PutReleaseTimeResponse>(`${this.API_URL}/v1/hours/${id}`, releaseTime, this.getHttpOptions());
  }

  deleteReleaseTime(id: string): Observable<void> {
    return this.http.delete<void>(`${this.API_URL}/v1/hours/${id}`, this.getHttpOptions());
  }
}
