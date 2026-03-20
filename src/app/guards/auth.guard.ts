import { Injectable } from '@angular/core';
import { Router, CanActivate, ActivatedRouteSnapshot, RouterStateSnapshot } from '@angular/router';
import { AuthService } from '../services/auth.service';

@Injectable({
  providedIn: 'root'
})
export class AuthGuard implements CanActivate {
  constructor(
    private authService: AuthService,
    private router: Router
  ) {}

  canActivate(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): boolean {
    if (this.authService.isLoggedIn()) {
      console.log('✅ AuthGuard: User is authenticated, accessing:', state.url);
      return true;
    }

    // Not logged in - redirect to login page
    console.log('❌ AuthGuard: User not authenticated, redirecting to login from:', state.url);
    this.router.navigate(['/login'], { queryParams: { returnUrl: state.url } });
    return false;
  }
}