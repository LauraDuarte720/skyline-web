import { Injectable, inject } from "@angular/core";
import { HttpClient } from "@angular/common/http";
import { AircraftResponse, CreateAircraftRequest } from "../flights/aircraft";
import { environment } from '../../environments/environment';

@Injectable({providedIn: "root"})
export class AircraftService {
    private http = inject(HttpClient);
    private url = `${environment.apiUrl}/aircrafts`;

    // POST /api/aircrafts: only airline users; the airline comes from the token
    create(request: CreateAircraftRequest) {
        return this.http.post<AircraftResponse>(this.url, request);
    }

    // GET /api/aircrafts: the aircraft of the airline in the token
    getMine() {
        return this.http.get<AircraftResponse[]>(this.url);
    }
}