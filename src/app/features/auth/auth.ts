import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, tap } from 'rxjs';

export interface LoginRequest {
  email: string;
  password: string;
}

export interface LoginResponse {
  token: string;
  username?: string;
  fullName?: string;
  email?: string;
  role: 'Admin' | 'Instructor' | 'Student';
}

@Injectable({
  providedIn: 'root'
})
export class AuthService {

  private http = inject(HttpClient);

  private readonly API_URL =
    'http://localhost:5178/api/auth';

  private readonly TOKEN_KEY =
    'tms_token';

  // ================================
  // LOGIN
  // ================================

  login(
    credentials: LoginRequest
  ): Observable<LoginResponse> {

    return this.http
      .post<LoginResponse>(
        `${this.API_URL}/login`,
        credentials
      )
      .pipe(

        tap(response => {

          // Save JWT
          if (response.token) {
            localStorage.setItem(
              this.TOKEN_KEY,
              response.token
            );
          }

          // Save email
          if (response.email) {
            localStorage.setItem(
              'tms_email',
              response.email
            );
          }

          // Save username
          if (response.username) {
            localStorage.setItem(
              'tms_username',
              response.username
            );
          }

          // Save full name
          if (response.fullName) {
            localStorage.setItem(
              'tms_fullName',
              response.fullName
            );
          }

          // Save role
          if (response.role) {
            localStorage.setItem(
              'tms_role',
              response.role
            );
          }

        })

      );
  }

  // ================================
  // TOKEN
  // ================================

  getToken(): string | null {

    return localStorage.getItem(
      this.TOKEN_KEY
    );

  }

  // ================================
  // LOGIN STATUS
  // ================================

  isLoggedIn(): boolean {

    return !!this.getToken();

  }

  // ================================
  // ROLE
  // ================================

  getRole(): string | null {

    return localStorage.getItem(
      'tms_role'
    );

  }

  hasRole(role: string): boolean {

    const currentRole = this.getRole();

    if (!currentRole) {
      return false;
    }

    return currentRole.toLowerCase() ===
           role.toLowerCase();

  }

  // ================================
  // USER INFORMATION
  // ================================

  getEmail(): string | null {

    return localStorage.getItem(
      'tms_email'
    );

  }

  getUsername(): string | null {

    return localStorage.getItem(
      'tms_username'
    );

  }

  getFullName(): string | null {

    return localStorage.getItem(
      'tms_fullName'
    );

  }

  // ================================
  // LOGOUT
  // ================================

  logout(): void {

    localStorage.removeItem(
      this.TOKEN_KEY
    );

    localStorage.removeItem(
      'tms_email'
    );

    localStorage.removeItem(
      'tms_username'
    );

    localStorage.removeItem(
      'tms_fullName'
    );

    localStorage.removeItem(
      'tms_role'
    );

  }
}