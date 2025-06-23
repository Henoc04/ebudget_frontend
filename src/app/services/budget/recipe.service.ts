import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { environment } from '../../env/env';
import { Recipe, RecipeAndBudgetFunding } from '../../models/budget.model';
import { Observable } from 'rxjs';


const httpOptions = {
  headers: new HttpHeaders({
    'Content-Type': 'application/json'
  })
};

@Injectable({
  providedIn: 'root'
})
export class RecipeService {
apiUrl: string = `${environment.urlBudget}recipes`;

  constructor(
    private readonly http: HttpClient) {  
  }

  createRecipe(recipe: Recipe): Observable<Recipe> {
      return this.http.post<Recipe>(this.apiUrl, recipe, httpOptions);
    }
  
  getRecipes(): Observable<Recipe[]> {
    return this.http.get<Recipe[]>(this.apiUrl);
  }

  getRecipe(recipeId: number): Observable<Recipe> {
    return this.http.get<Recipe>(`${this.apiUrl}/${recipeId}`);
  }

  getRecipesByBudgetId(budgetId: number): Observable<RecipeAndBudgetFunding[]> {
    return this.http.get<RecipeAndBudgetFunding[]>(`${this.apiUrl}/budget/${budgetId}`);
  }

  updateRecipe(recipe: Recipe): Observable<Recipe> {
    return this.http.put<Recipe>(this.apiUrl, recipe, httpOptions);
  }

  confirmRecipe(recipeId: number) : Observable<Recipe> {
    return this.http.put<Recipe>(`${this.apiUrl}/confirm`, recipeId, httpOptions);
  }
    


}
