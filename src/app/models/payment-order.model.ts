import { Budget } from './budget.model';

export interface PaymentOrder {
  id: number;
  budgetId: number;
  budget?: Budget;
  reference: string;
  amount: number;
  beneficiary: string;
  description: string;
  date: Date;
  status: string;
  createdBy: string;
  approvedBy?: string;
  createdAt: Date;
  updatedAt: Date;
}