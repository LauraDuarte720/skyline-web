export type AircraftModel = 'AIRBUS_A319_NEO' | 'AIRBUS_A320_NEO' | 'AIRBUS_A321_NEO'
    | 'BOEING_737_8_MAX' | 'BOEING_737_9_MAX' | 'EMBRAER_E175';

// Options to choose the model. maxSeats and columns are copied from the backend enum, only to show them.
export const AIRCRAFT_MODELS: { value: AircraftModel; label: string; maxSeats: number; columns: string }[] = [
    { value: 'AIRBUS_A319_NEO', label: 'Airbus A319neo', maxSeats: 160, columns: 'A-F' },
    { value: 'AIRBUS_A320_NEO', label: 'Airbus A320neo', maxSeats: 194, columns: 'A-F' },
    { value: 'AIRBUS_A321_NEO', label: 'Airbus A321neo', maxSeats: 244, columns: 'A-F' },
    { value: 'BOEING_737_8_MAX', label: 'Boeing 737-8 MAX', maxSeats: 210, columns: 'A-F' },
    { value: 'BOEING_737_9_MAX', label: 'Boeing 737-9 MAX', maxSeats: 220, columns: 'A-F' },
    { value: 'EMBRAER_E175', label: 'Embraer E175', maxSeats: 88, columns: 'A-D' },
];

// POST /api/aircrafts (backend: CreateAircraftRequest). The airline comes from the token.
export interface CreateAircraftRequest {
    aircraftModel: AircraftModel;
}

// Backend: AircraftResponse
export interface AircraftResponse {
    id: string;
    aircraftModel: AircraftModel;
    seats: string[];     // seat codes, e.g. "1A", "1B"...
}