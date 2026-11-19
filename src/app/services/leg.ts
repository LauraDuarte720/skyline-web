import { Injectable, inject } from "@angular/core";
import { HttpClient } from "@angular/common/http";
import { CreateLegRequest, LegResponse } from "../flights/leg";

@Injectable({providedIn: "root"})
export class LegService {
    private http = inject(HttpClient);
    private url = "http://localhost:8080/api/legs";

    // POST /api/legs: only airline users; the airline comes from the token
    create(request: CreateLegRequest) {
        return this.http.post<LegResponse>(this.url, request);
    }
}