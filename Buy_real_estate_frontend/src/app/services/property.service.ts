import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';

export interface Property {
  _id: string;
  type: string;
  location: string;
  area: number;
  nearestLandmark: string;
  price: number;
  createdBy: string;
  createdAt: string;
}

export interface PropertyListResponse {
  success: boolean;
  count: number;
  total: number;
  page: number;
  totalPages: number;
  properties: Property[];
}

export interface PropertyResponse {
  success: boolean;
  message: string;
  property?: Property;
}

export interface CreatePropertyData {
  type: string;
  location: string;
  area: number;
  nearestLandmark: string;
  price: number;
}

@Injectable({
  providedIn: 'root'
})
export class PropertyService {
  private apiUrl = `${environment.apiUrl}/api/properties`;

  constructor(private http: HttpClient) {}

  getProperties(page: number = 1): Observable<PropertyListResponse> {
    return this.http.get<PropertyListResponse>(`${this.apiUrl}?page=${page}`, {
      withCredentials: true
    });
  }

  createProperty(data: CreatePropertyData): Observable<PropertyResponse> {
    return this.http.post<PropertyResponse>(this.apiUrl, data, {
      withCredentials: true
    });
  }

  updateProperty(id: string, data: CreatePropertyData): Observable<PropertyResponse> {
    return this.http.put<PropertyResponse>(`${this.apiUrl}/${id}`, data, {
      withCredentials: true
    });
  }

  deleteProperty(id: string): Observable<PropertyResponse> {
    return this.http.delete<PropertyResponse>(`${this.apiUrl}/${id}`, {
      withCredentials: true
    });
  }
}
