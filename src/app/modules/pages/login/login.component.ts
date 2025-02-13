import { Component, inject } from "@angular/core";
import { FormBuilder, Validators } from "@angular/forms";
import { CookieService } from "ngx-cookie-service";

import { UserService } from './../../../services/user/user.service';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss']
})
export class LoginComponent {
  loginCard = true;

  formBuilder = inject(FormBuilder);
  userService = inject(UserService);
  cookieService = inject(CookieService);

  loginForm = this.formBuilder.group({
    name: ['', Validators.required],
    email: ['', [Validators.required, Validators.email]],
    password: ['', Validators.required]
  });

  onSubmitLoginForm() {
    if (this.loginForm.valid) {
      console.log("Dados de login: ", this.loginForm.value);
    } else {
      console.log("Formulário inválido!");
    }
  }
}
