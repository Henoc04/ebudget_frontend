import { Injectable } from '@angular/core';
import { Observable, of } from 'rxjs';
import { Activity, Budget} from '../../models/budget.model';
import { CenterService } from '../center.service';
import { map, switchMap } from 'rxjs/operators';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { environment } from '../../env/env';


const httpOptions = {
  headers: new HttpHeaders({
    'Content-Type': 'application/json'
  })
};

@Injectable({
  providedIn: 'root'
})
export class BudgetService {

  apiUrl: string = `${environment.urlBudget}budgets`;
  
  constructor(
    private readonly centerService: CenterService,
    private readonly http: HttpClient
  ) {}


  //Requests to the backend for the budget
  createBudget(budget: Budget): Observable<Budget> {
    return this.http.post<Budget>(this.apiUrl, budget, httpOptions);
  }

  getBudgets(): Observable<Budget[]> {
    return this.http.get<Budget[]>(this.apiUrl);
  }

  getBudget(id: number): Observable<Budget> {
    return this.http.get<Budget>(`${this.apiUrl}/${id}`);
  }

  updateBudget(budget: Budget): Observable<Budget> {
    return this.http.put<Budget>(this.apiUrl, budget, httpOptions);
  }

  deleteBudget(id: number): Observable<string> {
    return this.http.delete<string>(`${this.apiUrl}/${id}`);
  }

  getBudgetsByYear(year: number): Observable<Budget[]> {
    return this.http.get<Budget[]>(`${this.apiUrl}/year/${year}`);
  }

  getBudgetsByCenterId(centerId: number): Observable<Budget[]> {
    return this.http.get<Budget[]>(`${this.apiUrl}/center/${centerId}`);
  }

  getActivitiesByBudgetId(budgetId: number): Observable<Activity[]> {
    return this.http.get<Activity[]>(`${this.apiUrl}/${budgetId}/activities`);
  }

  
  //partie a traiter

  getBudgetsWithCenters(): Observable<Budget[]> {
    return this.getBudgets().pipe(
      switchMap(budgets => {
        return this.centerService.getCenters().pipe(
          map(centers => {
            return budgets.map(budget => {
              const center = centers.find(c => c.id === budget.centerId);
              return { ...budget, center };
            });
          })
        );
      })
    );
  }

  getBudgetWithCenter(id: number): Observable<Budget | undefined> {
    return this.getBudget(id).pipe(
      switchMap(budget => {
        if (!budget) return of(undefined);
        
        return this.centerService.getCenter(budget.centerId).pipe(
          map(center => {
            return { ...budget, center };
          })
        );
      })
    );
  }
}