import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { environment } from '../../env/env';
import { Observable } from 'rxjs';
import { Nomenclature, NomenclatureCategory } from '../../models/budget.model';


const httpOptions = {
  headers: new HttpHeaders({
    'Content-Type': 'application/json'
  })
};

@Injectable({
  providedIn: 'root'
})
export class NomenclatureService {

apiUrl: string = `${environment.urlBudget}nomenclatures`;

  constructor(
    private readonly http: HttpClient) {  
  }
  

  //Requests to the backend for the nomenclatures
  createNomenclature(nomenclature: Nomenclature): Observable<Nomenclature> {
    return this.http.post<Nomenclature>(this.apiUrl, nomenclature, httpOptions);
  }
  getNomenclature(nomenclatureId: number): Observable<Nomenclature> {
    return this.http.get<Nomenclature>(`${this.apiUrl}/${nomenclatureId}`);
  }
  getNomenclatures(): Observable<Nomenclature[]> {
    return this.http.get<Nomenclature[]>(this.apiUrl);
  }  

  updateNomenclature(nomenclature: Nomenclature): Observable<Nomenclature> {
      return this.http.put<Nomenclature>(this.apiUrl, nomenclature, httpOptions);
    }
  
  deleteNomenclatureById(id: number): Observable<string> {
    return this.http.delete<string>(`${this.apiUrl}/${id}`);
  }
  
  getNomenclatureId(nomenclatureId: number): Observable<Nomenclature> {
    return this.http.get<Nomenclature>(`${this.apiUrl}/${nomenclatureId}`);
  }

  getNomenclatureByCategoryId(categoryId: number): Observable<Nomenclature[]> {
    return this.http.get<Nomenclature[]>(`${this.apiUrl}/category/${categoryId}`);  
  }

  //categories
  createNomenclatureCategory(nomenclatureCategory: NomenclatureCategory): Observable<NomenclatureCategory> {
    return this.http.post<NomenclatureCategory>(`${this.apiUrl}/categories`, nomenclatureCategory, httpOptions);
  }
  getNomenclatureCategories(): Observable<NomenclatureCategory[]> {
    return this.http.get<NomenclatureCategory[]>(`${this.apiUrl}/categories`);
  }

  updateNomenclatureCategory(nomenclatureCategory: NomenclatureCategory): Observable<NomenclatureCategory> {
    return this.http.put<NomenclatureCategory>(`${this.apiUrl}/categories`, nomenclatureCategory, httpOptions);
  }

deleteNomenclatureCategoryById(id: number): Observable<string> {
  return this.http.delete<string>(`${this.apiUrl}/categories/${id}`);
}

getNomenclatureCategoryId(nomenclatureCategory: number): Observable<NomenclatureCategory> {
  return this.http.get<NomenclatureCategory>(`${this.apiUrl}/categories/${nomenclatureCategory}`);
}


}
