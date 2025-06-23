import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { environment } from '../../env/env';
import { Observable } from 'rxjs';
import { Financing } from '../../models/budget.model';


const httpOptions = {
  headers: new HttpHeaders({
    'Content-Type': 'application/json'
  })
};

@Injectable({
  providedIn: 'root'
})
export class FinancingService {

apiUrl: string = `${environment.urlBudget}financing`;

  constructor(
    private readonly http: HttpClient) {  
  }

  //Requests to the backend for the financings

  getFinancing(financingId: number): Observable<Financing> {
    return this.http.get<Financing>(`${this.apiUrl}/${financingId}`);
  }

  getFinancings(): Observable<Financing[]> {
    return this.http.get<Financing[]>(this.apiUrl);
  }

  createFinancing(financing: Financing): Observable<Financing> {
    return this.http.post<Financing>(this.apiUrl, financing, httpOptions);
  }

  updateFinancing(financing: Financing): Observable<Financing> {
    return this.http.put<Financing>(this.apiUrl, financing, httpOptions);
  }

  deleteFinancing(financingId: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${financingId}`, httpOptions);
  }

  
}
