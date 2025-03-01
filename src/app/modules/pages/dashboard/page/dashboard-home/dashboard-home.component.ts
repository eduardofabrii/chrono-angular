import { Component, inject, OnDestroy, OnInit } from '@angular/core';
import { Subject, takeUntil } from 'rxjs';
import { MessageService } from 'primeng/api';
import { DashboardService } from '../../../../../services/dashboard/dashboard.service';

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

  totalProjects = 0;
  totalActivities = 0;
  totalHours = 0;
  activeProjects = 0;
  projectInProgressPercentage = 0;

  topProjects: { name: string; hours: number; status: string }[] = [];
  topUsers: { name: string; hours: number; initials: string; color: string }[] = [];

  maxProjectHours = 0;
  maxUserHours = 0;

  chartOptions = {
    plugins: { legend: { position: 'bottom', display: true } },
    responsive: true,
    maintainAspectRatio: false,
    cutout: '70%'
  };

  isLoading = true;

  private readonly dashboardService = inject(DashboardService);

  ngOnInit() {
    this.loadDashboardData();
  }

  ngOnDestroy() {
    this.destroy$.next();
    this.destroy$.complete();
  }

  loadDashboardData() {
    this.isLoading = true;
    this.dashboardService.getDashboardDatas()
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (response) => this.processApiResponse(response),
        error: () => console.log("erro")
      });
  }

  processApiResponse(data: any) {
    if (!data) {
      return;
    }

    this.totalProjects = data.totalProjects || 0;
    this.totalActivities = data.totalActivities || 0;
    this.totalHours = data.totalHours || 0;

    const inProgressStatus = data.projectStatusCounts?.find((s: any) => ['in-progress', 'em andamento', 'em_andamento'].includes(s?.status?.toLowerCase()));
    this.activeProjects = inProgressStatus?.count || 0;

    const totalStatusCount = data.projectStatusCounts?.reduce((sum: number, status: any) => sum + (status?.count || 0), 0) || 0;
    this.projectInProgressPercentage = totalStatusCount > 0 ? Math.round((this.activeProjects / totalStatusCount) * 100) : 0;

    this.processProjectHoursData(data.projectHoursData || []);

    this.isLoading = false;
  }

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

  refreshData() {
    this.loadDashboardData();
  }
}
