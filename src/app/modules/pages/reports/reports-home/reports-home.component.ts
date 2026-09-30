import { Component, OnDestroy, OnInit, inject } from '@angular/core';
import { Subject, forkJoin, takeUntil } from 'rxjs';
import { MessageService } from 'primeng/api';

import { ProjectsService } from '../../../../services/projects/projects.service';
import { ReleaseTimeService } from '../../../../services/release-time/release-time.service';
import { ReportService } from '../../../../services/report/report.service';
import { UserService } from '../../../../services/user/user.service';
import { GetProjectResponse } from '../../../../models/interfaces/projects/response/GetProjectResponse';
import { GetReleaseTimeResponse } from '../../../../models/interfaces/release-time/response/GetReleaseTimeResponse';
import { DateUtilsService } from '../../../../shared/services/date-utils.service';

interface ReportOption {
  id: string;
  name: string;
  status: string;
  hours: number;
}

@Component({
  selector: 'app-reports-home',
  templateUrl: './reports-home.component.html',
  styleUrls: ['./reports-home.component.scss']
})
export class ReportsHomeComponent implements OnInit, OnDestroy {
  private readonly destroy$ = new Subject<void>();
  private readonly projectsService = inject(ProjectsService);
  private readonly releaseTimeService = inject(ReleaseTimeService);
  private readonly reportService = inject(ReportService);
  private readonly userService = inject(UserService);
  private readonly messageService = inject(MessageService);
  private readonly dateUtils = inject(DateUtilsService);

  private projects: GetProjectResponse[] = [];
  private entries: GetReleaseTimeResponse[] = [];

  from = new Date(new Date().getFullYear(), new Date().getMonth(), 1);
  to = new Date(new Date().getFullYear(), new Date().getMonth() + 1, 0);
  options: ReportOption[] = [];
  selected = new Set<string>();
  isLoading = true;

  ngOnInit(): void {
    const userId = this.userService.getCurrentUserId() ?? '';
    const entries$ = this.userService.isAdmin()
      ? this.releaseTimeService.getAllReleaseTimes()
      : this.releaseTimeService.getReleaseTimesByUserId(userId);

    forkJoin({ projects: this.projectsService.getAllProjects(), entries: entries$ })
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: ({ projects, entries }) => {
          this.projects = projects ?? [];
          this.entries = entries ?? [];
          this.buildOptions();
          this.selected = new Set(this.options.filter(o => o.status === 'EM_ANDAMENTO').map(o => o.id));
          this.isLoading = false;
        },
        error: () => {
          this.isLoading = false;
          this.messageService.add({ severity: 'error', summary: 'Erro', detail: 'Não foi possível carregar os dados do relatório' });
        }
      });
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  get rows(): ReportOption[] {
    return this.options.filter(o => this.selected.has(o.id));
  }

  get total(): number {
    return this.rows.reduce((sum, row) => sum + row.hours, 0);
  }

  get maxHours(): number {
    return Math.max(0, ...this.rows.map(row => row.hours));
  }

  get countLabel(): string {
    const n = this.rows.length;
    return `${n} ${n === 1 ? 'projeto' : 'projetos'}`;
  }

  get periodLabel(): string {
    return `${this.dateUtils.formatDateForDisplay(this.from)} – ${this.dateUtils.formatDateForDisplay(this.to)}`;
  }

  share(row: ReportOption): number {
    return this.total ? Math.round(row.hours / this.total * 100) : 0;
  }

  barWidth(row: ReportOption): number {
    return this.maxHours ? Math.round(row.hours / this.maxHours * 100) : 0;
  }

  toggle(option: ReportOption): void {
    this.selected.has(option.id) ? this.selected.delete(option.id) : this.selected.add(option.id);
  }

  onPeriodChange(): void {
    this.buildOptions();
  }

  generatePdf(): void {
    if (!this.rows.length) {
      this.messageService.add({ severity: 'warn', summary: 'Atenção', detail: 'Selecione ao menos um projeto.' });
      return;
    }
    this.reportService.generateProjectHoursReport(this.rows, { period: this.periodLabel });
  }

  private buildOptions(): void {
    const from = new Date(this.from.getFullYear(), this.from.getMonth(), this.from.getDate());
    const to = new Date(this.to.getFullYear(), this.to.getMonth(), this.to.getDate(), 23, 59, 59, 999);
    const minutesByProject = new Map<string, number>();

    this.entries.forEach(entry => {
      const start = this.dateUtils.parseDateTime(entry.startDate);
      const projectId = String(entry.activity?.project?.id ?? '');
      if (!start || !projectId || start < from || start > to) return;
      minutesByProject.set(projectId, (minutesByProject.get(projectId) ?? 0) + this.dateUtils.entryMinutes(entry.startDate, entry.endDate));
    });

    this.options = this.projects
      .map(project => ({ id: String(project.id), name: project.name, status: project.status, hours: (minutesByProject.get(String(project.id)) ?? 0) / 60 }))
      .sort((a, b) => b.hours - a.hours);
  }
}
