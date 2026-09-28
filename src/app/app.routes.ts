import { Routes } from '@angular/router';
import { Login } from './login/login';
import { Dashboard } from './dashboard/dashboard';
import { Vehicles } from './vehicles/vehicles';
import { VehicleDetail } from './vehicle-detail/vehicle-detail';
import { Drivers } from './drivers/drivers';
import { Assignments } from './assignments/assignments';
import { Maintenance } from './maintenance/maintenance';
import { Reports } from './reports/reports';
import { Fuel } from './fuel/fuel';
import { Tracking } from './tracking/tracking';
import { Incidents } from './incidents/incidents';
import { Expenses } from './expenses/expenses';
import { Documents } from './documents/documents';
import { authGuard } from './guards/auth.guard';

export const routes: Routes = [
  { path: '', redirectTo: '/login', pathMatch: 'full' },
  { path: 'login', component: Login },
  { path: 'dashboard', component: Dashboard, canActivate: [authGuard] },
  { path: 'vehicles', component: Vehicles, canActivate: [authGuard] },
  { path: 'vehicles/:id', component: VehicleDetail, canActivate: [authGuard] },
  { path: 'drivers', component: Drivers, canActivate: [authGuard] },
  { path: 'assignments', component: Assignments, canActivate: [authGuard] },
  { path: 'maintenance', component: Maintenance, canActivate: [authGuard] },
  { path: 'reports', component: Reports, canActivate: [authGuard] },
  { path: 'fuel', component: Fuel, canActivate: [authGuard] },
  { path: 'tracking', component: Tracking, canActivate: [authGuard] },
  { path: 'incidents', component: Incidents, canActivate: [authGuard] },
  { path: 'expenses', component: Expenses, canActivate: [authGuard] },
  { path: 'documents', component: Documents, canActivate: [authGuard] },
];
