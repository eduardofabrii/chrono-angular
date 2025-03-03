import { Component, Input } from '@angular/core';

@Component({
  selector: 'app-skeleton-loader',
  templateUrl: './skeleton-loader.component.html',
  styleUrls: ['./skeleton-loader.component.scss']
})
export class SkeletonLoaderComponent {
  @Input() showLogo: boolean = true;
  @Input() height: string = '200px';
  @Input() width: string = '300px';
  @Input() borderRadius: string = '12px';
  @Input() message: string = 'Carregando dados...';
  @Input() overlay: boolean = false;
  @Input() pulseColor: string = '#3B82F6';
  @Input() showProgressBar: boolean = true;
}
