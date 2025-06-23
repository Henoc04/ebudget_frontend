import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { ReactiveFormsModule, FormsModule, FormGroup, FormBuilder, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { SubactivityService } from '../../services/budget/subactivity.service';
import { Budget, BudgetFunding, Financing, NomenclatureBalanceByBudget, Recipe, RecipeAndBudgetFunding } from '../../models/budget.model';
import { Center } from '../../models/center.model';
import { CenterService } from '../../services/center.service';
import { BudgetService } from '../../services/budget/budget.service';
import { RecipeService } from '../../services/budget/recipe.service';
import { FinancingService } from '../../services/budget/financing.service';
import { BudgetFundingService } from '../../services/budget/budget-funding.service';
import { CustomcurrencyPipe } from '../../shared/customcurrency.pipe';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-forecast-statement',
  imports: [
    CommonModule, 
    ReactiveFormsModule, 
    FormsModule,
    CustomcurrencyPipe // Uncomment if you want to use the custom currency pipe
  ],
  templateUrl: './forecast-statement.component.html',
  styleUrl: './forecast-statement.component.scss'
})
export class ForecastStatementComponent {

  nomenclatureBalances: NomenclatureBalanceByBudget[] = [];
  financings: Financing[] = [];
  budgetFundings: BudgetFunding[] = [];
  totalBalance: number = 0;
  budgetId: number = 0;
  center: Center | undefined;
  budget: Budget | undefined;
  recipes: Map<string, RecipeAndBudgetFunding[]> = new Map<string, RecipeAndBudgetFunding[]>();
  recipeBankAccounts = new Map<string, number>();
  recipeFinancing: Financing | undefined;
  recipeTotals: Map<string, number> = new Map<string, number>(); // Map pour stocker les totaux
  recipeTotalGlobal: number = 0; // Total global des recettes
  bankAccount: number = 0;
  newRecipe: Recipe | undefined;
  selectedBudgetFundingId: number = 0;
  selectedBudgetFundingKey: string | null = null;
  financingId: number = 0;
  recipeForm: FormGroup;
  budgetFundingForm: FormGroup;
  showAddBudgetFundingForm = false;
  showAddForm = false;
  isSubmitting = false;
  isEditMode = false;
  editingRecipe: Recipe | undefined;
  source: string | undefined;
  recipeBanckAcountTotal: number = 0;
  
  constructor(
    private readonly route: ActivatedRoute,
    public readonly router: Router,
    private readonly subActivityService: SubactivityService,
    private readonly centerService: CenterService,
    private readonly budgetService: BudgetService,
    private readonly recipeService: RecipeService,
    private readonly financingService: FinancingService,
    private readonly budgetFundingService: BudgetFundingService,
    private readonly fb: FormBuilder
  ) {
    this.recipeForm = this.createRecipeForm();
    this.budgetFundingForm = this.createBudgetFundingForm();
  }

  ngOnInit(): void {
    const budgetId = Number(this.route.snapshot.paramMap.get('id'));

    this.budgetId = budgetId;

    this.budgetService.getBudget(budgetId).subscribe(budget => {
      this.budget = budget; 
      this.centerService.getCenter(this.budget.centerId).subscribe(center => {
        this.center = center;
      });
    });
    
    this.financingService.getFinancings().subscribe(financings => {
      this.financings = financings;
    });

    this.loadFinancings();
    this.loadExpenses();
    this.loadRecipesByBudget();
  }

  private createRecipeForm(): FormGroup {
    return this.fb.group({
      name: ['', Validators.required],
      amount: [0, Validators.required],
      budgetFundingId: [this.financingId, Validators.required]
    });
  }

  private createBudgetFundingForm(): FormGroup {
    return this.fb.group({
      amount: [0, Validators.required],
      financingId: [0, Validators.required],
      budgetId: [Number(this.route.snapshot.paramMap.get('id')), Validators.required],
    });
  }

  loadExpenses(): void {
    this.subActivityService.getNomenclatureBalanceByBudget(this.budgetId ).subscribe(nomenclatureBalances => {
      
      //adding by code of nomenclature
      
      if (this.source){
        nomenclatureBalances = nomenclatureBalances.filter(n => n.financing === this.source);
      }
      const groupedMap = new Map<number, NomenclatureBalanceByBudget>();
      nomenclatureBalances.forEach(item => {
        if (!groupedMap.has(item.code)) {
          groupedMap.set(item.code, { ...item });
        } else {
          const existing = groupedMap.get(item.code)!;
          existing.total += item.total;
        }
      });
      this.nomenclatureBalances = Array.from(groupedMap.values());

      this.totalBalance = nomenclatureBalances.reduce((acc, item) => acc + item.total, 0);
    });
  }

  toggleAddForm(financingKey: string): void {
    this.selectedBudgetFundingKey = financingKey;
    this.showAddForm = !this.selectedBudgetFundingKey;

    const selectedFinancing = this.financings.find(financing => financing.name === financingKey);
      if (selectedFinancing) {
        this.budgetFundingService.getBudgetFundingByBudgetIdAnFinancingId(this.budgetId, selectedFinancing.id).subscribe(budgetFunding => {
          this.selectedBudgetFundingId = budgetFunding.id;
            this.recipeForm.patchValue({
            budgetFundingId: this.selectedBudgetFundingId
          });
        });
      }

    this.isEditMode = false;
  }

  toggleAddBudgetFundingForm(): void {
    this.showAddBudgetFundingForm = !this.showAddBudgetFundingForm;
  }

  viewBudgetDetails(): void {
    this.router.navigate(['/budgets', this.budgetId]);
  }

  loadFinancings(): void {
    this.budgetFundingService.getBudgetFundingByBudgetId(this.budgetId).subscribe(budgetFundings => {

      budgetFundings.forEach(budgetFunding => {
        const financing = budgetFunding.financing;
        if (financing && !this.recipes.has(financing.name)) {
          this.recipes.set(financing.name, []);
          this.recipeBankAccounts.set(financing.name, budgetFunding.amount);
          this.recipeTotals.set(financing.name, budgetFunding.amount);
        }
      }); 

      this.recipeBanckAcountTotal = Array.from(this.recipeBankAccounts.values()).reduce((sum, value) => sum + value, 0);
      //filter by source 
      if(this.source){
        this.recipes = new Map(Array.from(this.recipes).filter(([key, value]) => key === this.source ));
        this.recipeBankAccounts = new Map(Array.from(this.recipeBankAccounts).filter(([key, value]) => key === this.source ));
        this.recipeTotals = new Map(Array.from(this.recipeTotals).filter(([key, value]) => key === this.source ));
      }
      this.recipeTotalGlobal = Array.from(this.recipeTotals.values()).reduce((sum, value) => sum + value, 0);
    });
  }

  loadRecipesByBudget(): void {
  this.recipes = new Map<string, RecipeAndBudgetFunding[]>();
  this.recipeTotals = new Map<string, number>(); 
  this.recipeBankAccounts = new Map<string, number>();

  this.recipeService.getRecipesByBudgetId(this.budgetId).subscribe(recipes => {
    
    if (this.source) {
      recipes = recipes.filter(r => r.financing === this.source);
    }

    recipes.forEach(recipe => {
      const financingName = recipe.financing;

      // Initialisation de la liste de recettes
      if (!this.recipes.has(financingName)) {
        this.recipes.set(financingName, []);
      }

      // Stocker bank_account une seule fois par financingName
      if (!this.recipeBankAccounts.has(financingName)) {
        this.recipeBankAccounts.set(financingName, recipe.bank_account);
      }

      // Ajouter la recette
      this.recipes.get(financingName)?.push(recipe);

      // Calcul du total
      const currentTotal = this.recipeTotals.get(financingName) || 0;
      const recipeAmount = recipe.recipe_status === 'VALIDATED' ? 0 : recipe.recipe_amount;
      
      // Ajouter seulement le montant de la recette (le bank_account est géré une seule fois)
      this.recipeTotals.set(financingName, currentTotal + recipeAmount);
    });

    // Ajouter bank_account une seule fois à la fin pour chaque financement
    this.recipeBankAccounts.forEach((bankAccount, financingName) => {
      const totalWithoutBank = this.recipeTotals.get(financingName) || 0;
      this.recipeTotals.set(financingName, totalWithoutBank + bankAccount);
    });
  });
}
      

  loadBudgetFundingByBudget(): void {
    this.budgetFundingService.getBudgetFundingByBudgetId(this.budgetId).subscribe(budgetFundings => {
      this.budgetFundings = budgetFundings;
    });
  }

  onEditRecipe(recipe: RecipeAndBudgetFunding) {
    this.selectedBudgetFundingKey = recipe.financing;
    this.recipeService.getRecipe(recipe.recipeId).subscribe(recipe => {
      this.editingRecipe = recipe;
      
      this.recipeForm.patchValue({
        name: this.editingRecipe?.name,
        amount: this.editingRecipe?.amount,
        budgetFunding: this.editingRecipe?.budgetFundingId
      });
        this.showAddForm = true;
        this.isEditMode = true;
    });
  }

  confirmRecipe(recipe: RecipeAndBudgetFunding) {
    Swal.fire({
          title: 'Confirm recipe',
          text: 'Are you sure you want to confirm this recipe ? This action cannot be undone.',
          icon: 'warning',
          showCancelButton: true,
          confirmButtonColor: '#d33',
          cancelButtonColor: '#3085d6',
          confirmButtonText: 'Yes, confirm it !',
          reverseButtons: true,
        }).then((result) => {
          if (result.isConfirmed) {
            this.recipeService.confirmRecipe(recipe.recipeId).subscribe( success => {
              if (success) {
                this.loadRecipesByBudget();
                this.loadBudgetFundingByBudget();
                this.loadFinancings();
                this.loadExpenses();

                Swal.fire({
                  title: 'Confirm !',
                  text: 'The Recipe has been validated.',
                  icon: 'success',
                  timer: 1500,
                  showConfirmButton: false
                }).then(() => {
                  location.reload(); // recharge la page après confirmation
                });
              } else {
                Swal.fire('Error', 'Failed to confirm the recipe.', 'error');
              }
            });
          }
        });
  }

  cancelEdit() {
    this.selectedBudgetFundingKey =  null ;
    this.showAddForm = false;
    this.showAddBudgetFundingForm = false;
    this.isEditMode = false;
  }

  onSubmitRecipe() {

    if (this.recipeForm.invalid || !this.budget) {
      return;
    }
    this.isSubmitting = true;
    const formValues = this.recipeForm.value;
    if (this.isEditMode) {
      const updatedRecipe = {
        ...this.editingRecipe,
        ...formValues
      };

      this.recipeService.updateRecipe(updatedRecipe).subscribe({
        next: () => {
          this.loadRecipesByBudget();
          this.loadBudgetFundingByBudget();
          this.loadFinancings();
          this.cancelEdit();
          this.isSubmitting = false;
        },
        error: () => {
          this.isSubmitting = false;
        }
      });
    } else {
      this.recipeService.createRecipe(formValues).subscribe({
        
        next: () => {
          this.loadRecipesByBudget();
          this.loadBudgetFundingByBudget();
          this.loadFinancings();
          this.cancelEdit();
          this.isSubmitting = false;
        },
        error: () => {
          this.isSubmitting = false;
        }
      });
    }
  }

  onSubmitBudgetFunding() {
    if (this.budgetFundingForm.invalid || !this.budget || (this.recipeBanckAcountTotal + this.budgetFundingForm.get('amount')?.value > this.center?.amount!)) {
      return;
    }
    this.isSubmitting = true;
    const formValues = this.budgetFundingForm.value;

    this.budgetFundingService.createBudgetFunding(formValues).subscribe({
      next: () => {
        this.loadFinancings();
        this.toggleAddBudgetFundingForm();
        this.isSubmitting = false;
      },
      error: () => {
        this.isSubmitting = false;
      }
    });
  }
  
}
