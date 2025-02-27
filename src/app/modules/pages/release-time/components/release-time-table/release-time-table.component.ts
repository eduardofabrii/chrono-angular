import { Component, EventEmitter, inject, Input, OnInit, Output } from '@angular/core';

import { GetReleaseTimeResponse } from '../../../../../models/interfaces/release-time/response/GetReleaseTimeResponse';
import { GetProjectResponse } from '../../../../../models/interfaces/projects/response/GetProjectResponse';
import { UserService } from '../../../../../services/user/user.service';

@Component({
  selector: 'app-release-time-table',
  templateUrl: './release-time-table.component.html',
  styleUrls: ['./release-time-table.component.scss']
})
export class ReleaseTimeTableComponent implements OnInit {
  @Input() releaseTimes: Array<GetReleaseTimeResponse> = [];
  @Input() project!: GetProjectResponse;

  @Output() editReleaseTime = new EventEmitter<GetReleaseTimeResponse>();
  @Output() deleteReleaseTime = new EventEmitter<GetReleaseTimeResponse>();

  public role: string = '';
  public isAdmin: boolean = false;
  public currentUserId: string = '';

  private readonly userService = inject(UserService);

  ngOnInit(): void {
    this.role = this.userService.getRole() ?? '';
    this.isAdmin = this.role === 'ADMIN';
    this.currentUserId = this.userService.getCurrentUserId() ?? '';
  }

  onEditReleaseTime(releaseTime: GetReleaseTimeResponse): void {
    this.editReleaseTime.emit(releaseTime);
  }

  onDeleteReleaseTime(releaseTime: GetReleaseTimeResponse): void {
    this.deleteReleaseTime.emit(releaseTime);
  }

  canEditReleaseTime(releaseTime: GetReleaseTimeResponse): boolean {
    if (this.isAdmin) return true;
    return this.currentUserId === releaseTime.user?.id;
  }

  canDeleteReleaseTime(releaseTime: GetReleaseTimeResponse): boolean {
    return this.isAdmin;
  }
}
