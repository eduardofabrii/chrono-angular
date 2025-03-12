import { Component, EventEmitter, inject, Input, OnInit, Output } from '@angular/core';

import { GetActivityResponse } from '../../../../../models/interfaces/activities/response/GetActivityResponse';
import { GetProjectResponse } from '../../../../../models/interfaces/projects/response/GetProjectResponse';
import { UserService } from '../../../../../services/user/user.service';

@Component({
  selector: 'app-activities-table',
  templateUrl: './activities-table.component.html',
  styleUrls: ['./activities-table.component.scss']
})
export class ActivitiesTableComponent implements OnInit {
  @Input() activities: Array<GetActivityResponse> = [];
  @Input() project!: GetProjectResponse;

  @Output() editActivity = new EventEmitter<GetActivityResponse>(); // Emitir evento de edição
  @Output() deleteActivity = new EventEmitter<GetActivityResponse>(); // Emitir evento de exclusão

  public role: string = '';

  private readonly userService = inject(UserService);

  ngOnInit(): void {
    this.role = this.userService.getRole() ?? '';
  }

  formatStatus(status: string): string {
    switch (status) {
      case 'ABERTA':
        return 'Aberta';
      case 'EM_ANDAMENTO':
        return 'Em andamento';
      case 'CONCLUIDA':
        return 'Concluída';
      case 'PAUSADA':
        return 'Pausada';
      default:
        return status;
    }
  }

  openEditActivityDialog(activity: GetActivityResponse): void {
    this.editActivity.emit(activity); // Emitir a atividade para o home
  }

  openDeleteActivityDialog(activity: GetActivityResponse): void {
    this.deleteActivity.emit(activity); // Emitir a atividade para o home
  }
}
