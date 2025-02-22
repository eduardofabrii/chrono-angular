import { Component, OnInit, OnDestroy, inject } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { ProjectsService } from '../../../../services/projects/projects.service';
import { GetProjectResponse } from '../../../../models/interfaces/projects/response/GetProjectResponse';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-activities-home',
  templateUrl: './activities-home.component.html',
  styleUrls: ['./activities-home.component.scss']
})
export class ActivitiesHomeComponent implements OnInit, OnDestroy {
  public project!: GetProjectResponse;

  private projectIdSubscription!: Subscription;

  private readonly route = inject(ActivatedRoute);
  private readonly projectsService = inject(ProjectsService);

  ngOnInit(): void {
    this.subscribeToProjectId();
  }

  private subscribeToProjectId(): void {
    this.projectIdSubscription = this.route.paramMap.subscribe(params => {
      const projectId = params.get('id');
      if (projectId) {
        this.loadProject(projectId);
      } else {
        console.error('ID do projeto não encontrado');
      }
    });
  }

  private loadProject(projectId: string): void {
    this.projectsService.getProjectById(projectId).subscribe({
      next: (project) => this.project = project,
      error: (err) => console.error('Erro ao buscar projeto:', err)
    });
  }

  getProjectName(): string | undefined {
    return this.project?.name;
  }

  ngOnDestroy(): void {
    if (this.projectIdSubscription) {
      this.projectIdSubscription.unsubscribe();
    }
  }
}
