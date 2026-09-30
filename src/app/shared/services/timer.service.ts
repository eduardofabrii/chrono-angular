import { Injectable, NgZone, OnDestroy, PLATFORM_ID, inject } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { BehaviorSubject, Subscription, interval } from 'rxjs';

export interface TimerState {
  activityId: string;
  activityName: string;
  projectName?: string;
  description: string;
  running: boolean;
  firstStart: number;
  segmentStart: number;
  accumulated: number;
}

export interface TimerSnapshot {
  state: TimerState | null;
  elapsed: number;
  clock: string;
  shortClock: string;
}

const STORAGE_KEY = 'chrono.timer';

@Injectable({ providedIn: 'root' })
export class TimerService implements OnDestroy {
  private readonly isBrowser = isPlatformBrowser(inject(PLATFORM_ID));
  private readonly zone = inject(NgZone);
  private state: TimerState | null = this.read();
  private tick?: Subscription;

  readonly snapshot$ = new BehaviorSubject<TimerSnapshot>(this.buildSnapshot());

  constructor() {
    if (this.isBrowser) {
      this.zone.runOutsideAngular(() => {
        this.tick = interval(1000).subscribe(() => this.zone.run(() => this.emit()));
      });
      window.addEventListener('storage', this.onStorage);
    }
  }

  ngOnDestroy(): void {
    this.tick?.unsubscribe();
    if (this.isBrowser) {
      window.removeEventListener('storage', this.onStorage);
    }
  }

  get current(): TimerState | null {
    return this.state;
  }

  start(activityId: string, activityName: string, description = '', projectName = ''): void {
    const now = Date.now();
    this.save({ activityId, activityName, projectName, description, running: true, firstStart: now, segmentStart: now, accumulated: 0 });
  }

  pause(): void {
    if (!this.state?.running) return;
    this.save({ ...this.state, running: false, accumulated: this.elapsedOf(this.state) });
  }

  resume(): void {
    if (!this.state || this.state.running) return;
    this.save({ ...this.state, running: true, segmentStart: Date.now() });
  }

  toggle(): void {
    this.state?.running ? this.pause() : this.resume();
  }

  setDescription(description: string): void {
    if (this.state) this.save({ ...this.state, description });
  }

  /** Para o timer e devolve o período para virar lançamento. */
  stop(): { activityId: string; description: string; startDate: Date; endDate: Date } | null {
    if (!this.state) return null;
    const end = new Date();
    const start = new Date(end.getTime() - this.elapsedOf(this.state) * 1000);
    const result = { activityId: this.state.activityId, description: this.state.description, startDate: start, endDate: end };
    this.pause();
    return result;
  }

  clear(): void {
    this.save(null);
  }

  private elapsedOf(state: TimerState): number {
    const running = state.running ? (Date.now() - state.segmentStart) / 1000 : 0;
    return Math.max(0, Math.floor(state.accumulated + running));
  }

  private buildSnapshot(): TimerSnapshot {
    const elapsed = this.state ? this.elapsedOf(this.state) : 0;
    const h = Math.floor(elapsed / 3600);
    const m = Math.floor((elapsed % 3600) / 60);
    const s = elapsed % 60;
    const pad = (n: number) => String(n).padStart(2, '0');
    return { state: this.state, elapsed, clock: `${pad(h)}:${pad(m)}:${pad(s)}`, shortClock: `${h}:${pad(m)}` };
  }

  private emit(): void {
    this.snapshot$.next(this.buildSnapshot());
  }

  private save(state: TimerState | null): void {
    this.state = state;
    if (this.isBrowser) {
      try {
        state ? localStorage.setItem(STORAGE_KEY, JSON.stringify(state)) : localStorage.removeItem(STORAGE_KEY);
      } catch {
        // armazenamento indisponível: o timer segue só em memória
      }
    }
    this.emit();
  }

  private read(): TimerState | null {
    if (!this.isBrowser) return null;
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      return raw ? JSON.parse(raw) as TimerState : null;
    } catch {
      return null;
    }
  }

  private readonly onStorage = (event: StorageEvent) => {
    if (event.key === STORAGE_KEY) {
      this.state = this.read();
      this.emit();
    }
  };
}
