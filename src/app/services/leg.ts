import { Injectable, inject } from "@angular/core";
import { HttpClient } from "@angular/common/http";
import { CreateLegRequest, LegResponse } from "../flights/leg";
import { environment } from "../../environments/environment";

@Injectable({providedIn: "root"})
export class LegService {
    private http = inject(HttpClient);
    private url = `${environment.apiUrl}/legs`;

    // POST /api/legs: only airline users; the airline comes from the token
    create(request: CreateLegRequest) {
        return this.http.post<LegResponse>(this.url, request);
    }
}