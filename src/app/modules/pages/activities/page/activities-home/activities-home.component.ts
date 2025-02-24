import { Component, OnInit, OnDestroy, inject, ViewChild } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { Subject, Subscription, takeUntil } from 'rxjs';

import { GetProjectResponse } from '../../../../../models/interfaces/projects/response/GetProjectResponse';
import { GetActivityResponse } from '../../../../../models/interfaces/activities/response/GetActivityResponse';
import { ProjectsService } from '../../../../../services/projects/projects.service';
import { ActivitiesService } from '../../../../../services/activities/activities.service';
import { ActivitiesFormComponent } from '../../components/activities-form/activities-form.component';
import { ActivitiesTableComponent } from '../../components/activities-table/activities-table.component';

@Component({
  selector: 'app-activities-home',
  templateUrl: './activities-home.component.html',
  styleUrls: ['./activities-home.component.scss']
})
export class ActivitiesHomeComponent implements OnInit, OnDestroy {
  private readonly destroy$: Subject<void> = new Subject();
  public filteredActivities: GetActivityResponse[] = [];
  public activities: GetActivityResponse[] = [];
  public project!: GetProjectResponse;
  private projectIdSubscription!: Subscription;

  private readonly route = inject(ActivatedRoute);
  private readonly projectsService = inject(ProjectsService);
  private readonly activitiesService = inject(ActivitiesService);

  @ViewChild(ActivitiesFormComponent) activitiesFormComponent!: ActivitiesFormComponent;
  @ViewChild(ActivitiesTableComponent) activitiesTableComponent!: ActivitiesTableComponent;

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
        this.filterActivities();
      }
    );
  }

  private filterActivities(): void {
    if (this.project && this.activities) {
      this.filteredActivities = this.activities.filter(
        (activity) => activity.project.id === this.project.id
      );
    }
  }

  getProjectName(): string | undefined {
    return this.project?.name;
  }

  handleActivityCreated(): void {
    this.getActivities();
  }

  handleActivityUpdated(): void {
    this.getActivities();
  }

  handleActivityDeleted(): void {
    this.getActivities();
  }

  openEditActivityDialog(activity: GetActivityResponse): void {
    this.activitiesFormComponent.openEditActivityDialog(activity);
  }

  openDeleteActivityDialog(activity: GetActivityResponse): void {
    this.activitiesFormComponent.openDeleteActivityDialog(activity);
  }

  ngOnDestroy(): void {
    if (this.projectIdSubscription) {
      this.projectIdSubscription.unsubscribe();
    }

    this.destroy$.next();
    this.destroy$.complete();
  }
}
