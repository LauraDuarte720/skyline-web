import { Injectable, inject, signal } from "@angular/core";
import { HttpClient } from "@angular/common/http";
import { Flight, Layover, FlightSearchRequest } from "../flights/catalogue";

@Injectable({providedIn: "root"}) 
export class FlightService {
    private http = inject(HttpClient);
    private url = "http://localhost:8080/api/flights";

    searchFlights(request: FlightSearchRequest) {
        return this.http.get<Flight[]>(this.url, { params: request as any });
    }

}