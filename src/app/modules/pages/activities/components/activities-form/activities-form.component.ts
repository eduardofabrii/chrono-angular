import { Component, EventEmitter, inject, Input, OnChanges, OnDestroy, Output } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { Subject, takeUntil } from 'rxjs';

import { UserService } from '../../../../../services/user/user.service';
import { ProjectsService } from '../../../../../services/projects/projects.service';
import { DateUtilsService } from '../../../../../shared/services/date-utils.service';
import { ActivitiesService } from './../../../../../services/activities/activities.service';
import { PostActivityRequest } from '../../../../../models/interfaces/activities/request/PostActivityRequest';
import { GetActivityResponse } from '../../../../../models/interfaces/activities/response/GetActivityResponse';
import { PutActivityRequest } from '../../../../../models/interfaces/activities/request/PutActivityRequest';

import { MessageService } from 'primeng/api';

@Component({
  selector: 'app-activities-form',
  templateUrl: './activities-form.component.html',
  styleUrl: './activities-form.component.scss'
})
export class ActivitiesFormComponent implements OnChanges, OnDestroy {
  private readonly destroy$ = new Subject<void>();
  public isVisibleNewActivityDialog = false;
  public isVisibleEditActivityDialog = false;
  public isVisibleDeleteActivityDialog = false;
  public activityToDelete: GetActivityResponse | null = null;
  public role = '';
  public projectStartDate: string | null = null;
  public projectEndDate: string | null = null;
  public displayProjectStartDate: string | null = null;
  public displayProjectEndDate: string | null = null;
  public projectName: string | null = null;

  @Input() activities: Array<GetActivityResponse> = [];
  @Input() projectId!: string;

  @Output() activityCreated = new EventEmitter<GetActivityResponse>();
  @Output() activityUpdated = new EventEmitter<GetActivityResponse>();
  @Output() activityDeleted = new EventEmitter<GetActivityResponse>();

  formBuilder = inject(FormBuilder);
  userService = inject(UserService);
  messageService = inject(MessageService);
  activitiesService = inject(ActivitiesService);
  dateUtils = inject(DateUtilsService);
  projectsService = inject(ProjectsService);

  public statusOptions = [
    { label: 'Aberta', value: 'ABERTA' },
    { label: 'Em andamento', value: 'EM_ANDAMENTO' },
    { label: 'Concluída', value: 'CONCLUIDA' },
    { label: 'Pausada', value: 'PAUSADA' }
  ];

  public responsibleOptions: any[] = [];

  public addActivityForm: FormGroup = this.formBuilder.group({
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
  });

  public editActivityForm: FormGroup = this.formBuilder.group({
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
  });

  ngOnChanges() {
    this.role = this.userService.getRole() ?? '';
    this.getUsers();
    this.getProjectDetails();
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

  private getProjectDetails(): void {
    this.projectsService.getProjectById(this.projectId)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (project: any) => {
          this.projectName = project.name;
          this.projectStartDate = project.startDate;
          this.projectEndDate = project.endDate;

          // Formata datas
          this.displayProjectStartDate = project.startDate ?
            this.dateUtils.formatDateForDisplay(project.startDate) : null;
          this.displayProjectEndDate = project.endDate ?
            this.dateUtils.formatDateForDisplay(project.endDate) : null;
        },
        error: (err) => {
          console.error('Error loading project details:', err);
          this.messageService.add({
            severity: 'error',
            summary: 'Erro',
            detail: 'Não foi possível carregar os detalhes do projeto'
          });
        }
      });
  }

  public openNewActivityDialog(): void {
    this.isVisibleNewActivityDialog = true;
  }

  public openEditActivityDialog(activity: GetActivityResponse): void {
    this.isVisibleEditActivityDialog = true;

    const startDate = this.dateUtils.parseDate(activity.startDate);
    const endDate = this.dateUtils.parseDate(activity.endDate);

    const responsible = this.responsibleOptions.find(user => user.id === activity.responsible.id);

    this.editActivityForm.patchValue({
      ...activity,
      startDate: startDate,
      endDate: endDate,
      responsible: responsible || null
    });
  }

  public openDeleteActivityDialog(activity: GetActivityResponse): void {
    this.activityToDelete = activity;
    this.isVisibleDeleteActivityDialog = true;
  }

  public createActivity(): void {
    if (this.addActivityForm.valid) {
      const formattedStartDate = this.dateUtils.formatDateOnly(this.addActivityForm.value.startDate);
      const formattedEndDate = this.dateUtils.formatDateOnly(this.addActivityForm.value.endDate);

      // Validar se as datas estão dentro do período do projeto
      if (this.projectStartDate && this.projectEndDate) {
        const startDate = new Date(this.addActivityForm.value.startDate);
        const endDate = new Date(this.addActivityForm.value.endDate);
        const projectStartDate = this.dateUtils.parseDate(this.projectStartDate);
        const projectEndDate = this.dateUtils.parseDate(this.projectEndDate);

        if (projectStartDate && projectEndDate && (startDate < projectStartDate || endDate > projectEndDate)) {
          this.showErrorMessage('Erro', 'As datas devem estar dentro do período do projeto.');
          return;
        }
      }

      const requestCreateActivity: PostActivityRequest = {
        project: {
          id: this.projectId
        },
        name: this.addActivityForm.value.name!,
        description: this.addActivityForm.value.description!,
        startDate: formattedStartDate,
        endDate: formattedEndDate,
        status: this.addActivityForm.value.status!,
        responsible: {
          id: this.addActivityForm.value.responsible?.id ?? '',
          name: this.addActivityForm.value.responsible?.name ?? '',
          email: this.addActivityForm.value.responsible?.email ?? ''
        },
      };

      this.activitiesService.postActivity(requestCreateActivity)
        .pipe(takeUntil(this.destroy$))
        .subscribe({
          next: (response: any) => {
            if (response) {
              this.showSuccessMessage('Sucesso', 'Atividade criada com sucesso!');
              this.addActivityForm.reset();
              this.onCloseDialog('newActivity');
              this.activityCreated.emit(response);
            }
          },
          error: (err: any) => {
            console.log(err);
            this.showErrorMessage('Erro', 'Erro ao adicionar atividade!');
          },
        });
    }
  }

  public updateActivity(): void {
    if (this.editActivityForm.valid) {
      const formattedStartDate = this.dateUtils.formatDateOnly(this.editActivityForm.value.startDate);
      const formattedEndDate = this.dateUtils.formatDateOnly(this.editActivityForm.value.endDate);

      // Validar se as datas estão dentro do período do projeto
      if (this.projectStartDate && this.projectEndDate) {
        const startDate = new Date(this.editActivityForm.value.startDate);
        const endDate = new Date(this.editActivityForm.value.endDate);
        const projectStartDate = this.dateUtils.parseDate(this.projectStartDate);
        const projectEndDate = this.dateUtils.parseDate(this.projectEndDate);

        if (projectStartDate && projectEndDate && (startDate < projectStartDate || endDate > projectEndDate)) {
          this.showErrorMessage('Erro', 'As datas devem estar dentro do período do projeto.');
          return;
        }
      }

      const requestPutActivity: PutActivityRequest = {
        project: {
          id: this.projectId
        },
        name: this.editActivityForm.value.name!,
        description: this.editActivityForm.value.description!,
        startDate: formattedStartDate,
        endDate: formattedEndDate,
        status: this.editActivityForm.value.status!,
        responsible: {
          id: this.editActivityForm.value.responsible?.id ?? '',
          name: this.editActivityForm.value.responsible?.name ?? '',
          email: this.editActivityForm.value.responsible?.email ?? ''
        },
      };

      this.activitiesService.putActivity(this.editActivityForm.value.id, requestPutActivity)
        .pipe(takeUntil(this.destroy$))
        .subscribe({
          next: (response: any) => {
            if (response) {
              this.showSuccessMessage('Sucesso', 'Atividade atualizada com sucesso!');
              this.editActivityForm.reset();
              this.onCloseDialog('editActivity');
              this.activityUpdated.emit(response);
            }
          },
          error: (err: any) => {
            console.log(err);
            this.showErrorMessage('Erro', 'Erro ao atualizar atividade!');
          },
        });
    }
  }

  public deleteActivity(): void {
    if (this.activityToDelete) {
      this.activitiesService.deleteActivity(this.activityToDelete.id)
        .pipe(takeUntil(this.destroy$))
        .subscribe({
          next: () => {
            this.showSuccessMessage('Sucesso', 'Atividade deletada com sucesso!');
            this.activityDeleted.emit(this.activityToDelete!);
            this.onCloseDialog('deleteActivity');
            this.activityToDelete = null;
          },
          error: (err: any) => {
            console.log(err);
            this.showErrorMessage('Erro', 'Erro ao deletar atividade!');
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

  public onCloseDialog(dialogType: "newActivity" | "editActivity" | "deleteActivity"): void {
    if (dialogType === 'newActivity') this.isVisibleNewActivityDialog = false;
    if (dialogType === 'editActivity') this.isVisibleEditActivityDialog = false;
    if (dialogType === 'deleteActivity') this.isVisibleDeleteActivityDialog = false;
  }

  public ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }
}
