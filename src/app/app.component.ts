import { Component, OnInit, HostListener } from '@angular/core';
import { Router, NavigationEnd } from '@angular/router';
import { AuthService } from './services/auth.service';
import { CartService } from './services/cart.service';
import { filter } from 'rxjs/operators';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent implements OnInit {
  title = 'ShopEasy';
  isLoggedIn = false;
  userName = '';
  userEmail = '';
  isAdmin = false;
  cartCount = 0;
  showDropdown = false;
  searchQuery = '';

  constructor(
    private authService: AuthService,
    private cartService: CartService,
    private router: Router
  ) {}

  ngOnInit() {
    console.log('🚀 AppComponent initialized');
    
    // Check authentication status on app load
    this.checkAuthStatus();

    // Subscribe to auth changes
    this.authService.currentUser.subscribe(user => {
      console.log('👤 Auth state changed:', user ? 'logged in' : 'logged out');
      this.isLoggedIn = !!user;
      this.userName = user?.name || '';
      this.userEmail = user?.email || '';
      this.isAdmin = user?.isAdmin || false;
      
      // Refresh cart when user logs in
      if (this.isLoggedIn) {
        console.log('🔄 User logged in, refreshing cart');
        this.cartService.refreshCart();
        
        // If user is on login page after login, redirect to home
        if (this.router.url === '/login' || this.router.url === '/register' || this.router.url === '/') {
          this.router.navigate(['/home']);
        }
      } else {
        console.log('👤 User logged out, clearing cart count');
        this.cartCount = 0;
      }
    });

    // Subscribe to cart count changes
    this.cartService.cartCount$.subscribe(count => {
      console.log('🛒 Cart count updated:', count);
      this.cartCount = count;
    });

    // Check authentication on every route change
    this.router.events.pipe(
      filter(event => event instanceof NavigationEnd)
    ).subscribe((event: any) => {
      console.log('🔄 Route changed to:', event.url);
      this.checkAuthStatus();
      
      // Close dropdown on route change
      this.showDropdown = false;
      
      // Update search query from URL
      const urlParams = new URLSearchParams(window.location.search);
      this.searchQuery = urlParams.get('search') || '';
    });
  }

  /**
   * Check if user is authenticated
   */
  checkAuthStatus(): void {
    const isLoggedIn = this.authService.isLoggedIn();
    const currentUrl = this.router.url;
    
    console.log('🔒 Auth check:', { isLoggedIn, currentUrl });
    
    // Public routes that don't require authentication
    const publicRoutes = ['/login', '/register', '/forgot-password'];
    
    // If not logged in and trying to access protected route, redirect to login
    if (!isLoggedIn && !publicRoutes.includes(currentUrl) && currentUrl !== '/') {
      console.log('🔒 Not authenticated, redirecting to login from:', currentUrl);
      this.router.navigate(['/login']);
    }
    
    // If logged in and trying to access login/register, redirect to home
    if (isLoggedIn && (currentUrl === '/login' || currentUrl === '/register' || currentUrl === '/forgot-password')) {
      console.log('👤 Already authenticated, redirecting to home from:', currentUrl);
      this.router.navigate(['/home']);
    }
  }
/**
 * Toggle dropdown menu
 */
toggleDropdown(): void {
  this.showDropdown = !this.showDropdown;
  console.log('📱 Dropdown toggled:', this.showDropdown);
  
  // Add/remove a class to body to help with click outside detection
  if (this.showDropdown) {
    document.addEventListener('click', this.closeDropdown.bind(this));
  } else {
    document.removeEventListener('click', this.closeDropdown.bind(this));
  }
}

/**
 * Close dropdown menu
 */
closeDropdown(event?: MouseEvent): void {
  // Don't close if clicking inside the dropdown
  if (event) {
    const target = event.target as HTMLElement;
    const dropdown = document.querySelector('.profile-dropdown');
    if (dropdown && dropdown.contains(target)) {
      return;
    }
  }
  this.showDropdown = false;
  document.removeEventListener('click', this.closeDropdown.bind(this));
}


  /**
   * Handle click outside to close dropdown
   */
  @HostListener('document:click', ['$event'])
  onDocumentClick(event: MouseEvent): void {
    const target = event.target as HTMLElement;
    const dropdown = document.querySelector('.profile-dropdown');
    
    if (dropdown && !dropdown.contains(target)) {
      this.showDropdown = false;
    }
  }

    /**
   * Logout user and redirect to login page
   */
  logout(): void {
    console.log('👋 Logging out user');
    
    // Clear user session/data
    this.authService.logout();
    
    // Close dropdown
    this.showDropdown = false;
    
    // Clear any user-specific data
    this.cartCount = 0;
    this.userName = '';
    this.userEmail = '';
    this.isAdmin = false;
    
    // Redirect to login page
    this.router.navigate(['/login']);
    
    console.log('✅ Logout successful, redirected to login page');
  }

  // ... rest of the code


  /**
   * Handle search input changes
   */
  onSearchInput(query: string): void {
    this.searchQuery = query;
    if (!query || query.trim() === '') {
      this.clearSearch();
    }
  }

  /**
   * Perform search
   */
  onSearch(query: string): void {
    if (query && query.trim()) {
      this.searchQuery = query.trim();
      this.router.navigate(['/home'], { 
        queryParams: { search: this.searchQuery },
        queryParamsHandling: 'merge'
      });
    } else {
      this.clearSearch();
    }
  }

  /**
   * Clear search
   */
  clearSearch(): void {
    this.searchQuery = '';
    this.router.navigate(['/home'], {
      queryParams: { search: null },
      queryParamsHandling: 'merge'
    });
  }

  /**
   * Get user initials for avatar
   */
  getUserInitials(): string {
    if (!this.userName) return '';
    const parts = this.userName.split(' ');
    if (parts.length >= 2) {
      return (parts[0][0] + parts[1][0]).toUpperCase();
    }
    return this.userName.substring(0, 2).toUpperCase();
  }

  /**
   * Navigate to profile
   */
  goToProfile(): void {
    this.closeDropdown();
    this.router.navigate(['/profile']);
  }

  /**
   * Navigate to orders
   */
  goToOrders(): void {
    this.closeDropdown();
    this.router.navigate(['/orders']);
  }

  /**
   * Navigate to cart
   */
  goToCart(): void {
    this.closeDropdown();
    this.router.navigate(['/cart']);
  }

  /**
   * Navigate to admin dashboard
   */
  goToAdmin(): void {
    this.closeDropdown();
    this.router.navigate(['/admin']);
  }

  /**
   * Navigate to transactions (admin only)
   */
  goToTransactions(): void {
    this.closeDropdown();
    this.router.navigate(['/transactions']);
  }
}