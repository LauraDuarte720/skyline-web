export interface Airline {
    id: string;
    name: string;
    maximumLuggageAmount: number;   
    priceSeats: number;
}

// POST /api/airlines (backend: CreateAirlineRequest). Only the ADMIN.
export interface CreateAirlineRequest {
    name: string;
    maximumLuggageAmount: number;   // pieces per passenger on each leg, greater than 0
    seatPrice: number;              // price of choosing a seat, 0 or more
}

// GET /api/airlines/top (backend: TopAirlineResponse): airlines with the most aircraft
export interface TopAirline {
    airlineId: string;
    name: string;
    aircraftCount: number;
}