export type TripType = 'ONE_WAY' | 'ROUND_TRIP';

// POST /api/bookings: creates the booking with the outbound flight
export interface SelectOutboundFlightRequest {
    outboundFlightId: string;
    numPassengers: number;
    tripType: TripType;
}

// PUT /api/bookings/{id}/return-flight: adds the return flight
export interface SelectReturnFlightRequest {
    returnFlightId: string;
}

// Returned by both endpoints (only the fields used so far; the backend sends more)
export interface BookingResponse {
    id: string;                     // needed for the return-flight PUT
    numPassengers: number;
    price: number;
    outboundFlightId: string;
    returnFlightId: string | null;  // null until the return flight is chosen
    tripType: TripType;
}
