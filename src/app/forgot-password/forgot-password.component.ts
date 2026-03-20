import { Component } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '../services/auth.service';

@Component({
  selector: 'app-forgot-password',
  templateUrl: './forgot-password.component.html',
  styleUrls: ['./forgot-password.component.css']
})
export class ForgotPasswordComponent {
  emailForm: FormGroup;
  otpForm: FormGroup;
  step: 'email' | 'otp' = 'email';
  loading = false;
  errorMessage = '';
  successMessage = '';
  email: string = '';

  constructor(
    private formBuilder: FormBuilder,
    private authService: AuthService,
    private router: Router
  ) {
    this.emailForm = this.formBuilder.group({
      email: ['', [Validators.required, Validators.email]]
    });

    this.otpForm = this.formBuilder.group({
      otp: ['', [Validators.required, Validators.pattern('^[0-9]{4}$')]],
      newPassword: ['', [Validators.required, Validators.minLength(6)]],
      confirmPassword: ['', Validators.required]
    }, { validator: this.passwordMatchValidator });
  }

  passwordMatchValidator(g: FormGroup) {
    return g.get('newPassword')?.value === g.get('confirmPassword')?.value
      ? null : { mismatch: true };
  }

  onSendOtp() {
    if (this.emailForm.invalid) {
      return;
    }

    this.loading = true;
    this.errorMessage = '';
    this.email = this.emailForm.value.email;

    this.authService.forgotPassword(this.email).subscribe({
      next: (response) => {
        this.loading = false;
        this.successMessage = 'OTP sent to your email (Sample OTP: 1234)';
        this.step = 'otp';
      },
      error: (error) => {
        this.loading = false;
        this.errorMessage = error.error?.error || 'Failed to send OTP';
      }
    });
  }

  onResetPassword() {
    if (this.otpForm.invalid) {
      return;
    }

    this.loading = true;
    this.errorMessage = '';

    const { otp, newPassword } = this.otpForm.value;

    this.authService.resetPassword(this.email, otp, newPassword).subscribe({
      next: (response) => {
        this.loading = false;
        this.successMessage = 'Password reset successful! Redirecting to login...';
        setTimeout(() => {
          this.router.navigate(['/login']);
        }, 2000);
      },
      error: (error) => {
        this.loading = false;
        this.errorMessage = error.error?.error || 'Failed to reset password';
      }
    });
  }

  backToEmail() {
    this.step = 'email';
    this.errorMessage = '';
    this.successMessage = '';
  }
}   