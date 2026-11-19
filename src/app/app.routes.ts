import { Routes } from '@angular/router';
import { Home } from './components/home/home';
import { Login } from './components/login/login';
import { Catalogue } from './components/catalogue/catalogue';
import { Book } from './components/book/book';
import { SeatSelector } from './components/seat-selector/seat-selector';
import { authGuard,guestGuard} from './guards/auth-guard';
import { Luggage } from './components/luggage/luggage';
import { leaveBookingGuard } from './guards/leave-booking-guard';
import { Passengers } from './components/passengers/passengers';
import { Payment } from './components/payment/payment';
import { ExtraServices } from './components/extra-services/extra-services';
import { Confirmation } from './components/confirmation/confirmation';
import { roleGuard } from './guards/role-guard';
import { AirlinePanel } from './components/airline-panel/airline-panel';
import { AirlineExtraServices } from './components/airline-extra-services/airline-extra-services';
import { AirlineSellers } from './components/airline-sellers/airline-sellers';

export const routes: Routes = [
    { path: '', component: Home },
    { path: 'login', component: Login, canActivate: [guestGuard] },
    {path: 'catalogue', component: Catalogue},
    {path: 'seat-selector', component: SeatSelector, canDeactivate: [leaveBookingGuard]},
    {path: 'book', component: Book},
    {path: 'passengers', component: Passengers, canDeactivate: [leaveBookingGuard]},
    {path: 'luggage', component: Luggage, canDeactivate: [leaveBookingGuard]},
    {path: 'payment', component: Payment, canDeactivate: [leaveBookingGuard]},
    {path: 'extra-services', component: ExtraServices, canDeactivate: [leaveBookingGuard]},
    {path: 'confirmation', component: Confirmation},   // no guard: the booking is already paid
    {path: 'airline', component: AirlinePanel, canActivate: [roleGuard('AIRLINE_ADMIN', 'AIRLINE_SELLER')]},
    {path: 'airline/extra-services', component: AirlineExtraServices, canActivate: [roleGuard('AIRLINE_ADMIN', 'AIRLINE_SELLER')]},
    {path: 'airline/sellers', component: AirlineSellers, canActivate: [roleGuard('AIRLINE_ADMIN')]},   // only the admin
    { path: '**', pathMatch: 'full', redirectTo: '' },
];
