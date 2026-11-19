import { AirportCode } from './airport';

// POST /api/legs (backend: CreateLegRequest). The airline is not sent: it comes from the token.
export interface CreateLegRequest {
    originAirport: AirportCode;       // IATA code, e.g. "BOG"
    destinationAirport: AirportCode;
    departureTime: string;            // LocalDateTime as "YYYY-MM-DDTHH:mm"
    arrivalTime: string;
    aircraftId: string;               // an aircraft of the airline (id from the aircrafts page)
    luggagePrice: number;             // 0 or more
    price: number;                    // greater than 0
}

// Backend: LegResponse
export interface LegResponse {
    id: string;
    originAirport: AirportCode;
    destinationAirport: AirportCode;
    departureTime: string;            // LocalDateTime arrives as an ISO string
    arrivalTime: string;
    airlineId: string;
    aircraftId: string;
    luggagePrice: number;
    price: number;
    availableSeats: number;
}