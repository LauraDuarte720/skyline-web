import { inject } from '@angular/core';
import {HttpErrorResponse, HttpInterceptorFn } from '@angular/common/http';
import { Router } from '@angular/router';
import { catchError ,throwError} from 'rxjs';
import { AuthService } from '../services/auth';
import { NotificationsService } from '../services/notifications';

export const authInterceptor: HttpInterceptorFn = (req, next) => {
  const auth = inject(AuthService)
  const router = inject(Router)
  const announcement = inject(NotificationsService)
  const token = auth.getToken();

  const request = token
  ? req.clone({setHeaders: {Authorization: `Bearer ${token}`}})
  :req

  //mire lo q devurlve el back

  return next(request).pipe( //envia la petición
    catchError((error: HttpErrorResponse) => { //atrapa y se queda pendiente 
      if(error.status === 401 && token &&!req.url.includes('/login')){
        auth.logout();
        announcement.error('Your session has ended. Login again');
        router.navigate(['/login']);
      }
    return throwError(() => error);
    }
  ));

};
