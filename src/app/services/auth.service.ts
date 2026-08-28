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
  role: string;
}

@Injectable({
  providedIn: 'root'
})
export class AuthService {

  private http = inject(HttpClient);

  // ⚠️ CHANGE 7183 TO YOUR ACTUAL .NET API PORT
  private apiUrl = 'http://localhost:5178/api/auth';

  private readonly TOKEN_KEY = 'token';
  private readonly ROLE_KEY = 'role';

  login(
    credentials: LoginRequest
  ): Observable<LoginResponse> {

    return this.http
      .post<LoginResponse>(
        `${this.apiUrl}/login`,
        credentials
      )
      .pipe(

        tap(response => {

          console.log('LOGIN RESPONSE:', response);

          if (response.token) {

            localStorage.setItem(
              this.TOKEN_KEY,
              response.token
            );

            console.log(
              'JWT SAVED:',
              true
            );
          }

          if (response.role) {

            localStorage.setItem(
              this.ROLE_KEY,
              response.role
            );

            console.log(
              'ROLE SAVED:',
              response.role
            );
          }

        })

      );
  }

  getToken(): string | null {

    return localStorage.getItem(
      this.TOKEN_KEY
    );
  }

  getRole(): string | null {

    return localStorage.getItem(
      this.ROLE_KEY
    );
  }

  isLoggedIn(): boolean {

    return !!this.getToken();
  }

  hasRole(role: string): boolean {

    const currentRole =
      this.getRole();

    return (
      currentRole?.toLowerCase() ===
      role.toLowerCase()
    );
  }

  logout(): void {

    localStorage.removeItem(
      this.TOKEN_KEY
    );

    localStorage.removeItem(
      this.ROLE_KEY
    );
  }
}