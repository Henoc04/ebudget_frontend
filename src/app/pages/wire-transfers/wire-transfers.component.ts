import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { WireTransfer } from '../../models/wire-transfer.model';
import { WireTransferService } from '../../services/wire-transfer.service';
import { BudgetService } from '../../services/budget/budget.service';
import { Budget } from '../../models/budget.model';

@Component({
  selector: 'app-wire-transfers',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  template: `
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div class="flex justify-between items-center">
        <h1 class="text-2xl font-semibold text-gray-900">Wire Transfers</h1>
        <button 
          (click)="showAddForm = !showAddForm"
          class="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
        >
          {{ showAddForm ? 'Cancel' : 'New Wire Transfer' }}
        </button>
      </div>

      <!-- Add/Edit Form -->
      <div *ngIf="showAddForm || editingTransfer" class="mt-6 bg-white shadow px-4 py-5 sm:rounded-lg sm:p-6">
        <div class="md:grid md:grid-cols-3 md:gap-6">
          <div class="md:col-span-1">
            <h3 class="text-lg font-medium text-gray-900">{{ editingTransfer ? 'Edit' : 'New' }} Wire Transfer</h3>
            <p class="mt-1 text-sm text-gray-500">
              {{ editingTransfer ? 'Update wire transfer details' : 'Create a new wire transfer' }}
            </p>
          </div>
          <div class="mt-5 md:mt-0 md:col-span-2">
            <form [formGroup]="transferForm" (ngSubmit)="onSubmit()">
              <div class="grid grid-cols-6 gap-6">
                <div class="col-span-6 sm:col-span-3">
                  <label class="block text-sm font-medium text-gray-700">Budget</label>
                  <select
                    formControlName="budgetId"
                    class="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm rounded-md"
                  >
                    <option [ngValue]="null">Select a budget</option>
                    <option *ngFor="let budget of budgets" [value]="budget.id">
                      {{ budget.center?.name }} - {{ budget.year }} ({{ budget.remainingAmount | currency:'EUR' }})
                    </option>
                  </select>
                </div>

                <div class="col-span-6 sm:col-span-3">
                  <label class="block text-sm font-medium text-gray-700">Reference</label>
                  <input
                    type="text"
                    formControlName="reference"
                    class="mt-1 focus:ring-blue-500 focus:border-blue-500 block w-full shadow-sm sm:text-sm border-gray-300 rounded-md"
                  >
                </div>

                <div class="col-span-6 sm:col-span-3">
                  <label class="block text-sm font-medium text-gray-700">Amount</label>
                  <input
                    type="number"
                    formControlName="amount"
                    class="mt-1 focus:ring-blue-500 focus:border-blue-500 block w-full shadow-sm sm:text-sm border-gray-300 rounded-md"
                  >
                </div>

                <div class="col-span-6 sm:col-span-3">
                  <label class="block text-sm font-medium text-gray-700">Recipient Name</label>
                  <input
                    type="text"
                    formControlName="recipientName"
                    class="mt-1 focus:ring-blue-500 focus:border-blue-500 block w-full shadow-sm sm:text-sm border-gray-300 rounded-md"
                  >
                </div>

                <div class="col-span-6 sm:col-span-3">
                  <label class="block text-sm font-medium text-gray-700">Recipient Account</label>
                  <input
                    type="text"
                    formControlName="recipientAccount"
                    class="mt-1 focus:ring-blue-500 focus:border-blue-500 block w-full shadow-sm sm:text-sm border-gray-300 rounded-md"
                  >
                </div>

                <div class="col-span-6 sm:col-span-3">
                  <label class="block text-sm font-medium text-gray-700">Recipient Bank</label>
                  <input
                    type="text"
                    formControlName="recipientBank"
                    class="mt-1 focus:ring-blue-500 focus:border-blue-500 block w-full shadow-sm sm:text-sm border-gray-300 rounded-md"
                  >
                </div>

                <div class="col-span-6">
                  <label class="block text-sm font-medium text-gray-700">Description</label>
                  <textarea
                    formControlName="description"
                    rows="3"
                    class="mt-1 focus:ring-blue-500 focus:border-blue-500 block w-full shadow-sm sm:text-sm border-gray-300 rounded-md"
                  ></textarea>
                </div>

                <div class="col-span-6 sm:col-span-3">
                  <label class="block text-sm font-medium text-gray-700">Status</label>
                  <select
                    formControlName="status"
                    class="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm rounded-md"
                  >
                    <option value="DRAFT">Draft</option>
                    <option value="PENDING">Pending</option>
                    <option value="APPROVED">Approved</option>
                    <option value="REJECTED">Rejected</option>
                    <option value="COMPLETED">Completed</option>
                  </select>
                </div>
              </div>

              <div class="mt-6 flex justify-end space-x-3">
                <button
                  type="button"
                  (click)="cancelEdit()"
                  class="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  [disabled]="transferForm.invalid || isSubmitting"
                  class="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                >
                  {{ editingTransfer ? 'Update' : 'Create' }} Transfer
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>

      <!-- Wire Transfers List -->
      <div class="mt-8 flex flex-col">
        <div class="-my-2 overflow-x-auto sm:-mx-6 lg:-mx-8">
          <div class="py-2 align-middle inline-block min-w-full sm:px-6 lg:px-8">
            <div class="shadow overflow-hidden border-b border-gray-200 sm:rounded-lg">
              <table class="min-w-full divide-y divide-gray-200">
                <thead class="bg-gray-50">
                  <tr>
                    <th scope="col" class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Reference/Details
                    </th>
                    <th scope="col" class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Budget
                    </th>
                    <th scope="col" class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Amount
                    </th>
                    <th scope="col" class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Status
                    </th>
                    <th scope="col" class="relative px-6 py-3">
                      <span class="sr-only">Actions</span>
                    </th>
                  </tr>
                </thead>
                <tbody class="bg-white divide-y divide-gray-200">
                  <tr *ngFor="let transfer of wireTransfers">
                    <td class="px-6 py-4">
                      <div class="text-sm font-medium text-gray-900">{{ transfer.reference }}</div>
                      <div class="text-sm text-gray-500">{{ transfer.recipientName }}</div>
                      <div class="text-sm text-gray-500">{{ transfer.recipientBank }}</div>
                    </td>
                    <td class="px-6 py-4 whitespace-nowrap">
                      <div class="text-sm text-gray-900">{{ transfer.budget?.center?.name }}</div>
                      <div class="text-sm text-gray-500">{{ transfer.budget?.year }}</div>
                    </td>
                    <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {{ transfer.amount | currency:'EUR' }}
                    </td>
                    <td class="px-6 py-4 whitespace-nowrap">
                      <span [ngClass]="{
                        'px-2 inline-flex text-xs leading-5 font-semibold rounded-full': true,
                        'bg-gray-100 text-gray-800': transfer.status === 'DRAFT',
                        'bg-yellow-100 text-yellow-800': transfer.status === 'PENDING',
                        'bg-green-100 text-green-800': transfer.status === 'COMPLETED',
                        'bg-red-100 text-red-800': transfer.status === 'REJECTED',
                        'bg-blue-100 text-blue-800': transfer.status === 'APPROVED'
                      }">
                        {{ transfer.status }}
                      </span>
                    </td>
                    <td class="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <button
                        (click)="editTransfer(transfer)"
                        class="text-indigo-600 hover:text-indigo-900 mr-4"
                      >
                        Edit
                      </button>
                      <button
                        (click)="deleteTransfer(transfer.id)"
                        class="text-red-600 hover:text-red-900"
                      >
                        Delete
                      </button>
                    </td>
                  </tr>
                  <tr *ngIf="wireTransfers.length === 0">
                    <td colspan="5" class="px-6 py-4 text-center text-sm text-gray-500">
                      No wire transfers found. Click "New Wire Transfer" to create one.
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .animate-fade-in {
      animation: fadeIn 0.3s ease-in-out;
    }
    
    @keyframes fadeIn {
      from { opacity: 0; transform: translateY(-10px); }
      to { opacity: 1; transform: translateY(0); }
    }
  `]
})
export class WireTransfersComponent implements OnInit {
  wireTransfers: WireTransfer[] = [];
  budgets: Budget[] = [];
  transferForm: FormGroup;
  showAddForm = false;
  isSubmitting = false;
  editingTransfer: WireTransfer | null = null;

  constructor(
    private wireTransferService: WireTransferService,
    private budgetService: BudgetService,
    private fb: FormBuilder
  ) {
    this.transferForm = this.createForm();
  }

  ngOnInit(): void {
    this.loadWireTransfers();
    this.loadBudgets();
  }

  private createForm(): FormGroup {
    return this.fb.group({
      budgetId: [null, Validators.required],
      reference: ['', Validators.required],
      amount: [null, [Validators.required, Validators.min(0)]],
      recipientName: ['', Validators.required],
      recipientAccount: ['', Validators.required],
      recipientBank: ['', Validators.required],
      description: [''],
      status: ['DRAFT', Validators.required],
      date: [new Date()],
      createdBy: ['John Doe'] // Hardcoded for demo
    });
  }

  loadWireTransfers(): void {
    this.wireTransferService.getWireTransfersWithBudgets().subscribe(transfers => {
      this.wireTransfers = transfers;
    });
  }

  loadBudgets(): void {
    this.budgetService.getBudgetsWithCenters().subscribe(budgets => {
      this.budgets = budgets;
    });
  }

  editTransfer(transfer: WireTransfer): void {
    this.editingTransfer = transfer;
    this.showAddForm = false;
    this.transferForm.patchValue({
      budgetId: transfer.budgetId,
      reference: transfer.reference,
      amount: transfer.amount,
      recipientName: transfer.recipientName,
      recipientAccount: transfer.recipientAccount,
      recipientBank: transfer.recipientBank,
      description: transfer.description,
      status: transfer.status,
      date: transfer.date,
      createdBy: transfer.createdBy
    });
  }

  cancelEdit(): void {
    this.editingTransfer = null;
    this.showAddForm = false;
    this.transferForm.reset({
      status: 'DRAFT',
      date: new Date(),
      createdBy: 'John Doe'
    });
  }

  onSubmit(): void {
    if (this.transferForm.invalid) return;

    this.isSubmitting = true;
    const transferData = this.transferForm.value;

    if (!this.editingTransfer) {
      transferData.reference = this.wireTransferService.generateReference();
    }

    const request = this.editingTransfer
      ? this.wireTransferService.updateWireTransfer(this.editingTransfer.id, transferData)
      : this.wireTransferService.createWireTransfer(transferData);

    request.subscribe({
      next: () => {
        this.loadWireTransfers();
        this.cancelEdit();
        this.isSubmitting = false;
      },
      error: () => {
        this.isSubmitting = false;
      }
    });
  }

  deleteTransfer(id: number): void {
    if (confirm('Are you sure you want to delete this wire transfer? This action cannot be undone.')) {
      this.wireTransferService.deleteWireTransfer(id).subscribe(success => {
        if (success) {
          this.loadWireTransfers();
        }
      });
    }
  }
}