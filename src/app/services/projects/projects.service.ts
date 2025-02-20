import { PostProjectResponse } from './../../models/interfaces/projects/response/PostProjectResponse';
import { inject, Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment.prod';
import { CookieService } from 'ngx-cookie-service';
import { GetProjectResponse } from '../../models/interfaces/projects/response/GetProjectResponse';
import { PostProjectRequest } from '../../models/interfaces/projects/request/PostProjectRequest';
import { PutProjectResponse } from '../../models/interfaces/projects/response/PutProjectResponse';
import { PutProjectRequest } from '../../models/interfaces/projects/request/PutProjectRequest';

@Injectable({
  providedIn: 'root'
})
export class ProjectsService {
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

  getAllProjects(): Observable<GetProjectResponse[]> {
    return this.http.get<GetProjectResponse[]>(`${this.API_URL}/v1/project`, this.getHttpOptions());
  }

  getProjectById(id: string): Observable<GetProjectResponse> {
    return this.http.get<GetProjectResponse>(`${this.API_URL}/v1/project/${id}`, this.getHttpOptions());
  }

  getProjectByName(name: string): Observable<GetProjectResponse> {
    return this.http.get<GetProjectResponse>(`${this.API_URL}/v1/project/name`, {
      ...this.getHttpOptions(),
      params: { name }
    });
  }

  postProject(project: PostProjectRequest): Observable<PostProjectResponse> {
    return this.http.post<PostProjectResponse>(`${this.API_URL}/v1/project`, project, this.getHttpOptions());
  }

  putProject(id: string, project: PutProjectRequest): Observable<PutProjectResponse> {
    return this.http.put<PutProjectResponse>(`${this.API_URL}/v1/project/${id}`, project, this.getHttpOptions());
  }

  deleteProject(id: string): Observable<void> {
    return this.http.delete<void>(`${this.API_URL}/v1/project/${id}`, this.getHttpOptions());
  }
}
