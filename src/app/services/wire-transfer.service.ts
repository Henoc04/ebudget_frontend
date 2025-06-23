import { Injectable } from '@angular/core';
import { Observable, of } from 'rxjs';
import { delay, switchMap } from 'rxjs/operators';
import { WireTransfer } from '../models/wire-transfer.model';
import { BudgetService } from './budget/budget.service';

@Injectable({
  providedIn: 'root'
})
export class WireTransferService {
  // Mock data for wire transfers
  private wireTransfers: WireTransfer[] = [
    {
      id: 1,
      budgetId: 1,
      reference: 'WT-2024-001',
      amount: 30000,
      recipientName: 'Consulting Partners LLC',
      recipientAccount: 'IBAN123456789',
      recipientBank: 'Global Bank Corp',
      description: 'Q1 financial consulting services',
      date: new Date('2024-01-20'),
      status: 'COMPLETED',
      createdBy: 'John Doe',
      approvedBy: 'Jane Smith',
      createdAt: new Date('2024-01-15'),
      updatedAt: new Date('2024-01-20')
    },
    {
      id: 2,
      budgetId: 2,
      reference: 'WT-2024-002',
      amount: 45000,
      recipientName: 'HR Solutions Group',
      recipientAccount: 'IBAN987654321',
      recipientBank: 'First National Bank',
      description: 'Annual HR software subscription',
      date: new Date('2024-02-10'),
      status: 'COMPLETED',
      createdBy: 'Sarah Williams',
      approvedBy: 'Jane Smith',
      createdAt: new Date('2024-02-05'),
      updatedAt: new Date('2024-02-10')
    },
    {
      id: 3,
      budgetId: 3,
      reference: 'WT-2024-003',
      amount: 80000,
      recipientName: 'Tech Infrastructure Inc.',
      recipientAccount: 'IBAN456789123',
      recipientBank: 'Innovative Banking Group',
      description: 'Server infrastructure upgrade',
      date: new Date('2024-02-25'),
      status: 'PENDING',
      createdBy: 'David Johnson',
      createdAt: new Date('2024-02-20'),
      updatedAt: new Date('2024-02-20')
    },
    {
      id: 4,
      budgetId: 4,
      reference: 'WT-2024-004',
      amount: 35000,
      recipientName: 'Creative Media Agency',
      recipientAccount: 'IBAN789123456',
      recipientBank: 'Commerce Trust',
      description: 'Q1 advertising campaign',
      date: new Date('2024-03-05'),
      status: 'DRAFT',
      createdBy: 'Sarah Williams',
      createdAt: new Date('2024-03-01'),
      updatedAt: new Date('2024-03-01')
    }
  ];

  constructor(private budgetService: BudgetService) {}

  getWireTransfers(): Observable<WireTransfer[]> {
    return of([...this.wireTransfers]).pipe(delay(500));
  }

  getWireTransfersWithBudgets(): Observable<WireTransfer[]> {
    return this.getWireTransfers().pipe(
      switchMap(transfers => {
        const budgetIds = [...new Set(transfers.map(t => t.budgetId))];
        const budgetObservables = budgetIds.map(id => this.budgetService.getBudgetWithCenter(id));
        
        return of(budgetObservables).pipe(
          switchMap(observables => {
            return Promise.all(observables.map(obs => 
              new Promise<any>(resolve => obs.subscribe(budget => resolve(budget)))
            )).then(budgets => {
              return transfers.map(transfer => {
                const budget = budgets.find(b => b?.id === transfer.budgetId);
                return { ...transfer, budget };
              });
            });
          })
        );
      })
    );
  }

  getWireTransfer(id: number): Observable<WireTransfer | undefined> {
    const transfer = this.wireTransfers.find(t => t.id === id);
    return of(transfer).pipe(delay(300));
  }

  getWireTransfersByBudget(budgetId: number): Observable<WireTransfer[]> {
    return of(this.wireTransfers.filter(t => t.budgetId === budgetId)).pipe(delay(300));
  }

  createWireTransfer(transfer: Omit<WireTransfer, 'id' | 'createdAt' | 'updatedAt'>): Observable<WireTransfer> {
    const now = new Date();
    const newTransfer: WireTransfer = {
      ...transfer,
      id: this.getNextId(),
      createdAt: now,
      updatedAt: now
    };
    
    this.wireTransfers.push(newTransfer);
    
    // If the transfer is completed, update the budget's remaining amount
    if (newTransfer.status === 'COMPLETED') {
      this.updateBudgetAmount(newTransfer.budgetId, -newTransfer.amount);
    }
    
    return of(newTransfer).pipe(delay(500));
  }

  updateWireTransfer(id: number, transfer: Partial<Omit<WireTransfer, 'id' | 'createdAt' | 'updatedAt'>>): Observable<WireTransfer | undefined> {
    const index = this.wireTransfers.findIndex(t => t.id === id);
    if (index === -1) {
      return of(undefined);
    }
    
    const oldTransfer = this.wireTransfers[index];
    const updatedTransfer = {
      ...oldTransfer,
      ...transfer,
      updatedAt: new Date()
    };
    
    this.wireTransfers[index] = updatedTransfer;
    
    // Handle budget updates if status changed to/from COMPLETED
    if (oldTransfer.status !== 'COMPLETED' && updatedTransfer.status === 'COMPLETED') {
      // Transfer was completed, reduce budget amount
      this.updateBudgetAmount(updatedTransfer.budgetId, -updatedTransfer.amount);
    } else if (oldTransfer.status === 'COMPLETED' && updatedTransfer.status !== 'COMPLETED') {
      // Transfer was un-completed, add amount back to budget
      this.updateBudgetAmount(updatedTransfer.budgetId, oldTransfer.amount);
    } else if (oldTransfer.status === 'COMPLETED' && updatedTransfer.status === 'COMPLETED' && oldTransfer.amount !== updatedTransfer.amount) {
      // Transfer remained completed but amount changed, adjust the difference
      const difference = oldTransfer.amount - updatedTransfer.amount;
      this.updateBudgetAmount(updatedTransfer.budgetId, difference);
    }
    
    return of(updatedTransfer).pipe(delay(500));
  }

  deleteWireTransfer(id: number): Observable<boolean> {
    const transfer = this.wireTransfers.find(t => t.id === id);
    if (!transfer) {
      return of(false);
    }
    
    const initialLength = this.wireTransfers.length;
    this.wireTransfers = this.wireTransfers.filter(t => t.id !== id);
    
    // If the transfer was completed, add the amount back to the budget
    if (transfer.status === 'COMPLETED') {
      this.updateBudgetAmount(transfer.budgetId, transfer.amount);
    }
    
    return of(initialLength > this.wireTransfers.length).pipe(delay(500));
  }

  private updateBudgetAmount(budgetId: number, amount: number): void {
    // this.budgetService.getBudget(budgetId).pipe(
    //   switchMap(budget => {
    //     if (!budget) {
    //       throw new Error('Budget not found');
    //     }
    //     return this.budgetService.updateBudget(budgetId, {
    //       remainingAmount: budget.remainingAmount + amount
    //     });
    //   })
    // ).subscribe();
  }

  private getNextId(): number {
    return Math.max(...this.wireTransfers.map(t => t.id), 0) + 1;
  }

  generateReference(): string {
    const year = new Date().getFullYear();
    const count = this.wireTransfers.length + 1;
    return `WT-${year}-${count.toString().padStart(3, '0')}`;
  }
}