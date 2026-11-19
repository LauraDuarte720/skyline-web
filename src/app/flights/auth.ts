import { DocumentType, Gender } from './booking';

//espejos DTO
export interface LoginRequest {
    username: string;
    password: string;
}

// Roles of the backend (enum Role). They arrive in the "roles" list of the login.
export type Role = 'ADMIN' | 'AIRLINE_ADMIN' | 'AIRLINE_SELLER' | 'CUSTOMER';

export interface tokenResponse {
    token: string;
    type: string;
    expireAt: string; //instant de java viaja como texto en el JSON
    roles: Role[];
}

// POST /api/airlines/sellers (backend: RegisterUserRequest). The role and the airline are not sent:
// the backend makes an AIRLINE_SELLER of the airline in the admin's token.
export interface RegisterUserRequest {
    email: string;
    password: string;          // 8+ characters, an uppercase letter and a number
    idDocument: string;
    documentType: DocumentType;
    firstName: string;
    secondName: string | null;
    lastName1: string;
    lastName2: string | null;
    birthDate: string;         // "YYYY-MM-DD", in the past
    gender: Gender;
}

// The user created (backend: UserResponse). It never has the password.
export interface UserResponse {
    id: string;
    email: string;
    role: Role;
    airlineId: string | null;
}