import { ActivatedRoute, Router } from '@angular/router';
import { Component, inject, OnDestroy, OnInit } from '@angular/core';
import { Subject, takeUntil } from 'rxjs';

import { DashboardService } from '../../../../../services/dashboard/dashboard.service';
import { UserService } from '../../../../../services/user/user.service';
import { ReleaseTimeService } from '../../../../../services/release-time/release-time.service';
import { GetDashboardResponse } from '../../../../../models/interfaces/dashboard/response/GetDashboardResponse';
import { GetReleaseTimeResponse } from '../../../../../models/interfaces/release-time/response/GetReleaseTimeResponse';
import { DateUtilsService } from '../../../../../shared/services/date-utils.service';
import { LaunchService } from '../../../../../shared/services/launch.service';

import { MessageService } from 'primeng/api';

interface PendingItem {
  activityId: number;
  projectId: number;
  activityName: string;
  projectName: string;
  deadline: string;
  status: string;
  overdue: boolean;
  userId: number;
  userName: string;
  initials: string;
}

interface WeekBar {
  label: string;
  minutes: number;
  height: number;
  isToday: boolean;
}

interface HoursRow {
  name: string;
  initials?: string;
  hours: number;
}

const WEEKDAYS = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'];
const WEEKDAYS_LONG = ['Domingo', 'Segunda', 'Terça', 'Quarta', 'Quinta', 'Sexta', 'Sábado'];
const MONTHS = ['janeiro', 'fevereiro', 'março', 'abril', 'maio', 'junho', 'julho', 'agosto', 'setembro', 'outubro', 'novembro', 'dezembro'];
/** Meta semanal usada no card "Esta semana". */
const WEEKLY_TARGET_HOURS = 40;

@Component({
  selector: 'app-dashboard-home',
  templateUrl: './dashboard-home.component.html',
  styleUrls: ['./dashboard-home.component.scss']
})
export class DashboardHomeComponent implements OnInit, OnDestroy {
  private readonly destroy$ = new Subject<void>();
  private readonly dashboardService = inject(DashboardService);
  private readonly userService = inject(UserService);
  private readonly releaseTimeService = inject(ReleaseTimeService);
  private readonly messageService = inject(MessageService);
  private readonly dateUtils = inject(DateUtilsService);
  private readonly launch = inject(LaunchService);
  private readonly router = inject(Router);
  private readonly route = inject(ActivatedRoute);

  readonly weeklyTarget = WEEKLY_TARGET_HOURS;
  readonly today = new Date();
  readonly todayLabel = `${WEEKDAYS_LONG[this.today.getDay()]}, ${String(this.today.getDate()).padStart(2, '0')} de ${MONTHS[this.today.getMonth()]}`;
  readonly monthName = MONTHS[this.today.getMonth()].replace(/^./, c => c.toUpperCase());
  readonly lastMonthName = MONTHS[(this.today.getMonth() + 11) % 12];

  isAdminUser = false;
  isLoading = true;
  currentUserId: number | null = null;
  search = '';

  totalProjects = 0;
  activeProjects = 0;
  plannedProjects = 0;
  doneProjects = 0;

  hoursThisMonth = 0;
  hoursLastMonth = 0;
  todayMinutes = 0;
  weekMinutes = 0;
  weekBars: WeekBar[] = [];
  projectHours: HoursRow[] = [];
  peopleHours: HoursRow[] = [];

  pending: PendingItem[] = [];
  myPending: PendingItem[] = [];
  dueThisWeek = 0;
  overdueCount = 0;

  ngOnInit(): void {
    this.isAdminUser = this.userService.isAdmin();
    const userId = this.userService.getCurrentUserId();
    this.currentUserId = userId ? parseInt(userId, 10) : null;

    this.launch.saved$
      .pipe(takeUntil(this.destroy$))
      .subscribe(() => this.loadEntries());

    this.loadDashboardData();
    this.loadEntries();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  get weekNumber(): number {
    return this.dateUtils.isoWeek(this.today);
  }

  get myOverdue(): number {
    return this.myPending.filter(p => p.overdue).length;
  }

  get initialsOfMe(): string {
    return this.initials(this.userService.getUsername() ?? '');
  }

  get monthComparison(): { label: string; positive: boolean } {
    if (!this.hoursLastMonth) {
      return { label: `Sem lançamentos em ${this.lastMonthName}`, positive: false };
    }
    const diff = Math.round((this.hoursThisMonth - this.hoursLastMonth) / this.hoursLastMonth * 100);
    return { label: `${diff > 0 ? '+' : ''}${diff}% em relação a ${this.lastMonthName}`, positive: diff >= 0 };
  }

  get projectsBreakdown(): string {
    const parts = [];
    if (this.plannedProjects) parts.push(`${this.plannedProjects} planejado${this.plannedProjects > 1 ? 's' : ''}`);
    if (this.doneProjects) parts.push(`${this.doneProjects} concluído${this.doneProjects > 1 ? 's' : ''}`);
    return parts.join(' · ') || 'Nenhum planejado';
  }

  get overdueLink(): (string | number)[] {
    const first = this.pending.find(p => p.overdue);
    return first ? ['/projects/activities', first.projectId] : ['/projects'];
  }

  get maxProjectHours(): number {
    return Math.max(1, ...this.projectHours.map(p => p.hours));
  }

  get maxPeopleHours(): number {
    return Math.max(1, ...this.peopleHours.map(p => p.hours));
  }

  barWidth(value: number, max: number): number {
    return max > 0 ? Math.max(2, Math.round((value / max) * 100)) : 0;
  }

  formatMinutes(minutes: number): string {
    const h = Math.floor(minutes / 60);
    const m = Math.round(minutes % 60);
    return m ? `${h}h ${String(m).padStart(2, '0')}m` : `${h}h`;
  }

  formatDeadline(deadline: string): string {
    const date = this.dateUtils.parseDate(deadline);
    return date ? `${String(date.getDate()).padStart(2, '0')}/${String(date.getMonth() + 1).padStart(2, '0')}` : '—';
  }

  searchProjects(): void {
    const term = this.search.trim();
    void this.router.navigate(['/projects'], { queryParams: term ? { busca: term } : {} });
  }

  private loadDashboardData(): void {
    this.isLoading = true;
    this.dashboardService.getDashboardDatas()
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: response => {
          this.processDashboard(response);
          this.isLoading = false;
        },
        error: () => {
          this.isLoading = false;
          this.messageService.add({ severity: 'error', summary: 'Erro', detail: 'Não foi possível carregar os dados do dashboard' });
        }
      });
  }

  private processDashboard(data: GetDashboardResponse): void {
    if (!data) return;

    const pending = (data.pendingActivitiesByUser ?? []).flatMap(user =>
      (user.pendingActivities ?? []).map(activity => ({
        activityId: activity.activityId,
        projectId: activity.projectId,
        activityName: activity.activityName,
        projectName: activity.projectName,
        deadline: activity.deadline,
        status: activity.status,
        overdue: activity.overdue,
        userId: user.userId,
        userName: user.userName,
        initials: user.initials,
      })));

    this.myPending = pending.filter(p => p.userId == this.currentUserId);
    this.pending = this.isAdminUser ? pending : this.myPending;

    const byDeadline = (a: PendingItem, b: PendingItem) =>
      Number(b.overdue) - Number(a.overdue) ||
      (this.dateUtils.parseDate(a.deadline)?.getTime() ?? 0) - (this.dateUtils.parseDate(b.deadline)?.getTime() ?? 0);
    this.pending.sort(byDeadline);
    this.myPending.sort(byDeadline);

    const weekEnd = new Date(this.dateUtils.startOfWeek(this.today).getTime() + 7 * 86400000);
    this.overdueCount = this.pending.filter(p => p.overdue).length;
    this.dueThisWeek = this.pending.filter(p => {
      const deadline = this.dateUtils.parseDate(p.deadline);
      return !p.overdue && !!deadline && deadline < weekEnd;
    }).length;

    const projects = this.isAdminUser
      ? data.projectHoursData ?? []
      : (data.projectHoursData ?? []).filter(p => this.pending.some(item => item.projectId === p.projectId));
    const countStatus = (status: string) => projects.filter(p => p.projectStatus?.toUpperCase() === status).length;
    this.totalProjects = projects.length;
    this.activeProjects = countStatus('EM_ANDAMENTO');
    this.plannedProjects = countStatus('PLANEJADO');
    this.doneProjects = countStatus('CONCLUIDO');
  }

  private loadEntries(): void {
    const userId = this.userService.getCurrentUserId();
    if (!userId) return;
    const source$ = this.isAdminUser ? this.releaseTimeService.getAllReleaseTimes() : this.releaseTimeService.getReleaseTimesByUserId(userId);
    source$
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: entries => this.buildHours(entries ?? []),
        error: () => this.buildHours([])
      });
  }

  private buildHours(entries: GetReleaseTimeResponse[]): void {
    const monthStart = new Date(this.today.getFullYear(), this.today.getMonth(), 1);
    const lastMonthStart = new Date(this.today.getFullYear(), this.today.getMonth() - 1, 1);
    const weekStart = this.dateUtils.startOfWeek(this.today);
    const weekDays = Array.from({ length: 7 }, (_, i) => new Date(weekStart.getFullYear(), weekStart.getMonth(), weekStart.getDate() + i));
    const mine = entries.filter(e => String(e.user?.id) === String(this.currentUserId));

    const withStart = entries.map(entry => ({ entry, start: this.dateUtils.parseDateTime(entry.startDate), minutes: this.dateUtils.entryMinutes(entry.startDate, entry.endDate) }));
    const month = withStart.filter(e => e.start && e.start >= monthStart);
    const lastMonth = withStart.filter(e => e.start && e.start >= lastMonthStart && e.start < monthStart);

    this.hoursThisMonth = month.reduce((sum, e) => sum + e.minutes, 0) / 60;
    this.hoursLastMonth = lastMonth.reduce((sum, e) => sum + e.minutes, 0) / 60;

    this.projectHours = this.groupHours(month, e => e.entry.activity?.project?.name ?? 'Sem projeto').slice(0, 5);
    this.peopleHours = this.groupHours(month, e => e.entry.user?.name ?? '—').slice(0, 5)
      .map(row => ({ ...row, initials: this.initials(row.name) }));

    const mineWithStart = withStart.filter(e => mine.includes(e.entry));
    const minutesByDay = weekDays.map(day => mineWithStart
      .filter(e => e.start?.toDateString() === day.toDateString())
      .reduce((sum, e) => sum + e.minutes, 0));
    const max = Math.max(60, ...minutesByDay);
    this.weekMinutes = minutesByDay.reduce((a, b) => a + b, 0);
    this.todayMinutes = minutesByDay[weekDays.findIndex(day => day.toDateString() === this.today.toDateString())] ?? 0;
    this.weekBars = weekDays.map((day, i) => ({
      label: WEEKDAYS[day.getDay()],
      minutes: minutesByDay[i],
      height: minutesByDay[i] ? Math.max(8, Math.round((minutesByDay[i] / max) * 160)) : 4,
      isToday: day.toDateString() === this.today.toDateString(),
    }));
  }

  private groupHours<T extends { minutes: number }>(items: T[], key: (item: T) => string): HoursRow[] {
    const totals = new Map<string, number>();
    items.forEach(item => totals.set(key(item), (totals.get(key(item)) ?? 0) + item.minutes));
    return [...totals.entries()]
      .map(([name, minutes]) => ({ name, hours: minutes / 60 }))
      .sort((a, b) => b.hours - a.hours);
  }

  private initials(name: string): string {
    return name.split(' ').filter(Boolean).slice(0, 2).map(part => part[0]).join('').toUpperCase();
  }
}
