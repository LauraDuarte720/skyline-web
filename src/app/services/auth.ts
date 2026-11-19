import { Injectable, computed, inject, signal } from "@angular/core";
import { HttpClient } from "@angular/common/http";
import { LoginRequest, Role, tokenResponse } from "../flights/auth";

@Injectable({providedIn: "root"}) //Una sola copia de este servicio para toda la app
export class AuthService {
    private http = inject(HttpClient);
    private url = "http://localhost:8080/api/auth";

    isAuthenticated = signal(!!localStorage.getItem("token")); //si hay token en localStorage, entonces el usuario está autenticado
    roles = signal<Role[]>(this.loadRoles());                  // roles of the user, [] if nobody logged in
    airlineId = signal<string | null>(this.readAirlineId(localStorage.getItem("token")));  // only airline users have it

    // The user works for an airline (admin or seller)
    isAirlineUser = computed(() => this.hasRole('AIRLINE_ADMIN', 'AIRLINE_SELLER'));

    login(credentials: LoginRequest) {
    return this.http.post<tokenResponse>(`${this.url}/login`, credentials); 
    }

    saveSession(response: tokenResponse): void { 
        localStorage.setItem('token', response.token);
        localStorage.setItem('roles', JSON.stringify(response.roles));
        this.isAuthenticated.set(true);
        this.roles.set(response.roles);
        this.airlineId.set(this.readAirlineId(response.token));
    }

    getToken(): string | null {
        return localStorage.getItem('token');
    }

    logout(): void {
        localStorage.removeItem('token');
        localStorage.removeItem('roles');
        this.isAuthenticated.set(false);
        this.roles.set([]);
        this.airlineId.set(null);
    }

    // True if the user has at least one of the roles
    hasRole(...allowed: Role[]): boolean {
        return this.roles().some((role) => allowed.includes(role));
    }

    // Roles saved in the login, so they survive a page reload
    private loadRoles(): Role[] {
        try {
            return JSON.parse(localStorage.getItem('roles') ?? '[]');
        } catch {
            return [];
        }
    }

    // The airline is not in the login response, it is inside the token (claim "airlineId").
    // A JWT is header.payload.signature; the payload is JSON in base64url.
    private readAirlineId(token: string | null): string | null {
        if (!token) return null;
        try {
            const payload = token.split('.')[1].replace(/-/g, '+').replace(/_/g, '/');
            return JSON.parse(atob(payload)).airlineId ?? null;
        } catch {
            return null;
        }
    }
}