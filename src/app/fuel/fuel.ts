import { Component, OnInit, computed, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { CurrencyPipe } from '@angular/common';
import { RouterLink, ActivatedRoute } from '@angular/router';
import { FuelEntry } from '../models/fuel-entry';
import { Vehicle } from '../models/vehicle';
import { FuelService } from '../services/fuel';
import { VehicleService } from '../services/vehicle';

type FuelTab = 'entry' | 'history';

@Component({
  selector: 'app-fuel',
  imports: [FormsModule, CurrencyPipe, RouterLink],
  templateUrl: './fuel.html',
  styleUrl: './fuel.css',
})
export class Fuel implements OnInit {
  private fuelService = inject(FuelService);
  private vehicleService = inject(VehicleService);
  private route = inject(ActivatedRoute);

  activeTab = signal<FuelTab>('entry');
  vehicles = signal<Vehicle[]>([]);
  entries = signal<FuelEntry[]>([]);
  showForm = signal(false);
  today = new Date().toISOString().slice(0, 10);
  editing = this.emptyEntry();

  ngOnInit(): void {
    this.vehicles.set(this.vehicleService.getVehicles());
    this.load();
    this.route.queryParams.subscribe(params => {
      const tab = params['tab'] as FuelTab;
      if (tab && ['entry', 'history'].includes(tab)) {
        this.activeTab.set(tab);
      }
    });
  }

  load(): void {
    this.entries.set(this.fuelService.getEntries());
  }

  setTab(tab: FuelTab): void {
    this.activeTab.set(tab);
    this.editing = this.emptyEntry();
  }

  emptyEntry(): FuelEntry {
    return {
      id: '',
      vehicleId: '',
      date: this.today,
      fuelType: '',
      litres: 0,
      cost: 0,
      mileage: 0,
      notes: '',
    };
  }

  addNew(): void {
    this.editing = this.emptyEntry();
    this.showForm.set(true);
  }

  edit(entry: FuelEntry): void {
    this.editing = { ...entry };
    this.showForm.set(true);
  }

  cancel(): void {
    this.showForm.set(false);
    this.editing = this.emptyEntry();
  }

  save(): void {
    if (!this.editing.vehicleId || !this.editing.date || this.editing.litres <= 0) return;

    if (!this.editing.id) {
      this.editing.id = this.fuelService.generateId();
    }
    this.fuelService.saveEntry(this.editing);
    this.showForm.set(false);
    this.editing = this.emptyEntry();
    this.load();
  }

  delete(id: string): void {
    if (confirm('Delete this fuel entry?')) {
      this.fuelService.deleteEntry(id);
      this.load();
    }
  }

  vehicleName(id: string): string {
    const v = this.vehicles().find(x => x.id === id);
    return v ? `${v.year} ${v.make} ${v.model}` : 'Unknown Vehicle';
  }
}
