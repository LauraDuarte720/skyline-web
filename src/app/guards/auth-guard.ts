import { inject } from '@angular/core';
import { AuthService } from '../services/auth';
import { CanActivateFn, Router } from '@angular/router';

//solo deje pasar al que tenga una sesion
export const authGuard: CanActivateFn = () => {
  const auth = inject(AuthService);
  const router = inject(Router);

  if(auth.isAuthenticated()) {
    return true;
  }
  return router.createUrlTree(['/login']);
};


//Solo deje pasar a quien no tiene una sesion (/login)
export const guestGuard: CanActivateFn = () => {
  const auth = inject(AuthService);
  const router = inject(Router); 
  if(!auth.isAuthenticated()) {
    return true;
  }
  return router.createUrlTree(['/']);
}
