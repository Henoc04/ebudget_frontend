import { Budget } from './budget.model';

export interface WireTransfer {
  id: number;
  budgetId: number;
  budget?: Budget;
  reference: string;
  amount: number;
  recipientName: string;
  recipientAccount: string;
  recipientBank: string;
  description: string;
  date: Date;
  status: 'DRAFT' | 'PENDING' | 'APPROVED' | 'REJECTED' | 'COMPLETED';
  createdBy: string;
  approvedBy?: string;
  createdAt: Date;
  updatedAt: Date;
}