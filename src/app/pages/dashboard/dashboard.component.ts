import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { RouterModule } from '@angular/router';
import { Budget } from '../../models/budget.model';
import { PaymentOrder } from '../../models/payment-order.model';
import { WireTransfer } from '../../models/wire-transfer.model';
import { BudgetService } from '../../services/budget/budget.service';
import { PaymentOrderService } from '../../services/payment-order.service';
import { WireTransferService } from '../../services/wire-transfer.service';
import { BrowserModule } from '@angular/platform-browser';
import { HttpClientModule } from '@angular/common/http';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    HttpClientModule 
  ],
  templateUrl: './dashboard.component.html',
  styleUrl: './dashboard.component.scss'
})
export class DashboardComponent {

  budgets: Budget[] = [];
  currentYearBudgets: Budget[] = [];
  paymentOrders: PaymentOrder[] = [];
  wireTransfers: WireTransfer[] = [];
  recentPaymentOrders: PaymentOrder[] = [];
  recentWireTransfers: WireTransfer[] = [];
  currentYear = new Date().getFullYear();

  constructor(
    private readonly budgetService: BudgetService,
    private readonly paymentOrderService: PaymentOrderService,
    private readonly wireTransferService: WireTransferService
  ) {}

  ngOnInit(): void {
    this.loadData();
  }

  loadData(): void {
    this.budgetService.getBudgetsWithCenters().subscribe(budgets => {
      this.budgets = budgets;
      this.currentYearBudgets = budgets.filter(b => b.year === this.currentYear);
    });

    this.paymentOrderService.getPaymentOrdersWithBudgets().subscribe(orders => {
      this.paymentOrders = orders;
      this.recentPaymentOrders = orders
        .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
        .slice(0, 5);
    });

    this.wireTransferService.getWireTransfersWithBudgets().subscribe(transfers => {
      this.wireTransfers = transfers;
      this.recentWireTransfers = transfers
        .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
        .slice(0, 5);
    });
  }

  getTotalBudget(): number {
    return this.currentYearBudgets.reduce((sum, budget) => sum + budget.initialAmount, 0);
  }

  getRemainingBudget(): number {
    return this.currentYearBudgets.reduce((sum, budget) => sum + budget.remainingAmount, 0);
  }

  getRemainingPercentage(): number {
    const total = this.getTotalBudget();
    if (total === 0) return 0;
    return Math.round((this.getRemainingBudget() / total) * 100);
  }

  getTotalPaymentAmount(): number {
    return this.paymentOrders
      .filter(order => order.status === 'COMPLETED')
      .reduce((sum, order) => sum + order.amount, 0);
  }

  getTotalWireTransferAmount(): number {
    return this.wireTransfers
      .filter(transfer => transfer.status === 'COMPLETED')
      .reduce((sum, transfer) => sum + transfer.amount, 0);
  }
}
