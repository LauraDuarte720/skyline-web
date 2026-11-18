import {Flight} from './catalogue';
import {TripType} from './booking';


export interface BookingFlow {
    tripType: TripType | null;
    passengers: number | null;
    outboundFlight: Flight | null;
    returnFlight: Flight | null;
    bookingId: string | null;
}
