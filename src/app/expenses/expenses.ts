import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { CurrencyPipe } from '@angular/common';
import { RouterLink } from '@angular/router';
import { Expense, ExpenseView, ExpenseCategory } from '../models/expense';
import { Vehicle } from '../models/vehicle';
import { ExpenseService } from '../services/expense';
import { VehicleService } from '../services/vehicle';
import { FuelService } from '../services/fuel';
import { ServiceRecordService } from '../services/service-record';
import { IncidentService } from '../services/incident';

interface VehicleCost {
  vehicle: string;
  fuel: number;
  service: number;
  incidents: number;
  expenses: number;
  total: number;
}

@Component({
  selector: 'app-expenses',
  imports: [FormsModule, CurrencyPipe, RouterLink],
  templateUrl: './expenses.html',
  styleUrl: './expenses.css',
})
export class Expenses implements OnInit {
  expenses: ExpenseView[] = [];
  vehicles: Vehicle[] = [];
  editing: Expense = this.empty();
  showForm = false;
  today = new Date().toISOString().slice(0, 10);

  readonly categories: ExpenseCategory[] = [
    'fuel', 'service', 'repair', 'insurance', 'tyres', 'parking', 'fines', 'other',
  ];

  constructor(
    private expenseService: ExpenseService,
    private vehicleService: VehicleService,
    private fuelService: FuelService,
    private recordService: ServiceRecordService,
    private incidentService: IncidentService
  ) {}

  ngOnInit(): void {
    this.vehicles = this.vehicleService.getVehicles();
    this.load();
  }

  load(): void {
    this.expenses = this.expenseService.getExpenseView();
  }

  empty(): Expense {
    return {
      id: '',
      vehicleId: '',
      category: 'other',
      date: this.today,
      amount: 0,
      description: '',
      vendor: '',
    };
  }

  addNew(): void {
    this.editing = this.empty();
    this.showForm = true;
  }

  edit(e: ExpenseView): void {
    this.editing = {
      id: e.id,
      vehicleId: e.vehicleId,
      category: e.category,
      date: e.date,
      amount: e.amount,
      description: e.description,
      vendor: e.vendor,
    };
    this.showForm = true;
  }

  cancel(): void {
    this.showForm = false;
    this.editing = this.empty();
  }

  save(): void {
    if (!this.editing.vehicleId || !this.editing.date || this.editing.amount <= 0) return;
    if (!this.editing.id) {
      this.editing.id = this.expenseService.generateId();
    }
    this.expenseService.saveExpense(this.editing);
    this.showForm = false;
    this.editing = this.empty();
    this.load();
  }

  delete(id: string): void {
    if (confirm('Delete this expense?')) {
      this.expenseService.deleteExpense(id);
      this.load();
    }
  }

  fuelCost(vehicleId: string): number {
    return this.fuelService.getTotalCost(vehicleId);
  }

  serviceCost(vehicleId: string): number {
    return this.recordService.getRecords(vehicleId).reduce((s, r) => s + (r.cost || 0), 0);
  }

  incidentCost(vehicleId: string): number {
    return this.incidentService.getIncidents()
      .filter(i => i.vehicleId === vehicleId)
      .reduce((s, i) => s + (i.repairCost || 0), 0);
  }

  expenseCost(vehicleId: string): number {
    return this.expenseService.getExpenses()
      .filter(e => e.vehicleId === vehicleId)
      .reduce((s, e) => s + (e.amount || 0), 0);
  }

  consolidated(): VehicleCost[] {
    return this.vehicles.map(v => {
      const fuel = this.fuelCost(v.id);
      const service = this.serviceCost(v.id);
      const incidents = this.incidentCost(v.id);
      const expenses = this.expenseCost(v.id);
      return {
        vehicle: `${v.year} ${v.make} ${v.model} (${v.licensePlate})`,
        fuel,
        service,
        incidents,
        expenses,
        total: fuel + service + incidents + expenses,
      };
    });
  }

  totalAll(): number {
    return this.consolidated().reduce((s, c) => s + c.total, 0);
  }
}
