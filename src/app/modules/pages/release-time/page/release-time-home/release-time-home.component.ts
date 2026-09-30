import { Component, OnInit, OnDestroy, inject, ViewChild, ElementRef } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { Subject, takeUntil } from 'rxjs';
import { MessageService } from 'primeng/api';

import { GetReleaseTimeResponse } from '../../../../../models/interfaces/release-time/response/GetReleaseTimeResponse';
import { ReleaseTimeService } from '../../../../../services/release-time/release-time.service';
import { UserService } from '../../../../../services/user/user.service';
import { ReleaseTimeFormComponent } from '../../components/release-time-form/release-time-form.component';
import { DateUtilsService } from '../../../../../shared/services/date-utils.service';
import { TimerService } from '../../../../../shared/services/timer.service';
import { LaunchService } from '../../../../../shared/services/launch.service';

interface HourEntry {
  source: GetReleaseTimeResponse;
  start: Date;
  end: Date;
  minutes: number;
}

interface WeekDay {
  date: Date;
  label: string;
  short: string;
  number: string;
  minutes: number;
  isToday: boolean;
}

interface DayGroup {
  date: Date;
  title: string;
  minutes: number;
  isToday: boolean;
  entries: HourEntry[];
}

const WEEKDAYS = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'];
const WEEKDAYS_LONG = ['Domingo', 'Segunda', 'Terça', 'Quarta', 'Quinta', 'Sexta', 'Sábado'];
const MONTHS = ['janeiro', 'fevereiro', 'março', 'abril', 'maio', 'junho', 'julho', 'agosto', 'setembro', 'outubro', 'novembro', 'dezembro'];
const MONTHS_SHORT = ['jan', 'fev', 'mar', 'abr', 'mai', 'jun', 'jul', 'ago', 'set', 'out', 'nov', 'dez'];

@Component({
  selector: 'app-release-time-home',
  templateUrl: './release-time-home.component.html',
  styleUrl: './release-time-home.component.scss'
})
export class ReleaseTimeHomeComponent implements OnInit, OnDestroy {
  private readonly destroy$ = new Subject<void>();
  private readonly releaseTimeService = inject(ReleaseTimeService);
  private readonly userService = inject(UserService);
  private readonly dateUtils = inject(DateUtilsService);
  private readonly messageService = inject(MessageService);
  private readonly route = inject(ActivatedRoute);
  readonly launch = inject(LaunchService);
  readonly timer = inject(TimerService);

  @ViewChild(ReleaseTimeFormComponent) releaseTimeFormComponent!: ReleaseTimeFormComponent;
  @ViewChild('activitySelect') activitySelect?: ElementRef<HTMLSelectElement>;

  isAdmin = false;
  isLoading = true;
  saving = false;
  releaseTimeEntries: GetReleaseTimeResponse[] = [];

  mode: 'timer' | 'manual' = 'timer';
  selectedActivityId: string | null = null;
  description = '';
  manualStart = '';
  manualEnd = '';

  weekStart = this.dateUtils.startOfWeek(new Date());
  weekDays: WeekDay[] = [];
  dayGroups: DayGroup[] = [];
  weekMinutes = 0;
  selectedDay = this.startOfDay(new Date());

  ngOnInit(): void {
    this.isAdmin = this.userService.getRole() === 'ADMIN';
    this.resetManualPeriod();
    this.loadReleaseTimeEntries();
    this.launch.loadActivities();

    this.launch.activities$
      .pipe(takeUntil(this.destroy$))
      .subscribe(activities => {
        if (!this.selectedActivityId && activities.length) {
          this.selectedActivityId = activities[0].id;
        }
      });

    this.route.queryParamMap
      .pipe(takeUntil(this.destroy$))
      .subscribe(params => {
        const activityId = params.get('atividade');
        if (activityId) this.selectedActivityId = activityId;
        if (params.get('lancar') || activityId) {
          setTimeout(() => this.activitySelect?.nativeElement.focus());
        }
      });

    this.launch.saved$
      .pipe(takeUntil(this.destroy$))
      .subscribe(() => this.loadReleaseTimeEntries());
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  get weekLabel(): string {
    const end = this.addDays(this.weekStart, 6);
    return `${String(this.weekStart.getDate()).padStart(2, '0')} ${MONTHS_SHORT[this.weekStart.getMonth()]} – ${String(end.getDate()).padStart(2, '0')} ${MONTHS_SHORT[end.getMonth()]}`;
  }

  get isCurrentWeek(): boolean {
    return this.dateUtils.startOfWeek(new Date()).getTime() === this.weekStart.getTime();
  }

  get isTodayVisible(): boolean {
    return this.isCurrentWeek;
  }

  get manualMinutes(): number {
    const start = this.launch.parseShortDateTime(this.manualStart);
    const end = this.launch.parseShortDateTime(this.manualEnd);
    return isNaN(start.getTime()) || isNaN(end.getTime()) ? 0 : Math.max(0, (end.getTime() - start.getTime()) / 60000);
  }

  get selectedDayGroup(): DayGroup | undefined {
    return this.dayGroups.find(group => group.date.getTime() === this.selectedDay.getTime());
  }

  /** No celular os lançamentos do dia aparecem em ordem cronológica. */
  get selectedDayEntries(): HourEntry[] {
    return [...(this.selectedDayGroup?.entries ?? [])].reverse();
  }

  get selectedDayTitle(): string {
    const day = this.selectedDay;
    return day.getTime() === this.startOfDay(new Date()).getTime() ? 'Hoje' : `${WEEKDAYS_LONG[day.getDay()]}, ${String(day.getDate()).padStart(2, '0')}`;
  }

  // ---------- Barra de lançamento ----------
  startTimer(): void {
    if (!this.selectedActivityId) return;
    this.launch.startTimer(this.selectedActivityId, this.description);
  }

  stopAndSave(): void {
    const entry = this.launch.timerEntry();
    if (!entry) return;
    this.submit(entry, () => {
      this.timer.clear();
      this.description = '';
    });
  }

  saveManual(): void {
    this.submit({
      activityId: this.selectedActivityId ?? '',
      description: this.description,
      start: this.launch.parseShortDateTime(this.manualStart),
      end: this.launch.parseShortDateTime(this.manualEnd),
    }, () => {
      this.description = '';
      this.resetManualPeriod();
    });
  }

  onDescriptionChange(value: string): void {
    this.description = value;
    this.timer.setDescription(value);
  }

  // ---------- Semana ----------
  previousWeek(): void {
    this.weekStart = this.addDays(this.weekStart, -7);
    this.buildWeek();
  }

  nextWeek(): void {
    this.weekStart = this.addDays(this.weekStart, 7);
    this.buildWeek();
  }

  goToToday(): void {
    this.weekStart = this.dateUtils.startOfWeek(new Date());
    this.selectedDay = this.startOfDay(new Date());
    this.buildWeek();
  }

  selectDay(day: WeekDay): void {
    this.selectedDay = day.date;
  }

  // ---------- Lista ----------
  editEntry(entry: HourEntry): void {
    if (this.canEdit(entry.source)) {
      this.releaseTimeFormComponent.openEditReleaseTimeDialog(entry.source);
    }
  }

  canEdit(releaseTime: GetReleaseTimeResponse): boolean {
    return this.isAdmin || this.isMine(releaseTime);
  }

  isMine(releaseTime: GetReleaseTimeResponse): boolean {
    return String(this.userService.getCurrentUserId()) === String(releaseTime.user?.id);
  }

  handleReleaseTimeChanged(): void {
    this.loadReleaseTimeEntries();
  }

  formatMinutes(minutes: number): string {
    if (!minutes) return '—';
    const h = Math.floor(minutes / 60);
    const m = Math.round(minutes % 60);
    return `${h}h ${String(m).padStart(2, '0')}m`;
  }

  formatTime(date: Date | number): string {
    const d = new Date(date);
    return `${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}`;
  }

  runningStart(elapsedSeconds: number): number {
    return Date.now() - elapsedSeconds * 1000;
  }

  trackById = (_: number, entry: HourEntry) => entry.source.id;

  private submit(entry: Parameters<LaunchService['save']>[0], onSuccess: () => void): void {
    const error = this.launch.validate(entry);
    if (error) {
      this.messageService.add({ severity: 'warn', summary: 'Atenção', detail: error });
      return;
    }
    this.saving = true;
    this.launch.save(entry).pipe(takeUntil(this.destroy$)).subscribe({
      next: () => {
        this.saving = false;
        onSuccess();
        this.messageService.add({ severity: 'success', summary: 'Sucesso', detail: 'Horas lançadas!' });
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

  private loadReleaseTimeEntries(): void {
    const userId = this.userService.getCurrentUserId();
    const request$ = this.isAdmin
      ? this.releaseTimeService.getAllReleaseTimes()
      : userId ? this.releaseTimeService.getReleaseTimesByUserId(userId) : null;

    if (!request$) {
      this.isLoading = false;
      return;
    }

    request$.pipe(takeUntil(this.destroy$)).subscribe({
      next: entries => {
        this.releaseTimeEntries = entries ?? [];
        this.buildWeek();
        this.isLoading = false;
      },
      error: () => this.isLoading = false
    });
  }

  private buildWeek(): void {
    const entries: HourEntry[] = this.releaseTimeEntries
      .map(source => {
        const start = this.dateUtils.parseDateTime(source.startDate);
        const end = this.dateUtils.parseDateTime(source.endDate);
        if (!start || !end) return null;
        return { source, start, end, minutes: Math.max(0, (end.getTime() - start.getTime()) / 60000) };
      })
      .filter((entry): entry is HourEntry => entry !== null);

    const weekEnd = this.addDays(this.weekStart, 7);
    const inWeek = entries.filter(e => e.start >= this.weekStart && e.start < weekEnd);
    const today = this.startOfDay(new Date());

    this.weekDays = Array.from({ length: 7 }, (_, i) => {
      const date = this.addDays(this.weekStart, i);
      const minutes = inWeek.filter(e => this.sameDay(e.start, date)).reduce((sum, e) => sum + e.minutes, 0);
      return {
        date,
        label: `${WEEKDAYS[date.getDay()]} ${String(date.getDate()).padStart(2, '0')}`,
        short: WEEKDAYS[date.getDay()],
        number: String(date.getDate()).padStart(2, '0'),
        minutes,
        isToday: this.sameDay(date, today),
      };
    });

    if (!this.weekDays.some(day => day.date.getTime() === this.selectedDay.getTime())) {
      this.selectedDay = this.weekDays.find(day => day.isToday)?.date ?? this.weekStart;
    }

    this.weekMinutes = inWeek.reduce((sum, e) => sum + e.minutes, 0);

    this.dayGroups = this.weekDays
      .filter(day => day.minutes > 0 || (day.isToday && !!this.timer.current))
      .reverse()
      .map(day => ({
        date: day.date,
        title: `${WEEKDAYS_LONG[day.date.getDay()]}, ${String(day.date.getDate()).padStart(2, '0')} de ${MONTHS[day.date.getMonth()]}`,
        minutes: day.minutes,
        isToday: day.isToday,
        entries: inWeek
          .filter(e => this.sameDay(e.start, day.date))
          .sort((a, b) => b.start.getTime() - a.start.getTime()),
      }));
  }

  private startOfDay(date: Date): Date {
    return new Date(date.getFullYear(), date.getMonth(), date.getDate());
  }

  private addDays(date: Date, days: number): Date {
    return new Date(date.getFullYear(), date.getMonth(), date.getDate() + days);
  }

  private sameDay(a: Date, b: Date): boolean {
    return a.getFullYear() === b.getFullYear() && a.getMonth() === b.getMonth() && a.getDate() === b.getDate();
  }
}
