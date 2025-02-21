import { Component, inject } from "@angular/core";
import { FormBuilder, Validators } from "@angular/forms";
import { CookieService } from "ngx-cookie-service";

import { UserService } from './../../../services/user/user.service';
import { AuthRequest } from "../../../models/interfaces/auth/AuthRequest";
import { MessageService } from 'primeng/api';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss'],
  providers: [MessageService]
})
export class LoginComponent {
  loginCard = true;

  formBuilder = inject(FormBuilder);
  userService = inject(UserService);
  cookieService = inject(CookieService);
  messageService = inject(MessageService);

  loginForm = this.formBuilder.group({
    name: ['', Validators.required],
    password: ['', Validators.required]
  });

  onSubmitLoginForm() {
    if (this.loginForm.valid) {
      this.userService.auth(this.loginForm.value as AuthRequest)
        .subscribe({
          next: (response) => {
            if (response) {
              this.cookieService.set('token', response.token);
              this.messageService.add({ severity: 'success', summary: 'Sucesso', detail: `Bem-vindo ${this.loginForm.value.name}!` });
              this.loginForm.reset();
              window.location.href = '/dashboard';
            }
          },
          error: (error) => {
            this.messageService.add({ severity: 'error', summary: 'Erro', detail: `${this.loginForm.value.name}, não encontramos seu login ` });
            console.log('Login falhou', error);
          }
        });
    }
  }
}
