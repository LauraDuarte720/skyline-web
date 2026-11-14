import { Injectable, inject, signal } from "@angular/core";
import { HttpClient } from "@angular/common/http";
import { SelectOutboundFlightRequest, SelectReturnFlightRequest, BookingResponse} from "../flights/booking";

@Injectable({providedIn: "root"}) 
export class BookingService {
    private http = inject(HttpClient);
    private url = "http://localhost:8080/api/bookings";

    create(request: SelectOutboundFlightRequest) {
        return this.http.post<BookingResponse>(this.url, request);
    }

    selectReturnFlight(bookingId: string, request: SelectReturnFlightRequest) {
        return this.http.put<BookingResponse>(`${this.url}/${bookingId}/return-flight`, request);
    }   



}