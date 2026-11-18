import { Injectable, inject } from "@angular/core";
import { HttpClient } from "@angular/common/http";
import { map } from "rxjs";
import { Airline } from "../flights/airline";

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
}