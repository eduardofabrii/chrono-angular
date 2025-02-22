import { Component, inject, Input, OnChanges, OnDestroy } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { Subject, takeUntil } from 'rxjs';

import { UserService } from '../../../../../services/user/user.service';
import { ActivitiesService } from './../../../../../services/activities/activities.service';
import { PostActivityRequest } from '../../../../../models/interfaces/activities/request/PostActivityRequest';
import { GetActivityResponse } from '../../../../../models/interfaces/activities/response/GetActivityResponse';

import { MessageService } from 'primeng/api';
import { DatePipe } from '@angular/common';

@Component({
  selector: 'app-activities-form',
  templateUrl: './activities-form.component.html',
  styleUrl: './activities-form.component.scss'
})
export class ActivitiesFormComponent implements OnChanges, OnDestroy {
  private readonly destroy$ = new Subject<void>();
  public isVisibleNewActivityDialog = false;

  @Input() activities: Array<GetActivityResponse> = [];
  @Input() projectId!: string;

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

  ngOnChanges() {
    this.getUsers();
  }

  public openNewActivityDialog(): void {
    this.isVisibleNewActivityDialog = true;
    console.log('openNewActivityDialog');
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
              this.showSuccessMessage('Sucesso', 'Projeto criado com sucesso!');
              this.addActivityForm.reset();
              this.onCloseDialog('newActivity');
              this.activities.push(response);
            }
          },
          error: (err: any) => {
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

  public onCloseDialog(dialogType: "newActivity" ): void {
    if (dialogType === 'newActivity') {
      this.isVisibleNewActivityDialog = false;
    }
  }

  public ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }
}
