import { Injectable, inject, signal } from "@angular/core";
import { HttpClient } from "@angular/common/http";
import { Flight, Layover, FlightSearchRequest } from "../flights/catalogue";
import { environment } from "../../environments/environment";

@Injectable({providedIn: "root"}) 
export class FlightService {
    private http = inject(HttpClient);
    private url = `${environment.apiUrl}/flights`;

    searchFlights(request: FlightSearchRequest) {
        return this.http.get<Flight[]>(this.url, { params: request as any });
    }

}