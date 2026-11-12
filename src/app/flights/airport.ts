// IATA code of an airport, e.g. "BOG". The backend uses it to identify an airport
// in every request and response (search params, FlightResponse, LayoverResponse...).
export type AirportCode = string;

// One airport of the catalog (backend: AirportResponse, GET /api/airports).
// The list comes from the backend (AirportService), so it is not copied here.
export interface Airport {
  code: AirportCode;  // IATA code, e.g. "BOG"
  name: string;       // full airport name, e.g. "El Dorado International Airport"
  city: string;       // e.g. "Bogotá"
  country: string;    // e.g. "Colombia"
}
