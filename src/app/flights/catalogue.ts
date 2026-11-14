import { AirportCode } from './airport';

export type FlightScope = 'NATIONAL' | 'INTERNATIONAL';

// One flight in the catalogue (backend: FlightResponse)
export interface Flight {
    id: string;
    airlineId: string;
    price: number;
    originAirport: AirportCode;      // IATA code, e.g. "BOG"
    destinationAirport: AirportCode;
    departureTime: string;           // LocalDateTime arrives as an ISO string
    arrivalTime: string;
    flightScope: FlightScope;
    legIds: string[];
    layovers: Layover[];
}

// Backend: LayoverResponse
export interface Layover {
    airport: AirportCode;            // IATA code
    durationMinutes: number;
}

// Query params for GET /api/flights (backend: SearchFlightsRequest)
export interface FlightSearchRequest {
    origin: AirportCode;     // IATA code, e.g. "BOG" (Airport.code)
    destination: AirportCode;
    departureDay: string;    // "YYYY-MM-DD"
    passengers: number;
}
