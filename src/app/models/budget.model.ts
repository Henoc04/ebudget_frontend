import { Center } from './center.model';

export interface Budget {
  id: number;
  year: number;
  description?: string;
  centerId: number;
  activities?: Activity[];
  createdAt: Date;
  updatedAt: Date;
  
  // a supprimer
  center?: Center;
  initialAmount: number;
  remainingAmount: number;
}

export interface Activity {
  id: number;
  name: string;
  budgetId: number;
  subActivities?: SubActivity[];
  startDate: Date;
  endDate?: Date;
  createdAt: Date;
  updatedAt: Date;

  // a supprimer
  description?: string; 
  plannedAmount: number;
  actualAmount: number;
  status: string;
  
}

export interface SubActivity {
  id: number;
  name: string;
  quantity: number;
  frequency: number;
  unitCost: number;  
  activityId: number;
  nomenclature?: Nomenclature;
  financing?: Financing;
  createdAt: Date;
  updatedAt: Date;

  // a supprimer
  nomenclatureId: number; 
  financingId: number;
}

export interface Nomenclature {
  id: number;
  code: number;
  name: string;
  description: string;
  categoryId: number;
  NomenclatureCategory?: NomenclatureCategory;
  
}

export interface NomenclatureCategory {
  id: number;
  name: string;

  // a supprimer
  nomenclatures?: Nomenclature[]; 
}

export interface Financing {
  id: number;
  name: string;
  description: string;
}

export interface BalanceSubActivity {
  financing: string;
  total: number;
}

export interface NomenclatureBalanceByBudget {
  code: number;
  libele: string;
  financing: string;
  total: number;
}

export interface Recipe {
  id: number;
  name: string;
  amount: number;
  status: string; 
  budgetFundingId: number;
} 

export interface BudgetFunding {
  id: number;
  amount: number;
  financing: Financing;
  budget: Budget;
}

export interface RecipeAndBudgetFunding {
  recipeId: number;
  financing: string;
  recipe_name: string;
  recipe_amount: number;
  recipe_status: string;
  bank_account: number;
}



