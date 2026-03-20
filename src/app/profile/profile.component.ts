import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators, AbstractControl } from '@angular/forms';
import { AuthService } from '../services/auth.service';
import { ToastService } from '../services/toast.service';
import { User } from '../models/models';

@Component({
  selector: 'app-profile',
  templateUrl: './profile.component.html',
  styleUrls: ['./profile.component.css']
})
export class ProfileComponent implements OnInit {
  profileForm: FormGroup;
  passwordForm: FormGroup;
  user: User | null = null;
  loading = false;
  errorMessage = '';
  successMessage = '';
  passwordError = '';
  passwordSuccess = '';
  editMode = false;

  constructor(
    private formBuilder: FormBuilder,
    private authService: AuthService,
    private toastService: ToastService
  ) {
    this.profileForm = this.formBuilder.group({
      name: ['', Validators.required],
      age: ['', [Validators.required, Validators.min(18), Validators.max(120)]],
      email: [{ value: '', disabled: true }],
      phone: ['', [Validators.required, Validators.pattern('^[0-9]{10}$')]],
      address: [''],
      city: [''],
      state: [''],
      pincode: ['', Validators.pattern('^[0-9]{6}$')]
    });

    this.passwordForm = this.formBuilder.group({
      currentPassword: ['', Validators.required],
      newPassword: ['', [
        Validators.required,
        Validators.minLength(8),
        Validators.pattern('^(?=.*[a-z])(?=.*[A-Z])(?=.*[0-9])(?=.*[!@#$%^&*_=+]).{8,}$')
      ]],
      confirmPassword: ['', Validators.required]
    }, { validator: this.passwordMatchValidator });
  }

  ngOnInit() {
    this.loadProfile();
  }

  // Custom validator to check if passwords match
  passwordMatchValidator(g: FormGroup) {
    const newPassword = g.get('newPassword')?.value;
    const confirmPassword = g.get('confirmPassword')?.value;
    
    if (newPassword && confirmPassword && newPassword !== confirmPassword) {
      g.get('confirmPassword')?.setErrors({ mismatch: true });
      return { mismatch: true };
    }
    return null;
  }

  // Get password requirements for display
  getPasswordRequirements(): string[] {
    return [
      'Minimum 8 characters long',
      'At least one uppercase letter (A-Z)',
      'At least one lowercase letter (a-z)',
      'At least one number (0-9)',
      'At least one special character (!@#$%^&*_=+)'
    ];
  }

  // Check password strength
  getPasswordStrength(): { strength: string, color: string, width: string } {
    const password = this.passwordForm.get('newPassword')?.value || '';
    
    if (!password) {
      return { strength: '', color: '', width: '0%' };
    }
    
    let score = 0;
    
    // Length check
    if (password.length >= 8) score++;
    if (password.length >= 10) score++;
    
    // Character type checks
    if (/[a-z]/.test(password)) score++;
    if (/[A-Z]/.test(password)) score++;
    if (/[0-9]/.test(password)) score++;
    if (/[!@#$%^&*_=+]/.test(password)) score++;
    
    // Calculate strength
    if (score <= 2) {
      return { strength: 'Weak', color: '#dc3545', width: '25%' };
    } else if (score <= 4) {
      return { strength: 'Medium', color: '#ffc107', width: '50%' };
    } else if (score <= 6) {
      return { strength: 'Strong', color: '#28a745', width: '75%' };
    } else {
      return { strength: 'Very Strong', color: '#20c997', width: '100%' };
    }
  }

  loadProfile() {
    this.loading = true;
    this.authService.getProfile().subscribe({
      next: (user) => {
        this.user = user;
        this.profileForm.patchValue({
          name: user.name,
          age: user.age,
          email: user.email,
          phone: user.phone,
          address: user.address,
          city: user.city,
          state: user.state,
          pincode: user.pincode
        });
        this.loading = false;
      },
      error: (err: any) => {
        this.errorMessage = 'Failed to load profile';
        this.loading = false;
        this.toastService.showError('Failed to load profile');
      }
    });
  }

  toggleEditMode() {
    this.editMode = !this.editMode;
    if (!this.editMode) {
      this.loadProfile(); // Reset form
    }
  }

  onUpdateProfile() {
    if (this.profileForm.invalid) {
      return;
    }

    this.loading = true;
    this.errorMessage = '';
    this.successMessage = '';

    this.authService.updateProfile(this.profileForm.value).subscribe({
      next: (response: any) => {
        this.successMessage = 'Profile updated successfully';
        this.editMode = false;
        this.loading = false;
        this.toastService.showSuccess('Profile updated successfully!');
        this.loadProfile(); // Reload profile data
      },
      error: (err: any) => {
        this.errorMessage = err.error?.error || 'Failed to update profile';
        this.loading = false;
        this.toastService.showError('Failed to update profile');
      }
    });
  }

  onChangePassword() {
    if (this.passwordForm.invalid) {
      // Mark all fields as touched to trigger validation messages
      Object.keys(this.passwordForm.controls).forEach(key => {
        this.passwordForm.get(key)?.markAsTouched();
      });
      return;
    }

    this.loading = true;
    this.passwordError = '';
    this.passwordSuccess = '';

    const { currentPassword, newPassword } = this.passwordForm.value;

    this.authService.changePassword(currentPassword, newPassword).subscribe({
      next: (response: any) => {
        this.passwordSuccess = 'Password changed successfully';
        this.passwordForm.reset();
        this.loading = false;
        this.toastService.showSuccess('Password changed successfully!');
        
        // Clear validation states
        Object.keys(this.passwordForm.controls).forEach(key => {
          this.passwordForm.get(key)?.setErrors(null);
          this.passwordForm.get(key)?.markAsUntouched();
        });
      },
      error: (err: any) => {
        this.passwordError = err.error?.error || 'Failed to change password';
        this.loading = false;
        this.toastService.showError('Failed to change password');
      }
    });
  }

  // Helper method to check if a field is invalid and touched
  isFieldInvalid(form: FormGroup, fieldName: string): boolean {
    const field = form.get(fieldName);
    return field ? field.invalid && (field.dirty || field.touched) : false;
  }

  // Get user initials for avatar
  getUserInitials(): string {
    if (!this.user?.name) return '';
    const parts = this.user.name.split(' ');
    if (parts.length >= 2) {
      return (parts[0][0] + parts[1][0]).toUpperCase();
    }
    return this.user.name.substring(0, 2).toUpperCase();
  }
}