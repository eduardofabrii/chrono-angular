import { Component, inject, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ValidatorFn, AbstractControl, ValidationErrors } from '@angular/forms';
import { MessageService } from 'primeng/api';
import { finalize } from 'rxjs/operators';

import { UserService } from '../../../../../services/user/user.service';
import { User } from '../../../../../models/interfaces/register/User';
import { ReleaseTimeService } from '../../../../../services/release-time/release-time.service';
import { ActivitiesService } from '../../../../../services/activities/activities.service';
import { DateUtilsService } from '../../../../../shared/services/date-utils.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-edit-user',
  templateUrl: './edit-user.component.html',
  styleUrl: './edit-user.component.scss',
})
export class EditUserComponent implements OnInit {
  private readonly fb = inject(FormBuilder);
  private readonly userService = inject(UserService);
  private readonly messageService = inject(MessageService);
  private readonly releaseTimeService = inject(ReleaseTimeService);
  private readonly activitiesService = inject(ActivitiesService);
  private readonly dateUtils = inject(DateUtilsService);
  private readonly router = inject(Router);

  currentUser?: User;
  currentUserId: string | null = null;
  loading = false;
  loadingUser = true;
  monthHours = 0;
  openActivities = 0;

  userForm: FormGroup = this.fb.group({
    name: ['', [Validators.required]],
    email: ['', [Validators.required, Validators.email]],
    password: ['', [Validators.minLength(6)]],
    confirmPassword: [''],
  }, {
    validators: this.passwordMatchValidator()
  });

  ngOnInit(): void {
    this.currentUserId = this.userService.getCurrentUserId();
    this.loadCurrentUser();
    this.loadStats();
  }

  get formControls() {
    return this.userForm.controls;
  }

  get initials(): string {
    return (this.currentUser?.name ?? '').split(' ').filter(Boolean).slice(0, 2).map(part => part[0]).join('').toUpperCase();
  }

  cancel(): void {
    this.resetForm();
    void this.router.navigate(['/dashboard']);
  }

  resetForm(): void {
    this.userForm.reset({
      name: this.currentUser?.name ?? '',
      email: this.currentUser?.email ?? '',
      password: '',
      confirmPassword: '',
    });
  }

  onSubmit(): void {
    if (!this.userForm.valid || !this.currentUserId) {
      this.userForm.markAllAsTouched();
      this.showMessage('warn', 'Atenção', 'Por favor, preencha corretamente todos os campos');
      return;
    }

    this.loading = true;
    const { name, email, password } = this.userForm.value;
    const userData: Partial<User> = { name, email, role: this.currentUser?.role };
    if (password) {
      userData.password = password;
    }

    this.userService.putUserById(this.currentUserId, userData).subscribe({
      next: () => {
        this.showMessage('success', 'Sucesso', 'Dados atualizados. Faça login novamente.');
        setTimeout(() => this.userService.logout(), 1500);
      },
      error: () => {
        this.showMessage('error', 'Erro', 'Ocorreu um erro ao atualizar os dados. Tente novamente.');
        this.loading = false;
      }
    });
  }

  private loadCurrentUser(): void {
    if (!this.currentUserId) {
      this.loadingUser = false;
      this.showMessage('error', 'Erro', 'ID do usuário não encontrado.');
      return;
    }

    this.userService.getUserById(this.currentUserId)
      .pipe(finalize(() => this.loadingUser = false))
      .subscribe({
        next: user => {
          this.currentUser = user;
          this.resetForm();
        },
        error: () => this.showMessage('error', 'Erro', 'Não foi possível carregar os dados do usuário.')
      });
  }

  private loadStats(): void {
    if (!this.currentUserId) return;
    const monthStart = new Date(new Date().getFullYear(), new Date().getMonth(), 1);
    this.releaseTimeService.getReleaseTimesByUserId(this.currentUserId).subscribe(entries => {
      this.monthHours = (entries ?? [])
        .filter(entry => (this.dateUtils.parseDateTime(entry.startDate) ?? 0) >= monthStart)
        .reduce((sum, entry) => sum + this.dateUtils.entryMinutes(entry.startDate, entry.endDate), 0) / 60;
    });
    this.activitiesService.getActivityByResponsibleId(this.currentUserId).subscribe(activities => {
      this.openActivities = (activities ?? []).filter(activity => activity.status !== 'CONCLUIDA').length;
    });
  }

  private passwordMatchValidator(): ValidatorFn {
    return (control: AbstractControl): ValidationErrors | null => {
      const password = control.get('password')?.value;
      const confirmPassword = control.get('confirmPassword')?.value;
      if (!password && !confirmPassword) return null;
      return password === confirmPassword ? null : { mismatch: true };
    };
  }

  private showMessage(severity: string, summary: string, detail: string): void {
    this.messageService.add({ severity, summary, detail, life: severity === 'error' ? 5000 : 3000 });
  }
}
