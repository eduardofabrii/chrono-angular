import { Component, Input } from '@angular/core';

const STATUS: Record<string, { label: string; css: string }> = {
  PLANEJADO: { label: 'Planejado', css: 'planejado' },
  EM_ANDAMENTO: { label: 'Em andamento', css: 'em-andamento' },
  CONCLUIDO: { label: 'Concluído', css: 'concluido' },
  CONCLUIDA: { label: 'Concluída', css: 'concluido' },
  CANCELADO: { label: 'Cancelado', css: 'cancelado' },
  ABERTA: { label: 'Aberta', css: 'aberta' },
  PAUSADA: { label: 'Pausada', css: 'pausada' },
  ATRASADA: { label: 'Atrasada', css: 'atrasada' },
};

@Component({
  selector: 'app-status-chip',
  template: `<span class="status-chip" [ngClass]="info.css">{{ info.label }}</span>`,
  styles: [':host { display: inline-flex; }']
})
export class StatusChipComponent {
  @Input() status: string | null | undefined = '';
  @Input() overdue = false;

  get info(): { label: string; css: string } {
    if (this.overdue) return STATUS['ATRASADA'];
    const key = (this.status ?? '').toUpperCase().replace(/[\s-]/g, '_');
    return STATUS[key] ?? { label: this.status ?? '', css: '' };
  }
}
