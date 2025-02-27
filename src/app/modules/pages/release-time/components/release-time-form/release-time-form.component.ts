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
      .subscribe((activities: GetActivityResponse[]) => {
        this.activities = activities;
      });
  }

  public openEditReleaseTimeDialog(releaseTime: any): void {
    this.isVisibleEditReleaseTime = true;

    const startDate = this.dateUtils.parseDate(releaseTime.startDate);
    const endDate = this.dateUtils.parseDate(releaseTime.endDate);
    const date = this.dateUtils.parseDate(releaseTime.date);

    const selectedActivity = this.activities.find(act => act.id === releaseTime.activity?.id);
    const selectedUser = this.responsibleOptions.find(user => user.id === releaseTime.user?.id);

    this.editReleaseTimeForm.patchValue({
      id: releaseTime.id,
      activity: selectedActivity || null,
      user: selectedUser || null,
      description: releaseTime.description,
      startDate: startDate,
      endDate: endDate,
      date: date
    });
  }

  public openDeleteReleaseTimeDialog(releaseTime: any): void {
    this.releaseTimeToDelete = releaseTime;
    this.isVisibleDeleteReleaseTimeDialog = true;
  }

  public updateReleaseTime(): void {
    console.log(this.editReleaseTimeForm.value);
    if (this.editReleaseTimeForm.valid) {
      const formattedStartDate = this.dateUtils.formatDateTime(this.editReleaseTimeForm.value.startDate);
      const formattedEndDate = this.dateUtils.formatDateTime(this.editReleaseTimeForm.value.endDate);

      const { id, activity, user, description } = this.editReleaseTimeForm.value;

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
      .subscribe((updatedReleaseTime: any) => {
        this.releaseTimeUpdated.emit(updatedReleaseTime);
        this.showSuccessMessage('Sucesso', 'Apontamento atualizado com sucesso!');
        this.editReleaseTimeForm.reset();
        this.onCloseDialog('editRelease');
      });
    } else {
      this.showErrorMessage('Erro', 'Preencha todos os campos obrigatórios!');
    }
  }

  public deleteReleaseTime(): void {
    if (this.releaseTimeToDelete) {
    // IMPLEMENTAR A CHAMADA DO SERVICE
      this.showSuccessMessage('Sucesso', 'Apontamento deletado com sucesso!');
      this.onCloseDialog('deleteRelease');
      this.releaseTimeToDelete = null;
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
    if (dialogType === 'editRelease') this.isVisibleEditReleaseTime = false;
    if (dialogType === 'deleteRelease') this.isVisibleDeleteReleaseTimeDialog = false;
  }

  public ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }
}
