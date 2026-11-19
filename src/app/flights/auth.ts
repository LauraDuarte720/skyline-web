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