import { Injectable } from '@angular/core';
import { Expense, ExpenseView } from '../models/expense';
import { Vehicle } from '../models/vehicle';
import { VehicleService } from './vehicle';

@Injectable({
  providedIn: 'root',
})
export class ExpenseService {
  private readonly storageKey = 'car-service.expenses';

  constructor(private vehicleService: VehicleService) {}

  getExpenses(): Expense[] {
    const raw = localStorage.getItem(this.storageKey);
    return raw ? (JSON.parse(raw) as Expense[]) : [];
  }

  getExpenseView(): ExpenseView[] {
    const vehicles = this.vehicleService.getVehicles();
    const vMap = new Map<string, Vehicle>();
    vehicles.forEach(v => vMap.set(v.id, v));
    return this.getExpenses().map(e => ({
      ...e,
      vehicleName: vMap.get(e.vehicleId)
        ? `${vMap.get(e.vehicleId)!.year} ${vMap.get(e.vehicleId)!.make} ${vMap.get(e.vehicleId)!.model}`
        : 'Unknown Vehicle',
    }));
  }

  saveExpense(expense: Expense): void {
    const expenses = this.getExpenses();
    const index = expenses.findIndex(e => e.id === expense.id);
    if (index >= 0) {
      expenses[index] = expense;
    } else {
      expenses.push(expense);
    }
    localStorage.setItem(this.storageKey, JSON.stringify(expenses));
  }

  deleteExpense(id: string): void {
    const expenses = this.getExpenses().filter(e => e.id !== id);
    localStorage.setItem(this.storageKey, JSON.stringify(expenses));
  }

  generateId(): string {
    return Math.random().toString(36).slice(2) + Date.now().toString(36);
  }
}
