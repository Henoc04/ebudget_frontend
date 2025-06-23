import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { NomenclatureService } from '../../services/budget/nomenclature.service';
import { Nomenclature, NomenclatureCategory } from '../../models/budget.model';

@Component({
  selector: 'app-nomenclature',
  imports: [CommonModule, ReactiveFormsModule, FormsModule],
  templateUrl: './nomenclature.component.html',
  styleUrl: './nomenclature.component.scss'
})
export class NomenclatureComponent {

  //nomenclatureForm: FormGroup;
  categoryForm: FormGroup;
  nomenclatures: Nomenclature[] = []; 
  categories: NomenclatureCategory[] = [];
  selectedCategory: NomenclatureCategory | undefined;
  editingCategory: NomenclatureCategory | null = null;
  selectedNomenclature: Nomenclature | undefined;
  editingNomenclature: Nomenclature | null = null;
  isEditing = false;
  isSubmitting = false;
  showAddForm = false;
  showEditForm = false;

  newNomenclature: Nomenclature = this.createEmptyNomenclature();

  constructor(
    private readonly fb: FormBuilder,
    private readonly router: Router,
    private readonly nomenclatureService: NomenclatureService,
    private readonly route: ActivatedRoute,
  ) { 
    this.categoryForm = this.createForm();
  }

  ngOnInit(): void {
    this.loadNomenclatures();
    this.loadCategories();
  }
  private createForm(): FormGroup {
    return this.fb.group({
      name: ['', Validators.required],
    });
  }

  private loadNomenclatures(): void {
    this.nomenclatureService.getNomenclatures().subscribe(nomenclatures => {
        this.nomenclatures = nomenclatures;
      }
    );
  }

  private loadCategories(): void {
    this.nomenclatureService.getNomenclatureCategories().subscribe(categories => {
        this.categories = categories;
        this.categories.forEach(category => {
          this.nomenclatureService.getNomenclatureByCategoryId(category.id).subscribe(nomenclatures => {
            category.nomenclatures = nomenclatures;
          });
      });
    });
  }


  cancelEdit(): void {
    this.editingCategory = null;
    this.showAddForm = false;
    this.categoryForm.reset();
  }

  onSubmit(): void {
    if (this.categoryForm.invalid) return;
      
      this.isSubmitting = true;

      const formValue = this.categoryForm.value;

      if (this.editingCategory) {
        const updatedCategory = {
          ...this.editingCategory,
          ...formValue
        };

        this.nomenclatureService.updateNomenclatureCategory(updatedCategory).subscribe({
          next: () => {
            this.loadCategories();
            this.cancelEdit();
            this.isSubmitting = false;
          },
          error: () => {
            this.isSubmitting = false;
          }
      });
      } else {
          
        this.nomenclatureService.createNomenclatureCategory(formValue).subscribe({
          next: () => {
            this.loadCategories();
            this.cancelEdit();
            this.isSubmitting = false;
          },
          error: () => {
            this.isSubmitting = false;
          }
      });

      }
    }

  editCategory(category: NomenclatureCategory): void {
    this.editingCategory = category;
    this.categoryForm.patchValue({
      name: category.name
    });
    this.isEditing = true;
  }

  deleteCategory(categoryId: number): void {
    this.nomenclatureService.deleteNomenclatureCategoryById(categoryId).subscribe(() => {
      this.loadNomenclatures();
      this.loadCategories();
    });
  }

  deleteNomenclature(nomenclatureId: number): void {
    if (!confirm('Are you sure you want to delete this nomenclature ? This action cannot be undone.')) {
      return;
    }
    this.nomenclatureService.deleteNomenclatureById(nomenclatureId).subscribe(success => {
      if(success){
        this.loadNomenclatures();
        this.loadCategories();
      }
      window.location.reload();
    }); 
  }

  openModal(category: NomenclatureCategory): void {
    this.selectedCategory = category;
    this.newNomenclature = this.createEmptyNomenclature();
    this.newNomenclature.categoryId = category.id;
  }

  createEmptyNomenclature(): Nomenclature {
    return {
      id: 0,
      code: 0,
      name: '',
      categoryId: 0,
      description: ''
    };
  }

  openEditModal(nomenclature: Nomenclature): void {
    this.selectedNomenclature = {...nomenclature };
    this.isEditing = false;
  }

  cancelModal(): void {
    this.selectedCategory = undefined;
    this.newNomenclature = this.createEmptyNomenclature();
    this.isEditing = false;
    this.selectedNomenclature = undefined;
  }

  submitNomenclature(): void {
    this.newNomenclature.categoryId = this.selectedCategory!.id;
    console.log(this.newNomenclature);
    this.nomenclatureService.createNomenclature(this.newNomenclature).subscribe({
      next: () => {
        this.loadNomenclatures();
        this.loadCategories();
        this.cancelModal();
      }
    });
  }

  submitEditNomenclature(nomenclature: Nomenclature): void {
    if (!this.selectedNomenclature) return;
    this.nomenclatureService.updateNomenclature(nomenclature).subscribe({
      next: () => {
        this.loadNomenclatures();
        this.loadCategories();
        this.cancelModal();
      },
      error: (error) => {
        console.error('Error updating nomenclature:', error);
      }
    });
    this.cancelModal();
  }

}
