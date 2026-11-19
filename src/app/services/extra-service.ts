import { Injectable, inject } from "@angular/core";
import { HttpClient, HttpParams } from "@angular/common/http";
import { CreateExtraServiceRequest, ExtraService, Page } from "../flights/extra-service";
import { environment } from "../../environments/environment";

@Injectable({providedIn: "root"})
export class ExtraServiceService {
    private http = inject(HttpClient);
    private url = `${environment.apiUrl}/extra_services`;

    // GET /api/extra_services?page=0&size=5&search=...&airlineId=...
    search(page = 0, size = 5, search = '', airlineId = '') {
        let params = new HttpParams().set('page', page).set('size', size);

        // Only send the optional filters when they have a value
        if (search.trim()) {
            params = params.set('search', search.trim());
        }
        if (airlineId) {
            params = params.set('airlineId', airlineId);
        }

        return this.http.get<Page<ExtraService>>(this.url, { params });
    }

    // POST /api/extra_services: the airline comes from the token
    create(request: CreateExtraServiceRequest) {
        return this.http.post<ExtraService>(this.url, request);
    }

    // DELETE /api/extra_services/{id}: soft delete, old bookings keep the service. Answers 204 (no body).
    delete(extraServiceId: string) {
        return this.http.delete<void>(`${this.url}/${extraServiceId}`);
    }
}