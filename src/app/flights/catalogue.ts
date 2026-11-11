import { Airport } from './airport';

export type FlightScope = 'NATIONAL' | 'INTERNATIONAL';

// One flight in the catalogue (backend: FlightResponse)
export interface Flight {
    id: string;
    airlineId: string;
    price: number;
    originAirport: Airport;          // enum name, e.g. "EL_DORADO"
    destinationAirport: Airport;
    departureTime: string;           // LocalDateTime arrives as an ISO string
    arrivalTime: string;
    flightScope: FlightScope;
    legIds: string[];
    layovers: Layover[];
}

// Backend: LayoverResponse
export interface Layover {
    airport: Airport;
    durationMinutes: number;
}

// Query params for GET /api/flights (backend: SearchFlightsRequest)
export interface FlightSearchRequest {
    origin: string;          // IATA code, e.g. "BOG" (AIRPORTS[x].code)
    destination: string;
    departureDay: string;    // "YYYY-MM-DD"
    passengers: number;
}
