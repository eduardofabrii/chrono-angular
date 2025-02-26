import { inject, Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment.prod';
import { CookieService } from 'ngx-cookie-service';
import { GetActivityResponse } from '../../models/interfaces/activities/response/GetActivityResponse';
import { PostActivityRequest } from '../../models/interfaces/activities/request/PostActivityRequest';
import { PostActivityResponse } from '../../models/interfaces/activities/response/PostActivityResponse';
import { PutActivityRequest } from '../../models/interfaces/activities/request/PutActivityRequest';
import { PutActivityResponse } from '../../models/interfaces/activities/response/PutActivityResponse';

@Injectable({
  providedIn: 'root'
})
export class ActivitiesService {
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

  getAllActivities(): Observable<GetActivityResponse[]> {
    return this.http.get<GetActivityResponse[]>(`${this.API_URL}/v1/activity`, this.getHttpOptions());
  }

  getActivityById(id: string): Observable<GetActivityResponse> {
    return this.http.get<GetActivityResponse>(`${this.API_URL}/v1/activity/${id}`, this.getHttpOptions());
  }

  getActivitiesByProjectId(projectId: string): Observable<GetActivityResponse[]> {
    return this.http.get<GetActivityResponse[]>(`${this.API_URL}/v1/activity/project/${projectId}`);
  }

  getActivityByName(name: string): Observable<GetActivityResponse> {
    return this.http.get<GetActivityResponse>(`${this.API_URL}/v1/activity/name`, {
      ...this.getHttpOptions(),
      params: { name }
    });
  }

  getActivityByResponsibleId(userId: string): Observable<GetActivityResponse[]> {
      return this.http.get<GetActivityResponse[]>(`${this.API_URL}/v1/activity/responsible/${userId}`, this.getHttpOptions());
  }

  postActivity(activity: PostActivityRequest): Observable<PostActivityResponse> {
    return this.http.post<PostActivityResponse>(`${this.API_URL}/v1/activity`, activity, this.getHttpOptions());
  }

  putActivity(id: string, activity: PutActivityRequest): Observable<PutActivityResponse> {
    return this.http.put<PutActivityResponse>(`${this.API_URL}/v1/activity/${id}`, activity, this.getHttpOptions());
  }

  deleteActivity(id: string): Observable<void> {
    return this.http.delete<void>(`${this.API_URL}/v1/activity/${id}`, this.getHttpOptions());
  }
}
