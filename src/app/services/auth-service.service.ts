import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError, tap } from 'rxjs/operators';
import { UserDTO } from '../interfaces/user';

@Injectable({
  providedIn: 'root'
})
export class AuthServiceService {
  private apiUrl = 'http://localhost:5266/api/Auth';

  constructor(private http: HttpClient) {}

  private handleError(error: any) {
    console.error('Auth error:', error);
    let errorMsg = error.error?.error || error.message || 'An unexpected error occurred';
    if (error.status === 0) {
      errorMsg = 'Network error: Could not connect to server';
    }
    return throwError(() => new Error(errorMsg));
  }

  signup(formData: FormData): Observable<any> {
    return this.http.post(`${this.apiUrl}/signup`, formData).pipe(
      tap((response: any) => {
        if (response.token) {
          localStorage.setItem('token', response.token);
        }
      }),
      catchError(this.handleError)
    );
  }

  login(username: string, password: string): Observable<any> {
    const formData = new FormData();
    formData.append('username', username);
    formData.append('password', password);
    return this.http.post(`${this.apiUrl}/login`, formData).pipe(
      tap((response: any) => {
        if (response.token) {
          localStorage.setItem('token', response.token);
        }
      }),
      catchError(this.handleError)
    );
  }

  getToken(): string | null {
    return localStorage.getItem('token');
  }

  getCurrentUserId(): string | null {
    const token = this.getToken();
    if (token) {
      const payload = JSON.parse(atob(token.split('.')[1]));
      return payload.nameid;
    }
    return null;
  }

  logout(): void {
    localStorage.removeItem('token');
  }
}