import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { environment } from '../../env/env';
import { BudgetFunding } from '../../models/budget.model';
import { Observable } from 'rxjs/internal/Observable';


const httpOptions = {
  headers: new HttpHeaders({
    'Content-Type': 'application/json'
  })
};


@Injectable({
  providedIn: 'root'
})
export class BudgetFundingService {

  
  apiUrl: string = `${environment.urlBudget}budgetfundings`;
  
  constructor(
    private readonly http: HttpClient
  ) {}

  createBudgetFunding(budgetFunding: BudgetFunding): Observable<BudgetFunding> {
    return this.http.post<BudgetFunding>(this.apiUrl, budgetFunding, httpOptions);
  }

  getBudgetFundings(): Observable<BudgetFunding[]> {
    return this.http.get<BudgetFunding[]>(this.apiUrl);
  }

  getBudgetFundingByBudgetId(budgetId: number): Observable<BudgetFunding[]> {
    return this.http.get<BudgetFunding[]>(`${this.apiUrl}/budget/${budgetId}`);
  }

  getBudgetFundingByBudgetIdAnFinancingId(budgetId: number, financingId: number): Observable<BudgetFunding> {
    return this.http.get<BudgetFunding>(`${this.apiUrl}/budgetfinancing/${budgetId}/${financingId}`);
  }


}
