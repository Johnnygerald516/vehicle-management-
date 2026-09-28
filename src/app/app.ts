import { Component, OnInit, inject, signal } from '@angular/core';
import { DOCUMENT } from '@angular/common';
import { Router, RouterOutlet, RouterLink, RouterLinkActive, NavigationEnd } from '@angular/router';
import { filter, throttleTime } from 'rxjs/operators';
import { fromEvent, merge } from 'rxjs';
import { AuthService } from './services/auth';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, RouterLink, RouterLinkActive],
  templateUrl: './app.html',
  styleUrl: './app.css',
})
export class App implements OnInit {
  private router = inject(Router);
  private auth = inject(AuthService);
  private doc = inject(DOCUMENT);

  title = 'Vehicle Management System';
  showSidebar = signal(true);
  currentSection = signal('');
  selectedSection = signal('');
  currentTime = signal(this.formatTime());

  ngOnInit(): void {
    this.updateSidebar(this.router.url);
    this.router.events
      .pipe(filter(event => event instanceof NavigationEnd))
      .subscribe(event => this.updateSidebar((event as NavigationEnd).urlAfterRedirects));

    setInterval(() => this.currentTime.set(this.formatTime()), 1000);

    this.auth.resetTimer();
    merge(
      fromEvent(this.doc, 'click'),
      fromEvent(this.doc, 'mousemove'),
      fromEvent(this.doc, 'keydown'),
      fromEvent(this.doc, 'wheel'),
      fromEvent(this.doc, 'touchstart')
    )
      .pipe(throttleTime(1000))
      .subscribe(() => this.auth.resetTimer());
  }

  private formatTime(): string {
    return new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  }

  private updateSidebar(url: string): void {
    this.showSidebar.set(!url.startsWith('/login'));
    if (url.startsWith('/maintenance')) {
      this.currentSection.set('maintenance');
    } else if (url.startsWith('/vehicles')) {
      this.currentSection.set('vehicles');
    } else if (url.startsWith('/drivers')) {
      this.currentSection.set('drivers');
    } else if (url.startsWith('/assignments')) {
      this.currentSection.set('assignments');
    } else if (url.startsWith('/dashboard')) {
      this.currentSection.set('dashboard');
    } else if (url.startsWith('/reports')) {
      this.currentSection.set('reports');
    } else if (url.startsWith('/fuel')) {
      this.currentSection.set('fuel');
    } else if (url.startsWith('/incidents')) {
      this.currentSection.set('incidents');
    } else if (url.startsWith('/expenses')) {
      this.currentSection.set('expenses');
    } else if (url.startsWith('/documents')) {
      this.currentSection.set('documents');
    } else if (url.startsWith('/tracking')) {
      this.currentSection.set('tracking');
    } else {
      this.currentSection.set('');
    }
    this.selectedSection.set(this.currentSection());
  }

  toggleSection(section: string): void {
    this.selectedSection.set(this.selectedSection() === section ? '' : section);
  }

  logout(): void {
    this.auth.logout();
  }
}
