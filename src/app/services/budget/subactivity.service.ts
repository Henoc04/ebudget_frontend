import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../env/env';
import { BalanceSubActivity, NomenclatureBalanceByBudget, SubActivity } from '../../models/budget.model';

const httpOptions = {
  headers: new HttpHeaders({
    'Content-Type': 'application/json'
  })
};

@Injectable({
  providedIn: 'root'
})
export class SubactivityService {
  
apiUrl: string = `${environment.urlBudget}subactivities`;


  constructor(
    private readonly http: HttpClient) {  
  }

    //Requests to the backend for the subactivities  
    addActivitySubActivity( subActivity: SubActivity): Observable<SubActivity> {
      return this.http.post<SubActivity>(this.apiUrl, subActivity, httpOptions);
    }
  
    updateSubActivity(subActivity: SubActivity): Observable<SubActivity> {
      return this.http.put<SubActivity>(this.apiUrl, subActivity, httpOptions);
    }
    deleteSubActivity(subActivityId: number): Observable<string> {
      return this.http.delete<string>(`${this.apiUrl}/${subActivityId}`);
    }

    getBalanceSubActivityByBudget(budgetId: number): Observable<BalanceSubActivity[]> {
      return this.http.get<BalanceSubActivity[]>(`${this.apiUrl}/${budgetId}/balance`);
    }

    getNomenclatureBalanceByBudget(budgetId: number): Observable<NomenclatureBalanceByBudget[]> {
      return this.http.get<NomenclatureBalanceByBudget[]>(`${this.apiUrl}/${budgetId}/nomenclature/balance`);
    }
    
}
