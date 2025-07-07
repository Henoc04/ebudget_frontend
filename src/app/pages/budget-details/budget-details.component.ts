import { Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormControl, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { Budget, Activity, SubActivity, Nomenclature, Financing, BalanceSubActivity, NomenclatureBalanceByBudget } from '../../models/budget.model';
import { BudgetService } from '../../services/budget/budget.service';
import { Center } from '../../models/center.model';
import { CenterService } from '../../services/center.service';
import { ActivityService } from '../../services/budget/activity.service';
import { SubactivityService } from '../../services/budget/subactivity.service';
import { NomenclatureService } from '../../services/budget/nomenclature.service';
import { FinancingService } from '../../services/budget/financing.service';
import { NgxPaginationModule } from 'ngx-pagination';
import { NgSelectModule } from '@ng-select/ng-select';
import Swal from 'sweetalert2';
import { MultiFieldFilterPipe } from '../../shared/multi-field-filter.pipe';
import { FilterByCodePipe } from '../../shared/filter-by-code.pipe';
import { MatAutocompleteModule } from '@angular/material/autocomplete';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatOptionModule } from '@angular/material/core';
import { CustomcurrencyPipe } from '../../shared/customcurrency.pipe';

@Component({
  selector: 'app-budget-details',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,  
    FormsModule,
    NgxPaginationModule,
    NgSelectModule,
    MultiFieldFilterPipe,
    FilterByCodePipe,
    MatFormFieldModule,
    MatInputModule,
    MatAutocompleteModule,
    MatOptionModule,
    CustomcurrencyPipe
  ],
  templateUrl: './budget-details.component.html',
  styleUrl: './budget-details.component.scss'
})
export class BudgetDetailsComponent implements OnInit {
  budgetId?: number;
  budget: Budget | undefined;
  center: Center | undefined;
  activityForm: FormGroup;
  showAddForm = false;
  isSubmitting = false;
  isAdding = false;
  editingActivity: Activity | null = null;
  editingSubActivity: SubActivity | null = null;
  nomenclatures: Nomenclature[] = [];
  financings: Financing[] = [];
  selectedActivity: Activity | undefined;
  selectedSubActivity?: SubActivity;
  newSubActivity: SubActivity = this.createEmptySubActivity();
  nomenclatureBalances: NomenclatureBalanceByBudget[] = [];
  balanceSubActivities: BalanceSubActivity[] = [];

  searchTerm: string = "";
  searchNomenclatureCode: string = "";
  balanceForSearch: Map<string, number> = new Map();
  totalBalance: number = 0;
  page: number = 1;
  nomenclatureCtrl = new FormControl();
  @ViewChild('formRef') formElement!: ElementRef;

dropdownOpen: boolean = false;
selectedFilterLabel: string = 'All financings';


  constructor(
    private readonly route: ActivatedRoute,
    public readonly router: Router,
    private readonly budgetService: BudgetService,
    private readonly centerService: CenterService,
    private readonly activityService: ActivityService,
    private readonly subActivityService: SubactivityService,
    private readonly nomenclatureService: NomenclatureService,
    private readonly financingService: FinancingService,
    private readonly fb: FormBuilder
  ) {
    this.activityForm = this.createForm();
  }

  ngOnInit(): void {
    this.budgetId = Number(this.route.snapshot.paramMap.get('id'));
    if (this.budgetId) {
      this.loadBudget(this.budgetId);
      this.subActivityService.getBalanceSubActivityByBudget(this.budgetId).subscribe(balanceSubActivities => {
        this.balanceSubActivities = balanceSubActivities;
        this.totalBalance = this.balanceSubActivities.reduce((acc, item) => acc + item.total, 0);
      });

      // pour filtrer les valeurs par code rechercher voir si je peux le faire dans le pippe mutifilter
      this.subActivityService.getNomenclatureBalanceByBudget(this.budgetId ).subscribe(nomenclatureBalances => {
        this.nomenclatureBalances = nomenclatureBalances.filter(n => n.code === Number(this.searchTerm));
      });
    }

    this.loadNomenclatures();
    this.loadFinancings();
    this.searchBalanceSubActivities();
    
  }

  private createForm(): FormGroup {
    return this.fb.group({
      name: ['', Validators.required],
      budgetId: [Number(this.route.snapshot.paramMap.get('id')), Validators.required],
    });
  }

  private createEmptySubActivity(): SubActivity {
    return {
      id: 0,
      name: '',
      quantity: 1,
      frequency: 1,
      unitCost: 0,
      nomenclatureId: 0,
      financingId: 0,
      activityId: 0,
      nomenclature: {
        id: 0,
        code: 0,
        name: '',
        categoryId: 0,
        description: ''
      },
      financing: {
        id: 0,
        name: '',
        description: ''
      },
      createdAt: new Date(),
      updatedAt: new Date()
    };
  }

  //a ameliorer pour supprimer la requete pour le bilan
  searchBalanceSubActivities() {
    this.balanceForSearch.clear();
    this.balanceSubActivities = [];
    this.totalBalance = 0; // Réinitialiser le total une seule fois, avant la boucle

    const searchTerm = this.searchTerm?.trim().toLowerCase(); // Nettoyage
    const financingFilter = this.selectedFilterLabel;
    const hasSearchTerm = !!searchTerm;
    const hasFinancingFilter = this.selectedFilterLabel !== "All financings";

    this.budget?.activities?.forEach(activity => {
      activity.subActivities?.forEach(subActivity => {
        const code = subActivity.nomenclature?.code?.toString().toLowerCase();
        const financingName = subActivity.financing?.name;
        
        if (!financingName) return; // Évite les erreurs si financement absent

        // Condition de filtre corrigée : 
        // Si on a un terme de recherche et que le code ne le contient pas,
        // OU si on a un filtre financement actif et que le financement ne correspond pas,
        // on passe au subActivity suivant
        if (
          (hasSearchTerm && !code?.includes(searchTerm)) ||
          (hasFinancingFilter && !financingName.includes(financingFilter))
        ) {
          return;
        }

        const subtotal = subActivity.quantity * subActivity.unitCost * subActivity.frequency;
        const currentTotal = this.balanceForSearch.get(financingName) || 0;
        this.balanceForSearch.set(financingName, currentTotal + subtotal);

        this.totalBalance += subtotal; // Additionner uniquement le subtotal courant
      });
    });
  }


  get balanceOfSearch(): BalanceSubActivity[] {
    if (this.balanceForSearch.size === 0) return [];
    this.totalBalance = Array.from(this.balanceForSearch.values()).reduce((acc, val) => acc + val, 0);
    return Array.from(this.balanceForSearch.entries()).map(([name, total]) => ({
      financing: name,
      total: total
    }));
  }

  loadBudget(id: number): void {
    this.budgetService.getBudget(id).subscribe(budget => {
      this.budget = budget;
      this.getCenter(budget.centerId);
    });
  }

  // load all nomenclatures
  loadNomenclatures(): void {
    this.nomenclatureService.getNomenclatures().subscribe(nomenclatures => {
        this.nomenclatures = nomenclatures;
    }); 
  }

  // load all financings
  loadFinancings(): void {
    this.financingService.getFinancings().subscribe(financings => {
      this.financings = financings;
    });
  }

  getCenter(id: number): void {
    this.centerService.getCenter(id).subscribe(center => {
      this.center = center;
    });
  }


  editActivity(activity: Activity): void {
    this.editingActivity = { ...activity }; // clone pour éviter modification directe
    this.activityForm.patchValue({
      name: this.editingActivity.name,
      budgetId: this.budget?.id
    });
    this.showAddForm = true;
    this.scrollToForm();
  }

  cancelEdit(): void {
    this.editingActivity = null;
    this.showAddForm = false;
    this.activityForm.reset();
  }

  onSubmit(): void {
    if (this.activityForm.invalid || !this.budget) return;

    this.isSubmitting = true;

    const formValue = this.activityForm.value;

    if (this.editingActivity) {
      const updatedActivity = {
        ...this.editingActivity,
        ...formValue
      };

      this.activityService.updateBudgetActivity(updatedActivity).subscribe({
        next: () => {
          this.loadBudget(this.budget!.id);
          this.cancelEdit();
          this.isSubmitting = false;
        },
        error: () => {
          this.isSubmitting = false;
        }
      });
    } else {
      this.activityService.addBudgetActivity(formValue).subscribe({
        next: () => {
          this.loadBudget(this.budget!.id);
          this.cancelEdit();
          this.isSubmitting = false;
          location.reload();
        },
        error: () => {
          this.isSubmitting = false;
        }
      });
    }
  }

  deleteActivity(activityId: number): void {
    if (!this.budget) return;

    Swal.fire({
      title: 'Delete Activity?',
      text: 'Are you sure you want to delete this activity? This action cannot be undone.',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#d33',
      cancelButtonColor: '#3085d6',
      confirmButtonText: 'Yes, delete it!',
      reverseButtons: true,
    }).then((result) => {
      if (result.isConfirmed) {
        this.activityService.deleteBudgetActivity(activityId).subscribe(success => {
          if (success) {
            location.reload();
            Swal.fire({
              title: 'Deleted!',
              text: 'The activity has been deleted.',
              icon: 'success',
              timer: 1500,
              showConfirmButton: false
            }).then(() => {
              location.reload(); // recharge la page après confirmation
            });
          } else {
            Swal.fire('Error', 'Failed to delete the activity.', 'error');
          }
        });
      }
    });
  }

  //traiter le FBP en dur
  openModal(activity: Activity): void {
    this.selectedActivity = activity;
    this.newSubActivity = this.createEmptySubActivity();
    this.financingService.getFinancings().subscribe(financings => {
      financings.forEach(financing => {
        if (financing.name === "FBP") {
          this.newSubActivity.financingId = financing.id;
        }
      });
    });
    this.newSubActivity.activityId = activity.id;
  }

  // Crée une copie de la sous-activité
  openEditModal(subActivity: any) {
    this.selectedSubActivity = { ...subActivity }; 
    this.isAdding = false;
  }

  cancelModal(): void {
    this.selectedActivity = undefined;
    this.newSubActivity = this.createEmptySubActivity();
    this.isAdding = false;
    this.selectedSubActivity = undefined;
  }

  submitSubActivity(): void {
    this.subActivityService.addActivitySubActivity(this.newSubActivity).subscribe({
      next: () => {
        this.loadBudget(this.budget!.id);
        this.cancelModal();
      }
    });
  }

  // Logique pour éditer une sous-activité
  submitEditSubActivity(subActivity: SubActivity): void {
    // console.log('Submitting edited sub-activity:', subActivity);
    // this.selectedSubActivity!.nomenclatureId = Number(this.searchNomenclatureCode);
    subActivity.nomenclatureId = this.selectedSubActivity?.nomenclatureId || 0;
    if (!this.selectedSubActivity) return;
    this.subActivityService.updateSubActivity(subActivity).subscribe({
      next: () => {
        this.loadBudget(this.budget!.id);
        this.cancelModal();
      },
      error: () => {
        console.error('Error updating sub-activity');
      }
    });
    this.cancelModal();
  }

  deleteSubActivity(subActivityId: number): void {
    if (!this.budget || !confirm('Are you sure you want to delete this sub_activity? This action cannot be undone.')) {
      return;
    }
    this.subActivityService.deleteSubActivity(subActivityId).subscribe(success => {
      if (success) {
        this.loadBudget(this.budget!.id);
      }
    });
  }

  viewBudgetForecast(): void {
    this.router.navigate(['/forecast', this.budget?.id]);
  }  

  // For dropdown filter
  selectFilter(label: string): void {
    this.selectedFilterLabel = label;
    this.dropdownOpen = false;
    this.searchBalanceSubActivities();
  }

  onSelectNomenclature(selected: Nomenclature) {
    this.searchNomenclatureCode = `${selected.code} - ${selected.name}`;
    this.newSubActivity.nomenclatureId = selected.id;
    this.selectedSubActivity!.nomenclatureId = selected.id; // Mise à jour de la sous-activité sélectionnée
  }

  scrollToForm() {
    this.formElement.nativeElement.scrollIntoView({ behavior: 'smooth' });
  }

}
