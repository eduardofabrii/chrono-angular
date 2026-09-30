import { Component, Input } from '@angular/core';

@Component({
  selector: 'app-logo-clock',
  template: `
    <svg viewBox="0 0 24 24" [attr.width]="size" [attr.height]="size" aria-hidden="true">
      <circle cx="12" cy="12" r="12" fill="#1D1D1F"></circle>
      <circle cx="12" cy="12" r="9.9" fill="#1F5EBD"></circle>
      <circle cx="12" cy="12" r="9" fill="#2370DC"></circle>
      <path d="M12.5 9.4v4.3l2 2.3" fill="none" stroke="#000" stroke-opacity=".22" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"></path>
      <path d="M12 8.7v4.4l2 2.3" fill="none" stroke="#F0A800" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"></path>
    </svg>
  `,
  styles: [':host { display: inline-flex; flex-shrink: 0; }']
})
export class LogoClockComponent {
  @Input() size = 16;
}
