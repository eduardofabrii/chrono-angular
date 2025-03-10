import { Component, OnInit, inject } from '@angular/core';
import { ReportService } from '../../../services/report/report.service';
import { MessageService } from 'primeng/api';
import { FormsModule } from '@angular/forms';
import { UserService } from '../../../services/user/user.service';

interface StatusOption {
  label: string;
  value: string;
  selected: boolean;
}

@Component({
  selector: 'app-project-report',
  templateUrl: './project-report.component.html',
  styleUrls: ['./project-report.component.scss']
})
export class ProjectReportComponent implements OnInit {
  visible = false;
  allProjects: any[] = [];  // Armazena todos os projetos originais
  projects: any[] = [];     // Projetos filtrados para exibição
  selectedProjects: any[] = [];
  isLoading = false;
  
  projectStatusOptions: StatusOption[] = [
    { label: 'Planejado', value: 'planejado', selected: true },
    { label: 'Em Andamento', value: 'em_andamento', selected: true },
    { label: 'Concluído', value: 'concluido', selected: true },
    { label: 'Atrasado', value: 'atrasado', selected: true },
    { label: 'Cancelado', value: 'cancelado', selected: true },
  ];

  private readonly reportService = inject(ReportService);
  private readonly messageService = inject(MessageService);
  private readonly userService = inject(UserService);

  ngOnInit() {}

  show(allProjects: any[]) {
    this.allProjects = [...allProjects];
    this.selectedProjects = [];
    this.resetStatusOptions();
    this.updateFilteredProjects(); // Filtrar os projetos inicialmente
    this.visible = true;
  }

  hide() {
    this.visible = false;
  }

  resetStatusOptions() {
    this.projectStatusOptions.forEach(status => status.selected = true);
    this.updateFilteredProjects(); // Atualizar projetos após resetar status
  }

  // Este método será chamado sempre que um status for alterado
  onStatusChange() {
    this.updateFilteredProjects();
    // Limpar seleção quando os filtros mudarem
    this.selectedProjects = this.selectedProjects.filter(
      selected => this.projects.some(p => p.id === selected.id)
    );
  }

  // Atualiza a lista de projetos com base nos status selecionados
  updateFilteredProjects() {
    const selectedStatus = this.getSelectedStatus();
    
    if (selectedStatus.length === 0) {
      // Se nenhum status estiver selecionado, não mostramos nenhum projeto
      this.projects = [];
      return;
    }

    this.projects = this.allProjects.filter(project => {
      const normalizedStatus = this.normalizeProjectStatus(project.status);
      return selectedStatus.includes(normalizedStatus);
    });
    
    console.log('Projetos filtrados:', this.projects);
    console.log('Status selecionados:', selectedStatus);
  }

  getSelectedStatus(): string[] {
    return this.projectStatusOptions
      .filter(status => status.selected)
      .map(status => status.value);
  }

  getSelectedStatusString(): string {
    const selectedStatuses = this.getSelectedStatus().map(status => 
      this.getStatusLabel(status)
    );
    
    return selectedStatuses.length > 0 ? selectedStatuses.join(', ') : 'Nenhum';
  }

  getStatusLabel(statusValue: string): string {
    const status = this.projectStatusOptions.find(s => s.value === statusValue);
    return status ? status.label : statusValue;
  }

  normalizeProjectStatus(status: string): string {
    if (!status) return 'planejado';
    
    const statusMap: { [key: string]: string } = {
      'em andamento': 'em_andamento',
      'concluido': 'concluido',
      'atrasado': 'atrasado',
      'cancelado': 'cancelado',
      'planejado': 'planejado',
    };
    
    return statusMap[status?.toLowerCase()] || status?.toLowerCase() || 'planejado';
  }

  canGenerateReport(): boolean {
    return this.selectedProjects.length > 0;
  }

  generateReport() {
    try {
      this.isLoading = true;

      if (this.selectedProjects.length === 0) {
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
        selectedProjects: this.selectedProjects,
        statusFilter: this.getSelectedStatus()
      };

      setTimeout(() => {
        this.reportService.generateProjectHoursReport(this.selectedProjects, filters);

        this.messageService.add({
          severity: 'success',
          summary: 'Sucesso',
          detail: 'Relatório PDF gerado com sucesso'
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
