import { Injectable, inject } from '@angular/core';
import { BehaviorSubject, Observable, Subject, map, tap } from 'rxjs';

import { ActivitiesService } from '../../services/activities/activities.service';
import { ReleaseTimeService } from '../../services/release-time/release-time.service';
import { UserService } from '../../services/user/user.service';
import { GetActivityResponse } from '../../models/interfaces/activities/response/GetActivityResponse';
import { DateUtilsService } from './date-utils.service';
import { TimerService } from './timer.service';

export interface LaunchEntry {
  activityId: string;
  description: string;
  start: Date;
  end: Date;
}

/** Lançamento de horas (timer e manual) compartilhado entre a barra do desktop e a tela "Lançar" do celular. */
@Injectable({ providedIn: 'root' })
export class LaunchService {
  private readonly activitiesService = inject(ActivitiesService);
  private readonly releaseTimeService = inject(ReleaseTimeService);
  private readonly userService = inject(UserService);
  private readonly dateUtils = inject(DateUtilsService);
  private readonly timer = inject(TimerService);

  /** Atividades do usuário logado que aceitam lançamento. */
  readonly activities$ = new BehaviorSubject<GetActivityResponse[]>([]);
  /** Emite sempre que um lançamento é salvo, para as telas recarregarem. */
  readonly saved$ = new Subject<void>();

  loadActivities(): void {
    const userId = this.userService.getCurrentUserId();
    if (!userId) return;
    this.activitiesService.getActivityByResponsibleId(userId)
      .pipe(map(activities => (activities ?? []).filter(a => a.status !== 'CONCLUIDA')))
      .subscribe({ next: activities => this.activities$.next(activities), error: () => this.activities$.next([]) });
  }

  findActivity(activityId: string | null): GetActivityResponse | undefined {
    return this.activities$.value.find(a => a.id == activityId);
  }

  /** Texto de apoio abaixo da atividade: "Projeto · até dd/mm/aaaa". */
  activityHint(activityId: string | null): string {
    const activity = this.findActivity(activityId);
    if (!activity) return '';
    return [activity.project?.name, activity.endDate ? `até ${activity.endDate}` : ''].filter(Boolean).join(' · ');
  }

  startTimer(activityId: string, description: string): void {
    const activity = this.findActivity(activityId);
    if (activity) {
      this.timer.start(activity.id, activity.name, description, activity.project?.name ?? '');
    }
  }

  /** Retorna a mensagem de erro do lançamento ou null quando é válido. */
  validate(entry: LaunchEntry): string | null {
    if (!entry.activityId) return 'Selecione uma atividade.';
    if (isNaN(entry.start.getTime()) || isNaN(entry.end.getTime())) return 'Informe início e fim válidos.';
    if (entry.end <= entry.start) return 'O fim precisa ser depois do início.';

    const activity = this.findActivity(entry.activityId);
    const periodStart = this.dateUtils.parseDate(activity?.startDate ?? null);
    const periodEnd = this.dateUtils.parseDate(activity?.endDate ?? null);
    if (periodStart && periodEnd) {
      periodEnd.setHours(23, 59, 59, 999);
      if (entry.start < periodStart || entry.end > periodEnd) {
        return 'O lançamento precisa estar dentro do período da atividade.';
      }
    }
    return null;
  }

  save(entry: LaunchEntry): Observable<unknown> {
    return this.releaseTimeService.postReleaseTime({
      id: '',
      activity: { id: entry.activityId },
      user: { id: this.userService.getCurrentUserId() ?? '' },
      description: entry.description,
      startDate: this.dateUtils.formatDateTime(entry.start),
      endDate: this.dateUtils.formatDateTime(entry.end),
    }).pipe(tap(() => this.saved$.next()));
  }

  /** Período do timer atual, pronto para salvar. */
  timerEntry(): LaunchEntry | null {
    const period = this.timer.stop();
    return period ? { activityId: period.activityId, description: period.description, start: period.startDate, end: period.endDate } : null;
  }

  /** Converte "dd/mm hh:mm" (ano atual) ou "dd/mm/aaaa hh:mm" em Date. */
  parseShortDateTime(value: string): Date {
    const match = value.trim().match(/^(\d{1,2})\/(\d{1,2})(?:\/(\d{4}))?\s+(\d{1,2}):(\d{2})$/);
    if (!match) return new Date(NaN);
    const [, day, month, year, hours, minutes] = match;
    return new Date(year ? +year : new Date().getFullYear(), +month - 1, +day, +hours, +minutes);
  }

  formatShortDateTime(date: Date): string {
    const pad = (n: number) => String(n).padStart(2, '0');
    return `${pad(date.getDate())}/${pad(date.getMonth() + 1)} ${pad(date.getHours())}:${pad(date.getMinutes())}`;
  }
}
