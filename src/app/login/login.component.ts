import { Component } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router, ActivatedRoute } from '@angular/router';
import { AuthService } from '../services/auth.service';
import { trigger, transition, style, animate } from '@angular/animations';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css'],
  animations: [
    trigger('fadeInOut', [
      transition(':enter', [
        style({ opacity: 0, transform: 'translateY(-10px)' }),
        animate('300ms ease-out', style({ opacity: 1, transform: 'translateY(0)' }))
      ]),
      transition(':leave', [
        animate('200ms ease-in', style({ opacity: 0, transform: 'translateY(-10px)' }))
      ])
    ])
  ]
})
export class LoginComponent {
  loginForm: FormGroup;
  otpSent = false;
  loading = false;
  errorMessage = '';
  showPassword = false;
  
  // Track touched fields manually to prevent immediate validation
  private touchedFields: Set<string> = new Set();

  constructor(
    private formBuilder: FormBuilder,
    private authService: AuthService,
    private router: Router,
    private route: ActivatedRoute
  ) {
    // If already logged in, redirect to home
    if (this.authService.isLoggedIn()) {
      this.router.navigate(['/home']);
    }

    this.loginForm = this.formBuilder.group({
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(6)]],
      otp: ['', [Validators.required, Validators.pattern('^[0-9]{4}$')]]
    });
  }

  onSubmit(): void {
    // Mark all fields as touched on submit
    this.markAllTouched();
    
    if (this.loginForm.invalid) {
      return;
    }

    this.loading = true;
    this.errorMessage = '';

    const { email, password, otp } = this.loginForm.value;

    this.authService.login(email, password, otp).subscribe({
      next: (response) => {
        this.loading = false;
        const returnUrl = this.route.snapshot.queryParams['returnUrl'] || '/home';
        this.router.navigateByUrl(returnUrl);
      },
      error: (error) => {
        this.loading = false;
        this.errorMessage = error.error?.error || 'Login failed. Please try again.';
      }
    });
  }

  sendOtp(): void {
    const email = this.loginForm.get('email')?.value;
    if (!email) {
      this.errorMessage = 'Please enter email first';
      return;
    }

    this.otpSent = true;
    this.errorMessage = '';
    this.loginForm.patchValue({ otp: '1234' });
    
    // Auto-mark as touched
    this.touchedFields.add('otp');
  }

  // Mark field as touched when user leaves it
  markTouched(field: string): void {
    this.touchedFields.add(field);
  }

  // Mark all fields as touched (for submit)
  markAllTouched(): void {
    this.touchedFields.add('email');
    this.touchedFields.add('password');
    this.touchedFields.add('otp');
  }

  // Check if field should show error (only if touched)
  showError(field: string): boolean {
    const control = this.loginForm.get(field);
    return control ? control.invalid && this.touchedFields.has(field) : false;
  }

  // Reset touched state (useful for form reset)
  resetTouched(): void {
    this.touchedFields.clear();
  }
}