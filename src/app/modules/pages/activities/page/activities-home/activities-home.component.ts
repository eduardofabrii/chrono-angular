import { Component, OnInit, OnDestroy, inject } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { Subject, Subscription, takeUntil } from 'rxjs';


import { DynamicDialogRef } from 'primeng/dynamicdialog';
import { GetProjectResponse } from '../../../../../models/interfaces/projects/response/GetProjectResponse';
import { GetActivityResponse } from '../../../../../models/interfaces/activities/response/GetActivityResponse';
import { ProjectsService } from '../../../../../services/projects/projects.service';
import { ActivitiesService } from '../../../../../services/activities/activities.service';

@Component({
  selector: 'app-activities-home',
  templateUrl: './activities-home.component.html',
  styleUrls: ['./activities-home.component.scss']
})
export class ActivitiesHomeComponent implements OnInit, OnDestroy {
  private readonly destroy$: Subject<void> = new Subject();
  public project!: GetProjectResponse;
  public activities: GetActivityResponse[] = [];
  private readonly ref!: DynamicDialogRef;

  private projectIdSubscription!: Subscription;

  private readonly route = inject(ActivatedRoute);
  private readonly projectsService = inject(ProjectsService);
  private readonly activitiesService = inject(ActivitiesService);

  ngOnInit(): void {
    this.subscribeToProjectId();
    this.getActivities();
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

  private getActivities(): void {
    this.activitiesService.getAllActivities()
      .pipe(takeUntil(this.destroy$))
      .subscribe((activities) => {
        this.activities = activities;
      }
    );
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
