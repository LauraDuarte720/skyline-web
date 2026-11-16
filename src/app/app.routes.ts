import { Routes } from '@angular/router';
import { Home } from './components/home/home';
import { Login } from './components/login/login';
import { Catalogue } from './components/catalogue/catalogue';
import { Book } from './components/book/book';
import { authGuard,guestGuard } from './guards/auth-guard';
export const routes: Routes = [
    { path: '', component: Home },
    { path: 'login', component: Login, canActivate: [guestGuard] },
    {path: 'catalogue', component: Catalogue},
    {path: 'book', component: Book, canActivate:[authGuard]},
    { path: '**', pathMatch: 'full', redirectTo: '' },
];
