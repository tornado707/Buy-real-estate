import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';
import { Property } from './property.service';

export interface Favorite {
  _id: string;
  propertyId: Property;
  userId: string;
}

export interface FavoriteListResponse {
  success: boolean;
  count: number;
  total: number;
  page: number;
  totalPages: number;
  favorites: Favorite[];
}

export interface FavoriteResponse {
  success: boolean;
  message: string;
}

@Injectable({
  providedIn: 'root'
})
export class FavoriteService {
  private apiUrl = `${environment.apiUrl}/api/favorites`;

  constructor(private http: HttpClient) {}

  getFavorites(page: number = 1): Observable<FavoriteListResponse> {
    return this.http.get<FavoriteListResponse>(`${this.apiUrl}?page=${page}`, {
      withCredentials: true
    });
  }

  addFavorite(propertyId: string): Observable<FavoriteResponse> {
    return this.http.post<FavoriteResponse>(`${this.apiUrl}/${propertyId}`, {}, {
      withCredentials: true
    });
  }

  removeFavorite(propertyId: string): Observable<FavoriteResponse> {
    return this.http.delete<FavoriteResponse>(`${this.apiUrl}/${propertyId}`, {
      withCredentials: true
    });
  }
}
