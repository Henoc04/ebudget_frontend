import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Financing } from '../../models/budget.model';
import { FinancingService } from '../../services/budget/financing.service';

@Component({
  selector: 'app-financings',
  imports: [
    CommonModule, 
    ReactiveFormsModule
  ],
  templateUrl: './financings.component.html',
  styleUrl: './financings.component.scss'
})
export class FinancingsComponent {

  financings: Financing[] = [];
  financingForm: FormGroup;
  showAddForm = false;
  editingFinancing: Financing | null = null;
  isSubmitting = false;


  constructor(
    private readonly financingService: FinancingService,
    private readonly fb: FormBuilder

  ) {
    this.financingForm = this.fb.group({
      name: ['', Validators.required],
      amount: [0, [Validators.required, Validators.min(0)]],
      description: ['', Validators.required]
    });

    this.loadFinancings();
  }

  loadFinancings(): void {
    this.financingService.getFinancings().subscribe(financings => {
      this.financings = financings;
    });
  }

  resetForm(): void {
    this.financingForm.reset();
    this.editingFinancing = null;
    this.showAddForm = false;
    this.isSubmitting = false;
  }


  onSubmit(): void {
    if (this.financingForm.invalid) {
      return;
    }
    this.isSubmitting = true;
    const financing: Financing = this.financingForm.value;
    if (this.editingFinancing) {
      financing.id = this.editingFinancing.id;
      this.financingService.updateFinancing(financing).subscribe({
        next: () => {
          this.loadFinancings();
          this.resetForm();
          this.isSubmitting = false;
        }
        , error: (error) => {
          console.error('Error creating financing:', error);
          this.isSubmitting = false;
        }
      });
    }
    else {
      this.financingService.createFinancing(financing).subscribe({
        next: () => {
          this.loadFinancings();
          this.resetForm();
          this.isSubmitting = false;
        }
        , error: (error) => {
          console.error('Error creating financing:', error);
          this.isSubmitting = false;
        }
      });
    }
  }

  editFinancing(financing: Financing): void {
    this.editingFinancing = financing;
    this.showAddForm = true;
    this.financingForm.patchValue({
      name: financing.name,
      description: financing.description || ''
    });
  }

  deleteFinancing(id: number): void {
    this.financingService.deleteFinancing(id).subscribe({
      next: () => {
        this.loadFinancings();
      },
      error: (error) => {
        console.error('Error deleting financing:', error);
      }
    });
  }

  cancelEdit(): void {
    this.editingFinancing = null;
    this.showAddForm = false;
    this.financingForm.reset();
  }

}
