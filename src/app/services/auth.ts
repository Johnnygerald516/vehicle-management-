import { Injectable, inject } from '@angular/core';
import { Router } from '@angular/router';

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  private readonly router = inject(Router);
  private readonly TOKEN_KEY = 'carServiceToken';
  private readonly LAST_ACTIVITY_KEY = 'carServiceLastActivity';

  private timeoutId: ReturnType<typeof setTimeout> | null = null;

  isLoggedIn(): boolean {
    return !!this.getToken();
  }

  getToken(): string | null {
    return localStorage.getItem(this.TOKEN_KEY);
  }

  login(token = 'demo-token'): void {
    localStorage.setItem(this.TOKEN_KEY, token);
    localStorage.setItem(this.LAST_ACTIVITY_KEY, Date.now().toString());
    this.resetTimer();
  }

  logout(): void {
    if (this.timeoutId) {
      clearTimeout(this.timeoutId);
      this.timeoutId = null;
    }
    localStorage.removeItem(this.TOKEN_KEY);
    localStorage.removeItem(this.LAST_ACTIVITY_KEY);
    this.router.navigate(['/login']);
  }

  resetTimer(): void {
    if (!this.isLoggedIn()) return;

    if (this.timeoutId) {
      clearTimeout(this.timeoutId);
    }

    localStorage.setItem(this.LAST_ACTIVITY_KEY, Date.now().toString());
    this.timeoutId = setTimeout(() => this.logout(), 3 * 60 * 1000);
  }
}
