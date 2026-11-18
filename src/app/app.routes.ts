import { Routes } from '@angular/router';
import { Home } from './components/home/home';
import { Login } from './components/login/login';
import { Catalogue } from './components/catalogue/catalogue';
import { Book } from './components/book/book';
import { SeatSelector } from './components/seat-selector/seat-selector';
import { authGuard,guestGuard } from './guards/auth-guard';
import { Passengers } from './components/passengers/passengers';
export const routes: Routes = [
    { path: '', component: Home },
    { path: 'login', component: Login, canActivate: [guestGuard] },
    {path: 'catalogue', component: Catalogue},
    {path: 'seat-selector', component: SeatSelector},
    {path: 'book', component: Book},
    {path: 'passengers', component: Passengers},
    { path: '**', pathMatch: 'full', redirectTo: '' },
];
