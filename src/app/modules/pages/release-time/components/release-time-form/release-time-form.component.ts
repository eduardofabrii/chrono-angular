import { Component, EventEmitter, inject, Input, OnChanges, OnDestroy, Output } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Subject, takeUntil } from 'rxjs';

import { UserService } from '../../../../../services/user/user.service';
import { ProjectsService } from '../../../../../services/projects/projects.service';
import { DateUtilsService } from '../../../../../shared/services/date-utils.service';
import { MessageService } from 'primeng/api';
import { ReleaseTimeService } from '../../../../../services/release-time/release-time.service';
import { PutReleaseTimeRequest } from '../../../../../models/interfaces/release-time/request/PutReleaseTimeRequest';
import { GetActivityResponse } from '../../../../../models/interfaces/activities/response/GetActivityResponse';
import { ActivitiesService } from '../../../../../services/activities/activities.service';

@Component({
  selector: 'app-release-time-form',
  templateUrl: './release-time-form.component.html',
  styleUrls: ['./release-time-form.component.scss']
})
export class ReleaseTimeFormComponent implements OnChanges, OnDestroy {
  private readonly destroy$ = new Subject<void>();
  public isVisibleEditReleaseTime = false;
  public isVisibleDeleteReleaseTimeDialog = false;
  public releaseTimeToDelete: any = null;
  public responsibleOptions: any[] = [];
  public activities: GetActivityResponse[] = [];
  public role = '';
  public projectStartDate: string | null = null;
  public projectEndDate: string | null = null;
  public activityStartDate: string | null = null;
  public activityEndDate: string | null = null;
  public selectedActivity: any = null;

  @Input() releaseTimes: Array<any> = [];
  @Input() projectId!: string;

  @Output() releaseTimeUpdated = new EventEmitter<any>();
  @Output() releaseTimeDeleted = new EventEmitter<any>();

  formBuilder = inject(FormBuilder);
  userService = inject(UserService);
  messageService = inject(MessageService);
  activitiesService = inject(ActivitiesService);
  releaseTimeService = inject(ReleaseTimeService);
  dateUtils = inject(DateUtilsService);
  projectsService = inject(ProjectsService);

  public statusOptions = [
    { label: 'Pendente', value: 'PENDENTE' },
    { label: 'Aprovado', value: 'APROVADO' },
    { label: 'Rejeitado', value: 'REJEITADO' }
  ];

  public addReleaseTimeForm: FormGroup = this.formBuilder.group({
    activity: this.formBuilder.group({ id: [''] }),
    user: this.formBuilder.group({ id: [''] }),
    description: [''],
    startDate: [''],
    endDate: [''],
    hours: ['']
  });

  public editReleaseTimeForm: FormGroup = this.formBuilder.group({
    id: [''],
    activity: [null],
    user: [null],
    description: [''],
    startDate: [''],
    endDate: [''],
    hours: ['']
  });

  ngOnChanges() {
    this.role = this.userService.getRole() ?? '';
    this.loadActivities();
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

  loadActivities(): void {
    this.activitiesService.getAllActivities()
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (activities: GetActivityResponse[]) => {
          this.activities = activities;
        },
        error: (err) => {
          console.error('Error loading activities:', err);
          this.messageService.add({
            severity: 'error',
            summary: 'Erro',
            detail: 'Não foi possível carregar as atividades'
          });
        }
      });
  }

  public openEditReleaseTimeDialog(releaseTime: any): void {
    this.isVisibleEditReleaseTime = true;

    let startDate = this.parseDate(releaseTime.startDate);
    let endDate = this.parseDate(releaseTime.endDate);

    const selectedActivity = this.activities.find(act => act.id === releaseTime.activity?.id);
    const selectedUser = this.responsibleOptions.find(user => user.id === releaseTime.user?.id);

    this.editReleaseTimeForm.patchValue({
      id: releaseTime.id,
      activity: selectedActivity || null,
      user: selectedUser || null,
      description: releaseTime.description,
      startDate: startDate,
      endDate: endDate
    });

    this.selectedActivity = selectedActivity;

    // Extrair e formatar as datas da atividade selecionada
    if (selectedActivity) {
      this.activityStartDate = selectedActivity.startDate ?
        this.dateUtils.formatDateForDisplay(selectedActivity.startDate) : null;
      this.activityEndDate = selectedActivity.endDate ?
        this.dateUtils.formatDateForDisplay(selectedActivity.endDate) : null;
    }

    // Buscar as datas do projeto associado à atividade selecionada
    this.getProjectFromActivity(selectedActivity);
  }

  private parseDate(date: any): Date | null {
    if (!date) {
      return null;
    }

    if (date instanceof Date) {
      return date;
    }

    if (typeof date === 'string') {
      let parsedDate = new Date(date);

      if (!isNaN(parsedDate.getTime())) {
        return parsedDate;
      }

      if (date.includes('T')) {
        try {
          return new Date(date);
        } catch (e) {
          console.error('Error parsing ISO date:', e);
        }
      }

      // Tenta DD/MM/YYYY HH:mm:ss ou DD/MM/YYYY HH:mm
      if (date.includes('/') && date.includes(':')) {
        const [datePart, timePart] = date.split(' ');
        const dateParts = datePart.split('/');
        const timeParts = timePart.split(':');

        if (dateParts.length === 3 && timeParts.length >= 2) {
          const year = parseInt(dateParts[2], 10);
          const month = parseInt(dateParts[1], 10) - 1;
          const day = parseInt(dateParts[0], 10);
          const hour = parseInt(timeParts[0], 10);
          const minute = parseInt(timeParts[1], 10);
          const second = timeParts[2] ? parseInt(timeParts[2], 10) : 0;

          return new Date(year, month, day, hour, minute, second);
        }
      }

      if (date.includes('/')) {
        const parts = date.split('/');
        if (parts.length === 3) {
          const now = new Date();
          const year = parseInt(parts[2], 10);
          const month = parseInt(parts[1], 10) - 1;
          const day = parseInt(parts[0], 10);

          return new Date(year, month, day,
                          now.getHours(), now.getMinutes(), now.getSeconds());
        }
      }

      const timeMatch = date.match(/(\d{1,2}):(\d{1,2})(?::(\d{1,2}))?/);
      if (timeMatch) {
        const now = new Date();
        const hour = parseInt(timeMatch[1], 10);
        const minute = parseInt(timeMatch[2], 10);
        const second = timeMatch[3] ? parseInt(timeMatch[3], 10) : 0;

        now.setHours(hour, minute, second, 0);
        return now;
      }

      try {
        const utilsDate = this.dateUtils.parseDate(date);
        if (utilsDate) {
          return utilsDate;
        }
      } catch (e) {
        console.error('Error parsing date with dateUtils:', e);
      }
    } else if (typeof date === 'object' && date !== null) {
      try {
        if (date.hasOwnProperty('date') && date.hasOwnProperty('time')) {
          return this.parseDate(`${date.date} ${date.time}`);
        }

        if (date.hasOwnProperty('year') && date.hasOwnProperty('month')) {
          const year = date.year;
          const month = date.month - 1;
          const day = date.day || 1;
          const hour = date.hour || 0;
          const minute = date.minute || 0;
          const second = date.second || 0;

          return new Date(year, month, day, hour, minute, second);
        }
      } catch (e) {
        console.error('Error parsing date object:', e, date);
      }
    }

    console.warn('Could not parse date:', date);
    return null;
  }

  private getProjectFromActivity(activity: any): void {
    if (!activity) {
      this.projectStartDate = null;
      this.projectEndDate = null;
      return;
    }

    // Tentar encontrar o ID do projeto em diferentes estruturas possíveis
    let projectId = null;

    // Tenta encontrar o ID do projeto em diferentes formatos
    if (activity.project?.id) {
      projectId = activity.project.id;
    } else if (activity.projectId) {
      projectId = activity.projectId;
    }

    // Se encontrou o ID do projeto, busca os dados
    if (projectId) {
      this.getProjectDates(projectId);
    } else {
      // Se não encontrou, tenta usar o projectId do input
      this.getProjectDates(this.projectId);
    }
  }

  public onActivityChange(event: any): void {
    const activity = event.value;
    this.selectedActivity = activity;

    // Limpar datas da atividade anterior
    this.activityStartDate = null;
    this.activityEndDate = null;

    // Extrair e formatar as datas da nova atividade selecionada
    if (activity) {
      this.activityStartDate = activity.startDate ?
        this.dateUtils.formatDateForDisplay(activity.startDate) : null;
      this.activityEndDate = activity.endDate ?
        this.dateUtils.formatDateForDisplay(activity.endDate) : null;
    }

    // Buscar também as datas do projeto (para exibição e backup na validação)
    this.getProjectFromActivity(activity);
  }

  private getProjectDates(projectId: string): void {
    if (!projectId) {
      this.projectStartDate = null;
      this.projectEndDate = null;
      return;
    }

    this.projectsService.getProjectById(projectId)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (project: any) => {
          // Formatar datas para exibição mais amigável (DD/MM/YYYY)
          this.projectStartDate = project.startDate ?
            this.dateUtils.formatDateForDisplay(project.startDate) : null;
          this.projectEndDate = project.endDate ?
            this.dateUtils.formatDateForDisplay(project.endDate) : null;
        },
        error: (err) => {
          console.error('Error fetching project data:', err);
          this.projectStartDate = null;
          this.projectEndDate = null;
          this.messageService.add({
            severity: 'error',
            summary: 'Erro',
            detail: 'Não foi possível buscar os dados do projeto'
          });
        }
      });
  }

  public openDeleteReleaseTimeDialog(releaseTime: any): void {
    this.releaseTimeToDelete = releaseTime;
    this.isVisibleDeleteReleaseTimeDialog = true;
  }

  public updateReleaseTime(): void {
    if (this.editReleaseTimeForm.valid) {
      // Formatar datas para envio
      const startDate = this.editReleaseTimeForm.value.startDate;
      const endDate = this.editReleaseTimeForm.value.endDate;

      const formattedStartDate = startDate ? this.dateUtils.formatDateTime(startDate) : '';
      const formattedEndDate = endDate ? this.dateUtils.formatDateTime(endDate) : '';

      const { id, activity, user, description } = this.editReleaseTimeForm.value;

      // Validar primeiro com base nas datas da atividade (prioridade mais alta)
      if (this.activityStartDate && this.activityEndDate) {
        const start = new Date(this.editReleaseTimeForm.value.startDate);
        const end = new Date(this.editReleaseTimeForm.value.endDate);
        const activityStart = this.dateUtils.parseDate(this.activityStartDate);
        const activityEnd = this.dateUtils.parseDate(this.activityEndDate);

        if (activityStart && activityEnd) {
          // Configurar para início e fim do dia para comparação justa
          activityStart.setHours(0, 0, 0, 0);
          activityEnd.setHours(23, 59, 59, 999);

          if (start < activityStart || end > activityEnd) {
            this.showErrorMessage('Erro', 'As datas devem estar dentro do período da atividade.');
            return;
          }
        }
      }
      // Se a atividade não tiver datas definidas, validar pelo período do projeto
      else if (this.projectStartDate && this.projectEndDate) {
        const start = new Date(this.editReleaseTimeForm.value.startDate);
        const end = new Date(this.editReleaseTimeForm.value.endDate);
        const projectStart = this.dateUtils.parseDate(this.projectStartDate);
        const projectEnd = this.dateUtils.parseDate(this.projectEndDate);

        if (projectStart && projectEnd) {
          // Configurar para início e fim do dia para comparação justa
          projectStart.setHours(0, 0, 0, 0);
          projectEnd.setHours(23, 59, 59, 999);

          if (start < projectStart || end > projectEnd) {
            this.showErrorMessage('Erro', 'As datas devem estar dentro do período do projeto.');
            return;
          }
        }
      }

      const requestPutReleaseTime: PutReleaseTimeRequest = {
        id: '',
        activity: {
          id: activity?.id ?? ''
        },
        user: {
          id: user?.id ?? ''
        },
        description: description || '',
        startDate: formattedStartDate,
        endDate: formattedEndDate,
      };

      this.releaseTimeService.putReleaseTime(id, requestPutReleaseTime)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (updatedReleaseTime: any) => {
          this.releaseTimeUpdated.emit(updatedReleaseTime);
          this.showSuccessMessage('Sucesso', 'Lançamento de hora atualizado com sucesso!');
          this.editReleaseTimeForm.reset();
          this.onCloseDialog('editRelease');
          this.selectedActivity = null;
        },
        error: (err) => {
          this.showErrorMessage('Erro', 'Erro ao atualizar lançamento de hora.');
          console.error('Erro ao atualizar lançamento:', err);
        }
      });
    } else {
      this.showErrorMessage('Erro', 'Formulário inválido. Por favor, verifique os campos obrigatórios.');
    }
  }

  public deleteReleaseTime(): void {
    if (this.releaseTimeToDelete) {
      this.releaseTimeService.deleteReleaseTime(this.releaseTimeToDelete.id)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: () => {
          this.releaseTimeDeleted.emit(this.releaseTimeToDelete);
          this.showSuccessMessage('Sucesso', 'Lançamento de hora deletado com sucesso!');
          this.onCloseDialog('deleteRelease');
          this.releaseTimeToDelete = null;
        },
        error: (err) => {
          this.showErrorMessage('Erro', 'Não foi possível deletar o lançamento de hora!');
          console.error('Erro ao deletar lançamento:', err);
        }
      });
    } else {
      this.showErrorMessage('Erro', 'Não foi possível deletar o lançamento de hora!');
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

  public onCloseDialog(dialogType: "editRelease" | "deleteRelease"): void {
    if (dialogType === 'editRelease') {
      this.isVisibleEditReleaseTime = false;
      this.projectStartDate = null;
      this.projectEndDate = null;
      this.activityStartDate = null;
      this.activityEndDate = null;
      this.selectedActivity = null;
    }
    if (dialogType === 'deleteRelease') this.isVisibleDeleteReleaseTimeDialog = false;
  }

  public ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }
}
