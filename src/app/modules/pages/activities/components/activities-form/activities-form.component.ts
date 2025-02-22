import { Component, Input, OnChanges } from '@angular/core';
import { GetActivityResponse } from '../../../../../models/interfaces/activities/response/GetActivityResponse';

@Component({
  selector: 'app-activities-form',
  templateUrl: './activities-form.component.html',
  styleUrl: './activities-form.component.scss'
})
export class ActivitiesFormComponent implements OnChanges {
  @Input() activities: Array<GetActivityResponse> = [];
  @Input() projectId!: string;

  public filteredActivities: Array<GetActivityResponse> = [];
  public activitySelected: GetActivityResponse | null = null;

  ngOnChanges() {
    this.filterActivities();
  }

  private filterActivities() {
    this.filteredActivities = this.activities.filter(
      (activity) => activity.project.id === this.projectId // COmpração com activity.project.id
    );
  }
}
