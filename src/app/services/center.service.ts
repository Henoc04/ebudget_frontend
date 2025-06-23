import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { Center } from '../models/center.model';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { environment } from '../env/env';

const httpOptions = {
  headers: new HttpHeaders({
    'Content-Type': 'application/json'
  })
};

@Injectable({
  providedIn: 'root'
})
export class CenterService {

  apiUrl: string = `${environment.urlCenter}`;

  constructor(private readonly http: HttpClient) {}

  getCenters(): Observable<Center[]> {
    return this.http.get<Center[]>(this.apiUrl);
  }

  getCenter(id: number): Observable<Center> {
    return this.http.get<Center>(`${this.apiUrl}/${id}`);
  }

  createCenter(center: Center): Observable<Center> {
    return this.http.post<Center>(this.apiUrl, center, httpOptions);
  }

  updateCenter(center:Center): Observable<Center> {
    return this.http.put<Center>(this.apiUrl, center, httpOptions);
  }

  deleteCenter(id: number): Observable<string> {
    return this.http.delete<string>(`${this.apiUrl}/${id}`);
  }

}