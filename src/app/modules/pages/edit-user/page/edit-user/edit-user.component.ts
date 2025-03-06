import { Component, inject, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ValidatorFn, AbstractControl, ValidationErrors } from '@angular/forms';
import { MessageService } from 'primeng/api';
import { Router } from '@angular/router';
import { UserService } from '../../../../../services/user/user.service';
import { User } from '../../../../../models/interfaces/register/User';
import { finalize } from 'rxjs/operators';

@Component({
  selector: 'app-edit-user',
  templateUrl: './edit-user.component.html',
  styleUrl: './edit-user.component.scss',
  providers: [MessageService]
})
export class EditUserComponent implements OnInit {
  userForm!: FormGroup;
  roles: { label: string, value: string }[] = [];
  loading = false;
  currentUser?: User;
  currentUserId: number | null = null;
  loadingUser = true;
  authService: any;

  private readonly fb = inject(FormBuilder);
  private readonly userService = inject(UserService);
  private readonly messageService = inject(MessageService);
  private readonly router = inject(Router);

  ngOnInit(): void {
    const userIdFromService = this.userService.getCurrentUserId();
    this.currentUserId = userIdFromService ? parseInt(userIdFromService, 10) : null;
    this.initRoles();
    this.loadCurrentUser();
  }
  private loadCurrentUser(): void {
    this.loadingUser = true;
    const userId = this.userService.getCurrentUserId();

    if (userId) {
      this.userService.getUserById(userId).pipe(
        finalize(() => this.loadingUser = false)
      ).subscribe({
        next: (user: User) => {
          this.currentUser = user;
          this.initForm();
        },
        error: (error: any) => {
          console.error('Erro ao carregar dados do usuário:', error);
          this.messageService.add({
            severity: 'error',
            summary: 'Erro',
            detail: 'Não foi possível carregar os dados do usuário.',
            life: 5000
          });
          this.initForm();
        }
      });
    } else {
      this.loadingUser = false;
      this.messageService.add({
        severity: 'error',
        summary: 'Erro',
        detail: 'ID do usuário não encontrado.',
        life: 5000
      });
      this.initForm();
    }
  }

  private initForm(): void {
    this.userForm = this.fb.group<any>({
      name: [this.currentUser?.name || '', [Validators.required]],
      email: [this.currentUser?.email || '', [Validators.required, Validators.email]],
      password: ['', [Validators.minLength(6)]], // Senha com no mínimo 6 caracteres
      confirmPassword: [''],
      role: [this.currentUser?.role || 'USER', [Validators.required]]
    }, {
      validators: this.passwordMatchValidator()
    });
  }

  private initRoles(): void {
    this.roles = this.userService.getUserRoles();
  }

  private passwordMatchValidator(): ValidatorFn {
    return (control: AbstractControl): ValidationErrors | null => {
      const password = control.get('password')?.value;
      const confirmPassword = control.get('confirmPassword')?.value;

      if (!password && !confirmPassword) return null;
      return password === confirmPassword ? null : { mismatch: true };
    };
  }

  onSubmit(): void {
    if (this.userForm.valid) {
      this.loading = true;

      // Valida se a senha foi preenchida e se as senhas coincidem
      const userData: Partial<User> = {
        name: this.userForm.value.name,
        email: this.userForm.value.email,
        role: this.userForm.value.role
      };

      if (this.userForm.value.password) {
        userData.password = this.userForm.value.password;
      }

      if (this.currentUserId === null) {
        this.messageService.add({
          severity: 'error',
          summary: 'Erro',
          detail: 'ID do usuário não encontrado.',
          life: 5000
        });
        this.loading = false;
        return;
      }

      this.userService.putUserById(this.currentUserId.toString(), userData).subscribe({
        next: () => {
          this.messageService.add({
            severity: 'success',
            summary: 'Sucesso',
            detail: 'Dados do usuário atualizados com sucesso!',
            life: 3000
          });

          setTimeout(() => {
            this.userService.logout();
          }, 2000);
        },
        error: (error: any) => {
          console.error('Erro ao atualizar usuário:', error);
          this.messageService.add({
            severity: 'error',
            summary: 'Erro',
            detail: 'Ocorreu um erro ao atualizar os dados. Tente novamente.',
            life: 5000
          });
          this.loading = false;
        }
      });
    } else {
      this.messageService.add({
        severity: 'warn',
        summary: 'Atenção',
        detail: 'Por favor, preencha corretamente todos os campos',
        life: 3000
      });
      this.markFormGroupTouched(this.userForm);
    }
  }

  resetForm(): void {
    this.userForm.reset();
    this.userForm.patchValue({ role: 'USER' });
    this.messageService.add({
      severity: 'info',
      summary: 'Informação',
      detail: 'Formulário limpo',
      life: 2000
    });
  }

  // Marca todos os campos do formulário como preenchidos/tocados
  private markFormGroupTouched(formGroup: FormGroup): void {
    Object.keys(formGroup.controls).forEach(key => {
      const control = formGroup.get(key);
      control?.markAsTouched();
    });
  }

  get formControls() {
    return this.userForm.controls;
  }
}
