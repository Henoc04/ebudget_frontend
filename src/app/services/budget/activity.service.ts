import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { environment } from '../../env/env';
import { Observable } from 'rxjs';
import { Activity, SubActivity } from '../../models/budget.model';

const httpOptions = {
  headers: new HttpHeaders({
    'Content-Type': 'application/json'
  })
};

@Injectable({
  providedIn: 'root'
})
export class ActivityService {

  apiUrl: string = `${environment.urlBudget}activities`;

  constructor(
    private readonly http: HttpClient) {  
  }
    
    addBudgetActivity( activity: Activity): Observable<Activity> {
      return this.http.post<Activity>(this.apiUrl, activity, httpOptions);
    }
    updateBudgetActivity(activity: Activity): Observable<Activity> {
      return this.http.put<Activity>(this.apiUrl, activity, httpOptions);
    }
    deleteBudgetActivity(activityId: number): Observable<string> {
      return this.http.delete<string>(`${this.apiUrl}/${activityId}`);
    }
    
    getSubActivitiesByActivityId(activityId: number): Observable<SubActivity[]> {
      return this.http.get<SubActivity[]>(`${this.apiUrl}/${activityId}/subactivities`);
    }
    
}
