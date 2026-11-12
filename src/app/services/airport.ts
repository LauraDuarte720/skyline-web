import { Injectable, inject } from "@angular/core";
import { HttpClient } from "@angular/common/http";
import { Observable, map, shareReplay } from "rxjs";
import { Airport, AirportCode } from "../flights/airport";

@Injectable({providedIn: "root"})
export class AirportService {
    private http = inject(HttpClient);
    private url = "http://localhost:8080/api/airports";

    // The catalog does not change while the app runs: it is requested once and every
    // subscriber gets the same answer (shareReplay), without new HTTP calls.
    private airports$ = this.http.get<Airport[]>(this.url).pipe(shareReplay(1));

    getAirports(): Observable<Airport[]> {
        return this.airports$;
    }

    // Lookup by IATA code, to show the name or city of a code from FlightResponse.
    getAirportsByCode(): Observable<Map<AirportCode, Airport>> {
        return this.airports$.pipe(
            map((airports) => new Map(airports.map((airport) => [airport.code, airport])))
        );
    }
}
