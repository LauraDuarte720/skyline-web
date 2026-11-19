import { Injectable, inject } from "@angular/core";
import { HttpClient } from "@angular/common/http";
import { SelectOutboundFlightRequest, SelectReturnFlightRequest, BookingResponse, SelectSeatRequest, LegSeatMapResponse, AddPassengersRequest, BookingDetail, AddLuggageRequest, PayBookingRequest } from "../flights/booking";


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


    getBooking(bookingId: string) {
        return this.http.get<BookingDetail>(`${this.url}/${bookingId}`);
    }

    addPassengers(bookingId: string, request: AddPassengersRequest){
        return this.http.put<BookingResponse>(`${this.url}/${bookingId}/passengers`, request)
    }

    addLuggage(bookingId: string, request: AddLuggageRequest) {
        return this.http.put<BookingResponse>(`${this.url}/${bookingId}/luggage`, request);
    }

    pay(bookingId: string, request: PayBookingRequest) {
        return this.http.post<BookingResponse>(`${this.url}/${bookingId}/payment`, request);
    }
}