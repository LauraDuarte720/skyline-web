//espejos DTO
export interface LoginRequest {
    username: string;
    password: string;
}

export interface tokenResponse {
    token: string;
    type: string;
    expireAt: string; //instant de java viaja como texto en el JSON
    roles: string[];
}