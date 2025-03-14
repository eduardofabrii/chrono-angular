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
import { ProjectsService } from '../../../../services/projects/projects.service';

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
  public selectedActivity: any = null;
  public projectStartDate: string | null = null;
  public projectEndDate: string | null = null;
  public activityStartDate: string | null = null;
  public activityEndDate: string | null = null;

  private readonly userService = inject(UserService);
  private readonly activitiesService = inject(ActivitiesService);
  private readonly releaseTimeService = inject(ReleaseTimeService);
  private readonly messageService = inject(MessageService);
  private readonly formBuilder = inject(FormBuilder);
  private readonly dateUtils = inject(DateUtilsService);
  private readonly projectsService = inject(ProjectsService);

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
        .subscribe({
          next: (activities: GetActivityResponse[]) => {
            this.activities = activities;
            this.mappedActivities = activities.map(activity => ({
              label: activity.name,
              value: activity.id
            }));
          },
          error: (err) => {
            console.error('Error loading activities:', err);
            this.showMessage('error', 'Erro', 'Não foi possível carregar as atividades');
          }
        });
    } else {
      console.error('User ID not found');
    }
  }

  openDialog() {
    // Resetar o formulário completamente antes de abrir o dialog
    this.resetForm();
    this.isVisibleReleaseTimeDialog = true;
  }

  onCloseDialog() {
    this.isVisibleReleaseTimeDialog = false;
    this.resetForm();
  }

  // Método para resetar completamente o formulário e dados relacionados
  private resetForm(): void {
    // Resetar o formulário
    this.addReleaseTime.reset({
      activity: { id: '' },
      user: { id: '' },
      description: '',
      startDate: '',
      endDate: '',
      hours: ''
    });

    // Resetar a atividade selecionada
    this.selectedActivity = null;

    // Resetar períodos
    this.resetPeriods();
  }

  onActivityChange(event: any): void {
    const activityId = event.value;
    this.selectedActivity = this.activities.find(activity => activity.id === activityId);

    if (this.selectedActivity) {
      // Formatar datas da atividade
      this.activityStartDate = this.selectedActivity.startDate ?
        this.dateUtils.formatDateForDisplay(this.selectedActivity.startDate) : null;
      this.activityEndDate = this.selectedActivity.endDate ?
        this.dateUtils.formatDateForDisplay(this.selectedActivity.endDate) : null;

      // Buscar as datas do projeto associado à atividade
      this.getProjectFromActivity(this.selectedActivity);

      // Se a atividade tiver datas definidas, sugira-as para o lançamento
      if (this.selectedActivity.startDate && !this.addReleaseTime.get('startDate')?.value) {
        try {
          const startDate = new Date(this.selectedActivity.startDate);
          const now = new Date();

          // Definir a hora atual para a data de início da atividade
          startDate.setHours(now.getHours(), now.getMinutes(), 0, 0);

          // Converter para string no formato que o componente aceita (ISO)
          const isoDateString = startDate.toISOString();
          this.addReleaseTime.get('startDate')?.setValue(isoDateString);
        } catch (error) {
          console.error('Erro ao converter data de início:', error);
        }
      }

      if (this.selectedActivity.endDate && !this.addReleaseTime.get('endDate')?.value) {
        try {
          const endDate = new Date(this.selectedActivity.endDate);
          const now = new Date();

          // Definir a hora atual para a data de fim da atividade
          endDate.setHours(now.getHours(), now.getMinutes()+30, 0, 0);

          // Converter para string no formato que o componente aceita (ISO)
          const isoDateString = endDate.toISOString();
          this.addReleaseTime.get('endDate')?.setValue(isoDateString);
        } catch (error) {
          console.error('Erro ao converter data de fim:', error);
        }
      }
    } else {
      this.resetPeriods();
    }
  }

  private getProjectFromActivity(activity: any): void {
    if (!activity) {
      this.resetPeriods();
      return;
    }

    // Tentar encontrar o ID do projeto em diferentes estruturas possíveis
    let projectId = null;

    // Tenta encontrar o ID do projeto em diferentes formatos
    if (activity.project?.id) {
      projectId = activity.project.id;
    } else if (activity.projectId) {
      projectId = activity.projectId;
    }

    // Se encontrou o ID do projeto, busca os dados
    if (projectId) {
      this.getProjectDates(projectId);
    } else {
      this.resetProjectPeriod();
    }
  }

  private getProjectDates(projectId: string): void {
    if (!projectId) {
      this.resetProjectPeriod();
      return;
    }

    this.projectsService.getProjectById(projectId)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (project: any) => {
          // Formatar datas para exibição mais amigável (DD/MM/YYYY)
          this.projectStartDate = project.startDate ?
            this.dateUtils.formatDateForDisplay(project.startDate) : null;
          this.projectEndDate = project.endDate ?
            this.dateUtils.formatDateForDisplay(project.endDate) : null;
        },
        error: (err) => {
          console.error('Error fetching project data:', err);
          this.resetProjectPeriod();
          this.showMessage('error', 'Erro', 'Não foi possível buscar os dados do projeto');
        }
      });
  }

  private resetProjectPeriod(): void {
    this.projectStartDate = null;
    this.projectEndDate = null;
  }

  private resetActivityPeriod(): void {
    this.activityStartDate = null;
    this.activityEndDate = null;
  }

  private resetPeriods(): void {
    this.resetProjectPeriod();
    this.resetActivityPeriod();
  }

  releaseTime() {
    if (this.addReleaseTime.valid) {
      const { startDate, endDate, activity, description } = this.addReleaseTime.value;
      if (!startDate || !endDate) {
        this.showMessage('error', 'Erro', 'Datas inválidas!');
        return;
      }

      const start = new Date(startDate);
      const end = new Date(endDate);

      // Validar se as datas estão dentro do período da atividade (prioridade mais alta)
      if (this.activityStartDate && this.activityEndDate) {
        const activityStart = this.dateUtils.parseDate(this.activityStartDate);
        const activityEnd = this.dateUtils.parseDate(this.activityEndDate);

        if (activityStart && activityEnd) {
          // Configurar para início e fim do dia para comparação justa
          activityStart.setHours(0, 0, 0, 0);
          activityEnd.setHours(23, 59, 59, 999);

          if (start < activityStart || end > activityEnd) {
            this.showMessage('warn', 'Atenção', 'As datas de lançamento devem estar dentro do período da atividade!');
            return;
          }
        }
      }
      // Se não houver período de atividade definido, validar pelo período do projeto
      else if (this.projectStartDate && this.projectEndDate) {
        const projectStart = this.dateUtils.parseDate(this.projectStartDate);
        const projectEnd = this.dateUtils.parseDate(this.projectEndDate);

        if (projectStart && projectEnd) {
          // Configurar para início e fim do dia para comparação justa
          projectStart.setHours(0, 0, 0, 0);
          projectEnd.setHours(23, 59, 59, 999);

          if (start < projectStart || end > projectEnd) {
            this.showMessage('warn', 'Atenção', 'As datas de lançamento devem estar dentro do período do projeto!');
            return;
          }
        }
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
              this.resetForm(); // Usar o novo método para reset completo
              this.onCloseDialog();
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
