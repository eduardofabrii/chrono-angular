import { inject } from '@angular/core';
import { UserService } from '../services/user/user.service';
import { CanMatchFn, Router } from '@angular/router';

export const authGuard: CanMatchFn = () => {
  const authService = inject(UserService);
  const router = inject(Router);

  return authService.isAuthenticated() ? true : router.createUrlTree(['/']);
};
