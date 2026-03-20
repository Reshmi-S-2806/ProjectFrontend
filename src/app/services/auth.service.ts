import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { ToastService } from './toast.service';
import { User, RegisterRequest } from '../models/models';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private apiUrl = 'http://localhost:3000/api';
  private currentUserSubject: BehaviorSubject<User | null>;
  public currentUser: Observable<User | null>;
  private cartCountSubject = new BehaviorSubject<number>(0);

  constructor(
    private http: HttpClient,
    private toastService: ToastService
  ) {
    const storedUser = localStorage.getItem('currentUser');
    this.currentUserSubject = new BehaviorSubject<User | null>(
      storedUser ? JSON.parse(storedUser) : null
    );
    this.currentUser = this.currentUserSubject.asObservable();
  }

  public get currentUserValue(): User | null {
    return this.currentUserSubject.value;
  }

  public get cartCount(): Observable<number> {
    return this.cartCountSubject.asObservable();
  }

  updateCartCount(count: number) {
    this.cartCountSubject.next(count);
  }

  login(email: string, password: string, otp: string): Observable<any> {
    return this.http.post<any>(`${this.apiUrl}/login`, { email, password, otp })
      .pipe(map(response => {
        if (response.token) {
          localStorage.setItem('token', response.token);
          localStorage.setItem('currentUser', JSON.stringify(response.user));
          this.currentUserSubject.next(response.user);
          this.toastService.showSuccess('Login successful!');
        }
        return response;
      }));
  }

  register(userData: RegisterRequest): Observable<any> {
    return this.http.post<any>(`${this.apiUrl}/register`, userData)
      .pipe(map(response => {
        if (response.token) {
          localStorage.setItem('token', response.token);
          localStorage.setItem('currentUser', JSON.stringify(response.user));
          this.currentUserSubject.next(response.user);
          this.toastService.showSuccess('Registration successful!');
        }
        return response;
      }));
  }

  forgotPassword(email: string): Observable<any> {
    return this.http.post<any>(`${this.apiUrl}/forgot-password`, { email })
      .pipe(map(response => {
        this.toastService.showSuccess('OTP sent to your email');
        return response;
      }));
  }

  resetPassword(email: string, otp: string, newPassword: string): Observable<any> {
    return this.http.post<any>(`${this.apiUrl}/reset-password`, { email, otp, newPassword })
      .pipe(map(response => {
        this.toastService.showSuccess('Password reset successful');
        return response;
      }));
  }

  getProfile(): Observable<User> {
    return this.http.get<User>(`${this.apiUrl}/profile`);
  }

  updateProfile(profile: Partial<User>): Observable<any> {
    return this.http.put(`${this.apiUrl}/profile`, profile)
      .pipe(map(response => {
        this.toastService.showSuccess('Profile updated successfully');
        return response;
      }));
  }

  changePassword(currentPassword: string, newPassword: string): Observable<any> {
    return this.http.post(`${this.apiUrl}/change-password`, { currentPassword, newPassword })
      .pipe(map(response => {
        this.toastService.showSuccess('Password changed successfully');
        return response;
      }));
  }

  // logout() {
  //   localStorage.removeItem('token');
  //   localStorage.removeItem('currentUser');
  //   this.currentUserSubject.next(null);
  //   this.cartCountSubject.next(0);
  //   this.toastService.showInfo('Logged out successfully');
  // }

  // In auth.service.ts
logout(): void {
  console.log('AuthService: Logging out user');
  
  // Clear local storage/session storage
  localStorage.removeItem('token');
  localStorage.removeItem('user');
  sessionStorage.clear();
  
  // Update BehaviorSubject
  this.currentUserSubject.next(null);
  
  // Optionally call logout API if your backend requires it
  // this.http.post('/api/auth/logout', {}).subscribe();
}

  isLoggedIn(): boolean {
    return !!this.currentUserValue && !!localStorage.getItem('token');
  }

  getToken(): string | null {
    return localStorage.getItem('token');
  }
}