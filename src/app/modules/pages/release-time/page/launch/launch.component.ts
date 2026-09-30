import { Component, OnDestroy, OnInit, PLATFORM_ID, inject } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { Subject, takeUntil } from 'rxjs';
import { MessageService } from 'primeng/api';

import { ReleaseTimeService } from '../../../../../services/release-time/release-time.service';
import { UserService } from '../../../../../services/user/user.service';
import { DateUtilsService } from '../../../../../shared/services/date-utils.service';
import { LaunchEntry, LaunchService } from '../../../../../shared/services/launch.service';
import { TimerService } from '../../../../../shared/services/timer.service';

/** Meta diária usada na barra de progresso do timer. */
const DAILY_TARGET_MINUTES = 8 * 60;

/** Tela "Lançar horas" do celular (no desktop o lançamento fica na barra do Registro de horas). */
@Component({
  selector: 'app-launch',
  templateUrl: './launch.component.html',
  styleUrl: './launch.component.scss'
})
export class LaunchComponent implements OnInit, OnDestroy {
  private readonly destroy$ = new Subject<void>();
  private readonly router = inject(Router);
  private readonly route = inject(ActivatedRoute);
  private readonly messageService = inject(MessageService);
  private readonly releaseTimeService = inject(ReleaseTimeService);
  private readonly userService = inject(UserService);
  private readonly dateUtils = inject(DateUtilsService);
  private readonly isBrowser = isPlatformBrowser(inject(PLATFORM_ID));
  readonly launch = inject(LaunchService);
  readonly timer = inject(TimerService);

  readonly dailyTarget = DAILY_TARGET_MINUTES;
  mode: 'timer' | 'manual' = 'timer';
  selectedActivityId: string | null = null;
  description = '';
  manualStart = '';
  manualEnd = '';
  todaySavedMinutes = 0;
  saving = false;

  ngOnInit(): void {
    if (this.isBrowser && window.matchMedia('(min-width: 769px)').matches) {
      void this.router.navigate(['/hours'], { queryParams: { lancar: '1' }, replaceUrl: true });
      return;
    }

    this.resetManualPeriod();
    this.launch.loadActivities();
    this.launch.activities$
      .pipe(takeUntil(this.destroy$))
      .subscribe(activities => {
        if (!this.selectedActivityId && activities.length) this.selectedActivityId = activities[0].id;
      });

    const current = this.timer.current;
    if (current) {
      this.selectedActivityId = current.activityId;
      this.description = current.description;
    }

    const activityId = this.route.snapshot.queryParamMap.get('atividade');
    if (activityId && !current) this.selectedActivityId = activityId;

    this.loadTodayMinutes();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  get manualMinutes(): number {
    const start = this.launch.parseShortDateTime(this.manualStart);
    const end = this.launch.parseShortDateTime(this.manualEnd);
    return isNaN(start.getTime()) || isNaN(end.getTime()) ? 0 : Math.max(0, (end.getTime() - start.getTime()) / 60000);
  }

  stateLabel(running: boolean | undefined, elapsed: number): string {
    if (running === undefined) return 'Pronto para começar';
    if (!running) return 'Pausado';
    const start = new Date(Date.now() - elapsed * 1000);
    return `Rodando desde ${String(start.getHours()).padStart(2, '0')}:${String(start.getMinutes()).padStart(2, '0')}`;
  }

  todayPercent(elapsed: number): number {
    return Math.min(100, (this.todaySavedMinutes + elapsed / 60) / this.dailyTarget * 100);
  }

  formatMinutes(minutes: number): string {
    const h = Math.floor(minutes / 60);
    const m = Math.floor(minutes % 60);
    return `${h}h ${String(m).padStart(2, '0')}m`;
  }

  onActivityChange(activityId: string): void {
    this.selectedActivityId = activityId;
  }

  onDescriptionChange(value: string): void {
    this.description = value;
    this.timer.setDescription(value);
  }

  toggleTimer(): void {
    if (this.timer.current) {
      this.timer.toggle();
    } else if (this.selectedActivityId) {
      this.launch.startTimer(this.selectedActivityId, this.description);
    }
  }

  resetTimer(): void {
    if (this.timer.current && confirm('Descartar o tempo marcado neste timer?')) {
      this.timer.clear();
    }
  }

  save(): void {
    const entry: LaunchEntry | null = this.mode === 'timer'
      ? this.launch.timerEntry()
      : {
        activityId: this.selectedActivityId ?? '',
        description: this.description,
        start: this.launch.parseShortDateTime(this.manualStart),
        end: this.launch.parseShortDateTime(this.manualEnd),
      };
    if (!entry) return;

    entry.description = this.description;
    const error = this.launch.validate(entry);
    if (error) {
      this.messageService.add({ severity: 'warn', summary: 'Atenção', detail: error });
      return;
    }

    this.saving = true;
    this.launch.save(entry).pipe(takeUntil(this.destroy$)).subscribe({
      next: () => {
        this.saving = false;
        if (this.mode === 'timer') this.timer.clear();
        this.messageService.add({ severity: 'success', summary: 'Sucesso', detail: 'Horas lançadas!' });
        void this.router.navigate(['/hours']);
      },
      error: () => {
        this.saving = false;
        this.messageService.add({ severity: 'error', summary: 'Erro', detail: 'Não foi possível lançar as horas.' });
      }
    });
  }

  private resetManualPeriod(): void {
    const end = new Date();
    end.setMinutes(Math.floor(end.getMinutes() / 5) * 5, 0, 0);
    this.manualEnd = this.launch.formatShortDateTime(end);
    this.manualStart = this.launch.formatShortDateTime(new Date(end.getTime() - 60 * 60000));
  }

  private loadTodayMinutes(): void {
    const userId = this.userService.getCurrentUserId();
    if (!userId) return;
    const today = new Date().toDateString();
    this.releaseTimeService.getReleaseTimesByUserId(userId)
      .pipe(takeUntil(this.destroy$))
      .subscribe(entries => {
        this.todaySavedMinutes = (entries ?? [])
          .filter(entry => this.dateUtils.parseDateTime(entry.startDate)?.toDateString() === today)
          .reduce((sum, entry) => sum + this.dateUtils.entryMinutes(entry.startDate, entry.endDate), 0);
      });
  }
}
