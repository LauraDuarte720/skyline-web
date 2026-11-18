import { Injectable, inject } from "@angular/core";
import { HttpClient } from "@angular/common/http";
import { SelectOutboundFlightRequest, SelectReturnFlightRequest, BookingResponse, SelectSeatRequest, LegSeatMapResponse } from "../flights/booking";

@Injectable({providedIn: "root"})
export class BookingService {
    private http = inject(HttpClient);
    private url = "http://localhost:8080/api/bookings";
    private urlSeats = "http://localhost:8080/api/legs";

    create(request: SelectOutboundFlightRequest) {
        return this.http.post<BookingResponse>(this.url, request);
    }

    selectReturnFlight(bookingId: string, request: SelectReturnFlightRequest) {
        return this.http.put<BookingResponse>(`${this.url}/${bookingId}/return-flight`, request);
    }

    selectLegSeat(bookingId: string, request: SelectSeatRequest) {
        return this.http.put<BookingResponse>(`${this.url}/${bookingId}/seats`, request);
    }

    getLegSeatMap(legId: string) {
        return this.http.get<LegSeatMapResponse>(`${this.urlSeats}/${legId}/seats`);
    }

    cancel(bookingId: string) {
        return this.http.put<BookingResponse>(`${this.url}/${bookingId}/cancel`, {});
    }
}