import { Component, inject, OnInit } from '@angular/core';
import { MessageService } from 'primeng/api';
import { DashboardService } from '../../../../../services/dashboard/dashboard.service';

@Component({
  selector: 'app-dashboard-home',
  templateUrl: './dashboard-home.component.html',
  styleUrls: ['./dashboard-home.component.scss']
})
export class DashboardHomeComponent implements OnInit {
  totalProjects = 0;
  totalActivities = 0;
  totalHours = 0;
  activeProjects = 0;
  isLoading = true;

  private readonly dashboardService = inject(DashboardService);
  private readonly messageService = inject(MessageService);

  ngOnInit() {
    this.loadDashboardData();
  }

  loadDashboardData() {
    this.isLoading = true;
    this.dashboardService.getDashboardDatas().subscribe({
      next: (response) => {
        this.totalProjects = response.totalProjects || 0;
        this.totalActivities = response.totalActivities || 0;
        this.totalHours = response.totalHours || 0;
        this.isLoading = false;
      },
      error: () => {
        this.messageService.add({
          severity: 'error',
          summary: 'Erro',
          detail: 'Não foi possível carregar os dados do dashboard'
        });
        this.isLoading = false;
      }
    });
  }

  refreshData() {
    this.loadDashboardData();
  }
}
