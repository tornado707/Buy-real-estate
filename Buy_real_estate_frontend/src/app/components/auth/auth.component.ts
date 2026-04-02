import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-auth',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './auth.component.html',
  styleUrl: './auth.component.scss'
})
export class AuthComponent {
  // Login form
  loginData = {
    email: '',
    password: ''
  };

  // Register form
  registerData = {
    username: '',
    email: '',
    password: ''
  };

  // Messages
  loginError = '';
  loginSuccess = '';
  registerError = '';
  registerSuccess = '';

  // Loading states
  loginLoading = false;
  registerLoading = false;

  constructor(
    private authService: AuthService,
    private router: Router
  ) {}

  onLogin() {
    this.loginError = '';
    this.loginSuccess = '';
    this.loginLoading = true;

    this.authService.signin(this.loginData).subscribe({
      next: (response) => {
        this.loginLoading = false;
        if (response.success) {
          this.loginSuccess = response.message;
          // Navigate to dashboard after short delay
          setTimeout(() => {
            this.router.navigate(['/dashboard']);
          }, 1000);
        }
      },
      error: (error) => {
        this.loginLoading = false;
        this.loginError = error.error?.message || 'Login failed';
      }
    });
  }

  onRegister() {
    this.registerError = '';
    this.registerSuccess = '';
    this.registerLoading = true;

    this.authService.register(this.registerData).subscribe({
      next: (response) => {
        this.registerLoading = false;
        if (response.success) {
          this.registerSuccess = response.message;
          // Clear form
          this.registerData = { username: '', email: '', password: '' };
        }
      },
      error: (error) => {
        this.registerLoading = false;
        this.registerError = error.error?.message || 'Registration failed';
      }
    });
  }
}