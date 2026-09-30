import { Component, EventEmitter, inject, Input, OnChanges, OnDestroy, Output } from '@angular/core';
import { FormBuilder, Validators } from '@angular/forms';
import { Subject, takeUntil } from 'rxjs';

import { UserService } from '../../../../../services/user/user.service';
import { ProjectsService } from '../../../../../services/projects/projects.service';
import { DateUtilsService } from '../../../../../shared/services/date-utils.service';
import { ActivitiesService } from './../../../../../services/activities/activities.service';
import { PostActivityRequest } from '../../../../../models/interfaces/activities/request/PostActivityRequest';
import { GetActivityResponse } from '../../../../../models/interfaces/activities/response/GetActivityResponse';

import { MessageService } from 'primeng/api';

interface ResponsibleOption {
  id: string;
  name: string;
  email: string;
}

@Component({
  selector: 'app-activities-form',
  templateUrl: './activities-form.component.html',
})
export class ActivitiesFormComponent implements OnChanges, OnDestroy {
  private readonly destroy$ = new Subject<void>();
  private readonly formBuilder = inject(FormBuilder);
  private readonly userService = inject(UserService);
  private readonly messageService = inject(MessageService);
  private readonly activitiesService = inject(ActivitiesService);
  private readonly dateUtils = inject(DateUtilsService);
  private readonly projectsService = inject(ProjectsService);

  @Input() projectId!: string;

  @Output() activityCreated = new EventEmitter<GetActivityResponse>();
  @Output() activityUpdated = new EventEmitter<GetActivityResponse>();
  @Output() activityDeleted = new EventEmitter<GetActivityResponse>();

  isFormVisible = false;
  isDeleteVisible = false;
  editingActivity: GetActivityResponse | null = null;
  responsibleOptions: ResponsibleOption[] = [];
  projectName = '';
  projectStart: Date | null = null;
  projectEnd: Date | null = null;

  readonly statusOptions = [
    { label: 'Aberta', value: 'ABERTA' },
    { label: 'Em andamento', value: 'EM_ANDAMENTO' },
    { label: 'Pausada', value: 'PAUSADA' },
    { label: 'Concluída', value: 'CONCLUIDA' }
  ];

  activityForm = this.formBuilder.group({
    name: ['', Validators.required],
    description: [''],
    responsible: [null as ResponsibleOption | null, Validators.required],
    status: ['ABERTA', Validators.required],
    startDate: [null as Date | null, Validators.required],
    endDate: [null as Date | null, Validators.required],
  });

  get projectPeriod(): string {
    return this.projectStart || this.projectEnd
      ? `${this.dateUtils.formatDateForDisplay(this.projectStart ?? '') || '—'} – ${this.dateUtils.formatDateForDisplay(this.projectEnd ?? '') || '—'}`
      : '';
  }

  ngOnChanges(): void {
    if (!this.projectId || !this.userService.isAdmin()) return;
    this.userService.getUsers()
      .pipe(takeUntil(this.destroy$))
      .subscribe(users => this.responsibleOptions = users
        .filter(user => user.active !== false)
        .map(user => ({ id: String(user.id), name: user.name, email: user.email })));

    this.projectsService.getProjectById(this.projectId)
      .pipe(takeUntil(this.destroy$))
      .subscribe(project => {
        this.projectName = project?.name ?? '';
        this.projectStart = this.dateUtils.parseDate(project?.startDate ?? null);
        this.projectEnd = this.dateUtils.parseDate(project?.endDate ?? null);
      });
  }

  openNewActivityDialog(): void {
    this.editingActivity = null;
    this.activityForm.reset({ status: 'ABERTA', startDate: new Date() });
    this.isFormVisible = true;
  }

  openEditActivityDialog(activity: GetActivityResponse): void {
    this.editingActivity = activity;
    this.activityForm.reset({
      name: activity.name,
      description: activity.description,
      responsible: this.responsibleOptions.find(user => user.id == activity.responsible?.id) ?? null,
      status: activity.status,
      startDate: this.dateUtils.parseDate(activity.startDate),
      endDate: this.dateUtils.parseDate(activity.endDate),
    });
    this.isFormVisible = true;
  }

  save(): void {
    if (this.activityForm.invalid) {
      this.activityForm.markAllAsTouched();
      this.showMessage('warn', 'Atenção', 'Preencha os campos obrigatórios.');
      return;
    }

    const value = this.activityForm.getRawValue();
    if (value.startDate && value.endDate && value.endDate < value.startDate) {
      this.showMessage('warn', 'Atenção', 'A data de fim precisa ser depois do início.');
      return;
    }
    if (this.projectStart && this.projectEnd && value.startDate && value.endDate &&
        (value.startDate < this.projectStart || value.endDate > this.projectEnd)) {
      this.showMessage('warn', 'Atenção', 'As datas precisam estar dentro do período do projeto.');
      return;
    }

    const request: PostActivityRequest = {
      project: { id: this.projectId },
      name: value.name ?? '',
      description: value.description ?? '',
      startDate: this.dateUtils.formatDateOnly(value.startDate),
      endDate: this.dateUtils.formatDateOnly(value.endDate),
      status: value.status ?? 'ABERTA',
      responsible: { id: value.responsible?.id ?? '', name: value.responsible?.name ?? '', email: value.responsible?.email ?? '' },
    };

    const editing = this.editingActivity;
    const request$ = editing ? this.activitiesService.putActivity(editing.id, request) : this.activitiesService.postActivity(request);
    request$.pipe(takeUntil(this.destroy$)).subscribe({
      next: (response: any) => {
        this.showMessage('success', 'Sucesso', editing ? 'Atividade atualizada!' : 'Atividade criada!');
        this.isFormVisible = false;
        editing ? this.activityUpdated.emit(response) : this.activityCreated.emit(response);
      },
      error: () => this.showMessage('error', 'Erro', 'Não foi possível salvar a atividade.')
    });
  }

  openDeleteDialog(): void {
    this.isFormVisible = false;
    this.isDeleteVisible = true;
  }

  deleteActivity(): void {
    const activity = this.editingActivity;
    if (!activity) return;
    this.activitiesService.deleteActivity(activity.id)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: () => {
          this.showMessage('success', 'Sucesso', 'Atividade excluída!');
          this.isDeleteVisible = false;
          this.activityDeleted.emit(activity);
        },
        error: () => this.showMessage('error', 'Erro', 'Essa atividade provavelmente está vinculada a um lançamento de horas.')
      });
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  private showMessage(severity: string, summary: string, detail: string): void {
    this.messageService.add({ severity, summary, detail, life: 3000 });
  }
}
