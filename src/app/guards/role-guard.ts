import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthService } from '../services/auth';
import { NotificationsService } from '../services/notifications';
import { Role } from '../flights/auth';

// Only lets in a user with one of the roles. Use: canActivate: [roleGuard('AIRLINE_ADMIN', 'AIRLINE_SELLER')]
export const roleGuard = (...allowed: Role[]): CanActivateFn => () => {
  const auth = inject(AuthService);
  const router = inject(Router);
  const announcement = inject(NotificationsService);

  // No session: first log in
  if (!auth.isAuthenticated()) {
    return router.createUrlTree(['/login']);
  }

  if (auth.hasRole(...allowed)) {
    return true;
  }

  announcement.error('No tienes permiso para entrar a esa página.');
  return router.createUrlTree(['/']);
};