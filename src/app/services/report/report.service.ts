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

  generateProjectHoursReport(projects: { name: string; status: string; hours: number }[], filters: { period?: string } = {}): void {
    const doc = new jsPDF() as JsPDFWithPlugin;
    const pageWidth = doc.internal.pageSize.width;
    const pageHeight = doc.internal.pageSize.height;
    const currentDate = new Date().toLocaleDateString('pt-BR');
    const totalHours = projects.reduce((sum, project) => sum + (project.hours || 0), 0);

    doc.setFontSize(10);
    doc.setTextColor(110, 110, 115);
    doc.text('Chrono', 14, 14);
    doc.text(`Gerado em ${currentDate}`, pageWidth - 14, 14, { align: 'right' });

    doc.setFontSize(20);
    doc.setTextColor(29, 29, 31);
    doc.text('Relatório de horas por projeto', 14, 30);

    doc.setFontSize(10);
    doc.setTextColor(110, 110, 115);
    const period = filters.period ? `${filters.period} · ` : '';
    doc.text(`${period}${projects.length} projeto(s) · ${this.formatHours(totalHours)} lançadas`, 14, 38);

    autoTable(doc, {
      startY: 46,
      head: [['Projeto', 'Status', 'Horas']],
      body: projects.map(project => [project.name, this.getProjectStatus(project.status), this.formatHours(project.hours)]),
      foot: [['Total', '', this.formatHours(totalHours)]],
      theme: 'plain',
      headStyles: { fillColor: [72, 72, 74], textColor: 255, fontStyle: 'bold' },
      footStyles: { fillColor: [242, 242, 247], textColor: [29, 29, 31], fontStyle: 'bold' },
      alternateRowStyles: { fillColor: [245, 245, 247] },
      columnStyles: { 2: { halign: 'right' } },
      styles: { cellPadding: 4, fontSize: 10, textColor: [29, 29, 31] },
      didParseCell: data => {
        if (data.column.index === 2 && data.section !== 'body') data.cell.styles.halign = 'right';
      },
    });

    const totalPages = doc.internal.pages.length - 1;
    for (let i = 1; i <= totalPages; i++) {
      doc.setPage(i);
      doc.setFontSize(8);
      doc.setTextColor(142, 142, 147);
      doc.text(`Página ${i} de ${totalPages}`, pageWidth - 14, pageHeight - 10, { align: 'right' });
      doc.text('Chrono', 14, pageHeight - 10);
    }

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
      'em_andamento': 'Em andamento',
      'concluido': 'Concluído',
      'delayed': 'Atrasado',
      'atrasado': 'Atrasado',
      'cancelado': 'Cancelado',
      'planejado': 'Planejado',
    };

    return statusMap[status?.toLowerCase()] || status || 'Não definido';
  }
}
