import { Component, inject, OnDestroy, OnInit } from '@angular/core';
import { FormBuilder, Validators } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { Subject, forkJoin, of, catchError, takeUntil } from 'rxjs';

import { MessageService } from 'primeng/api';

import { GetProjectResponse } from '../../../../models/interfaces/projects/response/GetProjectResponse';
import { PostProjectRequest } from '../../../../models/interfaces/projects/request/PostProjectRequest';
import { GetActivityResponse } from '../../../../models/interfaces/activities/response/GetActivityResponse';
import { DateUtilsService } from '../../../../shared/services/date-utils.service';
import { ProjectsService } from '../../../../services/projects/projects.service';
import { ActivitiesService } from '../../../../services/activities/activities.service';
import { DashboardService } from '../../../../services/dashboard/dashboard.service';
import { UserService } from '../../../../services/user/user.service';

interface ProjectRow {
  project: GetProjectResponse;
  hours: number;
  activities: number;
  progress: number;
}

@Component({
  selector: 'app-projects-home',
  templateUrl: './projects-home.component.html',
  styleUrls: ['./projects-home.component.scss']
})
export class ProjectsHomeComponent implements OnInit, OnDestroy {
  private readonly destroy$ = new Subject<void>();
  private readonly projectsService = inject(ProjectsService);
  private readonly activitiesService = inject(ActivitiesService);
  private readonly dashboardService = inject(DashboardService);
  private readonly userService = inject(UserService);
  private readonly formBuilder = inject(FormBuilder);
  private readonly messageService = inject(MessageService);
  private readonly dateUtils = inject(DateUtilsService);
  private readonly route = inject(ActivatedRoute);

  rows: ProjectRow[] = [];
  filteredRows: ProjectRow[] = [];
  responsibleOptions: { id: string; name: string; email: string }[] = [];
  isAdmin = false;
  isLoading = true;
  search = '';
  statusFilter = 'TODOS';

  isFormVisible = false;
  isDeleteVisible = false;
  editingProject: GetProjectResponse | null = null;
  deleteError = '';

  readonly statusTabs = [
    { value: 'TODOS', label: 'Todos' },
    { value: 'EM_ANDAMENTO', label: 'Em andamento' },
    { value: 'PLANEJADO', label: 'Planejados' },
    { value: 'CONCLUIDO', label: 'Concluídos' },
    { value: 'CANCELADO', label: 'Cancelados' },
  ];

  readonly priorityOptions = [
    { label: 'Alta', value: 'ALTA' },
    { label: 'Média', value: 'MEDIA' },
    { label: 'Baixa', value: 'BAIXA' }
  ];

  readonly statusOptions = [
    { label: 'Planejado', value: 'PLANEJADO' },
    { label: 'Em andamento', value: 'EM_ANDAMENTO' },
    { label: 'Concluído', value: 'CONCLUIDO' },
    { label: 'Cancelado', value: 'CANCELADO' }
  ];

  private readonly priorityLabels: Record<string, string> = { ALTA: 'Alta', MEDIA: 'Média', BAIXA: 'Baixa' };

  projectForm = this.formBuilder.group({
    name: ['', Validators.required],
    description: [''],
    responsible: [null as { id: string; name: string; email: string } | null, Validators.required],
    priority: ['MEDIA', Validators.required],
    startDate: [null as Date | null, Validators.required],
    endDate: [null as Date | null, Validators.required],
    status: ['PLANEJADO', Validators.required],
    estimatedHours: [null as number | null, Validators.min(0)],
  });

  ngOnInit(): void {
    this.isAdmin = this.userService.isAdmin();
    this.search = this.route.snapshot.queryParamMap.get('busca') ?? '';
    if (this.isAdmin) {
      this.userService.getUsersAdmin()
        .pipe(takeUntil(this.destroy$))
        .subscribe(users => this.responsibleOptions = users.map(u => ({ id: String(u.id), name: u.name, email: u.email })));
    }
    this.loadProjects();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  get subtitle(): string {
    return `${this.rows.length} ${this.rows.length === 1 ? 'projeto' : 'projetos'} · ${this.countByStatus('EM_ANDAMENTO')} em andamento`;
  }

  countByStatus(status: string): number {
    return status === 'TODOS' ? this.rows.length : this.rows.filter(r => r.project.status === status).length;
  }

  setStatusFilter(status: string): void {
    this.statusFilter = status;
    this.applyFilters();
  }

  applyFilters(): void {
    const term = this.search.trim().toLowerCase();
    this.filteredRows = this.rows.filter(({ project }) =>
      (this.statusFilter === 'TODOS' || project.status === this.statusFilter) &&
      (!term || project.name.toLowerCase().includes(term) || project.description?.toLowerCase().includes(term)));
  }

  priorityLabel(priority: string): string {
    return this.priorityLabels[priority] ?? priority ?? '—';
  }

  period(project: GetProjectResponse, short = false): string {
    if (!project.startDate && !project.endDate) return short ? 'Sem datas' : 'Sem datas definidas';
    const format = (value: string) => {
      const display = this.dateUtils.formatDateForDisplay(value) || '—';
      return short ? display.slice(0, 5) : display;
    };
    return `${format(project.startDate)} – ${format(project.endDate)}`;
  }

  initials(name?: string): string {
    return (name ?? '').split(' ').filter(Boolean).slice(0, 2).map(part => part[0]).join('').toUpperCase();
  }

  openNewProjectDialog(): void {
    this.editingProject = null;
    this.projectForm.reset({ priority: 'MEDIA', status: 'PLANEJADO', startDate: new Date() });
    this.isFormVisible = true;
  }

  openEditProjectDialog(project: GetProjectResponse): void {
    this.editingProject = project;
    this.projectForm.reset({
      name: project.name,
      description: project.description,
      responsible: this.responsibleOptions.find(u => u.id == project.responsible?.id) ?? null,
      priority: project.priority,
      startDate: this.dateUtils.parseDate(project.startDate),
      endDate: this.dateUtils.parseDate(project.endDate),
      status: project.status,
      estimatedHours: project.estimatedHours ?? null,
    });
    this.isFormVisible = true;
  }

  saveProject(): void {
    if (this.projectForm.invalid) {
      this.projectForm.markAllAsTouched();
      this.messageService.add({ severity: 'warn', summary: 'Atenção', detail: 'Preencha os campos obrigatórios.' });
      return;
    }

    const value = this.projectForm.getRawValue();
    const request: PostProjectRequest = {
      name: value.name ?? '',
      description: value.description ?? '',
      startDate: this.dateUtils.formatDateOnly(value.startDate),
      endDate: this.dateUtils.formatDateOnly(value.endDate),
      status: value.status ?? 'PLANEJADO',
      responsible: { id: value.responsible?.id ?? '', name: value.responsible?.name ?? '', email: value.responsible?.email ?? '' },
      priority: value.priority ?? 'MEDIA',
      estimatedHours: value.estimatedHours || null,
      createdDate: this.dateUtils.formatDateTime(new Date()),
    };

    const request$ = this.editingProject
      ? this.projectsService.putProject(this.editingProject.id, { ...request, id: this.editingProject.id })
      : this.projectsService.postProject(request);

    request$.pipe(takeUntil(this.destroy$)).subscribe({
      next: () => {
        this.messageService.add({ severity: 'success', summary: 'Sucesso', detail: this.editingProject ? 'Projeto atualizado!' : 'Projeto criado!' });
        this.isFormVisible = false;
        this.loadProjects();
      },
      error: () => this.messageService.add({ severity: 'error', summary: 'Erro', detail: 'Não foi possível salvar o projeto.' })
    });
  }

  openDeleteDialog(): void {
    this.deleteError = '';
    this.isFormVisible = false;
    this.isDeleteVisible = true;
  }

  deleteProject(): void {
    if (!this.editingProject) return;
    this.projectsService.deleteProject(this.editingProject.id)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: () => {
          this.messageService.add({ severity: 'success', summary: 'Sucesso', detail: 'Projeto excluído!' });
          this.isDeleteVisible = false;
          this.loadProjects();
        },
        error: () => this.deleteError = 'Não é possível excluir um projeto que possui atividades.'
      });
  }

  /** Abre a edição quando a tela de atividades pede (?editar=id). */
  private openRequestedEdit(): void {
    const id = this.route.snapshot.queryParamMap.get('editar');
    const row = id ? this.rows.find(r => String(r.project.id) === id) : undefined;
    if (row && this.isAdmin) {
      this.openEditProjectDialog(row.project);
    }
  }

  private loadProjects(): void {
    const userId = this.userService.getCurrentUserId() ?? '';
    const projects$ = this.isAdmin ? this.projectsService.getAllProjects() : this.projectsService.findProjectsByActivityUserId(userId);

    forkJoin({
      projects: projects$,
      activities: this.activitiesService.getAllActivities().pipe(catchError(() => of([] as GetActivityResponse[]))),
      dashboard: this.dashboardService.getDashboardDatas().pipe(catchError(() => of(null))),
    })
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: ({ projects, activities, dashboard }) => {
          const hoursById = new Map((dashboard?.projectHoursData ?? []).map(p => [String(p.projectId), p.totalHours ?? 0]));
          this.rows = (projects ?? []).map(project => {
            const own = (activities ?? []).filter(a => String(a.project?.id) === String(project.id));
            const done = own.filter(a => a.status === 'CONCLUIDA').length;
            const progress = project.status === 'CONCLUIDO' ? 100 : own.length ? Math.round(done / own.length * 100) : 0;
            return { project, hours: hoursById.get(String(project.id)) ?? 0, activities: own.length, progress };
          });
          this.applyFilters();
          this.isLoading = false;
          this.openRequestedEdit();
        },
        error: () => {
          this.isLoading = false;
          this.messageService.add({ severity: 'error', summary: 'Erro', detail: 'Não foi possível carregar os projetos.' });
        }
      });
  }
}
