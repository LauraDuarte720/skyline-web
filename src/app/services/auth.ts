import { Injectable, inject, signal } from "@angular/core";
import { HttpClient } from "@angular/common/http";
import { LoginRequest, tokenResponse } from "../flights/auth";

@Injectable({providedIn: "root"}) //Una sola copia de este servicio para toda la app
export class AuthService {
    private http = inject(HttpClient);
    private url = "http://localhost:8080/api/auth";

    isAuthenticated = signal(!!localStorage.getItem("token")); //si hay token en localStorage, entonces el usuario está autenticado
    login(credentials: LoginRequest) {
    return this.http.post<tokenResponse>(`${this.url}/login`, credentials); 
    }

    saveSession(response: tokenResponse): void { 
        localStorage.setItem('token', response.token);
        localStorage.setItem('roles', JSON.stringify(response.roles));
        this.isAuthenticated.set(true);
    }

    getToken(): string | null {
        return localStorage.getItem('token');
    }

    logout(): void {
        localStorage.removeItem('token');
        localStorage.removeItem('roles');
        this.isAuthenticated.set(false);
    }

}