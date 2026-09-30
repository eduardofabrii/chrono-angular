import { Component, OnInit, OnDestroy, inject, ViewChild, PLATFORM_ID } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { Subject, catchError, of, takeUntil } from 'rxjs';

import { GetProjectResponse } from '../../../../../models/interfaces/projects/response/GetProjectResponse';
import { GetActivityResponse } from '../../../../../models/interfaces/activities/response/GetActivityResponse';
import { GetReleaseTimeResponse } from '../../../../../models/interfaces/release-time/response/GetReleaseTimeResponse';
import { ProjectsService } from '../../../../../services/projects/projects.service';
import { ActivitiesService } from '../../../../../services/activities/activities.service';
import { ReleaseTimeService } from '../../../../../services/release-time/release-time.service';
import { UserService } from '../../../../../services/user/user.service';
import { DateUtilsService } from '../../../../../shared/services/date-utils.service';
import { LaunchService } from '../../../../../shared/services/launch.service';
import { ActivitiesFormComponent } from '../../components/activities-form/activities-form.component';

@Component({
  selector: 'app-activities-home',
  templateUrl: './activities-home.component.html',
  styleUrls: ['./activities-home.component.scss']
})
export class ActivitiesHomeComponent implements OnInit, OnDestroy {
  private readonly destroy$: Subject<void> = new Subject();
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly projectsService = inject(ProjectsService);
  private readonly activitiesService = inject(ActivitiesService);
  private readonly releaseTimeService = inject(ReleaseTimeService);
  private readonly userService = inject(UserService);
  private readonly dateUtils = inject(DateUtilsService);
  private readonly launch = inject(LaunchService);
  private readonly isBrowser = isPlatformBrowser(inject(PLATFORM_ID));

  @ViewChild(ActivitiesFormComponent) activitiesFormComponent!: ActivitiesFormComponent;

  activities: GetActivityResponse[] = [];
  filteredActivities: GetActivityResponse[] = [];
  project: GetProjectResponse = {} as GetProjectResponse;
  projectId = '';
  isLoading = true;
  isAdmin = false;
  statusFilter = 'TODAS';
  projectHours = 0;
  private hoursByActivity = new Map<string, number>();
  private currentUserId = '';

  readonly statusTabs = [
    { value: 'TODAS', label: 'Todas' },
    { value: 'ABERTA', label: 'Abertas' },
    { value: 'EM_ANDAMENTO', label: 'Em andamento' },
    { value: 'PAUSADA', label: 'Pausadas' },
    { value: 'CONCLUIDA', label: 'Concluídas' },
  ];

  private readonly priorityLabels: Record<string, string> = { ALTA: 'alta', MEDIA: 'média', BAIXA: 'baixa' };

  ngOnInit(): void {
    this.isAdmin = this.userService.isAdmin();
    this.currentUserId = String(this.userService.getCurrentUserId() ?? '');
    this.route.paramMap
      .pipe(takeUntil(this.destroy$))
      .subscribe(params => {
        this.projectId = params.get('id') ?? '';
        if (this.projectId) {
          this.loadProject();
          this.loadActivities();
        }
      });

    this.launch.saved$
      .pipe(takeUntil(this.destroy$))
      .subscribe(() => this.loadHours());
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  get responsibleName(): string {
    return (this.project.responsible as GetProjectResponse['responsible'] | undefined)?.name ?? '—';
  }

  get subtitle(): string {
    const priority = this.priorityLabels[this.project.priority];
    return [this.project.description, priority ? `prioridade ${priority}` : ''].filter(Boolean).join(' · ');
  }

  get priorityText(): string {
    const priority = this.priorityLabels[this.project.priority];
    return priority ? `Prioridade ${priority}` : '';
  }

  get completedCount(): number {
    return this.activities.filter(a => a.status === 'CONCLUIDA').length;
  }

  get completedPercent(): number {
    return this.activities.length ? Math.round(this.completedCount / this.activities.length * 100) : 0;
  }

  period(short = false): string {
    const start = this.dateUtils.formatDateForDisplay(this.project.startDate);
    const end = this.dateUtils.formatDateForDisplay(this.project.endDate);
    if (!start && !end) return 'Sem datas definidas';
    return `${short ? start.slice(0, 5) : start || '—'} – ${end || '—'}`;
  }

  activityPeriod(activity: GetActivityResponse): string {
    const format = (value: string) => this.dateUtils.formatDateForDisplay(value).slice(0, 5) || '—';
    return `${format(activity.startDate)} – ${format(activity.endDate)}`;
  }

  activityHours(activity: GetActivityResponse): number {
    return this.hoursByActivity.get(String(activity.id)) ?? 0;
  }

  initials(name?: string): string {
    return (name ?? '').split(' ').filter(Boolean).slice(0, 2).map(part => part[0]).join('').toUpperCase();
  }

  setStatusFilter(status: string): void {
    this.statusFilter = status;
    this.applyFilters();
  }

  countByStatus(status: string): number {
    return status === 'TODAS' ? this.activities.length : this.activities.filter(a => a.status === status).length;
  }

  isOverdue(activity: GetActivityResponse): boolean {
    const end = this.dateUtils.parseDate(activity.endDate);
    if (!end || activity.status === 'CONCLUIDA') return false;
    const today = new Date();
    return end < new Date(today.getFullYear(), today.getMonth(), today.getDate());
  }

  canLaunch(activity: GetActivityResponse): boolean {
    return activity.status !== 'CONCLUIDA' && String(activity.responsible?.id) === this.currentUserId;
  }

  releaseHours(activity: GetActivityResponse): void {
    const mobile = this.isBrowser && window.matchMedia('(max-width: 768px)').matches;
    void this.router.navigate([mobile ? '/launch' : '/hours'], { queryParams: { atividade: activity.id } });
  }

  editProject(): void {
    void this.router.navigate(['/projects'], { queryParams: { editar: this.projectId } });
  }

  openNewActivityDialog(): void {
    this.activitiesFormComponent.openNewActivityDialog();
  }

  openEditActivityDialog(activity: GetActivityResponse): void {
    this.activitiesFormComponent.openEditActivityDialog(activity);
  }

  handleActivityChanged(): void {
    this.loadActivities();
  }

  private applyFilters(): void {
    this.filteredActivities = this.activities.filter(a => this.statusFilter === 'TODAS' || a.status === this.statusFilter);
  }

  private loadProject(): void {
    this.projectsService.getProjectById(this.projectId)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: project => this.project = project ?? { id: this.projectId, name: 'Projeto não encontrado' } as GetProjectResponse,
        error: () => this.project = { id: this.projectId, name: 'Projeto não encontrado' } as GetProjectResponse
      });
  }

  private loadActivities(): void {
    this.isLoading = true;
    this.activitiesService.getActivitiesByProjectId(this.projectId)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: activities => {
          this.activities = activities ?? [];
          this.applyFilters();
          this.isLoading = false;
          this.loadHours();
        },
        error: () => this.isLoading = false
      });
  }

  private loadHours(): void {
    this.releaseTimeService.getAllReleaseTimes()
      .pipe(catchError(() => of([] as GetReleaseTimeResponse[])), takeUntil(this.destroy$))
      .subscribe(entries => {
        const ids = new Set(this.activities.map(a => String(a.id)));
        this.hoursByActivity = new Map();
        (entries ?? []).filter(e => ids.has(String(e.activity?.id))).forEach(entry => {
          const id = String(entry.activity.id);
          this.hoursByActivity.set(id, (this.hoursByActivity.get(id) ?? 0) + this.dateUtils.entryMinutes(entry.startDate, entry.endDate) / 60);
        });
        this.projectHours = [...this.hoursByActivity.values()].reduce((a, b) => a + b, 0);
      });
  }
}
