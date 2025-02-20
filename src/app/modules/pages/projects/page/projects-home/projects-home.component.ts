import { Component, inject, OnDestroy, OnInit } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { Subject, takeUntil } from 'rxjs';

import { GetProjectResponse } from '../../../../../models/interfaces/projects/response/GetProjectResponse';
import { PutProjectRequest } from '../../../../../models/interfaces/projects/request/PutProjectRequest';
import { ProjectsService } from '../../../../../services/projects/projects.service';
import { UserService } from '../../../../../services/user/user.service';

import { MessageService } from 'primeng/api';
import { DatePipe } from '@angular/common';

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
  public isVisibleNewProjectDialog: boolean = false;
  public name: string = '';

  projectsService = inject(ProjectsService);
  userService = inject(UserService);
  formBuilder = inject(FormBuilder);
  messageService = inject(MessageService);
  datePipe = inject(DatePipe);

  public priorityOptions = [
    { label: 'Baixa', value: 'BAIXA' },
    { label: 'Média', value: 'MEDIA' },
    { label: 'Alta', value: 'ALTA' }
  ];

  public statusOptions = [
    { label: 'Concluído', value: 'CONCLUIDO' },
    { label: 'Em andamento', value: 'EM_ANDAMENTO' },
    { label: 'Planejado', value: 'PLANEJADO' },
    { label: 'Cancelado', value: 'CANCELADO' }
  ];

  public responsibleOptions: any[] = [];

  public addProjectForm: FormGroup = this.formBuilder.group({
    id: [''],
    name: [''],
    description: [''],
    startDate: [''],
    endDate: [''],
    status: [''],
    responsible: this.formBuilder.group({
      id: [''],
      name: [''],
      email: ['']
    }),
    creationDate: [''],
    priority: ['']
  });

  ngOnInit(): void {
    this.getProjects();
    this.getUsers();
  }

  private getUsers(): void {
    this.userService.getUsers()
    .pipe(takeUntil(this.destroy$))
    .subscribe((users: any[]) => {
      this.responsibleOptions = users.map(user => ({
        id: user.id,
        name: user.name,
        email: user.email
      }));
    });
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

  public openNewProjectDialog(): void {
    console.log("openNewProjectDialog")
    this.isVisibleNewProjectDialog = true;
  }

  public createProject(): void {
    console.log(this.addProjectForm.value);
    if (this.addProjectForm.valid) {
      const formattedStartDate = this.datePipe.transform(this.addProjectForm.value.startDate, 'dd/MM/yyyy');
      const formattedEndDate = this.datePipe.transform(this.addProjectForm.value.endDate, 'dd/MM/yyyy');
      const formattedCreatedDate = this.datePipe.transform(new Date(), 'dd/MM/yyyy HH:mm:ss');

      const requestCreateProject: PutProjectRequest = {
        id: this.addProjectForm.value.id!,
        name: this.addProjectForm.value.name!,
        description: this.addProjectForm.value.description!,
        startDate: formattedStartDate!,
        endDate: formattedEndDate!,
        status: this.addProjectForm.value.status!,
        responsible: {
          id: this.addProjectForm.value.responsible?.id ?? '',
          name: this.addProjectForm.value.responsible?.name ?? '',
          email: this.addProjectForm.value.responsible?.email ?? ''
        },
        priority: this.addProjectForm.value.priority!,
        createdDate: formattedCreatedDate!,
      };

      this.projectsService.postProject(requestCreateProject)
        .pipe(takeUntil(this.destroy$))
        .subscribe({
          next: (response) => {
            if (response) {
              this.showSuccessMessage('Sucesso', 'Projeto criado com sucesso!');
              this.addProjectForm.reset();
              this.onCloseDialog('newProject');
              this.getProjects();
            }
          },
          error: (err) => {
            console.log(err);
            this.showErrorMessage('Erro', 'Erro ao adicionar projeto!');
          },
        });
    }
  }

  private showSuccessMessage(summary: string, detail: string): void {
    this.messageService.add({
      severity: 'success',
      summary,
      detail,
      life: 2500,
    });
  }

  private showErrorMessage(summary: string, detail: string): void {
    this.messageService.add({
      severity: 'error',
      summary,
      detail,
      life: 2500,
    });
  }

  public onCloseDialog(dialogType: "showMore" | "newProject"): void {
    if (dialogType === "showMore") this.isVisibleShowMoreDialog = false;
    if (dialogType === "newProject") this.isVisibleNewProjectDialog = false;
  }

  public ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }
}
