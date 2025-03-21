import { Component, OnInit, OnDestroy, inject, ViewChild } from '@angular/core';
import { Subject, takeUntil } from 'rxjs';

import { GetReleaseTimeResponse } from '../../../../../models/interfaces/release-time/response/GetReleaseTimeResponse';
import { ReleaseTimeService } from '../../../../../services/release-time/release-time.service';
import { UserService } from '../../../../../services/user/user.service';
import { ReleaseTimeFormComponent } from '../../components/release-time-form/release-time-form.component';
import { ReleaseTimeTableComponent } from '../../components/release-time-table/release-time-table.component';
import { DateUtilsService } from '../../../../../shared/services/date-utils.service';

@Component({
  selector: 'app-release-time-home',
  templateUrl: './release-time-home.component.html',
  styleUrl: './release-time-home.component.scss'
})
export class ReleaseTimeHomeComponent implements OnInit, OnDestroy {
  private readonly destroy$: Subject<void> = new Subject();
  public releaseTimeEntries: GetReleaseTimeResponse[] = [];
  public isAdmin: boolean = false;
  public isLoading: boolean = true;

  private readonly releaseTimeService = inject(ReleaseTimeService);
  private readonly userService = inject(UserService);
  private readonly dateUtils = inject(DateUtilsService);

  @ViewChild(ReleaseTimeFormComponent) releaseTimeFormComponent!: ReleaseTimeFormComponent;
  @ViewChild(ReleaseTimeTableComponent) releaseTimeTableComponent!: ReleaseTimeTableComponent

  responsibleOptions: any[] = [];

  ngOnInit(): void {
    this.checkUserRole();
    setTimeout(() => {
      this.loadReleaseTimeEntries();
    }, 300);
  }

  private checkUserRole(): void {
    const role = this.userService.getRole();
    this.isAdmin = role === 'ADMIN';
  }

  private loadReleaseTimeEntries(): void {
    if (this.isAdmin) {
      this.loadAllReleaseTimeEntries();
    } else {
      this.loadUserReleaseTimeEntries();
    }
  }

  private loadAllReleaseTimeEntries(): void {
    this.releaseTimeService.getAllReleaseTimes()
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (entries) => {
          this.releaseTimeEntries = entries;
          setTimeout(() => {
            this.isLoading = false;
          }, 500);
        },
        error: (err) => {
          console.error('Erro ao buscar lançamentos de horas:', err);
          this.isLoading = false;
        }
      });
  }

  private loadUserReleaseTimeEntries(): void {
    const userId = this.userService.getCurrentUserId();
    if (userId) {
      this.releaseTimeService.getReleaseTimesByUserId(userId)
        .pipe(takeUntil(this.destroy$))
        .subscribe({
          next: (entries) => {
            this.releaseTimeEntries = entries;
            setTimeout(() => {
              this.isLoading = false;
            }, 500);
          },
          error: (err) => {
            console.error('Erro ao buscar lançamentos de horas do usuário:', err);
            this.isLoading = false;
          }
        });
    }
  }

  handleReleaseTimeCreated(event: any): void {
    this.loadReleaseTimeEntries();
    const releaseTime = event.releaseTime || event;
    this.releaseTimeEntries = [releaseTime, ...this.releaseTimeEntries];
  }

  handleReleaseTimeUpdated(event: any): void {
    const updatedReleaseTime = event.releaseTime || event;

    this.releaseTimeEntries = this.releaseTimeEntries.filter(item =>
      item.id !== updatedReleaseTime.id
    );

    this.releaseTimeEntries = [updatedReleaseTime, ...this.releaseTimeEntries];
  }

  handleReleaseTimeDeleted(): void {
    this.loadReleaseTimeEntries();
  }

  openEditReleaseTimeDialog(releaseTime: GetReleaseTimeResponse): void {
    if (this.canEditReleaseTime(releaseTime)) {
      this.releaseTimeFormComponent.openEditReleaseTimeDialog(releaseTime);
    }
  }

  openDeleteReleaseTimeDialog(releaseTime: GetReleaseTimeResponse): void {
    if (this.canDeleteReleaseTime(releaseTime)) {
      this.releaseTimeFormComponent.openDeleteReleaseTimeDialog(releaseTime);
    }
  }

  canEditReleaseTime(releaseTime: GetReleaseTimeResponse): boolean {
    if (this.isAdmin) return true;
    const currentUserId = this.userService.getCurrentUserId();
    return currentUserId === releaseTime.user?.id;
  }

  canDeleteReleaseTime(releaseTime: GetReleaseTimeResponse): boolean {
    return this.isAdmin;
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }
}
