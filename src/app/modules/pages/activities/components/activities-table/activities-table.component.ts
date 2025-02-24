import { Component, EventEmitter, Input, Output } from '@angular/core';
import { GetActivityResponse } from '../../../../../models/interfaces/activities/response/GetActivityResponse';
import { GetProjectResponse } from '../../../../../models/interfaces/projects/response/GetProjectResponse';

@Component({
  selector: 'app-activities-table',
  templateUrl: './activities-table.component.html',
  styleUrls: ['./activities-table.component.scss']
})
export class ActivitiesTableComponent {
  @Input() activities: Array<GetActivityResponse> = [];
  @Input() project!: GetProjectResponse;

  @Output() editActivity = new EventEmitter<GetActivityResponse>(); // Emitir evento de edição

  openEditActivityDialog(activity: GetActivityResponse): void {
    this.editActivity.emit(activity); // Emitir a atividade para o home
  }
}
