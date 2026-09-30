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
  /** Converte "dd/MM/yyyy HH:mm[:ss]" (formato da API) mantendo o horário. */
  parseDateTime(dateValue: string | Date | null): Date | null {
    if (!dateValue) return null;
    if (dateValue instanceof Date) return dateValue;
    const [datePart, timePart = '00:00:00'] = dateValue.split(' ');
    const [day, month, year] = datePart.split('/').map(Number);
    if (!day || !month || !year) return this.parseDate(dateValue);
    const [hours = 0, minutes = 0, seconds = 0] = timePart.split(':').map(Number);
    return new Date(year, month - 1, day, hours, minutes, seconds);
  }

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

  // Formata Date para string ISO (para API)
  formatDateTimeForApi(date: Date): string {
    if (!date) return '';
    return date.toISOString();
  }

  // Formata data para exibição no formato DD/MM/YYYY
  formatDateForDisplay(dateString: string | Date): string {
    if (!dateString) return '';
    const date = this.parseDate(dateString);
    if (!date) return '';

    const day = String(date.getDate()).padStart(2, '0');
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const year = date.getFullYear();

    return `${day}/${month}/${year}`;
  }

  /** Duração em minutos de um lançamento ("dd/MM/yyyy HH:mm:ss"). */
  entryMinutes(startDate: string, endDate: string): number {
    const start = this.parseDateTime(startDate);
    const end = this.parseDateTime(endDate);
    return start && end ? Math.max(0, (end.getTime() - start.getTime()) / 60000) : 0;
  }

  /** Segunda-feira 00:00 da semana da data informada. */
  startOfWeek(date: Date): Date {
    return new Date(date.getFullYear(), date.getMonth(), date.getDate() - ((date.getDay() + 6) % 7));
  }

  /** Número da semana ISO 8601. */
  isoWeek(date: Date): number {
    const target = new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()));
    const day = target.getUTCDay() || 7;
    target.setUTCDate(target.getUTCDate() + 4 - day);
    const yearStart = new Date(Date.UTC(target.getUTCFullYear(), 0, 1));
    return Math.ceil(((target.getTime() - yearStart.getTime()) / 86400000 + 1) / 7);
  }
}
