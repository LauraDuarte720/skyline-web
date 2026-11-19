export type TripType = 'ONE_WAY' | 'ROUND_TRIP';
export type DocumentType = 'CITIZENSHIP_ID'| 'FOREIGNER_ID'| 'PASSPORT'|
    'IDENTITY_CARD'|'CIVIL_REGISTRATION';
export type Gender = 'FEMALE'|'MALE'|'OTHER';

// Options for the <select>s: value = what the backend expects, label = what the user sees
export const DOCUMENT_TYPES: { value: DocumentType; label: string }[] = [
    { value: 'CITIZENSHIP_ID', label: 'Cédula de ciudadanía' },
    { value: 'FOREIGNER_ID', label: 'Cédula de extranjería' },
    { value: 'PASSPORT', label: 'Pasaporte' },
    { value: 'IDENTITY_CARD', label: 'Tarjeta de identidad' },
    { value: 'CIVIL_REGISTRATION', label: 'Registro civil' },
];

export const GENDERS: { value: Gender; label: string }[] = [
    { value: 'FEMALE', label: 'Femenino' },
    { value: 'MALE', label: 'Masculino' },
    { value: 'OTHER', label: 'Otro' },
];

export type PhonePrefix = 'COLOMBIA' | 'UNITED_STATES' | 'CANADA' | 'MEXICO' | 'ARGENTINA'
    | 'BRAZIL' | 'CHILE' | 'PERU' | 'ECUADOR' | 'VENEZUELA' | 'SPAIN' | 'UNITED_KINGDOM'
    | 'FRANCE' | 'GERMANY' | 'ITALY' | 'PORTUGAL' | 'CHINA' | 'JAPAN' | 'SOUTH_KOREA' | 'AUSTRALIA';

export const PHONE_PREFIXES: { value: PhonePrefix; label: string }[] = [
    { value: 'COLOMBIA', label: 'Colombia (+57)' },
    { value: 'UNITED_STATES', label: 'Estados Unidos (+1)' },
    { value: 'CANADA', label: 'Canadá (+1)' },
    { value: 'MEXICO', label: 'México (+52)' },
    { value: 'ARGENTINA', label: 'Argentina (+54)' },
    { value: 'BRAZIL', label: 'Brasil (+55)' },
    { value: 'CHILE', label: 'Chile (+56)' },
    { value: 'PERU', label: 'Perú (+51)' },
    { value: 'ECUADOR', label: 'Ecuador (+593)' },
    { value: 'VENEZUELA', label: 'Venezuela (+58)' },
    { value: 'SPAIN', label: 'España (+34)' },
    { value: 'UNITED_KINGDOM', label: 'Reino Unido (+44)' },
    { value: 'FRANCE', label: 'Francia (+33)' },
    { value: 'GERMANY', label: 'Alemania (+49)' },
    { value: 'ITALY', label: 'Italia (+39)' },
    { value: 'PORTUGAL', label: 'Portugal (+351)' },
    { value: 'CHINA', label: 'China (+86)' },
    { value: 'JAPAN', label: 'Japón (+81)' },
    { value: 'SOUTH_KOREA', label: 'Corea del Sur (+82)' },
    { value: 'AUSTRALIA', label: 'Australia (+61)' },
];

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
    luggage: LuggageDetailResponse;
}


export interface BookingResponse {
    id: string;                     // needed for the return-flight PUT
    numPassengers: number;
    price: number;
    outboundFlightId: string;
    returnFlightId: string | null;  // null until the return flight is chosen
    tripType: string;
    bookingStatus: string;
    paymentDeadline: string;          // LocalDateTime arrives as an ISO string
    passengers: PassengerResponse[];
    extraServices: BookingExtraServiceResponse[];
    payments: PaymentResponse[];      // every payment attempt, the approved one included
}

export type BookingStatus = 'PENDING' | 'CONFIRMED' | 'CANCELLED' | 'EXPIRED';

// How each status is shown: label for the user and the Bootstrap color of its badge
export const BOOKING_STATUSES: Record<BookingStatus, { label: string; color: string }> = {
    PENDING: { label: 'Pendiente de pago', color: 'warning' },
    CONFIRMED: { label: 'Confirmada', color: 'success' },
    CANCELLED: { label: 'Cancelada', color: 'secondary' },
    EXPIRED: { label: 'Vencida', color: 'danger' },
};

export interface SelectSeatRequest{
    legId: string;
    legSeatId: string | null;   // null releases the passenger's seat on that leg
    passengerId: string;
}

export interface LegSeatMapResponse{
    legId: string;
    seats: LegSeatResponse[];
}

export type SeatStatus = 'AVAILABLE' | 'OCCUPIED';
export interface LegSeatResponse{
    id: string;
    seatCode: string;      // row + column, e.g. "12C"
    status: SeatStatus;
}


export interface PassengerSeatResponse {
    legId: string;
    legSeatId: string;
    seatCode: string;
}


export interface PassengerDetailResponse {
    idDocument: string;      // it is the passengerId for PUT /seats
    firstName: string;
    lastName1: string;
    holder: boolean;
    seats: PassengerSeatResponse[];  // one per leg where the passenger already has a seat
    luggage: LuggageDetailResponse | null;
}

// GET /api/bookings/{id} (backend: BookingDetailResponse).
export interface BookingDetail {
    id: string;
    numPassengers: number;
    price: number;
    bookingStatus: string;
    paymentDeadline: string;                        // new: LocalDateTime, no time zone
    passengers: PassengerDetailResponse[];
    extraServices: BookingExtraServiceResponse[];   // new
    payments: PaymentResponse[];                    // new
}

export interface AddPassengersRequest{
    passengers : PassengerRequest[]
    holderIdDocument: string;
    email: string;
    phoneNumber: string;
    phonePrefix: PhonePrefix;
}

export interface PassengerRequest{
    idDocument: string;
    documentType: DocumentType;
    firstName: string;
    secondName: string |null;
    lastName1: string;
    lastName2: string | null;
    birthDate: string;
    gender: Gender
}

export interface AddLuggageRequest {
    passengerId: string;   // idDocument of the passenger
    quantity: number;      // pieces of 23 kg on every leg, greater than 0
}


export type PaymentStatus = 'PENDING' | 'APPROVED' | 'DECLINED' | 'ERROR';

export interface PaymentResponse {
    id: string;
    amount: number;
    status: PaymentStatus;
    transactionId: string | null;   // only when the provider processed it
    message: string | null;         // provider's reason, e.g. "Insufficient funds"
    createdAt: string;
}

export interface BookingExtraServiceResponse {
    extraServiceId: string;
    quantity: number;
    subtotal: number;
}

// Backend: PayBookingRequest
export interface PayBookingRequest {
    paymentToken: string;
}

// PUT /api/bookings/{id}/extra-services: one service for the whole booking
export interface AddExtraServiceRequest {
    extraServiceId: string;
    quantity: number;      // greater than 0, replaces the previous quantity
}

// An extra service already in the booking (backend: BookingExtraServiceResponse)
export interface BookingExtraServiceResponse {
    extraServiceId: string;
    quantity: number;
    subtotal: number;      // quantity x unit price
}

