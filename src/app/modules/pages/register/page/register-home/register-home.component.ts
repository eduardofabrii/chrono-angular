import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MessageService } from 'primeng/api';
import { UserService } from '../../../../../services/user/user.service';
import { User } from '../../../../../models/interfaces/register/User';

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

  constructor(
    private fb: FormBuilder,
    private userService: UserService,
    private messageService: MessageService
  ) {}

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
          this.messageService.add({
            severity: 'success',
            summary: 'Sucesso',
            detail: 'Usuário cadastrado com sucesso!',
            life: 3000
          });
          this.userForm.reset();
          this.userForm.patchValue({ role: 'USER' });
          this.loading = false;
        },
        error: (error) => {
          console.error('Erro ao cadastrar usuário:', error);
          this.messageService.add({
            severity: 'error',
            summary: 'Erro',
            detail: 'Ocorreu um erro ao cadastrar o usuário. Tente novamente.',
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
