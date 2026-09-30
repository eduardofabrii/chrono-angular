import { ChangeDetectionStrategy, Component, Input } from '@angular/core';

/** Ícones de traço da identidade do Chrono (mesmos do protótipo). */
@Component({
  selector: 'app-icon',
  template: `
    <svg viewBox="0 0 24 24" [attr.width]="size" [attr.height]="size" fill="none" stroke="currentColor"
         [attr.stroke-width]="stroke" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
      @switch (name) {
        @case ('home') { <path d="M4 10.5L12 4l8 6.5V20h-5.5v-6h-5v6H4z"/> }
        @case ('folder') { <path d="M3 7a2 2 0 0 1 2-2h4l2 2h8a2 2 0 0 1 2 2v8a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/> }
        @case ('history') { <path d="M3.5 12a8.5 8.5 0 1 0 2.5-6"/><path d="M3.5 4v4h4"/><path d="M12 8v4l3 2"/> }
        @case ('clock') { <circle cx="12" cy="12" r="8.5"/><path d="M12 7.5V12l3 2"/> }
        @case ('chart') { <path d="M4 19l5-6 4 3 7-9"/> }
        @case ('user-plus') { <circle cx="10" cy="8" r="3.5"/><path d="M3.5 20a6.5 6.5 0 0 1 13 0"/><path d="M19 8v6M16 11h6"/> }
        @case ('grid') {
          <rect x="3.5" y="3.5" width="7" height="7" rx="1.5"/><rect x="13.5" y="3.5" width="7" height="7" rx="1.5"/>
          <rect x="3.5" y="13.5" width="7" height="7" rx="1.5"/><rect x="13.5" y="13.5" width="7" height="7" rx="1.5"/>
        }
        @case ('chevron-left') { <path d="M14.5 6l-6 6 6 6"/> }
        @case ('chevron-right') { <path d="M9.5 6l6 6-6 6"/> }
        @case ('chevron-down') { <path d="M6 9l6 6 6-6"/> }
        @case ('menu') { <path d="M4 7h16M4 12h16M4 17h16"/> }
        @case ('search') { <circle cx="11" cy="11" r="7"/><path d="M20 20l-4-4"/> }
        @case ('pause') { <path d="M9 6v12M15 6v12"/> }
        @case ('play') { <path d="M8 5l11 7-11 7z" fill="currentColor"/> }
        @case ('close') { <path d="M6 6l12 12M18 6L6 18"/> }
        @case ('logout') { <path d="M15 4h4v16h-4"/><path d="M10 8l-4 4 4 4"/><path d="M6 12h10"/> }
        @case ('check') { <path d="M5 12.5l4.5 4.5L19 7.5"/> }
      }
    </svg>`,
  styles: [':host { display: inline-flex; flex-shrink: 0; }'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class IconComponent {
  @Input({ required: true }) name!: string;
  @Input() size = 20;
  @Input() stroke = 1.6;
}
