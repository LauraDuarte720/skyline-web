import { Injectable, inject } from "@angular/core";
import { HttpClient, HttpParams } from "@angular/common/http";
import { ExtraService, Page } from "../flights/extra-service";

@Injectable({providedIn: "root"})
export class ExtraServiceService {
    private http = inject(HttpClient);
    private url = "http://localhost:8080/api/extra_services";

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
}