import { Injectable, Inject, LOCALE_ID } from '@angular/core';
import { DatePipe } from '@angular/common';

/**
 * Serviço para manipulação e formatação de datas
 */
@Injectable({
  providedIn: 'root'
})
export class DateUtilsService {
  private datePipe: DatePipe;

  constructor(@Inject(LOCALE_ID) private locale: string) {
    this.datePipe = new DatePipe(this.locale);
  }


// Formata uma data para o formato dd/MM/yyyy HH:mm:ss
  formatDateTime(date: Date | string | null): string {
    if (!date) return '';
    return this.datePipe.transform(date, 'dd/MM/yyyy HH:mm:ss') || '';
  }


// Formata uma data para o formato dd/MM/yyyy
  formatDateOnly(date: Date | string | null): string {
    if (!date) return '';
    return this.datePipe.transform(date, 'dd/MM/yyyy') || '';
  }


//  Formata uma data de acordo com o formato especificado
  formatDate(date: Date | string | null, format: string = 'dd/MM/yyyy'): string {
    if (!date) return '';
    return this.datePipe.transform(date, format) || '';
  }

// Converte uma string de data para um objeto Date
  parseDate(dateValue: string | Date | null): Date | null {
    if (!dateValue) return null;

    // Se já for um objeto Date, retorna-o
    if (dateValue instanceof Date) {
      return dateValue;
    }

    // Se for uma string no formato "dd/MM/yyyy", converte para Date
    if (typeof dateValue === 'string' && dateValue.includes('/')) {
      const parts = dateValue.split(' ')[0].split('/');
      if (parts.length === 3) {
        const [day, month, year] = parts;
        return new Date(+year, +month - 1, +day);
      }
    }

    // Se for uma string no formato ISO ("yyyy-MM-dd"), converte para Date
    if (typeof dateValue === 'string' && dateValue.includes('-')) {
      return new Date(dateValue);
    }

    // Tenta converter usando o construtor Date padrão
    try {
      const date = new Date(dateValue);
      return isNaN(date.getTime()) ? null : date;
    } catch {
      return null;
    }
  }

// Obtém a diferença em horas entre duas datas
  getHoursDifference(startDate: Date | string | null, endDate: Date | string | null, decimalPlaces: number = 2): number | null {
    const start = this.parseDate(startDate);
    const end = this.parseDate(endDate);

    if (!start || !end) return null;

    const diffMs = end.getTime() - start.getTime();
    const diffHours = diffMs / (1000 * 60 * 60);

    const factor = Math.pow(10, decimalPlaces);
    return Math.round(diffHours * factor) / factor;
  }
}
