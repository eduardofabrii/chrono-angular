import { Component, OnInit, inject } from '@angular/core';
import { PrimeNGConfig } from 'primeng/api';
import { ThemeService } from './shared/services/theme.service';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrl: './app.component.scss'
})
export class AppComponent implements OnInit {
  title = 'chrono-angular';

  private readonly primeNgConfig = inject(PrimeNGConfig);
  private readonly theme = inject(ThemeService);

  ngOnInit(): void {
    this.primeNgConfig.ripple = true;
    this.theme.init();
  }
}
