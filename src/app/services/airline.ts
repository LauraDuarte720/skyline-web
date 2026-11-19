import { Injectable, inject } from "@angular/core";
import { HttpClient } from "@angular/common/http";
import { Airline, CreateAirlineRequest, TopAirline } from "../flights/airline";
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

    // POST /api/airlines: only the ADMIN
    create(request: CreateAirlineRequest) {
        return this.http.post<Airline>(this.url, request);
    }

    // GET /api/airlines/top?limit=5: only the ADMIN. limit goes from 1 to 20.
    getTop(limit = 5) {
        return this.http.get<TopAirline[]>(`${this.url}/top`, { params: { limit } });
    }

    // POST /api/airlines/{id}/admins: only the ADMIN; here the airline goes in the URL
    registerAirlineAdmin(airlineId: string, request: RegisterUserRequest) {
        return this.http.post<UserResponse>(`${this.url}/${airlineId}/admins`, request);
    }
}