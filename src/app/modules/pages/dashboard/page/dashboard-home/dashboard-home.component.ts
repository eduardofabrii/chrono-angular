import { Component, inject, OnDestroy, OnInit } from '@angular/core';
import { Subject, takeUntil } from 'rxjs';

import { DashboardService } from '../../../../../services/dashboard/dashboard.service';
import { UserService } from '../../../../../services/user/user.service';

import { MessageService } from 'primeng/api';

@Component({
  selector: 'app-dashboard-home',
  templateUrl: './dashboard-home.component.html',
  styleUrls: ['./dashboard-home.component.scss']
})
export class DashboardHomeComponent implements OnInit, OnDestroy {
  private readonly destroy$ = new Subject<void>();

  projectStatusData: any;
  projectHoursData: any;
  userHoursData: any;
  currentUserId: any;

  totalProjects = 0;
  totalActivities = 0;
  totalHours = 0;
  activeProjects = 0;
  projectInProgressPercentage = 0;

  topProjects: { name: string; hours: number; status: string }[] = [];
  topUsers: { name: string; hours: number; initials: string; color: string }[] = [];

  // Atividades pendentes do usuario logado
  pendingActivities: {
    activityId: number;
    activityName: string;
    projectName: string;
    deadline: string;
    status: string;
    overdue: boolean;
    projectId: number;
  }[] = [];

  currentUser: {
    userId: number;
    userName: string;
    initials: string;
  } | null = null;

  pendingActivitiesLoading = false;

  maxProjectHours = 0;
  maxUserHours = 0;

  // Configurações do gráfico de status dos projetos
  chartOptions = {
    plugins: { legend: { position: 'bottom', display: true } },
    responsive: true,
    maintainAspectRatio: false,
    cutout: '70%'
  };

  isLoading = true;

  private readonly userColors = ['#3B82F6', '#10B981', '#F59E0B', '#8B5CF6', '#EC4899', '#6366F1', '#14B8A6', '#D946EF', '#F97316', '#0EA5E9'];

  private readonly dashboardService = inject(DashboardService);
  private readonly userService = inject(UserService);
  private readonly messageService = inject(MessageService);

  ngOnInit() {
    const userIdFromService = this.userService.getCurrentUserId();
    this.currentUserId = userIdFromService ? parseInt(userIdFromService, 10) : null;
    this.loadDashboardData();
  }

  ngOnDestroy() {
    this.destroy$.next();
    this.destroy$.complete();
  }

  loadDashboardData() {
    this.isLoading = true;
    setTimeout(() => {
      this.dashboardService.getDashboardDatas()
        .pipe(takeUntil(this.destroy$))
        .subscribe({
          next: (response) => {
            setTimeout(() => {
              this.processApiResponse(response);
            }, 800);
          },
          error: () => this.handleError()
        });
    }, 300);
  }

  processApiResponse(data: any) {
    if (!data) {
      return;
    }

    this.totalProjects = data.totalProjects || 0;
    this.totalActivities = data.totalActivities || 0;
    this.totalHours = data.totalHours || 0;

    // Calcula a porcentagem de projetos em andamento
    const inProgressStatus = data.projectStatusCounts?.find((s: any) => ['in-progress', 'em andamento', 'em_andamento'].includes(s?.status?.toLowerCase()));
    this.activeProjects = inProgressStatus?.count || 0;

    // Calcula a porcentagem de projetos em andamento em relação ao total de projetos
    const totalStatusCount = data.projectStatusCounts?.reduce((sum: number, status: any) => sum + (status?.count || 0), 0) || 0;
    this.projectInProgressPercentage = totalStatusCount > 0 ? Math.round((this.activeProjects / totalStatusCount) * 100) : 0;

    this.processProjectHoursData(data.projectHoursData || []);
    this.processUserHoursData(data.userHoursData || []);
    this.processPendingActivities(data.pendingActivitiesByUser || []);

    this.initCharts(data.projectStatusCounts || []);
    this.isLoading = false;
  }

  // Processa atividades pendentes do usuario logado
  processPendingActivities(userActivities: any[]) {
    if (!userActivities?.length) {
      this.pendingActivities = [];
      return;
    }

    // Procura usuario pela ID (como número ou string)
    const userEntry = this.currentUserId && userActivities.find(
      user => user.userId == this.currentUserId
    );

    if (userEntry) {
      this.currentUser = {
        userId: userEntry.userId,
        userName: userEntry.userName,
        initials: userEntry.initials
      };
      this.pendingActivities = userEntry.pendingActivities || [];
      return;
    }

    // Fallback: tenta encontrar na lista de topUsers
    this.pendingActivities = [];
    if (this.currentUserId && this.topUsers?.length) {
      const userFromHours = this.topUsers.find(user =>
        parseInt(user.name, 10) === this.currentUserId
      );

      if (userFromHours) {
        this.currentUser = {
          userId: this.currentUserId,
          userName: userFromHours.name,
          initials: userFromHours.initials
        };
      }
    }
  }

  // Processa os dados dos projetos para exibição no gráfico de horas dos projetos
  processProjectHoursData(projectsData: any[]) {
    this.topProjects = projectsData
      .filter(project => project?.projectName && project.totalHours >= 0)
      .sort((a, b) => b.totalHours - a.totalHours)
      .map(project => ({
        name: project.projectName || 'Projeto sem nome',
        hours: project.totalHours || 0,
        status: project.projectStatus || 'not-started'
      }));

    this.maxProjectHours = this.topProjects.length > 0 ? Math.max(...this.topProjects.map(project => project.hours), 1) : 1;
  }

  getProjectSeverity(status: string): 'success' | 'info' | 'warning' | 'danger' | 'secondary' | 'contrast' {
    if (!status) return 'secondary';

    const statusLower = status.toLowerCase();

    switch(statusLower) {
      case 'in-progress':
      case 'em andamento':
      case 'em_andamento': return 'info';

      case 'completed':
      case 'concluido':
      case 'concluído': return 'success';

      case 'delayed':
      case 'atrasado': return 'danger';

      case 'not-started':
      case 'não iniciado':
      case 'nao_iniciado': return 'warning';

      case 'cancelado':
      case 'canceled': return 'danger';

      default: return 'secondary';
    }
  }

  getProjectHoursPercentage(hours: number): number {
    return Math.round((hours / this.maxProjectHours) * 100);
  }

  getUserHoursPercentage(hours: number): number {
    return Math.round((hours / this.maxUserHours) * 100);
  }

  // Processa os dados dos usuários para exibição no gráfico de horas dos usuários
  processUserHoursData(usersData: any[]) {
    this.topUsers = usersData
      .filter(user => user?.userName && user.totalHours >= 0)
      .sort((a, b) => b.totalHours - a.totalHours)
      .slice(0, 5)
      .map((user, index) => ({
        name: user.userName || 'Usuário sem nome',
        hours: user.totalHours || 0,
        initials: user.initials || this.getInitials(user.userName || ''),
        color: this.userColors[index % this.userColors.length]
      }));

    this.maxUserHours = this.topUsers.length > 0 ? Math.max(...this.topUsers.map(user => user.hours), 1) : 1;
  }

  getInitials(name: string): string {
    return name.split(' ').filter(part => part.length > 0).map(part => part[0].toUpperCase()).slice(0, 2).join('') || 'NA';
  }

  initCharts(statusCounts: any[]) {
    this.initProjectStatusChart(statusCounts);
    this.initProjectHoursChart();
    this.initUserHoursChart();
  }

  // Inicializa o gráfico de status dos projetos
  initProjectStatusChart(statusCounts: any[]) {
    const documentStyle = getComputedStyle(document.documentElement);
    const statusColorMap: { [key: string]: [string, string] } = {
      'in-progress': ['--blue-500', '--blue-400'],
      'em andamento': ['--blue-500', '--blue-400'],
      'em_andamento': ['--blue-500', '--blue-400'],
      'completed': ['--green-500', '--green-400'],
      'concluido': ['--green-500', '--green-400'],
      'concluído': ['--green-500', '--green-400'],
      'delayed': ['--red-500', '--red-400'],
      'atrasado': ['--red-500', '--red-400'],
      'not-started': ['--gray-500', '--gray-400'],
      'não iniciado': ['--gray-500', '--gray-400'],
      'nao_iniciado': ['--gray-500', '--gray-400'],
      'cancelado': ['--red-800', '--red-700']
    };

    const { labels, data, backgroundColors, hoverBackgroundColors } = statusCounts.reduce((acc, statusItem) => {
      if (!statusItem?.status) return acc;

      const statusKey = statusItem.status.toLowerCase();
      const [bgColor, hoverColor] = statusColorMap[statusKey] || ['--gray-500', '--gray-400'];

      acc.labels.push(this.getProjectStatus(statusKey));
      acc.data.push(statusItem.count || 0);
      acc.backgroundColors.push(documentStyle.getPropertyValue(bgColor));
      acc.hoverBackgroundColors.push(documentStyle.getPropertyValue(hoverColor));

      return acc;
    }, { labels: [], data: [], backgroundColors: [], hoverBackgroundColors: [] });

    this.projectStatusData = {
      labels: labels.length ? labels : ['Sem dados'],
      datasets: [{
        data: data.length ? data : [100],
        backgroundColor: backgroundColors.length ? backgroundColors : [documentStyle.getPropertyValue('--gray-400')],
        hoverBackgroundColor: hoverBackgroundColors.length ? hoverBackgroundColors : [documentStyle.getPropertyValue('--gray-300')]
      }]
    };
  }

  // Inicializa o gráfico de horas dos projetos
  initProjectHoursChart() {
    const documentStyle = getComputedStyle(document.documentElement);
    const top5Projects = this.topProjects.slice(0, 5);

    this.projectHoursData = {
      labels: top5Projects.length ? top5Projects.map(project => project.name) : ['Sem dados'],
      datasets: [{
        label: 'Horas',
        data: top5Projects.length ? top5Projects.map(project => project.hours) : [0],
        backgroundColor: documentStyle.getPropertyValue('--blue-500'),
        borderColor: documentStyle.getPropertyValue('--blue-500')
      }]
    };
  }

  // Inicializa o gráfico de horas dos usuários
  initUserHoursChart() {
    const documentStyle = getComputedStyle(document.documentElement);

    this.userHoursData = {
      labels: this.topUsers.length ? this.topUsers.map(user => user.name.split(' ')[0]) : ['Sem dados'],
      datasets: [{
        label: 'Horas',
        data: this.topUsers.length ? this.topUsers.map(user => user.hours) : [0],
        backgroundColor: documentStyle.getPropertyValue('--indigo-500'),
        borderColor: documentStyle.getPropertyValue('--indigo-500')
      }]
    };
  }

  getProjectStatus(status: string): string {
    const statusMap: { [key: string]: string } = {
      'in-progress': 'Em andamento',
      'em andamento': 'Em andamento',
      'em_andamento': 'Em andamento',
      'completed': 'Concluído',
      'concluido': 'Concluído',
      'concluído': 'Concluído',
      'delayed': 'Atrasado',
      'atrasado': 'Atrasado',
      'not-started': 'Não iniciado',
      'não iniciado': 'Não iniciado',
      'nao_iniciado': 'Não iniciado',
      'cancelado': 'Cancelado',
      'canceled': 'Cancelado'
    };

    return statusMap[status.toLowerCase()] || status || 'Não definido';
  }

  handleError() {
    this.messageService.add({ severity: 'error', summary: 'Erro', detail: 'Não foi possível carregar os dados do dashboard' });
    this.isLoading = false;
  }

  getActivityPriority(priority?: string): 'success' | 'info' | 'warning' | 'danger' | 'secondary' {
    if (!priority) return 'secondary';

    const priorityLower = priority.toLowerCase();

    switch(priorityLower) {
      case 'high':
      case 'alta':
        return 'danger';
      case 'medium':
      case 'média':
      case 'media':
        return 'warning';
      case 'low':
      case 'baixa':
        return 'success';
      default:
        return 'info';
    }
  }

  getActivityPriorityLabel(priority?: string): string {
    if (!priority) return 'Normal';

    const priorityLower = priority.toLowerCase();

    switch(priorityLower) {
      case 'high':
        return 'Alta';
      case 'medium':
        return 'Média';
      case 'low':
        return 'Baixa';
      default:
        return priority;
    }
  }

  isActivityOverdue(dueDate?: Date): boolean {
    if (!dueDate) return false;
    const today = new Date();
    const due = new Date(dueDate);
    return due < today;
  }

  getActivityStatus(status: string): string {
    const statusMap: { [key: string]: string } = {
      'in-progress': 'Em andamento',
      'em andamento': 'Em andamento',
      'em_andamento': 'Em andamento',
      'completed': 'Concluído',
      'concluido': 'Concluído',
      'concluído': 'Concluído',
      'delayed': 'Atrasado',
      'atrasado': 'Atrasado',
      'not-started': 'Não iniciado',
      'não iniciado': 'Não iniciado',
      'nao_iniciado': 'Não iniciado',
      'cancelado': 'Cancelado',
      'canceled': 'Cancelado'
    };

    return statusMap[status?.toLowerCase()] || status || 'Não definido';
  }

  formatDate(dateString: string): string {
    if (!dateString) return 'Sem data definida';

    try {
      const date = new Date(dateString);
      return date.toLocaleDateString('pt-BR');
    } catch (e) {
      return dateString;
    }
  }

  refreshData() {
    this.loadDashboardData();
  }
}
