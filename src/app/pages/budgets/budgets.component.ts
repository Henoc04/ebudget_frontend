import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Budget } from '../../models/budget.model';
import { BudgetService } from '../../services/budget/budget.service';
import { CenterService } from '../../services/center.service';
import { Center } from '../../models/center.model';
import { Router } from '@angular/router';
import { CustomcurrencyPipe } from '../../shared/customcurrency.pipe';

@Component({
  selector: 'app-budgets',
  standalone: true,
  imports: [
    CommonModule, 
    ReactiveFormsModule,
    CustomcurrencyPipe
  ],
  templateUrl:  './budgets.component.html',
  styleUrl: './budgets.component.scss' 
})
export class BudgetsComponent implements OnInit {
  budgets: Budget[] = [];
  centers: Center[] = [];
  budgetForm: FormGroup;
  showAddBudgetForm = false;
  isSubmitting = false;
  editingBudget: Budget | null = null;

  constructor(
    private readonly budgetService: BudgetService,
    private readonly centerService: CenterService,
    private readonly fb: FormBuilder,
    private readonly router: Router
  ) {
    this.budgetForm = this.createForm();
  }

  ngOnInit(): void {
    this.loadBudgets();
    this.loadCenters();
  }

  private createForm(): FormGroup {
    return this.fb.group({
      centerId: [null, Validators.required],
      year: [new Date().getFullYear(), [Validators.required, Validators.min(2000)]],
      description: ['', Validators.required],
      remainingAmount: [{ value: null, disabled: true }]
    });
  }

  loadBudgets(): void {
    this.budgetService.getBudgetsWithCenters().subscribe(budgets => {
      this.budgets = budgets;
    });
  }

  loadCenters(): void {
    this.centerService.getCenters().subscribe(centers => {
      this.centers = centers;
    });
  }

  editBudget(budget: Budget): void {
    this.editingBudget = budget;
    this.showAddBudgetForm = false;
    this.budgetForm.patchValue({
      centerId: budget.centerId,
      year: budget.year,
      description: budget.description,
    });
  }

  cancelEdit(): void {
    this.editingBudget = null;
    this.showAddBudgetForm = false;
    this.budgetForm.reset({
      year: new Date().getFullYear()
    });
  }

  onSubmit(): void {
    if (this.budgetForm.invalid) {
      return;
    }

    this.isSubmitting = true;

    if (this.editingBudget) {
      
      this.editingBudget.year = this.budgetForm.value.year;
      this.editingBudget.description = this.budgetForm.value.description;
      this.editingBudget.centerId = this.budgetForm.value.centerId;

      this.budgetService.updateBudget(this.editingBudget)
        .subscribe({
          next: () => {
            this.isSubmitting = false;
            this.loadBudgets();
            this.cancelEdit();
          },
          error: () => {
            this.isSubmitting = false;
          }
        });
    } else {
      this.budgetService.createBudget(this.budgetForm.value)
        .subscribe({
          next: () => {
            this.isSubmitting = false;
            this.loadBudgets();
            this.showAddBudgetForm = false;
            this.budgetForm.reset();
          },
          error: () => {
            this.isSubmitting = false;
          }
        });
    }
  }

  deleteBudget(id: number): void {
    if (confirm('Are you sure you want to delete this budget? This action cannot be undone.')) {
      this.budgetService.deleteBudget(id).subscribe(success => {
        if (success) {
          this.loadBudgets();
        }
      });
    }
  }

  viewBudgetDetails(id: number): void {
    this.router.navigate(['/budgets', id]);
  }

  getBudgetCost(budget: Budget): number {
    return budget.activities?.reduce((activityTotal: number, activity) => {
      const subTotal = activity.subActivities?.reduce(
        (total: number, subAct: any) =>
          total + ((subAct.frequency ?? 0) * (subAct.quantity ?? 0) * (subAct.unitCost ?? 0)),
        0
      ) ?? 0;
      return activityTotal + subTotal;
    }, 0) ?? 0;
  }
}