import { Component, Input } from '@angular/core';
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
}
