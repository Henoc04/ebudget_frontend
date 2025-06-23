import { Injectable } from '@angular/core';
import { Observable, of } from 'rxjs';
import { delay, switchMap, tap } from 'rxjs/operators';
import { PaymentOrder } from '../models/payment-order.model';
import { BudgetService } from './budget/budget.service';

@Injectable({
  providedIn: 'root'
})
export class PaymentOrderService {
  // Mock data for payment orders
  private paymentOrders: PaymentOrder[] = [
    {
      id: 1,
      budgetId: 1,
      reference: 'PO-2024-001',
      amount: 25000,
      beneficiary: 'Office Supplies Inc.',
      description: 'Q1 office supplies payment',
      date: new Date('2024-01-15'),
      status: 'COMPLETED',
      createdBy: 'John Doe',
      approvedBy: 'Jane Smith',
      createdAt: new Date('2024-01-10'),
      updatedAt: new Date('2024-01-15')
    },
    {
      id: 2,
      budgetId: 1,
      reference: 'PO-2024-002',
      amount: 35000,
      beneficiary: 'Tech Solutions Ltd.',
      description: 'New financial software licenses',
      date: new Date('2024-02-05'),
      status: 'COMPLETED',
      createdBy: 'John Doe',
      approvedBy: 'Jane Smith',
      createdAt: new Date('2024-01-30'),
      updatedAt: new Date('2024-02-05')
    },
    {
      id: 3,
      budgetId: 2,
      reference: 'PO-2024-003',
      amount: 12000,
      beneficiary: 'Training Academy',
      description: 'Staff training program',
      date: new Date('2024-02-15'),
      status: 'COMPLETED',
      createdBy: 'Sarah Williams',
      approvedBy: 'Jane Smith',
      createdAt: new Date('2024-02-10'),
      updatedAt: new Date('2024-02-15')
    },
    {
      id: 4,
      budgetId: 3,
      reference: 'PO-2024-004',
      amount: 50000,
      beneficiary: 'Cloud Services Provider',
      description: 'Annual cloud infrastructure subscription',
      date: new Date('2024-03-01'),
      status: 'PENDING',
      createdBy: 'David Johnson',
      createdAt: new Date('2024-02-25'),
      updatedAt: new Date('2024-02-25')
    },
    {
      id: 5,
      budgetId: 4,
      reference: 'PO-2024-005',
      amount: 18000,
      beneficiary: 'Digital Marketing Agency',
      description: 'Q1 social media campaign',
      date: new Date('2024-03-10'),
      status: 'DRAFT',
      createdBy: 'Sarah Williams',
      createdAt: new Date('2024-03-05'),
      updatedAt: new Date('2024-03-05')
    }
  ];

  constructor(private budgetService: BudgetService) {}

  getPaymentOrders(): Observable<PaymentOrder[]> {
    return of([...this.paymentOrders]).pipe(delay(500));
  }

  getPaymentOrdersWithBudgets(): Observable<PaymentOrder[]> {
    return this.getPaymentOrders().pipe(
      switchMap(orders => {
        const budgetIds = [...new Set(orders.map(o => o.budgetId))];
        const budgetObservables = budgetIds.map(id => this.budgetService.getBudgetWithCenter(id));
        
        return of(budgetObservables).pipe(
          switchMap(observables => {
            return Promise.all(observables.map(obs => 
              new Promise<any>(resolve => obs.subscribe(budget => resolve(budget)))
            )).then(budgets => {
              return orders.map(order => {
                const budget = budgets.find(b => b?.id === order.budgetId);
                return { ...order, budget };
              });
            });
          })
        );
      })
    );
  }

  getPaymentOrder(id: number): Observable<PaymentOrder | undefined> {
    const order = this.paymentOrders.find(o => o.id === id);
    return of(order).pipe(delay(300));
  }

  getPaymentOrdersByBudget(budgetId: number): Observable<PaymentOrder[]> {
    return of(this.paymentOrders.filter(o => o.budgetId === budgetId)).pipe(delay(300));
  }

  createPaymentOrder(order: Omit<PaymentOrder, 'id' | 'createdAt' | 'updatedAt'>): Observable<PaymentOrder> {
    const now = new Date();
    const newOrder: PaymentOrder = {
      ...order,
      id: this.getNextId(),
      createdAt: now,
      updatedAt: now
    };
    
    this.paymentOrders.push(newOrder);
    
    // If the order is completed, update the budget's remaining amount
    if (newOrder.status === 'COMPLETED') {
      this.updateBudgetAmount(newOrder.budgetId, -newOrder.amount);
    }
    
    return of(newOrder).pipe(delay(500));
  }

  updatePaymentOrder(id: number, order: Partial<Omit<PaymentOrder, 'id' | 'createdAt' | 'updatedAt'>>): Observable<PaymentOrder | undefined> {
    const index = this.paymentOrders.findIndex(o => o.id === id);
    if (index === -1) {
      return of(undefined);
    }
    
    const oldOrder = this.paymentOrders[index];
    const updatedOrder = {
      ...oldOrder,
      ...order,
      updatedAt: new Date()
    };
    
    this.paymentOrders[index] = updatedOrder;
    
    // Handle budget updates if status changed to/from COMPLETED
    if (oldOrder.status !== 'COMPLETED' && updatedOrder.status === 'COMPLETED') {
      // Order was completed, reduce budget amount
      this.updateBudgetAmount(updatedOrder.budgetId, -updatedOrder.amount);
    } else if (oldOrder.status === 'COMPLETED' && updatedOrder.status !== 'COMPLETED') {
      // Order was un-completed, add amount back to budget
      this.updateBudgetAmount(updatedOrder.budgetId, oldOrder.amount);
    } else if (oldOrder.status === 'COMPLETED' && updatedOrder.status === 'COMPLETED' && oldOrder.amount !== updatedOrder.amount) {
      // Order remained completed but amount changed, adjust the difference
      const difference = oldOrder.amount - updatedOrder.amount;
      this.updateBudgetAmount(updatedOrder.budgetId, difference);
    }
    
    return of(updatedOrder).pipe(delay(500));
  }

  deletePaymentOrder(id: number): Observable<boolean> {
    const order = this.paymentOrders.find(o => o.id === id);
    if (!order) {
      return of(false);
    }
    
    const initialLength = this.paymentOrders.length;
    this.paymentOrders = this.paymentOrders.filter(o => o.id !== id);
    
    // If the order was completed, add the amount back to the budget
    if (order.status === 'COMPLETED') {
      this.updateBudgetAmount(order.budgetId, order.amount);
    }
    
    return of(initialLength > this.paymentOrders.length).pipe(delay(500));
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
    return Math.max(...this.paymentOrders.map(o => o.id), 0) + 1;
  }

  generateReference(): string {
    const year = new Date().getFullYear();
    const count = this.paymentOrders.length + 1;
    return `PO-${year}-${count.toString().padStart(3, '0')}`;
  }
}