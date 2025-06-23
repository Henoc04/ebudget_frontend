import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { CenterService } from '../../services/center.service';
import { Center } from '../../models/center.model';
import { Router } from '@angular/router';
import { CustomcurrencyPipe } from '../../shared/customcurrency.pipe';

@Component({
  selector: 'app-centers',
  standalone: true,
  imports: [
    CommonModule, 
    ReactiveFormsModule,
    CustomcurrencyPipe
  ],
  templateUrl:  './centers.component.html',
  styleUrl: './centers.component.scss'
})
export class CentersComponent implements OnInit {
  
  centers: Center[] = [];
  centerForm: FormGroup;
  showAddForm = false;
  editingCenter: Center | null = null;
  isSubmitting = false;

  constructor(
    private readonly centerService: CenterService,
    private readonly fb: FormBuilder,
    private readonly router: Router,
  ) {
    this.centerForm = this.fb.group({
      name: ['', Validators.required],
      location: ['', Validators.required],
      amount: [0, [Validators.required, Validators.min(0)]],
      code: ['', Validators.required],
      iban: ['', Validators.required],
      description: [''],
      manager: ['']
    });
  }

  ngOnInit(): void {
    this.loadCenters();
  }

  loadCenters(): void {
    this.centerService.getCenters().subscribe(centers => {
      this.centers = centers;
    });
  }

  editCenter(center: Center): void {
    this.editingCenter = center;
    this.showAddForm = false;
    this.centerForm.patchValue({
      name: center.name,
      location: center.location,
      amount: center.amount,
      code: center.code,
      iban: center.iban,
      description: center.description || '',
      manager: center.manager || ''
    });
  }

  deleteCenter(id: number): void {
    if (confirm('Are you sure you want to delete this center? This action cannot be undone.')) {
      this.centerService.deleteCenter(id).subscribe(success => {
        if (success) {
          this.loadCenters();
        }
      });
    }
  }

  cancelEdit(): void {
    this.editingCenter = null;
    this.showAddForm = false;
    this.centerForm.reset();
  }

  onSubmit(): void {
    if (this.centerForm.invalid) {
      return;
    }
    
    this.isSubmitting = true;

    if (this.editingCenter) {
      
      this.editingCenter.name = this.centerForm.value.name;
      this.editingCenter.location = this.centerForm.value.location;
      this.editingCenter.amount = this.centerForm.value.amount;
      this.editingCenter.code = this.centerForm.value.code;
      this.editingCenter.description = this.centerForm.value.description;
      this.editingCenter.manager = this.centerForm.value.manager;

      this.centerService.updateCenter(this.editingCenter)
        .subscribe({
          next: () => {
            this.isSubmitting = false;
            this.loadCenters();
            this.cancelEdit();
          },
          error: () => {
            this.isSubmitting = false;
          }
        });
    } else {
      this.centerService.createCenter(this.centerForm.value)
        .subscribe({
          next: () => {
            this.isSubmitting = false;
            this.loadCenters();
            this.showAddForm = false;
            this.centerForm.reset();
          },
          error: () => {
            this.isSubmitting = false;
          }
        });
    }
  }
}