import { Component, EventEmitter, inject, Input, OnChanges, OnDestroy, Output } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { Subject, takeUntil } from 'rxjs';

import { UserService } from '../../../../../services/user/user.service';
import { ActivitiesService } from './../../../../../services/activities/activities.service';
import { PostActivityRequest } from '../../../../../models/interfaces/activities/request/PostActivityRequest';
import { GetActivityResponse } from '../../../../../models/interfaces/activities/response/GetActivityResponse';

import { MessageService } from 'primeng/api';
import { DatePipe } from '@angular/common';
import { PutActivityRequest } from '../../../../../models/interfaces/activities/request/PutActivityRequest';

@Component({
  selector: 'app-activities-form',
  templateUrl: './activities-form.component.html',
  styleUrl: './activities-form.component.scss'
})
export class ActivitiesFormComponent implements OnChanges, OnDestroy {
  private readonly destroy$ = new Subject<void>();
  public isVisibleNewActivityDialog = false;
  public isVisibleEditActivityDialog = false;

  @Input() activities: Array<GetActivityResponse> = [];
  @Input() projectId!: string;

  @Output() activityCreated = new EventEmitter<GetActivityResponse>();
  @Output() activityUpdated = new EventEmitter<GetActivityResponse>();

  formBuilder = inject(FormBuilder);
  userService = inject(UserService);
  messageService = inject(MessageService);
  activitiesService = inject(ActivitiesService);
  datePipe = inject(DatePipe);

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

  public openNewActivityDialog(): void {
    this.isVisibleNewActivityDialog = true;
  }

  public openEditActivityDialog(activity: GetActivityResponse): void {
    this.isVisibleEditActivityDialog = true;

    const startDate = this.parseDate(activity.startDate);
    const endDate = this.parseDate(activity.endDate);

    const responsible = this.responsibleOptions.find(user => user.id === activity.responsible.id);

    this.editActivityForm.patchValue({
      ...activity,
      startDate: startDate,
      endDate: endDate,
      responsible: responsible || null
    });
  }

  public createActivity(): void {
    if (this.addActivityForm.valid) {
      const formattedStartDate = this.datePipe.transform(this.addActivityForm.value.startDate, 'dd/MM/yyyy');
      const formattedEndDate = this.datePipe.transform(this.addActivityForm.value.endDate, 'dd/MM/yyyy');

      const requestCreateActivity: PostActivityRequest = {
        project: {
          id: this.projectId
        },
        name: this.addActivityForm.value.name!,
        description: this.addActivityForm.value.description!,
        startDate: formattedStartDate!,
        endDate: formattedEndDate!,
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
      const formattedStartDate = this.datePipe.transform(this.editActivityForm.value.startDate, 'dd/MM/yyyy');
      const formattedEndDate = this.datePipe.transform(this.editActivityForm.value.endDate, 'dd/MM/yyyy');

      const requestPutActivity: PutActivityRequest = {
        project: {
          id: this.projectId
        },
        name: this.editActivityForm.value.name!,
        description: this.editActivityForm.value.description!,
        startDate: formattedStartDate!,
        endDate: formattedEndDate!,
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

  public onCloseDialog(dialogType: "newActivity" | "editActivity"): void {
    if (dialogType === 'newActivity') this.isVisibleNewActivityDialog = false;
    if (dialogType === 'editActivity') this.isVisibleEditActivityDialog = false;
  }

  private parseDate(dateValue: string | Date): Date | null {
    if (!dateValue) return null;

    // Se o valor já for um objeto Date, retorne-o diretamente
    if (dateValue instanceof Date) {
      return dateValue;
    }

    // Se for uma string no formato "dd/MM/yyyy", converta para Date
    if (typeof dateValue === 'string' && dateValue.includes('/')) {
      const [day, month, year] = dateValue.split('/');
      return new Date(+year, +month - 1, +day);
    }

    // Se for uma string no formato ISO ("yyyy-MM-dd"), converta para Date
    if (typeof dateValue === 'string' && dateValue.includes('-')) {
      return new Date(dateValue);
    }

    // Caso o formato não seja reconhecido, retorne null
    return null;
  }


  public ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }
}
