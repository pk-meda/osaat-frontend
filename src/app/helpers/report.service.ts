import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class ReportService {
  private apiUrl = `${environment.baseApiUrl}reports/spec-order-sheet/`;

  constructor(private http: HttpClient) {}

  // Add this method to fetch the list of schools
  getSchools(): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}/schools/`);
  }

  downloadSpecOrderSheet(school?: string): Observable<Blob> {
    let params = new HttpParams();
    if (school) {
      params = params.set('school', school);
    }

    // Direct retrieval of the token string
    const token = localStorage.getItem('token') || localStorage.getItem('currentUser');

    let headers = new HttpHeaders();

    if (token) {
      // NOTE: Django REST Framework default TokenAuth uses "Token", not "Bearer"
      headers = headers.set('Authorization', `Token ${token}`);
    } else {
      console.warn('ReportService: No auth token found in localStorage!');
    }

    return this.http.get(this.apiUrl, {
      headers: headers,
      responseType: 'blob',
      params: params
    });
  }
}