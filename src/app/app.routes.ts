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
import { AirlineAircrafts } from './components/airline-aircrafts/airline-aircrafts';
import { AirlineLegs } from './components/airline-legs/airline-legs';
import { AdminPanel } from './components/admin-panel/admin-panel';
import { AdminAirlines } from './components/admin-airlines/admin-airlines';
import { AdminAirlineAdmins } from './components/admin-airline-admins/admin-airline-admins';
import { Register } from './components/register/register';
import { MyBookings } from './components/my-bookings/my-bookings';

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
    {path: 'airline/aircrafts', component: AirlineAircrafts, canActivate: [roleGuard('AIRLINE_ADMIN', 'AIRLINE_SELLER')]},
    {path: 'airline/legs', component: AirlineLegs, canActivate: [roleGuard('AIRLINE_ADMIN', 'AIRLINE_SELLER')]},
    {path: 'admin', component: AdminPanel, canActivate: [roleGuard('ADMIN')]},
    {path: 'admin/airlines', component: AdminAirlines, canActivate: [roleGuard('ADMIN')]},
    {path: 'admin/airline-admins', component: AdminAirlineAdmins, canActivate: [roleGuard('ADMIN')]},
    { path: 'register', component: Register, canActivate: [guestGuard] },
    {path: 'my-bookings', component: MyBookings, canActivate: [roleGuard('CUSTOMER')]},
    { path: '**', pathMatch: 'full', redirectTo: '' },
];
