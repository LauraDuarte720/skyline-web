import { Injectable, inject } from "@angular/core";
import { HttpClient, HttpParams } from "@angular/common/http";
import { CreateLegRequest, LegResponse } from "../flights/leg";
import { Page } from "../flights/extra-service";
import { environment } from "../../environments/environment";

@Injectable({providedIn: "root"})
export class LegService {
    private http = inject(HttpClient);
    private url = `${environment.apiUrl}/legs`;

    // POST /api/legs: only airline users; the airline comes from the token
    create(request: CreateLegRequest) {
        return this.http.post<LegResponse>(this.url, request);
    }

    // GET /api/legs?page=0&size=5: the legs of the airline in the token, by departure time
    getMine(page = 0, size = 5) {
        const params = new HttpParams().set('page', page).set('size', size);
        return this.http.get<Page<LegResponse>>(this.url, { params });
    }
}