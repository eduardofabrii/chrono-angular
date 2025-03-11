import { Component, inject, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators, AbstractControl } from '@angular/forms';
import { MessageService, ConfirmationService } from 'primeng/api';
import { UserService } from '../../../../../services/user/user.service';
import { User } from '../../../../../models/interfaces/register/User';
import { DatePipe } from '@angular/common';

@Component({
  selector: 'app-register-home',
  templateUrl: './register-home.component.html',
  styleUrl: './register-home.component.scss',
  providers: [MessageService, DatePipe]
})
export class RegisterHomeComponent implements OnInit {
  userForm!: FormGroup;
  roles: { label: string, value: string }[] = [];
  loading = false;

  displayUserDialog = false;
  users: User[] = [];
  selectedUser: User | null = null;
  loadingUsers = false;

  private readonly fb = inject(FormBuilder);
  private readonly userService = inject(UserService);
  private readonly messageService = inject(MessageService);
  private readonly confirmationService = inject(ConfirmationService);
  private readonly datePipe = inject(DatePipe);

  ngOnInit(): void {
    this.initForm();
    this.initRoles();
  }

  private initForm(): void {
    this.userForm = this.fb.group({
      name: ['', [Validators.required]],
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(6)]],
      confirmPassword: ['', [Validators.required]],
      role: ['USER', [Validators.required]]
    }, {
      validators: this.passwordMatchValidator
    });
  }

  private initRoles(): void {
    this.roles = this.userService.getUserRoles();
  }

  private passwordMatchValidator(form: FormGroup): { mismatch: boolean } | null {
    const password = form.get('password')?.value;
    const confirmPassword = form.get('confirmPassword')?.value;
    return password === confirmPassword ? null : { mismatch: true };
  }

  onSubmit(): void {
    if (this.userForm.valid) {
      this.loading = true;
      const userData: User = {
        name: this.userForm.value.name,
        email: this.userForm.value.email,
        password: this.userForm.value.password,
        role: this.userForm.value.role
      };

      this.userService.registerUser(userData).subscribe({
        next: () => {
          this.showMessage('success', 'Sucesso', 'Usuário cadastrado com sucesso!');
          this.userForm.reset();
          this.userForm.patchValue({ role: 'USER' });
          this.loading = false;
        },
        error: () => {
          this.showMessage('error', 'Erro', 'Ocorreu um erro ao cadastrar o usuário. Tente novamente.');
          this.loading = false;
        }
      });
    } else {
      this.showMessage('warn', 'Atenção', 'Por favor, preencha corretamente todos os campos');
      this.markFormGroupTouched(this.userForm);
    }
  }

  resetForm(): void {
    this.userForm.reset();
    this.userForm.patchValue({ role: 'USER' });
    this.showMessage('info', 'Informação', 'Formulário limpo');
  }

  openDeleteUserDialog(): void {
    this.displayUserDialog = true;
    this.loadUsers();
  }

  loadUsers(): void {
    this.loadingUsers = true;
    this.userService.getUsers().subscribe({
      next: (users) => {
        console.log('Raw API response:', users);

        this.users = users.map(user => {
          const rawActive = (user as any).active;
          const active = this.parseBooleanValue(rawActive);

          // Processa o ultimo login
          let lastLogin = (user as any).lastLogin;

          return {
            id: user.id,
            name: user.name,
            email: user.email,
            role: (user as any).role || 'USER',
            active: active,
            lastLogin: lastLogin
          };
        });

        this.loadingUsers = false;
      },
      error: () => {
        this.showMessage('error', 'Erro', 'Não foi possível carregar a lista de usuários');
        this.loadingUsers = false;
      }
    });
  }

  toggleUserActiveStatus(user: User, isActive: boolean): void {
    if (!user.id) {
      this.showMessage('error', 'Erro', 'ID do usuário não encontrado');
      return;
    }

    const originalValue = user.active;
    user.active = isActive;
    this.loadingUsers = true;

    this.userService.toggleUserActiveStatus(user.id, isActive).subscribe({
      next: () => {
        this.showMessage('success', 'Sucesso',
          `Usuário ${isActive ? 'ativado' : 'desativado'} com sucesso!`);
        this.loadUsers();
      },
      error: () => {
        user.active = originalValue;
        this.showMessage('error', 'Erro',
          `Erro ao ${isActive ? 'ativar' : 'desativar'} usuário.`);
        this.loadingUsers = false;
      }
    });
  }

  onUserDialogHide(): void {
    this.selectedUser = null;
  }

  private showMessage(severity: string, summary: string, detail: string): void {
    this.messageService.add({
      severity,
      summary,
      detail,
      life: severity === 'error' ? 5000 : 3000
    });
  }

  private markFormGroupTouched(formGroup: FormGroup): void {
    Object.keys(formGroup.controls).forEach(key => {
      formGroup.get(key)?.markAsTouched();
    });
  }

  private parseBooleanValue(value: any): boolean {
    if (value === false ||
        value === 'false' ||
        value === 0 ||
        value === '0' ||
        value === null ||
        value === undefined ||
        value === '' ||
        value === 'null' ||
        value === 'undefined') {
      return false;
    }

    if (value === true ||
        value === 'true' ||
        value === 1 ||
        value === '1') {
      return true;
    }

    return Boolean(value);
  }

  get formControls(): { [key: string]: AbstractControl } {
    return this.userForm.controls;
  }

  formatLastLogin(lastLogin: Date | string | undefined): string {
    if (!lastLogin) {
      return 'Nunca acessou';
    }

    const formattedDate = this.datePipe.transform(lastLogin, 'dd/MM/yyyy HH:mm');
    return formattedDate || 'Data inválida';
  }
}
