import { Component, inject, OnDestroy, OnInit, ChangeDetectorRef } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { Subject, takeUntil } from 'rxjs';

import { MessageService } from 'primeng/api';
import { Router } from '@angular/router';

import { GetProjectResponse } from '../../../../models/interfaces/projects/response/GetProjectResponse';
import { PostProjectRequest } from '../../../../models/interfaces/projects/request/PostProjectRequest';
import { PutProjectRequest } from '../../../../models/interfaces/projects/request/PutProjectRequest';
import { DateUtilsService } from '../../../../shared/services/date-utils.service';
import { ProjectsService } from '../../../../services/projects/projects.service';
import { UserService } from '../../../../services/user/user.service';

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
  public isVisibleEditProjectDialog: boolean = false;
  public isEditingProject: boolean = false;
  public isVisibleDeleteProjectDialog: boolean = false;
  public isVisibleConfirmDeleteDialog: boolean = false;
  public isVisibleDeleteErrorDialog: boolean = false;
  public name: string = '';
  public role: string | null = '';
  public deleteError: string = 'Não é possível excluir um projeto que possui tarefas associadas.';

  projectsService = inject(ProjectsService);
  userService = inject(UserService);
  formBuilder = inject(FormBuilder);
  messageService = inject(MessageService);
  dateUtils = inject(DateUtilsService);
  router = inject(Router);
  private readonly cdr = inject(ChangeDetectorRef);

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

  public editProjectForm: FormGroup = this.formBuilder.group({
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
    priority: ['']
  });

  ngOnInit(): void {
    this.role = this.userService.getRole();
    this.getUsersAdmin();
    this.loadProjectsBasedOnRole();
  }

  private loadProjectsBasedOnRole(): void {
    if (this.role === 'ADMIN') {
      this.getAllProjects();
    } else {
      this.getProjectsByActivityUserId();
    }
  }

  goToActivities(project: GetProjectResponse) {
    if (!project?.id) {
      return;
    }

    const navigateUrl = `/projects/activities/${project.id}`;
    this.router.navigate([navigateUrl]);
  }

  private getUsersAdmin(): void {
    this.userService.getUsersAdmin()
    .pipe(takeUntil(this.destroy$))
    .subscribe((users: any[]) => {
      this.responsibleOptions = users.map(user => ({
        id: user.id,
        name: user.name,
        email: user.email
      }));
    });
  }

  private getAllProjects(): void {
    this.projectsService.getAllProjects()
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (projects) => {
          this.projects = [...projects]; // Cria uma nova referência de array
          this.filteredProjects = [...projects]; // Cria uma nova referência de array
          // Aguarda receber uma promise para atualizar a view
          setTimeout(() => this.cdr.detectChanges(), 0);
        },
        error: (error) => {
          console.error('Error fetching all projects:', error);
          this.showErrorMessage('Erro', 'Não foi possível carregar os projetos.');
        }
      });
  }

  private getProjectsByActivityUserId(): void {
    const userId = this.userService.getCurrentUserId();
    if (userId) {
      this.projectsService.findProjectsByActivityUserId(userId)
        .pipe(takeUntil(this.destroy$))
        .subscribe({
          next: (projects) => {
            this.projects = [...projects]; // Cria uma nova referência de array
            this.filteredProjects = [...projects]; // Cria uma nova referência de array
            // Aguarda receber uma promise para atualizar a view
            setTimeout(() => this.cdr.detectChanges(), 0);
          },
          error: (error) => {
            console.error('Error fetching user projects:', error);
            this.showErrorMessage('Erro', 'Não foi possível carregar os projetos.');
          }
        });
    }
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

  public openShowMoreDialog(project: GetProjectResponse): void {
    this.selectedProject = project;
    this.isVisibleShowMoreDialog = true;
  }

  public openNewProjectDialog(): void {
    this.isVisibleNewProjectDialog = true;
  }

  public openEditProjectDialog(): void {
    this.isVisibleEditProjectDialog = true;
  }

  public openDeleteProjectDialog(): void {
    this.isVisibleDeleteProjectDialog = true;
  }

  public openConfirmDeleteProject(): void {
    this.isVisibleConfirmDeleteDialog = true;
  }

  public openDeleteErrorDialog(): void {
    this.isVisibleDeleteErrorDialog = true;
  }

  public onProjectSelect(event: any): void {
    this.selectedProject = event.value;
    if (!this.selectedProject) return;

    this.editProjectForm.patchValue({
      ...this.selectedProject,
      responsible: this.responsibleOptions.find(user => user.id === this.selectedProject.responsible.id) || { id: '', name: '', email: '' }
    });

    this.isEditingProject = true;
  }

  public createProject(): void {
    console.log(this.addProjectForm.value);
    if (this.addProjectForm.valid) {
      const formattedStartDate = this.dateUtils.formatDateOnly(this.addProjectForm.value.startDate);
      const formattedEndDate = this.dateUtils.formatDateOnly(this.addProjectForm.value.endDate);
      const formattedCreatedDate = this.dateUtils.formatDateTime(new Date());

      const requestCreateProject: PostProjectRequest = {
        name: this.addProjectForm.value.name!,
        description: this.addProjectForm.value.description!,
        startDate: formattedStartDate,
        endDate: formattedEndDate,
        status: this.addProjectForm.value.status!,
        responsible: {
          id: this.addProjectForm.value.responsible?.id ?? '',
          name: this.addProjectForm.value.responsible?.name ?? '',
          email: this.addProjectForm.value.responsible?.email ?? ''
        },
        priority: this.addProjectForm.value.priority!,
        createdDate: formattedCreatedDate,
      };

      this.projectsService.postProject(requestCreateProject)
        .pipe(takeUntil(this.destroy$))
        .subscribe({
          next: (response) => {
            if (response) {
              this.showSuccessMessage('Sucesso', 'Projeto criado com sucesso!');
              this.addProjectForm.reset();
              this.onCloseDialog('newProject');

              // Adiciona o novo projeto no início do array
              if (response) {
                this.projects = [response, ...this.projects];
                this.filteredProjects = [response, ...this.filteredProjects];
                setTimeout(() => this.cdr.detectChanges(), 0);
              } else {
                this.loadProjectsBasedOnRole();
              }
            }
          },
          error: (err) => {
            console.log(err);
            this.showErrorMessage('Erro', 'Erro ao adicionar projeto!');
          },
        });
    }
  }

  public updateProject(): void {
    if (this.editProjectForm.invalid) return;

    const { id, name, description, startDate, endDate, status, priority, responsible } = this.editProjectForm.value;
    const formattedStartDate = this.dateUtils.formatDateOnly(this.dateUtils.parseDate(startDate));
    const formattedEndDate = this.dateUtils.formatDateOnly(this.dateUtils.parseDate(endDate));

    const requestPutProject: PutProjectRequest = {
      id: id!,
      name: name!,
      description: description!,
      startDate: formattedStartDate,
      endDate: formattedEndDate,
      status: status!,
      responsible: {
        id: responsible?.id ?? '',
        name: responsible?.name ?? '',
        email: responsible?.email ?? ''
      },
      priority: priority!,
    };

    this.projectsService.putProject(requestPutProject.id, requestPutProject)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (updatedProject) => {
          this.showSuccessMessage('Sucesso', 'Projeto atualizado com sucesso!');
          this.editProjectForm.reset();
          this.isEditingProject = false;
          this.onCloseDialog('editProject');

          // Remove o projeto atual das listas
          this.projects = this.projects.filter(p => p.id !== requestPutProject.id);
          this.filteredProjects = this.filteredProjects.filter(p => p.id !== requestPutProject.id);

          // Adiciona o projeto atualizado no início dos arrays
          if (updatedProject) {
            this.projects = [updatedProject, ...this.projects];
            this.filteredProjects = [updatedProject, ...this.filteredProjects];
          } else {
            // Se não receber o projeto atualizado, busca todos novamente
            this.loadProjectsBasedOnRole();
          }

          setTimeout(() => this.cdr.detectChanges(), 0);
        },
        error: () => this.showErrorMessage('Erro', 'Erro ao atualizar projeto!')
      });
  }

  public deleteProject(): void {
    try {
      if (!this.selectedProject) return;

      this.projectsService.deleteProject(this.selectedProject.id)
        .pipe(takeUntil(this.destroy$))
        .subscribe({
          next: () => {
            this.showSuccessMessage('Sucesso', 'Projeto excluído com sucesso!');
            this.onCloseDialog('deleteProject');
            this.onCloseDialog('confirmDelete');
            this.loadProjectsBasedOnRole();
          },
          error: (err) => {
            console.error("Erro ao excluir projeto:", err);
            this.showErrorMessage('Erro', 'Erro ao excluir projeto!');
            this.openDeleteErrorDialog();
          }
        });

    } catch (error) {
      console.error("Erro inesperado:", error);
      this.showErrorMessage('Erro', 'Erro inesperado ao excluir o projeto!');
      this.openDeleteErrorDialog();
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

  public onCloseDialog(dialogType: "showMore" | "newProject" | "editProject" | "deleteProject" | "confirmDelete" | "deleteError" ): void {
    if (dialogType === "showMore") this.isVisibleShowMoreDialog = false;
    if (dialogType === "newProject") this.isVisibleNewProjectDialog = false;
    if (dialogType === "editProject") {
      this.isVisibleEditProjectDialog = false;
      this.isEditingProject = false;
    }
    if (dialogType === "deleteProject") {
      this.isVisibleDeleteProjectDialog = false;
    }
    if (dialogType === "confirmDelete") {
      this.isVisibleConfirmDeleteDialog = false;
      this.isVisibleDeleteProjectDialog = false;
    }
    if (dialogType === "deleteError") {
      this.isVisibleDeleteErrorDialog = false;
      this.isVisibleConfirmDeleteDialog = false;
      this.isVisibleDeleteProjectDialog = false;
    }
  }

  public ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }
}
