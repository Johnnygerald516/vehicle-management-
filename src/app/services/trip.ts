import { Injectable } from '@angular/core';
import { Trip } from '../models/trip';

@Injectable({
  providedIn: 'root',
})
export class TripService {
  private readonly key = 'car-service.trips';

  getTrips(): Trip[] {
    const raw = localStorage.getItem(this.key);
    return raw ? (JSON.parse(raw) as Trip[]) : [];
  }

  saveTrip(trip: Trip): void {
    const trips = this.getTrips();
    const index = trips.findIndex(t => t.id === trip.id);
    if (index >= 0) {
      trips[index] = trip;
    } else {
      trips.push(trip);
    }
    localStorage.setItem(this.key, JSON.stringify(trips));
  }

  deleteTrip(id: string): void {
    const trips = this.getTrips().filter(t => t.id !== id);
    localStorage.setItem(this.key, JSON.stringify(trips));
  }

  generateId(): string {
    return Math.random().toString(36).slice(2) + Date.now().toString(36);
  }
}
