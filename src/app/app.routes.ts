import { Routes } from '@angular/router';
import { AuthGuard } from './guards/auth.guard';
import { DashboardComponent } from './pages/dashboard/dashboard.component';
import { CentersComponent } from './pages/centers/centers.component';
import { BudgetsComponent } from './pages/budgets/budgets.component';
import { BudgetDetailsComponent } from './pages/budget-details/budget-details.component';
import { LoginComponent } from './pages/auth/login/login.component';
import { PaymentOrdersComponent } from './pages/payment-orders/payment-orders.component';
import { WireTransfersComponent } from './pages/wire-transfers/wire-transfers.component';
import { NomenclatureComponent } from './pages/nomenclature/nomenclature.component';
import { ForecastStatementComponent } from './pages/forecast-statement/forecast-statement.component';
import { FinancingsComponent } from './pages/financings/financings.component';

export const routes: Routes = [
  //{ path: '', redirectTo: '/dashboard', pathMatch: 'full' },

  { path: 'dashboard', component: DashboardComponent, canActivate: [AuthGuard] },
  { path: 'centers', component: CentersComponent, canActivate: [AuthGuard] },
  { path: 'budgets', component: BudgetsComponent, canActivate: [AuthGuard] },
  { path: 'budgets/:id', component: BudgetDetailsComponent, canActivate: [AuthGuard] },
  { path: 'payment-orders', component: PaymentOrdersComponent, canActivate: [AuthGuard] },
  { path: 'wire-transfers', component: WireTransfersComponent, canActivate: [AuthGuard] },  
  { path: 'nomenclatures', component: NomenclatureComponent, canActivate: [AuthGuard] },
  { path: 'forecast/:id', component: ForecastStatementComponent, canActivate: [AuthGuard] },
  { path: 'financings', component: FinancingsComponent, canActivate: [AuthGuard] },
  { path: 'login', component: LoginComponent },
  { path: '**', redirectTo: '/dashboard' }
];
