import { Injectable, inject } from "@angular/core";
import { HttpClient } from "@angular/common/http";
import { Airline, CreateAirlineRequest, TopAirline } from "../flights/airline";
import { RegisterUserRequest, UserResponse } from "../flights/auth";
import { ExtraService } from "../flights/extra-service";
import { environment } from "../../environments/environment";

@Injectable({providedIn: "root"})
export class AirlineService {
    private http = inject(HttpClient);
    private url = `${environment.apiUrl}/airlines`;

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

    // GET /api/airlines/{id}/extra-services: the services of one airline (public, no deleted ones)
    getExtraServices(airlineId: string) {
        return this.http.get<ExtraService[]>(`${this.url}/${airlineId}/extra-services`);
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