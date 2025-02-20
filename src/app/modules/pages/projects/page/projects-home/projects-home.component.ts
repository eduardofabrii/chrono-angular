import { Component, inject, OnDestroy, OnInit } from '@angular/core';
import { Subject, takeUntil } from 'rxjs';

import { ProjectsService } from '../../../../../services/projects/projects.service';
import { GetProjectResponse } from '../../../../../models/interfaces/projects/response/GetProjectResponse';

@Component({
  selector: 'app-projects-home',
  templateUrl: './projects-home.component.html',
  styleUrls: ['./projects-home.component.scss']
})
export class ProjectsHomeComponent implements OnInit, OnDestroy {
  private readonly destroy$ = new Subject<void>();
  public projects: GetProjectResponse[] = [];
  public filteredProjects: GetProjectResponse[] = [];
  public selectedProject!: GetProjectResponse;
  public isVisibleShowMoreDialog: boolean = false;

  public name: string = '';

  projectsService = inject(ProjectsService);

  ngOnInit(): void {
    this.getProjects();
  }

  private getProjects(): void {
    this.projectsService.getAllProjects()
      .pipe(takeUntil(this.destroy$))
      .subscribe((projects) => {
        this.projects = projects;
        this.filteredProjects = projects;
      }
    );
  }

  public filterProjectsByName(name: string): void {
    if (name.trim()) {
      this.filteredProjects = this.projects.filter(project =>
        project.name.toLowerCase().includes(name.toLowerCase())
      );
    } else {
      this.filteredProjects = this.projects;
    }
  }

  public openShowMore(project: GetProjectResponse): void {
    this.selectedProject = project;
    this.isVisibleShowMoreDialog = true;
  }

  public onCloseDialog(dialogType: "showMore"): void {
    if (dialogType == "showMore") {
      this.isVisibleShowMoreDialog = false;
    }
  }

  public ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }
}
