import { Component, inject, OnInit, ChangeDetectorRef } from '@angular/core';
import { FormBuilder, FormGroup, Validators, AbstractControl } from '@angular/forms';
import { MessageService } from 'primeng/api';
import { UserService } from '../../../../../services/user/user.service';
import { User } from '../../../../../models/interfaces/register/User';
import { DateUtilsService } from '../../../../../shared/services/date-utils.service';

@Component({
  selector: 'app-register-home',
  templateUrl: './register-home.component.html',
  styleUrl: './register-home.component.scss',
  providers: [MessageService]
})
export class RegisterHomeComponent implements OnInit {
  userForm!: FormGroup;
  roles: { label: string, value: string }[] = [];
  loading = false;
  isLoading = true;

  displayUserDialog = false;
  users: User[] = [];
  loadingUsers = false;

  searchText: string = '';
  filteredUsers: User[] | null = null;

  private readonly fb = inject(FormBuilder);
  private readonly userService = inject(UserService);
  private readonly messageService = inject(MessageService);
  private readonly cdr = inject(ChangeDetectorRef);
  private readonly dateUtils = inject(DateUtilsService);

  ngOnInit(): void {
    setTimeout(() => {
      this.initForm();
      this.roles = this.userService.getUserRoles();
      this.isLoading = false;
      this.cdr.detectChanges();
    }, 800);
  }

  private initForm(): void {
    this.userForm = this.fb.group({
      name: ['', [Validators.required]],
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(6)]],
      confirmPassword: ['', [Validators.required]],
      role: ['USER', [Validators.required]]
    }, {
      validators: this.passwordMatchValidator.bind(this)
    });
  }

  private passwordMatchValidator(form: FormGroup): { mismatch: boolean } | null {
    const password = form.get('password')?.value;
    const confirmPassword = form.get('confirmPassword')?.value;
    return password === confirmPassword ? null : { mismatch: true };
  }

  onSubmit(): void {
    if (!this.userForm.valid) {
      this.showMessage('warn', 'Atenção', 'Por favor, preencha todos os campos corretamente');
      this.markFormGroupTouched(this.userForm);
      return;
    }

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
        this.showMessage('error', 'Erro', 'Ocorreu um erro ao cadastrar o usuário.');
        this.loading = false;
      }
    });
  }

  resetForm(): void {
    this.userForm.reset();
    this.userForm.patchValue({ role: 'USER' });
    this.showMessage('info', 'Informação', 'Formulário limpo');
  }

  openDeleteUserDialog(): void {
    this.displayUserDialog = true;
    this.searchText = '';
    this.filteredUsers = null;
    this.loadUsers();
  }

  loadUsers(): void {
    this.loadingUsers = true;
    this.userService.getUsers().subscribe({
      next: (users) => {
        console.log('Raw user data from API:', users);
        this.users = users.map(user => {
          return {
            id: user.id,
            name: user.name,
            email: user.email,
            role: user.role || 'USER',
            active: user.active,
            lastLogin: user.lastLogin // Mantém a data no formato original
          };
        });
        console.log('Processed users:', this.users);
        this.loadingUsers = false;
        this.cdr.detectChanges();
      },
      error: (err) => {
        console.error('Error loading users:', err);
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

    this.loadingUsers = true;

    this.userService.toggleUserActiveStatus(user.id, isActive).subscribe({
      next: () => {
        this.showMessage('success', 'Sucesso', `Usuário ${isActive ? 'ativado' : 'desativado'} com sucesso!`);
        setTimeout(() => this.loadUsers(), 800);
      },
      error: () => {
        this.showMessage('error', 'Erro', `Erro ao ${isActive ? 'ativar' : 'desativar'} usuário.`);
        this.loadingUsers = false;
        this.cdr.detectChanges();
      }
    });
  }

  onUserDialogHide(): void {
    this.filteredUsers = null;
    this.searchText = '';
  }

  formatLastLogin(lastLogin: Date | string | undefined): string {
    if (!lastLogin) return 'Nunca acessou';

    try {
      // Se já for uma string formatada corretamente, apenas retorna
      if (typeof lastLogin === 'string' && lastLogin.match(/^\d{2}\/\d{2}\/\d{4} \d{2}:\d{2}:\d{2}$/)) {
        return lastLogin;
      }

      // Se for uma string ISO, converte para Date
      return this.dateUtils.formatDateTime(lastLogin) || 'Data inválida';
    } catch (error) {
      console.error('Error formatting date:', error, lastLogin);
      return 'Data inválida';
    }
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

  get formControls(): { [key: string]: AbstractControl } {
    return this.userForm.controls;
  }

  // Helper methods for statistics (optional)
  getTotalUsers(): number {
    return this.users?.length || 0;
  }

  getActiveUsers(): number {
    return this.users?.filter(u => u.active)?.length || 0;
  }

  getAdminUsers(): number {
    return this.users?.filter(u => u.role === 'ADMIN')?.length || 0;
  }

  searchUsers(): void {
    if (!this.searchText.trim()) {
      this.filteredUsers = null;
      return;
    }

    const searchTerm = this.searchText.toLowerCase().trim();
    this.filteredUsers = this.users.filter(user =>
      user.name.toLowerCase().includes(searchTerm) ||
      user.email.toLowerCase().includes(searchTerm)
    );
  }

  clearSearch(): void {
    this.searchText = '';
    this.filteredUsers = null;
  }
}
