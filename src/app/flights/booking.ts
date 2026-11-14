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

export interface LuggageDetailResponse {
    quantity: number;
    subTotal: number;
}

export interface PassengerResponse {
    idDocument: string;
    documentType: string;
    firstName: string;
    secondName: string;
    lastName1: string;
    lastName2: string;
    birthDate: string; // LocalDate arrives as an ISO string
    gender: string;
    holder: boolean;
    email: string;
    phonePrefix: string;
    phoneNumber: string;
    luggageDetailRespoonse: LuggageDetailResponse;
}


// Returned by both endpoints (only the fields used so far; the backend sends more)
export interface BookingResponse {
    id: string;                     // needed for the return-flight PUT
    numPassengers: number;
    price: number;
    outboundFlightId: string;
    returnFlightId: string | null;  // null until the return flight is chosen
    tripType: string;
    bookingStatus: string;
    paymentDeadLine: string;          // LocalDateTime arrives as an ISO string
    passengers: PassengerResponse[];
}
