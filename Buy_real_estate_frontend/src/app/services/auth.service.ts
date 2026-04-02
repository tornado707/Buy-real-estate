import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';

interface AuthResponse {
  success: boolean;
  message: string;
  user?: {
    id: string;
    username: string;
    email: string;
    role: string;
  };
}

interface LoginData {
  email: string;
  password: string;
}

interface RegisterData {
  username: string;
  email: string;
  password: string;
}

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private apiUrl = `${environment.apiUrl}/api/auth`;

  constructor(private http: HttpClient) {}

  signin(data: LoginData): Observable<AuthResponse> {
    return this.http.post<AuthResponse>(`${this.apiUrl}/signin`, data, {
      withCredentials: true  // Important for cookies
    });
  }

  register(data: RegisterData): Observable<AuthResponse> {
    return this.http.post<AuthResponse>(`${this.apiUrl}/register`, data, {
      withCredentials: true
    });
  }

  signout(): Observable<AuthResponse> {
    return this.http.post<AuthResponse>(`${this.apiUrl}/signout`, {}, {
      withCredentials: true
    });
  }

  getMe(): Observable<AuthResponse> {
    return this.http.get<AuthResponse>(`${this.apiUrl}/me`, {
      withCredentials: true
    });
  }
}