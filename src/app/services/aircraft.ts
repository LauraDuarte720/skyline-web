import { Injectable, inject } from "@angular/core";
import { HttpClient } from "@angular/common/http";
import { AircraftResponse, CreateAircraftRequest } from "../flights/aircraft";

@Injectable({providedIn: "root"})
export class AircraftService {
    private http = inject(HttpClient);
    private url = "http://localhost:8080/api/aircrafts";

    // POST /api/aircrafts: only airline users; the airline comes from the token
    create(request: CreateAircraftRequest) {
        return this.http.post<AircraftResponse>(this.url, request);
    }
}