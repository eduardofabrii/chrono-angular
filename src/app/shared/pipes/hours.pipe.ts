import { Pipe, PipeTransform } from '@angular/core';

/** Formata horas decimais como "148h 30m" (ou "12h" sem minutos). */
@Pipe({ name: 'hours' })
export class HoursPipe implements PipeTransform {
  transform(hours: number | null | undefined): string {
    const totalMinutes = Math.round((hours || 0) * 60);
    const m = totalMinutes % 60;
    return `${Math.floor(totalMinutes / 60)}h${m ? ' ' + String(m).padStart(2, '0') + 'm' : ''}`;
  }
}
