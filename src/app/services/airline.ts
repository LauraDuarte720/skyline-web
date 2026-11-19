import { Injectable, inject } from "@angular/core";
import { HttpClient } from "@angular/common/http";
import { Airline } from "../flights/airline";
import { RegisterUserRequest, UserResponse } from "../flights/auth";

@Injectable({providedIn: "root"})
export class AirlineService {
    private http = inject(HttpClient);
    private url = "http://localhost:8080/api/airlines";

    getAirlines() {
        return this.http.get<Airline[]>(this.url);
    }

    getById(airlineId: string) {
        return this.http.get<Airline>(`${this.url}/${airlineId}`);
    }

    // POST /api/airlines/sellers: only an AIRLINE_ADMIN; the airline comes from the token
    registerSeller(request: RegisterUserRequest) {
        return this.http.post<UserResponse>(`${this.url}/sellers`, request);
    }
}