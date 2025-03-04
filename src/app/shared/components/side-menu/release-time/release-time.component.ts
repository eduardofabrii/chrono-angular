import { ActivitiesService } from './../../../../services/activities/activities.service';
import { Component, inject, OnDestroy, OnInit } from '@angular/core';
import { FormBuilder } from '@angular/forms';
import { UserService } from '../../../../services/user/user.service';
import { GetActivityResponse } from '../../../../models/interfaces/activities/response/GetActivityResponse';
import { Subject, takeUntil } from 'rxjs';
import { ReleaseTimeService } from '../../../../services/release-time/release-time.service';
import { PostReleaseTimeRequest } from '../../../../models/interfaces/release-time/request/PostReleaseTimeRequest';
import { MessageService } from 'primeng/api';
import { DateUtilsService } from '../../../services/date-utils.service';

@Component({
  selector: 'app-release-time',
  templateUrl: './release-time.component.html',
  styleUrls: ['./release-time.component.scss']
})
export class ReleaseTimeComponent implements OnInit, OnDestroy {
  private readonly destroy$ = new Subject<void>();
  public isVisibleReleaseTimeDialog = false;
  public activities: GetActivityResponse[] = [];
  public mappedActivities: { label: string; value: string }[] = [];

  private readonly userService = inject(UserService);
  private readonly activitiesService = inject(ActivitiesService);
  private readonly releaseTimeService = inject(ReleaseTimeService);
  private readonly messageService = inject(MessageService);
  private readonly formBuilder = inject(FormBuilder);
  private readonly dateUtils = inject(DateUtilsService);

  addReleaseTime = this.formBuilder.group({
    activity: this.formBuilder.group({ id: [''] }),
    user: this.formBuilder.group({ id: [''] }),
    description: [''],
    startDate: [''],
    endDate: [''],
    hours: ['']
  });

  ngOnInit(): void {
    this.loadActivities();

    // Add value change listeners to both date fields
    this.addReleaseTime.get('startDate')?.valueChanges
      .pipe(takeUntil(this.destroy$))
      .subscribe(() => this.updateHours());

    this.addReleaseTime.get('endDate')?.valueChanges
      .pipe(takeUntil(this.destroy$))
      .subscribe(() => this.updateHours());
  }

  loadActivities(): void {
    const userId = this.userService.getCurrentUserId();
    if (userId) {
      this.activitiesService.getActivityByResponsibleId(userId)
        .pipe(takeUntil(this.destroy$))
        .subscribe((activities: GetActivityResponse[]) => {
          this.activities = activities;
          this.mappedActivities = activities.map(activity => ({
            label: activity.name,
            value: activity.id
          }));
        });
    } else {
      console.error('User ID not found');
    }
  }

  openDialog() {
    this.isVisibleReleaseTimeDialog = true;
  }

  onCloseDialog() {
    this.isVisibleReleaseTimeDialog = false;
  }

  releaseTime() {
    if (this.addReleaseTime.valid) {
      const { startDate, endDate, activity, description } = this.addReleaseTime.value;
      if (!startDate || !endDate) {
        this.showMessage('error', 'Erro', 'Datas inválidas!');
        return;
      }

      const formattedStartDate = this.dateUtils.formatDateTime(new Date(startDate));
      const formattedEndDate = this.dateUtils.formatDateTime(new Date(endDate));
      const userId = this.userService.getCurrentUserId();

      if (userId) {
        this.addReleaseTime.get('user.id')?.setValue(userId);

        const requestLaunchTime: PostReleaseTimeRequest = {
          id: '',
          activity: { id: activity?.id ?? '' },
          user: { id: userId },
          description: description!,
          startDate: formattedStartDate,
          endDate: formattedEndDate,
        };

        console.log('Dados a serem enviados para a API:', requestLaunchTime);

        this.releaseTimeService.postReleaseTime(requestLaunchTime)
          .pipe(takeUntil(this.destroy$))
          .subscribe({
            next: () => {
              this.showMessage('success', 'Sucesso', 'Hora lançada com sucesso!');
              this.addReleaseTime.reset();
            },
            error: (err) => {
              console.error('Erro ao lançar hora:', err);
              this.showMessage('error', 'Erro', 'Erro ao lançar hora!');
            }
          });
      } else {
        this.showMessage('error', 'Erro', 'ID do usuário não encontrado no token!');
      }
    }
  }

  private showMessage(severity: string, summary: string, detail: string): void {
    this.messageService.add({ severity, summary, detail, life: 2500 });
  }

  updateHours(): void {
    const startDate = this.addReleaseTime.get('startDate')?.value;
    const endDate = this.addReleaseTime.get('endDate')?.value;

    if (startDate && endDate) {
      const start = new Date(startDate);
      const end = new Date(endDate);

      // Valida datas
      if (isNaN(start.getTime()) || isNaN(end.getTime())) {
        this.addReleaseTime.get('hours')?.setValue('');
        return;
      }

      // Calcula diferente de milissegundos
      const diffMs = end.getTime() - start.getTime();

      //Chega se a data final é menor que a data inicial
      if (diffMs < 0) {
        this.addReleaseTime.get('hours')?.setValue('0:00');
        return;
      }

      // Calcula a diferença em horas
      const diffHours = diffMs / (1000 * 60 * 60);

      // Formata a diferença para HH:MM
      const formattedTime = this.formatDecimalHoursToHHMM(diffHours);

      this.addReleaseTime.get('hours')?.setValue(formattedTime);
    } else {
      this.addReleaseTime.get('hours')?.setValue('');
    }
  }

  // Formata um número decimal de horas para HH:MM
  private formatDecimalHoursToHHMM(decimalHours: number): string {
    const hours = Math.floor(decimalHours);
    const minutes = Math.round((decimalHours - hours) * 60);

    // Ajusta as horas e minutos
    let adjustedHours = hours;
    let adjustedMinutes = minutes;

    if (minutes === 60) {
      adjustedHours += 1;
      adjustedMinutes = 0;
    }

    // Formata os minutos para 2 dígitos
    const minutesStr = adjustedMinutes < 10 ? `0${adjustedMinutes}` : `${adjustedMinutes}`;

    return `${adjustedHours}:${minutesStr}`;
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }
}
