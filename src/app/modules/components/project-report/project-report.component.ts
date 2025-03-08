import { Component, OnInit, inject } from '@angular/core';
import { ReportService } from '../../../services/report/report.service';
import { MessageService } from 'primeng/api';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-project-report',
  templateUrl: './project-report.component.html',
  styleUrls: ['./project-report.component.scss']
})
export class ProjectReportComponent {
  visible = false;
  projects: any[] = [];
  selectedProjects: any[] = [];
  isLoading = false;

  private readonly reportService = inject(ReportService);
  private readonly messageService = inject(MessageService);

  show(allProjects: any[]) {
    this.projects = [...allProjects];
    this.selectedProjects = [];
    this.visible = true;
  }

  hide() {
    this.visible = false;
  }

  generateReport() {
    try {
      this.isLoading = true;

      if (!this.selectedProjects || this.selectedProjects.length === 0) {
        this.messageService.add({
          severity: 'warn',
          summary: 'Atenção',
          detail: 'Selecione pelo menos um projeto para gerar o relatório'
        });
        this.isLoading = false;
        return;
      }

      // Preparar os filtros
      const filters = {
        selectedProjects: this.selectedProjects
      };

      setTimeout(() => {
        this.reportService.generateProjectHoursReport(this.selectedProjects, filters);

        this.messageService.add({
          severity: 'success',
          summary: 'Sucesso',
          detail: 'Relatório gerado com sucesso'
        });

        this.isLoading = false;
        this.hide();
      }, 1000);
    } catch (error) {
      this.messageService.add({
        severity: 'error',
        summary: 'Erro',
        detail: 'Ocorreu um erro ao gerar o relatório'
      });
      this.isLoading = false;
    }
  }
}
