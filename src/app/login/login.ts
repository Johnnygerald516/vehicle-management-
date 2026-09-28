import { Component, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '../services/auth';

@Component({
  selector: 'app-login',
  imports: [FormsModule],
  templateUrl: './login.html',
  styleUrl: './login.css',
})
export class Login {
  email = '';
  password = '';
  remember = false;
  showPassword = false;

  private auth = inject(AuthService);
  private router = inject(Router);

  signIn(): void {
    if (this.email && this.password) {
      this.auth.login();
      this.router.navigate(['/dashboard']);
    }
  }
}
