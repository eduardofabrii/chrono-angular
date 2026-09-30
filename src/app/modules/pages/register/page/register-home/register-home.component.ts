import { Component, inject, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators, AbstractControl } from '@angular/forms';
import { MessageService } from 'primeng/api';
import { UserService } from '../../../../../services/user/user.service';
import { User } from '../../../../../models/interfaces/register/User';
import { DateUtilsService } from '../../../../../shared/services/date-utils.service';

@Component({
  selector: 'app-register-home',
  templateUrl: './register-home.component.html',
  styleUrl: './register-home.component.scss',
})
export class RegisterHomeComponent implements OnInit {
  private readonly fb = inject(FormBuilder);
  private readonly userService = inject(UserService);
  private readonly messageService = inject(MessageService);
  private readonly dateUtils = inject(DateUtilsService);

  readonly roles = this.userService.getUserRoles();

  users: User[] = [];
  filteredUsers: User[] = [];
  searchText = '';
  isLoading = true;
  saving = false;
  displayNewUserDialog = false;

  userForm: FormGroup = this.fb.group({
    name: ['', [Validators.required]],
    email: ['', [Validators.required, Validators.email]],
    password: ['', [Validators.required, Validators.minLength(6)]],
    confirmPassword: ['', [Validators.required]],
    role: ['USER', [Validators.required]]
  }, {
    validators: this.passwordMatchValidator.bind(this)
  });

  ngOnInit(): void {
    this.loadUsers();
  }

  get formControls(): { [key: string]: AbstractControl } {
    return this.userForm.controls;
  }

  loadUsers(): void {
    this.isLoading = true;
    this.userService.getUsers().subscribe({
      next: users => {
        this.users = users.map(user => ({
          id: user.id,
          name: user.name,
          email: user.email,
          role: user.role || 'USER',
          active: user.active,
          lastLogin: user.lastLogin
        }));
        this.applyFilters();
        this.isLoading = false;
      },
      error: () => {
        this.showMessage('error', 'Erro', 'Não foi possível carregar a lista de usuários');
        this.isLoading = false;
      }
    });
  }

  applyFilters(): void {
    const term = this.searchText.trim().toLowerCase();
    this.filteredUsers = this.users.filter(user =>
      !term || user.name.toLowerCase().includes(term) || user.email.toLowerCase().includes(term));
  }

  count(filter: string): number {
    return this.users.filter(user => this.matchesFilter(user, filter)).length;
  }

  openNewUserDialog(): void {
    this.userForm.reset({ role: 'USER' });
    this.displayNewUserDialog = true;
  }

  onSubmit(): void {
    if (!this.userForm.valid) {
      this.userForm.markAllAsTouched();
      this.showMessage('warn', 'Atenção', 'Por favor, preencha todos os campos corretamente');
      return;
    }

    this.saving = true;
    const { name, email, password, role } = this.userForm.value;
    this.userService.registerUser({ name, email, password, role }).subscribe({
      next: () => {
        this.showMessage('success', 'Sucesso', 'Usuário cadastrado com sucesso!');
        this.saving = false;
        this.displayNewUserDialog = false;
        this.loadUsers();
      },
      error: () => {
        this.showMessage('error', 'Erro', 'Ocorreu um erro ao cadastrar o usuário.');
        this.saving = false;
      }
    });
  }

  toggleUserActiveStatus(user: User, isActive: boolean): void {
    if (!user.id) return;

    this.userService.toggleUserActiveStatus(user.id, isActive).subscribe({
      next: () => {
        user.active = isActive;
        this.applyFilters();
        this.showMessage('success', 'Sucesso', `Usuário ${isActive ? 'ativado' : 'desativado'} com sucesso!`);
      },
      error: () => this.showMessage('error', 'Erro', `Erro ao ${isActive ? 'ativar' : 'desativar'} usuário.`)
    });
  }

  initials(name: string): string {
    return name.split(' ').filter(Boolean).slice(0, 2).map(part => part[0]).join('').toUpperCase();
  }

  /** "Hoje, 14:02", "Ontem, 18:30" ou a data. */
  formatLastLogin(lastLogin: Date | string | undefined): string {
    const date = typeof lastLogin === 'string' ? this.dateUtils.parseDateTime(lastLogin) : lastLogin ?? null;
    if (!date) return 'Nunca acessou';
    const time = `${String(date.getHours()).padStart(2, '0')}:${String(date.getMinutes()).padStart(2, '0')}`;
    const today = new Date();
    const yesterday = new Date(today.getFullYear(), today.getMonth(), today.getDate() - 1);
    if (date.toDateString() === today.toDateString()) return `Hoje, ${time}`;
    if (date.toDateString() === yesterday.toDateString()) return `Ontem, ${time}`;
    return this.dateUtils.formatDateForDisplay(date);
  }

  private matchesFilter(user: User, filter: string): boolean {
    switch (filter) {
      case 'ATIVOS': return !!user.active;
      case 'INATIVOS': return !user.active;
      case 'ADMIN': return user.role === 'ADMIN';
      default: return true;
    }
  }

  private passwordMatchValidator(form: FormGroup): { mismatch: boolean } | null {
    return form.get('password')?.value === form.get('confirmPassword')?.value ? null : { mismatch: true };
  }

  private showMessage(severity: string, summary: string, detail: string): void {
    this.messageService.add({ severity, summary, detail, life: severity === 'error' ? 5000 : 3000 });
  }
}
