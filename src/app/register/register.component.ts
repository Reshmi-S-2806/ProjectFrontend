import { Component } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '../services/auth.service';

@Component({
  selector: 'app-register',
  templateUrl: './register.component.html',
  styleUrls: ['./register.component.css']
})
export class RegisterComponent {
  registerForm: FormGroup;
  loading = false;
  errorMessage = '';
  showPassword = false;
  showConfirmPassword = false;

  // Track touched fields manually
  private touchedFields: Set<string> = new Set();

  constructor(
    private formBuilder: FormBuilder,
    private authService: AuthService,
    private router: Router
  ) {
    this.registerForm = this.formBuilder.group({
      name: ['', Validators.required],
      age: ['', [Validators.required, Validators.min(18), Validators.max(120)]],
      email: ['', [Validators.required, Validators.email]],
      phone: ['', [Validators.required, Validators.pattern('^[0-9]{10}$')]],
      password: ['', [Validators.required, Validators.minLength(6)]],
      confirmPassword: ['', Validators.required],
      terms: [false, Validators.requiredTrue]
    }, { validator: this.passwordMatchValidator });
  }

  // Custom validator to check if passwords match
  passwordMatchValidator(g: FormGroup) {
    const password = g.get('password')?.value;
    const confirmPassword = g.get('confirmPassword')?.value;
    
    if (password && confirmPassword && password !== confirmPassword) {
      g.get('confirmPassword')?.setErrors({ mismatch: true });
      return { mismatch: true };
    }
    return null;
  }

  // Get password strength
  getPasswordStrength(): { text: string; color: string; width: string } {
    const password = this.registerForm.get('password')?.value || '';
    
    if (!password) {
      return { text: '', color: '', width: '0%' };
    }
    
    let strength = 0;
    
    // Length check
    if (password.length >= 6) strength += 20;
    if (password.length >= 8) strength += 15;
    
    // Character type checks
    if (/[a-z]/.test(password)) strength += 20;
    if (/[A-Z]/.test(password)) strength += 20;
    if (/[0-9]/.test(password)) strength += 15;
    if (/[!@#$%^&*]/.test(password)) strength += 10;
    
    // Cap at 100
    strength = Math.min(strength, 100);
    
    if (strength < 40) {
      return { text: 'Weak', color: '#dc3545', width: strength + '%' };
    } else if (strength < 70) {
      return { text: 'Medium', color: '#ffc107', width: strength + '%' };
    } else {
      return { text: 'Strong', color: '#28a745', width: strength + '%' };
    }
  }

  onSubmit(): void {
    this.markAllTouched();
    
    if (this.registerForm.invalid || !this.registerForm.get('terms')?.value) {
      return;
    }

    this.loading = true;
    this.errorMessage = '';

    // Remove confirmPassword and terms before sending
    const {  terms, ...userData } = this.registerForm.value;

    this.authService.register(userData).subscribe({
      next: () => {
        this.loading = false;
        this.router.navigate(['/home']);
      },
      error: (error) => {
        this.loading = false;
        this.errorMessage = error.error?.error || 'Registration failed';
      }
    });
  }

  // Mark field as touched
  markTouched(field: string): void {
    this.touchedFields.add(field);
  }

  // Mark all fields as touched
  markAllTouched(): void {
    ['name', 'age', 'email', 'phone', 'password', 'confirmPassword', 'terms'].forEach(
      field => this.touchedFields.add(field)
    );
  }

  // Check if field should show error
  showError(field: string): boolean {
    const control = this.registerForm.get(field);
    return control ? control.invalid && this.touchedFields.has(field) : false;
  }

  // Check if field is invalid
  isFieldInvalid(field: string): boolean {
    return this.showError(field);
  }

  // Check if confirm password has error
  showConfirmPasswordError(): boolean {
    const control = this.registerForm.get('confirmPassword');
    const hasMismatch = this.registerForm.hasError('mismatch');
    return (control?.invalid || hasMismatch) && this.touchedFields.has('confirmPassword');
  }
}