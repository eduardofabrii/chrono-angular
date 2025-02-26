import { Pipe, PipeTransform, Inject, LOCALE_ID } from '@angular/core';
import { DatePipe } from '@angular/common';

@Pipe({
  name: 'brDateFormat',
  pure: true
})
export class BrDateFormatPipe implements PipeTransform {
  constructor(@Inject(LOCALE_ID) private locale: string) {}

  transform(value: any): string {
    if (!value) return '';

    const datePipe = new DatePipe(this.locale);
    return datePipe.transform(value, 'dd/MM/yyyy HH:mm:ss') || '';
  }
}

@Pipe({
  name: 'brDateOnly',
  pure: true
})
export class BrDateOnlyPipe implements PipeTransform {
  constructor(@Inject(LOCALE_ID) private locale: string) {}

  transform(value: any): string {
    if (!value) return '';

    const datePipe = new DatePipe(this.locale);
    return datePipe.transform(value, 'dd/MM/yyyy') || '';
  }
}
