import { Injectable } from '@angular/core';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

interface JsPDFWithPlugin extends jsPDF {
  internal: any; // Adicionar propriedade interna para acessar páginas
}

@Injectable({
  providedIn: 'root'
})
export class ReportService {
  constructor() {}

  generateProjectHoursReport(projects: any[], filters: any = {}): void {
    // Criar nova instância do PDF
    const doc = new jsPDF() as JsPDFWithPlugin;
    const pageWidth = doc.internal.pageSize.width;
    const currentDate = new Date().toLocaleDateString('pt-BR');

    // Adicionar título
    doc.setFontSize(18);
    doc.setTextColor(40, 65, 143);
    doc.text('Relatório de Horas por Projeto', pageWidth / 2, 20, { align: 'center' });

    // Adicionar data do relatório
    doc.setFontSize(10);
    doc.setTextColor(100, 100, 100);
    doc.text(`Gerado em: ${currentDate}`, pageWidth - 20, 10, { align: 'right' });

    // Adicionar informações de filtro
    doc.setFontSize(11);
    doc.setTextColor(0, 0, 0);
    doc.text('Filtros aplicados:', 14, 30);
    doc.setFontSize(10);
    doc.setTextColor(80, 80, 80);

    let yPos = 35;

    // Mostrar filtros aplicados
    if (filters.selectedProjects) {
      doc.text(`Projetos selecionados: ${filters.selectedProjects.length}`, 20, yPos);
      yPos += 5;
    }

    // Título da tabela
    yPos += 5;
    doc.setFontSize(14);
    doc.setTextColor(40, 65, 143);
    doc.text('Horas por Projeto', 14, yPos);
    yPos += 5;

    // Preparar dados para a tabela
    const tableData = projects.map(project => [
      project.name,
      this.getProjectStatus(project.status),
      this.formatHours(project.hours)
    ]);

    // Adicionar tabela com autotable
    autoTable(doc, {
      startY: yPos,
      head: [['Projeto', 'Status', 'Total de Horas']],
      body: tableData,
      headStyles: {
        fillColor: [67, 97, 238],
        textColor: 255,
        fontStyle: 'bold'
      },
      alternateRowStyles: {
        fillColor: [245, 247, 250]
      },
      styles: {
        cellPadding: 5,
        fontSize: 10
      }
    });

    // Adicionar rodapé
    // Usando uma abordagem alternativa para evitar usar getNumberOfPages()
    const totalPages = doc.internal.pages.length - 1;
    for (let i = 1; i <= totalPages; i++) {
      doc.setPage(i);
      doc.setFontSize(8);
      doc.setTextColor(150, 150, 150);
      doc.text(`Página ${i} de ${totalPages}`, pageWidth / 2, doc.internal.pageSize.height - 10, { align: 'center' });
      doc.text('Chrono App - Sistema de Gestão de Projetos', 14, doc.internal.pageSize.height - 10);
    }

    // Salvar o PDF
    doc.save('relatorio-horas-projeto.pdf');
  }

  /**
   * Formata horas decimais para o formato HH:MM
   * Ex: 16.60h → 17:00
   */
  private formatHours(decimalHours: number): string {
    if (isNaN(decimalHours)) return '0:00';

    // Calcula a parte inteira (horas)
    let hours = Math.floor(decimalHours);

    // Calcula os minutos a partir da parte decimal
    // Multiplica por 60 para converter decimal para minutos
    let minutes = Math.round((decimalHours - hours) * 60);

    // Se os minutos chegarem a 60, incrementa a hora
    if (minutes === 60) {
      hours += 1;
      minutes = 0;
    }

    // Formata os minutos com zero à esquerda quando necessário
    const minutesStr = minutes < 10 ? `0${minutes}` : `${minutes}`;

    return `${hours}:${minutesStr}`;
  }

  private getProjectStatus(status: string): string {
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
}
